# 蓄力枪类别参数核对｜Ver. 11.3.0

- 核对日期：2026-10-08
- 上游来源：[`Leanny/splat3`](https://github.com/Leanny/splat3)
- 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 数据署名：**Data provided by Lean**
- 导入报告：`database/charger-parameter-import-report.v11.3.0.json`

## 覆盖范围

覆盖目录中的 19 把蓄力枪，对应 8 个共享参数类：Normal、NormalScope、Quick、Long、LongScope、Light、Keeper 与 Pencil。

每把武器仅导入自身参数文件明确给出的字段：满蓄力伤害、满蓄力耗墨、满蓄力弹道距离；`ChargeFrameFullCharge` 存在时导入满蓄力帧数；`WeaponKeepChargeParam` 存在时确认支持储存蓄力并记录储存窗口。

伤害定点值除以 10，耗墨比例乘以 100。共享同一参数类的套装变体复用相同上游文件，但每条规范化记录仍保留字段级来源路径。

## 有意保持待验证

- 参数文件没有显式写出的满蓄力时间不会从其他蓄力枪借值。
- 缺少 `WeaponKeepChargeParam` 不直接写成“不支持储存蓄力”，相关字段继续为空。
- `DistanceFullCharge` 只作为内部弹道距离，不等同于界面有效射程。
- 主武器省墨 AP 曲线、蓄力过程中伤害变化、空中蓄力修正和连续动作周期仍未建模。

因此，本轮可以展示来源明确的基础效率和局部时间结果，但不输出最佳 AP、最佳射程或打法结论。
