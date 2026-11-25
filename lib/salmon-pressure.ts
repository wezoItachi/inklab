import salmonTargetDocument from '../database/salmon-targets.v12.0.0.json' with { type: 'json' };
import {salmonRecoveryModelGate} from './salmon-ink-cycle.ts';

export type SalmonPressureStrategy='synchronized'|'staggered';
export type SalmonOutputProfile='limit'|'routine';

export type SalmonAttackPattern={
  label:string;
  damagePerAction:number;
  actionFrames:number;
  inkConsumptionPerAction:number;
  note:string;
};

export type SalmonWeaponPerformance={
  weaponId:string;
  name:string;
  limit:SalmonAttackPattern;
  routine:SalmonAttackPattern;
  sourcePaths:readonly string[];
};

export type SalmonTarget={
  id:string;
  name:string;
  health:number;
  category:'狂潮'|'大鲑鱼'|'特殊事件';
  note:string;
  healthExpression:string;
  upstreamType:string;
  healthStatus:'reviewed-community-reference';
};

export const SALMON_MODEL_VERSION='draft-2026-11-25';
export const SALMON_TARGET_HEALTH_MIN=1;
export const SALMON_TARGET_HEALTH_MAX=100000;

export const parseSalmonTargetHealth=(raw:string):{value:number|null;message:string|null}=>{
  if(raw.trim()==='')return{value:null,message:'请输入目标生命值。'};
  const value=Number(raw);
  if(!Number.isFinite(value)||!Number.isInteger(value))return{value:null,message:'目标生命值需要填写整数。'};
  if(value<SALMON_TARGET_HEALTH_MIN||value>SALMON_TARGET_HEALTH_MAX)return{value:null,message:`请输入 ${SALMON_TARGET_HEALTH_MIN}–${SALMON_TARGET_HEALTH_MAX} HP。`};
  return{value,message:null};
};

const shooterPattern=(damage:number,frames:number,ink:number):SalmonAttackPattern=>({label:'连续射击',damagePerAction:damage,actionFrames:frames,inkConsumptionPerAction:ink,note:'保持射击并假设全部命中'});

const continuousFireWeapons=[
  {weaponId:'salmon-shooter-short-00',name:'广域标记枪',upstreamStem:'WeaponShooterShort',damage:45,frames:5,ink:.8,coopOverride:true},
  {weaponId:'splash-o-matic',name:'窄域标记枪',upstreamStem:'WeaponShooterPrecision',damage:29,frames:5,ink:.8,coopOverride:true},
  {weaponId:'salmon-shooter-first-00',name:'新叶射击枪',upstreamStem:'WeaponShooterFirst',damage:28,frames:5,ink:.43,coopOverride:true},
  {weaponId:'salmon-shooter-blaze-00',name:'专业模型枪MG',upstreamStem:'WeaponShooterBlaze',damage:24,frames:4,ink:.5,coopOverride:true},
  {weaponId:'52-gal',name:'.52加仑',upstreamStem:'WeaponShooterGravity',damage:52,frames:9,ink:1.3,coopOverride:true},
  {weaponId:'salmon-shooter-quickmiddle-00',name:'N-ZAP85',upstreamStem:'WeaponShooterQuickMiddle',damage:30,frames:5,ink:.8,coopOverride:false},
  {weaponId:'salmon-shooter-expert-00',name:'顶尖射击枪',upstreamStem:'WeaponShooterExpert',damage:45,frames:8,ink:1.6,coopOverride:true},
  {weaponId:'salmon-shooter-heavy-00',name:'.96加仑',upstreamStem:'WeaponShooterHeavy',damage:85,frames:12,ink:2.3,coopOverride:true},
  {weaponId:'jet-squelcher',name:'喷射清洁枪',upstreamStem:'WeaponShooterLong',damage:40,frames:8,ink:1.5,coopOverride:true},
  {weaponId:'salmon-shooter-quicklong-00',name:'太空射击枪',upstreamStem:'WeaponShooterQuickLong',damage:30,frames:6,ink:.8,coopOverride:true},
] as const;

const continuousFirePerformance=continuousFireWeapons.map(({weaponId,name,upstreamStem,damage,frames,ink,coopOverride})=>{
  const pattern=shooterPattern(damage,frames,ink);
  const basePath=`data/parameter/1200/weapon/${upstreamStem}.game__GameParameterTable.json`;
  const coopPath=`data/parameter/1200/weapon/${upstreamStem}_Coop.game__GameParameterTable.json`;
  return{weaponId,name,limit:pattern,routine:pattern,sourcePaths:coopOverride?[basePath,coopPath]:[basePath]} satisfies SalmonWeaponPerformance;
});

