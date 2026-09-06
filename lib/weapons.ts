import weaponDatabaseJson from '../database/weapons.v11.3.0.json' with {type: 'json'};
import {
  validateWeaponDatabase,
  type WeaponDatabase,
  type WeaponFamily,
  type WeaponRecord,
} from '../database/schema.ts';

const weaponDatabase = weaponDatabaseJson as WeaponDatabase;
validateWeaponDatabase(weaponDatabase);

export const DATA_VERSION = weaponDatabase.gameVersion;
export const DATASET_STATUS = weaponDatabase.datasetStatus;
export const weapons: readonly WeaponRecord[] = weaponDatabase.weapons;

export type Weapon = WeaponRecord;
export type {WeaponFamily};

export function getWeapon(weaponId: string): Weapon {
  return weapons.find((weapon) => weapon.id === weaponId) ?? weapons[0];
}
