# 主武器省墨 AP 曲线核对记录（Ver. 11.3.0）

## 结论

INKLAB 已接入第一条正式 AP 效果曲线：提升墨汁效率（主要武器）。曲线与武器基础耗墨分开维护，只有基础耗墨字段标记为 `verified` 的动作才显示完整动作次数与临界点。

## 计算口径

- AP：`10 × 主技能数 + 3 × 追加技能数`，范围 0–57。
- 标准能力强度：`min(3.3 × AP - 0.027 × AP², 100) / 100`。
- 主武耗墨倍率：`1 - 0.45 × 标准能力强度`。
- 调整后单次耗墨：`基础耗墨 × 主武耗墨倍率`。
- 满墨完整动作数：`floor(100 / 调整后单次耗墨)`。

因此 0 AP 的耗墨倍率为 100%，3 AP 为 95.65435%，57 AP 为 55%。数学上的耗墨降低从首次投入即生效，但 INKLAB 另行计算“满墨多出一个完整动作”的武器专属临界点。

## 来源

- 武器基础耗墨：[`Leanny/splat3`](https://github.com/Leanny/splat3)，固定提交 `7280ff9cde8bb1c5dcef46c700c326471584d2e6`，署名 **Data provided by Lean**。
- 《喷射战士 3》主武省墨堆叠表：[Inkipedia — Ink Saver (Main)](<https://splatoonwiki.org/wiki/Ink_Saver_(Main)>)。
- 能力用途说明：[Nintendo — Beginner Basics: Choosing the right gear](https://splatoon.nintendo.com/en/news/beginner-basics-for-splatoon-3-choosing-the-right-gear/)。
- 核对日期：2026-10-14。

## 当前边界

- 最后冲刺、回归等临时附加 AP 暂不叠加。
- 连续动作只按已核对的单次／单蓄力耗墨换算，不加入回墨、墨锁、后摇或移动时间。
- 滚筒滚动等“每帧耗墨”字段不伪装成完整动作次数。
- 未核对基础耗墨的动作继续显示等待字段，不从同类武器继承。
