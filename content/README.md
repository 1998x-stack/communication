# 内容源说明

- `categories.json`：一级领域与稳定二级主题。
- `posts.json`：文章元数据、状态、标签、来源、封面与关联训练案例。
- `reading_paths.json`：专题阅读路径。
- `posts/<category>/<slug>/index.html`：文章正文；每篇文章目录下的 `assets/` 和 `evidence.json` 是文章专属图解与证据账本。

不要手工编辑 `knowledge/` 生成页面；执行 `npm run knowledge:build` 重建。
