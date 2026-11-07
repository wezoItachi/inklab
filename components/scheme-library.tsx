'use client';

import { useState, type ReactNode } from 'react';
import { Copy, Plus, Search, Sparkles, Zap } from 'lucide-react';
import { AbilityIcon } from '@/components/ability-icon';
import { abilities } from '@/lib/abilities';
import { encodeLoadoutQuery } from '@/lib/loadout-share';
import type { EditableLoadoutSlot } from '@/lib/loadouts';
import {
  cloneSchemeSlots,
  exampleSchemes,
  gameModes,
  schemeMatchesFilters,
  schemeMatchesQuery,
  type ExampleScheme,
  type SchemeFilters,
} from '@/lib/schemes';
import { DATA_VERSION, getWeapon } from '@/lib/weapons';

export function SchemeLibrary({
  onOpen,
}: {
  onOpen: (weaponId: string, slots: EditableLoadoutSlot[]) => void;
}) {
  const [query, setQuery] = useState(''),
    [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [filters, setFilters] = useState<SchemeFilters>({
    tags: [],
    modes: [],
    weaponIds: [],
  });
  const allTags = [...new Set(exampleSchemes.flatMap((scheme) => scheme.tags))];
  const schemeWeapons = [
    ...new Set(exampleSchemes.map((scheme) => scheme.weaponId)),
  ].map(getWeapon);
  const activeFilterCount = Object.values(filters).reduce(
    (total, values) => total + values.length,
    0,
  );
  const toggleFilter = (key: keyof SchemeFilters, value: string) =>
    setFilters((current) => {
      const values = current[key] as readonly string[];
      return {
        ...current,
        [key]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      } as SchemeFilters;
    });
  const clearFilters = () => setFilters({ tags: [], modes: [], weaponIds: [] });
  const visibleSchemes = exampleSchemes.filter(
    (scheme) =>
      schemeMatchesFilters(scheme, filters) &&
      schemeMatchesQuery(scheme, getWeapon(scheme.weaponId).name, query),
  );
  const copyScheme = async (scheme: ExampleScheme) => {
    const url = `${window.location.origin}${window.location.pathname}?${encodeLoadoutQuery({ weaponId: scheme.weaponId, slots: cloneSchemeSlots(scheme) })}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus(scheme.id);
      setTimeout(() => setCopyStatus(null), 1800);
    } catch {
      setCopyStatus('error:' + scheme.id);
    }
  };
  return (
    <section className="workspace library-page">
      <output className="visually-hidden" aria-live="polite" aria-atomic="true">
        {copyStatus?.startsWith('error:')
          ? '分享链接复制失败。'
          : copyStatus
            ? '分享链接已复制。'
            : ''}
      </output>
      <div className="intro">
        <div>
          <em>PLAYER BUILDS / SAMPLE</em>
          <h1>玩家方案示例库</h1>
          <p>选择一套完整的 57AP 示例，再带回实验室继续比较和微调。</p>
        </div>
        <button
          className="primary compact"
          disabled
          title="账号与投稿将在 Community Beta 开放"
        >
          <Plus size={15} /> 投稿暂未开放
        </button>
      </div>
      <div className="library-toolbar">
        <div>
          <button className="active">全部示例</button>
          <span>
            {visibleSchemes.length} / {exampleSchemes.length}
          </span>
        </div>
        <label>
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索武器、标签或说明"
          />
        </label>
      </div>
      <section className="scheme-filter-board">
        <header>
          <div>
            <b>组合标签筛选</b>
            <span>同组内任一符合 · 不同组同时符合</span>
          </div>
          <button onClick={clearFilters} disabled={activeFilterCount === 0}>
            清除筛选 {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </button>
        </header>
        <FilterRow label="方案标签">
          {allTags.map((tag) => (
            <button
              className={filters.tags.includes(tag) ? 'active' : ''}
              key={tag}
              onClick={() => toggleFilter('tags', tag)}
            >
              {tag}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="对战模式">
          {gameModes.map((mode) => (
            <button
              className={filters.modes.includes(mode.id) ? 'active' : ''}
              key={mode.id}
              onClick={() => toggleFilter('modes', mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="使用武器">
          {schemeWeapons.map((weapon) => (
            <button
              className={filters.weaponIds.includes(weapon.id) ? 'active' : ''}
              key={weapon.id}
              onClick={() => toggleFilter('weaponIds', weapon.id)}
            >
              <span>{weapon.badge}</span>
              {weapon.name}
            </button>
          ))}
        </FilterRow>
      </section>
      <div className="build-gallery">
        <div className="build-list">
          {visibleSchemes.map((scheme) => {
            const schemeWeapon = getWeapon(scheme.weaponId);
            return (
              <article className="build-card" key={scheme.id}>
                <div className="build-card-title">
                  <div>
                    {scheme.tags.map((tag) => (
                      <button
                        className={filters.tags.includes(tag) ? 'active' : ''}
                        onClick={() => toggleFilter('tags', tag)}
                        key={tag}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="build-card-side">
                    <div className="build-modes">
                      {scheme.modes.map((modeId) => (
                        <button
                          className={`build-mode mode-${modeId} ${filters.modes.includes(modeId) ? 'active' : ''}`}
                          onClick={() => toggleFilter('modes', modeId)}
                          key={modeId}
                        >
                          {gameModes.find(({ id }) => id === modeId)?.label}
                        </button>
                      ))}
                    </div>
                    <small>内置示例 · 非攻略结论</small>
                  </div>
                </div>
                <div className="build-meta">
                  <b>INKLAB 示例</b>
                  <span>{scheme.id.replace('sample-', '方案 #')}</span>
                  <time>Ver. {DATA_VERSION}</time>
                </div>
                <div className="build-weapon">
                  <span className="weapon-badge">{schemeWeapon.badge}</span>
                  <div>
                    <small>使用武器</small>
                    <button
                      className={
                        filters.weaponIds.includes(schemeWeapon.id)
                          ? 'active'
                          : ''
                      }
                      onClick={() => toggleFilter('weaponIds', schemeWeapon.id)}
                    >
                      {schemeWeapon.name}
                    </button>
                    <em>
                      {schemeWeapon.sub.name} · {schemeWeapon.special}
                    </em>
                  </div>
                </div>
                <div className="submitted-gears">
                  {['头部', '服装', '鞋子'].map((part, row) => (
                    <div className="submitted-gear" key={part}>
                      <div
                        className={
                          'gear-reference ' +
                          (row === 2 ? 'with-reference' : '')
                        }
                      >
                        <span>
                          {row === 0 ? '帽' : row === 1 ? '衣' : '鞋'}
                        </span>
                        <small>
                          {row === 2 ? '可作为微调起点' : part + ' · 57AP 结构'}
                        </small>
                      </div>
                      <section>
                        {scheme.slots
                          .slice(row * 4, row * 4 + 4)
                          .map(([id, ap], i) => (
                            <div
                              className={i === 0 ? 'main' : ''}
                              key={`${id}-${i}`}
                            >
                              <AbilityIcon
                                ability={abilities.find((a) => a.id === id)}
                                small
                              />
                              <em>{ap}</em>
                            </div>
                          ))}
                      </section>
                    </div>
                  ))}
                </div>
                <div className="author-note">
                  <b>示例边界</b>
                  <p>{scheme.note}</p>
                </div>
                <div className="build-actions">
                  <button onClick={() => copyScheme(scheme)}>
                    <Copy size={14} />{' '}
                    {copyStatus === scheme.id
                      ? '链接已复制'
                      : copyStatus === 'error:' + scheme.id
                        ? '复制失败'
                        : '复制分享链接'}
                  </button>
                  <button
                    className="lab-action"
                    onClick={() =>
                      onOpen(scheme.weaponId, cloneSchemeSlots(scheme))
                    }
                  >
                    <Zap size={14} /> 打开实验室微调
                  </button>
                </div>
              </article>
            );
          })}
          {visibleSchemes.length === 0 ? (
            <div className="library-empty">
              <Search size={20} />
              <b>没有匹配的示例</b>
              <span>换一个武器名称或玩法标签试试。</span>
            </div>
          ) : null}
        </div>
        <aside className="card-anatomy">
          <small>真实可用的示例流程</small>
          <ol>
            <li>
              <b>01 搜索与标签</b>
              <span>按武器、玩法标签和说明筛选</span>
            </li>
            <li>
              <b>02 完整结构</b>
              <span>每套都包含 3 个主技能和 9 个小技能</span>
            </li>
            <li>
              <b>03 分享链接</b>
              <span>复制后可直接恢复武器与 57AP 配装</span>
            </li>
            <li>
              <b>04 带回实验室</b>
              <span>一键载入为自定义配装并继续替换能力</span>
            </li>
          </ol>
          <div>
            <Sparkles size={15} />
            <p>
              这里暂时只提供经过结构校验的内置示例；账号、投稿和审核仍留在
              Community Beta。
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="scheme-filter-row">
      <b>{label}</b>
      <div>{children}</div>
    </div>
  );
}
