# 桶装旋转枪参数核对记录（Ver. 11.3.0）

- INKLAB 武器 ID：`spinner-standardt`
- 上游参数文件：`data/parameter/1130/weapon/WeaponSpinnerStandard.game__GameParameterTable.json`
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-03
- 核对人：INKLAB 人工核对

## 字段映射

| INKLAB 字段               | 上游字段                                             |  原始值 |     本地值 | 处理方式                           |
| ------------------------- | ---------------------------------------------------- | ------: | ---------: | ---------------------------------- |
| `damagePerShot`           | `DamageParam.ValueFullChargeMax`                     |     300 |  30 damage | 定点伤害值除以 10                  |
| `fullChargeFrames`        | `WeaponParam.ChargeFrame_First + ChargeFrame_Second` | 48 + 72 | 120 frames | 将完成两个连续蓄力阶段定义为满蓄力 |
| `firingDurationFrames`    | `WeaponParam.MaxShootingFrame_Second`                |     160 | 160 frames | 采用第二阶段满蓄力后的最大射击窗口 |
| `fireIntervalFrames`      | `WeaponParam.RepeatFrame`                            |       4 |   4 frames | 直接记录射击重复间隔               |
| `inkConsumptionPerCharge` | `WeaponParam.InkConsume`                             |   0.225 |      22.5% | 比例乘以 100                       |

`effectiveRange` 继续为 `pending`：当前文件没有可直接等同于界面“有效射程”的单一字段，不从弹速、伤害衰减帧或涂墨尺寸反推。

## 分析器行为

满蓄力需要 120 帧（2 秒），随后提供 160 帧（约 2.67 秒）的最大射击窗口。固定上游参数只给出 `MaxShootingFrame_Second = 160` 与 `RepeatFrame = 4`，没有定义首发位于窗口第 0 帧还是第 4 帧，也没有定义末端是否包含。因此 INKLAB 仅在窗口可被间隔整除时展示 `160 / 4 = 40` 发；该结果对这两种常见端点解释相同，但仍标记为待实机验证，不把除法本身当作游戏时序证据。非整除窗口不推导射击数。

每发 30 伤害，对 100 HP 目标需要 4 发；从首发到第 4 发的间隔和为 12 帧（0.2 秒），这不包含首发前隙或弹道飞行时间。每次满蓄力消耗 22.5% 墨，满墨可完成 4 次满蓄力。

这些结果不计入蓄力中断、伤害衰减、弹道飞行、墨水回复或主武器省墨能力，也不把内部射击窗口解释为实战持续命中时间。

## 授权边界

本记录用于字段准确性审核。Leanny 已同意项目按 **Data provided by Lean** 并链接其仓库的方式使用所需数据；该记录不表示 INKLAB 拥有或可批量镜像完整上游数据库。
