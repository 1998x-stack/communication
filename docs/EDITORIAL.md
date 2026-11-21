# 沟通知识文章编辑规范

本规范采用 [Olah-style-posts 的渐进式解释与验证方法](https://github.com/1998x-stack/Olah-style-posts/tree/main/skills/olah-style-paper-posts)，并参照 [xm-posts 的内容注册、分类、文章目录与证据账本](https://github.com/1998x-stack/xm-posts)。参考的是叙事、信息架构、原创图解、交互与 QA 方法，不复制上游文章、图形、品牌或措辞。

## 一篇文章应回答什么

1. 从具体沟通困境开始，而不是先罗列术语。
2. 指出常见误区，并说明它为什么没有回应问题。
3. 把抽象原则拆成 2–4 个可观察动作；每个图只回答一个问题。
4. 使用仓库案例展示多轮递进；示范不是唯一答案。
5. 提供默认可读的原生交互，切换状态必须改变真实解释内容。
6. 说明失败模式与边界；暴力、威胁、胁迫、自伤或权力滥用优先现实安全支持。
7. 链接到具体训练案例，给出可观察的练习目标。
8. 区分外部来源、项目教学改编和示范案例，不把原创步骤说成研究结论。

## 结构与质量门禁

- 分类唯一源：`content/categories.json`；文章清单：`content/posts.json`；阅读路径：`content/reading_paths.json`。
- 正文：`posts/<category>/<slug>/index.html`；每篇至少三幅文章专属原创 SVG，包含 title/desc/viewBox 和对应 figcaption；密集图提供移动版。
- 使用语义化 main/article/nav/section/figure，单一 H1、连续 H2、skip link、focus-visible、reduced-motion 与 print CSS。
- 不引入 CDN、外部字体、分析 SDK 或第三方运行时；训练记录仍只保存在本机。
- `evidence.json` 的每条 claim 包含 id/kind/claim/source_url/locator/status/notes。verified 只用于来源支持的窄范围事实；derived 用于项目自行组织的流程。
- 浏览器验证覆盖 1440、768、390、360 px，检查溢出、资源、控制台、交互、键盘和打印视图。跳过必须标记未验证。

## 参考实现

- 上游技能：`Olah-style-posts/skills/olah-style-paper-posts`。
- 内容架构：`xm-posts/content/categories.json`、`content/posts.json`、`posts/<category>/<slug>/index.html`、`evidence.json`。
- 本项目原创适配：沟通案例、四维自评、情境边界和本地训练数据。
