# 外部来源与授权追溯复核（2026-10-19）

本记录覆盖 INKLAB 当前实际使用的第三方来源，并补记 2026-10-26 收到的追加许可。尚未实际导入的图片和鲑鱼跑参数即使已获许可，也必须在接入时补齐具体文件、版本、哈希与字段状态；社区样本不属于该许可。

## 复核结论

- Leanny 的原始许可回复仍可访问：允许 INKLAB 自由使用所需数据，可在构建时生成或提交规范化数据；要求使用 **Data provided by Lean** 并链接 `Leanny/splat3`。
- Leanny 于 2026-10-26 对追加请求回复 “Yes, all of that is fine as well and you are free to use the images as well”，确认请求中逐项列出的鲑鱼跑／通用参数、未来版本更新和选定图片范围；对应 Issue 已由项目维护者回复并按完成关闭。
- 固定上游提交 `7280ff9cde8bb1c5dcef46c700c326471584d2e6` 仍可解析，提交标题为 `1130`。
- 174 把对战武器目录、11 类对战参数和首批 4 把鲑鱼跑试算均记录游戏版本、固定提交、上游路径与 SHA-256。
- Sendouc 关于 26 个能力图标的回复仍可访问：不要求向 Sendouc 署名，并指出文件实际来自 `Leanny/splat3`。该回复不解决 Nintendo 对游戏素材的底层权利。
- Nintendo 更新说明、Nintendo 武器说明、Nintendo 装备能力说明、Leanny 参数浏览器、splatoon3.ink 日程端点／详情页及其 GitHub 仓库均在本次复核时可访问。
- Inkipedia 的主武器省墨页面会拒绝普通自动 HTTP 客户端，但搜索索引仍可解析到目标页面；项目继续只把它作为有明确链接的社区交叉核对来源，不复制页面正文或图片。

## 当前固定证据

- 对战目录与套装：`database/import-report.v11.3.0.json`
- 射击枪参数：`database/parameter-import-report.v11.3.0.json`
- 爆破枪参数：`database/blaster-parameter-import-report.v11.3.0.json`
- 滚筒参数：`database/roller-parameter-import-report.v11.3.0.json`
- 蓄力枪参数：`database/charger-parameter-import-report.v11.3.0.json`
- 其余七类参数：`database/remaining-family-parameter-import-report.v11.3.0.json`
- 首批鲑鱼跑试算：`database/salmon-parameter-source-report.v11.3.0.json`
- 来源索引与许可记录：`database/sources.json`

## 仍不在当前许可结论内

- Sendou 玩家配装样本或 API；
- Nintendo 对游戏商标和原始视觉素材的底层权利。

已获许可不等于字段含义已经核验。其余 `_Coop` 参数、玩家通用回墨、墨锁、WAVE、危险度、敌人生命值及图片在实际接入前，仍须逐项记录来源路径、固定提交、输入哈希和验证状态；不确定的数值继续显示“待验证”。

## 2026-10-26 追加授权请求结果

项目维护者已在原 Issue 中提交[追加确认请求](https://github.com/Leanny/splat3/issues/7#issuecomment-6260193156)，逐项询问以下范围：

- 其余鲑鱼跑与玩家通用参数，以及未来游戏版本的同类规范化更新；
- 主武器、副武器、特殊武器、鲑鱼跑武器、敌人、特殊事件目标与场地缩略图的复制、自托管和分享图使用范围；
- 新增范围与未来版本是否继续使用 **Data provided by Lean**，以及是否需要逐版本重新确认。

Leanny 已在[追加回复](https://github.com/Leanny/splat3/issues/7#issuecomment-6402785216)中确认上述全部请求范围可以使用，并明确同意使用图片。该答复同时覆盖请求中写明的未来版本更新方式、图片复制／转换／缩放／自托管／分享图用途，以及集中署名和来源记录方案。项目继续使用 **Data provided by Lean** 并链接其仓库。

这项确认允许项目开始接入申请中列出的数据和图片，但不改变以下工程门槛：只导入产品实际使用的文件和字段，不镜像完整上游仓库；新增内容保留版本、路径和哈希；第三方数据和图片不被 `AGPL-3.0-only` 重新许可；Nintendo 底层权利声明和可替换／移除结构继续保留。
