#!/usr/bin/env node
import {readFile,readdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {json} from "./lib/metadata-v2.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const fail=m=>{throw Error(m)};
const catalog=await json(path.join(root,"data/catalog.json"));
const cases=new Map();
for(const c of catalog.categories){
 const arr=await json(path.join(root,c.file));
 for(const item of arr){
  if(cases.has(item.id))fail("Duplicate stable ID: "+item.id);
  if(item.dialogue.length!==item.roundCount*2)fail("Wrong case roundCount: "+item.id);
  cases.set(item.id,item);
 }
}
const baseline=["upward","collaboration","leadership","partner","parents","children","friends","clients","conflicts"];
let verifiedLegacy=0;
for(const id of baseline){
 const names=await readdir(path.join(root,"data/overrides"));
 for(let n=1;n<=30;n++){
  const name=id+"-"+String(n).padStart(3,"0"),old=await json(path.join(root,"data/overrides",name+".json"));
  const c=cases.get(name);
  if(!c)fail("Lost baseline case ID: "+name);
  if(c.level!==n||c.category!==id||c.roundCount!==3)fail("Changed baseline case identity/rounds: "+name);
  if(c.difficulty!==(n<=10?"low":n<=20?"medium":"high"))fail("Changed baseline difficulty: "+name);
  if(c.coach.focus!==old.focus)fail("Lost curated coaching focus: "+name);
  const answers=c.dialogue.filter(x=>x.role==="learner").map(x=>x.text);
  if(JSON.stringify(answers)!==JSON.stringify(old.responses))fail("Lost legacy curated replies: "+name);
  verifiedLegacy++;
 }
 if(!names.includes(id+"-001.json"))fail("Missing archived provenance for "+id);
}
if(verifiedLegacy!==270)fail("Legacy preservation incomplete");
const four=cases.get("upward-briefing-4round"),two=cases.get("public-speaking-townhall-qa");
if(!four||four.difficulty!=="low"||four.roundCount!==4||!four.tags.includes("四轮应答"))fail("Independent difficulty/tag/4-round example missing");
if(!two||two.roundCount!==2||two.category!=="public-speaking")fail("New category 2-round example missing");
const sensitive=["leadership-030","children-030","children-029","partner-030","friends-028","conflicts-030","conflicts-027"];
for(const id of sensitive){
 const c=cases.get(id);if(!c?.safetyNote||!c.dialogue.some(t=>t.role==="learner"&&/安全|求助|帮助|紧急|危机|距离/.test(t.text)))fail("Safety-first reference missing: "+id);
}
const app=await readFile(path.join(root,"assets/app.js"),"utf8");
for(const v of ["visibleRounds","roundCount","data-action=\"advance\"","renderDailyPlan","tagSelect","practiceDays"])
 if(!app.includes(v))fail("UI contract missing: "+v);
const newUncurated=[...cases.keys()].filter(id=>!baseline.some(cat=>id.startsWith(cat+"-")&&/^\d{3}$/.test(id.slice(cat.length+1)))) ;
console.log("PASS: "+verifiedLegacy+" preserved curated cases, "+cases.size+" total cases and "+catalog.categories.length+" dynamic categories; "+newUncurated.length+" new independently-authored cases");
