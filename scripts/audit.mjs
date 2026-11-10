#!/usr/bin/env node
import {access,readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const catalog=JSON.parse(await readFile(new URL("data/catalog.json",root),"utf8"));
const paths=["index.html","assets/app.js","assets/styles.css",".github/workflows/pages.yml","AGENTS.md","README.md",
 "schemas/category.schema.json","schemas/case.schema.json","scripts/lib/metadata-v2.mjs","scripts/test-metadata-v2.mjs"];
for(const c of catalog.categories){
 paths.push("data/categories/"+c.id+".json","data/cases/"+c.id+".json",
  "curriculum/"+c.id+"/README.md","curriculum/"+c.id+"/examples/.gitkeep");
 for(const p of [".codex",".pi",".opencode"])
  paths.push(p+"/skills/communication-"+c.id+"/SKILL.md",p+"/skills/communication-"+c.id+"/references/guide.md");
 paths.push(".agents/skills/communication-coach/references/"+c.id+".md");
}
paths.push(".agents/skills/communication-coach/SKILL.md");
for(const p of paths){try{await access(new URL(p,root))}catch{throw Error("Missing: "+p)}}
const app=await readFile(new URL("assets/app.js",root),"utf8");
for(const term of ["orderSelect","visibilitySelect","localStorage","data/catalog.json","data-reveal","rating","tagSelect","roundCount"])
 if(!app.includes(term))throw Error("Missing UI behavior: "+term);
const html=await readFile(new URL("index.html",root),"utf8");
for(const term of ["assets/app.js","categoryNav","casePanel","difficultySelect","tagSelect","todayCount"])
 if(!html.includes(term))throw Error("Missing UI element: "+term);
console.log("PASS: "+paths.length+" dynamic category, skill, site and schema paths");
