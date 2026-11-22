'use client';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Eraser,
  Layers,
  Plus,
  RotateCcw,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  DATA_VERSION,
  getWeapon,
  weapons,
  type Weapon,
} from '@/lib/weapon-catalog';
import {
  calculateAbilityTotals,
  clearLoadout,
  clearLoadoutSlot,
  getNextLoadoutSlotIndex,
  replaceLoadoutSlot,
  totalAp,
  type EditableLoadoutSlot,
} from '@/lib/loadouts';
import { getSystemRecommendations } from '@/lib/system-recommendations';
import { exportLoadoutPng, normalizeTags } from '@/lib/export-loadout-png';
import {
  abilities,
  abilityFilterGroups,
  abilityParts,
  canPlaceAbilityInSlot,
  filterAbilitiesForSlot,
  filterExclusiveAbilitiesForPart,
  getAbilityAssetUrl,
  getAbilityPartForSlot,
  toggleSelectedPart,
  type Ability,
  type AbilityFilterGroup,
} from '@/lib/abilities';
import { AbilityIcon } from '@/components/ability-icon';
import { CommunitySamplePanel } from '@/components/community-sample-panel';
import { encodeLoadoutQuery, LOCAL_LOADOUT_KEY } from '@/lib/loadout-share';
import { resolveInitialEditorState } from '@/lib/editor-state';
import { WeaponPicker } from '@/components/weapon-picker';
import { SectionErrorBoundary } from '@/components/section-error-boundary';
import type { WeaponPickerItem } from '@/lib/weapon-picker';
import { getPageHash, parsePageHash, type PageId } from '@/lib/page-navigation';
import { buildAbilityContext } from '@/lib/ability-context';
import { getAbilityCurveDefinition } from '@/lib/ability-curves';
import {
  getMainWeaponAssetUrl,
  getSpecialWeaponAssetUrl,
  getSubWeaponAssetUrl,
} from '@/lib/weapon-assets';

const SalmonRunLab = lazy(() =>
  import('@/components/salmon-run-lab').then(({ SalmonRunLab }) => ({
    default: SalmonRunLab,
  })),
);

const AbilityWiki = lazy(() =>
  import('@/components/ability-wiki').then(({ AbilityWiki }) => ({
    default: AbilityWiki,
  })),
);

const SchemeLibrary = lazy(() =>
  import('@/components/scheme-library').then(({ SchemeLibrary }) => ({
    default: SchemeLibrary,
  })),
);

const MotionLab = lazy(() =>
  import('@/components/motion-lab').then(({ MotionLab }) => ({
    default: MotionLab,
  })),
);

const UniversalPlanner = lazy(() =>
  import('@/components/universal-planner').then(({ UniversalPlanner }) => ({
    default: UniversalPlanner,
  })),
);

const MainWeaponVerification = lazy(() =>
  import('@/components/main-weapon-verification').then(
    ({ MainWeaponVerification }) => ({ default: MainWeaponVerification }),
  ),
);

const MainWeaponEfficiencyPanel = lazy(() =>
  import('@/components/main-weapon-efficiency-panel').then(
    ({ MainWeaponEfficiencyPanel }) => ({ default: MainWeaponEfficiencyPanel }),
  ),
);

const MainInkSaverPanel = lazy(() =>
  import('@/components/main-ink-saver-panel').then(({ MainInkSaverPanel }) => ({
    default: MainInkSaverPanel,
  })),
);

const SubInkSaverPanel = lazy(() =>
  import('@/components/sub-ink-saver-panel').then(({ SubInkSaverPanel }) => ({
    default: SubInkSaverPanel,
  })),
);

const InkRecoveryPanel = lazy(() =>
  import('@/components/ink-recovery-panel').then(({ InkRecoveryPanel }) => ({
    default: InkRecoveryPanel,
  })),
);

const QuickSuperJumpPanel = lazy(() =>
  import('@/components/quick-super-jump-panel').then(
    ({ QuickSuperJumpPanel }) => ({ default: QuickSuperJumpPanel }),
  ),
);

const MovementSpeedPanel = lazy(() =>
  import('@/components/movement-speed-panel').then(
    ({ MovementSpeedPanel }) => ({ default: MovementSpeedPanel }),
  ),
);

const LoadoutContextAnalysis = lazy(() =>
  import('@/components/loadout-context-analysis').then(
    ({ LoadoutContextAnalysis }) => ({ default: LoadoutContextAnalysis }),
  ),
);

