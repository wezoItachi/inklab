export type AuthorizationStatus =
  | 'public-reference'
  | 'first-party-record'
  | 'pending';
export type VerificationStatus = 'kit-verified' | 'pending' | 'demo';

export type WeaponFamily = '射击枪' | '蓄力枪' | '滚筒' | '加特林';
export type DatasetStatus = 'representative-test-set' | 'complete';

type Provenance = {
  verification: VerificationStatus;
  sourceId: string;
  checkedAt: string;
};

export type MainWeaponRecord = Provenance & {
  id: string;
  name: string;
  badge: string;
  family: WeaponFamily;
  role: string;
};

export type SubWeaponRecord = Provenance & {
  id: string;
  name: string;
  baseInkCost: number;
  subPowerEffect: string;
  subPowerDoesNotChange: string[];
};

export type SpecialWeaponRecord = Provenance & {
  id: string;
  name: string;
};

export type WeaponKitRecord = Provenance & {
  weaponId: string;
  subId: string;
  specialId: string;
  recommendedPreset: number;
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

export type WeaponRecord = MainWeaponRecord & {
  sub: Pick<
    SubWeaponRecord,
    'id' | 'name' | 'baseInkCost' | 'subPowerEffect' | 'subPowerDoesNotChange'
  >;
  special: string;
  recommendedPreset: number;
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
): void {
  const documents = [weapons, subWeapons, specialWeapons, kits];
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
    if (sub.baseInkCost <= 0 || sub.baseInkCost > 100)
      throw new Error(`Invalid sub ink cost: ${sub.id}`);
    if (!sub.subPowerEffect || sub.subPowerDoesNotChange.length < 1)
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
    if (kit.recommendedPreset < 0 || kit.recommendedPreset > 2)
      throw new Error(`Invalid preset index: ${kit.weaponId}`);
    kitWeaponIds.add(kit.weaponId);
  }
  if (kitWeaponIds.size !== weaponIds.size)
    throw new Error('Every weapon must have exactly one kit');
}
