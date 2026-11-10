# 言习 · 独立元数据协议 v2

## 权威来源（唯一编辑入口）

- **分类**：`data/categories/<category>.json`，文件名与 `id` 相同。配置名称、描述、展示顺序、方法、沟通支柱和完整 `guide`。
- **案例**：`data/entries/<category>/<case-id>.json`，每题一份 JSON。文件名与 `id` 相同，目录名与 `category` 相同。
- **生成输出**：`data/catalog.json` 和 `data/cases/<category>.json`。由 `npm run build` 自动生成，**不得直接编辑**。
- **历史存档**：`data/seeds/` 与 `data/overrides/` 保留旧 270 题的来源和精修记录，v2 生成器不再读取；编辑它们不会改变网站。

## 每个案例可独立指定的字段

| 字段 | 要求 | 说明 |
| --- | --- | --- |
| `schemaVersion` | 必须为 `2` | 避免混淆旧格式 |
| `id` | 唯一、稳定，建议 `<category>-<slug>` | 不受数字序号限制，保存进度使用此 ID |
| `category` | 已注册分类 ID | 必须与所在目录一致 |
| `title` | 必填 | 具体而非空泛 |
| `difficulty` | `low` / `medium` / `high` | 与 `id`、`order` 完全无关 |
| `tags` | 至少一个标签 | 用户可在网页筛选 |
| `roundCount` | 正整数 | 表示对方发言 + 学习者回应的成对轮数 |
| `dialogue` | 恰好 `2 * roundCount` 条 | 从 `counterpart` 开始，与 `learner` 严格交替；`turn` 从 1 连续递增 |
| `background`、`facts`、`objective` | 必填 | 场景、可核实事实与可执行目标 |
| `order` | 可选正整数或零 | 当前分类内排序，与难度分离 |
| `level` | 可选 | 原 270 题的历史编号，保留兼容展示 |
| `steps`、`coach` | 可选 | 不填时从分类教学指南与四维评分默认值生成；精品案例建议逐轮精修 |
| `method`、`pillars`、`source` | 可选 | 默认继承分类配置 |
| `safetyNote` | 可选 | 危险或高压情境请明确安全优先 |

### 四轮示例

完整的独立示例见 [`upward-briefing-4round`](entries/upward/upward-briefing-4round.json)。它的 `difficulty: low`，不受原有编号 1–10 的限制。两轮示例见 [`public-speaking-townhall-qa`](entries/public-speaking/public-speaking-townhall-qa.json)。

一个最小的二轮案例骨架（请写真实内容，勿直接复制空泛句）：

```json
{
  "schemaVersion": 2,
  "id": "upward-new-scenario-01",
  "category": "upward",
  "title": "临时答疑演练",
  "difficulty": "medium",
  "tags": ["临时汇报", "回答质疑"],
  "roundCount": 2,
  "background": "例会上对方质疑当前数据是否有依据，需要当场解释。",
  "facts": ["数据只覆盖最近一周"],
  "objective": "解释统计边界并约定后续核验",
  "dialogue": [
    {"turn": 1, "role": "counterpart", "text": "这些数据可靠吗？"},
    {"turn": 2, "role": "learner", "text": "目前仅代表最近一周，不能直接推断长期趋势。"},
    {"turn": 3, "role": "counterpart", "text": "那还拿什么做决策？"},
    {"turn": 4, "role": "learner", "text": "建议先作为初步信号，并补齐更长周期的验证后再定方案。"}
  ]
}
```

### 新增完全不同的场景类别

复制 [`data/categories/public-speaking.json`](categories/public-speaking.json) 为新分类文件并修改 `id`、名称、支柱、方法、`source` 与 `guide`。分类元数据不会写在 JavaScript 代码中。`guide` 需要 `goal`、`sequence`、`pushback`、`redFlags`；`scripts/sync-skills.mjs` 将自动生成三套分类 Skill、总教练参考与 `curriculum` 占位目录。

## 新增与审核步骤

1. 从 ChatGPT 取得新场景后先做隐私脱敏，检查是否与已有 ID、内容重复。
2. 选已有分类或添加新类别元数据；为案例提供稳定且可读的 `id`、自由指定难度、标签和实际轮次。
3. 第一轮确实回答开场；每次反问应在上一轮回答后合理出现；最后一轮有行动、边界、决定或安全退出。
4. 执行 `npm run build && npm test`。构建会生成分类索引、网站 JSON 与全部 Agent Skills；测试检验旧 270 题完整性、角色交替、轮数一致和类别路径。
5. 提交分类/案例源和生成输出到 PR。对风险场景优先现实安全和适当专业支持，不以强迫对方同意为成功指标。

## 兼容性与迁移

原 270 题的 `id`、`level`、`difficulty`、完整多轮话术及复盘重点已经导入 `entries`，`localStorage` 的 `yanxi-training-v1` 键保持不变。旧题进度按 ID 继续有效。旧七字段文本和精修覆盖文件仅用于溯源/质量测试，不再是编辑入口。手动编辑生成数据会在下一次构建时被覆盖。

有关结构约束见 [`schemas/case.schema.json`](../schemas/case.schema.json) 和 [`schemas/category.schema.json`](../schemas/category.schema.json)，复杂规则在 `scripts/lib/metadata-v2.mjs` 中校验。
