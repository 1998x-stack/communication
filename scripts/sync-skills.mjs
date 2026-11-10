#!/usr/bin/env node
// Keep all three tool-specific skill directories in sync with data/catalog.json.
import {readFile,writeFile,mkdir,access} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const meta=(JSON.parse(await readFile(path.join(root,"data/catalog.json"),"utf8"))).categories;
const guides=Object.fromEntries(meta.map(c=>[c.id,c.guide]));

const skillBody=function skillBody(c,platform){
 return `---
name: communication-${c.id}
description: 当用户要练习${c.name}中的表达、回应质疑、设计多轮情境、点评真实话术或增量贡献案例时使用。围绕${c.pillars.join("、")}进行专业实战训练。
---

# ${c.name} · 沟通教练 Skill

## 使用场景
用户希望进行${c.name}的口才练习、复盘或新增教材时启用；无需将其他类别的案例全部加载到上下文。

## 必须先读
1. \`references/guide.md\`：当前场景的目标、步骤、反问与安全边界。
2. 分类运行卡片：\`data/cases/${c.id}.json\`；独立内容源：\`data/entries/${c.id}/*.json\`；分类配置：\`data/categories/${c.id}.json\`。
3. 需要写入新案例时，先读仓库根目录 \`data/README.md\`、\`AGENTS.md\` 和 \`scripts/validate.mjs\`。

## 模拟对话流程
1. 选取案例（按 low/medium/high 难度；用户未指定则从本分类现有的最低难度开始），只呈现背景、已知事实、角色和本次目标。
2. **一次只说对方一轮台词**，停下来等待学习者口头或书面回应；不提前泄露后续反问和示范答案。
3. 根据学习者真实回应自然追问；任意后续对方台词都是锚点。遵循案例的 \`roundCount\`（1轮、2轮、4轮及更多），不强制三轮。
4. 完成案例规定的全部轮次后按 **结构清晰、理解对方、坚定尊重、行动落点** 各 25 分评分；指出一条有效表达、一条最该改进之处，给出约 20–40 秒可自然说出口的改进版本。
5. 让学习者用自己的话再试一次，不鼓励逐字背诵。用户主动选择“全部展开”时才直接展示完整参考。

## 扩展案例
- 先确认类别 ${c.id} 与难度，新增 \`data/entries/${c.id}/<case-id>.json\`；写入具体背景、多个自然追问、明确目标与事实。
- 不用真实姓名、个人隐私、未授权客户数据；避免制造只有一个“标准答案”的误导。
- 每份案例有独立的 ID、分类、难度、标签、轮次数量和交替的对方/学习者台词；具体协议见 \`data/README.md\`。
- **不靠行号推导难度或 ID**；在新 JSON 文件明确指定这些元数据，已有 ID 永远不变。执行 \`npm run build && npm test\` 并审校实际问答。
- 不得冒充治疗师、法律顾问或保证沟通必然成功；危急场景现实安全优先。

## 平台说明
本副本面向 ${platform}；规范化技能入口是大写 \`SKILL.md\`，不是小写 \`skill.md\`。
`;
};
const guideBody=function guideBody(c){
 const g=guides[c.id];
 return `# ${c.name}：教学与教练参考

> 本文是本项目归纳的训练设计，不表示原研究机构认证这些具体参考话术。

## 教学目标
${g.goal}

## 沟通核心动作
${c.pillars.map((p,i)=>`${i+1}. **${p}**`).join("\n")}

## 沟通流程
${g.sequence.map((s,i)=>`${i+1}. ${s}`).join("\n")}

## 对方反问时，如何回应
${g.pushback.map(p=>`- ${p}`).join("\n")}

## 安全与伦理底线
${g.redFlags}

## 课堂练习组织
- 先读背景和开场，学习者用 20–40 秒尝试自然回应。
- 后续依照案例的 \`roundCount\` 逐轮播放对方追问，每轮都等待学习者回应；一轮题不添加额外问题。
- 随轮次推进具体的质疑、新约束和边界，而不是使用固定的“第三轮模板”。
- 结束（复盘）：四维自评，每维 0–25 分；着重分析具体句子，不夸大“口才训练”效果。
- 改写（迁移）：同一情境先分别用温和、坚定、简洁三种语气表达，内容保持真实。

## 在仓库中读取案例
- 单题内容源：\`data/entries/${c.id}/<case-id>.json\`
- 结构化卡片：\`data/cases/${c.id}.json\`
- 当前题量：${c.count}；难度、标签、轮次由每题元数据独立指定，不能由 ID 推断
- 数据格式和新增流程：\`data/README.md\`

## 理论延伸
${c.method}。参考：${c.source}

研究框架需要适应具体关系、文化和安全条件。不要把“让对方同意”当作训练唯一成功标准。
`;
};
const umbrellaBody=function umbrellaBody(){
 return `---
name: communication-coach
description: 中文沟通表达与口才训练总教练。根据动态类别配置自动路由不同场景，开展可变轮次角色扮演、反馈评分和新案例整理。
---

# 言习 · 综合沟通教练

## 第一步：识别场景
从 \`data/catalog.json\` 找到对应类别，然后**只读取相关的** \`references/<category>.md\` 和 \`data/cases/<category>.json\`。当前已注册分类：${meta.map(c=>c.id+"（"+c.name+"）").join("、")}。后续新增类别自动注册，无需更改此技能模板。

## 第二步：确认练习方式
默认隐藏参考、一次只展示一轮对方台词。用户可选择顺序、随机、低中高难度，或要求全部展开。一般不需要先问多轮配置问题，按用户提供的内容直接开始。

## 第三步：进行真实训练
读出背景、角色、事实、目标；提出对方开场问题后等待学习者回答。按案例的 \`roundCount\` 依次推进（可能只有一轮，也可能多于三轮）；避免提前给标准话术。按每轮真实回答调整追问。

## 第四步：严格而友善地反馈
按结构清晰、理解对方、坚定尊重、行动落点，各0–25分提供有依据的总分。指出一个值得保留的表达与最优先修正的句子，提供自然、不官腔的替代话术，再让学习者脱稿重试。不要保证沟通成功，也不要把有风险的现实情境当成辩论比赛。

## 第五步：增量导入
用户提供新的真实案例时，先匿名化，检查是否重复，判定类别和难度；在 \`data/entries/<category>/<case-id>.json\` 中写入稳定 ID、难度、标签及完整多轮台词。新增类别先写 \`data/categories/<category>.json\`。运行 \`npm run build && npm test\` 并审校话术，保留既有案例 ID。仓库另有 \`AGENTS.md\`、\`data/README.md\` 和 \`docs/IMPORT_FROM_CHATGPT.md\`。

## 安全
在急性自伤风险、现实威胁、暴力、欺凌或胁迫情境，先保障安全与现实支持，不继续一般的说服训练。
`;
};
async function write(rel,body){const target=path.join(root,rel);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,body,"utf8");}
for(const p of [".codex",".pi",".opencode"]){for(const c of meta){await write(p+"/skills/communication-"+c.id+"/SKILL.md",skillBody(c,p));await write(p+"/skills/communication-"+c.id+"/references/guide.md",guideBody(c));}}
await write(".agents/skills/communication-coach/SKILL.md",umbrellaBody());
for(const c of meta)await write(".agents/skills/communication-coach/references/"+c.id+".md",guideBody(c));
for(const c of meta){
 const dir=path.join(root,"curriculum",c.id);
 await mkdir(path.join(dir,"examples"),{recursive:true});
 const readme=path.join(dir,"README.md");
 try{await access(readme);}catch{
  await write("curriculum/"+c.id+"/README.md",
   "# "+c.name+"\n\n"+c.description+"\n\n## 沟通支柱\n\n"+
   c.pillars.map((p,i)=>(i+1)+". "+p).join("\n")+"\n\n"+
   "独立案例源：data/entries/"+c.id+"/；教练参考：.agents/skills/communication-coach/references/"+c.id+".md\n");
 }
 const keep=path.join(dir,"examples",".gitkeep");
 try{await access(keep);}catch{await write("curriculum/"+c.id+"/examples/.gitkeep","");}
}
console.log("Synced "+meta.length+" category skills into Codex, Pi, OpenCode, plus repository agent skill");
