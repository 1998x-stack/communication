import {readFile,readdir} from "node:fs/promises";
import path from "node:path";

const validId=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const levels=new Set(["low","medium","high"]);
export const rubric=[
 {name:"结构清楚",weight:25},
 {name:"理解对方",weight:25},
 {name:"坚定尊重",weight:25},
 {name:"行动落点",weight:25}
];
const fail=(message)=>{throw Error(message)};
const words=(v,min=1)=>typeof v==="string"&&v.trim().length>=min;
const stringArray=(v,min=1)=>Array.isArray(v)&&v.length>=min&&v.every(s=>words(s));
export const json=async p=>JSON.parse(await readFile(p,"utf8"));
export const cmp=(a,b)=>String(a).localeCompare(String(b),"en",{numeric:true});

export function validateCategory(c,fileName){
 if(c.schemaVersion!==2)fail("Category schemaVersion must be 2: "+fileName);
 if(!words(c.id)||!validId.test(c.id)||c.id!==fileName)fail("Category ID/path mismatch: "+fileName);
 if(!words(c.name,2)||!words(c.description,4))fail("Incomplete category: "+c.id);
 if(!stringArray(c.pillars)||!words(c.method)||!words(c.source)||!/^https:\/\//.test(c.source))fail("Category metadata missing: "+c.id);
 if(c.order!==undefined&&(!Number.isInteger(c.order)||c.order<0))fail("Invalid category order: "+c.id);
 if(!c.guide||!words(c.guide.goal)||!stringArray(c.guide.sequence)||!stringArray(c.guide.pushback)||!words(c.guide.redFlags))fail("Category coaching guide missing: "+c.id);
 return c;
}
export function normalizeCase(raw,cat,sourceName){
 if(raw.schemaVersion!==2)fail("Case schemaVersion must be 2: "+sourceName);
 if(!words(raw.id)||!validId.test(raw.id)||!raw.id.startsWith(cat.id+"-")||raw.id!==sourceName)fail("Case ID/path mismatch: "+sourceName);
 if(raw.category!==cat.id)fail("Category mismatch: "+raw.id);
 if(!levels.has(raw.difficulty))fail("Difficulty must be explicit low/medium/high: "+raw.id);
 if(!stringArray(raw.tags)||new Set(raw.tags).size!==raw.tags.length)fail("Tags required and unique: "+raw.id);
 if(!words(raw.title,2)||!words(raw.background,10)||!stringArray(raw.facts)||!words(raw.objective,4))fail("Incomplete background/facts/goal: "+raw.id);
 if(raw.order!==undefined&&(!Number.isInteger(raw.order)||raw.order<0))fail("Invalid ordering key: "+raw.id);
 if(raw.level!==undefined&&(!Number.isInteger(raw.level)||raw.level<1))fail("Invalid legacy level: "+raw.id);
 if(!Number.isInteger(raw.roundCount)||raw.roundCount<1)fail("roundCount must be explicit positive integer: "+raw.id);
 if(!Array.isArray(raw.dialogue)||raw.dialogue.length!==raw.roundCount*2)fail("roundCount/dialogue mismatch: "+raw.id);
 raw.dialogue.forEach((turn,i)=>{
  if(turn.turn!==i+1||turn.role!==(i%2===0?"counterpart":"learner")||!words(turn.text))fail("Dialogue order/text invalid "+raw.id+" at "+(i+1));
 });
 const pushbacks=raw.dialogue.filter(t=>t.role==="counterpart").slice(1).map(t=>t.text);
 if(raw.pushbacks!==undefined&&(JSON.stringify(raw.pushbacks)!==JSON.stringify(pushbacks)))fail("Legacy pushbacks mismatch: "+raw.id);
 const steps=raw.steps??cat.guide.sequence.map((instruction,i)=>({name:cat.pillars[i%cat.pillars.length],instruction}));
 if(!Array.isArray(steps)||!steps.length||steps.some(s=>!words(s.name)||!words(s.instruction)))fail("Invalid teaching steps: "+raw.id);
 const coached=raw.coach||{};
 const coach={
  ...coached,
  focus:coached.focus??("围绕“"+raw.objective+"”作清晰、有边界的回应。"),
  pitfalls:coached.pitfalls??["避免编造事实、忽略反问或给出无法兑现的承诺。"],
  selfCheck:coached.selfCheck??["是否回应了对方当轮的问题？","是否提供了可执行的下一步？"],
  rubric:coached.rubric??rubric
 };
 if(!words(coach.focus)||!stringArray(coach.pitfalls)||!stringArray(coach.selfCheck)||!Array.isArray(coach.rubric)||coach.rubric.length!==4||coach.rubric.some(x=>!words(x.name)||x.weight!==25))fail("Invalid teaching rubric: "+raw.id);
 const c={...raw,schemaVersion:2,roundCount:raw.roundCount,method:raw.method??cat.method,
  pillars:raw.pillars??cat.pillars,steps,coach,source:raw.source??cat.source,
  pushbacks:raw.pushbacks??pushbacks,safetyNote:raw.safetyNote??null};
 if(!stringArray(c.pillars)||!words(c.method)||!words(c.source))fail("Missing method or source: "+raw.id);
 return c;
}
export async function sourceLibrary(root){
 const catsDir=path.join(root,"data/categories"),entriesDir=path.join(root,"data/entries");
 const files=(await readdir(catsDir)).filter(n=>n.endsWith(".json")).sort(cmp);
 if(!files.length)fail("No category metadata files");
 const cats=[];
 for(const name of files)cats.push(validateCategory(await json(path.join(catsDir,name)),name.slice(0,-5)));
 cats.sort((a,b)=>(a.order??9999)-(b.order??9999)||cmp(a.id,b.id));
 const all=[],ids=new Set(),validDirs=new Set(cats.map(c=>c.id));
 for(const entry of await readdir(entriesDir,{withFileTypes:true})){
  if(entry.isDirectory()&&!validDirs.has(entry.name))fail("Unregistered entry category directory: "+entry.name);
  if(!entry.isDirectory()&&!entry.name.startsWith("."))fail("Unexpected entry root file: "+entry.name);
 }
 for(const cat of cats){
  const dir=path.join(entriesDir,cat.id);
  let names=[];
  try{names=(await readdir(dir)).filter(n=>n.endsWith(".json")).sort(cmp);}catch(e){if(e.code!=="ENOENT")throw e;}
  const cases=[];
  for(const name of names){
   const c=normalizeCase(await json(path.join(dir,name)),cat,name.slice(0,-5));
   if(ids.has(c.id))fail("Duplicate stable case ID: "+c.id);
   ids.add(c.id);cases.push(c);
  }
  cases.sort((a,b)=>(a.order??a.level??999999)-(b.order??b.level??999999)||cmp(a.id,b.id));
  all.push({category:cat,cases});
 }
 return all;
}
