<div align="center">

# 言习 · Communication Lab

**把每一次对话，练成你的底气。**

每日 15 分钟的中文沟通表达训练场：从清晰表达，到真实反问，再到沉稳而坚定地沟通。

**9 个场景 · 270 个独立情境 · 每题 3 轮实战 · 3 档难度**

[立即开始每日晨练](https://1998x-stack.github.io/communication/) · [课程体系](docs/CURRICULUM.md) · [新增案例](docs/IMPORT_FROM_CHATGPT.md) · [架构说明](docs/ARCHITECTURE.md)

</div>

---

## 这是什么？

不是“万能高情商话术大全”，而是一套**可持续扩充、循序渐进、重视实际回应**的开源训练课程。每个案例都有背景、已知事实、沟通目标、三个关键步骤、对方两次反问、三段参考回应和四维复盘。参考表达用于学习思路，不是标准答案。

### 九类训练场景

| 分类 | 三大核心 | 案例 |
| --- | --- | ---: |
| 向上汇报 | 结论先行 → 提供方案 → 明确决策请求 | 30 |
| 同事协作 | 目标一致 → 责任清晰 → 执行闭环 | 30 |
| 管理下属 | 期望明确 → 安全表达 → 具体反馈 | 30 |
| 夫妻与伴侣 | 情绪理解 → 需求表达 → 冲突修复 | 30 |
| 父母与长辈 | 尊重关切 → 保持边界 → 协商安排 | 30 |
| 亲子教育 | 倾听接纳 → 清晰规则 → 培养自主 | 30 |
| 朋友与社交 | 真诚理解 → 相互回应 → 尊重分寸 | 30 |
| 客户与商务 | 识别需求 → 建立可信度 → 管理预期 | 30 |
| 争执与利益冲突 | 控制升级 → 寻找真实利益 → 建立可执行方案 | 30 |

初始共 **270 题**，每类基础（1–10）、进阶（11–20）、高压（21–30）各 10 题。**270 题均有独立的三轮精修回应（共 810 段）及教学复盘重点**，新增题仍可继续追加。真实风险场景不鼓励危险关系中的“说服”或强行和解。

## 网站具备什么？

- **每日晨练：** 每天自动编排基础、进阶、高压 3 题，保持当日题组固定；累计完成、今日进度、跨日练习记录与连续天数。
- **抽题方式：** 顺序训练、随机训练（优先避开当前轮已出现过的题目）。
- **训练筛选：** 九个场景、低/中/高难度、标题和背景关键词检索。
- **回答显示：** “全部展开”用于学习，“隐藏参考”用于脱稿；实战模式只显示当前轮，回答后主动解锁下一次反问，绝不提前剧透；每轮可单独揭示参考。
- **多轮实战：** 对方开场 → 你的回应 → 对方反问 → 回应 → 再追问 → 收束；支持重练当前题。
- **口头训练：** 支持麦克风录音与本页回放，检查语速、停顿与临场反应；音频不会自动保存或上传。
- **表达复盘：** 结构清楚、理解对方、坚定尊重、行动落点，四项自评。
- **本地隐私：** 练习文字、收藏和进度只保存在当前浏览器 localStorage；没有账号、第三方分析平台或服务器端存储。
- **对话延展：** “复制题目”可将结构化实战提示词交给 ChatGPT，进行更加自由的动态角色扮演。

> 网站展示的模型回应是预先编写的训练参考，并**不是**在线实时 AI 打分；分数由学习者自评。页面可通过浏览器中文朗读对方台词，也可以使用麦克风录下自己的整段表达并立即回听，录音不上传且刷新后不保留。

## 开始使用

无需安装任何前端依赖：

```bash
git clone https://github.com/1998x-stack/communication.git
cd communication

node --version  # 建议 Node.js 22 或更新
npm run build    # 校验案例并同步 Agent Skills
npm test

python3 -m http.server 4173
# 浏览器打开 http://localhost:4173
```

> 不建议直接双击 index.html：大多数浏览器限制本地 file:// 页面读取 JSON。静态 HTTP 服务即可。

## GitHub Pages 发布

已包含 `.github/workflows/pages.yml`，main 更新后自动构建和发布。GitHub Pages 已于 2026-11-10 通过 Actions 成功启用并完成首次部署：**[打开言习晨练网站](https://1998x-stack.github.io/communication/)**。可在仓库 Actions 的发布任务中查看当前部署状态；如果未来仓库设置发生变化，前往 Settings → Pages 检查发布来源为 GitHub Actions。

## 使用 Agent Skills

| Agent 环境 | 路径 | 自动发现 |
| --- | --- | --- |
| Codex 标准仓库入口 | `.agents/skills/communication-coach/SKILL.md` | 是 |
| Codex 分类镜像与阅读材料 | `.codex/skills/communication-*/SKILL.md` | 作为分类配置/镜像，不取代标准入口 |
| Pi | `.pi/skills/communication-*/SKILL.md` | 是 |
| OpenCode | `.opencode/skills/communication-*/SKILL.md` | 是 |

每种 Agent Skills 均有 `SKILL.md` 与 `references/guide.md`，遵循**先呈现题目 → 等用户回答 → 连续反问 → 四维反馈 → 再练**的流程。分类 Skill 可以复用同一批结构化案例，不需要复制题目内容。Codex 的标准发现目录是 `.agents/skills/`，因此额外提供标准入口。

## 如何从 ChatGPT 持续新增案例？

最轻量的方式是编辑 `data/seeds/<场景>.txt`，**在文件末尾追加一行七字段**（标题 | 背景 | 开场问题 | 第一轮反问 | 第二轮追问 | 沟通目标 | 已知事实），再执行：

```bash
npm run build
npm test
```

系统会生成 `data/cases/*.json` 并更新 `data/catalog.json` 中的数量，网页自动读取。对已有题目，可在 `data/overrides/<case-id>.json` 保存人工精修的三轮话术和课程重点，重新构建时自动合并（首批 270 道现均有逐题精修话术与复盘重点）。**不得在现有种子列表中间插入或移动行**，否则历史 ID 会变，影响已有训练记录。详见 [ChatGPT 案例导入手册](docs/IMPORT_FROM_CHATGPT.md)、[案例规范](data/README.md) 及 [AGENTS.md](AGENTS.md)。

## 项目结构

```text
├── index.html                  # 静态页面入口
├── assets/                     # 自适应 UI、交互 JS、品牌图标
├── data/
│   ├── catalog.json            # 分类与数据清单，网站读取入口
│   ├── seeds/                  # 追加入口：每场景 30 个原创情境
│   ├── overrides/              # 可持久人工精修：参考回应与复盘重点
│   └── cases/                  # 生成的多轮训练卡 JSON
├── curriculum/                 # 9 大课程分类与未来扩充占位
├── .agents/skills/             # Codex 标准总教练
├── .codex/skills/              # Codex 场景 Skill 镜像
├── .pi/skills/                 # Pi 场景 Skill
├── .opencode/skills/           # OpenCode 场景 Skill
├── scripts/                    # 生成、校验、审计、Skill 同步
├── schemas/                    # 案例数据契约
├── docs/                       # 课程、来源、架构、扩展说明
├── .github/workflows/          # 校验与 Pages 部署
└── AGENTS.md                   # Agent 协作与质量守则
```

## 研究与边界

本课程参考结构化沟通（SBAR、Check-back）、SBI 反馈、积极倾听、关系修复和原则性谈判；具体场景、话术、评分维度是本项目的教学设计，并非任何研究机构的认证标准。详见 [研究来源与适用边界](docs/RESEARCH.md)。

**许可：** 代码和原创课程示例以仓库内 MIT License 提供。贡献时请确认自己拥有内容的发布权，避免公开真实个人信息、客户资料或受版权保护的课程教材。

### 内容精修覆盖层

270 道初始案例全部设有独立覆盖文件；2026-11-10 完成其余 243 道的逐题话术精修。此完成度表示**编辑覆盖完成**，并不表示已由第三方专家认证或经过真实课堂效果验证。参见 [逐题精修验收说明](docs/CURATION_REVIEW.md)。

在 `data/overrides/upward-001.json` 这样的文件中填写 `id`、`responses`（恰好三轮自然口语）、可选 `steps`（三条具体步骤）和 `focus`（复盘重点），运行 `npm run build` 即可稳定合并。已有 270 题均保持稳定 ID，覆盖层不会改变分类或难度，也不会在再次生成时消失。请先检查对方的三次台词、事实与安全边界，再写参考回应。详见 [内容协议](data/README.md)。
