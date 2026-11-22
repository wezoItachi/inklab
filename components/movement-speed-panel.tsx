import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import {
  analyzeMovementSpeed,
  type MovementAbilityId,
} from '@/lib/movement-speed';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function MovementSpeedPanel({
  weapon,
  ability,
  abilityId,
  ap,
  setAp,
  isPreview,
  equippedAp,
  clearPreview,
  hasNinjaSquid,
}: {
  weapon: Weapon;
  ability?: Ability;
  abilityId: MovementAbilityId;
  ap: number;
  setAp: (ap: number) => void;
  isPreview: boolean;
  equippedAp: number;
  clearPreview: () => void;
  hasNinjaSquid: boolean;
}) {
  const analysis = analyzeMovementSpeed({
    weaponId: weapon.id,
    abilityId,
    ap,
    hasNinjaSquid,
  });
  const isSwim = abilityId === 'ssu';
  const quickAp = [3, 6, 10, 20, 30, 57];
  const speedLabel = isSwim ? '潜墨移动' : '普通人形态移动';

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · {analysis.speedClassLabel} · 60 帧制
          </small>
          <strong>
            {speedLabel} {analysis.speed.toFixed(3)} 单位/帧
          </strong>
          <p>
            当前按武器重量级选择对应曲线；{isSwim
              ? '鱿鱼忍者修正与 AP 增益分开计算。'
              : '这里先计算未射击时的基础走速，不混入武器射击动作。'}
          </p>
        </div>
        <span>重量与曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>武器重量级</small>
          <b>{analysis.speedClassLabel}</b>
          <span>
            {analysis.sourceMode === 'explicit'
              ? '上游参数显式标记'
              : '未覆盖时使用标准中量级'}
          </span>
        </div>
        <div>
          <small>基础 → 当前</small>
          <b>
            {analysis.baseSpeed.toFixed(3)} → {analysis.speed.toFixed(3)}
          </b>
          <span>单位/帧 · 当前 {analysis.ap}AP</span>
        </div>
        <div>
          <small>60 帧换算</small>
          <b>{analysis.speedPerSecond.toFixed(1)} 单位/秒</b>
          <span>
            相对重量级基础值 {analysis.gainPercent >= 0 ? '+' : ''}
            {analysis.gainPercent.toFixed(1)}%
          </span>
        </div>
      </div>
      {analysis.ninjaSquidApplied && (
        <p className="effect-boundary">
          当前配装含鱿鱼忍者：先计算游速 AP 曲线，再应用 0.9
          倍固定修正。未修正前为 {analysis.speedBeforeFixedAbilities.toFixed(3)}
          单位/帧；这里不会把鱿鱼忍者误算成可重复堆叠的 AP 能力。
        </p>
      )}
      {!isSwim && (
        <p className="effect-boundary">
          “提升人类移动速度”还会影响部分武器的射击、蓄力与满蓄力移动倍率；本轮只开放已经统一核对的普通人形态走速，武器动作走速继续单独验证。
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
          ? `${analysis.ap}AP 下，${analysis.speedClassLabel}${speedLabel}为 ${analysis.speed.toFixed(3)} 单位/帧${analysis.ninjaSquidApplied ? '（已含鱿鱼忍者）' : ''}。`
          : `当前未投入${ability?.short ?? '移动能力'}，采用${analysis.speedClassLabel}基础速度。`}
      </p>
      <p className="effect-source">
        <Check size={13} />
        轻量／中量／重量三套能力值与当前武器 WeaponSpeedType 来自 Leanny Ver.
        12.0.0 固定快照，并经 Sendou.ink 公开分析器实现交叉核对。数值按分析器口径显示为游戏单位/帧，不换算成现实距离。
      </p>
    </>
  );
}
