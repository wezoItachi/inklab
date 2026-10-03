# 窄域标记枪参数核对记录（Ver. 11.3.0）

- INKLAB 武器 ID：`shooter-precision`
- 上游武器行：`Shooter_Precision_00`
- 上游参数文件：`data/parameter/1130/weapon/WeaponShooterPrecision.game__GameParameterTable.json`
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-03
- 核对人：INKLAB 人工核对

## 身份修正

旧代表数据使用了 `shooter-short-cstm11` / “窄域标记枪 新型”的身份，但同时配置爆炸泼桶与螃蟹坦克。上游 `WeaponInfoMain` 证明该套装对应基础款 `Shooter_Precision_00`（窄域标记枪），而不是新型窄域标记枪。当前数据已统一修正为 `shooter-precision` / “窄域标记枪”。

旧分享链接和浏览器存档中的 `shooter-short-cstm11` 会在读取时迁移到新 ID，重新保存或复制时只输出新 ID。

## 字段映射

| INKLAB 字段                | 上游字段                      | 原始值 |         本地值 | 处理方式          |
| -------------------------- | ----------------------------- | -----: | -------------: | ----------------- |
| `damagePerShot`            | `DamageParam.ValueMax`        |    280 |      28 damage | 定点伤害值除以 10 |
| `fireIntervalFrames`       | `WeaponParam.RepeatFrame`     |      5 |       5 frames | 直接记录          |
| `inkConsumptionPerShot`    | `WeaponParam.InkConsume`      |  0.008 |           0.8% | 比例乘以 100      |
| `groundShotSpreadDegrees`  | `WeaponParam.Stand_DegSwerve` |    0.0 |             0° | 直接记录          |
| `jumpShotSpreadDegrees`    | `WeaponParam.Jump_DegSwerve`  |    0.0 |             0° | 直接记录          |
| `movementSpeedWhileFiring` | `WeaponParam.MoveSpeed`       |  0.072 | 0.072 internal | 保留内部单位      |

`effectiveRange` 继续为 `pending`：INKLAB 尚未统一“有效射程”的定义与换算方式。

## 授权边界

本记录用于字段准确性审核，不代表 Leanny 已授权再发布其完整数据库。授权状态继续保持 `pending`；项目不得据此批量镜像或公开上游数据。
