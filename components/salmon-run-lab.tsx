'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  ExternalLink,
  RefreshCw,
  Waves,
} from 'lucide-react';
import {
  getCompositionAnalysis,
  GRIZZCO_FAMILY,
  grizzcoWeapons,
  matchSalmonWeapon,
  regularSalmonWeapons,
  salmonWeapons,
  selectActiveRotation,
  type SalmonRotation,
} from '@/lib/salmon-run';
import {
  getSalmonScheduleRefreshDelay,
  localizeSalmonStageName,
  parseSalmonScheduleEnvelope,
  readSalmonScheduleCache,
  writeSalmonScheduleCache,
  type SalmonScheduleEnvelope,
} from '@/lib/salmon-schedule';
import { WeaponPicker } from '@/components/weapon-picker';
import type { WeaponPickerItem } from '@/lib/weapon-picker';
import {
  analyzeTargetActions,
  compareSalmonPressure,
  getSalmonWeaponPerformance,
  rushTargets,
  salmonPressurePresets,
  salmonTargets,
  type SalmonPressureStrategy,
} from '@/lib/salmon-pressure';
import {
  assessSalmonComposition,
  assessSalmonEvents,
} from '@/lib/salmon-assessment';

const defaultIds = [
  'splat-roller',
  'splattershot',
  'heavy-splatling',
  'splat-charger',
];
const salmonWeaponPickerItems: readonly WeaponPickerItem[] = salmonWeapons.map(
  (weapon) => ({
    id: weapon.id,
    name: weapon.name,
    family: weapon.family,
    meta: weapon.family === GRIZZCO_FAMILY ? '熊武' : '打工武器',
    tags: weapon.tags,
  }),
);

