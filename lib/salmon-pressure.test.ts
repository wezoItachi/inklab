import assert from 'node:assert/strict';
import test from 'node:test';
import {analyzeSalmonPressure,analyzeTargetActions,compareSalmonPressure,getSalmonWeaponPerformance,getWeaponActionWindow,salmonTargets,salmonWeaponPerformance} from './salmon-pressure.ts';

void test('first Salmon Run pressure samples retain traceable weapon values',()=>{
  assert.equal(salmonWeaponPerformance.length,4);
  assert.equal(salmonWeaponPerformance.every(item=>item.sourcePaths.length===2),true);
  assert.equal(salmonTargets.length,14);
  assert.equal(salmonTargets.every(target=>target.health>0&&target.note.length>0),true);
});

void test('action window exposes source-backed output without inventing recovery time',()=>{
  const window=getWeaponActionWindow(salmonWeaponPerformance[1]);
  assert.equal(window.actionDps,336);
  assert.equal(window.actionsPerTank,125);
  assert.equal(Math.round(window.damagePerTank),3500);
  assert.equal('sustainedDps' in window,false);
});

void test('Tri-Stringer limit uses the verified one-ring action instead of full charge',()=>{
  const performance=getSalmonWeaponPerformance('tri-stringer');
  assert.ok(performance);
  const limit=getWeaponActionWindow(performance,'limit');
  const routine=getWeaponActionWindow(performance,'routine');
  assert.equal(limit.pattern.label,'一段蓄力 · 三箭全中');
  assert.equal(limit.actionDps,450);
  assert.equal(Math.round(routine.actionDps),369);
  assert.equal(limit.actionDps>routine.actionDps,true);
});

void test('pressure comparison exposes limit and explicit routine profiles',()=>{
  const result=compareSalmonPressure(['tri-stringer','tri-stringer','tri-stringer','tri-stringer'],'staggered');
  assert.equal(result.limit.ready,true);
  assert.equal(result.routine.ready,true);
  if(!result.limit.ready||!result.routine.ready)return;
  assert.equal(result.limit.profile,'limit');
  assert.equal(result.routine.profile,'routine');
  assert.equal(result.limit.combinedActionDps>result.routine.combinedActionDps,true);
  assert.equal(result.limit.recoveryModelReady,false);
});

void test('target solver reports fractional equivalents and real action count',()=>{
  const result=analyzeTargetActions({label:'sample',damagePerAction:210,actionFrames:30,inkConsumptionPerAction:5,note:'test'},300);
  assert.equal(result.damageEquivalent.toFixed(2),'1.43');
  assert.equal(result.requiredActions,2);
  assert.equal(result.totalDamage,420);
  assert.equal(result.overkill,120);
  assert.equal(result.totalFrames,60);
  assert.equal(result.totalInkConsumption,10);
});

void test('unsupported weapons keep the pressure result explicitly incomplete',()=>{
  const result=analyzeSalmonPressure(['not-imported'],'staggered');
  assert.equal(result.ready,false);
  if(result.ready)return;
  assert.deepEqual(result.missingWeaponIds,['not-imported']);
});
