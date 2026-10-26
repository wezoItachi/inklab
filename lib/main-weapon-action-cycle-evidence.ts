import type {
  MainWeaponParameterField,
  MainWeaponParameterRecord,
  WeaponFamily,
} from '../database/schema.ts';

export type ActionCycleEvidence = {
  key:
    | 'horizontalSwingFrames'
    | 'verticalSwingFrames'
    | 'completeFireCycleFrames';
  label: string;
  definition: string;
  inputProtocol: string;
  excluded: string;
  sourcePrimitive: { label: string; value: number; unit: string } | null;
};

function verifiedNumber(
  parameters: readonly MainWeaponParameterField[],
  key: string,
) {
  const field = parameters.find((parameter) => parameter.key === key);
  return field?.status === 'verified' && typeof field.value === 'number'
    ? field.value
    : null;
}

export function getMainWeaponActionCycleEvidence(
  record: MainWeaponParameterRecord,
  family: WeaponFamily,
): readonly ActionCycleEvidence[] {
  if (family === '滚筒') {
    const horizontalPhase = verifiedNumber(
      record.parameters,
      'horizontalSwingPhaseFrames',
    );
    const verticalPhase = verifiedNumber(
      record.parameters,
      'verticalSwingPhaseFrames',
    );
    return [
      {
        key: 'horizontalSwingFrames',
        label: '横挥连续周期',
        definition:
          '连续横挥时，第 N 次主要墨滴释放帧到第 N+1 次同一释放帧的间隔。',
        inputProtocol:
          '站立、平地、持续保持最快合法横挥输入，至少记录 10 个连续周期。',
        excluded: '首次按键前等待、转向、跳跃、竖挥、潜墨取消和墨水回复。',
        sourcePrimitive:
          horizontalPhase === null
            ? null
            : {
                label: '横挥内部阶段',
                value: horizontalPhase,
                unit: '帧',
              },
      },
      {
        key: 'verticalSwingFrames',
        label: '竖挥连续周期',
        definition:
          '连续竖挥时，第 N 次主要墨滴释放帧到第 N+1 次同一释放帧的间隔。',
        inputProtocol:
          '站立、平地、持续保持最快合法竖挥输入，至少记录 10 个连续周期。',
        excluded: '首次跳跃过程、落地硬直、横挥、潜墨取消和墨水回复。',
        sourcePrimitive:
          verticalPhase === null
            ? null
            : {
                label: '竖挥内部阶段',
                value: verticalPhase,
                unit: '帧',
              },
      },
    ];
  }
  if (family === '伞') {
    return [
      {
        key: 'completeFireCycleFrames',
        label: '连续主武射击周期',
        definition:
          '最快合法连续射击时，第 N 轮散弹释放帧到第 N+1 轮散弹释放帧的间隔。',
        inputProtocol:
          '站立、平地、重复点按主武器射击，不长按进入开伞/发射状态，至少记录 10 个周期。',
        excluded: '开伞、伞面发射、伞面恢复、潜墨取消、墨水回复和空中射击。',
        sourcePrimitive: null,
      },
    ];
  }
  return [];
}
