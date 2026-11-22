import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeSpecialCharge, analyzeSpecialSaver } from '@/lib/special-gauge';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

type SpecialGaugeAbilityId = 'scu' | 'ss';

export function SpecialGaugePanel({
  weapon,
  ability,
  abilityId,
  ap,
  setAp,
  isPreview,
  equippedAp,
  clearPreview,
  hasRespawnPunisher,
}: {
  weapon: Weapon;
  ability?: Ability;
  abilityId: SpecialGaugeAbilityId;
  ap: number;
  setAp: (ap: number) => void;
  isPreview: boolean;
  equippedAp: number;
  clearPreview: () => void;
  hasRespawnPunisher: boolean;
}) {
  const isCharge = abilityId === 'scu';
  const charge = analyzeSpecialCharge(weapon.id, ap);
  const saver = analyzeSpecialSaver(ap, { hasRespawnPunisher });
  const quickAp = [3, 6, 10, 20, 30, 57];

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · {weapon.special} · 当前 {ap}AP
          </small>
          <strong>
            {isCharge
              ? `必要点数 ${charge.requiredPoints}p`
              : `被击倒损失 ${saver.currentLossPercent.toFixed(1)}%`}
          </strong>
          <p>
            {isCharge
              ? '按当前武器套装的特殊武器必要点数计算，不使用全武器统一示例。'
              : '只计算被击倒后的特殊武器槽损失；复活惩罚的双方效果独立列出。'}
          </p>
        </div>
        <span>曲线与套装点数已核对</span>
      </div>
      {isCharge ? (
        <div className="ink-saver-metrics">
          <div>
            <small>基础必要点数</small>
            <b>{charge.basePoints}p</b>
            <span>当前武器套装固定值</span>
          </div>
          <div>
            <small>当前必要点数</small>
            <b>{charge.requiredPoints}p</b>
            <span>向上取整到完整点数</span>
          </div>
          <div>
            <small>减少点数</small>
            <b>{charge.savedPoints}p</b>
            <span>
              {charge.reductionPercent.toFixed(1)}% · 倍率{' '}
              {charge.multiplier.toFixed(3)}
            </span>
          </div>
        </div>
      ) : (
        <div className="ink-saver-metrics">
          <div>
            <small>标准被击倒</small>
            <b>损失 {saver.standardLossPercent.toFixed(1)}%</b>
            <span>保留 {saver.standardRetainedPercent.toFixed(1)}%</span>
          </div>
          <div>
            <small>
              {hasRespawnPunisher ? '当前配装含复活惩罚' : '当前配装'}
            </small>
            <b>损失 {saver.currentLossPercent.toFixed(1)}%</b>
            <span>保留 {saver.currentRetainedPercent.toFixed(1)}%</span>
          </div>
          <div>
            <small>若被复活惩罚击倒</small>
            <b>损失 {saver.splattedByRespawnPunisherLossPercent.toFixed(1)}%</b>
            <span>
              保留 {saver.splattedByRespawnPunisherRetainedPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
      <p className="effect-boundary">
        {isCharge
          ? '特殊武器增加量不会提高涂墨本身的点数产出，只会降低充满当前特殊武器槽所需的有效点数。'
          : '复活惩罚由击倒者与被击倒者的装备状态决定；页面展示标准、当前自身装备和被复活惩罚击倒三种边界，不假设对手每次都装备该能力。'}
      </p>
      <div className="ap-preview-label">
        <div>
          <span>{isPreview ? `正在试算 ${ap}AP` : 'AP 曲线试算'}</span>
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
            className={ap === value ? 'active' : ''}
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
        {isCharge
          ? `${ap}AP 令当前套装充满特殊武器槽少需 ${charge.savedPoints}p。`
          : `${ap}AP 下标准被击倒后保留 ${saver.standardRetainedPercent.toFixed(1)}% 特殊武器槽。`}
      </p>
      <p className="effect-source">
        <Check size={13} />
        能力三点值与 174 套武器的必要点数来自 Leanny Ver. 12.0.0 固定快照，并经
        Sendou.ink 公开分析器实现交叉核对。
      </p>
    </>
  );
}
