# 言习 v2 · 独立元数据架构

## 单一内容源 → 确定性构建

```text
data/categories/<category>.json ─┐
                                 ├── scripts/generate.mjs ─── data/catalog.json
data/entries/<category>/*.json ─┘                          └── data/cases/<category>.json
                                                                    │
                                                   ┌────────────────┴─────────────┐
                                                   │                              │
                                          assets/app.js                    scripts/sync-skills.mjs
                                     动态分类/标签/轮次         .agents / .codex / .pi / .opencode
                                                   │                              │
                                        localStorage (仅本机)         curriculum 新类自动占位
```

**权威源**只有 `categories` 与 `entries`。生成产物 `catalog`、`cases` 和 Skills 不可人工编辑。原 `seeds/` 与 `overrides/` 为可审计的只读历史存档。零运行时依赖、静态 GitHub Pages 发布，无账号或服务端训练数据。

## 分类和案例完全解耦

- `categories/<id>.json`：决定类别名称、展示顺序、理论来源、沟通支柱和教学 `guide`，不需要在 JS 注册。
- `entries/<category>/<id>.json`：一份案例包含稳定 ID、自由难度、标签、显式 `roundCount` 与对应的完整 `dialogue`，可选独立显示排序。
- `generate` 自动发现所有类别与案例，拒绝目录与 ID 不匹配、重复 ID、未知分类、非法难度、空标签、轮次数不一致、角色顺序错误等情况。
- 运行 `skills:sync` 时读取自动生成的目录并生成 Codex、Pi、OpenCode 分类技能和 `.agents` 总教练参考。新增类别默认生成 `curriculum/<id>/README.md` 和空案例目录。
- 网页从 catalog 加载分类；标签筛选从实际案例动态收集；按 `roundCount` 逐轮解锁，不再假定 6 条对话或固定三轮。

## 向后兼容

原 270 题的 ID、难度和编辑后的话术都在 v2 原样保留。`level` 为可选的旧排序标记，新案例可以使用任意可读 ID 和 `order`。浏览器的 `localStorage` key 继续保持 `yanxi-training-v1`，收藏、文字、进度等以 ID 关联，旧记录无需迁移或重置。

所有 v2 案例必须声明自己的 `roundCount` 和 `difficulty`；旧数据导入已完成，不再通过 `seeds` 行号生成 ID。质量测试同时验证 270 份旧编辑覆盖文件与新独立源产物相同。后续新增案例可不改变旧题数量/顺序。

## 验证与发布

```bash
npm run build   # 从独立来源生成 catalog / 训练卡并同步 Skills
npm test        # 校验来源-产物一致、原270题保真、动态类别/轮次、UI约束
```

CI 额外执行 `git diff --exit-code` 确保生成内容已提交，Pages 从 `dist` 发布运行 JSON/HTML/CSS/JS，不公开原始编辑源或训练记录。未来新类别可以从仅一个案例开始，然后长期增长。

## 能力边界

已支持：动态类别、独立案例元数据、自由难度与标签、任意正整数轮次的线性对话、顺序/随机练习、每日三题、逐轮隐藏、浏览器本地记录、静态 Skills 自动生成。

暂未支持：由回答实时分支到不同剧情、云端账户同步、在线 AI 自动评分、服务端语音识别、数据导入编辑器或第三方专业认证。`roundCount` 是线性回合数，不表示已经有分支剧情引擎。

## 安全与素材边界

现实暴力/威胁/自伤等情境优先安全及现实专业支持，不把持续交涉当作唯一答案。新内容提交前需去标识化并保留创作版权，不能上传真实个人或公司的敏感资料。
