#!/usr/bin/env node
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {json,sourceLibrary} from "./lib/metadata-v2.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const catalog=await json(path.join(root,"data/catalog.json"));
const expected=await sourceLibrary(root);
const fail=m=>{throw Error(m)};
if(catalog.schemaVersion!==2)fail("Catalog must have schemaVersion=2");
if(!Array.isArray(catalog.categories)||catalog.categories.length!==expected.length)fail("Category registration mismatch");
if(catalog.totalCases!==expected.reduce((n,x)=>n+x.cases.length,0))fail("Catalog total count mismatch");
for(let i=0;i<expected.length;i++){
 const {category,cases}=expected[i],fromCatalog=catalog.categories[i],published=await json(path.join(root,"data/cases",category.id+".json"));
 if(fromCatalog.id!==category.id||fromCatalog.count!==cases.length||fromCatalog.file!=="data/cases/"+category.id+".json")fail("Catalog category mismatch: "+category.id);
 if(JSON.stringify(published)!==JSON.stringify(cases))fail("Published cases out of sync: "+category.id);
 const counts={low:0,medium:0,high:0};
 for(const c of cases)counts[c.difficulty]++;
 if(JSON.stringify(fromCatalog.difficultyCounts)!==JSON.stringify(counts))fail("Difficulty counts mismatch: "+category.id);
}
console.log("PASS: "+catalog.totalCases+" cases / "+catalog.categories.length+" categories, with stable IDs, independent difficulty/tags and variable dialogue rounds");
