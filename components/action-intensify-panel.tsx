import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeActionIntensify } from '@/lib/action-intensify';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function ActionIntensifyPanel({
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
  const analysis = analyzeActionIntensify(weapon.id, ap);
  const quickAp = [3, 6, 10, 20, 30, 57];

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>{weapon.name} · 行动强化 · 60 帧制</small>
          <strong>
            鱿鱼登顶蓄力 {analysis.displayedSquidSurgeChargeFrames} 帧
          </strong>
          <p>
            通用动作时间与武器跳跃射击扩散分别计算；没有不同空中扩散值的武器不会生成伪造收益。
          </p>
        </div>
        <span>曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>鱿鱼登顶蓄力</small>
          <b>45 → {analysis.displayedSquidSurgeChargeFrames} 帧</b>
          <span>
            {analysis.squidSurgeChargeSeconds.toFixed(2)} 秒 · 已缩短{' '}
            {analysis.savedSquidSurgeChargeFrames} 帧
          </span>
        </div>
        {analysis.jumpSpread ? (
          <>
            <div>
              <small>跳跃射击扩散</small>
              <b>
                {analysis.jumpSpread.baseJumpDegrees.toFixed(2)}° →{' '}
                {analysis.jumpSpread.currentDegrees.toFixed(2)}°
              </b>
              <span>
                地面基准 {analysis.jumpSpread.groundDegrees.toFixed(2)}°
              </span>
            </div>
            <div>
              <small>额外扩散抑制</small>
              <b>{analysis.jumpSpread.reductionPercent.toFixed(1)}%</b>
              <span>
                {analysis.jumpSpread.sourceMode === 'weapon-override'
                  ? '当前武器使用专用中点'
                  : '使用通用行动强化曲线'}
              </span>
            </div>
          </>
        ) : (
          <div>
            <small>跳跃射击扩散</small>
            <b>当前不单列</b>
            <span>来源中没有不同于地面的可计算扩散</span>
          </div>
        )}
      </div>
      <p className="effect-boundary">
        行动强化不是单一倍率：鱿鱼登顶使用通用蓄力帧曲线，跳跃射击只缩小相对地面射击多出的扩散部分。鱿鱼滚行的操作窗口本轮不凭描述推算。
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
          ? `${analysis.ap}AP 令鱿鱼登顶蓄力缩短 ${analysis.savedSquidSurgeChargeFrames} 帧${analysis.jumpSpread ? `，并抑制 ${analysis.jumpSpread.reductionPercent.toFixed(1)}% 的空中额外扩散` : ''}。`
          : '当前未投入行动强化，鱿鱼登顶基础蓄力为 45 帧。'}
      </p>
      <p className="effect-source">
        <Check size={13} />
        鱿鱼登顶蓄力、地面／跳跃扩散和 17 组武器专用中点来自 Leanny Ver. 12.0.0
        固定快照，并经 Sendou.ink 公开分析器实现交叉核对。
      </p>
    </>
  );
}
