#!/usr/bin/env node
// v2: content authority is data/categories/*.json and data/entries/<category>/*.json.
// Legacy data/seeds + data/overrides are read-only provenance, not inputs.
import {writeFile,mkdir} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {sourceLibrary} from "./lib/metadata-v2.mjs";
const ownRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const arg=process.argv.indexOf("--root");
const root=arg<0?ownRoot:path.resolve(process.argv[arg+1]||"");
if(arg>=0&&!process.argv[arg+1])throw Error("--root requires a directory");
const categories=await sourceLibrary(root);
const catalog={schemaVersion:2,updated:"2026-11-10",totalCases:0,
 difficulties:[{id:"low",name:"基础"},{id:"medium",name:"进阶"},{id:"high",name:"高压"}],
 categories:[]};
await mkdir(path.join(root,"data/cases"),{recursive:true});
for(const {category,cases} of categories){
 const relative="data/cases/"+category.id+".json";
 const counts={low:0,medium:0,high:0};
 for(const c of cases)counts[c.difficulty]++;
 catalog.categories.push({...category,file:relative,count:cases.length,difficultyCounts:counts});
 catalog.totalCases+=cases.length;
 await writeFile(path.join(root,relative),JSON.stringify(cases,null,2)+"\n");
}
await writeFile(path.join(root,"data/catalog.json"),JSON.stringify(catalog,null,2)+"\n");
console.log("Generated "+catalog.totalCases+" independent v2 cases across "+categories.length+" registered categories");
