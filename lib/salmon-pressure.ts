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

export const SALMON_MODEL_VERSION='draft-2026-10-08';

const shooterPattern=(damage:number,frames:number,ink:number):SalmonAttackPattern=>({label:'连续射击',damagePerAction:damage,actionFrames:frames,inkConsumptionPerAction:ink,note:'保持射击并假设全部命中'});

export const salmonWeaponPerformance:readonly SalmonWeaponPerformance[]=[
  {weaponId:'salmon-shooter-short-00',name:'广域标记枪',limit:shooterPattern(45,5,.8),routine:shooterPattern(45,5,.8),sourcePaths:['data/parameter/1130/weapon/WeaponShooterShort.game__GameParameterTable.json','data/parameter/1130/weapon/WeaponShooterShort_Coop.game__GameParameterTable.json']},
  {weaponId:'splash-o-matic',name:'窄域标记枪',limit:shooterPattern(28,5,.8),routine:shooterPattern(28,5,.8),sourcePaths:['data/parameter/1130/weapon/WeaponShooterPrecision.game__GameParameterTable.json','data/parameter/1130/weapon/WeaponShooterPrecision_Coop.game__GameParameterTable.json']},
  {weaponId:'salmon-shooter-heavy-00',name:'.96加仑',limit:shooterPattern(85,12,2.3),routine:shooterPattern(85,12,2.3),sourcePaths:['data/parameter/1130/weapon/WeaponShooterHeavy.game__GameParameterTable.json','data/parameter/1130/weapon/WeaponShooterHeavy_Coop.game__GameParameterTable.json']},
  {weaponId:'tri-stringer',name:'三发猎鱼弓',limit:{label:'一段蓄力 · 三箭全中',damagePerAction:300,actionFrames:40,inkConsumptionPerAction:4,note:'30 帧一段蓄力 + 10 帧后摇'},routine:{label:'一段／满蓄力各一次',damagePerAction:750,actionFrames:122,inkConsumptionPerAction:11.5,note:'一段 300 伤害／40 帧与满蓄力 450 伤害／82 帧各一次；不是玩家统计'},sourcePaths:['data/parameter/1130/weapon/WeaponStringerNormal.game__GameParameterTable.json','data/parameter/1130/weapon/WeaponStringerNormal_Coop.game__GameParameterTable.json']},
] as const;

export const salmonPressurePresets=[
  {id:'aerospray-four',label:'4×广域标记枪',weaponIds:['salmon-shooter-short-00','salmon-shooter-short-00','salmon-shooter-short-00','salmon-shooter-short-00']},
  {id:'splash-four',label:'4×窄域标记枪',weaponIds:['splash-o-matic','splash-o-matic','splash-o-matic','splash-o-matic']},
  {id:'mixed-shooters',label:'射击枪混编',weaponIds:['salmon-shooter-short-00','splash-o-matic','splash-o-matic','salmon-shooter-heavy-00']},
  {id:'tri-stringer-four',label:'4×三发猎鱼弓',weaponIds:['tri-stringer','tri-stringer','tri-stringer','tri-stringer']},
] as const;

export const salmonTargets=[
  {id:'rush-chum',name:'狂潮中鲑鱼',health:50,category:'狂潮',note:'狂潮状态生命值'},
  {id:'rush-goldie',name:'狂潮金鲑鱼',health:500,category:'狂潮',note:'狂潮状态生命值'},
  {id:'steelhead-bomb',name:'炸弹鱼炸弹',health:300,category:'大鲑鱼',note:'只计算暴露的炸弹'},
  {id:'flyfish-basket',name:'垫肩飞鱼单侧垃圾桶',health:300,category:'大鲑鱼',note:'单侧目标；普通主武通常不能直接处理'},
  {id:'scrapper-driver',name:'铁板鱼本体',health:500,category:'大鲑鱼',note:'不含正面装甲 600 HP'},
  {id:'steel-eel',name:'蛇鱼操纵者',health:500,category:'大鲑鱼',note:'尾部操纵者'},
  {id:'stinger',name:'塔鱼整座',health:420,category:'大鲑鱼',note:'7 个锅，每个 60 HP'},
  {id:'maws',name:'鼹鼠鱼',health:1200,category:'大鲑鱼',note:'仅用于主武器直打比较'},
  {id:'drizzler',name:'蝙蝠鱼',health:900,category:'大鲑鱼',note:'不计弹回雨弹造成的伤害'},
  {id:'fish-stick',name:'柱鱼群',health:256,category:'大鲑鱼',note:'8 条小鱼，每条 32 HP'},
  {id:'slammin-lid',name:'锅盖鱼',health:500,category:'大鲑鱼',note:'本体生命值'},
  {id:'flipper-flopper',name:'潜水鱼',health:1200,category:'大鲑鱼',note:'不计涂圈破甲时间'},
  {id:'big-shot',name:'铁球鱼',health:1200,category:'大鲑鱼',note:'本体生命值'},
  {id:'griller',name:'烤架鱼',health:2200,category:'特殊事件',note:'不计 400 HP 的眩晕阈值'},
] as const;

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
  return{ready:true as const,strategy,profile,actionWindows,combinedActionDps,recoveryModelReady:false as const};
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
