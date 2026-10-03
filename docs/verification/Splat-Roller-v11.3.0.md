# 斯普拉滚筒参数核对记录（Ver. 11.3.0）

- INKLAB 武器 ID：`roller-normalt`
- 上游参数文件：`data/parameter/1130/weapon/WeaponRollerNormal.game__GameParameterTable.json`
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-03
- 核对人：INKLAB 人工核对

## 字段映射

| INKLAB 字段                     | 上游字段                                                        | 原始值 |               本地值 | 处理方式                   |
| ------------------------------- | --------------------------------------------------------------- | -----: | -------------------: | -------------------------- |
| `horizontalSwingDamageMax`      | `WideSwingUnitGroupParam.DamageParam.Inside.DamageMaxValue`     |   1500 |           150 damage | 定点伤害值除以 10          |
| `inkConsumptionPerSwing`        | `WeaponWideSwingParam.InkConsume`                               |  0.085 |                 8.5% | 比例乘以 100；竖挥字段相同 |
| `verticalSwingDamageMax`        | `VerticalSwingUnitGroupParam.DamageParam.Inside.DamageMaxValue` |   1500 |           150 damage | 定点伤害值除以 10          |
| `rollDamageMax`                 | `BodyParam.Damage`                                              |   1250 |           125 damage | 定点伤害值除以 10          |
| `rollInkConsumptionMinPerFrame` | `WeaponRollParam.InkConsumeMinPerFrame`                         | 0.0002 |        0.02% / frame | 比例乘以 100               |
| `rollInkConsumptionMaxPerFrame` | `WeaponRollParam.InkConsumeMaxPerFrame`                         |  0.001 |         0.1% / frame | 比例乘以 100               |
| `rollSpeedNormal`               | `WeaponRollParam.SpeedNormal`                                   |  0.108 | 0.108 internal/frame | 保留内部单位               |
| `rollSpeedDash`                 | `WeaponRollParam.SpeedDash`                                     |  0.132 | 0.132 internal/frame | 保留内部单位               |

`horizontalSwingFrames` 继续为 `pending`：文件里的 `WeaponWideSwingParam.SwingFrame=21` 是内部挥击阶段，不应在没有确认完整动作结构前直接当作连续横挥间隔。

## 分析器行为

满墨状态可完成 11 次横挥或竖挥。按近距离最高伤害计算，横挥、竖挥和碾压都可对 100 HP 目标一击击倒；这不代表所有距离和命中位置都能造成相同伤害。

滚动耗墨会随速度在每帧 0.02% 至 0.1% 之间变化。以 60 帧计算，单纯按该范围推算的满墨连续滚动窗口约为 16.67 至 83.33 秒；未计入起手挥击、墨水回复和主武器省墨能力。

## 授权边界

本记录用于字段准确性审核，不代表 Leanny 已授权再发布其完整数据库。授权状态继续保持 `pending`；项目不得据此批量镜像或公开上游数据。
