'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Check, Layers, Plus, X } from 'lucide-react';
import { WeaponPicker } from '@/components/weapon-picker';
import { abilities } from '@/lib/abilities';
import { getMainWeaponAssetUrl } from '@/lib/weapon-assets';
import {
  buildUniversalGearPlan,
  type PlannerGoal,
} from '@/lib/universal-planner';
import { getWeapon, weapons, type Weapon } from '@/lib/weapon-catalog';
import type { WeaponPickerItem } from '@/lib/weapon-picker';

const initialWeaponIds = [
  'shooter-quickmiddle-cstm01',
  'shooter-normalt',
  'main-11',
];

const pickerItems: readonly WeaponPickerItem[] = weapons.map((weapon) => ({
  id: weapon.id,
  name: weapon.name,
  family: weapon.family,
  badge: weapon.badge,
  imageUrl: getMainWeaponAssetUrl(weapon.id),
  meta: `${weapon.sub.name} · ${weapon.special}`,
  tags: [weapon.role],
}));

const goals: ReadonlyArray<{ id: PlannerGoal; label: string }> = [
  { id: 'shared-slots', label: '共通槽最多' },
  { id: 'main-conflict', label: '主能力冲突最少' },
  { id: 'verified-first', label: '已核验优先' },
];

const abilityShort = (id: string) =>
  abilities.find((ability) => ability.id === id)?.short ?? id;

