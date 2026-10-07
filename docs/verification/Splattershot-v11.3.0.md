# 斯普拉射击枪参数核对记录（Ver. 11.3.0）

- INKLAB 武器 ID：`shooter-normalt`
- 上游参数文件：`data/parameter/1130/weapon/WeaponShooterNormal.game__GameParameterTable.json`
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-03
- 核对人：INKLAB 人工核对

## 版本链

Nintendo 的 Ver. 11.3.0 更新说明没有列出斯普拉射击枪的参数调整。本轮直接核对 Leanny 的 `1130` 参数快照，并把上游文件、字段路径和核对日期逐项写入本地表。

## 字段映射

| INKLAB 字段                | 上游字段                      | 原始值 |         本地值 | 处理方式          |
| -------------------------- | ----------------------------- | -----: | -------------: | ----------------- |
| `damagePerShot`            | `DamageParam.ValueMax`        |    360 |      36 damage | 定点伤害值除以 10 |
| `inkConsumptionPerShot`    | `WeaponParam.InkConsume`      | 0.0092 |          0.92% | 比例乘以 100      |
| `groundShotSpreadDegrees`  | `WeaponParam.Stand_DegSwerve` |   4.86 |          4.86° | 直接记录          |
| `jumpShotSpreadDegrees`    | `WeaponParam.Jump_DegSwerve`  |  11.66 |         11.66° | 直接记录          |
| `movementSpeedWhileFiring` | `WeaponParam.MoveSpeed`       |  0.072 | 0.072 internal | 保留内部单位      |

`fireIntervalFrames` 继续为 `pending`：该武器的 11.3.0 文件没有显式包含 `RepeatFrame`。在确认游戏参数结构的默认值来源前，不依据社区常识直接写入数值。

`effectiveRange` 继续为 `pending`：INKLAB 尚未统一“有效射程”的定义与换算方式。

## 分析器行为

分析器按字段依赖逐项开放结果：伤害和耗墨核对后，可以显示满墨射击数、100 HP 击倒弹数与对应耗墨；依赖射击间隔的射击窗口和理论击倒时间继续显示“待验证”。

## 授权边界

本记录用于字段准确性审核。Leanny 已同意项目按 **Data provided by Lean** 并链接其仓库的方式使用所需数据；该记录不表示 INKLAB 拥有或可批量镜像完整上游数据库。
