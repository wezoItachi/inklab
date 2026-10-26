import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const RESOLVED_AT = '2026-10-26';
const SOURCE_ID = 'leanny-splat3';
const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const writeDatabase = (name, value) =>
  writeFileSync(
    resolve(databaseDir, name),
    `${JSON.stringify(value, null, 2)}\n`,
  );

const parameterDatabase = readDatabase('main-weapon-parameters.v11.3.0.json');
const sourceAudit = readDatabase('battle-parameter-source-audit.v11.3.0.json');

const dependentOptionalFields = new Set([
  '加特林:chargeHoldFrames',
  '加特林:fullChargeOverrideFireIntervalFrames',
  '加特林:fullChargeOverrideFiringDurationFrames',
  '加特林:variableDamagePerShot',
  '加特林:variableFireIntervalFrames',
  '加特林:variableMovementSpeedWhileFiring',
  '加特林:variableTransitionFrames',
  '泼桶:blastDamage',
  '泼桶:blastDamageRadius',
]);

const resolutions = new Map();
for (const group of sourceAudit.groups) {
  if (!dependentOptionalFields.has(`${group.family}:${group.key}`)) continue;
  for (const occurrence of group.occurrences) {
    if (occurrence.disposition !== 'optional-mechanism-object-absent') continue;
    resolutions.set(`${occurrence.weaponId}:${group.key}`, {
      family: group.family,
      key: group.key,
      weaponId: occurrence.weaponId,
      fileName: occurrence.fileName,
      inspectedPath: group.inspectedPath,
    });
  }
}

let resolvedFields = 0;
const affectedWeapons = new Set();
const records = parameterDatabase.records.map((record) => ({
  ...record,
  parameters: record.parameters.map((parameter) => {
    const resolution = resolutions.get(`${record.weaponId}:${parameter.key}`);
    if (!resolution || parameter.status !== 'pending') return parameter;
    resolvedFields += 1;
    affectedWeapons.add(record.weaponId);
    return {
      ...parameter,
      status: 'not-applicable',
      note: `固定上游文件未包含 ${resolution.inspectedPath?.split('.')[1]} 可选机制对象，因此该对象的从属字段对本武器不适用；未由此推断任何布尔能力或数值默认值`,
      sourceId: SOURCE_ID,
      upstreamPath: `data/parameter/1130/weapon/${resolution.fileName}`,
      checkedAt: RESOLVED_AT,
    };
  }),
}));

if (resolvedFields !== resolutions.size) {
  throw new Error(
    `Expected to resolve ${resolutions.size} pending fields, resolved ${resolvedFields}`,
  );
}

writeDatabase('main-weapon-parameters.v11.3.0.json', {
  ...parameterDatabase,
  records,
});
writeDatabase('battle-parameter-applicability-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  resolvedAt: RESOLVED_AT,
  sourceAudit: 'battle-parameter-source-audit.v11.3.0.json',
  policy:
    'Only dependent numeric fields under a wholly absent optional mechanism object are marked not applicable. Capability booleans, inherited ordinary-state values, and omitted runtime defaults remain pending.',
  summary: {
    resolvedFields,
    affectedWeapons: affectedWeapons.size,
    retainedPendingCapabilityGroups: [
      '蓄力枪:chargeHold',
      '加特林:canStoreCharge',
      '加特林:canRecharge',
      '双枪:postDodgeDamagePerShot',
      '伞:canLaunchCanopy',
      '弓:canStoreCharge',
    ],
  },
  resolutions: [...resolutions.values()].sort(
    (left, right) =>
      left.weaponId.localeCompare(right.weaponId) ||
      left.key.localeCompare(right.key),
  ),
});

console.log(
  `Marked ${resolvedFields} dependent fields across ${affectedWeapons.size} weapons as not applicable.`,
);