const verifiedDualiePerformance:readonly SalmonWeaponPerformance[]=[
  {weaponId:'salmon-maneuver-gallon-00',name:'开尔文525',limit:{label:'翻滚后连续射击',damagePerAction:70,actionFrames:9,inkConsumptionPerAction:1.4,note:'已进入翻滚后射击状态；不计首次翻滚的耗墨与动作时间'},routine:{label:'普通连续射击',damagePerAction:45,actionFrames:9,inkConsumptionPerAction:1.4,note:'不使用翻滚强化状态并假设全部命中'},sourcePaths:['data/parameter/1200/weapon/WeaponManeuverGallon.game__GameParameterTable.json','data/parameter/1200/weapon/WeaponManeuverGallon_Coop.game__GameParameterTable.json']},
  {weaponId:'salmon-maneuver-long-00',name:'灭熄FF',limit:{label:'翻滚后连续射击',damagePerAction:40,actionFrames:4,inkConsumptionPerAction:1.2,note:'已进入翻滚后射击状态；不计首次翻滚的耗墨与动作时间'},routine:{label:'普通连续射击',damagePerAction:40,actionFrames:8,inkConsumptionPerAction:1.2,note:'不使用翻滚强化状态并假设全部命中'},sourcePaths:['data/parameter/1200/weapon/WeaponManeuverLong.game__GameParameterTable.json','data/parameter/1200/weapon/WeaponManeuverLong_Coop.game__GameParameterTable.json']},
  {weaponId:'grizzco-dualies',name:'熊先生印章机动枪',limit:{label:'翻滚后连续射击',damagePerAction:35,actionFrames:4,inkConsumptionPerAction:.5,note:'已进入翻滚后射击状态；不计首次翻滚的耗墨与动作时间'},routine:{label:'普通连续射击',damagePerAction:35,actionFrames:5,inkConsumptionPerAction:.5,note:'不使用翻滚强化状态并假设全部命中'},sourcePaths:['data/parameter/1200/weapon/WeaponManeuverBear_Coop.game__GameParameterTable.json']},
] as const;

export const salmonWeaponPerformance:readonly SalmonWeaponPerformance[]=[
  ...continuousFirePerformance,
  ...verifiedDualiePerformance,
  {weaponId:'tri-stringer',name:'三发猎鱼弓',limit:{label:'一段蓄力 · 三箭全中',damagePerAction:300,actionFrames:40,inkConsumptionPerAction:4,note:'30 帧一段蓄力 + 10 帧后摇'},routine:{label:'一段／满蓄力各一次',damagePerAction:750,actionFrames:122,inkConsumptionPerAction:11.5,note:'一段 300 伤害／40 帧与满蓄力 450 伤害／82 帧各一次；不是玩家统计'},sourcePaths:['data/parameter/1200/weapon/WeaponStringerNormal.game__GameParameterTable.json','data/parameter/1200/weapon/WeaponStringerNormal_Coop.game__GameParameterTable.json']},
] as const;

export const salmonPressurePresets=[
  {id:'aerospray-four',label:'4×广域标记枪',weaponIds:['salmon-shooter-short-00','salmon-shooter-short-00','salmon-shooter-short-00','salmon-shooter-short-00']},
  {id:'splash-four',label:'4×窄域标记枪',weaponIds:['splash-o-matic','splash-o-matic','splash-o-matic','splash-o-matic']},
  {id:'mixed-shooters',label:'射击枪混编',weaponIds:['salmon-shooter-short-00','splash-o-matic','splash-o-matic','salmon-shooter-heavy-00']},
  {id:'tri-stringer-four',label:'4×三发猎鱼弓',weaponIds:['tri-stringer','tri-stringer','tri-stringer','tri-stringer']},
  {id:'dualies-states',label:'双枪状态对照',weaponIds:['salmon-maneuver-gallon-00','salmon-maneuver-long-00','grizzco-dualies','salmon-maneuver-gallon-00']},
] as const;

export const salmonTargets=salmonTargetDocument.records as readonly SalmonTarget[];

export const rushTargets=salmonTargets.filter(target=>target.category==='狂潮');

export function getSalmonWeaponPerformance(weaponId:string){
  return salmonWeaponPerformance.find(item=>item.weaponId===weaponId)??null;
}

export function getWeaponActionWindow(performance:SalmonWeaponPerformance,profile:SalmonOutputProfile='limit'){
  const pattern=performance[profile];
  const actionDps=pattern.damagePerAction*60/pattern.actionFrames;
  const actionsPerTank=Math.floor((100+Number.EPSILON)/pattern.inkConsumptionPerAction);
  const firingSecondsPerTank=actionsPerTank*pattern.actionFrames/60;
  const damagePerTank=actionsPerTank*pattern.damagePerAction;
  return{profile,pattern,actionDps,actionsPerTank,firingSecondsPerTank,damagePerTank};
}

export function analyzeSalmonPressure(weaponIds:readonly string[],strategy:SalmonPressureStrategy,profile:SalmonOutputProfile='limit'){
  const performances=weaponIds.map(getSalmonWeaponPerformance);
  const missingWeaponIds=weaponIds.filter((_,index)=>performances[index]===null);
  if(missingWeaponIds.length)return{ready:false as const,missingWeaponIds,weaponResults:performances};
  const actionWindows=performances.map(item=>getWeaponActionWindow(item!,profile));
  const combinedActionDps=actionWindows.reduce((sum,item)=>sum+item.actionDps,0);
  return{ready:true as const,strategy,profile,actionWindows,combinedActionDps,recoveryModelReady:salmonRecoveryModelGate.ready,recoveryModelBlockers:salmonRecoveryModelGate.blockers};
}

export function compareSalmonPressure(weaponIds:readonly string[],strategy:SalmonPressureStrategy){
  return{limit:analyzeSalmonPressure(weaponIds,strategy,'limit'),routine:analyzeSalmonPressure(weaponIds,strategy,'routine')};
}

export function analyzeTargetActions(pattern:SalmonAttackPattern,targetHealth:number){
  const health=Math.max(1,targetHealth);
  const damageEquivalent=health/pattern.damagePerAction;
  const requiredActions=Math.ceil(damageEquivalent);
  const totalDamage=requiredActions*pattern.damagePerAction;
  return{
    damageEquivalent,
    requiredActions,
    totalDamage,
    overkill:totalDamage-health,
    totalFrames:requiredActions*pattern.actionFrames,
    totalInkConsumption:requiredActions*pattern.inkConsumptionPerAction,
  };
}
