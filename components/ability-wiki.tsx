'use client';

import { useState } from 'react';
import { Plus, Search, Zap } from 'lucide-react';
import { AbilityIcon } from '@/components/ability-icon';
import { abilities, abilityAliases } from '@/lib/abilities';

export function AbilityWiki({
  focus,
  setFocus,
  onOpenLab,
}: {
  focus: string;
  setFocus: (id: string) => void;
  onOpenLab: () => void;
}) {
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
      disabled: true,
      title: '等待各能力 AP 曲线逐项核验后开放',
    },
    {
      label: '关键临界点',
      disabled: true,
      title: '当前仅主武器省墨具备正式临界点模型',
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
  const shown = abilities.filter(
    (ability) =>
      (!query ||
        ability.name.includes(query) ||
        ability.short.includes(query) ||
        (abilityAliases[ability.id] || '').includes(query)) &&
      (!filters.includes('副武器') ||
        ['iss', 'subp', 'subr'].includes(ability.id)) &&
      (!filters.includes('墨水续航') || ability.group === '续航') &&
      (!filters.includes('机动') || ability.group === '机动') &&
      (!filters.includes('头部限定') || ability.group === '头部限定') &&
      (!filters.includes('服装限定') || ability.group === '服装限定') &&
      (!filters.includes('鞋子限定') || ability.group === '鞋子限定'),
  );
  const current =
    abilities.find((ability) => ability.id === focus) ?? abilities[0];

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
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索能力名称"
          />
        </label>
      </div>
      <div className="tag-board">
        {tags.map((tag) => (
          <button
            type="button"
            key={tag.label}
            disabled={tag.disabled}
            title={tag.title}
            className={
              (tag.label === '全部' && !filters.length) ||
              filters.includes(tag.label)
                ? 'active'
                : ''
            }
            onClick={() => toggle(tag.label)}
          >
            {tag.label}
            {tag.disabled ? <small>待核验</small> : null}
          </button>
        ))}
      </div>
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
              {current.id === 'ism' ? '正式 AP 曲线已接入' : 'AP 曲线待核验'}
            </span>
          </div>
          <div className="wiki-callout">
            <b>在实验室中的用途</b>
            <p>
              {current.id === 'ism'
                ? '主武器省墨已接入正式效果曲线；进入实验室后会按当前武器的已核对基础耗墨展示完整动作次数与下一临界点。'
                : '这项能力可以用于配装编辑和分类；完整 AP 效果、最小有效投入与关键临界点仍待逐项核验，目前不输出未经核对的阈值结论。'}
            </p>
          </div>
          <h3>投入结构示意</h3>
          <div className="ap-recipes">
            <article>
              <b>3AP</b>
              <span>轻量投入</span>
              <small>占用 1 个追加能力槽</small>
            </article>
            <article>
              <b>6AP</b>
              <span>两个追加槽</span>
              <small>是否有效取决于能力曲线</small>
            </article>
            <article>
              <b>专项</b>
              <span>围绕临界点</span>
              <small>仅在已有核验模型时计算</small>
            </article>
          </div>
          <button type="button" className="primary" onClick={onOpenLab}>
            <Zap size={15} />
            围绕此能力进入实验室
          </button>
        </aside>
      </div>
    </section>
  );
}
