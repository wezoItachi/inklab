# 爆破枪类别参数核对记录（Ver. 11.3.0）

- 武器范围：全部 17 把爆破枪
- 上游目录：`data/parameter/1130/weapon/WeaponBlaster*.game__GameParameterTable.json`
- 使用参数类：7 份（排除 `_Coop` 文件）
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-08
- 导入报告：`database/blaster-parameter-import-report.v11.3.0.json`

## 字段分层

爆破枪不能复用普通射击枪的单一伤害模型。本轮分别记录直击伤害，以及 `BlastParam.DistanceDamage` 的第一个和最后一个爆风伤害控制点及其内部距离值。距离控制点用于描述上游伤害曲线，不直接宣称为完整爆炸半径。

| INKLAB 字段 | 上游字段 | 规范化 |
| --- | --- | --- |
| `directHitDamage` | `DamageParam.ValueMax` | 定点伤害值除以 10 |
| `nearBlastDamage` | `BlastParam.DistanceDamage[0].Damage` | 定点伤害值除以 10 |
| `farBlastDamage` | `BlastParam.DistanceDamage[last].Damage` | 定点伤害值除以 10 |
| `nearBlastDistance` | `BlastParam.DistanceDamage[0].Distance` | 保留内部单位 |
| `farBlastDistance` | `BlastParam.DistanceDamage[last].Distance` | 保留内部单位 |
| `burstFrame` | `BlasterBurstParam.BurstFrame` | 仅显式存在时记录 |
| `fireIntervalFrames` | `WeaponParam.RepeatFrame` | 直接记录 |
| `inkConsumptionPerShot` | `WeaponParam.InkConsume` | 比例乘以 100 |

地面／跳跃扩散和射击时移动速度也按显式字段保存。S-BLAST 的参数文件额外提供 `BlastJumpParam`，因此独立保存跳跃射击的近端、远端爆风伤害与距离控制点，不拿标准射击曲线代替。

## 仍待验证

- 火热爆破枪参数类没有显式 `BurstFrame`，在默认参数来源解析完成前保持为空。
- 有效射程需要结合弹丸移动、爆炸发生帧和爆风曲线重新定义。
- 距离控制点到游戏画面射程、完整爆炸半径的换算尚未完成。
- 行动强化、主武器省墨等 AP 效果曲线不属于本次基础参数导入范围。

## 授权边界

本记录用于字段准确性审核。Leanny 已同意项目按 **Data provided by Lean** 并链接其仓库的方式使用所需数据；INKLAB 仅保存产品使用的规范化字段、来源路径和输入哈希，不镜像完整上游参数目录。
