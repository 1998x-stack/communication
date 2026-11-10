#!/usr/bin/env node
import {mkdtemp,mkdir,writeFile,readFile,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";
const script=fileURLToPath(new URL("./generate.mjs",import.meta.url));
const root=await mkdtemp(path.join(os.tmpdir(),"yanxi-v2-"));
const write=async(p,data)=>{const target=path.join(root,p);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,JSON.stringify(data,null,2)+"\n");};
const category={schemaVersion:2,id:"sample-lab",name:"可扩展示范",description:"测试全新类别的可自由指定数据",
 pillars:["先倾听","结构表达"],method:"观察 / 回应",source:"https://example.org/",
 guide:{goal:"用最小测试确认数据行为",sequence:["先了解情境","继续追问"],pushback:["回应未知的测试质疑"],redFlags:"不得编造信息"}};
const mk=(id,difficulty,roundCount)=>({
 schemaVersion:2,id,category:"sample-lab",difficulty,tags:["独立标签","可变轮次"],title:"独立样例",background:"这是一个具备充分背景信息的可扩展训练情境。",
 facts:["有明确可检查的事实"],objective:"与对方共同确认下一步安排",roundCount,
 dialogue:Array.from({length:roundCount*2},(_,i)=>({turn:i+1,role:i%2?"learner":"counterpart",text:i%2?"我会先确认具体事实，再给出可执行方案。":"请说出此刻你打算如何回应？"}))
});
const run=()=>spawnSync(process.execPath,[script,"--root",root],{encoding:"utf8"});
try{
 await write("data/categories/sample-lab.json",category);
 await write("data/entries/sample-lab/sample-lab-a.json",mk("sample-lab-a","high",1));
 await write("data/entries/sample-lab/sample-lab-b.json",mk("sample-lab-b","low",4));
 let p=run();if(p.status!==0)throw Error("Valid fixture failed: "+p.stderr);
 const catalog=JSON.parse(await readFile(path.join(root,"data/catalog.json"),"utf8"));
 const cases=JSON.parse(await readFile(path.join(root,"data/cases/sample-lab.json"),"utf8"));
 if(catalog.schemaVersion!==2||catalog.totalCases!==2||catalog.categories[0].difficultyCounts.high!==1||catalog.categories[0].difficultyCounts.low!==1)throw Error("Dynamic catalog/difficulty failed");
 if(cases[0].roundCount!==1||cases[1].roundCount!==4||cases[1].dialogue.length!==8)throw Error("Variable rounds failed");
 await write("data/entries/sample-lab/sample-lab-b.json",{...mk("sample-lab-b","low",4),roundCount:3});
 p=run();if(p.status===0||!p.stderr.includes("roundCount/dialogue mismatch"))throw Error("Wrong roundCount was not rejected");
 await write("data/entries/sample-lab/sample-lab-b.json",{...mk("sample-lab-b","low",4),difficulty:"expert"});
 p=run();if(p.status===0||!p.stderr.includes("Difficulty must be explicit"))throw Error("Invalid difficulty was not rejected");
 await write("data/entries/sample-lab/sample-lab-b.json",mk("sample-lab-b","low",4));
 await write("data/categories/sample-lab.json",{...category,id:"wrong-id"});
 p=run();if(p.status===0||!p.stderr.includes("Category ID/path mismatch"))throw Error("Category path mismatch was not rejected");
 console.log("PASS: independent category registration, explicit difficulty/tags, 1- and 4-round scenarios, and three invalid-fixture rejections");
}finally{await rm(root,{recursive:true,force:true});}
