# N-ZAP89 参数核对记录（Ver. 11.3.0）

- INKLAB 武器 ID：`shooter-quickmiddle-cstm01`
- 上游参数文件：`data/parameter/1130/weapon/WeaponShooterQuickMiddle.game__GameParameterTable.json`
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-09-27
- 核对人：INKLAB 人工核对

## 版本链

Nintendo 的 Ver. 11.3.0 更新说明未列出 N-ZAP85 / N-ZAP89 的主武器参数调整。Ver. 11.2.0 对两者的调整是让墨水更容易落在玩家脚边，不影响本次写入的六个字段。因此这些字段直接核对 Leanny 的 `1130` 参数快照，并把上游文件、字段路径和核对日期逐项写入本地表。

## 字段映射

| INKLAB 字段                | 上游字段                      | 原始值 |         本地值 | 处理方式          |
| -------------------------- | ----------------------------- | -----: | -------------: | ----------------- |
| `damagePerShot`            | `DamageParam.ValueMax`        |    300 |      30 damage | 定点伤害值除以 10 |
| `fireIntervalFrames`       | `WeaponParam.RepeatFrame`     |      5 |       5 frames | 直接记录          |
| `inkConsumptionPerShot`    | `WeaponParam.InkConsume`      |  0.008 |           0.8% | 比例乘以 100      |
| `groundShotSpreadDegrees`  | `WeaponParam.Stand_DegSwerve` |   4.75 |          4.75° | 直接记录          |
| `jumpShotSpreadDegrees`    | `WeaponParam.Jump_DegSwerve`  |   12.0 |            12° | 直接记录          |
| `movementSpeedWhileFiring` | `WeaponParam.MoveSpeed`       |  0.088 | 0.088 internal | 保留内部单位      |

`effectiveRange` 继续为 `pending`：当前还没有确定 INKLAB 的“有效射程”是按最大伤害距离、伤害衰减起点、弹丸寿命还是界面单位表达。定义和换算测试完成前不写入数值。

## 授权边界

本记录用于字段准确性审核，不代表 Leanny 已授权再发布其完整数据库。`database/sources.json` 和 `database/manifest.json` 中的授权状态继续保持 `pending`；项目不得据此批量镜像或公开上游数据。
