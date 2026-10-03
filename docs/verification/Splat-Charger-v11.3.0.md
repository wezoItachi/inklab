# 斯普拉蓄力狙击枪参数核对记录（Ver. 11.3.0）

- INKLAB 武器 ID：`charger-normalt`
- 上游参数文件：`data/parameter/1130/weapon/WeaponChargerNormal.game__GameParameterTable.json`
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-03
- 核对人：INKLAB 人工核对

## 字段映射

| INKLAB 字段                | 上游字段                                    | 原始值 |          本地值 | 处理方式                   |
| -------------------------- | ------------------------------------------- | -----: | --------------: | -------------------------- |
| `fullChargeDamage`         | `DamageParam.ValueFullCharge`               |   1600 |      160 damage | 定点伤害值除以 10          |
| `inkConsumptionPerCharge`  | `WeaponParam.InkConsumeFullCharge`          |   0.18 |             18% | 比例乘以 100               |
| `chargeHold`               | `WeaponKeepChargeParam.$type`               |   存在 |            true | 参数块存在表示支持储存蓄力 |
| `chargeHoldFrames`         | `WeaponKeepChargeParam.KeepChargeFullFrame` |     75 |       75 frames | 直接记录                   |
| `fullChargeTravelDistance` | `MoveParam.DistanceFullCharge`              | 24.037 | 24.037 internal | 保留内部单位               |

`fullChargeFrames` 继续为 `pending`：该武器的 11.3.0 文件没有显式包含满蓄力所需帧数。确认参数结构的默认值来源前，不依据社区常识直接写入数值。

`effectiveRange` 继续为 `pending`：`DistanceFullCharge` 被单独记录为弹道距离，不直接冒充界面“有效射程”。

## 分析器行为

满墨状态可以完成 5 次满蓄力；对 100 HP 目标，满蓄力单发击倒并消耗 18% 墨。满蓄力可以储存 75 帧，即 1.25 秒。依赖蓄力时间的输出继续显示“待验证”。

## 授权边界

本记录用于字段准确性审核，不代表 Leanny 已授权再发布其完整数据库。授权状态继续保持 `pending`；项目不得据此批量镜像或公开上游数据。
