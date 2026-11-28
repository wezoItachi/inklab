import type { MainWeaponParameterRecord } from '../database/schema.ts';
import {
  analyzeBlasterEfficiency,
  analyzeBrushEfficiency,
  analyzeChargerEfficiency,
  analyzeMainWeaponEfficiency,
  analyzeManeuverEfficiency,
  analyzeRollerEfficiency,
  analyzeSaberEfficiency,
  analyzeShelterEfficiency,
  analyzeSlosherEfficiency,
  analyzeSpinnerEfficiency,
  analyzeStringerEfficiency,
  type BlasterEfficiency,
  type BrushEfficiency,
  type ChargerEfficiency,
  type MainWeaponEfficiency,
  type ManeuverEfficiency,
  type RollerEfficiency,
  type SaberEfficiency,
  type ShelterEfficiency,
  type SlosherEfficiency,
  type SpinnerEfficiency,
  type StringerEfficiency,
} from './main-weapon-analysis.ts';
import type { WeaponFamily } from './weapon-catalog.ts';

export type MainWeaponLabModel =
  | { kind: 'shooter'; analysis: MainWeaponEfficiency; modelInputCount: 6 }
  | { kind: 'blaster'; analysis: BlasterEfficiency; modelInputCount: 8 }
  | { kind: 'roller'; analysis: RollerEfficiency; modelInputCount: 13 }
  | { kind: 'brush'; analysis: BrushEfficiency; modelInputCount: 12 }
  | { kind: 'charger'; analysis: ChargerEfficiency; modelInputCount: 6 }
  | { kind: 'slosher'; analysis: SlosherEfficiency; modelInputCount: 13 }
  | { kind: 'spinner'; analysis: SpinnerEfficiency; modelInputCount: 23 }
  | { kind: 'maneuver'; analysis: ManeuverEfficiency; modelInputCount: 11 }
  | { kind: 'shelter'; analysis: ShelterEfficiency; modelInputCount: 14 }
  | { kind: 'stringer'; analysis: StringerEfficiency; modelInputCount: 11 }
  | { kind: 'saber'; analysis: SaberEfficiency; modelInputCount: 17 };

function model<T extends MainWeaponLabModel>(
  value: T['analysis'] | null,
  metadata: Omit<T, 'analysis'>,
): T | null {
  return value ? ({ ...metadata, analysis: value } as T) : null;
}

export function analyzeMainWeaponLabModel(
  record: MainWeaponParameterRecord,
  family: WeaponFamily,
): MainWeaponLabModel | null {
  switch (family) {
    case '射击枪':
      return model<Extract<MainWeaponLabModel, { kind: 'shooter' }>>(
        analyzeMainWeaponEfficiency(record),
        { kind: 'shooter', modelInputCount: 6 },
      );
    case '爆破枪':
      return model<Extract<MainWeaponLabModel, { kind: 'blaster' }>>(
        analyzeBlasterEfficiency(record),
        { kind: 'blaster', modelInputCount: 8 },
      );
    case '滚筒':
      return model<Extract<MainWeaponLabModel, { kind: 'roller' }>>(
        analyzeRollerEfficiency(record),
        { kind: 'roller', modelInputCount: 13 },
      );
    case '画笔':
      return model<Extract<MainWeaponLabModel, { kind: 'brush' }>>(
        analyzeBrushEfficiency(record),
        { kind: 'brush', modelInputCount: 12 },
      );
    case '蓄力枪':
      return model<Extract<MainWeaponLabModel, { kind: 'charger' }>>(
        analyzeChargerEfficiency(record),
        { kind: 'charger', modelInputCount: 6 },
      );
    case '泼桶':
      return model<Extract<MainWeaponLabModel, { kind: 'slosher' }>>(
        analyzeSlosherEfficiency(record),
        { kind: 'slosher', modelInputCount: 13 },
      );
    case '加特林':
      return model<Extract<MainWeaponLabModel, { kind: 'spinner' }>>(
        analyzeSpinnerEfficiency(record),
        { kind: 'spinner', modelInputCount: 23 },
      );
    case '双枪':
      return model<Extract<MainWeaponLabModel, { kind: 'maneuver' }>>(
        analyzeManeuverEfficiency(record),
        { kind: 'maneuver', modelInputCount: 11 },
      );
    case '伞':
      return model<Extract<MainWeaponLabModel, { kind: 'shelter' }>>(
        analyzeShelterEfficiency(record),
        { kind: 'shelter', modelInputCount: 14 },
      );
    case '弓':
      return model<Extract<MainWeaponLabModel, { kind: 'stringer' }>>(
        analyzeStringerEfficiency(record),
        { kind: 'stringer', modelInputCount: 11 },
      );
    case '刮水刀':
      return model<Extract<MainWeaponLabModel, { kind: 'saber' }>>(
        analyzeSaberEfficiency(record),
        { kind: 'saber', modelInputCount: 17 },
      );
    default: {
      const unsupportedFamily: never = family;
      throw new Error(`未覆盖的主武器族：${String(unsupportedFamily)}`);
    }
  }
}
