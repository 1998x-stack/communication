#!/usr/bin/env node
// Canonical generator: edit data/seeds/*.txt then run npm run generate.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const meta=[
  {
    "id": "upward",
    "name": "向上汇报",
    "icon": "briefcase",
    "description": "用结论、备选方案与明确请求帮助上级决策。",
    "pillars": [
      "结论先行",
      "提供方案",
      "明确决策请求"
    ],
    "method": "SBAR / 结论先行",
    "source": "https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html"
  },
  {
    "id": "collaboration",
    "name": "同事协作",
    "icon": "users",
    "description": "对齐共同目标、分工责任和确认回路。",
    "pillars": [
      "目标一致",
      "责任清晰",
      "执行闭环"
    ],
    "method": "Closed-loop / RACI",
    "source": "https://www.ahrq.gov/hai/cusp/modules/implement/teamwork.html"
  },
  {
    "id": "leadership",
    "name": "管理下属",
    "icon": "user-check",
    "description": "兼顾任务期望、敢说真话的氛围与具体反馈。",
    "pillars": [
      "期望明确",
      "安全表达",
      "具体反馈"
    ],
    "method": "SBI / 双向反馈",
    "source": "https://www.ccl.org/articles/leading-effectively-articles/closing-the-gap-between-intent-and-impact/"
  },
  {
    "id": "partner",
    "name": "夫妻与伴侣",
    "icon": "heart",
    "description": "先回应情绪，再谈需求，主动修复关系。",
    "pillars": [
      "情绪理解",
      "需求表达",
      "冲突修复"
    ],
    "method": "积极倾听 / 我陈述 / 修复尝试",
    "source": "https://www.gottman.com/blog/repair-secret-weapon-emotionally-connected-couples/"
  },
  {
    "id": "parents",
    "name": "父母与长辈",
    "icon": "house",
    "description": "尊重关切，同时明确自主决定和可谈判的安排。",
    "pillars": [
      "尊重关切",
      "保持边界",
      "协商安排"
    ],
    "method": "认可关切 / 坚定边界",
    "source": "https://www.nia.nih.gov/health/advance-care-planning"
  },
  {
    "id": "children",
    "name": "亲子教育",
    "icon": "sprout",
    "description": "理解孩子情绪，建立安全规则与年龄适宜的自主。",
    "pillars": [
      "倾听接纳",
      "清晰规则",
      "培养自主"
    ],
    "method": "反映式倾听 / 共同解决问题",
    "source": "https://www.cdc.gov/parenting-toddlers/communication/active-listening.html"
  },
  {
    "id": "friends",
    "name": "朋友与社交",
    "icon": "coffee",
    "description": "真诚而不讨好，保持互惠与分寸。",
    "pillars": [
      "真诚理解",
      "相互回应",
      "尊重分寸"
    ],
    "method": "积极倾听 / 边界表达",
    "source": "https://greatergood.berkeley.edu/article/item/what_are_the_keys_to_good_friendship"
  },
  {
    "id": "clients",
    "name": "客户与商务",
    "icon": "handshake",
    "description": "探明真实需求，用证据和清晰承诺建立可信合作。",
    "pillars": [
      "识别需求",
      "建立可信度",
      "管理预期"
    ],
    "method": "澄清式提问 / 期望管理",
    "source": "https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/"
  },
  {
    "id": "conflicts",
    "name": "争执与利益冲突",
    "icon": "scale",
    "description": "降温、识别利益、制定可执行协议并守住安全。",
    "pillars": [
      "控制升级",
      "寻找真实利益",
      "建立可执行方案"
    ],
    "method": "Principled Negotiation / BATNA",
    "source": "https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/"
  }
];
const renderCases=function renderCases(seedText,cat) {
 const lines=seedText.trim().split(/\r?\n/);
 if(lines.length<30)throw Error(`Only ${lines.length} seeds in ${cat.id}`);
 const templates={
 upward:[
 [`我先说结论：{fact}。建议{goal}，请您确认这个优先级。`,`您问到的是结果是否可靠。我区分已确认的事实与待验证部分：{fact}。对于不确定的环节，我会给出明确的检查点。`,`这项决策有取舍。我建议{goal}，如果您同意，我负责执行并在下一个节点同步结果。`],
 [`目前最值得关注的是：{fact}。我准备了一个处理方向：{goal}，需要您确认。`,`我理解您担心影响更大。我会把影响范围与证据列清楚，不用模糊的“差不多”代替判断。`,`为了不让问题停留在讨论上，请确认是否按“{goal}”执行；我会书面跟进。`]],
 collaboration:[[`我们先对齐任务事实：{fact}。我的建议是{goal}，然后明确双方负责什么、何时交付。`,`你的排期或想法也重要。我们不急着分对错，可以对照现有记录，找出分歧在哪里。`,`如果认可“{goal}”，我们把负责人、截止时间和风险通报方式写下来，避免下次再猜。`]],
 leadership:[[`我先描述观察到的事实，不评价人：{fact}。希望我们一起做到{goal}。你怎么看？`,`你提到的困难我会认真听。我也想区分哪些是能力、资源或目标设定的问题，再提供支持。`,`我们先约定{goal}，我负责资源支持，你负责及时反馈；到检查点再复盘效果。`]],
 partner:[[`我听得出来这件事让你不舒服。我也想说清楚我的感受：{fact}。我希望{goal}，你现在最在意的是什么？`,`你担心的部分我听到了。我不是想证明谁对谁错，而是想找到双方都愿意执行的改变。`,`如果现在情绪很激动，我们可以先冷静一会儿，再确认{goal}能不能真正改善相处。`]],
 parents:[[`我知道您这样说是担心我，也谢谢您的关心。我的实际情况是{fact}。我希望{goal}。`,`您的经验我愿意听，但这件事最终需要由我承担结果，所以我会保留自己的决定权。`,`我们可以继续交流，不过我希望把讨论限制在具体建议上；关于这件事，我会按“{goal}”处理。`]],
 children:[[`我听见你现在很着急，也愿意先听你说。当前情况是{fact}。我们一起想办法做到{goal}。`,`你有生气和表达不同意的权利，但不能伤害自己或他人。哪些地方能商量，我们一起来选。`,`我们先做一个小步骤：{goal}。你愿意先试哪一步？需要帮助时可以告诉我。`]],
 friends:[[`谢谢你直接说出想法。我的真实情况是{fact}。我希望{goal}，也想听听你是怎么考虑的。`,`我重视友情，但也需要诚实表达自己的能力和边界，而不是答应做不到的事。`,`我们可以不同意彼此的选择。我的想法仍然是{goal}，希望还能保持尊重。`]],
 clients:[[`我先确认您希望解决的关键问题。目前可核实的是{fact}。建议{goal}，同时明确验收条件。`,`您的顾虑很合理。对于尚未验证的部分，我不能给出没有依据的保证，但可以说明条件和备选方案。`,`我会把{goal}写进会议纪要，列明范围、责任人、风险与下次反馈时间，供您确认。`]],
 conflicts:[[`我愿意把分歧谈清楚。先回到可验证的事实：{fact}。我建议{goal}，不要把问题变成人身评价。`,`我听到了你的立场；我们可以进一步说说各自真正担心什么，并找双方认可的判断标准。`,`如果双方愿意继续讨论，就把{goal}转成具体约定；若出现威胁，我会先离开并寻求安全支持。`]]
 };
 const risky=({title,background,fact})=>/自伤|不想活|威胁|堵门|人身安全|情绪危机|安全危机|摔物|危机|报复|可能伤害自己/.test(`${title} ${background} ${fact}`);
 function safetyReplies({title,goal}) {
  if(/自伤|不想活|情绪危机|安全危机|可能伤害自己/.test(title))return [
  `我认真听到了你说的话，也很担心你的安全。谢谢你愿意告诉我。我会先陪着你，不责怪你。`,
  `现在先不讨论绩效或谁对谁错。我们一起联系可信赖的人以及当地的紧急或专业危机支持。`,
  `我会认真对待这种风险，不答应替你保密任何可能危及生命的事。我们现在就找现实中的帮助。`];
  return [`我听见你说了什么，但当前最重要的是安全。我不打算继续在有威胁的环境里争论。`,`我会先保持距离、离开危险情境，并联系可信赖的人或当地紧急服务。`,`等所有人都安全、且具备平等自愿的条件后，才能再考虑是否沟通“${goal}”。`];
 }
 return lines.map((line,i)=>{
  const v=line.split("|").map(s=>s.trim());
  if(v.length!==7||v.some(x=>!x))throw Error(`${cat.id} row ${i+1}: invalid 7 columns`);
  const [title,background,opening,pushback,reversal,goal,fact]=v,level=i+1;
  const difficulty=level<=10?"low":level<=20?"medium":"high";
  const focus=cat.pillars;
  const phrase=templates[cat.id][i%templates[cat.id].length];
  const answers=(risky({title,background,fact})?safetyReplies({title,goal}):phrase.map(s=>s.replaceAll("{fact}",fact).replaceAll("{goal}",goal)));
  const dialogue=[
  {turn:1,role:"counterpart",stage:"起始提问",text:opening},
  {turn:2,role:"learner",stage:focus[0],text:answers[0],isModel:true},
  {turn:3,role:"counterpart",stage:"第一轮反问",text:pushback},
  {turn:4,role:"learner",stage:focus[1],text:answers[1],isModel:true},
  {turn:5,role:"counterpart",stage:"第二轮追问",text:reversal},
  {turn:6,role:"learner",stage:focus[2],text:answers[2],isModel:true}];
  const lessonSteps=focus.map((s,n)=>({name:s,instruction:[
  `开场先围绕已知事实“${fact}”作清楚表达，避免猜测对方动机。`,
  `听到“${pushback}”时，先识别顾虑，再坚持可验证事实或个人边界。`,
  `遭遇“${reversal}”的再次追问后，争取一个明确落点：“${goal}”。`][n]}));
  return {schemaVersion:1,id:`${cat.id}-${String(level).padStart(3,"0")}`,category:cat.id,title,level,difficulty,background:`${background}。你是这次沟通的一方，不能预知对方后续的反问，需要在尊重与清晰之间作出选择。`,facts:[fact],objective:goal,method:cat.method,pillars:focus,steps:lessonSteps,dialogue,pushbacks:[pushback,reversal],coach:{focus:`让对话最终朝“${goal}”推进，不一定要求当场达成一致。`,pitfalls:["不要一开始就长篇解释，忽略对方真实关切。","不要把事实、推测和个人感受混在一起。","不要用虚假承诺或人格攻击换取表面同意。"],selfCheck:["我是否先听懂对方的问题？","我是否把事实和立场说得足够清楚？","我是否回应了反问而不是机械背稿？","我是否给出明确行动、边界或下一步？"],rubric:[{name:"结构清楚",weight:25},{name:"理解对方",weight:25},{name:"坚定尊重",weight:25},{name:"行动落点",weight:25}]},safetyNote:risky({title,background,fact})?"涉及现实威胁、危机或可能的伤害时，立即优先保障安全并寻求可信现实支持，话术训练不能代替紧急帮助。":null,source:cat.source,tags:[cat.id,difficulty,cat.method],created:"2026-11-10"};
 });
};
async function main(){
 const catalog={schemaVersion:1,updated:"2026-11-10",totalCases:0,difficulties:[{id:"low",name:"基础",range:"1–10"},{id:"medium",name:"进阶",range:"11–20"},{id:"high",name:"高压",range:"21–30"}],categories:[]};
 await mkdir(path.join(root,"data/cases"),{recursive:true});
 for(const c of meta){const seed=await readFile(path.join(root,"data/seeds",c.id+".txt"),"utf8");const cases=renderCases(seed,c);catalog.totalCases+=cases.length;catalog.categories.push({...c,file:"data/cases/"+c.id+".json",count:cases.length});await writeFile(path.join(root,"data/cases",c.id+".json"),JSON.stringify(cases,null,2)+"\n");}
 await writeFile(path.join(root,"data/catalog.json"),JSON.stringify(catalog,null,2)+"\n");
 console.log("Generated "+catalog.totalCases+" scenario cards in "+catalog.categories.length+" categories");
}
await main();