export function UniversalPlanner({
  onOpenWeapon,
}: {
  onOpenWeapon: (weaponId: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState(initialWeaponIds);
  const [goal, setGoal] = useState<PlannerGoal>('shared-slots');
  const [selectedPartId, setSelectedPartId] = useState<
    'head' | 'clothes' | 'shoes' | null
  >(null);
  const selectedWeapons = useMemo(
    () => selectedIds.map((id) => getWeapon(id)),
    [selectedIds],
  );
  const plan = useMemo(
    () => buildUniversalGearPlan(selectedWeapons, goal, selectedPartId),
    [goal, selectedPartId, selectedWeapons],
  );

  const addWeapon = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) || current.length >= 5 ? current : [...current, id],
    );
  };
  const removeWeapon = (id: string) => {
    setSelectedIds((current) =>
      current.length <= 2 ? current : current.filter((item) => item !== id),
    );
  };

  return (
    <section className="workspace planner-page">
      <div className="intro">
        <div>
          <em>SHARED GEAR / 002</em>
          <h1>多武器通用装备规划</h1>
          <p>比较现有系统建议，找出可以共用的装备槽与主能力冲突。</p>
        </div>
        <span className="version-pill">
          实时比较 · {selectedWeapons.length} 把武器
        </span>
      </div>
      <div className="planner-grid">
        <section className="planner-controls">
          <Title n="01" text="选择要比较的武器">
            <WeaponPicker
              items={pickerItems}
              value={selectedIds[0]}
              onChange={addWeapon}
              title="添加比较武器"
              description="最多同时比较五把武器；已加入的武器不会重复添加。"
              triggerClassName="planner-add-weapon"
              triggerLabel="添加武器"
              trigger={
                <>
                  <Plus size={14} /> 添加武器
                </>
              }
            />
          </Title>
          <div className="weapon-list">
            {selectedWeapons.map((weapon) => (
              <SelectedWeapon
                key={weapon.id}
                weapon={weapon}
                removable={selectedWeapons.length > 2}
                onRemove={() => removeWeapon(weapon.id)}
              />
            ))}
          </div>
          <p className="planner-limit">
            至少保留 2 把，最多 5
            把。比较依据是每把武器当前的“主武基础型”系统建议。
          </p>
          <Title n="02" text="排序目标">
            <small>只改变候选部位排序，不改变原始建议</small>
          </Title>
          <div className="goal-pills">
            {goals.map((item) => (
              <button
                type="button"
                className={goal === item.id ? 'active' : ''}
                onClick={() => {
                  setGoal(item.id);
                  setSelectedPartId(null);
                }}
                key={item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Title n="03" text="三个部位的比较结果">
            <small>共通槽包含相同主能力和相同小技能</small>
          </Title>
          <div className="planner-part-list">
            {plan.candidates.map((candidate) => (
              <button
                type="button"
                className={
                  plan.candidate?.partId === candidate.partId ? 'active' : ''
                }
                key={candidate.partId}
                aria-pressed={plan.candidate?.partId === candidate.partId}
                onClick={() => setSelectedPartId(candidate.partId)}
              >
                <b>{candidate.partLabel}</b>
                <span>{candidate.commonSlotCount}/4 共通槽</span>
                <small>{candidate.mainAbilityIds.length} 种主能力</small>
              </button>
            ))}
          </div>
          {selectedPartId && (
            <button
              type="button"
              className="planner-auto-part"
              onClick={() => setSelectedPartId(null)}
            >
              恢复系统推荐部位
            </button>
          )}
        </section>
        <aside className="planner-result">
          {plan.candidate ? (
            <PlannerResult
              plan={plan}
              goal={goal}
              isManualSelection={selectedPartId !== null}
              onOpenWeapon={onOpenWeapon}
            />
          ) : (
            <div className="planner-empty">
              <Layers size={28} />
              <h2>至少选择两把武器</h2>
              <p>加入第二把武器后才会计算共通装备结构。</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function SelectedWeapon({
  weapon,
  removable,
  onRemove,
}: {
  weapon: Weapon;
  removable: boolean;
  onRemove: () => void;
}) {
  return (
    <article className="planner-selected-weapon">
      {/* oxlint-disable-next-line next/no-img-element -- Versioned local weapon images retain audited upstream bytes. */}
      <img src={getMainWeaponAssetUrl(weapon.id)} alt="" />
      <div>
        <b>{weapon.name}</b>
        <small>
          {weapon.family} · {weapon.role}
        </small>
        <em>
          {weapon.sub.name} · {weapon.special}
        </em>
      </div>
      <button
        type="button"
        aria-label={`移除${weapon.name}`}
        disabled={!removable}
        title={removable ? '移出比较' : '至少保留两把武器'}
        onClick={onRemove}
      >
        <X size={14} />
      </button>
    </article>
  );
}

function PlannerResult({
  plan,
  goal,
  isManualSelection,
  onOpenWeapon,
}: {
  plan: ReturnType<typeof buildUniversalGearPlan>;
  goal: PlannerGoal;
  isManualSelection: boolean;
  onOpenWeapon: (weaponId: string) => void;
}) {
  const candidate = plan.candidate!;
  const commonMain = candidate.commonMainAbilityId
    ? abilityShort(candidate.commonMainAbilityId)
    : null;
  return (
    <>
      <div className="result-kicker">
        {isManualSelection
          ? 'INSPECTION / 手动检查'
          : `RECOMMENDATION / ${goals.find((item) => item.id === goal)?.label}`}
      </div>
      <div className="recommend-title">
        <div className="gear-symbol">
          <Layers />
        </div>
        <div>
          <small>
            {isManualSelection ? '正在检查选定部位' : '当前比较中共通度最高'}
          </small>
          <h2>{candidate.partLabel}模块</h2>
        </div>
        <b>共通 {candidate.compatibilityPercent}%</b>
      </div>
      <div className="why-grid">
        <div>
          <span>共通小技能</span>
          <b>{candidate.sharedSubAbilityIds.length}/3 槽</b>
          <small>
            {candidate.sharedSubAbilityIds.map(abilityShort).join(' · ') ||
              '没有完全相同的小技能'}
          </small>
        </div>
        <div>
          <span>主能力</span>
          <b className={commonMain ? 'good' : ''}>
            {commonMain ?? `${candidate.mainAbilityIds.length} 种冲突`}
          </b>
          <small>
            {commonMain ? '可直接共用同一主能力' : '需要分别制作对应版本'}
          </small>
        </div>
        <div>
          <span>已核验曲线槽</span>
          <b className="big">{candidate.verifiedCommonSlotCount}</b>
          <small>只统计当前已正式接入的 AP 曲线</small>
        </div>
      </div>
      <div className="decision">
        <h3>系统结论</h3>
        <p>
          {candidate.sharedSubAbilityIds.length === 3
            ? `${candidate.partLabel}的三个小技能在所选武器建议中完全一致。`
            : `${candidate.partLabel}目前有 ${candidate.sharedSubAbilityIds.length} 个可以直接复用的小技能槽。`}
          {commonMain
            ? ' 主能力也一致，可以作为一件完整通用装备继续实验。'
            : ' 但主能力不一致，因此应理解为“共通小技能模板”，不是同一件装备能覆盖全部武器。'}
        </p>
        {plan.weaponRequirements.map((requirement) => (
          <div className="trade" key={requirement.weaponId}>
            <Check size={15} />
            <span>
              <b>{requirement.weaponName}</b> · {candidate.partLabel}主能力{' '}
              {requirement.mainAbilityName}
              <small className="trade-allocation">
                {requirement.allocation
                  .map(({ abilityName, ap }) => `${abilityName} ${ap}AP`)
                  .join(' · ')}
              </small>
            </span>
            <button
              type="button"
              onClick={() => onOpenWeapon(requirement.weaponId)}
              aria-label={`载入${requirement.weaponName}的主武基础型并进入单套分析`}
            >
              进入单套分析 <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
      <h3 className="candidate-title">
        共通槽结构 <small>来自当前系统建议，不是玩家统计</small>
      </h3>
      <div className="planner-slot-result">
        <span className={commonMain ? 'shared' : 'conflict'}>
          <b>主</b>
          <small>{commonMain ?? '按武器区分'}</small>
        </span>
        {Array.from({ length: 3 }, (_, index) => {
          const abilityId = candidate.sharedSubAbilityIds[index];
          return (
            <span className={abilityId ? 'shared' : 'empty'} key={index}>
              <b>小</b>
              <small>{abilityId ? abilityShort(abilityId) : '不共通'}</small>
            </span>
          );
        })}
      </div>
      <p className="note">
        当前不读取玩家库存、装备品牌或真实碎片数量，因此不估算购买难度与碎片节省量。结果会随所选武器和排序目标即时重算。
      </p>
    </>
  );
}

function Title({
  n,
  text,
  children,
}: {
  n: string;
  text: string;
  children: ReactNode;
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
