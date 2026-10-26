import {
  DATA_VERSION,
  getMainWeaponParameters,
  type Weapon,
} from './weapons.ts';

export type VerificationStatus =
  | 'verified'
  | 'partial'
  | 'pending'
  | 'not-applicable'
  | 'demo';

export type ParameterField = {
  label: string;
  status: VerificationStatus;
  source?: string;
  note: string;
};

export type WeaponParameterSnapshot = {
  weaponId: string;
  gameVersion: typeof DATA_VERSION;
  upstreamSnapshotVersion: '11.3.0';
  fields: readonly ParameterField[];
};

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  verified: '已核对',
  partial: '部分已核对',
  pending: '待验证',
  'not-applicable': '不适用',
  demo: '原型演示',
};

export const parameterSources = {
  nintendo1130: {
    label: 'Nintendo Ver. 11.3.0 更新公告',
    url: 'https://www.nintendo.com/en-gb/Support/Nintendo-Switch/Game-Updates/How-to-Update-Splatoon-3-2266003.html',
    checkedAt: '2026-09-27',
  },
  leanny1130: {
    label: 'Leanny/splat3 11.3.0 参数快照',
    url: 'https://github.com/Leanny/splat3/tree/main/data/parameter/1130',
    checkedAt: '2026-10-07',
  },
  internalReview: {
    label: 'INKLAB 六武器参数人工核对记录',
    checkedAt: '2026-09-06',
  },
} as const;

export function getWeaponParameterSnapshot(
  weapon: Weapon,
): WeaponParameterSnapshot {
  const mainParameters = getMainWeaponParameters(weapon.id).parameters;
  const verifiedMainParameters = mainParameters.filter(
    ({ status }) => status === 'verified',
  ).length;
  return {
    weaponId: weapon.id,
    gameVersion: DATA_VERSION,
    upstreamSnapshotVersion: '11.3.0',
    fields: [
      {
        label: '武器套装',
        status: 'verified',
        source:
          weapon.sourceId === 'leanny-splat3' ? 'leanny1130' : 'internalReview',
        note: `${weapon.sub.name} · ${weapon.special}`,
      },
      {
        label: '副武耗墨',
        status: weapon.sub.baseInkCost === null ? 'pending' : 'verified',
        source: weapon.sub.baseInkCost === null ? undefined : 'internalReview',
        note:
          weapon.sub.baseInkCost === null
            ? '副武器身份已导入，基础耗墨尚未逐字段核对'
            : `基础耗墨 ${weapon.sub.baseInkCost}%`,
      },
      {
        label: '副武增强对象',
        status: weapon.sub.subPowerEffect === null ? 'pending' : 'verified',
        source:
          weapon.sub.subPowerEffect === null ? undefined : 'internalReview',
        note: weapon.sub.subPowerEffect ?? '副武增强作用对象尚未逐字段核对',
      },
      {
        label: '主武参数',
        status:
          verifiedMainParameters === mainParameters.length
            ? 'verified'
            : 'pending',
        note: `已建 ${mainParameters.length} 个字段 · ${verifiedMainParameters} 个已核对`,
      },
      {
        label: 'AP 效果曲线',
        status: 'partial',
        note: '主武器墨水效率提升已核对；其余能力效果曲线待验证',
      },
      {
        label: '系统建议',
        status: 'demo',
        note: '由武器族与已核对套装生成；不含外部或内测样本',
      },
    ],
  };
}

export function summarizeParameterStatuses(
  fields: readonly ParameterField[],
): Record<VerificationStatus, number> {
  return fields.reduce<Record<VerificationStatus, number>>(
    (summary, field) => {
      summary[field.status] += 1;
      return summary;
    },
    {
      verified: 0,
      partial: 0,
      pending: 0,
      'not-applicable': 0,
      demo: 0,
    },
  );
}
