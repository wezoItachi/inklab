import type {
  MainWeaponParameterField,
  MainWeaponParameterRecord,
  WeaponFamily,
} from '../database/schema.ts';

export type CapabilityEvidence = {
  key: 'canRecharge' | 'canLaunchCanopy';
  label: string;
  definition: string;
  observationProtocol: string;
  positiveResult: string;
  negativeResult: string;
};

function isPending(
  parameters: readonly MainWeaponParameterField[],
  key: CapabilityEvidence['key'],
) {
  return parameters.some(
    (parameter) => parameter.key === key && parameter.status === 'pending',
  );
}

export function getMainWeaponCapabilityEvidence(
  record: MainWeaponParameterRecord,
  family: WeaponFamily,
): readonly CapabilityEvidence[] {
  if (family === '加特林' && isPending(record.parameters, 'canRecharge')) {
    return [
      {
        key: 'canRecharge',
        label: '射击中能否续蓄',
        definition:
          '已进入有效射击状态后，主武输入能否在该轮射击结束前重新增加可供后续发射的蓄力量。',
        observationProtocol:
          '在墨水充足的平地完成一次蓄力，释放进入射击后立即重新按住主武输入；同步记录蓄力槽、当前弹流和后续可发射量，至少复测 5 次。',
        positiveResult:
          '射击仍在进行时，蓄力槽出现可重复的新增量，并能转化为后续实际发射。',
        negativeResult:
          '完整重复输入均未在当前射击结束前新增蓄力；须排除墨水不足、输入中断和录像不可见后才可记为 false。',
      },
    ];
  }
  if (family === '伞' && isPending(record.parameters, 'canLaunchCanopy')) {
    return [
      {
        key: 'canLaunchCanopy',
        label: '能否发射伞面',
        definition:
          '伞面完整、墨水充足且持续保持主武输入时，展开后的伞面能否与武器分离并向前移动。',
        observationProtocol:
          '在无障碍平地从闭合状态持续按住主武输入，覆盖射击、展开和可能的发射窗口；从侧面录像并至少复测 5 次。',
        positiveResult: '伞面与持有者分离并独立向前移动。',
        negativeResult:
          '持续输入覆盖完整窗口仍不分离；须排除伞面受损、墨水不足、碰撞和提前松键后才可记为 false。',
      },
    ];
  }
  return [];
}
