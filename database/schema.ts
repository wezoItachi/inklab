export type AuthorizationStatus =
  | 'public-reference'
  | 'first-party-record'
  | 'permission-with-attribution'
  | 'permission-without-attribution'
  | 'pending';
export type VerificationStatus = 'kit-verified' | 'pending' | 'demo';

export type WeaponFamily =
  | '射击枪'
  | '爆破枪'
  | '滚筒'
  | '画笔'
  | '蓄力枪'
  | '泼桶'
  | '加特林'
  | '双枪'
  | '伞'
  | '弓'
  | '刮水刀';
export type DatasetStatus =
  | 'representative-test-set'
  | 'full-weapon-catalog-partial-parameters'
  | 'complete';

type Provenance = {
  verification: VerificationStatus;
  sourceId: string;
  checkedAt: string;
};

export type MainWeaponRecord = Provenance & {
  id: string;
  upstreamId: number;
  upstreamRowId: string;
  name: string;
  badge: string;
  family: WeaponFamily;
  role: string;
};

export type SubWeaponRecord = Provenance & {
  id: string;
  upstreamId: string;
  name: string;
  baseInkCost: number | null;
  subPowerEffect: string | null;
  subPowerDoesNotChange: string[];
};

export type SpecialWeaponRecord = Provenance & {
  id: string;
  upstreamId: string;
  name: string;
};

export type WeaponKitRecord = Provenance & {
  weaponId: string;
  subId: string;
  specialId: string;
  recommendedPreset: number | null;
};

export type VersionedRecordSet<TName extends string, TRecord> = {
  gameVersion: string;
  datasetStatus: DatasetStatus;
  defaultSourceId: string;
} & Record<TName, TRecord[]>;

export type MainWeaponDatabase = VersionedRecordSet<
  'weapons',
  MainWeaponRecord
>;
export type SubWeaponDatabase = VersionedRecordSet<
  'subWeapons',
  SubWeaponRecord
>;
export type SpecialWeaponDatabase = VersionedRecordSet<
  'specialWeapons',
  SpecialWeaponRecord
>;
export type WeaponKitDatabase = VersionedRecordSet<'kits', WeaponKitRecord>;

export type ParameterVerificationStatus =
  | 'verified'
  | 'pending'
  | 'not-applicable'
  | 'demo';

export type MainWeaponParameterField = {
  key: string;
  label: string;
  value: number | string | boolean | null;
  unit: string | null;
  status: ParameterVerificationStatus;
  note: string;
  sourceId?: string;
  upstreamPath?: string;
  checkedAt?: string;
};

export type MainWeaponParameterRecord = {
  weaponId: string;
  parameters: MainWeaponParameterField[];
};

export type MainWeaponParameterDatabase = VersionedRecordSet<
  'records',
  MainWeaponParameterRecord
>;

export type WeaponRecord = MainWeaponRecord & {
  sub: Pick<
    SubWeaponRecord,
    'id' | 'name' | 'baseInkCost' | 'subPowerEffect' | 'subPowerDoesNotChange'
  >;
  special: string;
  recommendedPreset: number | null;
};

function validateVersionedDocument(document: {
  gameVersion: string;
  defaultSourceId: string;
}): void {
  if (!/^\d+\.\d+\.\d+$/.test(document.gameVersion))
    throw new Error('Invalid game version');
  if (!document.defaultSourceId) throw new Error('Missing default source');
}

function validateProvenance(record: Provenance, label: string): void {
  if (!record.sourceId || !/^\d{4}-\d{2}-\d{2}$/.test(record.checkedAt))
    throw new Error(`Missing provenance: ${label}`);
}

function validateUniqueIds(
  records: readonly { id: string }[],
  label: string,
): void {
  const ids = new Set<string>();
  for (const record of records) {
    if (!record.id || ids.has(record.id))
      throw new Error(`Invalid or duplicate ${label} id: ${record.id}`);
    ids.add(record.id);
  }
}

