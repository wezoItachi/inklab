# 射击枪类别参数核对记录（Ver. 11.3.0）

- 武器范围：全部 40 把射击枪
- 上游目录：`data/parameter/1130/weapon/WeaponShooter*.game__GameParameterTable.json`
- 使用参数类：14 份（排除 `_Coop` 文件）
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 初次核对：2026-10-07
- 射程证据补充核对：2026-10-26
- 导入报告：`database/parameter-import-report.v11.3.0.json`

## 映射原则

同一主武器型号的不同套装和复制外观通过 `upstreamRowId` 的类别段映射到同一份 `SpecActor` 参数类。例如 `Shooter_Normal_00`、`Shooter_Normal_01` 和复制外观都使用 `WeaponShooterNormal`。脚本只读取 11.3.0 参数文件中显式存在的字段，并为每份输入保存 SHA-256；不会从社区常识或同类武器推断缺省值。

| INKLAB 字段 | 上游字段 | 规范化 |
| --- | --- | --- |
| `damagePerShot` | `DamageParam.ValueMax` | 定点伤害值除以 10 |
| `fireIntervalFrames` | `WeaponParam.RepeatFrame` | 仅显式存在时记录 |
| `inkConsumptionPerShot` | `WeaponParam.InkConsume` | 比例乘以 100 |
| `damageFalloffStartFrames` | `DamageParam.ReduceStartFrame` | 直接记录；不换算为距离 |
| `damageFalloffEndFrames` | `DamageParam.ReduceEndFrame` | 直接记录；不当作弹丸寿命 |
| `projectileSpawnSpeed` | `MoveParam.SpawnSpeed` | 保留内部单位 |
| `groundShotSpreadDegrees` | `WeaponParam.Stand_DegSwerve` | 直接记录 |
| `jumpShotSpreadDegrees` | `WeaponParam.Jump_DegSwerve` | 直接记录 |
| `movementSpeedWhileFiring` | `WeaponParam.MoveSpeed` | 保留内部单位 |

## 仍待验证

- `WeaponShooterNormal` 没有显式 `RepeatFrame`，对应武器的射击间隔继续为空，直到默认参数来源可以被完整解析。
- 14 个参数类都已补入开始／结束衰减帧和弹丸初速，界面将它们作为“射程基础证据”展示；`effectiveRange` 仍为空，因为完整距离还取决于后续运动阶段、重力和产品定义，不能用“初速 × 帧数”直接冒充。
- 行动强化、人类移动速度提升、主武器省墨等 AP 曲线不属于本次基础参数导入范围。

## 授权边界

本记录用于字段准确性审核。Leanny 已同意项目按 **Data provided by Lean** 并链接其仓库的方式使用所需数据；INKLAB 仅保存产品使用的规范化字段、来源路径和输入哈希，不镜像完整上游参数目录。
