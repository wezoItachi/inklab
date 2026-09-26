import mainWeaponDatabaseJson from '../database/main-weapons.v11.3.0.json' with { type: 'json' };
import mainWeaponParameterDatabaseJson from '../database/main-weapon-parameters.v11.3.0.json' with { type: 'json' };
import specialWeaponDatabaseJson from '../database/special-weapons.v11.3.0.json' with { type: 'json' };
import subWeaponDatabaseJson from '../database/sub-weapons.v11.3.0.json' with { type: 'json' };
import weaponKitDatabaseJson from '../database/weapon-kits.v11.3.0.json' with { type: 'json' };
import {
  validateGameDatabase,
  type MainWeaponDatabase,
  type MainWeaponParameterDatabase,
  type MainWeaponParameterRecord,
  type SpecialWeaponDatabase,
  type SubWeaponDatabase,
  type WeaponFamily,
  type WeaponKitDatabase,
  type WeaponRecord,
} from '../database/schema.ts';

const mainWeaponDatabase = mainWeaponDatabaseJson as MainWeaponDatabase;
const mainWeaponParameterDatabase =
  mainWeaponParameterDatabaseJson as MainWeaponParameterDatabase;
const subWeaponDatabase = subWeaponDatabaseJson as SubWeaponDatabase;
const specialWeaponDatabase =
  specialWeaponDatabaseJson as SpecialWeaponDatabase;
const weaponKitDatabase = weaponKitDatabaseJson as WeaponKitDatabase;
validateGameDatabase(
  mainWeaponDatabase,
  subWeaponDatabase,
  specialWeaponDatabase,
  weaponKitDatabase,
  mainWeaponParameterDatabase,
);

const subWeaponsById = new Map(
  subWeaponDatabase.subWeapons.map((sub) => [sub.id, sub]),
);
const specialWeaponsById = new Map(
  specialWeaponDatabase.specialWeapons.map((special) => [special.id, special]),
);
const kitsByWeaponId = new Map(
  weaponKitDatabase.kits.map((kit) => [kit.weaponId, kit]),
);

export const DATA_VERSION = mainWeaponDatabase.gameVersion;
export const DATASET_STATUS = mainWeaponDatabase.datasetStatus;
export const mainWeaponParameters: readonly MainWeaponParameterRecord[] =
  mainWeaponParameterDatabase.records;
export const weapons: readonly WeaponRecord[] = mainWeaponDatabase.weapons.map(
  (weapon) => {
    const kit = kitsByWeaponId.get(weapon.id)!;
    const sub = subWeaponsById.get(kit.subId)!;
    const special = specialWeaponsById.get(kit.specialId)!;
    return {
      ...weapon,
      sub: {
        id: sub.id,
        name: sub.name,
        baseInkCost: sub.baseInkCost,
        subPowerEffect: sub.subPowerEffect,
        subPowerDoesNotChange: sub.subPowerDoesNotChange,
      },
      special: special.name,
      recommendedPreset: kit.recommendedPreset,
    };
  },
);

export type Weapon = WeaponRecord;
export type { WeaponFamily };

export function getWeapon(weaponId: string): Weapon {
  return weapons.find((weapon) => weapon.id === weaponId) ?? weapons[0];
}

export function getMainWeaponParameters(
  weaponId: string,
): MainWeaponParameterRecord {
  return (
    mainWeaponParameters.find((record) => record.weaponId === weaponId) ??
    mainWeaponParameters[0]
  );
}

export function summarizeMainWeaponParameters(weaponId: string) {
  const parameters = getMainWeaponParameters(weaponId).parameters;
  return parameters.reduce(
    (summary, parameter) => {
      summary[parameter.status] += 1;
      return summary;
    },
    { total: parameters.length, verified: 0, pending: 0, demo: 0 },
  );
}
