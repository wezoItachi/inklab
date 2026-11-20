import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { getInkRecoveryAnalysis } from '@/lib/ink-recovery';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function InkRecoveryPanel({
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
  const analysis = getInkRecoveryAnalysis(weapon, ap);
  const quickAp = [3, 6, 10, 20, 30, 57];

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · 对战模式 · {analysis.tankCapacity}% 墨水槽
          </small>
          <strong>
            潜墨回满 {analysis.squid.adjustedSeconds.toFixed(2)} 秒
          </strong>
          <p>
            {analysis.ap}AP 同时缩短潜墨与非潜墨状态的回满时间；两种状态使用不同曲线。
          </p>
        </div>
        <span>曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>潜墨状态回满</small>
          <b>
            {analysis.squid.baseSeconds.toFixed(2)} →{' '}
            {analysis.squid.adjustedSeconds.toFixed(2)} 秒
          </b>
          <span>
            缩短 {analysis.squid.savedFrames} 帧 ·{' '}
            {analysis.squid.reductionPercent.toFixed(1)}%
          </span>
        </div>
        <div>
          <small>非潜墨状态回满</small>
          <b>
            {analysis.humanoid.baseSeconds.toFixed(2)} →{' '}
            {analysis.humanoid.adjustedSeconds.toFixed(2)} 秒
          </b>
          <span>
            缩短 {analysis.humanoid.savedFrames} 帧 ·{' '}
            {analysis.humanoid.reductionPercent.toFixed(1)}%
          </span>
        </div>
        <div>
          <small>当前完整回墨帧数</small>
          <b>
            {analysis.squid.adjustedFrames} / {analysis.humanoid.adjustedFrames}
          </b>
          <span>潜墨 / 非潜墨 · 60 帧制</span>
        </div>
      </div>
      {analysis.tankCapacity !== 100 && (
        <p className="effect-boundary">
          {weapon.name} 使用 {analysis.tankCapacity}% 容量墨水槽；页面显示的是从空槽回满该武器整槽所需时间。
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
            <small>{value === 3 ? '最小有效值' : '查看曲线'}</small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        {analysis.ap > 0
          ? `${analysis.ap}AP 令潜墨回满缩短 ${analysis.squid.savedFrames} 帧，非潜墨回满缩短 ${analysis.humanoid.savedFrames} 帧。`
          : '当前未投入回墨能力，显示对战模式的基础回满时间。'}
      </p>
      <p className="effect-source">
        <Check size={13} />
        两条回墨曲线来自 Leanny Ver. 12.0.0 固定快照，并经 Sendou.ink 公开分析器实现交叉核对。射击或副武后的墨锁时间不包含在回满时间中；鲑鱼跑适用性继续保持待验证。
      </p>
    </>
  );
}
