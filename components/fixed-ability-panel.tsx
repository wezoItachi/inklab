import { Check, TrendingUp } from 'lucide-react';
import type { Ability } from '@/lib/abilities';
import {
  analyzeNinjaSquidContext,
  analyzeRespawnPunisherContext,
  analyzeStealthJumpContext,
} from '@/lib/fixed-ability-analysis';
import type { Weapon } from '@/lib/weapon-catalog';
import { AbilityIcon } from './ability-icon';

export function FixedAbilityPanel({
  weapon,
  ability,
  swimSpeedAp,
  quickJumpAp,
  quickRespawnAp,
  specialSaverAp,
  isEquipped,
}: {
  weapon: Weapon;
  ability: Ability;
  swimSpeedAp: number;
  quickJumpAp: number;
  quickRespawnAp: number;
  specialSaverAp: number;
  isEquipped: boolean;
}) {
  const previewLabel = isEquipped ? '当前配装' : '假设装备预览';
  if (ability.id === 'ninja') {
    const result = analyzeNinjaSquidContext(weapon.id, swimSpeedAp);
    return (
      <>
        <div className="effect-main main-ink-context">
          <AbilityIcon ability={ability} />
          <div>
            <small>
              {weapon.name} · {result.speedClassLabel} · 当前游速 {swimSpeedAp}
              AP
            </small>
            <strong>{result.speed.toFixed(3)} 单位/帧</strong>
            <p>先计算当前游速 AP，再应用鱿鱼忍者的 0.9 倍固定修正。</p>
          </div>
          <span>{previewLabel} · 固定修正已核对</span>
        </div>
        <div className="ink-saver-metrics">
          <div>
            <small>游速 AP 计算后</small>
            <b>{result.speedBeforeFixedAbilities.toFixed(3)}</b>
            <span>单位/帧 · 尚未应用鱿鱼忍者</span>
          </div>
          <div>
            <small>鱿鱼忍者修正后</small>
            <b>{result.speed.toFixed(3)}</b>
            <span>最终结果 ×0.9</span>
          </div>
          <div>
            <small>60 帧换算</small>
            <b>{result.speedPerSecond.toFixed(1)} 单位/秒</b>
            <span>
              {result.speedClassLabel}
              {previewLabel}结果
            </span>
          </div>
        </div>
        <p className="effect-boundary">
          这里仅量化已经交叉核对的游速修正；墨水飞沫可见性属于触发规则，不伪造为距离或百分比数值。
        </p>
        <p className="judgement">
          <TrendingUp size={14} />
          <b>当前结论：</b>
          {isEquipped ? '当前配装' : '假设装备后'}的 {swimSpeedAp}AP 游速先得到{' '}
          {result.speedBeforeFixedAbilities.toFixed(3)}，装备鱿鱼忍者后为{' '}
          {result.speed.toFixed(3)} 单位/帧。
        </p>
        <SourceNote />
      </>
    );
  }

  if (ability.id === 'stealth') {
    const result = analyzeStealthJumpContext(quickJumpAp);
    return (
      <>
        <div className="effect-main main-ink-context">
          <AbilityIcon ability={ability} />
          <div>
            <small>
              {weapon.name} · 当前快跳 {quickJumpAp}AP · 60 帧制
            </small>
            <strong>最多 {result.displayedMaxTotalFrames} 帧</strong>
            <p>标准跳跃时间与隐身跳跃的距离相关惩罚分开显示。</p>
          </div>
          <span>{previewLabel} · 规则边界已核对</span>
        </div>
        <div className="ink-saver-metrics">
          <div>
            <small>起跳准备</small>
            <b>{result.chargeFrames} 帧</b>
            <span>当前快跳 AP 结果</span>
          </div>
          <div>
            <small>不含隐跳惩罚</small>
            <b>{result.totalFrames} 帧</b>
            <span>{result.totalSeconds.toFixed(2)} 秒</span>
          </div>
          <div>
            <small>含最大惩罚</small>
            <b>{result.displayedMaxTotalFrames} 帧</b>
            <span>{result.displayedMaxTotalSeconds.toFixed(2)} 秒</span>
          </div>
        </div>
        <p className="effect-boundary">
          隐身跳跃最多增加 60
          帧，实际值随跳跃距离变化；最大值不是每次固定耗时，也不会写回当前配装
          AP。
        </p>
        <p className="judgement">
          <TrendingUp size={14} />
          <b>当前结论：</b>
          {isEquipped ? '当前配装' : '假设装备后'}的快跳投入下，标准完整跳跃为{' '}
          {result.totalFrames} 帧；隐跳距离惩罚加入后最多为{' '}
          {result.displayedMaxTotalFrames} 帧。
        </p>
        <SourceNote />
      </>
    );
  }

  const result = analyzeRespawnPunisherContext(quickRespawnAp, specialSaverAp);
  return (
    <>
      <div className="effect-main main-ink-context">
        <AbilityIcon ability={ability} />
        <div>
          <small>
            {weapon.name} · 当前快活 {quickRespawnAp}AP · 大招减{' '}
            {specialSaverAp}AP
          </small>
          <strong>
            自身复活 {result.ownRespawn.standardSeconds.toFixed(2)} 秒
          </strong>
          <p>自身代价、对手受到的惩罚与能力压制分别展示。</p>
        </div>
        <span>{previewLabel} · 惩罚边界已核对</span>
      </div>
      <div className="ink-saver-metrics">
        <div>
          <small>自身条件复活</small>
          <b>{result.ownRespawn.standardFrames.toFixed(1)} 帧</b>
          <span>已包含自身复活惩罚代价</span>
        </div>
        <div>
          <small>自身被击倒槽损失</small>
          <b>{result.ownSpecial.currentLossPercent.toFixed(1)}%</b>
          <span>当前 {specialSaverAp}AP 大招减</span>
        </div>
        <div>
          <small>对手 0AP 基准</small>
          <b>{result.opponentRespawnAtZeroAp.seconds.toFixed(2)} 秒</b>
          <span>
            槽损失 {result.opponentSpecialAtZeroAp.lossPercent.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="effect-boundary">
        “对手 0AP
        基准”只用于说明固定边界；实际对手的快活、大招减、能量站状态与其他条件会改变结果，本站不从当前玩家配装猜测对手装备。
      </p>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>当前结论：</b>
        提升复活惩罚同时影响自己与被自己击倒的对手；
        {isEquipped ? '当前卡片' : '假设装备预览'}把自身配装结果和对手无相关 AP
        的参考边界分开，不能只把它理解成单向增益。
      </p>
      <SourceNote />
    </>
  );
}

function SourceNote() {
  return (
    <p className="effect-source">
      <Check size={13} />
      当前数值复用实验室已核对的移动、超级跳跃、条件复活与特殊武器槽模型；固定能力不会被转换成可重复堆叠的
      AP 曲线。
    </p>
  );
}
