# 只读精修存档（legacy / v1）

这里的 270 份文件曾是原始三轮参考回应与教学重点的编辑覆盖层，现已完整迁移到 `data/entries/<category>/<case-id>.json`。

**v2 生成器不再合并本目录**。请勿在这里添加新题或修改话术以期待影响网站；应当直接修改 `data/entries` 中对应的独立案例源，并执行 `npm run build && npm test`。

保留本目录用于审计旧题迁移：`scripts/quality.mjs` 逐一验证 270 题原有回应、难度和复盘重点未遗失。它不是未来案例的权威源。
