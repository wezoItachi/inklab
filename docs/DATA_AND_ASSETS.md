# 数据与素材来源

## 项目许可证边界

`LICENSE` 中的 `AGPL-3.0-only` 适用于 INKLAB 自有代码和明确由项目以该许可证发布的原创文档。它不会把第三方事实数据、Nintendo 游戏素材、第三方商标或另有来源说明的内容重新许可为 AGPL。复制、修改或再分发这些内容时，仍须分别遵守本页记录的来源、授权范围和相应权利人的条件。

## Splatoon 3 装备能力图标

- 本地位置：`public/assets/abilities/*.avif`
- 取得日期：2026-09-01
- 取得来源：[`sendou-ink/assets`](https://github.com/sendou-ink/assets) 的 `assets/img/abilities/`
- 上游来源说明：Sendouc 在回复中说明这些图标实际来自 [`Leanny/splat3`](https://github.com/Leanny/splat3)
- 文件范围：26 个装备能力图标，不包含 `UNKNOWN.avif`

这些图标是用于辨认游戏内装备能力的游戏素材。Splatoon、相关商标及游戏素材的版权归 Nintendo 所有。INKLAB 是非官方玩家研究工具，与 Nintendo 及 Sendou.ink 均无隶属、授权或合作关系。

INKLAB 已就明确范围向 Sendou 询问：将当前 26 个图标复制进公开 GitHub 仓库，并由 INKLAB 网站自行托管。Sendouc 在 2026-10-05 的 [`sendou-ink/assets#37` 回复](https://github.com/sendou-ink/assets/issues/37#issuecomment-6000744990)中表示没有问题、无需给他署名，并说明实际来源为 `Leanny/splat3`。该记录只适用于本次明确询问的范围，不是对 `sendou-ink/assets` 其他素材的概括性许可，也不代表 Nintendo 对游戏内原始图形可能持有的底层权利已经解决。

项目继续将图标集中存放并通过内部能力 ID 引用，以便在条件变化或收到权利人要求时整体替换或移除。Sendou 回复原文和申请范围可通过上方公开回复链接核对。

## 中文名称

界面以《Splatoon 3》游戏内简体中文名称为基准；玩家俗称仅作为搜索别名，不替代官方名称。

Ver. 11.3.0 的 174 把对战武器名称直接取自固定上游快照的 `CommonMsg/Weapon/WeaponName_Main`，不通过“本体名称＋型号后缀”模板拼接。导入时只进行 Unicode NFC 与首尾空白规范化，并拒绝示例、模板、未命名或待定占位串；名称仍保留游戏原文中的空格、间隔号、拉丁字母和型号写法。

## 武器与副武器数据

- 数据源：[`Leanny/splat3`](https://github.com/Leanny/splat3)
- 参数浏览：[`Splatoon 3 Parameter Database`](https://leanny.github.io/splat3/parameters.html)
- 当前目标版本：Ver. 11.3.0
- 用途：基础参数、武器套装关系及版本化数据
- 要求署名：**Data provided by Lean**
- 许可记录：[`Leanny/splat3#7` 回复](https://github.com/Leanny/splat3/issues/7#issuecomment-5566028905)
- 追加请求：[`Leanny/splat3#7` 后续请求](https://github.com/Leanny/splat3/issues/7#issuecomment-6260193156)
- 追加许可：[`Leanny/splat3#7` 回复](https://github.com/Leanny/splat3/issues/7#issuecomment-6402785216)（2026-10-26：请求所列数据与图片范围均可使用）

### INKLAB 本地数据仓库

- `database/manifest.json`：数据库索引、目标游戏版本及授权沟通状态。
- `database/sources.json`：来源、核对日期与使用状态。
- `database/main-weapons.v11.3.0.json`：Ver. 11.3.0 的 174 把对战主武器。
- `database/main-weapon-parameters.v11.3.0.json`：主武器参数字段、单位、核验状态和字段级来源位置。
- `database/sub-weapons.v11.3.0.json`：副武器基础耗墨与增强语境。
- `database/special-weapons.v11.3.0.json`：特殊武器身份表。
- `database/weapon-kits.v11.3.0.json`：版本化武器套装关系。
- `database/import-report.v11.3.0.json`：上游输入文件哈希、导入日期和输出计数。
- `database/parameter-import-report.v11.3.0.json`：射击枪参数文件、固定提交、输入哈希和输出计数。
- `database/blaster-parameter-import-report.v11.3.0.json`：爆破枪参数文件、固定提交、输入哈希和输出计数。
- `database/roller-parameter-import-report.v11.3.0.json`：滚筒参数文件、固定提交、输入哈希和输出计数。
- `database/charger-parameter-import-report.v11.3.0.json`：蓄力枪参数文件、固定提交、输入哈希和输出计数。
- `database/remaining-family-parameter-import-report.v11.3.0.json`：其余七个武器类别的参数文件、固定提交、输入哈希和输出计数。
- `database/salmon-weapon-parameters.v11.3.0.json`：63 把常规打工武器和 8 把熊武的来源可追溯部分参数，逐字段区分 `_Coop` 显式覆盖与父类继承。
- `database/salmon-parameter-source-report.v11.3.0.json`：上述打工参数实际读取的普通／`_Coop` 文件、固定提交、输入哈希和输出计数。
- `database/salmon-ink-cycle-evidence.v11.3.0.json`：普通回墨、主武／副武墨锁与鱿鱼滚行相关字段的证据分层和持续输出模型门禁。
- `database/salmon-targets.v11.3.0.json`：14 个自由目标的生命值、复合生命值表达、本体／弱点／分体边界、社区数据页固定修订号与 Leanny 敌人内部身份。
- `database/battle-parameter-gap-report.v11.3.0.json`：全量主武字段完整度审计，逐类别记录待验证字段及可能涉及上游缺省／继承规则的候选组。
- `database/battle-parameter-source-audit.v11.3.0.json`：上述 32 组、244 次字段出现的固定提交来源核对；90 次为机制对象存在但叶字段省略，151 次为可选机制对象整体缺失，3 次需要参数结构以外的语义来源。省略本身不作为数值证据。
- `database/schema.ts`：字段类型与自动校验规则。

该目录是随源码维护的版本化数据源，适合当前无账号、无服务器存储的 Web 阶段。它不表示 INKLAB 拥有第三方事实或素材；Leanny 已同意项目按指定署名使用所需数据，INKLAB 会保留仓库链接、导入输入哈希与字段级来源记录。当前仅选取并规范化产品需要的武器目录、套装关系和参数字段，不保存完整上游数据库镜像。未来若开放账号和社区功能，再把用户数据迁移到服务端数据库。

### 当前导入范围

- `lib/weapons.ts`：校验五张规范化数据表，并解析为界面所需的 174 把武器上下文，覆盖全部 11 个主武器类别。
- 已导入目录字段：武器名称、类别、副武器和特殊武器套装关系。
- 已核对参数字段：全部 174 把对战武器都至少含一个上游显式字段。除射击枪、爆破枪、滚筒和蓄力枪外，本轮补入 9 把画笔、15 把泼桶、15 把加特林、16 把双枪、11 把伞、9 把弓和 9 把刮水刀；这 84 条记录包含 83 把原先只有待验证占位的武器，以及 1 把先前人工核验、现按加特林共享模板规范化的桶装旋转枪。原先 6 把代表武器另有逐武器核对文档。
- 射击枪 14 个参数类已额外核对伤害开始／结束衰减帧和弹丸初速，40 把射击枪均在实验室展示这组射程基础证据；完整运动阶段尚未积分，因此不会把这些原始字段合成为未经验证的“有效射程”。
- 实验室使用统一射程证据层区分四种不能混算的语义：射击枪弹丸衰减时间轴、爆破枪爆风距离控制点、蓄力枪满蓄力弹道距离，以及爆炸泼桶的独立爆风范围。当前共 78 把武器具有至少一项来源字段；其余武器保留类别专属的待验证说明。
- 七类新增字段只采用文件中直接出现且含义足够明确的伤害、耗墨、射击／蓄力阶段、扩散、移动、翻滚、伞弹丸与爆炸等数值；不把单位伤害误称为整次攻击总伤害，也不把阶段窗口直接解释为完整动作周期。详细边界见 [`verification/Remaining-families-v11.3.0.md`](verification/Remaining-families-v11.3.0.md)。
- 弓类已建立最低／一段／满蓄力三档动作窗口模型。三发猎鱼弓的三向发射与邦普V的一次五发采用 Nintendo Splatoon Base 的公开武器说明；LACT 系的箭数因当前来源未直接写明而继续留空，不推导整轮伤害。公式、假设和未验证边界见 [`verification/Stringer-charge-model-v11.3.0.md`](verification/Stringer-charge-model-v11.3.0.md)。
- 双枪已拆分普通射击与翻滚后定点射击状态，并补入显式的翻滚后伤害与扩散角。开尔文525系和灭熄FF系可以计算来源明确的翻滚后射击窗口；其他双枪因参数文件未显式提供翻滚后伤害而继续留空。完整口径见 [`verification/Maneuver-state-model-v11.3.0.md`](verification/Maneuver-state-model-v11.3.0.md)。
- 刮水刀已拆成横斩／蓄力斩的墨刃与近身刀身四种命中形态，并补入释放帧和回墨锁字段。当前计算独立击倒次数、满墨动作次数及蓄力输入至释放的时间点；在完整重复周期得到实机验证前不输出连续 DPS。完整口径见 [`verification/Saber-action-model-v11.3.0.md`](verification/Saber-action-model-v11.3.0.md)。
- 伞类已拆分散弹射击与伞面时间轴，补入能否发射、准备／展开／发射帧、普通射击与伞面发射回墨锁和伞面耐久。单次射击使用上游显式的有效总伤害上限，不将最高单颗伤害乘弹丸数；特工配件的 0% 发射耗墨会结合 `IsCanopyShot: false` 显示为不可发射。完整口径见 [`verification/Shelter-shot-canopy-model-v11.3.0.md`](verification/Shelter-shot-canopy-model-v11.3.0.md)。
- 画笔类已拆分挥击与刷地动作，补入连续挥击间隔、挥击／刷地回墨锁、两种移动速度与进入刷地涂墨阶段帧。墨滴组不会被简单乘算为整次挥击总伤害；上游省略连续间隔的北斋不输出窗口 DPS。完整口径见 [`verification/Brush-swing-roll-model-v11.3.0.md`](verification/Brush-swing-roll-model-v11.3.0.md)。
- 泼桶类已拆分单个伤害单元、轨迹配置与挥桶动作，补入伤害单元组数、最晚单元延迟、后摇、移动限制、回墨锁，以及爆炸泼桶的独立爆风字段。不会将配置弹体、反弹或直击与爆风自动相加。完整口径见 [`verification/Slosher-unit-action-model-v11.3.0.md`](verification/Slosher-unit-action-model-v11.3.0.md)。
- 加特林类已按六个参数类分别建模两段蓄力、射击窗口、伤害层级和特殊状态，移除只适用于桶装旋转枪的硬编码说明。消防栓满蓄力伤害、圆珠笔可变状态、鹦鹉螺号续蓄／储存和审查者满蓄力覆盖值均独立处理；窗口发数继续标为可整除估算。完整口径见 [`verification/Spinner-charge-state-model-v11.3.0.md`](verification/Spinner-charge-state-model-v11.3.0.md)。
- 尚未核对字段：各类别的有效射程统一定义、滚筒和画笔等复杂动作的完整连续周期、上游省略后需要继承的缺省值、部分副武器耗墨与增强对象、完整 AP 效果曲线、特殊武器收益与全部关键阈值。对应值保持为空并在界面标为待验证，不得借用其他武器参数或输出未经验证的攻略结论。
- 版本状态：Nintendo 已发布 Ver. 11.3.0；截至 2026-10-03，Leanny 已公开 `data/parameter/1130` 参数快照。当前字段固定核对到上游提交 `7280ff9cde8bb1c5dcef46c700c326471584d2e6`，详见 `docs/verification/`。
- `lib/weapon-parameter-status.ts`：把每个字段分为“已核对 / 待验证 / 原型演示”，界面按字段展示状态。已核对字段必须带来源记录；待验证字段不得输出精确攻略结论。

Nintendo 官方更新公告用于确认版本发布和公开平衡调整；Sendou.ink 的公开实现仅用于公式与显示结果的交叉验证。正式数值导入时将保留版本、上游路径、参数字段和验证状态，不把第三方数据误标为 INKLAB 自有内容。Leanny 数据按其回复要求使用 **Data provided by Lean** 并链接 [`Leanny/splat3`](https://github.com/Leanny/splat3)。2026-10-26 的追加回复确认了请求中列出的鲑鱼跑／通用参数、未来版本更新和选定图片用途；这不应扩大解释为可以镜像完整上游仓库，也不代表 Nintendo 对游戏素材、名称和商标的底层权利已经转移。Sendouc 关于能力图标实际来源的说明仍作为单独证据保留。源码仓库已于 2026-10-20 公开，网站仍未部署。

## 鲑鱼跑日程

- 实时日程端点：[`splatoon3.ink/data/schedules.json`](https://splatoon3.ink/data/schedules.json)
- 轮换详情页：[`splatoon3.ink/salmonrun`](https://splatoon3.ink/salmonrun)
- 上游项目：[`misenhower/splatoon3.ink`](https://github.com/misenhower/splatoon3.ink)（MIT）

鲑鱼跑实验室当前在浏览器中读取当期常规轮换的地图与四把武器名称，不将远程响应写入本地数据库，不复制或托管上游地图、武器图片。手动编成目录包含 63 把常规武器和 8 把熊先生印章武器；熊武简中名称来自 Leanny Ver. 11.3.0 语言数据的 `CommonMsg/Weapon/WeaponName_Main`。

Leanny Ver. 11.3.0 参数快照中的 8 个熊武 `_Coop` 文件已纳入部分参数表：`WeaponBlasterBear`、`WeaponChargerBear`、`WeaponManeuverBear`、`WeaponRollerBear`、`WeaponSaberBear`、`WeaponShelterBear`、`WeaponSlosherBear` 和 `WeaponStringerBear`。导入器只接受已在对应对战武器族模型中登记过语义的字段；有显式父类的熊武继续区分父类继承与熊武覆盖。该数据表不直接等于精确 DPS，复杂动作周期仍需单独建模。

打工参数表现已覆盖 63 把常规武器底盘和 8 把熊武，共 71 条记录。常规武器从已核验的对战基础字段出发，只在 `_Coop` 文件显式出现同一路径时应用打工覆盖；N-ZAP85 在固定提交中没有专用 `_Coop` 文件，因此只记录普通基础值，不推测隐藏覆盖。当前纯输出界面仍只启用动作周期已经解释清楚的广域标记枪、窄域标记枪、`.96加仑` 与三发猎鱼弓，比较“理论极限／日常动作基准”；数据入库不会自动扩大为可用 DPS。自由目标实验的 14 组生命值已经逐项对照 Inkipedia 的固定修订版，Leanny 的 `CoopEnemyInfo.json` 用于核对敌人内部身份；该文件不含基础生命值，因此这些 HP 明确标作社区数据页复核，而非 Leanny 参数直接导入。普通无能力回墨曲线、打工三角雷 70% 耗墨／60 帧墨锁和广域标记枪 15 帧射击墨锁已经进入独立证据表，但普通回墨曲线的打工适用性、其他三把首批武器的缺省墨锁，以及鱿鱼滚行空中回墨机制仍未验证。同步／错峰循环因此继续禁用。副武器与特殊武器暂不计算；WAVE、危险度与出怪速率尚未接入，因此不输出持续 DPS、过线或通关结论。具体口径见 [`verification/Salmon-pressure-draft-v11.3.0.md`](verification/Salmon-pressure-draft-v11.3.0.md)，批量导入边界见 [`verification/Salmon-weapon-parameter-import-v11.3.0.md`](verification/Salmon-weapon-parameter-import-v11.3.0.md)。
