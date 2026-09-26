# 数据与素材来源

## Splatoon 3 装备能力图标

- 本地位置：`public/assets/abilities/*.avif`
- 取得日期：2026-09-01
- 取得来源：[`sendou-ink/assets`](https://github.com/sendou-ink/assets) 的 `assets/img/abilities/`
- 文件范围：26 个装备能力图标，不包含 `UNKNOWN.avif`

这些图标是用于辨认游戏内装备能力的游戏素材。Splatoon、相关商标及游戏素材的版权归 Nintendo 所有。INKLAB 是非官方玩家研究工具，与 Nintendo 及 Sendou.ink 均无隶属、授权或合作关系。

上游素材仓库未为全部游戏素材提供明确的独立再授权条款。项目将图标集中存放并通过内部能力 ID 引用，以便在授权条件变化或收到权利人要求时整体替换或移除。公开发布前应再次核对使用条件，并保留授权沟通记录。

## 中文名称

界面以《Splatoon 3》游戏内简体中文名称为基准；玩家俗称仅作为搜索别名，不替代官方名称。

## 武器与副武器数据

- 计划数据源：[`Leanny/splat3`](https://github.com/Leanny/splat3)
- 参数浏览：[`Splatoon 3 Parameter Database`](https://leanny.github.io/splat3/parameters.html)
- 当前目标版本：Ver. 11.3.0
- 用途：基础参数、武器套装关系及版本化数据

### INKLAB 本地数据仓库

- `database/manifest.json`：数据库索引、目标游戏版本及授权沟通状态。
- `database/sources.json`：来源、核对日期与使用状态。
- `database/main-weapons.v11.3.0.json`：当前六把代表主武器。
- `database/main-weapon-parameters.v11.3.0.json`：主武器参数字段、单位、核验状态和字段级来源位置。
- `database/sub-weapons.v11.3.0.json`：副武器基础耗墨与增强语境。
- `database/special-weapons.v11.3.0.json`：特殊武器身份表。
- `database/weapon-kits.v11.3.0.json`：版本化武器套装关系。
- `database/schema.ts`：字段类型与自动校验规则。

该目录是随源码维护的版本化数据源，适合当前无账号、无服务器存储的 Web 阶段。它不表示 INKLAB 拥有第三方事实或素材；上游授权未回复时继续标为 `pending`，不批量复制或镜像第三方数据库。未来若开放账号和社区功能，再把用户数据迁移到服务端数据库。

### 当前导入范围

- `lib/weapons.ts`：校验四张规范化数据表，并解析为界面所需的 6 把代表武器上下文，覆盖射击枪、蓄力枪、滚筒与加特林。
- 已核对字段：武器名称、类别、副武器、特殊武器、基础副武耗墨与副武器性能提升的作用对象。
- 尚未核对字段：完整 AP 效果曲线、主武器射击参数、特殊武器收益与全部关键阈值。界面必须继续标为原型，不得输出未经验证的攻略结论。
- 版本状态：Nintendo 已发布 Ver. 11.3.0；截至 2026-09-06，Leanny 的公开版本索引暂列至 Ver. 11.2.0。因此 11.2.0 结构化快照不能被标作 11.3.0 数据，后续导入需记录具体上游路径与提交。
- `lib/weapon-parameter-status.ts`：把每个字段分为“已核对 / 待验证 / 原型演示”，界面按字段展示状态。已核对字段必须带来源记录；待验证字段不得输出精确攻略结论。

Nintendo 官方更新公告用于确认版本发布和公开平衡调整；Sendou.ink 的公开实现仅用于公式与显示结果的交叉验证。正式数值导入时将保留版本、上游路径、参数字段和验证状态，不把第三方数据误标为 INKLAB 自有内容。
