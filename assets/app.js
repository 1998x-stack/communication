(function appMain(){
"use strict";
const $=(s,root=document)=>root.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const today=()=>new Date().toLocaleDateString("sv-SE");
const fmtDate=()=>new Intl.DateTimeFormat("zh-CN",{month:"long",day:"numeric",weekday:"long"}).format(new Date());
const key="yanxi-training-v1";
let state={category:"all",difficulty:"all",order:"sequential",visibility:"hidden",search:"",activeId:null,revealed:{},answers:{},ratings:{},completed:{},favorites:[],visited:[],rounds:{},practiceDays:{},recordings:[]};
try{const raw=localStorage.getItem(key);if(raw){const stored=JSON.parse(raw);state={...state,...stored,revealed:{},rounds:stored.rounds||{},practiceDays:stored.practiceDays||{},visited:Array.isArray(stored.visited)?stored.visited:[]};if(!Object.keys(state.practiceDays).length){for(const v of Object.values(state.completed||{})){if(v?.date)state.practiceDays[v.date]=(state.practiceDays[v.date]||0)+1;}}}}catch{}
let catalog=null,cases=[],currentRecording=null,recordChunks=[],mediaStream=null,currentAudio=null,notice="";
const icons={all:"✦",upward:"▣",collaboration:"♙",leadership:"♜",partner:"♡",parents:"⌂",children:"❀",friends:"☕",clients:"◇",conflicts:"⚖"};
const save=()=>{try{const {recordings,...persist}=state;localStorage.setItem(key,JSON.stringify(persist));}catch{}};
const filtered=()=>cases.filter(c=>(state.category==="all"||c.category===state.category)&&(state.difficulty==="all"||c.difficulty===state.difficulty)&&(!state.search||(`${c.title} ${c.background} ${c.facts.join(" ")}`).toLowerCase().includes(state.search.toLowerCase())));
const sorted=()=>filtered().sort((a,b)=>cases.indexOf(a)-cases.indexOf(b));
const chosen=()=>filtered().find(c=>c.id===state.activeId)||sorted()[0]||null;
function streak(){const dates=new Set(Object.keys(state.practiceDays).filter(k=>state.practiceDays[k]>0));let cursor=new Date(),count=0;const format=d=>new Intl.DateTimeFormat("sv-SE").format(d);if(!dates.has(format(cursor)))cursor.setDate(cursor.getDate()-1);for(;count<366&&dates.has(format(cursor));count++)cursor.setDate(cursor.getDate()-1);return count;}
function renderStats(){
 const done=Object.keys(state.completed).length,now=today();
 $("#completedCount").innerHTML=done+' <small>题</small>';
 $("#todayCount").innerHTML=(state.practiceDays[now]||0)+' <small>题</small>';
 $("#streakCount").innerHTML=streak()+' <small>天</small>';
 $("#totalCount").textContent=cases.length+" 个训练案例";
 $("#todayLabel").textContent=fmtDate();
}
function renderCategories(){
 const catNav=$("#categoryNav");
 catNav.innerHTML='<div class="nav-list"><button class="nav-item '+(state.category==="all"?"active":"")+'" data-category="all"><span class="nav-icon">✦</span>全部练习<small>'+cases.length+'</small></button>'+catalog.categories.map(c=>'<button class="nav-item '+(state.category===c.id?"active":"")+'" data-category="'+esc(c.id)+'"><span class="nav-icon">'+(icons[c.id]||"◦")+'</span>'+esc(c.name)+'<small>'+c.count+'</small></button>').join("")+'</div>';
 $("#navCount").textContent=String(catalog.categories.length).padStart(2,"0");
 $("#categorySelect").innerHTML='<option value="all">全部场景</option>'+catalog.categories.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join("");
 $("#categorySelect").value=state.category;
}
function renderControls(){
 $("#categorySelect").value=state.category;
 $("#difficultySelect").value=state.difficulty;
 $("#orderSelect").value=state.order;
 $("#visibilitySelect").value=state.visibility;
 $("#searchInput").value=state.search;
}

function dateHash(s){let h=2166136261;for(const ch of s){h=Math.imul(h^ch.charCodeAt(0),16777619)}return h>>>0;}
function dailyPlan(){
 if(!catalog)return [];
 const day=today(),categories=catalog.categories,levels=["low","medium","high"];
 return levels.map((difficulty,i)=>{
  const cat=categories[(dateHash(day)%categories.length+i*3)%categories.length];
  const pool=cases.filter(c=>c.category===cat.id&&c.difficulty===difficulty);
  return pool.length?pool[dateHash(day+"|"+cat.id+"|"+difficulty)%pool.length]:null;
 }).filter(Boolean);
}
function renderDailyPlan(){
 const root=$("#dailyPlanPanel");if(!root)return;
 const plan=dailyPlan(),done=plan.filter(c=>state.completed[c.id]?.date===today()).length;
 root.innerHTML='<div class="rail-kicker">MORNING ROUTINE</div><h3>今日 3 题晨练 <span class="daily-count">'+done+'/3</span></h3><p>从清晰表达，到回应质疑，再到高压收束。每天固定一组题目，答完再复盘。</p><div class="daily-scenarios">'+plan.map((c,i)=>'<button type="button" class="daily-scenario '+(state.activeId===c.id?"current":"")+'" data-daily="'+esc(c.id)+'"><span class="daily-index">'+(state.completed[c.id]?.date===today()?"✓":String(i+1).padStart(2,"0"))+'</span><span class="daily-copy"><strong>'+esc(c.title)+'</strong><small>'+esc(catalog.categories.find(x=>x.id===c.category)?.name||"")+' · '+["基础","进阶","高压"][i]+'</small></span><span aria-hidden="true">↗</span></button>').join("")+'</div><p class="small-muted">每日计划按本地日期生成，进度仅保存在本机。</p>';
}
function selectDaily(id){
 if(!cases.some(c=>c.id===id))return;
 state.category="all";state.difficulty="all";state.search="";state.activeId=id;state.revealed={};notice="";
 save();renderCategories();renderControls();renderCase();
 $("#casePanel").scrollIntoView({behavior:"smooth",block:"start"});
}

function modelTurn(c,turn){
 const round=turn.turn/2, id=c.id+"-"+round,open=state.visibility==="expanded"||state.revealed[id],answer=state.answers[id]||"";
 return '<div class="turn learner"><div class="avatar">我</div><div class="bubble '+(!open?"covered":"")+'"><span class="bubble-label">'+esc(turn.stage)+' · 第'+round+'轮应对</span>'+
 (open?'<p>'+esc(turn.text)+'</p>':'<span class="hidden-message">先用自己的语言说出来，再看这轮参考表达。</span>')+
 (!open?'<button class="reveal-btn" data-reveal="'+esc(id)+'">👁 查看参考表达</button>':'')+
 '<textarea class="your-answer" data-answer="'+esc(id)+'" aria-label="第'+round+'轮我的表达" placeholder="先口头回答，再记下自己的一句话…">'+esc(answer)+'</textarea>'+
 '<span class="response-hint">💬 不要求与示范相同；重点是结构、态度和行动。</span></div></div>';
}
function opponentTurn(turn){
 return '<div class="turn counterpart"><div class="avatar">对</div><div class="bubble"><span class="bubble-label">'+esc(turn.stage)+' · 对方</span><p>'+esc(turn.text)+'</p><button class="speak-button" data-speak="'+turn.turn+'">♪ 朗读这一句</button></div></div>';
}
function renderCase(){
 const c=chosen(), panel=$("#casePanel");
 if(!c){panel.innerHTML='<div class="empty-state"><h3>没有找到符合条件的案例</h3><p>换一个场景、难度或搜索词试试。</p><button class="secondary-button" data-action="reset">重置筛选</button></div>';$("#lessonPanel").innerHTML="";$("#reflectionPanel").innerHTML="";return;}
 state.activeId=c.id;save();renderDailyPlan();
 const name=catalog.categories.find(x=>x.id===c.category)?.name||"练习";
 const diff={low:"基础",medium:"进阶",high:"高压"}[c.difficulty],isFav=state.favorites.includes(c.id),complete=Boolean(state.completed[c.id]);
 panel.innerHTML='<div class="case-top"><span class="case-path">SCENARIO / '+esc(name.toUpperCase())+' · '+String(c.level).padStart(2,"0")+'</span><div class="case-actions"><button class="light-button '+(isFav?"active":"")+'" data-action="favorite" aria-label="收藏或取消收藏">'+(isFav?"♥ 已收藏":"♡ 收藏")+'</button><span class="level-pill '+c.difficulty+'">'+diff+' / '+c.level+'</span></div></div>'+
 '<div class="case-headline"><div><h3>'+esc(c.title)+'</h3><div class="case-subtitle">'+esc(name)+' · '+esc(c.method)+' · 3 轮真实追问</div></div><div class="case-num">'+String(c.level).padStart(2,"0")+'</div></div>'+
 '<div class="objective"><span class="mini-label">◎ 本次沟通的目标</span><p>'+esc(c.objective)+'</p></div>'+
 '<div class="chapter-label"><span class="chapter-icon">01</span> 情境背景</div><p class="scene-text">'+esc(c.background)+'</p><ul class="facts-list">'+c.facts.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ul>'+
 (c.safetyNote?'<div class="safety">⚠ '+esc(c.safetyNote)+'</div>':'')+
 '<div class="chapter-label"><span class="chapter-icon">02</span> 多轮表达实战</div>'+
 '<p class="scene-text">对方会连续追问两次。每看到一句对方的话，先用声音说出你的应对；可在文本框记录要点。</p>'+
 '<div class="voice-tools"><button type="button" class="secondary-button" data-action="record">● 开始录音</button><button type="button" class="secondary-button" data-action="stop">■ 停止录音</button><audio id="voicePlayback" controls hidden aria-label="回听自己的表达"></audio><span class="small-muted">仅在本页面回听 · 不上传</span></div>'+
 '<div class="round-progress"><span>训练进度 · 第 '+Math.min(3,state.rounds[c.id]||1)+' / 3 轮</span><span>'+(state.visibility==="expanded"?"学习模式 · 全部可见":"实战模式 · 后续追问已隐藏")+'</span></div>'+
  '<div class="dialogue">'+c.dialogue.filter(t=>state.visibility==="expanded"||t.turn<=Math.min(3,state.rounds[c.id]||1)*2).map(t=>t.role==="learner"?modelTurn(c,t):opponentTurn(t)).join("")+'</div>'+
  (state.visibility==="hidden"&&(state.rounds[c.id]||1)<3?'<button type="button" class="round-next" data-action="advance">我已回应 · 解锁下一轮追问 <span>↗</span></button>':'')+
 '<div class="case-footer"><div class="btn-row"><button class="secondary-button" data-action="restart">↺ 重练本题</button><button class="secondary-button" data-action="previous">← 上一题</button><button class="secondary-button" data-action="copy">复制题目</button><button class="solid-button" data-action="complete" '+(state.visibility==="hidden"&&(state.rounds[c.id]||1)<3?"disabled":"")+'>'+(complete?"✓ 再次完成":"✓ 完成练习")+'</button><button class="solid-button" data-action="next">'+(state.order==="random"?"再随机一题 ↗":"下一题 →")+'</button></div><span class="mini-note">'+filtered().length+' 题符合筛选</span></div>'+
 '<div class="status-message" id="statusMessage" role="status">'+esc(notice)+'</div>';
 renderRail(c,complete);
}
function renderRail(c,complete){
 const lesson=$("#lessonPanel");
 lesson.innerHTML='<div class="rail-kicker">THE METHOD</div><h3>这道题的表达框架</h3><p>不背标准答案，先记住这三个动作。</p><div class="pillar-stack">'+c.pillars.map((s,i)=>'<div class="pillar"><span class="pillar-index">0'+(i+1)+'</span><strong>'+esc(s)+'</strong></div>').join("")+'</div><details class="lesson-details"><summary>展开 3 步训练要领</summary><ol>'+c.steps.map(s=>'<li><b>'+esc(s.name)+'</b>：'+esc(s.instruction)+'</li>').join("")+'</ol></details><details class="lesson-details"><summary>本题常见误区</summary><ol>'+c.coach.pitfalls.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol></details><a class="small-muted" style="display:block;margin-top:17px;text-decoration:underline" href="'+esc(c.source)+'" target="_blank" rel="noopener">了解相关沟通框架 ↗</a>';
 const ratings=state.ratings[c.id]||{}, vals=c.coach.rubric.map(x=>Number(ratings[x.name]||0));
 const total=vals.every(x=>x>0)?vals.reduce((a,b)=>a+b,0)*5:null;
 $("#reflectionPanel").innerHTML='<div class="rail-kicker">SELF REFLECTION</div><h3>给这次表达打分</h3><p>每项1—5分。不需要漂亮的词，只看沟通是否有效。</p>'+
 c.coach.rubric.map(r=>'<div class="reflection-item"><span>'+esc(r.name)+'</span><select data-rating="'+esc(r.name)+'" aria-label="'+esc(r.name)+'评分"><option value="0">未评</option>'+[1,2,3,4,5].map(v=>'<option value="'+v+'" '+(ratings[r.name]===v?"selected":"")+'>'+v+' / 5</option>').join("")+'</select></div>').join("")+
 '<div class="score-summary"><span>本次自评</span><strong>'+((total===null)?"—":total+' / 100')+'</strong></div><p class="tip">✳ 先给自己的真实表达打分，再看参考，不建议机械照抄。</p>'+
 (complete?'<p class="tip">✓ 本题已记录完成。所有记录只保存在你当前浏览器中。</p>':'');
}
function move(direction){
 stopRecording();
 const pool=sorted();if(!pool.length)return;let current=chosen(),next=null;
 if(state.order==="random"&&direction>0){
  let candidates=pool.filter(x=>x.id!==current?.id&&!state.visited.includes(x.id));
  if(!candidates.length){state.visited=[];candidates=pool.filter(x=>x.id!==current?.id);}
  if(!candidates.length)candidates=pool;
  next=candidates[Math.floor(Math.random()*candidates.length)];
  state.visited.push(next.id);
 }else{
  let idx=pool.findIndex(x=>x.id===current?.id);
  next=pool[(idx+direction+pool.length)%pool.length];
 }
 state.activeId=next.id;state.revealed={};notice="";save();renderCase();
 $("#casePanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function handleFilter(){
 if(!filtered().some(c=>c.id===state.activeId))state.activeId=sorted()[0]?.id||null;
 state.revealed={};notice="";save();renderCategories();renderControls();renderCase();
}
async function copyScenario(){
 const c=chosen();if(!c)return;
 const prompt='请扮演沟通对象，按照以下多轮场景与我练习。只逐轮说对方台词，不要提前泄露参考答案。每轮等待我回答后继续追问，最后从结构、理解、边界、落地4方面评分。\\n'+c.title+'\\n背景：'+c.background+'\\n已知事实：'+c.facts.join('；')+'\\n目标：'+c.objective+'\\n对方的三轮台词：\\n'+c.dialogue.filter(t=>t.role==="counterpart").map(t=>t.text).join('\\n');
 try{await navigator.clipboard.writeText(prompt);notice="已复制实战提示词，可以粘贴给 ChatGPT 进行对话演练。";}catch{notice="复制失败，请检查浏览器权限。";}
 renderCase();
}
function complete(){
 const c=chosen();if(!c)return;
 if(state.completed[c.id]?.date!==today())state.practiceDays[today()]=(state.practiceDays[today()]||0)+1;
  state.completed[c.id]={date:today(),at:Date.now()};
 save();renderStats();renderDailyPlan();notice="练习完成。推荐脱稿再说一遍，重点训练第三轮追问。";renderCase();
}
function switchFavorite(){const id=chosen()?.id;if(!id)return;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();renderCase();}
function sayLine(turn){
 const c=chosen(),t=c?.dialogue.find(x=>x.turn===turn);if(!t||!("speechSynthesis" in window)){notice="浏览器暂不支持语音朗读。";renderCase();return;}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.text);u.lang="zh-CN";u.rate=.94;speechSynthesis.speak(u);
}
async function startRecording(){
 if(!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder){
  const el=$("#statusMessage");if(el)el.textContent="当前浏览器不支持录音。建议使用支持麦克风的现代浏览器和 HTTPS 页面。";return;
 }
 if(currentRecording?.state==="recording")return;
 try{
  mediaStream=await navigator.mediaDevices.getUserMedia({audio:true});
  recordChunks=[];
  const recorder=new MediaRecorder(mediaStream);
  currentRecording=recorder;
  recorder.ondataavailable=e=>{if(e.data?.size)recordChunks.push(e.data);};
  recorder.onstop=()=>{
   if(currentAudio)URL.revokeObjectURL(currentAudio);
   const clip=new Blob(recordChunks,{type:recorder.mimeType||"audio/webm"});
   currentAudio=URL.createObjectURL(clip);
   const audio=$("#voicePlayback");
   if(audio){audio.src=currentAudio;audio.hidden=false;}
   mediaStream?.getTracks().forEach(t=>t.stop());mediaStream=null;
   const status=$("#statusMessage");if(status)status.textContent="录音完成。可以立即回听语速、停顿和第三轮回应；音频不会上传。";
  };
  recorder.start();
  const status=$("#statusMessage");if(status)status.textContent="正在录音，请大声说出你的三轮回应…";
 }catch{
  mediaStream?.getTracks().forEach(t=>t.stop());mediaStream=null;
  const status=$("#statusMessage");if(status)status.textContent="无法使用麦克风，请检查浏览器权限。";
 }
}
function stopRecording(){
 if(currentRecording?.state==="recording")currentRecording.stop();
}
function handleAction(action){
 if(action==="next")move(1);if(action==="previous")move(-1);if(action==="complete")complete();if(action==="favorite")switchFavorite();if(action==="copy")copyScenario();
 if(action==="record")startRecording();if(action==="stop")stopRecording();
  if(action==="advance"){const id=chosen()?.id;if(id){state.rounds[id]=Math.min(3,(state.rounds[id]||1)+1);state.revealed={};save();renderCase();}}
  if(action==="restart"){const id=chosen()?.id;if(id){state.rounds[id]=1;state.revealed={};notice="已回到第一轮，后续追问不会提前出现。";save();renderCase();}}
 if(action==="reset"){state.category="all";state.difficulty="all";state.search="";handleFilter();}
}
function bind(){
 $("#categoryNav").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;state.category=b.dataset.category;handleFilter();$("#sidebar").classList.remove("open");$("#menuButton").setAttribute("aria-expanded","false");});
 for(const [id,keyName] of [["categorySelect","category"],["difficultySelect","difficulty"],["orderSelect","order"],["visibilitySelect","visibility"]]){
  $("#"+id).addEventListener("change",e=>{state[keyName]=e.target.value;if(keyName==="order")state.visited=[];handleFilter();});
 }
 $("#searchInput").addEventListener("input",e=>{state.search=e.target.value;handleFilter();});
 $("#casePanel").addEventListener("click",e=>{
  const action=e.target.closest("[data-action]");if(action)handleAction(action.dataset.action);
  const reveal=e.target.closest("[data-reveal]");if(reveal){state.revealed[reveal.dataset.reveal]=true;renderCase();}
  const speak=e.target.closest("[data-speak]");if(speak)sayLine(Number(speak.dataset.speak));
 });
 $("#casePanel").addEventListener("input",e=>{if(e.target.matches("[data-answer]")){state.answers[e.target.dataset.answer]=e.target.value;save();}});
 $("#reflectionPanel").addEventListener("change",e=>{if(!e.target.matches("[data-rating]"))return;const c=chosen();if(!c)return;const ratings=state.ratings[c.id]||{};ratings[e.target.dataset.rating]=Number(e.target.value);state.ratings[c.id]=ratings;save();renderRail(c,Boolean(state.completed[c.id]));});
 $("#dailyPlanPanel").addEventListener("click",e=>{const b=e.target.closest("[data-daily]");if(b)selectDaily(b.dataset.daily);});
  $("#dailyStart").addEventListener("click",()=>{const plan=dailyPlan();const next=plan.find(c=>state.completed[c.id]?.date!==today())||plan[0];if(next)selectDaily(next.id);else $("#casePanel").scrollIntoView({behavior:"smooth",block:"start"});});
 $("#menuButton").addEventListener("click",()=>{const opened=$("#sidebar").classList.toggle("open");$("#menuButton").setAttribute("aria-expanded",String(opened));});
 document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1);});
}
async function init(){
 bind();
 try{
  const res=await fetch("./data/catalog.json",{cache:"no-cache"});if(!res.ok)throw Error("Catalog HTTP "+res.status);
  catalog=await res.json();
  const data=await Promise.all(catalog.categories.map(async c=>{const r=await fetch("./"+c.file,{cache:"no-cache"});if(!r.ok)throw Error(c.file+" HTTP "+r.status);return await r.json();}));
  cases=data.flat();if(!cases.length)throw Error("场景数据为空");
  if(!catalog.categories.some(c=>c.id===state.category))state.category="all";
  renderCategories();renderControls();renderStats();renderCase();
 }catch(error){$("#casePanel").innerHTML='<div class="empty-state"><h3>暂时无法读取案例库</h3><p>请通过网站 URL 或本地 HTTP 服务打开页面（直接双击 HTML 可能受浏览器文件权限限制）。</p><p>'+esc(error.message)+'</p><button class="secondary-button" onclick="location.reload()">重试加载</button></div>';$("#lessonPanel").innerHTML="";$("#reflectionPanel").innerHTML="";}
}
init();
})();
