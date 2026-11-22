import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeEnemyInkResistance } from '@/lib/enemy-ink-resistance';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function EnemyInkResistancePanel({
  weapon,
  ability,
  ap,
  setAp,
  isPreview,
  equippedAp,
  clearPreview,
}: {
  weapon: Weapon;
  ability?: Ability;
  ap: number;
  setAp: (ap: number) => void;
  isPreview: boolean;
  equippedAp: number;
  clearPreview: () => void;
}) {
  const analysis = analyzeEnemyInkResistance(ap);
  const quickAp = [3, 6, 10, 20, 30, 57];

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>{weapon.name} · 对手墨汁影响 · 60 帧制</small>
          <strong>敌墨走速 {analysis.runSpeed.toFixed(3)} 单位/帧</strong>
          <p>
            走速、开始受伤前缓冲、持续伤害和累计伤害上限分别计算，不合并成单一“抗性百分比”。
          </p>
        </div>
        <span>四项曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>敌墨中的走速</small>
          <b>0.240 → {analysis.runSpeed.toFixed(3)}</b>
          <span>{analysis.runSpeedPerSecond.toFixed(1)} 单位/秒</span>
        </div>
        <div>
          <small>开始受伤前缓冲</small>
          <b>{analysis.graceFrames} 帧</b>
          <span>{analysis.graceSeconds.toFixed(2)} 秒</span>
        </div>
        <div>
          <small>敌墨持续伤害</small>
          <b>{analysis.damagePerSecond.toFixed(1)} / 秒</b>
          <span>{analysis.damagePerFrame.toFixed(3)} / 帧</span>
        </div>
        <div>
          <small>累计伤害上限</small>
          <b>{analysis.damageLimit.toFixed(1)}</b>
          <span>只表示敌墨自身可累积的伤害</span>
        </div>
      </div>
      <p className="effect-boundary">
        本页计算的是站入对手墨汁后的玩家参数；武器射击中的敌墨走速、跳跃速度和与其他伤害同时发生时的实战结果仍需单独建模。
      </p>
      <div className="ap-preview-label">
        <div>
          <span>{isPreview ? `正在试算 ${analysis.ap}AP` : 'AP 曲线试算'}</span>
          <small>
            配装值 {equippedAp}AP · 只更新右侧结果，不修改左侧 57AP 配装
          </small>
        </div>
        {isPreview ? (
          <button type="button" onClick={clearPreview}>
            恢复配装值
          </button>
        ) : null}
      </div>
      <div className="breakpoints">
        {quickAp.map((value) => (
          <button
            type="button"
            className={analysis.ap === value ? 'active' : ''}
            onClick={() => setAp(value)}
            key={value}
          >
            <b>{value}AP</b>
            <small>{value === 3 ? '最小有效值' : '查看曲线'}</small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        {analysis.ap > 0
          ? `${analysis.ap}AP 下敌墨走速提升 ${analysis.runSpeedGainPercent.toFixed(1)}%，开始受伤前有 ${analysis.graceFrames} 帧缓冲。`
          : '当前未投入粘脚，进入敌墨后立即按基础伤害与移动参数生效。'}
      </p>
      <p className="effect-source">
        <Check size={13} />
        四组三点值来自 Leanny Ver. 12.0.0 固定快照，并经 Sendou.ink
        公开分析器实现交叉核对。数值用于说明参数边界，不等同于实战存活时间。
      </p>
    </>
  );
}