export function SalmonRunLab() {
  const [selectedIds, setSelectedIds] = useState(defaultIds),
    [rotation, setRotation] = useState<SalmonRotation | null>(null);
  const [status, setStatus] = useState<'loading' | 'live' | 'cached' | 'error'>(
      'loading',
    ),
    [scheduleFetchedAt, setScheduleFetchedAt] = useState<string | null>(null),
    [pressureStrategy, setPressureStrategy] =
      useState<SalmonPressureStrategy>('synchronized');
  const [targetId, setTargetId] = useState('rush-goldie'),
    [customTargetHealth, setCustomTargetHealth] = useState(500);
  const manuallyEdited = useRef(false);
  const refreshSchedule = useRef<() => void>(() => {});
  const selected = selectedIds.map(
    (id) => salmonWeapons.find((item) => item.id === id) ?? salmonWeapons[0],
  );
  const analysis = getCompositionAnalysis(selected);
  const compositionAssessment = assessSalmonComposition(selected);
  const eventAssessments = assessSalmonEvents(selected);
  const liveMatches =
    rotation?.weapons.map((item) => matchSalmonWeapon(item.name)) ?? [];
  const canApplyLive = liveMatches.length === 4 && liveMatches.every(Boolean);
  const verifiedDps = selectedIds.filter(
    (id) => getSalmonWeaponPerformance(id) !== null,
  ).length;
  const pressure = compareSalmonPressure(selectedIds, pressureStrategy);
  const pressureComparison =
    pressure.limit.ready && pressure.routine.ready
      ? { limit: pressure.limit, routine: pressure.routine }
      : null;
  const selectedTarget =
    salmonTargets.find((target) => target.id === targetId) ?? salmonTargets[0];
  const targetSolutions = selected.map((weapon) => {
    const performance = getSalmonWeaponPerformance(weapon.id);
    return performance
      ? {
          weapon,
          limit: analyzeTargetActions(performance.limit, customTargetHealth),
          routine: analyzeTargetActions(
            performance.routine,
            customTargetHealth,
          ),
          performance,
        }
      : null;
  });
  const targetCategories = [
    ...new Set(salmonTargets.map((target) => target.category)),
  ];
  const rotationWindow = rotation
    ? `${new Date(rotation.startTime).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })} — ${new Date(rotation.endTime).toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : null;
  const rotationEndTime = rotation?.endTime;

  const acceptSchedule = (
    envelope: SalmonScheduleEnvelope,
    mode: 'live' | 'cached',
  ) => {
    const active = selectActiveRotation(envelope.rotations);
    if (!active) throw new Error('no regular rotation');
    setRotation(active);
    setStatus(mode);
    setScheduleFetchedAt(envelope.fetchedAt);
    const matches = active.weapons.map((item) => matchSalmonWeapon(item.name));
    if (
      !manuallyEdited.current &&
      matches.length === 4 &&
      matches.every(Boolean)
    )
      setSelectedIds(matches.map((item) => item!.id));
  };
  const fetchSchedule = async () => {
    const response = await fetch('/api/salmon-schedule', {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`schedule ${response.status}`);
    const envelope = parseSalmonScheduleEnvelope(await response.json());
    if (!envelope) throw new Error('invalid schedule envelope');
    return envelope;
  };
  const acceptCachedSchedule = () => {
    const cached = readSalmonScheduleCache(window.localStorage);
    if (!cached) return false;
    try {
      acceptSchedule(cached, 'cached');
      return true;
    } catch {
      return false;
    }
  };
  const loadSchedule = () => {
    setStatus('loading');
    void fetchSchedule()
      .then((envelope) => {
        writeSalmonScheduleCache(window.localStorage, envelope);
        acceptSchedule(envelope, 'live');
      })
      .catch(() => {
        if (!acceptCachedSchedule()) setStatus('error');
      });
  };
  useEffect(() => {
    refreshSchedule.current = loadSchedule;
  });
  useEffect(() => {
    let active = true;
    void fetchSchedule()
      .then((envelope) => {
        if (!active) return;
        writeSalmonScheduleCache(window.localStorage, envelope);
        acceptSchedule(envelope, 'live');
      })
      .catch(() => {
        if (active && !acceptCachedSchedule()) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!rotationEndTime) return;
    const timer = window.setTimeout(
      () => refreshSchedule.current(),
      getSalmonScheduleRefreshDelay(rotationEndTime),
    );
    return () => window.clearTimeout(timer);
  }, [rotationEndTime]);
  const replaceWeapon = (index: number, id: string) => {
    manuallyEdited.current = true;
    setSelectedIds((current) =>
      current.map((value, i) => (i === index ? id : value)),
    );
  };
  const applyLive = () => {
    if (!canApplyLive) return;
    manuallyEdited.current = true;
    setSelectedIds(liveMatches.map((item) => item!.id));
  };
  const applyPressurePreset = (weaponIds: readonly string[]) => {
    manuallyEdited.current = true;
    setSelectedIds([...weaponIds]);
  };
  const selectTarget = (id: string) => {
    const target = salmonTargets.find((item) => item.id === id);
    if (!target) return;
    setTargetId(id);
    setCustomTargetHealth(target.health);
  };

  return (
    <section className="workspace salmon-page">
      <div className="intro">
        <div>
          <em>SALMON RUN LAB / FIELD-002</em>
          <h1>鲑鱼跑实验室</h1>
          <p>
            手动组成四把打工武器，先检查职能覆盖，再逐步接入已核验的 Wave 与 DPS
            模型。
          </p>
          <div className="lab-protocol field">
            <span>
              <i /> 压力实验待命
            </span>
            <b>PROTOCOL / COOP-PRESSURE</b>
            <small>未核验项不会输出结论</small>
          </div>
        </div>
        <span className="version-pill">打工编成分析</span>
      </div>
      <section
        className="salmon-live-card lab-instrument"
        data-instrument="LIVE ROTATION / INPUT"
      >
        <div className="salmon-live-head">
          <div>
            <span className="salmon-kicker">
              <Waves size={15} />
              当期轮换
            </span>
            <h2>
              {(rotation && localizeSalmonStageName(rotation.stage)) ??
                (status === 'loading' ? '正在读取地图…' : '暂时无法读取')}
            </h2>
            {rotationWindow && (
              <p className="salmon-live-window">本期轮换 · {rotationWindow}</p>
            )}
          </div>
          <div className="salmon-live-actions">
            <button
              type="button"
              onClick={loadSchedule}
              disabled={status === 'loading'}
            >
              <RefreshCw size={14} />
              {status === 'loading' ? '读取中' : '刷新'}
            </button>
            <a
              href="https://splatoon3.ink/salmonrun"
              target="_blank"
              rel="noreferrer"
            >
              地图详情与更换时间
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
        {rotation ? (
          <div className="salmon-live-weapons">
            {rotation.weapons.map((item, index) => (
              <span key={`${item.id}-${index}`} title={item.name}>
                <b>0{index + 1}</b>
                {matchSalmonWeapon(item.name)?.name ?? item.name}
              </span>
            ))}
          </div>
        ) : null}
        <output aria-live="polite" className={`salmon-fetch-state ${status}`}>
          {status === 'live' ? (
            <Check size={14} />
          ) : (
            <AlertTriangle size={14} />
          )}
          <span>
            {status === 'live'
              ? `日程已校验 · ${scheduleFetchedAt ? new Date(scheduleFetchedAt).toLocaleString('zh-CN') : '刚刚更新'}`
              : status === 'cached'
                ? `上游暂时不可用，正在使用最近缓存 · ${scheduleFetchedAt ? new Date(scheduleFetchedAt).toLocaleString('zh-CN') : '更新时间未知'}`
                : status === 'error'
                  ? '实时数据与本地缓存均不可用，不影响下方手动分析。'
                  : '正在通过 INKLAB 日程接口校验 splatoon3.ink 公开数据…'}
          </span>
        </output>
        <div className="salmon-source-note">
          <span>
            日程来源：
            <a href="https://splatoon3.ink" target="_blank" rel="noreferrer">
              splatoon3.ink
            </a>
            。当前仅经 INKLAB 接口读取地图与武器名称，不复制上游图片素材。
            页面会在本期轮换结束后自动刷新。
          </span>
          <button
            type="button"
            disabled={!canApplyLive}
            title={
              canApplyLive
                ? '把当期四把武器带入下方'
                : '当期武器中有尚未建立标签的武器'
            }
            onClick={applyLive}
          >
            采用当期编成
          </button>
        </div>
      </section>

      <div className="salmon-lab-grid">
        <section
          className="salmon-editor lab-instrument"
          data-instrument="COMPOSITION / INPUT"
        >
          <div className="salmon-section-head">
            <span>01</span>
            <div>
              <h2>手动编成四把武器</h2>
              <p>
                已收录 {regularSalmonWeapons.length} 把常规武器 +{' '}
                {grizzcoWeapons.length} 把熊武，共 {salmonWeapons.length}{' '}
                把；可重复选择并测试 AAAA、AABC、AABB、ABCD 等职能结构。
              </p>
            </div>
          </div>
          <div className="salmon-slots">
            {selected.map((weapon, index) => (
              <article key={index}>
                <header>
                  <b>0{index + 1}</b>
                  <span>
                    {weapon.role === 'frontline'
                      ? '近身位'
                      : weapon.role === 'flex'
                        ? '机动位'
                        : weapon.role === 'ranged'
                          ? '远程位'
                          : '控场位'}
                  </span>
                </header>
                <WeaponPicker
                  items={salmonWeaponPickerItems}
                  value={weapon.id}
                  onChange={(id) => replaceWeapon(index, id)}
                  title={`选择第 ${index + 1} 把打工武器`}
                  description="可按武器种类浏览，或搜索射程、机动性与清杂等标签。"
                  triggerClassName="salmon-weapon-picker-trigger"
                  triggerLabel={`更换第 ${index + 1} 把打工武器，当前为${weapon.name}`}
                  trigger={
                    <span>
                      <small>点击更换</small>
                      <b>{weapon.name}</b>
                    </span>
                  }
                />
                <div>
                  {weapon.family === GRIZZCO_FAMILY && <small>熊武</small>}
                  {weapon.tags.map((tag) => (
                    <small key={tag}>{tag}</small>
                  ))}
                </div>
                {weapon.parameterSource && (
                  <p title={weapon.parameterSource}>
                    上游 `_Coop` 参数已找到 · DPS 待核验
                  </p>
                )}
              </article>
            ))}
          </div>
          <div className="salmon-draft-note">
            <AlertTriangle size={15} />
            <p>
              <b>编成标签草案</b>
              　当前标签用于生成第一层系统初评；它不是玩家胜率或社区排名，仍需结合打工专用参数、地图、潮位与实战样本校准。
            </p>
          </div>
        </section>

        <aside
          className="salmon-results lab-instrument"
          data-instrument="COMPOSITION / OUTPUT"
        >
          <div className="salmon-section-head">
            <span>02</span>
            <div>
              <h2>编成结构分析</h2>
              <p>先给玩家可读结论；字母结构仅保留为开发诊断。</p>
            </div>
          </div>
          <div
            className={`salmon-verdict ${compositionAssessment.grade}`}
            aria-label={`INKLAB 系统初评：${compositionAssessment.label}`}
          >
            <small>INKLAB SYSTEM ASSESSMENT / 系统初评</small>
            <strong>{compositionAssessment.label}</strong>
            <b>{compositionAssessment.recommendation}</b>
            <p>{compositionAssessment.summary}</p>
            <em>开发诊断：{analysis.pattern} · 仅表示职能重复结构</em>
          </div>
          <div className="salmon-findings">
            <h3>
              <Check size={14} />
              已覆盖
            </h3>
            {analysis.strengths.map((item) => (
              <p className="good" key={item}>
                {item}
              </p>
            ))}
            <h3>
              <AlertTriangle size={14} />
              要留意
            </h3>
            {analysis.warnings.length ? (
              analysis.warnings.map((item) => (
                <p className="warn" key={item}>
                  {item}
                </p>
              ))
            ) : (
              <p className="good">标签层暂无明显空缺，这不等于实战结论。</p>
            )}
          </div>
        </aside>
      </div>

      <section
        className="salmon-event-panel lab-instrument"
        data-instrument="SPECIAL WAVE / ASSESSMENT"
      >
        <div className="salmon-section-head">
          <span>03</span>
          <div>
            <h2>特殊事件适配度</h2>
            <p>
              根据当前四把武器的职能标签给出难度倾向；地图、潮位、点位和玩家熟练度尚未计入。
            </p>
          </div>
        </div>
        <div className="salmon-event-grid">
          {eventAssessments.map((event) => (
            <article className={event.tone} key={event.id}>
              <header>
                <div>
                  <small>{event.influence}</small>
                  <h3>
                    {event.name}
                    {event.alias && <span>{event.alias}</span>}
                  </h3>
                </div>
                <strong>{event.label}</strong>
              </header>
              <p>{event.summary}</p>
            </article>
          ))}
        </div>
        <p className="salmon-event-boundary">
          这是 INKLAB
          的武器标签初评，不是社区共识或通关保证。狂潮会继续以下方独立 DPS
          压力实验为准；其余事件将在地图与社区样本接入后分层校准。
        </p>
      </section>

      <section
        className="glowfly-panel lab-instrument"
        data-instrument="DPS PRESSURE / OUTPUT"
      >
        <div className="glowfly-head">
          <div>
            <span>
              <Activity size={15} />
              实验 04
            </span>
            <h2>光蝇纯输出压力测试</h2>
            <p>
              先对照“理论极限手法”和“日常手法基准”的主武器动作输出；持续回墨、副武器、特殊武器、地图、潮位、点位、走位与漏弹暂不进入模型。
            </p>
          </div>
          <div className="wave-tabs" title="等待核验打工回墨与墨锁后启用">
            <button
              type="button"
              disabled
              className={pressureStrategy === 'synchronized' ? 'active' : ''}
              onClick={() => setPressureStrategy('synchronized')}
            >
              同时循环 · 待验证
            </button>
            <button
              type="button"
              disabled
              className={pressureStrategy === 'staggered' ? 'active' : ''}
              onClick={() => setPressureStrategy('staggered')}
            >
              交替循环 · 待验证
            </button>
          </div>
        </div>
        <div className="pressure-presets">
          <b>首批试算样本</b>
          {salmonPressurePresets.map((preset) => (
            <button
              type="button"
              key={preset.id}
              onClick={() => applyPressurePreset(preset.weaponIds)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="glowfly-grid">
          <div className="glowfly-readiness">
            <small>参数就绪度</small>
            <strong>{verifiedDps} / 4</strong>
            <div>
              <i style={{ width: `${(verifiedDps / 4) * 100}%` }} />
            </div>
            <p>
              {pressureComparison
                ? '这套编成可对照极限与日常两种主武器动作输出。'
                : '目前只导入广域标记枪、窄域标记枪、.96加仑与三发猎鱼弓；其他武器继续显示待核验。'}
            </p>
          </div>
          <div className="glowfly-weapons">
            {selected.map((weapon, index) => {
              const performance = getSalmonWeaponPerformance(weapon.id);
              return (
                <span key={index}>
                  <b>{weapon.name}</b>
                  {performance ? (
                    <>
                      <em>
                        极限{' '}
                        {Math.round(
                          (performance.limit.damagePerAction * 60) /
                            performance.limit.actionFrames,
                        )}{' '}
                        动作 DPS · {performance.limit.label}
                      </em>
                      <small>
                        日常{' '}
                        {Math.round(
                          (performance.routine.damagePerAction * 60) /
                            performance.routine.actionFrames,
                        )}{' '}
                        动作 DPS · {performance.routine.label}
                      </small>
                    </>
                  ) : (
                    <em>两种手法均待核验</em>
                  )}
                </span>
              );
            })}
          </div>
          <div className="glowfly-model">
            {pressureComparison ? (
              <>
                <b>主武器动作窗口 · 双基准</b>
                <span>
                  极限动作输出合计：
                  {pressureComparison.limit.combinedActionDps.toFixed(0)} DPS
                </span>
                <span>
                  日常动作输出合计：
                  {pressureComparison.routine.combinedActionDps.toFixed(0)} DPS
                </span>
                <span>持续 DPS 暂停输出</span>
                <span>打工回墨、射后墨锁与鱿鱼滚行回墨均待核验</span>
                <span>同步／交替循环将在上述参数完成后启用</span>
              </>
            ) : (
              <>
                <b>等待补齐双手法参数</b>
                <span>需要伤害、动作周期、耗墨与有效输出手法</span>
                <span>不会把满蓄力自动当成最高 DPS</span>
                <span>不会对未核验武器输出过线结论</span>
              </>
            )}
          </div>
        </div>
        <section className="salmon-target-lab">
          <div className="salmon-target-head">
            <div>
              <small>自由目标实验 / 不使用图片素材</small>
              <h3>用当前四把武器试算目标生命值</h3>
              <p>
                目标按钮只会填入公开参考生命值；你也可以直接修改
                HP。结果不计破甲、无敌阶段、走位、射程和多目标机制。
              </p>
            </div>
            <label>
              目标生命值
              <input
                aria-label="自定义目标生命值"
                type="number"
                min="1"
                max="100000"
                step="1"
                value={customTargetHealth}
                onChange={(event) =>
                  setCustomTargetHealth(
                    Math.max(1, Number(event.target.value) || 1),
                  )
                }
              />
              <span>HP</span>
            </label>
          </div>
          <div className="salmon-target-groups">
            {targetCategories.map((category) => (
              <div className="salmon-target-group" key={category}>
                <b>{category}</b>
                <div className="salmon-target-buttons">
                  {salmonTargets
                    .filter((target) => target.category === category)
                    .map((target) => (
                      <button
                        type="button"
                        aria-pressed={target.id === targetId}
                        className={target.id === targetId ? 'active' : ''}
                        key={target.id}
                        onClick={() => selectTarget(target.id)}
                      >
                        <span>{target.name}</span>
                        <small>{target.health} HP</small>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="salmon-target-result comparison">
            <aside className="salmon-target-profile">
              <div>
                <small>TARGET / 当前目标</small>
                <strong>{selectedTarget.name}</strong>
                <b>{customTargetHealth} HP</b>
                <p>
                  {selectedTarget.note}；手动修改 HP 后仍保留此目标的机制说明。
                </p>
              </div>
              <div
                className="salmon-target-image-slot"
                aria-label={`${selectedTarget.name}目标图片待接入`}
              >
                <span>目标图像预留区</span>
                <strong>{selectedTarget.name}</strong>
                <small>IMAGE ASSET / PENDING</small>
              </div>
            </aside>
            <div className="salmon-weapon-results">
              {targetSolutions.map((solution, index) =>
                solution ? (
                  <article key={index}>
                    <header>
                      <small>0{index + 1} / WEAPON</small>
                      <b>{solution.weapon.name}</b>
                    </header>
                    <section>
                      <strong>
                        {solution.limit.damageEquivalent.toFixed(2)} 确 → 实际{' '}
                        {solution.limit.requiredActions} 次
                      </strong>
                      <p>
                        极限：{solution.performance.limit.damagePerAction} ×{' '}
                        {solution.limit.requiredActions} ={' '}
                        {solution.limit.totalDamage}，溢出{' '}
                        {solution.limit.overkill}；日常：
                        {solution.routine.damageEquivalent.toFixed(2)} 组 →{' '}
                        {solution.routine.requiredActions} 组。
                      </p>
                    </section>
                  </article>
                ) : (
                  <article className="pending" key={index}>
                    <header>
                      <small>0{index + 1} / WEAPON</small>
                      <b>{selected[index].name}</b>
                    </header>
                    <section>
                      <strong>动作参数待核验</strong>
                      <p>不使用其他武器的参数代算。</p>
                    </section>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>
        <p className="glowfly-boundary">
          <AlertTriangle size={14} />
          <span>
            <b>当前先建立“极限／日常”两条主武器输出线。</b>WAVE
            与危险度对应的单位时间生命值压力尚未核验，因此暂不显示“过线／不过线”；副武器和特殊武器完全排除。狂潮中鲑鱼与金鲑鱼血量目前分别按{' '}
            {rushTargets[0].health} / {rushTargets[1].health} HP 建立参考目标。
          </span>
        </p>
      </section>
    </section>
  );
}
