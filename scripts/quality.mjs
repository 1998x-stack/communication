#!/usr/bin/env node
import {readFile,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const catalog=await read('data/catalog.json');
const cases=new Map();
for(const cat of catalog.categories){
 for(const c of await read(cat.file)){
  if(c.dialogue.length!==6||c.dialogue.some((t,i)=>t.turn!==i+1))throw Error('Invalid turn numbers '+c.id);
  if(c.dialogue[2].text!==c.pushbacks[0]||c.dialogue[4].text!==c.pushbacks[1])throw Error('Pushback mismatch '+c.id);
  cases.set(c.id,c);
 }
}
const names=(await readdir(new URL('data/overrides/',root))).filter(n=>n.endsWith('.json'));
if(names.length<27)throw Error('Expected at least 27 curated samples');
for(const name of names){
 const data=await read('data/overrides/'+name),c=cases.get(data.id);
 if(!c||data.id+'.json'!==name)throw Error('Orphan or misnamed override: '+name);
 if(data.responses.length!==3)throw Error('Wrong response count: '+name);
 const generated=c.dialogue.filter(t=>t.role==='learner').map(t=>t.text);
 if(generated.some((s,i)=>s!==data.responses[i]))throw Error('Override not generated: '+name);
 if(data.focus&&c.coach.focus!==data.focus)throw Error('Focus not applied: '+name);
}
const app=await readFile(new URL('assets/app.js',root),'utf8');
for(const v of ['state.rounds','data-action="advance"','renderDailyPlan','practiceDays','data-action="restart"'])
 if(!app.includes(v))throw Error('Guided practice contract missing: '+v);
console.log('PASS: '+names.length+' curated case overrides and guided training UI checks');
