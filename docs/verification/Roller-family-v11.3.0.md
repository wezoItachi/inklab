# 滚筒类别参数核对记录（Ver. 11.3.0）

- 武器范围：全部 14 把滚筒
- 上游目录：`data/parameter/1130/weapon/WeaponRoller*.game__GameParameterTable.json`
- 使用参数类：5 份（排除 `_Coop` 文件）
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 核对日期：2026-10-08
- 导入报告：`database/roller-parameter-import-report.v11.3.0.json`

## 字段分层

横挥、竖挥与滚动使用不同的参数结构。横挥和竖挥的伤害、内部阶段与耗墨分别记录，避免在可变式滚筒等武器上错误假设两种挥击耗墨相同。

| 分组 | 上游字段 | 处理方式 |
| --- | --- | --- |
| 横挥伤害 | `WideSwingUnitGroupParam.DamageParam.Inside.DamageMaxValue` | 定点伤害值除以 10 |
| 横挥内部阶段 | `WeaponWideSwingParam.SwingFrame` | 直接记录，不等同于完整间隔 |
| 横挥耗墨 | `WeaponWideSwingParam.InkConsume` | 比例乘以 100 |
| 竖挥伤害 | `VerticalSwingUnitGroupParam.DamageParam.Inside.DamageMaxValue` | 定点伤害值除以 10 |
| 竖挥内部阶段 | `WeaponVerticalSwingParam.SwingFrame` | 直接记录，不等同于完整间隔 |
| 竖挥耗墨 | `WeaponVerticalSwingParam.InkConsume` | 比例乘以 100 |
| 碾压伤害 | `BodyParam.Damage` | 定点伤害值除以 10 |
| 滚动耗墨 | `WeaponRollParam.InkConsumeMinPerFrame` / `MaxPerFrame` | 比例乘以 100 |
| 滚动速度 | `WeaponRollParam.SpeedNormal` / `SpeedDash` | 保留内部每帧单位 |

## 仍待验证

- `SwingFrame` 只描述内部挥击阶段，不能直接当作连续输入的完整挥击间隔。
- 横挥和竖挥的完整动作循环需要解析起手、后摇与输入窗口后再记录。
- 伤害值是近端最大值，不代表全部距离与命中位置。
- 主武器省墨、移动速度等 AP 效果曲线不属于本次基础参数导入范围。

## 授权边界

本记录用于字段准确性审核。Leanny 已同意项目按 **Data provided by Lean** 并链接其仓库的方式使用所需数据；INKLAB 仅保存产品使用的规范化字段、来源路径和输入哈希，不镜像完整上游参数目录。
