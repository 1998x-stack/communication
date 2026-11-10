#!/usr/bin/env node
import {readFile,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const load=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const fail=message=>{throw Error(message)};
const catalog=await load('data/catalog.json');
const cases=new Map(),levels=['low','medium','high'];
const expectedBaseline=new Set();
if(catalog.categories.length!==9)fail('Initial curriculum must retain 9 categories');
for(const cat of catalog.categories){
 const entries=await load(cat.file);
 if(entries.length!==cat.count)fail('Catalog case count mismatch: '+cat.id);
 for(let n=1;n<=30;n++)expectedBaseline.add(cat.id+'-'+String(n).padStart(3,'0'));
 const distribution={low:0,medium:0,high:0};
 for(const c of entries){
  if(cases.has(c.id))fail('Duplicate ID: '+c.id);
  cases.set(c.id,c);
  if(c.category!==cat.id||!levels.includes(c.difficulty))fail('Invalid category/difficulty: '+c.id);
  if(!Array.isArray(c.dialogue)||c.dialogue.length!==6||c.dialogue.some((t,i)=>t.turn!==i+1||t.role!==(i%2?'learner':'counterpart')))fail('Invalid 6-turn conversation: '+c.id);
  if(c.dialogue[2].text!==c.pushbacks?.[0]||c.dialogue[4].text!==c.pushbacks?.[1])fail('Pushback mismatch: '+c.id);
  if(c.dialogue[0].text===c.dialogue[2].text||c.dialogue[2].text===c.dialogue[4].text)fail('Repeated challenge: '+c.id);
  distribution[c.difficulty]++;
 }
 if(distribution.low<10||distribution.medium<10||distribution.high<10)fail('Missing baseline difficulty distribution: '+cat.id);
}
const names=(await readdir(new URL('data/overrides/',root))).filter(n=>n.endsWith('.json')).sort();
const edited=new Set(),usedPhrases=new Set();
for(const name of names){
 const entry=await load('data/overrides/'+name),c=cases.get(entry.id);
 if(!c||entry.id+'.json'!==name)fail('Orphan or misnamed override: '+name);
 if(edited.has(entry.id))fail('Duplicate override ID: '+entry.id);
 edited.add(entry.id);
 if(!Array.isArray(entry.responses)||entry.responses.length!==3)fail('Need exactly 3 curated answers: '+name);
 if(entry.responses.some(t=>typeof t!=='string'||t.trim().length<25||t.includes('{fact}')||t.includes('{goal}')))fail('Unsubstantial or template answer: '+name);
 if(new Set(entry.responses).size!==3)fail('Repeated answer within a case: '+name);
 for(const text of entry.responses){
  if(usedPhrases.has(text))fail('Duplicate answer across cases: '+name);
  usedPhrases.add(text);
 }
 if(typeof entry.focus!=='string'||entry.focus.trim().length<12)fail('Missing concrete coaching focus: '+name);
 const generated=c.dialogue.filter(t=>t.role==='learner').map(t=>t.text);
 if(generated.some((s,i)=>s!==entry.responses[i]))fail('Generated replies do not match curated source: '+name);
 if(c.coach.focus!==entry.focus)fail('Generated coaching focus mismatch: '+name);
}
for(const id of expectedBaseline)if(!edited.has(id))fail('Initial case lost its curated response: '+id);
if(names.length<270)fail('Initial 270 overrides must not disappear');
const protectedCases=['leadership-030','children-030','children-029','partner-030','friends-028','conflicts-030','conflicts-027'];
for(const id of protectedCases){
 const c=cases.get(id);
 if(!c||!c.dialogue.filter(t=>t.role==='learner').some(t=>/安全|求助|帮助|紧急|危机|距离/.test(t.text)))fail('Safety response missing: '+id);
}
const app=await readFile(new URL('assets/app.js',root),'utf8');
for(const v of ['state.rounds','data-action="advance"','renderDailyPlan','practiceDays','data-action="restart"'])
 if(!app.includes(v))fail('Guided practice UI contract missing: '+v);
const newDrafts=[...cases.keys()].filter(id=>!edited.has(id));
console.log('PASS: '+cases.size+' cases, '+edited.size+' independent curated response sets ('+(edited.size*3)+' replies); '+newDrafts.length+' newly generated cases still pending editorial review');
