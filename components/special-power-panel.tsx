import { Check, FlaskConical, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeSpecialPower } from '@/lib/special-power';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

const quickAp = [3, 6, 10, 20, 30, 57];

function formatValue(value: number, unit: string) {
  const precision = Math.abs(value) < 0.1 ? 3 : Math.abs(value) < 10 ? 2 : 1;
  const formatted = Number.isInteger(value) ? `${value}` : value.toFixed(precision);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function SpecialPowerPanel({
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
  const result = analyzeSpecialPower(weapon.specialId, ap);
  if (!result || result.status === 'pending') {
    return (
      <>
        <div className="effect-main generic">
          <AbilityIcon ability={ability} />
          <div>
            <small>{weapon.name} · 当前特殊武器：{weapon.special}</small>
            <strong>参数索引语义待核验</strong>
            <p>上游存在数值，但尚未确认每个索引分别代表伤害、范围或涂墨中的哪一项。</p>
          </div>
          <span>不输出猜测值</span>
        </div>
        <p className="effect-boundary">
          当前 {weapon.special} 只保留套装识别；完成索引语义交叉核对前，不显示 AP 收益或推荐投入量。
        </p>
      </>
    );
  }

  const primary = result.metrics[0];
  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>{weapon.name} · 当前特殊武器：{weapon.special}</small>
          <strong>{primary.label} {formatValue(primary.value, primary.unit)}</strong>
          <p>按当前特殊武器读取专属字段，不把不同大招合成一条通用持续时间或伤害倍率。</p>
        </div>
        <span>{result.metrics.length} 项参数已核对</span>
      </div>
      <div className="ink-saver-metrics">
        {result.metrics.map((metric) => (
          <div key={metric.key}>
            <small>{metric.label}</small>
            <b>{formatValue(metric.value, metric.unit)}</b>
            <span>基础 {formatValue(metric.baseValue, metric.unit)} · 满投入 {formatValue(metric.maximumValue, metric.unit)}</span>
          </div>
        ))}
      </div>
      <p className="effect-boundary">
        标为“内部单位”的范围、半径或初速度只用于同一动作的 AP 前后比较，不冒充训练场距离。触手喷射耗墨已按其 150% 专用墨水槽换算。
      </p>
      <div className="ap-preview-label">
        <div>
          <span>{isPreview ? `正在试算 ${result.ap}AP` : 'AP 曲线试算'}</span>
          <small>配装值 {equippedAp}AP · 只更新右侧结果，不修改左侧 57AP 配装</small>
        </div>
        {isPreview ? <button type="button" onClick={clearPreview}>恢复配装值</button> : null}
      </div>
      <div className="breakpoints">
        {quickAp.map((value) => (
          <button type="button" className={result.ap === value ? 'active' : ''} onClick={() => setAp(value)} key={value}>
            <b>{value}AP</b>
            <small>{value === 3 ? '最小可装备投入' : '查看曲线'}</small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        {result.ap > 0
          ? `${result.ap}AP 会把${primary.label}从 ${formatValue(primary.baseValue, primary.unit)} 调整到 ${formatValue(primary.value, primary.unit)}。`
          : `当前未投入特殊武器性能，${primary.label}保持基础值。`}
      </p>
      <p className="effect-source">
        <Check size={13} /> 当前特殊武器三点值来自 Leanny Ver. {result.gameVersion} 固定快照。
        <FlaskConical size={13} /> 各字段按公开分析器已有换算规则分别处理。
      </p>
    </>
  );
}
