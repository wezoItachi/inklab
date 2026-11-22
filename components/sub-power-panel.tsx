import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeSubPower } from '@/lib/sub-power';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

const quickAp = [3, 6, 10, 20, 30, 57];

function formatValue(value: number, unit: string) {
  const formatted = Number.isInteger(value) ? `${value}` : value.toFixed(2);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function SubPowerPanel({
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
  const result = analyzeSubPower(weapon.sub.id, ap);
  if (!result)
    return <p className="parameter-public-note">当前副武器参数待核验。</p>;
  const primary = result.metrics[0];

  return (
    <>
      <div className="effect-main sub-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · 当前副武器：{weapon.sub.name}
          </small>
          <strong>
            {primary.label} {formatValue(primary.value, primary.unit)}
          </strong>
          <p>只显示当前副武器真正拥有的参数，不沿用其他副武器的作用说明。</p>
        </div>
        <span>{result.metrics.length} 项参数已核对</span>
      </div>
      <div className="ink-saver-metrics">
        {result.metrics.map((metric) => (
          <div key={metric.key}>
            <small>{metric.label}</small>
            <b>{formatValue(metric.value, metric.unit)}</b>
            <span>
              基础 {formatValue(metric.baseValue, metric.unit)} · 满投入{' '}
              {formatValue(metric.maximumValue, metric.unit)}
            </span>
          </div>
        ))}
      </div>
      <p className="effect-boundary">
        投掷初速度用于说明能力实际改变的源参数，不直接换算为地面距离；地形、高低差与玩家移动会改变落点。信标显示的是赋予跳跃者的超级跳跃缩短等效
        AP。
      </p>
      <div className="ap-preview-label">
        <div>
          <span>{isPreview ? `正在试算 ${result.ap}AP` : 'AP 曲线试算'}</span>
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
            className={result.ap === value ? 'active' : ''}
            onClick={() => setAp(value)}
            key={value}
          >
            <b>{value}AP</b>
            <small>{value === 3 ? '最小可装备投入' : '查看曲线'}</small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        {result.ap > 0
          ? `${result.ap}AP 会把${primary.label}从 ${formatValue(primary.baseValue, primary.unit)} 提升到 ${formatValue(primary.value, primary.unit)}。`
          : `当前未投入副武器性能，${primary.label}保持基础值。`}
      </p>
      <p className="effect-source">
        <Check size={13} />
        当前副武器的三点值来自 Leanny Ver. {result.gameVersion}
        固定快照，并按 Sendou.ink 公开分析器采用的字段与换算方式复算。
      </p>
    </>
  );
}
