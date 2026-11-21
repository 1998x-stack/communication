#!/usr/bin/env node
import {readdir,readFile,writeFile} from "node:fs/promises";import path from "node:path";import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");let fixed=0;
for(const c of await readdir(path.join(root,"posts"))){const cp=path.join(root,"posts",c);let entries;try{entries=await readdir(cp);}catch{continue;}for(const slug of entries){const ap=path.join(cp,slug,"assets");try{for(const f of await readdir(ap)){if(!f.endsWith("-mobile.svg"))continue;const p=path.join(ap,f),before=await readFile(p,"utf8"),after=before.replace('viewBox="0 0 960 ','viewBox="0 0 480 ').replace('<rect width="960"','<rect width="480"');if(before!==after){await writeFile(p,after);fixed++;}}}catch{}}}
console.log("Normalized "+fixed+" mobile SVG viewBoxes");
