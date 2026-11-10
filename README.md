<div align="center">

# 言习 · Communication Lab

**把每一次对话，练成你的底气。**

每日 15 分钟的中文沟通表达训练场：从清晰表达，到真实反问，再到沉稳而坚定地沟通。

**10 个场景 · 272 个案例 · 自由轮次 · 独立难度与标签**

[立即开始每日晨练](https://1998x-stack.github.io/communication/) · [课程体系](docs/CURRICULUM.md) · [新增案例](docs/IMPORT_FROM_CHATGPT.md) · [架构说明](docs/ARCHITECTURE.md)

</div>

---

## 这是什么？

不是“万能高情商话术大全”，而是一套**可持续扩充、循序渐进、重视实际回应**的开源训练课程。每个案例都有独立元数据、背景、事实、目标、可变轮次的多轮对话、阶段指导和四维复盘。参考表达用于学习思路，不是标准答案。

### 动态训练场景（目前十类）

| 分类 | 三大核心 | 案例 |
| --- | --- | ---: |
| 向上汇报 | 结论先行 → 提供方案 → 明确决策请求 | 31 |
| 同事协作 | 目标一致 → 责任清晰 → 执行闭环 | 30 |
| 管理下属 | 期望明确 → 安全表达 → 具体反馈 | 30 |
| 夫妻与伴侣 | 情绪理解 → 需求表达 → 冲突修复 | 30 |
| 父母与长辈 | 尊重关切 → 保持边界 → 协商安排 | 30 |
| 亲子教育 | 倾听接纳 → 清晰规则 → 培养自主 | 30 |
| 朋友与社交 | 真诚理解 → 相互回应 → 尊重分寸 | 30 |
| 客户与商务 | 识别需求 → 建立可信度 → 管理预期 | 30 |
| 争执与利益冲突 | 控制升级 → 寻找真实利益 → 建立可执行方案 | 30 |
| 公众表达与临场发言 | 听众导向 → 结构表达 → 问答收束 | 1 |

原始 **270 题**的稳定 ID 与精修内容完整保留（共 810 段示范回应）；另新增一题四轮向上汇报、一题两轮公众表达，总计 **272 题**。今后分类、难度、标签、轮数与 ID 相互独立，不再按行号或编号区间推断难度。真实风险场景不鼓励危险关系中的“说服”或强行和解。

## 网站具备什么？

- **每日晨练：** 每天自动编排基础、进阶、高压 3 题，保持当日题组固定；累计完成、今日进度、跨日练习记录与连续天数。
- **抽题方式：** 顺序训练、随机训练（优先避开当前轮已出现过的题目）。
- **训练筛选：** 动态场景、低/中/高难度、独立标签以及标题、背景和关键词检索。
- **回答显示：** “全部展开”用于学习，“隐藏参考”用于脱稿；实战模式只显示当前轮，回答后主动解锁下一次反问，绝不提前剧透；每轮可单独揭示参考。
- **多轮实战：** 支持 1、2、3、4 或更多轮的交替对话；隐藏模式逐轮解锁对方提问，随时可重练。
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

每种 Agent Skills 均有 `SKILL.md` 与 `references/guide.md`，由分类注册表动态生成，遵循**先呈现题目 → 等用户回答 → 按轮次推进 → 四维反馈 → 再练**的流程。分类 Skill 可以复用同一批结构化案例，不需要复制题目内容。Codex 的标准发现目录是 `.agents/skills/`，因此额外提供标准入口。

## 如何从 ChatGPT 持续新增？（schemaVersion 2）

不再写七字段种子，也不必改生成器源代码。每一题直接新增一份 **独立 JSON 文件**：

1. 在 `data/entries/<category>/<case-id>.json` 添加案例。明确 `id`、`category`、`difficulty`（low/medium/high）、`tags`、`roundCount`、`dialogue`、背景和目标。`roundCount` 可为任意正整数，`dialogue` 必须是相同数量的对方和学习者交替台词。
2. 要增加全新的沟通场景，只需新增 `data/categories/<category>.json`（显示名称、三大支柱、专业教练指南等），并添加至少一题。分类导航、索引和三套 Agent Skills 会自动生成。
3. 运行 `npm run build && npm test`，提交新增源文件与自动生成的 `data/catalog.json`、`data/cases/*.json` 及 Skills。

例如 [四轮向上汇报](data/entries/upward/upward-briefing-4round.json) 将新题指定为 **基础** 难度，而 [两轮公众表达](data/entries/public-speaking/public-speaking-townhall-qa.json) 来自完全新建的分类。它们证明**难度与轮次都不依赖 ID 顺序**。完整指南见 [案例协议](data/README.md)、[从 ChatGPT 导入](docs/IMPORT_FROM_CHATGPT.md) 和 [架构设计](docs/ARCHITECTURE.md)。

旧 `data/seeds/` 和 `data/overrides/` 作为初始 270 题的只读历史存档保留，**不再参与生成**；请直接编辑 `data/entries/`。旧题 ID 不变，已有浏览器训练进度无需迁移。
## 项目结构

```text
├── index.html                  # 静态页面入口
├── assets/                     # 自适应 UI、交互 JS、品牌图标
├── data/
│   ├── catalog.json            # 分类与数据清单，网站读取入口
│   ├── categories/             # 唯一分类定义源（可新增类别）
│   ├── entries/<category>/     # 唯一案例源，一题一份 v2 JSON
│   ├── seeds/ & overrides/     # 只读历史资料（原270题）
│   └── cases/                  # 构建生成的网站训练卡片
├── curriculum/                 # 自动补齐新分类占位
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

### 内容质量与历史兼容

初始 270 道经过的逐题编辑内容已原样并入 `data/entries/`；原覆盖文件仍保留以供审计。`scripts/quality.mjs` 会逐一比较这 270 个稳定 ID 的示范回应、难度与复盘重点，防止迁移回退。新案例需要独立内容审核，构建通过不代表获得外部专家认证。查看 [质量协议](docs/CURATION_REVIEW.md)。
