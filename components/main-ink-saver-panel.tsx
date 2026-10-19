import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { getMainInkSaverAnalysis } from '@/lib/main-ink-saver';
import type { Weapon } from '@/lib/weapons';
import { AbilityIcon } from './ability-icon';

export function MainInkSaverPanel({
  weapon,
  ability,
  ap,
  setAp,
}: {
  weapon: Weapon;
  ability?: Ability;
  ap: number;
  setAp: (ap: number) => void;
}) {
  const analysis = getMainInkSaverAnalysis(weapon.id, ap);
  const primary = analysis.profiles[0];

  if (!primary) {
    return (
      <div className="effect-main generic">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · 当前 {analysis.ap}AP
          </small>
          <strong>主武省墨动作仍待核验</strong>
          <p>
            这把武器目前没有可用于完整动作次数计算的已核对耗墨字段，因此不会套用其他武器的数据。
          </p>
        </div>
        <span>等待字段</span>
      </div>
    );
  }

  const quickAp = [
    ...new Set(
      [3, 6, 10, primary.firstExtraActionAp, primary.nextExtraActionAp].filter(
        (value): value is number => value !== null,
      ),
    ),
  ]
    .filter((value) => value <= 57)
    .sort((left, right) => left - right)
    .slice(0, 5);

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · 当前 {analysis.ap}AP
          </small>
          <strong>
            当前耗墨为基础值的 {(analysis.inkUseMultiplier * 100).toFixed(2)}%
          </strong>
          <p>
            相对 0AP 减少 {analysis.reductionPercent.toFixed(2)}%
            耗墨。曲线收益立即生效；是否多出完整动作，则取决于这把武器的基础耗墨。
          </p>
        </div>
        <span>曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>当前分析动作</small>
          <b>{primary.label}</b>
          <span>
            {primary.baseInkCost.toFixed(3)}% →{' '}
            {primary.adjustedInkCost.toFixed(3)}%
          </span>
        </div>
        <div>
          <small>满墨完整动作</small>
          <b>
            {primary.baseActionsPerTank} → {primary.adjustedActionsPerTank}
          </b>
          <span>
            {primary.extraActionsPerTank > 0
              ? `增加 ${primary.extraActionsPerTank} 次`
              : '尚未跨过整数临界点'}
          </span>
        </div>
        <div>
          <small>下一完整动作</small>
          <b>
            {primary.nextExtraActionAp === null
              ? '已到当前上限'
              : `${primary.nextExtraActionAp}AP`}
          </b>
          <span>
            {primary.firstExtraActionAp === null
              ? '无可用临界点'
              : `首个临界点 ${primary.firstExtraActionAp}AP`}
          </span>
        </div>
      </div>
      {analysis.profiles.length > 1 && (
        <div className="ink-action-list">
          <b>同武器的其他已核对动作</b>
          {analysis.profiles.slice(1).map((profile) => (
            <span key={profile.key}>
              <strong>{profile.label}</strong>
              <em>{profile.adjustedInkCost.toFixed(3)}% / 次</em>
              <small>{profile.adjustedActionsPerTank} 次 / 满墨</small>
            </span>
          ))}
        </div>
      )}
      <div className="breakpoints">
        {quickAp.map((value) => (
          <button
            className={analysis.ap === value ? 'active' : ''}
            onClick={() => setAp(value)}
            key={value}
          >
            <b>{value}AP</b>
            <small>
              {value === primary.firstExtraActionAp
                ? '首个完整动作'
                : value === primary.nextExtraActionAp
                  ? '下个临界点'
                  : '查看曲线'}
            </small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        {primary.extraActionsPerTank > 0
          ? `${analysis.ap}AP 已让${primary.label}在满墨状态下增加 ${primary.extraActionsPerTank} 次。`
          : `${analysis.ap}AP 已降低单次耗墨，但还没有让${primary.label}多出一个完整次数。`}
      </p>
      <p className="effect-source">
        <Check size={13} />
        能力曲线按《喷射战士 3》主武省墨表核对；基础耗墨来自 Leanny Ver. 11.3.0
        固定快照。未计入最后冲刺、回归或其他临时能力。
      </p>
    </>
  );
}
