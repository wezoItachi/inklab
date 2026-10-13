# 刮水刀命中形态与动作时间轴（Ver. 11.3.0）

核对日期：2026-10-12

## 本轮结论

刮水刀不能用一个“单次伤害”或一个笼统 DPS 表示。INKLAB 将攻击拆为四种独立命中形态：

- 横斩墨刃；
- 横斩近身刀身；
- 蓄力斩墨刃；
- 蓄力斩近身刀身。

近身刀身与墨刃拥有不同的伤害字段和判定时点。当前模型分别展示它们，不把两者相加成一次必然发生的组合伤害。

## 新增的显式时间字段

本轮从 `spl__WeaponSaberParam.SwingParam` 补入：

- `WeakSwingShotBulletFrame`：横斩墨刃释放帧；
- `WeakSwingShotSlashFrame`：横斩刀身判定帧；
- `ChargeSwingShotBulletFrame`：蓄力斩墨刃释放帧；
- `ChargeSwingShotSlashFrame`：蓄力斩刀身判定帧；
- `InkRecoverStop`：横斩回墨锁定帧；
- `InkRecoverStop_ChargeSwing`：蓄力斩回墨锁定帧。

页面可以据此计算“从开始蓄力到释放／判定”的最短时间点：

- `蓄力输入至墨刃释放 = 满蓄力帧 + 蓄力斩墨刃释放帧`
- `蓄力输入至刀身判定 = 满蓄力帧 + 蓄力斩刀身判定帧`

该结果只描述参数时间轴，不包含弹道飞行或玩家实际命中时间。

## 可安全计算的结果

- 每种命中形态对 100 HP 目标所需的独立命中次数；
- 横斩和满蓄力斩的单次耗墨；
- 一箱墨水可完成的横斩／满蓄力斩次数；
- 墨刃释放、刀身判定、挥击阶段、后摇与回墨锁的分项帧数；
- 满蓄力开始输入到两种判定释放点的帧数。

## 为什么暂不输出连续 DPS

`WeakSwingFrame`、`ChargeSwingFrame`、对应释放帧、`PostDelayFrame` 和 `InkRecoverStop` 是同一动作时间轴上的不同控制点，并非已经证明可以顺序相加的独立阶段。直接相加会有重复计时风险。

因此当前不输出横斩连打 DPS、蓄力斩循环 DPS 或混合连段 DPS。后续需要通过实机逐帧录像或可靠的状态机说明，确认下一次输入、下一次伤害判定和可开始回墨的准确边界。

## 仍待验证

- 横斩与蓄力斩的最早再次输入帧、最早再次伤害帧；
- 横移蓄力斩和踏步攻击的时间差；
- 墨刃与刀身在近身重叠时的实际伤害处理；
- 弹道、伤害衰减、有效射程和地形影响；
- 主武器省墨、游速等 AP 曲线；
- 对战参数与鲑鱼跑 `_Coop` 覆盖值之间的差异。

## 来源

- Leanny/splat3 固定提交：`7280ff9cde8bb1c5dcef46c700c326471584d2e6`
- 输入文件：`data/parameter/1130/weapon/WeaponSaber{Normal,Lite,Heavy}.game__GameParameterTable.json`
- 署名：Data provided by Lean
