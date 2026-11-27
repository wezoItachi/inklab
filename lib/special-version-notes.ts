export type SpecialVersionNote = {
  specialId: string;
  gameVersion: '12.0.0';
  summary: string;
  modelStatus: 'parameter-linked' | 'rule-only';
  modelNote: string;
};

const notes: SpecialVersionNote[] = [
  {
    specialId: 'reef-slider',
    gameVersion: '12.0.0',
    summary: '爆炸后的无敌时间延长约 0.25 秒，70 伤害范围缩小约 15%。',
    modelStatus: 'rule-only',
    modelNote: '官方规则已记录；伤害范围索引仍待核验，不进入 AP 试算。',
  },
  {
    specialId: 'tenta-missiles',
    gameVersion: '12.0.0',
    summary: '导弹发射与落下间隔缩短约 25%，未装备特殊武器性能时的锁定准星半径扩大约 29%。',
    modelStatus: 'parameter-linked',
    modelNote: '当前锁定准星半径曲线读取 Ver. 12.0.0 快照；发射与落下节奏暂不换算为输出结论。',
  },
  {
    specialId: 'zipcaster',
    gameVersion: '12.0.0',
    summary: '使用触手移动期间的护甲值由 30 提高至 60。',
    modelStatus: 'rule-only',
    modelNote: '当前只计算触手动作与维持耗墨；护甲不与耗墨曲线混算。',
  },
  {
    specialId: 'splattercolor-screen',
    gameVersion: '12.0.0',
    summary: '幕墙向周围喷洒的墨滴数量约为此前的 3 倍。',
    modelStatus: 'rule-only',
    modelNote: '当前只计算幕墙移动速度；墨滴数量不等同于涂墨面积或伤害。',
  },
  {
    specialId: 'tacticooler',
    gameVersion: '12.0.0',
    summary: '特殊武器性能对饮料强化持续时间的延长效果约降为此前的一半。',
    modelStatus: 'parameter-linked',
    modelNote: '当前饮料强化持续时间曲线已读取 Ver. 12.0.0 快照。',
  },
];

const notesBySpecialId = new Map(notes.map((note) => [note.specialId, note]));

export function getSpecialVersionNote(specialId: string) {
  return notesBySpecialId.get(specialId) ?? null;
}

export function summarizeSpecialVersionNotes() {
  return {
    total: notes.length,
    parameterLinked: notes.filter(({ modelStatus }) => modelStatus === 'parameter-linked').length,
    ruleOnly: notes.filter(({ modelStatus }) => modelStatus === 'rule-only').length,
  };
}
