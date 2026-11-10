# 从 ChatGPT 导入新案例（独立元数据 v2）

今后你提供一段真实沟通经历，可以把它整理成一个**自包含 JSON**，直接提交到仓库，而不用插入七字段文本行、按编号决定难度或把场景固定为三轮。

## 1. 向 ChatGPT 提供的整理指令

> 请将下面的沟通经历匿名化，整理成符合言习 `schemaVersion: 2` 的独立案例 JSON。检查是否与仓库已有案例重复，给出稳定且易读的 `id`（必须以前缀 `<category>-` 开始）、分类 `category`、独立选择的 `difficulty`（low/medium/high）、可筛选的 `tags`、`title`、`background`、`facts`、`objective` 与 `roundCount`。`dialogue` 必须是从第1条对方发言开始的成对轮次：对方 → 我的示范回应 → 反问 → 我的回应……，`turn` 连续递增，角色严格交替。轮数根据事情复杂程度决定，可以为1、2、3、4轮或更多，不要为了凑数而加入空泛反问。每轮回应要针对上一句实际追问，最后一轮给出可执行行动或边界。补充 `steps` 与 `coach.focus`；若涉及安全、隐私、威胁、自伤或权力压迫，要将安全与现实支持置于说服之上。不得暴露真实姓名、住址、电话、客户机密或版权教材原文。输出 JSON 和一段说明，不要直接修改历史 `data/seeds` 与 `data/overrides`。

## 2. 选择分类

查看 `data/categories/*.json`，如分类已存在，直接使用其 `id`；若不属于任何现有类，新建 `data/categories/<new-id>.json`，包括名称、描述、排序、沟通原则与 `guide`。参考新增加的 [`public-speaking`](../data/categories/public-speaking.json)。

## 3. 保存独立案例

保存到 `data/entries/<category>/<case-id>.json`。路径和 `id` 必须对应；`difficulty` **完全独立于 ID**，无需因为案例数量超过 30 就指定高压。对话长度由 `roundCount` 决定，恰好需要 `roundCount * 2` 个 `dialogue` 条目。

可以参考 [`upward-briefing-4round`](../data/entries/upward/upward-briefing-4round.json) 和 [`public-speaking-townhall-qa`](../data/entries/public-speaking/public-speaking-townhall-qa.json)。

## 4. 生成、测试和提交

```bash
npm run build
npm test
git add data/categories data/entries data/catalog.json data/cases .agents .codex .pi .opencode curriculum
git commit -m "content: add new communication scenario"
```

每次构建自动发现分类与案例源，更新网页和对应 Skills。若报出 ID、轮次、标签、角色或分类目录错误，先修 JSON 再提交。

## 5. 防止覆盖原有进度与泄露信息

旧题 ID 永远不重命名、不复用；原 270 题的完成记录继续有效。公开前请删去个人识别信息和敏感工作数据。属于未经人工逐轮检查的新稿，要说明仍待精修，不因“构建通过”就宣称通过专业验证。
