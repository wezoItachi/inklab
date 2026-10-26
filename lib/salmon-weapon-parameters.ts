import document from '../database/salmon-weapon-parameters.v11.3.0.json' with { type: 'json' };

export type SalmonParameterSourceMode =
  | 'coop-override'
  | 'base-inherited'
  | 'bear-explicit'
  | 'parent-inherited';

export type SalmonWeaponParameter = {
  key: string;
  label: string;
  value: number | boolean;
  unit: string;
  status: 'verified';
  sourceMode: SalmonParameterSourceMode;
  upstreamPath: string;
  checkedAt: string;
};

export type SalmonWeaponParameterRecord = {
  id: string;
  kind: 'regular' | 'grizzco';
  weaponId: string | null;
  upstreamRowId: string | null;
  name: string;
  family: string;
  sourceId: string;
  baseFiles: string[];
  coopFile: string | null;
  parameters: SalmonWeaponParameter[];
  unresolvedParameterKeys: string[];
};

export const salmonWeaponParameterRecords =
  document.records as SalmonWeaponParameterRecord[];

const byBattleWeaponId = new Map(
  salmonWeaponParameterRecords.flatMap((record) =>
    record.weaponId ? [[record.weaponId, record] as const] : [],
  ),
);
const byRecordId = new Map(
  salmonWeaponParameterRecords.map((record) => [record.id, record]),
);

export function getRegularSalmonParameters(battleWeaponId: string) {
  return byBattleWeaponId.get(battleWeaponId) ?? null;
}

export function getGrizzcoParameters(grizzcoWeaponId: string) {
  const record = byRecordId.get(grizzcoWeaponId);
  return record?.kind === 'grizzco' ? record : null;
}
