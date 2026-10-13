import assert from 'node:assert/strict';
import test from 'node:test';
import {getCompositionAnalysis,getCompositionPattern,GRIZZCO_FAMILY,grizzcoWeapons,matchSalmonWeapon,parseSalmonRotations,regularSalmonWeapons,salmonWeapons,selectActiveRotation} from './salmon-run.ts';

void test('salmon weapon draft has unique ids and explicit tags',()=>{
  assert.equal(regularSalmonWeapons.length,63);
  assert.equal(grizzcoWeapons.length,8);
  assert.equal(salmonWeapons.length,71);
  assert.equal(new Set(salmonWeapons.map(item=>item.id)).size,salmonWeapons.length);
  assert.equal(salmonWeapons.every(item=>item.tags.length>=2),true);
  assert.equal(salmonWeapons.every(item=>item.salmonDps===null),true);
  assert.deepEqual(salmonWeapons.filter(item=>item.family==='画笔').map(item=>item.name),['巴勃罗','北斋','文森']);
  assert.equal(salmonWeapons.some(item=>item.name==='毛刷'),false);
  assert.equal(grizzcoWeapons.every(item=>item.family===GRIZZCO_FAMILY),true);
  assert.equal(grizzcoWeapons.every(item=>item.parameterSource?.endsWith('_Coop.game__GameParameterTable.json')),true);
  assert.deepEqual(grizzcoWeapons.map(item=>item.name),[
    '熊先生印章爆破枪','熊先生印章狙击枪','熊先生印章机动枪','熊先生印章滚筒',
    '熊先生印章刮水刀','熊先生印章防空伞','熊先生印章泼桶','熊先生印章猎鱼弓',
  ]);
});

void test('live English Grizzco names match the local catalog',()=>{
  for(const weapon of grizzcoWeapons){
    assert.equal(matchSalmonWeapon(weapon.aliases[0])?.id,weapon.id);
  }
});

void test('composition signature describes role repetition',()=>{
  const byRole=(role:(typeof salmonWeapons)[number]['role'])=>salmonWeapons.filter(item=>item.role===role);
  assert.equal(getCompositionPattern([byRole('frontline')[0],byRole('frontline')[1],byRole('flex')[0],byRole('ranged')[0]]),'AABC');
  assert.equal(getCompositionPattern([byRole('frontline')[0],byRole('flex')[0],byRole('ranged')[0],byRole('control')[0]]),'ABCD');
});

void test('composition analysis reports missing coverage without claiming a result',()=>{
  const short=salmonWeapons.filter(item=>item.tags.includes('短手')).slice(0,4);
  const result=getCompositionAnalysis(short);
  assert.equal(result.warnings.some(item=>item.includes('长手')),true);
});

void test('schedule parser accepts wrapped splatoon3.ink data and selects current rotation',()=>{
  const rotations=parseSalmonRotations({data:{coopGroupingSchedule:{regularSchedules:{nodes:[
    {startTime:'2026-10-07T00:00:00Z',endTime:'2026-10-08T00:00:00Z',setting:{coopStage:{name:'Old'},weapons:[]}},
    {startTime:'2026-10-08T00:00:00Z',endTime:'2026-10-09T00:00:00Z',setting:{coopStage:{name:'Current'},weapons:[{name:'Splattershot',__splatoon3ink_id:'10'}]}},
  ]}}}});
  assert.equal(rotations.length,2);
  assert.equal(rotations[1].weapons[0].id,'10');
  assert.equal(selectActiveRotation(rotations,new Date('2026-10-08T08:00:00Z'))?.stage,'Current');
});
