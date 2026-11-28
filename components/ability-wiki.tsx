'use client';

import { useState } from 'react';
import { Plus, Search, Zap } from 'lucide-react';
import { AbilityIcon } from '@/components/ability-icon';
import { AbilityCurvePanel } from '@/components/ability-curve-panel';
import { abilities } from '@/lib/abilities';
import { getFixedAbilityRule } from '@/lib/ability-context';
import { filterAbilitiesForWiki } from '@/lib/ability-wiki-filter';
import { getAbilityCurveDefinition } from '@/lib/ability-curves';
import { getAbilityModelCoverage } from '@/lib/ability-model-coverage';

export function AbilityWiki({
  focus,
  setFocus,
  onOpenLab,
}: {
  focus: string;
  setFocus: (id: string) => void;
  onOpenLab: () => void;
}) {
  const modelCoverage = getAbilityModelCoverage();
  const [filters, setFilters] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const tags = [
    { label: '全部' },
    { label: '头部限定' },
    { label: '服装限定' },
    { label: '鞋子限定' },
    { label: '副武器' },
    { label: '墨水续航' },
    { label: '机动' },
    {
      label: '少量投入有效',
    },
    {
      label: '关键临界点',
    },
    {
      label: '武器专属',
    },
  ];
  const toggle = (tag: string) =>
    setFilters(
      tag === '全部'
        ? []
        : (current) =>
            current.includes(tag)
              ? current.filter((item) => item !== tag)
              : [...current, tag],
    );
  const shown = filterAbilitiesForWiki(query, filters);
  const current =
    abilities.find((ability) => ability.id === focus) ?? abilities[0];
  const currentCurve = getAbilityCurveDefinition(current.id);
  const fixedRule = getFixedAbilityRule(current.id);

  return (
    <section className="workspace wiki-page">
      <div className="intro">
        <div>
          <em>ABILITY INDEX / 003</em>
          <h1>能力百科</h1>
          <p>先按玩法与装备规则缩小范围，再查看它对具体武器的实际意义。</p>
        </div>
        <label className="wiki-search">
          <Search size={15} />
          <span className="visually-hidden">搜索能力</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索能力名称"
          />
        </label>
      </div>
      <fieldset className="tag-board">
        <legend className="visually-hidden">能力组合标签筛选</legend>
        {tags.map((tag) => {
          const selected =
            (tag.label === '全部' && !filters.length) ||
            filters.includes(tag.label);
          return (
            <button
              type="button"
              key={tag.label}
              className={selected ? 'active' : ''}
              aria-pressed={selected}
              onClick={() => toggle(tag.label)}
            >
              {tag.label}
            </button>
          );
        })}
      </fieldset>
      <div className="wiki-grid">
        <section>
          <div className="wiki-count">
            <b>{shown.length}</b> 个能力符合条件 <span>可组合多个标签</span>
          </div>
          <div className="wiki-abilities">
            {shown.map((ability) => (
              <button
                type="button"
                className={focus === ability.id ? 'active' : ''}
                aria-pressed={focus === ability.id}
                onClick={() => setFocus(ability.id)}
                key={ability.id}
              >
                <AbilityIcon ability={ability} />
                <div>
                  <b>{ability.short}</b>
                  <small>{ability.name}</small>
                </div>
                <Plus size={14} />
              </button>
            ))}
            {shown.length === 0 ? (
              <output className="wiki-empty">
                <Search size={18} />
                <b>没有符合当前组合的能力</b>
                <span>清除搜索词和标签后可查看全部能力。</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setFilters([]);
                  }}
                >
                  查看全部能力
                </button>
              </output>
            ) : null}
          </div>
        </section>
        <aside className="ability-detail">
          <div className="ability-name">
            <AbilityIcon ability={current} />
            <div>
              <small>{current.group} / 当前选中</small>
              <h2>{current.name}</h2>
            </div>
          </div>
          <div className="detail-tags">
            <span>
              {current.group.endsWith('限定')
                ? '仅对应部位主能力槽'
                : '可用于主能力与追加能力槽'}
            </span>
            <span>{current.group}</span>
            <span>
              {currentCurve.status === 'verified'
                ? '正式 AP 曲线已接入'
                : currentCurve.status === 'weapon-specific'
                  ? '武器专属模型已接入'
                  : currentCurve.status === 'not-applicable'
                    ? '固定能力 · AP 曲线不适用'
                    : 'AP 曲线待核验'}
            </span>
          </div>
          <div className="wiki-callout">
            <b>在实验室中的用途</b>
            <p>
              {currentCurve.status === 'verified'
                ? current.id === 'iss'
                  ? '副武器省墨已接入正式效果曲线；进入实验室后会按当前副武器的已核对基础耗墨、曲线档位与墨水槽容量展示完整使用次数和下一临界点。'
                  : current.id === 'iru'
                    ? '对战回墨已接入潜墨与非潜墨两条正式曲线；进入实验室后会按当前武器的墨水槽容量展示从空槽回满所需帧数与秒数。'
                    : current.id === 'qsj'
                      ? '快跳已接入起跳准备与飞行两条正式曲线；进入实验室后会分段展示帧数、合计时间，并单独标出隐身跳跃的距离相关惩罚。'
                      : current.id === 'ssu'
                        ? '游速已接入轻量／中量／重量三套正式曲线；进入实验室后会按当前武器重量级计算，并把鱿鱼忍者与持有真格鱼虎的固定修正分开列出。'
                        : current.id === 'rsu'
                          ? '走速已接入三种重量级的普通人形态曲线；实验室还会按当前武器展示已具备来源基础值的射击、蓄力、满蓄力和第二射击状态，不存在的状态不会补猜。'
                          : current.id === 'ia'
                            ? '行动强化已接入鱿鱼登顶蓄力曲线；实验室还会按当前武器核对地面与跳跃射击扩散，并保留武器专用中点。鱿鱼滚行操作窗口暂不推算。'
                            : current.id === 'inkres'
                              ? '粘脚已接入敌墨走速、受伤前缓冲、持续伤害与累计伤害上限四条曲线；实验室会将它们拆开显示，不压缩成一个模糊抗性值。'
                              : current.id === 'scu'
                                ? '特殊武器增加量已接入正式倍率；能力百科使用 200p 基准，实验室会读取当前武器套装的实际必要点数并显示完整点数临界结果。'
                                : current.id === 'ss'
                                  ? '特殊武器减少量已接入标准被击倒曲线；实验室会另外列出自身或对手装备复活惩罚时的固定损失边界。'
                                  : current.id === 'qr'
                                    ? '缩短复活时间已接入条件复活曲线；实验室会明确显示触发前提，并单列自身或对手装备复活惩罚时的 AP 压制与固定时间。'
                                    : '主武器省墨已接入正式效果曲线；进入实验室后会按当前武器的已核对基础耗墨展示完整动作次数与下一临界点。'
                : currentCurve.status === 'not-applicable'
                  ? (fixedRule?.labNote ??
                    '这项能力按对应部位的固定主能力规则生效，不会被误当成可重复堆叠的通用 AP 曲线；具体触发条件与效果仍在能力语义中单独说明。')
                  : currentCurve.status === 'weapon-specific'
                    ? current.id === 'subp'
                      ? `副武器性能已按当前套装读取 ${modelCoverage.subWeaponCount} 种副武器的 ${modelCoverage.subMetricCount} 个专属指标；不同副武器改变的距离、速度、持续时间或耐久并不相同，因此不会被压缩成一条统一百分比。`
                      : modelCoverage.pendingSpecialWeaponCount > 0
                        ? `特殊武器性能已对 ${modelCoverage.verifiedSpecialWeaponCount} 种特殊武器开放 ${modelCoverage.specialMetricCount} 个具名指标；其余 ${modelCoverage.pendingSpecialWeaponCount} 种索引语义继续明确标为待核验，不影响已完成的专属模型。`
                        : `特殊武器性能已对全部 ${modelCoverage.verifiedSpecialWeaponCount} 种特殊武器开放 ${modelCoverage.specialMetricCount} 个具名指标；各武器继续按自身的范围、持续时间、速度、耐久或耗墨字段分别计算。`
                    : '这项能力可以用于配装编辑和分类；完整 AP 效果、最小有效投入与关键临界点仍待逐项核验，目前不输出未经核对的阈值结论。'}
            </p>
          </div>
          <AbilityCurvePanel abilityId={current.id} />
          <button type="button" className="primary" onClick={onOpenLab}>
            <Zap size={15} />
            围绕此能力进入实验室
          </button>
        </aside>
      </div>
    </section>
  );
}
