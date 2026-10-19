# 外部来源与授权追溯复核（2026-10-19）

本记录只覆盖 INKLAB 当前实际使用的第三方来源，不把未来计划或尚未导入的图片、鲑鱼跑参数和社区样本视为已获许可。

## 复核结论

- Leanny 的原始许可回复仍可访问：允许 INKLAB 自由使用所需数据，可在构建时生成或提交规范化数据；要求使用 **Data provided by Lean** 并链接 `Leanny/splat3`。
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

- 新增的主武器、副武器、特殊武器、熊武、敌人和地图图片；
- 尚未导入的其余 `_Coop` 参数、玩家通用回墨、WAVE、危险度、敌人生命值等数据；
- Sendou 玩家配装样本或 API；
- Nintendo 对游戏商标和原始视觉素材的底层权利。

这些范围必须在实际接入前取得对应说明或另行记录来源；未完成前继续使用文字占位和“待验证”状态。
