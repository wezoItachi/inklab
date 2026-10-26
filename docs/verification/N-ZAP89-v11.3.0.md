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

`effectiveRange` 继续为 `pending`：INKLAB 已将射击枪拆成最远直击与开始伤害衰减两条边界。弹丸后续运动、训练场换算和受控实测完成前不写入数值。

## 授权边界

本记录用于字段准确性审核。Leanny 已同意项目按 **Data provided by Lean** 并链接其仓库的方式使用所需数据；该记录不表示 INKLAB 拥有或可批量镜像完整上游数据库。