export function validateGameDatabase(
  weapons: MainWeaponDatabase,
  subWeapons: SubWeaponDatabase,
  specialWeapons: SpecialWeaponDatabase,
  kits: WeaponKitDatabase,
  mainWeaponParameters?: MainWeaponParameterDatabase,
): void {
  const documents = [
    weapons,
    subWeapons,
    specialWeapons,
    kits,
    ...(mainWeaponParameters ? [mainWeaponParameters] : []),
  ];
  for (const document of documents) {
    validateVersionedDocument(document);
    if (document.gameVersion !== weapons.gameVersion)
      throw new Error('Game data versions do not match');
    if (document.datasetStatus !== weapons.datasetStatus)
      throw new Error('Dataset statuses do not match');
  }

  validateUniqueIds(weapons.weapons, 'weapon');
  validateUniqueIds(subWeapons.subWeapons, 'sub weapon');
  validateUniqueIds(specialWeapons.specialWeapons, 'special weapon');

  for (const weapon of weapons.weapons) validateProvenance(weapon, weapon.id);
  for (const sub of subWeapons.subWeapons) {
    validateProvenance(sub, sub.id);
    if (
      sub.baseInkCost !== null &&
      (sub.baseInkCost <= 0 || sub.baseInkCost > 100)
    )
      throw new Error(`Invalid sub ink cost: ${sub.id}`);
    if (
      sub.verification === 'kit-verified' &&
      (!sub.subPowerEffect || sub.subPowerDoesNotChange.length < 1)
    )
      throw new Error(`Missing sub power context: ${sub.id}`);
  }
  for (const special of specialWeapons.specialWeapons)
    validateProvenance(special, special.id);

  const weaponIds = new Set(weapons.weapons.map(({ id }) => id));
  const subIds = new Set(subWeapons.subWeapons.map(({ id }) => id));
  const specialIds = new Set(specialWeapons.specialWeapons.map(({ id }) => id));
  const kitWeaponIds = new Set<string>();
  for (const kit of kits.kits) {
    validateProvenance(kit, kit.weaponId);
    if (!weaponIds.has(kit.weaponId))
      throw new Error(`Unknown weapon reference: ${kit.weaponId}`);
    if (!subIds.has(kit.subId))
      throw new Error(`Unknown sub weapon reference: ${kit.subId}`);
    if (!specialIds.has(kit.specialId))
      throw new Error(`Unknown special weapon reference: ${kit.specialId}`);
    if (kitWeaponIds.has(kit.weaponId))
      throw new Error(`Duplicate weapon kit: ${kit.weaponId}`);
    if (
      kit.recommendedPreset !== null &&
      (kit.recommendedPreset < 0 || kit.recommendedPreset > 2)
    )
      throw new Error(`Invalid preset index: ${kit.weaponId}`);
    kitWeaponIds.add(kit.weaponId);
  }
  if (kitWeaponIds.size !== weaponIds.size)
    throw new Error('Every weapon must have exactly one kit');

  if (mainWeaponParameters) {
    const parameterWeaponIds = new Set<string>();
    for (const record of mainWeaponParameters.records) {
      if (!weaponIds.has(record.weaponId))
        throw new Error(
          `Unknown parameter weapon reference: ${record.weaponId}`,
        );
      if (parameterWeaponIds.has(record.weaponId))
        throw new Error(
          `Duplicate weapon parameter record: ${record.weaponId}`,
        );
      if (record.parameters.length < 1)
        throw new Error(`Missing weapon parameter fields: ${record.weaponId}`);

      const parameterKeys = new Set<string>();
      for (const parameter of record.parameters) {
        if (!parameter.key || parameterKeys.has(parameter.key))
          throw new Error(
            `Invalid or duplicate parameter key: ${record.weaponId}.${parameter.key}`,
          );
        if (!parameter.label || !parameter.note)
          throw new Error(
            `Missing parameter description: ${record.weaponId}.${parameter.key}`,
          );
        if (parameter.status === 'pending' && parameter.value !== null)
          throw new Error(
            `Pending parameter must not contain a value: ${record.weaponId}.${parameter.key}`,
          );
        if (
          parameter.status === 'not-applicable' &&
          (parameter.value !== null ||
            !parameter.sourceId ||
            !parameter.upstreamPath ||
            !parameter.checkedAt)
        )
          throw new Error(
            `Not-applicable parameter is missing provenance: ${record.weaponId}.${parameter.key}`,
          );
        if (parameter.status === 'verified') {
          if (
            parameter.value === null ||
            !parameter.sourceId ||
            !parameter.upstreamPath ||
            !parameter.checkedAt
          )
            throw new Error(
              `Verified parameter is missing provenance: ${record.weaponId}.${parameter.key}`,
            );
          if (!/^\d{4}-\d{2}-\d{2}$/.test(parameter.checkedAt))
            throw new Error(
              `Invalid parameter check date: ${record.weaponId}.${parameter.key}`,
            );
        }
        parameterKeys.add(parameter.key);
      }
      parameterWeaponIds.add(record.weaponId);
    }
    if (parameterWeaponIds.size !== weaponIds.size)
      throw new Error('Every weapon must have one parameter record');
  }
}