const initialRecommendations = getSystemRecommendations(
  getWeapon(weapons[0].id),
);
const initialSlots = initialRecommendations[0].slots.map(
  (slot) => [...slot] as EditableLoadoutSlot,
);
const mainWeaponPickerItems: readonly WeaponPickerItem[] = weapons.map(
  (weapon) => ({
    id: weapon.id,
    name: weapon.name,
    family: weapon.family,
    badge: weapon.badge,
    imageUrl: getMainWeaponAssetUrl(weapon.id),
    meta: `${weapon.sub.name} · ${weapon.special}`,
    tags: [weapon.role],
  }),
);
export default function Home() {
  const [page, setPage] = useState<PageId>('lab'),
    [labMode, setLabMode] = useState<'planner' | 'single'>('single');
  const [weaponId, setWeaponId] = useState(weapons[0].id);
  const [group, setGroup] = useState<AbilityFilterGroup>('全部'),
    [query, setQuery] = useState('');
  const [cardTitle, setCardTitle] = useState(''),
    [cardAuthor, setCardAuthor] = useState(''),
    [cardTags, setCardTags] = useState(''),
    [cardNote, setCardNote] = useState('');
  const [exportStatus, setExportStatus] = useState<
    'idle' | 'working' | 'saved' | 'error'
  >('idle');
  const [slots, setSlots] = useState<EditableLoadoutSlot[]>(initialSlots),
    [focus, setFocus] = useState('iss'),
    [activePreset, setActivePreset] = useState(0);
  const [recommendationSource, setRecommendationSource] = useState<
    'system' | 'community'
  >('system');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [draggedAbilityId, setDraggedAbilityId] = useState<string | null>(null);
  const [analysisApPreview, setAnalysisApPreview] = useState<number | null>(
    null,
  );
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  );
  const [localReady, setLocalReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState<
    'checking' | 'available' | 'unavailable'
  >('checking');
  useEffect(() => {
    const syncPageFromHash = () => setPage(parsePageHash(window.location.hash));
    syncPageFromHash();
    window.addEventListener('hashchange', syncPageFromHash);
    return () => window.removeEventListener('hashchange', syncPageFromHash);
  }, []);
  const selectedPart =
    selectedSlot === null ? null : getAbilityPartForSlot(selectedSlot);
  const filtered =
    selectedSlot === null
      ? []
      : filterAbilitiesForSlot({
          slotIndex: selectedSlot,
          filterGroup: group,
          query,
        }).filter(({ group: abilityGroup }) => !abilityGroup.endsWith('限定'));
  const exclusiveAbilities =
    selectedPart === null
      ? []
      : filterExclusiveAbilitiesForPart({
          partId: selectedPart.id,
          filterGroup: group,
          query,
        });
  const totals = useMemo(
    () =>
      calculateAbilityTotals(slots).map(({ id, ap }) => ({
        a: abilities.find((x) => x.id === id),
        ap,
      })),
    [slots],
  );
  const equippedAp = totalAp(slots);
  const equippedFocusAp = totals.find((x) => x.a?.id === focus)?.ap ?? 0;
  const currentAp = analysisApPreview ?? equippedFocusAp;
  const weapon = getWeapon(weaponId);
  const recommendations = useMemo(
    () => getSystemRecommendations(weapon),
    [weapon],
  );
  const currentPresetName = recommendations[activePreset]?.name ?? '自定义配装';
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const weaponIds = new Set(weapons.map(({ id }) => id)),
        abilityIds = new Set(abilities.map(({ id }) => id));
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(LOCAL_LOADOUT_KEY);
        setStorageStatus('available');
      } catch {
        setStorageStatus('unavailable');
      }
      const restored = resolveInitialEditorState({
        urlSearch: window.location.search,
        savedSearch: saved,
        defaultWeaponId: weapons[0].id,
        weaponIds,
        abilityIds,
      });
      if (restored.source !== 'default') {
        setWeaponId(restored.state.weaponId);
        setSlots(restored.state.slots);
        setActivePreset(-1);
        setFocus(restored.state.focus);
        setSelectedSlot(restored.state.selectedSlot);
      }
      setLocalReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (localReady) {
      let nextStorageStatus: 'available' | 'unavailable';
      try {
        localStorage.setItem(
          LOCAL_LOADOUT_KEY,
          encodeLoadoutQuery({ weaponId, slots }),
        );
        nextStorageStatus = 'available';
      } catch {
        nextStorageStatus = 'unavailable';
      }
      const timer = window.setTimeout(
        () => setStorageStatus(nextStorageStatus),
        0,
      );
      return () => window.clearTimeout(timer);
    }
  }, [localReady, slots, weaponId]);
  const applyRecommendation = (i: number) => {
    const recommendation = recommendations[i];
    if (!recommendation) return;
    setActivePreset(i);
    setSlots(
      recommendation.slots.map((slot) => [...slot] as EditableLoadoutSlot),
    );
    setSelectedSlot(0);
    setFocus(recommendation.focusAbilityId);
    setAnalysisApPreview(null);
  };
  const selectWeapon = (nextWeaponId: string) => {
    setWeaponId(nextWeaponId);
    setActivePreset(-1);
    setAnalysisApPreview(null);
  };
  const navigatePage = (nextPage: PageId) => {
    setPage(nextPage);
    const nextHash = getPageHash(nextPage);
    if (window.location.hash !== nextHash) window.location.hash = nextHash;
  };
  const openScheme = (
    nextWeaponId: string,
    nextSlots: EditableLoadoutSlot[],
  ) => {
    setWeaponId(nextWeaponId);
    setSlots(nextSlots);
    setActivePreset(-1);
    setSelectedSlot(0);
    setFocus(nextSlots[0]?.[0] ?? 'iss');
    setAnalysisApPreview(null);
    setPage('lab');
    setLabMode('single');
  };
  const selectAnalysis = (id: string) => {
    setFocus(id);
    setAnalysisApPreview(null);
  };
  const selectLoadoutSlot = (index: number) => {
    if (selectedSlot === index) {
      setSlots((current) => clearLoadoutSlot(current, index));
      setActivePreset(-1);
      setAnalysisApPreview(null);
      return;
    }
    setSelectedSlot(index);
    if (index % 4 !== 0 && group === '限定') setGroup('全部');
  };
  const selectAbilityPart = (firstSlot: number) => {
    setSelectedSlot((current) => toggleSelectedPart(current, firstSlot));
  };
  const selectAbilityGroup = (nextGroup: AbilityFilterGroup) => {
    setGroup(nextGroup);
    if (nextGroup === '限定' && selectedSlot !== null && selectedSlot % 4 !== 0)
      setSelectedSlot(getAbilityPartForSlot(selectedSlot).firstSlot);
  };
  const placeAbility = (id: string, index: number, advance: boolean) => {
    if (!canPlaceAbilityInSlot(id, index)) return;
    setSlots((current) => replaceLoadoutSlot(current, index, id));
    setActivePreset(-1);
    setFocus(id);
    setAnalysisApPreview(null);
    const next = advance ? getNextLoadoutSlotIndex(index) : index;
    setSelectedSlot(next);
    if (next % 4 !== 0 && group === '限定') setGroup('全部');
  };
  const replaceSelectedSlot = (id: string) => {
    if (selectedSlot !== null) placeAbility(id, selectedSlot, true);
  };
  const resetLoadout = () => {
    setSlots((current) => clearLoadout(current));
    setActivePreset(-1);
    setSelectedSlot(0);
    setAnalysisApPreview(null);
  };
  const copyShareLink = async () => {
    const query = encodeLoadoutQuery({ weaponId, slots }),
      url = `${window.location.origin}${window.location.pathname}?${query}`;
    window.history.replaceState(null, '', url);
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 1800);
    } catch {
      setShareStatus('error');
    }
  };
  const savePng = async () => {
    setExportStatus('working');
    const title = cardTitle.trim() || `${weapon.name} · ${currentPresetName}`;
    const tags = normalizeTags(cardTags);
    if (!tags.length)
      tags.push(weapon.family, currentPresetName, `${equippedAp}AP`);
    try {
      await exportLoadoutPng({
        title,
        author: cardAuthor.trim() || '匿名玩家',
        tags,
        note:
          cardNote.trim() ||
          `围绕 ${weapon.name} 的 ${currentPresetName} 方向继续微调。`,
        version: DATA_VERSION,
        weapon: {
          name: weapon.name,
          badge: weapon.badge,
          family: weapon.family,
          sub: weapon.sub.name,
          special: weapon.special,
          mainImageUrl: getMainWeaponAssetUrl(weapon.id),
          subImageUrl: getSubWeaponAssetUrl(weapon.sub.id),
          specialImageUrl: getSpecialWeaponAssetUrl(weapon.specialId),
        },
        slots: slots.map(([id, ap]) => {
          const ability = abilities.find((item) => item.id === id);
          return {
            short: ability?.short || '空槽',
            ap,
            iconUrl: id ? getAbilityAssetUrl(id) : undefined,
          };
        }),
        totals: totals.map(({ a, ap }) => ({
          short: a?.short || '未知',
          ap,
          iconUrl: a ? getAbilityAssetUrl(a.id) : undefined,
        })),
      });
      setExportStatus('saved');
      setTimeout(() => setExportStatus('idle'), 1800);
    } catch {
      setExportStatus('error');
    }
  };
  const pageMeta = {
    lab: { code: 'LAB-01', label: '配装实验区', zone: 'city' },
    salmon: { code: 'FIELD-02', label: '鲑鱼跑压力实验区', zone: 'field' },
    wiki: { code: 'INDEX-03', label: '能力资料索引', zone: 'city' },
    library: { code: 'ARCHIVE-04', label: '玩家样本档案', zone: 'city' },
    motion: { code: 'RIG-05', label: '操作校准区', zone: 'field' },
  }[page];
  const operationAnnouncement =
    exportStatus === 'saved'
      ? '配装图片已保存。'
      : exportStatus === 'error'
        ? '配装图片保存失败，可以重试。'
        : shareStatus === 'copied'
          ? '分享链接已复制。'
          : shareStatus === 'error'
            ? '分享链接复制失败，链接已写入浏览器地址栏。'
            : storageStatus === 'unavailable'
              ? '浏览器本地存储不可用，本次编辑不会自动保存在此浏览器。'
              : '';
  return (
    <main className={`lab-surface zone-${pageMeta.zone}`}>
      <output className="visually-hidden" aria-live="polite" aria-atomic="true">
        {operationAnnouncement}
      </output>
      <header className="topbar">
        <div className="brand">
          <span>S3</span>
          <div>
            INKLAB <b>墨水研究与配装实验室</b>
          </div>
        </div>
        <nav>
          <button
            type="button"
            data-code="01"
            className={page === 'lab' ? 'active' : ''}
            aria-pressed={page === 'lab'}
            onClick={() => {
              navigatePage('lab');
              setLabMode('single');
            }}
          >
            实验室
          </button>
          <button
            type="button"
            data-code="02"
            className={page === 'salmon' ? 'active' : ''}
            aria-pressed={page === 'salmon'}
            onClick={() => navigatePage('salmon')}
          >
            鲑鱼跑实验室
          </button>
          <button
            type="button"
            data-code="03"
            className={page === 'wiki' ? 'active' : ''}
            aria-pressed={page === 'wiki'}
            onClick={() => navigatePage('wiki')}
          >
            能力百科
          </button>
          <button
            type="button"
            data-code="04"
            className={page === 'library' ? 'active' : ''}
            aria-pressed={page === 'library'}
            onClick={() => navigatePage('library')}
          >
            玩家方案
          </button>
          <button
            type="button"
            data-code="05"
            className={page === 'motion' ? 'active' : ''}
            aria-pressed={page === 'motion'}
            onClick={() => navigatePage('motion')}
          >
            操作实验
          </button>
        </nav>
        <output className="ghost lab-system-status" aria-label="本地系统在线">
          <i /> 系统在线 <small>LOCAL</small>
        </output>
      </header>
      <div className="lab-telemetry" aria-label="当前实验室状态">
        <span>
          <i /> INKLAB RESEARCH SYSTEM
        </span>
        <b>
          {pageMeta.code} / {pageMeta.label}
        </b>
        <span>DATASET / VER.{DATA_VERSION}</span>
        <span>SESSION / LOCAL</span>
      </div>
      <SectionErrorBoundary key={page} sectionLabel={pageMeta.label}>
        {page === 'salmon' ? (
          <Suspense
            fallback={
              <section
                className="workspace page-loading-state"
                aria-live="polite"
              >
                <small>SALMON RUN LAB / LOADING</small>
                <h1>正在载入鲑鱼跑实验室…</h1>
                <p>正在准备打工武器、轮换与压力实验数据。</p>
              </section>
            }
          >
            <SalmonRunLab />
          </Suspense>
        ) : page === 'wiki' ? (
          <Suspense
            fallback={
              <section
                className="workspace page-loading-state"
                aria-live="polite"
              >
                <small>ABILITY INDEX / LOADING</small>
                <h1>正在载入能力百科…</h1>
                <p>正在准备能力目录、筛选和核验状态。</p>
              </section>
            }
          >
            <AbilityWiki
              focus={focus}
              setFocus={setFocus}
              onOpenLab={() => {
                navigatePage('lab');
                setLabMode('single');
                setSelectedSlot(0);
              }}
            />
          </Suspense>
        ) : page === 'library' ? (
          <Suspense
            fallback={
              <section
                className="workspace page-loading-state"
                aria-live="polite"
              >
                <small>PLAYER BUILDS / LOADING</small>
                <h1>正在载入玩家方案库…</h1>
                <p>正在准备组合标签、完整配装与分享入口。</p>
              </section>
            }
          >
            <SchemeLibrary onOpen={openScheme} />
          </Suspense>
        ) : page === 'motion' ? (
          <Suspense
            fallback={
              <section
                className="workspace page-loading-state"
                aria-live="polite"
              >
                <small>CONTROL LAB / LOADING</small>
                <h1>正在载入鱿鱼滚行练习器…</h1>
                <p>正在准备输入监听、练习判定与行动轨迹。</p>
              </section>
            }
          >
            <MotionLab />
          </Suspense>
        ) : (
          <>
            <div className="lab-switch">
              <button
                type="button"
                className={labMode === 'single' ? 'active' : ''}
                onClick={() => setLabMode('single')}
              >
                <Zap size={15} /> 单套配装分析
              </button>
              <button
                type="button"
                className={labMode === 'planner' ? 'active' : ''}
                onClick={() => setLabMode('planner')}
              >
                <Layers size={15} /> 通用装备规划
              </button>
            </div>
            {labMode === 'planner' ? (
              <Suspense
                fallback={
                  <section
                    className="workspace page-loading-state"
                    aria-live="polite"
                  >
                    <small>SHARED GEAR / LOADING</small>
                    <h1>正在载入通用装备规划…</h1>
                    <p>正在准备多武器需求与实验分支草案。</p>
                  </section>
                }
              >
                <UniversalPlanner />
              </Suspense>
            ) : (
              <section className="workspace analyzer-workspace">
                <div className="intro">
                  <div>
                    <em>WEAPON LAB / EXP-001</em>
                    <h1>武器配装分析器</h1>
                    <p>左侧调整实验条件，右侧读取与当前武器绑定的实际收益。</p>
                    <div className="lab-protocol">
                      <span>
                        <i /> 实验运行中
                      </span>
                      <b>PROTOCOL / LOADOUT-ANALYSIS</b>
                      <small>输入可随时修改</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="primary compact"
                    disabled={exportStatus === 'working'}
                    onClick={savePng}
                  >
                    {exportStatus === 'saved' ? (
                      <Check size={15} />
                    ) : (
                      <Download size={15} />
                    )}{' '}
                    {exportStatus === 'working'
                      ? '正在生成'
                      : exportStatus === 'saved'
                        ? '已保存 PNG'
                        : exportStatus === 'error'
                          ? '保存失败，重试'
                          : '保存配装图'}
                  </button>
                </div>
                <div className="layout analyzer-layout">
                  <section className="builder control-column">
                    <Title n="01" text="要分析的武器">
                      <small>
                        {weapons.length} 把可选 · {weapons.length}{' '}
                        把已有核验字段
                      </small>
                    </Title>
                    <div className="weapon-kit-card">
                      <div className="specimen-meta">
                        <span>
                          SAMPLE / WPN-
                          {String(weapon.upstreamId).padStart(4, '0')}
                        </span>
                        <b>
                          <i /> 数据样本已装载
                        </b>
                      </div>
                      <header className="weapon-kit-title">
                        <WeaponPicker
                          items={mainWeaponPickerItems}
                          value={weaponId}
                          onChange={selectWeapon}
                          title="选择要分析的武器"
                          description="按武器种类浏览，或搜索名称、副武器、特殊武器与定位标签。"
                          triggerClassName="weapon-title-picker"
                          triggerLabel={`更换武器，当前为${weapon.name}`}
                          trigger={<span>{weapon.name}</span>}
                        />
                      </header>
                      <div className="weapon-kit-visual">
                        <div
                          className="weapon-main-visual"
                          aria-label={`主武器：${weapon.name}`}
                        >
                          <div className="weapon-image-placeholder">
                            <span>MAIN WEAPON / 主武器大图</span>
                            {/* oxlint-disable-next-line next/no-img-element -- Versioned local PNGs keep their audited upstream bytes and hashes. */}
                            <img
                              src={getMainWeaponAssetUrl(weapon.id)}
                              alt={`${weapon.name} 主武器图标`}
                              onError={(event) => {
                                event.currentTarget.hidden = true;
                              }}
                            />
                            <strong aria-hidden="true">{weapon.badge}</strong>
                            <em>IMAGE SOURCE / LEAN</em>
                          </div>
                          <p>
                            <b>{weapon.family}</b>
                            <span>{weapon.role}</span>
                          </p>
                        </div>
                        <div className="weapon-side-visuals">
                          <div aria-label={`副武器：${weapon.sub.name}`}>
                            <span>SUB / 副武器</span>
                            {/* oxlint-disable-next-line next/no-img-element -- Versioned local PNGs keep their audited upstream bytes and hashes. */}
                            <img
                              src={getSubWeaponAssetUrl(weapon.sub.id)}
                              alt={`${weapon.sub.name} 副武器图标`}
                              onError={(event) => {
                                event.currentTarget.hidden = true;
                              }}
                            />
                            <strong>{weapon.sub.name}</strong>
                            <small>Data provided by Lean</small>
                          </div>
                          <div aria-label={`特殊武器：${weapon.special}`}>
                            <span>SPECIAL / 特殊武器</span>
                            {/* oxlint-disable-next-line next/no-img-element -- Versioned local PNGs keep their audited upstream bytes and hashes. */}
                            <img
                              src={getSpecialWeaponAssetUrl(weapon.specialId)}
                              alt={`${weapon.special} 特殊武器图标`}
                              onError={(event) => {
                                event.currentTarget.hidden = true;
                              }}
                            />
                            <strong>{weapon.special}</strong>
                            <small>Data provided by Lean</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Title n="02" text="推荐配装">
                      {recommendationSource === 'system' ? (
                        <button
                          type="button"
                          onClick={() => applyRecommendation(0)}
                        >
                          <RotateCcw size={14} />
                          应用主武基础型
                        </button>
                      ) : (
                        <small>社区模块预留</small>
                      )}
                    </Title>
                    <div
                      className="recommendation-source-tabs"
                      role="tablist"
                      aria-label="推荐来源"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={recommendationSource === 'system'}
                        className={
                          recommendationSource === 'system' ? 'active' : ''
                        }
                        onClick={() => setRecommendationSource('system')}
                      >
                        系统建议<small>规则生成</small>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={recommendationSource === 'community'}
                        className={
                          recommendationSource === 'community' ? 'active' : ''
                        }
                        onClick={() => setRecommendationSource('community')}
                      >
                        玩家样本<small>投稿聚类</small>
                      </button>
                    </div>
                    {recommendationSource === 'system' ? (
                      <>
                        <div className="system-recommendation-note">
                          <b>原型推断</b>
                          <span>
                            仅使用武器族与已核对套装，不含外部或内测样本
                          </span>
                        </div>
                        <div className="presets vertical system-presets">
                          {recommendations.map((recommendation, i) => (
                            <button
                              type="button"
                              className={activePreset === i ? 'picked' : ''}
                              key={recommendation.id}
                              onClick={() => applyRecommendation(i)}
                            >
                              <b>0{i + 1}</b>
                              <div>
                                <strong>{recommendation.name}</strong>
                                <small>{recommendation.desc}</small>
                                <em>{recommendation.rationale}</em>
                              </div>
                              {activePreset === i ? (
                                <Check size={17} />
                              ) : (
                                <Plus size={17} />
                              )}
                            </button>
                          ))}
                        </div>
                        {activePreset >= 0 && (
                          <div className="system-evidence">
                            <b>这套建议为什么出现</b>
                            {recommendations[activePreset].evidence.map(
                              (item) => (
                                <span key={item}>· {item}</span>
                              ),
                            )}
                            <small>建议强度尚未由对局或玩家样本验证</small>
                          </div>
                        )}
                      </>
                    ) : (
                      <CommunitySamplePanel weaponId={weapon.id} />
                    )}
                    <div className="loadout-title">
                      <div>
                        <h3>{currentPresetName}</h3>
                        <small>
                          {!localReady || storageStatus === 'checking'
                            ? '正在读取本机配装'
                            : storageStatus === 'available'
                              ? '已自动保存在此浏览器'
                              : '本地存储不可用 · 可复制链接保留配装'}
                        </small>
                      </div>
                      <div className="loadout-actions">
                        <button type="button" onClick={resetLoadout}>
                          <Eraser size={13} />
                          清空配装
                        </button>
                        <button type="button" onClick={copyShareLink}>
                          <Copy size={13} />
                          {shareStatus === 'copied'
                            ? '链接已复制'
                            : shareStatus === 'error'
                              ? '复制失败'
                              : '复制分享链接'}
                        </button>
                        <b>{equippedAp} / 57 AP</b>
                      </div>
                    </div>
                    <div className="gear-stack compact-gears">
                      {['头部', '服装', '鞋子'].map((g, r) => (
                        <div className="gear" key={g}>
                          <div>
                            <span>{['帽', '衣', '鞋'][r]}</span>
                            <small>{g}</small>
                          </div>
                          <section>
                            {slots
                              .slice(r * 4, r * 4 + 4)
                              .map(([id, ap], i) => {
                                const index = r * 4 + i,
                                  isSelected = selectedSlot === index,
                                  canDrop =
                                    draggedAbilityId !== null &&
                                    canPlaceAbilityInSlot(
                                      draggedAbilityId,
                                      index,
                                    );
                                return (
                                  <button
                                    type="button"
                                    data-slot-index={index}
                                    aria-label={`${g}${i === 0 ? '主技能' : '小技能'}槽位${id ? '，当前已装备' : '，当前为空'}`}
                                    aria-pressed={isSelected}
                                    title={
                                      isSelected && id
                                        ? `再次点击移除${g}${i === 0 ? '主技能' : '小技能'}`
                                        : `选择${g}${i === 0 ? '主技能' : '小技能'}槽位`
                                    }
                                    className={`${i === 0 ? 'main ' : ''}${isSelected ? 'selected-slot ' : ''}${id === null ? 'empty-slot ' : ''}${canDrop ? 'drag-available' : ''}`}
                                    key={index}
                                    onClick={() => selectLoadoutSlot(index)}
                                    onDragOver={(event) => {
                                      if (canDrop) {
                                        event.preventDefault();
                                        event.dataTransfer.dropEffect = 'copy';
                                      }
                                    }}
                                    onDrop={(event) => {
                                      event.preventDefault();
                                      const abilityId =
                                        event.dataTransfer.getData(
                                          'text/plain',
                                        );
                                      if (abilityId)
                                        placeAbility(abilityId, index, false);
                                      setDraggedAbilityId(null);
                                    }}
                                  >
                                    <AbilityIcon
                                      small
                                      ability={abilities.find(
                                        (a) => a.id === id,
                                      )}
                                    />
                                    {id !== null && <em>{ap}</em>}
                                  </button>
                                );
                              })}
                          </section>
                        </div>
                      ))}
                    </div>
                    <Title n="03" text="装备能力碎片">
                      <small>
                        {selectedPart && selectedSlot !== null
                          ? `${selectedPart.label} · 第 ${(selectedSlot % 4) + 1} 槽 · 点击连续填装，或拖到任意槽位`
                          : '未选择槽位 · 点击配装槽或装备部位开始'}
                      </small>
                    </Title>
                    <div
                      className="ability-part-tabs"
                      role="tablist"
                      aria-label="装备部位"
                    >
                      {abilityParts.map((part) => {
                        const active = selectedPart?.id === part.id;
                        return (
                          <button
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={active ? 'active' : ''}
                            key={part.id}
                            onClick={() => selectAbilityPart(part.firstSlot)}
                          >
                            <b>{part.label}</b>
                            <small>
                              {part.id === 'head'
                                ? '头'
                                : part.id === 'clothes'
                                  ? '身'
                                  : '脚'}
                            </small>
                          </button>
                        );
                      })}
                    </div>
                    <div className="filter mini-filter ability-category-filter">
                      <div>
                        {abilityFilterGroups.map((filterGroup) => (
                          <button
                            type="button"
                            key={filterGroup}
                            className={group === filterGroup ? 'active' : ''}
                            onClick={() => selectAbilityGroup(filterGroup)}
                          >
                            {filterGroup}
                          </button>
                        ))}
                      </div>
                      <label>
                        <Search size={14} />
                        <input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="搜索碎片"
                        />
                      </label>
                    </div>
                    {selectedSlot === null ? (
                      <div className="stone-pool-empty">
                        <b>当前没有选中槽位</b>
                        <span>
                          选择上方头部、服装、鞋子，或直接点击配装中的能力槽。
                        </span>
                      </div>
                    ) : (
                      <div className="stone-pool-groups">
                        {exclusiveAbilities.length > 0 && (
                          <section className="exclusive-ability-shelf">
                            <header>
                              <b>{selectedPart?.label}限定能力</b>
                              <span>仅可装入对应部位的主技能格</span>
                            </header>
                            <div className="stone-pool stone-pool-exclusive">
                              {exclusiveAbilities.map((a) => (
                                <button
                                  type="button"
                                  draggable
                                  aria-label={a.name}
                                  title={`${a.name}：点击装入${selectedPart?.label}主技能格，或拖动放入`}
                                  key={a.id}
                                  onClick={() =>
                                    selectedPart &&
                                    placeAbility(
                                      a.id,
                                      selectedPart.firstSlot,
                                      true,
                                    )
                                  }
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData(
                                      'text/plain',
                                      a.id,
                                    );
                                    event.dataTransfer.effectAllowed = 'copy';
                                    setDraggedAbilityId(a.id);
                                  }}
                                  onDragEnd={() => setDraggedAbilityId(null)}
                                >
                                  <AbilityIcon ability={a} />
                                  <small>{a.name}</small>
                                </button>
                              ))}
                            </div>
                          </section>
                        )}
                        {exclusiveAbilities.length > 0 &&
                          filtered.length > 0 && (
                            <div className="stone-pool-divider">
                              <span>通用能力碎片</span>
                            </div>
                          )}
                        {filtered.length > 0 && (
                          <div className="stone-pool">
                            {filtered.map((a) => (
                              <button
                                type="button"
                                draggable
                                aria-label={a.name}
                                title={`${a.name}：点击填入第 ${selectedSlot + 1} 槽，或拖到其他槽位`}
                                key={a.id}
                                onClick={() => replaceSelectedSlot(a.id)}
                                onDragStart={(event) => {
                                  event.dataTransfer.setData(
                                    'text/plain',
                                    a.id,
                                  );
                                  event.dataTransfer.effectAllowed = 'copy';
                                  setDraggedAbilityId(a.id);
                                }}
                                onDragEnd={() => setDraggedAbilityId(null)}
                              >
                                <AbilityIcon ability={a} />
                                <small>{a.name}</small>
                              </button>
                            ))}
                          </div>
                        )}
                        {exclusiveAbilities.length === 0 &&
                          filtered.length === 0 && (
                            <div className="stone-pool-empty">
                              <b>没有符合条件的碎片</b>
                              <span>切换分类或清除搜索词后再试。</span>
                            </div>
                          )}
                      </div>
                    )}
                  </section>
                  <aside className="analysis-column">
                    <div className="analysis-head">
                      <div>
                        <small>MEASUREMENT CONSOLE / LIVE</small>
                        <h2>{weapon.name} 的配装结果</h2>
                      </div>
                      <span>
                        <i /> 游戏版本 {DATA_VERSION}
                      </span>
                    </div>
                    <div className="context-strip">
                      <div>
                        <b>主要武器</b>
                        <span>{weapon.name}</span>
                      </div>
                      <div>
                        <b>次要武器</b>
                        <span>{weapon.sub.name}</span>
                      </div>
                      <div>
                        <b>特殊武器</b>
                        <span>{weapon.special}</span>
                      </div>
                    </div>
                    <Suspense
                      fallback={
                        <p className="parameter-public-note">
                          正在读取参数核验状态…
                        </p>
                      }
                    >
                      <MainWeaponVerification weaponId={weapon.id} />
                    </Suspense>
                    <details className="export-settings export-settings-collapsible">
                      <summary>
                        <div>
                          <Download size={16} />
                          <span>
                            <b>配装图片信息</b>
                            <small>可选 · 留空会自动生成</small>
                          </span>
                        </div>
                        <em>展开填写</em>
                      </summary>
                      <div className="export-fields">
                        <label>
                          标题
                          <input
                            maxLength={30}
                            value={cardTitle}
                            onChange={(e) => setCardTitle(e.target.value)}
                            placeholder={`${weapon.name} · ${currentPresetName}`}
                          />
                        </label>
                        <label>
                          作者
                          <input
                            maxLength={18}
                            value={cardAuthor}
                            onChange={(e) => setCardAuthor(e.target.value)}
                            placeholder="匿名玩家"
                          />
                        </label>
                        <label className="wide">
                          标签
                          <input
                            maxLength={40}
                            value={cardTags}
                            onChange={(e) => setCardTags(e.target.value)}
                            placeholder={`${weapon.family}，${currentPresetName}，${equippedAp}AP`}
                          />
                        </label>
                        <label className="wide">
                          一句话
                          <textarea
                            maxLength={70}
                            rows={2}
                            value={cardNote}
                            onChange={(e) => setCardNote(e.target.value)}
                            placeholder={`围绕 ${weapon.name} 的 ${currentPresetName} 方向继续微调。`}
                          />
                        </label>
                        <p>这些内容只用于生成本机 PNG，不会上传服务器。</p>
                      </div>
                    </details>
                    <div className="analysis-summary">
                      <h3>
                        选择要分析的能力{' '}
                        <small>仅影响右侧说明，不修改配装</small>
                      </h3>
                      <div>
                        {totals.map((x) => (
                          <button
                            type="button"
                            aria-pressed={focus === x.a?.id}
                            className={
                              focus === x.a?.id ? 'selected-analysis' : ''
                            }
                            key={x.a?.id}
                            onClick={() => selectAnalysis(x.a?.id || 'iss')}
                          >
                            <AbilityIcon small ability={x.a} />
                            <span>{x.a?.short}</span>
                            <b>{x.ap}AP</b>
                          </button>
                        ))}
                      </div>
                    </div>
                    <EffectPanel
                      weapon={weapon}
                      id={focus}
                      ap={currentAp}
                      setAp={setAnalysisApPreview}
                      isPreview={analysisApPreview !== null}
                      equippedAp={equippedFocusAp}
                      clearPreview={() => setAnalysisApPreview(null)}
                      hasStealthJump={totals.some(
                        ({ a }) => a?.id === 'stealth',
                      )}
                      hasNinjaSquid={totals.some(({ a }) => a?.id === 'ninja')}
                    />
                    <div className="accordions">
                      <Suspense
                        fallback={
                          <p className="parameter-public-note">
                            正在载入武器分析…
                          </p>
                        }
                      >
                        <MainWeaponEfficiencyPanel weaponId={weapon.id} />
                      </Suspense>
                      <Suspense
                        fallback={
                          <p className="parameter-public-note">
                            正在整理当前配装上下文…
                          </p>
                        }
                      >
                        <LoadoutContextAnalysis
                          weapon={weapon}
                          totals={totals.map(({ a, ap }) => ({
                            id: a?.id ?? '',
                            ap,
                          }))}
                        />
                      </Suspense>
                    </div>
                    <div className="notice">
                      <Check size={15} />
                      <p>
                        <b>分析上下文已由 weaponId 驱动</b>
                        <br />
                        当前结论以 {weapon.name}、{weapon.sub.name}、
                        {weapon.special} 与现有 {equippedAp}AP 配装为前提。
                      </p>
                    </div>
                    <p className="note">
                      套装关系已核对 · 续航、快跳与基础移动曲线已核对 · 其余 AP
                      效果曲线仍在验证
                    </p>
                  </aside>
                </div>
              </section>
            )}
          </>
        )}
      </SectionErrorBoundary>
      <footer className="legal-footer">
        <b>INKLAB 是非官方玩家工具</b>
        <span>
          © 2026 wezoItachi 与 INKLAB 贡献者。Splatoon
          及游戏内能力图标的商标与版权归 Nintendo
          所有。本站使用官方图标仅用于能力辨认，与 Nintendo
          无隶属、授权或合作关系。
        </span>
        <a
          href="https://github.com/sendou-ink/assets"
          target="_blank"
          rel="noreferrer"
        >
          图标来源
        </a>
        <a
          href="https://github.com/wezoItachi/inklab"
          target="_blank"
          rel="noreferrer"
        >
          源代码
        </a>
        <a
          href="https://github.com/wezoItachi/inklab/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
        >
          AGPL-3.0 · 不提供担保
        </a>
        <span className="weapon-data-credit">
          <a
            href="https://github.com/Leanny/splat3"
            target="_blank"
            rel="noreferrer"
          >
            Data provided by Lean
          </a>
          <em>Ver. {DATA_VERSION}</em>
        </span>
      </footer>
    </main>
  );
}
function Title({
  n,
  text,
  children,
}: {
  n: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="title">
      <div>
        <span>{n}</span>
        <h3>{text}</h3>
      </div>
      {children}
    </div>
  );
}
function EffectPanel({
  weapon,
  id,
  ap,
  setAp,
  isPreview,
  equippedAp,
  clearPreview,
  hasStealthJump,
  hasNinjaSquid,
}: {
  weapon: Weapon;
  id: string;
  ap: number;
  setAp: (ap: number) => void;
  isPreview: boolean;
  equippedAp: number;
  clearPreview: () => void;
  hasStealthJump: boolean;
  hasNinjaSquid: boolean;
}) {
  const a = abilities.find((x) => x.id === id);
  const isMain = id === 'ism';
  const isSub = id === 'iss';
  const isInkRecovery = id === 'iru';
  const isQuickSuperJump = id === 'qsj';
  const movementAbilityId = id === 'ssu' || id === 'rsu' ? id : null;
  const isSubPower = id === 'subp';
  const genericContext = a ? buildAbilityContext(a, weapon, ap) : null;
  const curve = getAbilityCurveDefinition(id);
  return (
    <section className="effect-panel">
      <div className="effect-head">
        <div>
          <span>03</span>
          <h3>{a?.short} 对当前武器有什么用？</h3>
        </div>
        <b>
          <Zap size={13} /> 武器上下文
        </b>
      </div>
      {isMain ? (
        <Suspense
          fallback={<p className="parameter-public-note">正在计算主武省墨…</p>}
        >
          <MainInkSaverPanel
            weapon={weapon}
            ability={a}
            ap={ap}
            setAp={setAp}
            isPreview={isPreview}
            equippedAp={equippedAp}
            clearPreview={clearPreview}
          />
        </Suspense>
      ) : isSub ? (
        <Suspense
          fallback={<p className="parameter-public-note">正在计算副武省墨…</p>}
        >
          <SubInkSaverPanel
            weapon={weapon}
            ability={a}
            ap={ap}
            setAp={setAp}
            isPreview={isPreview}
            equippedAp={equippedAp}
            clearPreview={clearPreview}
          />
        </Suspense>
      ) : isInkRecovery ? (
        <Suspense
          fallback={<p className="parameter-public-note">正在计算回墨时间…</p>}
        >
          <InkRecoveryPanel
            weapon={weapon}
            ability={a}
            ap={ap}
            setAp={setAp}
            isPreview={isPreview}
            equippedAp={equippedAp}
            clearPreview={clearPreview}
          />
        </Suspense>
      ) : isQuickSuperJump ? (
        <Suspense
          fallback={<p className="parameter-public-note">正在计算超级跳跃时间…</p>}
        >
          <QuickSuperJumpPanel
            weapon={weapon}
            ability={a}
            ap={ap}
            setAp={setAp}
            isPreview={isPreview}
            equippedAp={equippedAp}
            clearPreview={clearPreview}
            hasStealthJump={hasStealthJump}
          />
        </Suspense>
      ) : movementAbilityId ? (
        <Suspense
          fallback={<p className="parameter-public-note">正在计算移动速度…</p>}
        >
          <MovementSpeedPanel
            weapon={weapon}
            ability={a}
            abilityId={movementAbilityId}
            ap={ap}
            setAp={setAp}
            isPreview={isPreview}
            equippedAp={equippedAp}
            clearPreview={clearPreview}
            hasNinjaSquid={hasNinjaSquid}
          />
        </Suspense>
      ) : isSubPower ? (
        <SubPowerPanel weapon={weapon} a={a} ap={ap} />
      ) : (
        <>
          <div className="effect-main generic">
            <AbilityIcon ability={a} />
            <div>
              <small>
                {weapon.name} · 当前 {ap}AP
              </small>
              <strong>{a?.name}</strong>
              <p>
                当前先展示可核对的规则语义；效果曲线、临界点与推荐投入量继续保持待验证。
              </p>
            </div>
            <span>
              {curve.status === 'not-applicable'
                ? '固定能力 · 曲线不适用'
                : genericContext?.verification === 'rule-only'
                  ? '规则已识别'
                  : '曲线待验证'}
            </span>
          </div>
          {genericContext && (
            <div className="ability-context-grid">
              <article>
                <small>实验区</small>
                <strong>{genericContext.experimentArea}</strong>
                <p>按能力分类进入对应的实验与证据队列。</p>
              </article>
              <article>
                <small>生效条件</small>
                <strong>{genericContext.activation}</strong>
                <p>先区分常驻、条件触发与部位限定，不混成同一种 AP。</p>
              </article>
              <article>
                <small>当前作用对象</small>
                <strong>{genericContext.target}</strong>
                <p>{genericContext.targetNote}</p>
              </article>
            </div>
          )}
          {genericContext && (
            <p className="judgement">
              <TrendingUp size={14} />
              <b>当前结论：</b>
              {genericContext.conclusion}
            </p>
          )}
        </>
      )}
    </section>
  );
}
function SubPowerPanel({
  weapon,
  a,
  ap,
}: {
  weapon: Weapon;
  a?: Ability;
  ap: number;
}) {
  return (
    <>
      <div className="effect-main sub-context">
        <AbilityIcon ability={a} />
        <div>
          <small>
            {weapon.name} · 当前副武器：{weapon.sub.name}
          </small>
          <strong>
            {weapon.sub.subPowerEffect
              ? `提升${weapon.sub.subPowerEffect}`
              : '作用对象待验证'}
          </strong>
          <p>
            副武器性能提升的作用会随副武器改变；未核对的副武器不会沿用其他副武器的说明。
          </p>
        </div>
        <span>套装已联动</span>
      </div>
      <div className="impact-matrix">
        <div className="yes">
          <Check size={14} />
          <span>
            <b>{weapon.sub.subPowerEffect ?? '待验证'}</b>
            <small>具体对象与幅度以字段核验为准</small>
          </span>
        </div>
        {weapon.sub.subPowerDoesNotChange.map((item) => (
          <div key={item}>
            <b>—</b>
            <span>
              <strong>{item}</strong>
              <small>不变</small>
            </span>
          </div>
        ))}
      </div>
      <p className="effect-boundary">
        当前只读取左侧配装中的 {ap}
        AP；作用对象与增量曲线完全核验前，不显示推荐试投档位。
      </p>
      <div className="sub-compare">
        <b>当前套装</b>
        <span>
          <strong>
            {weapon.name} · {weapon.sub.name}
          </strong>
        </span>
        <span>
          <Check size={13} /> {weapon.sub.subPowerEffect ?? '作用对象待验证'}
        </span>
        <span>
          —{' '}
          {weapon.sub.subPowerDoesNotChange.length
            ? weapon.sub.subPowerDoesNotChange.join('、')
            : '不变项待验证'}
        </span>
      </div>
      <p className="judgement">
        <TrendingUp size={14} />
        <b>配装建议：</b>先根据你实际使用 {weapon.sub.name}{' '}
        的频率判断是否投入；精确 AP 收益将在版本参数通过测试后补充。
      </p>
    </>
  );
}
