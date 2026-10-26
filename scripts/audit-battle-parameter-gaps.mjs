import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const GAME_VERSION='11.3.0';
const GENERATED_AT='2026-10-26';
const projectRoot=resolve(import.meta.dirname,'..');
const databaseDir=resolve(projectRoot,'database');
const readDatabase=name=>JSON.parse(readFileSync(resolve(databaseDir,name),'utf8'));
const mainWeapons=readDatabase('main-weapons.v11.3.0.json');
const parameterDatabase=readDatabase('main-weapon-parameters.v11.3.0.json');
const weaponById=new Map(mainWeapons.weapons.map(weapon=>[weapon.id,weapon]));
const familyMaps=new Map();
let totalFields=0;
let verifiedFields=0;
let pendingFields=0;
let demoFields=0;
const weaponsWithPending=new Set();

for(const record of parameterDatabase.records){
  const weapon=weaponById.get(record.weaponId);
  if(!weapon)throw new Error(`Missing weapon identity: ${record.weaponId}`);
  let family=familyMaps.get(weapon.family);
  if(!family){
    family={weaponIds:new Set(),weaponsWithPending:new Set(),fields:new Map()};
    familyMaps.set(weapon.family,family);
  }
  family.weaponIds.add(record.weaponId);
  for(const field of record.parameters){
    totalFields+=1;
    if(field.status==='verified')verifiedFields+=1;
    else if(field.status==='pending'){
      pendingFields+=1;
      weaponsWithPending.add(record.weaponId);
      family.weaponsWithPending.add(record.weaponId);
      const entry=family.fields.get(field.key)??{
        key:field.key,
        label:field.label,
        unit:field.unit,
        count:0,
        weaponIds:[],
        notes:new Set(),
      };
      entry.count+=1;
      entry.weaponIds.push(record.weaponId);
      entry.notes.add(field.note);
      family.fields.set(field.key,entry);
    }else demoFields+=1;
  }
}

const byFamily=[...familyMaps.entries()].map(([family,value])=>({
  family,
  weaponCount:value.weaponIds.size,
  weaponsWithPending:value.weaponsWithPending.size,
  pendingFieldOccurrences:[...value.fields.values()].reduce((sum,field)=>sum+field.count,0),
  fields:[...value.fields.values()]
    .sort((left,right)=>right.count-left.count||left.key.localeCompare(right.key))
    .map(field=>({...field,notes:[...field.notes].sort((left,right)=>left.localeCompare(right))})),
}));

const inheritancePattern=/省略|默认|继承|未显式|缺省/;
const unresolvedInheritanceCandidates=byFamily.flatMap(group=>
  group.fields
    .filter(field=>field.notes.some(note=>inheritancePattern.test(note)))
    .map(field=>({
      family:group.family,
      key:field.key,
      label:field.label,
      count:field.count,
      weaponIds:field.weaponIds,
      notes:field.notes,
    })),
);

const report={
  gameVersion:GAME_VERSION,
  generatedAt:GENERATED_AT,
  sourceFile:'database/main-weapon-parameters.v11.3.0.json',
  summary:{
    weaponCount:parameterDatabase.records.length,
    totalFields,
    verifiedFields,
    pendingFields,
    demoFields,
    weaponsWithPending:weaponsWithPending.size,
    inheritanceCandidateGroups:unresolvedInheritanceCandidates.length,
  },
  byFamily,
  unresolvedInheritanceCandidates,
};

writeFileSync(
  resolve(databaseDir,'battle-parameter-gap-report.v11.3.0.json'),
  `${JSON.stringify(report,null,2)}\n`,
);
console.log(
  `Audited ${report.summary.weaponCount} weapons: ${pendingFields} pending field occurrences across ${weaponsWithPending.size} weapons.`,
);
