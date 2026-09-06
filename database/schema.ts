export type AuthorizationStatus = 'public-reference' | 'first-party-record' | 'pending';
export type VerificationStatus = 'kit-verified' | 'pending' | 'demo';

export type WeaponFamily = '射击枪' | '蓄力枪' | '滚筒' | '加特林';

export type WeaponRecord = {
  id: string;
  name: string;
  badge: string;
  family: WeaponFamily;
  role: string;
  sub: {
    id: string;
    name: string;
    baseInkCost: number;
    subPowerEffect: string;
    subPowerDoesNotChange: string[];
  };
  special: string;
  recommendedPreset: number;
  verification: VerificationStatus;
  sourceId: string;
  checkedAt: string;
};

export type WeaponDatabase = {
  gameVersion: string;
  datasetStatus: 'representative-test-set' | 'complete';
  defaultSourceId: string;
  weapons: WeaponRecord[];
};

export function validateWeaponDatabase(database: WeaponDatabase): void {
  if (!/^\d+\.\d+\.\d+$/.test(database.gameVersion)) throw new Error('Invalid game version');
  const ids = new Set<string>();
  for (const weapon of database.weapons) {
    if (!weapon.id || !weapon.name || ids.has(weapon.id)) throw new Error(`Invalid or duplicate weapon id: ${weapon.id}`);
    if (weapon.sub.baseInkCost <= 0 || weapon.sub.baseInkCost > 100) throw new Error(`Invalid sub ink cost: ${weapon.id}`);
    if (weapon.recommendedPreset < 0 || weapon.recommendedPreset > 2) throw new Error(`Invalid preset index: ${weapon.id}`);
    if (!weapon.sourceId || !/^\d{4}-\d{2}-\d{2}$/.test(weapon.checkedAt)) throw new Error(`Missing provenance: ${weapon.id}`);
    ids.add(weapon.id);
  }
}
