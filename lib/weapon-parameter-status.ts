import {
  DATA_VERSION,
  getMainWeaponParameters,
  type Weapon,
} from './weapons.ts';
import { getWeaponVerificationRouteSummary } from './battle-verification-queue.ts';

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
  shortNote?: string;
  note: string;
};

export type WeaponParameterSnapshot = {
  weaponId: string;
  gameVersion: typeof DATA_VERSION;
  upstreamSnapshotVersion: '12.0.0';
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
  nintendo1200: {
    label: 'Nintendo Ver. 12.0.0 更新公告',
    url: 'https://support.nintendo.com/jp/switch/software_support/av5ja/1200.html',
    checkedAt: '2026-11-19',
  },
  leanny1200: {
    label: 'Leanny/splat3 12.0.0 参数快照',
    url: 'https://github.com/Leanny/splat3/tree/b669d55e0eef1f1a7f18cb7468c636ed7746c189/data/parameter/1200',
    checkedAt: '2026-11-19',
  },
  subInkCurveCrossCheck: {
    label: 'Leanny 12.0 参数与 Sendou.ink 分析器交叉核对',
    url: 'https://github.com/sendou-ink/sendou.ink/tree/8bcc6e48c3aec3cae9b6292137c7fc6bf811e9fc/app/features/build-analyzer',
    checkedAt: '2026-11-20',
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
  const notApplicableMainParameters = mainParameters.filter(
    ({ status }) => status === 'not-applicable',
  ).length;
  const pendingMainParameters =
    mainParameters.length -
    verifiedMainParameters -
    notApplicableMainParameters;
  const verificationRoutes = getWeaponVerificationRouteSummary(weapon.id);
  return {
    weaponId: weapon.id,
    gameVersion: DATA_VERSION,
    upstreamSnapshotVersion: '12.0.0',
    fields: [
      {
        label: '武器套装',
        status: 'verified',
        source:
          weapon.sourceId === 'leanny-splat3' ? 'leanny1200' : 'internalReview',
        note: `${weapon.sub.name} · ${weapon.special}`,
      },
      {
        label: '副武耗墨',
        status: weapon.sub.baseInkCost === null ? 'pending' : 'verified',
        source:
          weapon.sub.baseInkCost === null
            ? undefined
            : 'subInkCurveCrossCheck',
        note:
          weapon.sub.baseInkCost === null
            ? '副武器身份已导入，基础耗墨尚未逐字段核对'
            : `基础耗墨 ${weapon.sub.baseInkCost}% · 副省 Lv${weapon.sub.inkSaverLevel}`,
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
          pendingMainParameters === 0
            ? 'verified'
            : verifiedMainParameters > 0 || notApplicableMainParameters > 0
              ? 'partial'
              : 'pending',
        source: pendingMainParameters === 0 ? 'leanny1200' : undefined,
        shortNote: verificationRoutes.shortLabel,
        note: `已建 ${mainParameters.length} 个字段 · ${verifiedMainParameters} 个已核对 · ${notApplicableMainParameters} 个不适用 · ${pendingMainParameters} 个待验证`,
      },
      {
        label: 'AP 效果曲线',
        status: 'partial',
        note: '主武省墨、副武省墨、普通对战回墨与超级跳跃时间已核对；其余能力曲线待验证',
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
