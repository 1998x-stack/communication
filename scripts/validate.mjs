#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
const root=new URL("../",import.meta.url);
const load=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const catalog=await load("data/catalog.json");let total=0;const allIds=new Set();
const fail=msg=>{throw Error(msg)};
if(catalog.schemaVersion!==1)fail("Unsupported catalog version");
if(catalog.categories.length!==9)fail("Expected nine initial categories");
for(const cat of catalog.categories){
 const cases=await load(cat.file);
 if(cases.length!==cat.count)fail("Count mismatch "+cat.id);
 const titles=new Set();
 for(const c of cases){
  if(allIds.has(c.id))fail("Duplicate ID "+c.id);allIds.add(c.id);
  if(titles.has(c.title))fail("Duplicate title "+c.title);titles.add(c.title);
  if(c.category!==cat.id||!["low","medium","high"].includes(c.difficulty))fail("Category/difficulty "+c.id);
  if(!c.title||!c.background||!c.objective||!c.facts?.length)fail("Missing background/goal "+c.id);
  if(c.steps?.length<3||c.dialogue?.length<6||c.pushbacks?.length<2)fail("Not multi-round "+c.id);
  const turns=c.dialogue.map(x=>x.role).join(",");
  if(turns!=="counterpart,learner,counterpart,learner,counterpart,learner")fail("Conversation order "+c.id);
  if(!c.coach?.rubric?.length||!c.source)fail("Training metadata missing "+c.id);
  if(c.dialogue.some(x=>!x.text?.trim()))fail("Empty dialogue "+c.id);
 }
 total+=cases.length;
}
if(total!==catalog.totalCases)fail("Catalog total count mismatch");
console.log("PASS: "+total+" unique cases / "+catalog.categories.length+" categories, all with three-round dialogues");
