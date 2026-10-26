import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const GENERATED_AT = '2026-10-26';
const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));

const weapons = readDatabase('main-weapons.v11.3.0.json').weapons;
const parameterDatabase = readDatabase('main-weapon-parameters.v11.3.0.json');
const sourceAudit = readDatabase('battle-parameter-source-audit.v11.3.0.json');
const weaponById = new Map(weapons.map((weapon) => [weapon.id, weapon]));
const sourceDispositionByField = new Map();
for (const group of sourceAudit.groups) {
  for (const occurrence of group.occurrences) {
    sourceDispositionByField.set(`${occurrence.weaponId}:${group.key}`, {
      disposition: occurrence.disposition,
      inspectedPath: group.inspectedPath,
    });
  }
}

function classify(record, field) {
  const sourceDisposition = sourceDispositionByField.get(
    `${record.weaponId}:${field.key}`,
  );
  if (
    sourceDisposition?.disposition === 'external-semantic-evidence-required'
  ) {
    return {
      category: 'external-semantic-source-required',
      nextEvidence:
        'Locate an official description or another auditable source that states the missing game meaning directly.',
    };
  }
  if (
    sourceDisposition?.disposition === 'leaf-omitted-schema-default-unresolved'
  ) {
    return {
      category: 'runtime-schema-default-required',
      nextEvidence:
        'Obtain a schema/runtime default dump or a reproducible frame capture; sibling weapon values are not sufficient.',
    };
  }
  if (sourceDisposition?.disposition === 'optional-mechanism-object-absent') {
    return {
      category: 'capability-or-inheritance-semantics-required',
      nextEvidence:
        'Verify whether object absence means false, ordinary-state inheritance, or another runtime default before assigning a value.',
    };
  }
  if (field.key === 'effectiveRange') {
    return {
      category: 'range-definition-and-model-required',
      nextEvidence:
        'Choose a family-specific range definition and validate its conversion against controlled in-game measurements.',
    };
  }
  if (
    /完整|周期|时序|起手|后摇/.test(field.label) ||
    /完整|周期|时序|起手|后摇/.test(field.note)
  ) {
    return {
      category: 'action-cycle-model-required',
      nextEvidence:
        'Define the action boundary and validate it with source fields plus a frame-by-frame capture.',
    };
  }
  return {
    category: 'explicit-source-or-controlled-capture-required',
    nextEvidence:
      'Find an explicit source field or perform a controlled capture; do not copy a related weapon value.',
  };
}

const items = [];
for (const record of parameterDatabase.records) {
  const weapon = weaponById.get(record.weaponId);
  if (!weapon) throw new Error(`Missing weapon identity: ${record.weaponId}`);
  for (const field of record.parameters) {
    if (field.status !== 'pending') continue;
    items.push({
      weaponId: record.weaponId,
      weaponName: weapon.name,
      family: weapon.family,
      key: field.key,
      label: field.label,
      note: field.note,
      ...classify(record, field),
    });
  }
}

const categories = [...new Set(items.map(({ category }) => category))]
  .sort((left, right) => left.localeCompare(right))
  .map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const groupedFields = new Map();
    for (const item of categoryItems) {
      const key = `${item.family}:${item.key}`;
      const group = groupedFields.get(key) ?? {
        family: item.family,
        key: item.key,
        label: item.label,
        count: 0,
        weaponIds: [],
        nextEvidence: item.nextEvidence,
      };
      group.count += 1;
      group.weaponIds.push(item.weaponId);
      groupedFields.set(key, group);
    }
    return {
      category,
      fieldOccurrences: categoryItems.length,
      groups: [...groupedFields.values()].sort(
        (left, right) =>
          right.count - left.count || left.key.localeCompare(right.key),
      ),
    };
  });

const report = {
  gameVersion: GAME_VERSION,
  generatedAt: GENERATED_AT,
  sourceFile: 'database/main-weapon-parameters.v11.3.0.json',
  sourceAudit: 'database/battle-parameter-source-audit.v11.3.0.json',
  policy:
    'Every remaining pending occurrence receives one evidence requirement. This queue records what would close the field; it does not promote assumptions to verified values.',
  summary: {
    pendingFieldOccurrences: items.length,
    categories: categories.length,
    groupedTasks: categories.reduce(
      (total, category) => total + category.groups.length,
      0,
    ),
  },
  categories,
};

writeFileSync(
  resolve(databaseDir, 'battle-parameter-verification-queue.v11.3.0.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(
  `Queued ${report.summary.pendingFieldOccurrences} pending fields as ${report.summary.groupedTasks} grouped tasks in ${report.summary.categories} evidence categories.`,
);
