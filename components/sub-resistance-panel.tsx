import { Check, ShieldCheck } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import { analyzeSubResistance } from '@/lib/sub-resistance';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

const quickAp = [3, 6, 10, 20, 30, 57];

export function SubResistancePanel({
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
  const result = analyzeSubResistance(ap);
  const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>{weapon.name} · 防御对手副武器 · 多条独立曲线</small>
          <strong>
            重型副武非致命伤害 {percent(result.heavyDamageMultiplier)}
          </strong>
          <p>
            伤害、标记持续时间和毒雾减速分别计算；不能合并成一个通用“副防百分比”。
          </p>
        </div>
        <span>八项曲线已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>重型伤害组</small>
          <b>{percent(result.heavyDamageMultiplier)}</b>
          <span>炸弹、陷阱、鱼雷等非致命伤害</span>
        </div>
        <div>
          <small>轻型伤害组</small>
          <b>{percent(result.lightDamageMultiplier)}</b>
          <span>快速炸弹与碳酸炸弹</span>
        </div>
        <div>
          <small>普通标记持续时间</small>
          <b>{percent(result.markingTimeMultiplier)}</b>
          <span>标线器与直击标记</span>
        </div>
        <div>
          <small>墨汁陷阱标记时间</small>
          <b>{percent(result.mineMarkingTimeMultiplier)}</b>
          <span>使用独立的陷阱曲线</span>
        </div>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>标线器伤害</small>
          <b>{percent(result.lineMarkerDamageMultiplier)}</b>
          <span>只降低非致命伤害段</span>
        </div>
        <div>
          <small>洒墨器伤害</small>
          <b>{percent(result.sprinklerDamageMultiplier)}</b>
          <span>使用独立伤害组</span>
        </div>
        <div>
          <small>防护墙接触伤害</small>
          <b>{percent(result.splashWallDamageMultiplier)}</b>
          <span>不改变防护墙耐久</span>
        </div>
        <div>
          <small>毒雾减速影响</small>
          <b>{percent(result.toxicMistSlowdownMultiplier)}</b>
          <span>表示减速效果倍率，不是移速倍率</span>
        </div>
      </div>
      <p className="effect-boundary">
        伤害原值超过 100
        时，公开分析器会保留原伤害，不套用减伤；因此不能把本能力理解成能够防止炸弹直击一击击倒。基础伤害和实际连段后续再按具体攻击建模。
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
            <small>{value === 3 ? '最小有效值' : '查看曲线'}</small>
          </button>
        ))}
      </div>
      <p className="judgement">
        <ShieldCheck size={14} />
        <b>当前结论：</b>
        {result.ap > 0
          ? `${result.ap}AP 下，重型组非致命伤害降至 ${percent(result.heavyDamageMultiplier)}，普通标记时间降至 ${percent(result.markingTimeMultiplier)}。`
          : '当前未投入副武器减轻，所有支持的伤害与状态影响均按基础值结算。'}
      </p>
      <p className="effect-source">
        <Check size={13} />
        八组三点值来自 Leanny Ver. 12.0.0 固定快照，并经 Sendou.ink
        公开分析器实现交叉核对。结果描述参数边界，不直接预测一次交战的存活结果。
      </p>
    </>
  );
}
