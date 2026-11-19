import mainWeaponParameterDatabaseJson from '../database/main-weapon-parameters.v12.0.0.json' with { type: 'json' };
import {
  validateGameDatabase,
  type MainWeaponParameterDatabase,
  type MainWeaponParameterRecord,
} from '../database/schema.ts';
import { weaponCatalogDatabases } from './weapon-catalog.ts';
export {
  DATA_VERSION,
  DATASET_STATUS,
  WEAPON_FAMILIES,
  getWeapon,
  weapons,
  type Weapon,
  type WeaponFamily,
} from './weapon-catalog.ts';

const mainWeaponParameterDatabase =
  mainWeaponParameterDatabaseJson as MainWeaponParameterDatabase;
validateGameDatabase(
  weaponCatalogDatabases.main,
  weaponCatalogDatabases.sub,
  weaponCatalogDatabases.special,
  weaponCatalogDatabases.kits,
  mainWeaponParameterDatabase,
);
export const mainWeaponParameters: readonly MainWeaponParameterRecord[] =
  mainWeaponParameterDatabase.records;
export const PARAMETER_VERIFIED_WEAPON_COUNT = mainWeaponParameters.filter(
  ({ parameters }) => parameters.some(({ status }) => status === 'verified'),
).length;

export function getMainWeaponParameters(
  weaponId: string,
): MainWeaponParameterRecord {
  const record = mainWeaponParameters.find(
    (parameterRecord) => parameterRecord.weaponId === weaponId,
  );
  if (!record) throw new Error(`Missing parameter record: ${weaponId}`);
  return record;
}

export function summarizeMainWeaponParameters(weaponId: string) {
  const parameters = getMainWeaponParameters(weaponId).parameters;
  return parameters.reduce(
    (summary, parameter) => {
      summary[parameter.status] += 1;
      return summary;
    },
    {
      total: parameters.length,
      verified: 0,
      pending: 0,
      'not-applicable': 0,
      demo: 0,
    },
  );
}
