# 架构与增量设计

## 技术选择

原生 HTML + CSS + 浏览器 JavaScript + JSON 数据，零运行时依赖；GitHub Pages 静态托管，无数据库和 API token，手机/桌面均可使用。

```text
data/seeds/*.txt --(node scripts/generate.mjs)--> data/cases/*.json
                                      \-------> data/catalog.json
                                                        |
                                                assets/app.js fetch
                                                        |
                                           分类 / 过滤 / 多轮卡片
                                                        |
                                          localStorage (仅本机)
```

`scripts/sync-skills.mjs` 从 catalog 读取分类和教学指南，生成平台 Skill；`scripts/validate.mjs` 和 `scripts/audit.mjs` 确认内容和目录一致。

## 标识与向后兼容

- 案例 ID 是 `category-###`，**唯一且永久不变**。
- 分类 ID 不要因翻译/营销文案更改。
- localStorage key 是 `yanxi-training-v1`，内有完成记录、个人回答、收藏、评分和最近抽题历史。
- 升级数据格式时同时提供迁移策略，不可把 ID 换成数组位置。
- `data/catalog.json` 是网站唯一分类注册入口，新增同一分类的案例不用修改网页。
- 此版本生成器基于固定九类 `meta`；增加第十类时需扩充 `scripts/generate.mjs` 与 `scripts/sync-skills.mjs`，并增加种子、课程指南与对应 Skill。后续可把元数据移入独立 `categories.source.json` 简化维护。

## 为什么保存种子与生成后的 JSON？

种子便于从 ChatGPT 中快速整理单个案例；生成后的 JSON 有完整的课堂卡片结构，可被网站和 Agent 直接读取。生成数据应与源同步，生成器要可复现。复杂案例需要进一步人工编辑时，未来引入覆盖层与内容审查队列，而不是直接编辑输出后丢失改动。

## 已支持 / 尚未支持

**已支持：** 270 例、三档难度、顺序/随机、逐轮隐藏、个人输入、收藏、完成统计、浏览器语音朗读、仅当前页面的本地录音回放、复制题目到 ChatGPT、九类 Agent Skills。

**尚未支持：** 网站内真实 AI 对话评分、云端跨设备同步、WebRTC 远程对练、内容覆盖合并系统、个人账号和服务端训练数据。不要把上述能力写成已上线。

## 数据安全与隐私

训练答案由 localStorage 存储，没有服务器端上报。导入真实聊天要去标识化；公开内容不允许真实住址、联系方式、秘密或未经授权的截图。在多人共用浏览器上，localStorage 并非安全私密空间，适合一般练习记录，不适合保存敏感私人材料。

## 扩展路线

1. 人工创作的多分支 JSON 案例与版本迁移；
2. 录音回放后的仅本机语速/停顿辅助与手动下载；
3. 每周训练回顾、弱项复习算法；
4. 可审查的 ChatGPT 案例导入、难度校准与可追溯出处；
5. 在用户主动授权下接入实时 AI 反馈，不隐性上传回答。
