import type {
  MainWeaponParameterField,
  MainWeaponParameterRecord,
  WeaponFamily,
} from '../database/schema.ts';

export type MainWeaponRangeEvidenceMetric={
  key:string;
  label:string;
  value:number;
  unit:string;
};

export type MainWeaponRangeEvidence={
  status:'source-backed-primitives'|'pending';
  modelLabel:string;
  metrics:MainWeaponRangeEvidenceMetric[];
  limitation:string;
};

const pendingLimitations:Record<WeaponFamily,string>={
  射击枪:'等待伤害衰减帧、弹丸速度与后续运动阶段共同完成距离积分。',
  爆破枪:'等待弹道终点、爆炸触发与爆风控制点形成完整距离模型。',
  滚筒:'横挥、竖挥与碾压需要分别核对墨滴分布和伤害距离。',
  画笔:'挥击墨滴分布与刷地接触范围尚未形成统一距离模型。',
  蓄力枪:'等待把各蓄力阶段弹道距离与伤害判定统一建模。',
  泼桶:'伤害单元轨迹、反弹和爆风不能用一个通用射程值概括。',
  加特林:'需要核对弹丸运动、伤害衰减与不同蓄力阶段的关系。',
  双枪:'普通射击与翻滚后射击可能需要分别建立弹道证据。',
  伞:'散弹分布、单颗判定和整轮有效伤害范围需要分开核对。',
  弓:'不同蓄力阶段、箭矢散布和爆炸范围需要分别建模。',
  刮水刀:'墨刃飞行距离与近身刀身判定必须作为两种范围处理。',
};

function verifiedNumber(
  parameters:readonly MainWeaponParameterField[],
  key:string,
){
  const field=parameters.find(parameter=>parameter.key===key);
  return field?.status==='verified'&&typeof field.value==='number'&&Number.isFinite(field.value)
    ? field.value
    : null;
}

function metric(
  parameters:readonly MainWeaponParameterField[],
  key:string,
  label:string,
  unit:string,
):MainWeaponRangeEvidenceMetric|null{
  const value=verifiedNumber(parameters,key);
  return value===null?null:{key,label,value,unit};
}

export function analyzeMainWeaponRangeEvidence(
  record:MainWeaponParameterRecord,
  family:WeaponFamily,
):MainWeaponRangeEvidence{
  const parameters=record.parameters;
  let modelLabel='射程定义待验证';
  let limitation=pendingLimitations[family];
  let candidates:Array<MainWeaponRangeEvidenceMetric|null>=[];

  if(family==='射击枪'){
    modelLabel='弹丸衰减时间轴';
    limitation='当前只证明衰减帧和弹丸初速；尚未积分后续运动、重力与碰撞，因此不输出距离。';
    candidates=[
      metric(parameters,'damageFalloffStartFrames','开始衰减','帧'),
      metric(parameters,'damageFalloffEndFrames','最低伤害层','帧'),
      metric(parameters,'projectileSpawnSpeed','弹丸初速','内部单位'),
    ];
  }else if(family==='爆破枪'){
    modelLabel='标准爆风距离控制点';
    limitation='控制点用于解释爆风伤害曲线，不直接等同于武器总射程或完整爆炸半径。';
    candidates=[
      metric(parameters,'nearBlastDistance','近端控制点','内部单位'),
      metric(parameters,'farBlastDistance','远端控制点','内部单位'),
    ];
  }else if(family==='蓄力枪'){
    modelLabel='满蓄力弹道距离';
    limitation='只表示参数文件的满蓄力弹道距离，不替代未满蓄力射程或实际有效命中范围。';
    candidates=[
      metric(parameters,'fullChargeTravelDistance','满蓄力弹道','内部单位'),
    ];
  }else if(family==='泼桶'){
    modelLabel='独立爆风范围';
    limitation='仅爆炸泼桶类显式提供爆风范围；它不是所有泼桶通用射程，也不与直击轨迹自动相加。';
    candidates=[
      metric(parameters,'blastDamageRadius','爆风伤害范围','内部单位'),
    ];
  }

  const metrics=candidates.filter(
    (item):item is MainWeaponRangeEvidenceMetric=>item!==null,
  );
  return{
    status:metrics.length>0?'source-backed-primitives':'pending',
    modelLabel,
    metrics,
    limitation,
  };
}
