import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { getQuickSuperJumpAnalysis } from '@/lib/quick-super-jump';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function QuickSuperJumpPanel({
  weapon,
  ability,
  ap,
  setAp,
  isPreview,
  equippedAp,
  clearPreview,
  hasStealthJump,
}: {
  weapon: Weapon;
  ability?: Ability;
  ap: number;
  setAp: (ap: number) => void;
  isPreview: boolean;
  equippedAp: number;
  clearPreview: () => void;
  hasStealthJump: boolean;
}) {
  const analysis = getQuickSuperJumpAnalysis(ap, hasStealthJump);
  const quickAp = [3, 6, 10, 20, 30, 57];

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · 超级跳跃 · 60 帧制
          </small>
          <strong>起跳准备 {analysis.chargeFrames} 帧</strong>
          <p>
            {analysis.ap}AP 已进入起跳准备与飞行公式；按完整帧显示时，低投入的飞行帧数可能暂时不变。隐身跳跃惩罚另行计算。
          </p>
        </div>
        <span>曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>起跳准备</small>
          <b>80 → {analysis.chargeFrames} 帧</b>
          <span>角色在原地准备起跳的阶段</span>
        </div>
        <div>
          <small>飞行阶段</small>
          <b>138 → {analysis.moveFrames} 帧</b>
          <span>独立曲线 · 不与准备阶段混算</span>
        </div>
        <div>
          <small>{hasStealthJump ? '当前最大合计' : '当前合计'}</small>
          <b>
            {hasStealthJump
              ? analysis.displayedMaxTotalFrames
              : analysis.totalFrames}{' '}
            帧
          </b>
          <span>
            {hasStealthJump
              ? `${analysis.displayedMaxTotalSeconds.toFixed(2)} 秒 · 含隐跳最大惩罚`
              : `${analysis.totalSeconds.toFixed(2)} 秒 · 已缩短 ${analysis.savedFrames} 帧`}
          </span>
        </div>
      </div>
      {hasStealthJump && (
        <p className="effect-boundary">
          当前配装含隐身跳跃。这里按公开分析器口径展示最多 +60
          帧；实际惩罚随跳跃距离变化，因此不把最大值称为每次固定耗时。
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
          ? `${analysis.ap}AP 令不含隐跳惩罚的完整跳跃缩短 ${analysis.savedFrames} 帧。`
          : '当前未投入快跳，完整跳跃基础时间为 218 帧。'}
      </p>
      <p className="effect-source">
        <Check size={13} />
        起跳准备与飞行曲线来自 Leanny Ver. 12.0.0 固定快照，并经 Sendou.ink 公开分析器实现交叉核对。这里只计算游戏参数中的跳跃阶段，不包含玩家选点、确认与落地后的操作时间。
      </p>
    </>
  );
}
