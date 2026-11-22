import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeQuickRespawn } from '@/lib/quick-respawn';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function QuickRespawnPanel({
  weapon,
  ability,
  ap,
  setAp,
  isPreview,
  equippedAp,
  clearPreview,
  hasRespawnPunisher,
}: {
  weapon: Weapon;
  ability?: Ability;
  ap: number;
  setAp: (ap: number) => void;
  isPreview: boolean;
  equippedAp: number;
  clearPreview: () => void;
  hasRespawnPunisher: boolean;
}) {
  const analysis = analyzeQuickRespawn(ap, { hasRespawnPunisher });
  const quickAp = [3, 6, 10, 20, 30, 57];

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>{weapon.name} · 条件复活时间 · 60 帧制</small>
          <strong>复活 {analysis.standardSeconds.toFixed(2)} 秒</strong>
          <p>
            仅在上次复活后没有击倒对手、随后被击倒时生效；普通死亡不会无条件获得快活效果。
          </p>
        </div>
        <span>触发条件与曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>
            {hasRespawnPunisher ? '当前配装含复活惩罚' : '标准触发'}
          </small>
          <b>{analysis.standardFrames.toFixed(1)} 帧</b>
          <span>{analysis.standardSeconds.toFixed(2)} 秒</span>
        </div>
        <div>
          <small>相对 0AP</small>
          <b>缩短 {analysis.savedFrames.toFixed(1)} 帧</b>
          <span>{analysis.savedSeconds.toFixed(2)} 秒</span>
        </div>
        <div>
          <small>若被复活惩罚击倒</small>
          <b>{analysis.againstRespawnPunisherFrames.toFixed(1)} 帧</b>
          <span>
            快活按 {analysis.reducedApAgainstRespawnPunisher}AP 计算 ·{' '}
            {analysis.againstRespawnPunisherSeconds.toFixed(2)} 秒
          </span>
        </div>
      </div>
      <p className="effect-boundary">
        对手的复活惩罚会把快活 AP 压到原值的
        15%（向上取整）并另加固定时间；能量站效果可改变这条边界，但当前页面没有对局中的饮料状态，因此不假设已获得增益。
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
          ? `满足触发条件时，${analysis.ap}AP 令标准复活缩短 ${analysis.savedSeconds.toFixed(2)} 秒。`
          : '当前未投入快活，满足触发条件时仍使用 7.50 秒基础复活时间。'}
      </p>
      <p className="effect-source">
        <Check size={13} />
        两段复活时间三点值及复活惩罚边界来自 Leanny Ver. 12.0.0 固定快照，并经
        Sendou.ink 公开分析器实现交叉核对。
      </p>
    </>
  );
}
