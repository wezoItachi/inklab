import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { getSubInkSaverAnalysis } from '@/lib/sub-ink-saver';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function SubInkSaverPanel({
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
  const analysis = getSubInkSaverAnalysis(weapon, ap);
  if (!analysis) {
    return (
      <div className="effect-main generic">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · {weapon.sub.name}
          </small>
          <strong>副武省墨参数仍待核验</strong>
          <p>当前副武器缺少基础耗墨或曲线档位，因此不套用其他副武器的数据。</p>
        </div>
        <span>等待字段</span>
      </div>
    );
  }

  const quickAp = [
    ...new Set(
      [3, 6, 10, analysis.firstExtraUseAp, analysis.nextExtraUseAp].filter(
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
            {weapon.name} · {weapon.sub.name} · 副省档位 Lv{analysis.level}
          </small>
          <strong>
            当前耗墨为基础值的 {(analysis.multiplier * 100).toFixed(2)}%
          </strong>
          <p>
            {analysis.ap}AP 相对 0AP 减少 {analysis.reductionPercent.toFixed(2)}
            % 耗墨；完整使用次数按当前墨水槽容量计算。
          </p>
        </div>
        <span>曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>单次副武耗墨</small>
          <b>
            {analysis.baseInkCost.toFixed(2)} →{' '}
            {analysis.adjustedInkCost.toFixed(2)}
          </b>
          <span>当前墨水槽占比 {analysis.adjustedTankPercent.toFixed(2)}%</span>
        </div>
        <div>
          <small>满墨完整使用</small>
          <b>
            {analysis.baseUsesPerTank} → {analysis.adjustedUsesPerTank}
          </b>
          <span>
            {analysis.extraUsesPerTank > 0
              ? `增加 ${analysis.extraUsesPerTank} 次`
              : '尚未跨过整数临界点'}
          </span>
        </div>
        <div>
          <small>下一完整使用</small>
          <b>
            {analysis.nextExtraUseAp === null
              ? '已到当前上限'
              : `${analysis.nextExtraUseAp}AP`}
          </b>
          <span>
            {analysis.firstExtraUseAp === null
              ? '57AP 内无临界点'
              : `首个临界点 ${analysis.firstExtraUseAp}AP`}
          </span>
        </div>
      </div>
      {analysis.tankCapacity !== 100 && (
        <p className="effect-boundary">
          {weapon.name} 使用 {analysis.tankCapacity}% 容量墨水槽；因此基础耗墨
          {analysis.baseInkCost}% 相当于当前整槽的{' '}
          {analysis.baseTankPercent.toFixed(2)}%。
        </p>
      )}
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
            <small>
              {value === analysis.firstExtraUseAp
                ? '首个完整使用'
                : value === analysis.nextExtraUseAp
                  ? '下个临界点'
                  : '查看曲线'}
            </small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        {analysis.ap === 0
          ? `当前为 0AP，${weapon.sub.name}保持基础耗墨与满墨 ${analysis.baseUsesPerTank} 次完整使用。`
          : analysis.extraUsesPerTank > 0
            ? `${analysis.ap}AP 已让${weapon.sub.name}在满墨状态下增加 ${analysis.extraUsesPerTank} 次完整使用。`
            : `${analysis.ap}AP 已降低${weapon.sub.name}的单次耗墨，但尚未多出一个完整使用次数。`}
      </p>
      <p className="effect-source">
        <Check size={13} />
        基础耗墨与副省档位来自 Leanny Ver. 12.0.0 固定快照；五档倍率与插值方式经
        Sendou.ink 公开分析器实现交叉核对。Lv0–Lv4
        是内部耗墨曲线档位，不是玩家等级。
      </p>
    </>
  );
}
