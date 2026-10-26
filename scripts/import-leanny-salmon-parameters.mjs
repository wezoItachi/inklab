import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-26';
const SOURCE_ID = 'leanny-splat3';
const SOURCE_COMMIT = '7280ff9cde8bb1c5dcef46c700c326471584d2e6';
const UPSTREAM_ROOT = 'data/parameter/1130/weapon';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-salmon-parameters.mjs --source-dir <1130 weapon parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const writeDatabase = (name, value) =>
  writeFileSync(
    resolve(databaseDir, name),
    `${JSON.stringify(value, null, 2)}\n`,
  );
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const normalize = (value) =>
  typeof value === 'number' ? Math.round(value * 1_000_000) / 1_000_000 : value;

const mainWeapons = readDatabase('main-weapons.v11.3.0.json');
const battleParameters = readDatabase('main-weapon-parameters.v11.3.0.json');
const parameterByWeaponId = new Map(
  battleParameters.records.map((record) => [record.weaponId, record]),
);
const weaponById = new Map(
  mainWeapons.weapons.map((weapon) => [weapon.id, weapon]),
);

const familyPrefix = {
  射击枪: 'Shooter',
  爆破枪: 'Blaster',
  滚筒: 'Roller',
  画笔: 'Brush',
  蓄力枪: 'Charger',
  泼桶: 'Slosher',
  加特林: 'Spinner',
  双枪: 'Maneuver',
  伞: 'Shelter',
  弓: 'Stringer',
  刮水刀: 'Saber',
};

const grizzcoSpecs = [
  [
    'grizzco-blaster',
    '熊先生印章爆破枪',
    '爆破枪',
    'WeaponBlasterBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-charger',
    '熊先生印章狙击枪',
    '蓄力枪',
    'WeaponChargerBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-dualies',
    '熊先生印章机动枪',
    '双枪',
    'WeaponManeuverBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-roller',
    '熊先生印章滚筒',
    '滚筒',
    'WeaponRollerBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-splatana',
    '熊先生印章刮水刀',
    '刮水刀',
    'WeaponSaberBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-brella',
    '熊先生印章防空伞',
    '伞',
    'WeaponShelterBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-slosher',
    '熊先生印章泼桶',
    '泼桶',
    'WeaponSlosherBear_Coop.game__GameParameterTable.json',
  ],
  [
    'grizzco-stringer',
    '熊先生印章猎鱼弓',
    '弓',
    'WeaponStringerBear_Coop.game__GameParameterTable.json',
  ],
];

const fileCache = new Map();
const sourceInputs = new Map();

function readSource(fileName) {
  if (fileCache.has(fileName)) return fileCache.get(fileName);
  const path = resolve(sourceDir, fileName);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf8');
  const value = { raw, json: JSON.parse(raw) };
  fileCache.set(fileName, value);
  sourceInputs.set(fileName, {
    upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
    sha256: sha256(raw),
  });
  return value;
}

function parseSourcePath(upstreamPath) {
  if (typeof upstreamPath !== 'string' || !upstreamPath.includes('#'))
    return null;
  const [filePath, fieldPath] = upstreamPath.split('#');
  if (!/^GameParameters(?:\.[A-Za-z0-9_$]+|\[\d+\])+$/.test(fieldPath))
    return null;
  return { fileName: basename(filePath), fieldPath };
}

function getAtPath(root, path) {
  const tokens = path.match(/[^.[\]]+/g) ?? [];
  let current = root;
  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;
    current = current[token];
  }
  return current;
}

function normalizeRaw(value, unit) {
  if (typeof value !== 'number' && typeof value !== 'boolean') return null;
  if (unit === 'damage') return normalize(value / 10);
  if (
    unit === 'percent' ||
    unit === 'percent/frame' ||
    unit === 'percent_per_frame'
  )
    return normalize(value * 100);
  return normalize(value);
}

function coopFileFor(weapon) {
  const className = weapon.upstreamRowId.split('_')[1];
  return `Weapon${familyPrefix[weapon.family]}${className}_Coop.game__GameParameterTable.json`;
}

function verifiedDirectParameters(record) {
  return record.parameters.flatMap((parameter) => {
    if (parameter.status !== 'verified') return [];
    const source = parseSourcePath(parameter.upstreamPath);
    return source ? [{ parameter, source }] : [];
  });
}

function regularRecord(weapon) {
  const battleRecord = parameterByWeaponId.get(weapon.id);
  if (!battleRecord)
    throw new Error(`Missing battle parameter record for ${weapon.id}`);
  const coopFile = coopFileFor(weapon);
  const coopSource = readSource(coopFile);
  const parameters = verifiedDirectParameters(battleRecord).map(
    ({ parameter, source }) => {
      const baseSource = readSource(source.fileName);
      if (!baseSource)
        throw new Error(`Missing base parameter file: ${source.fileName}`);
      const explicitOverride = coopSource
        ? getAtPath(coopSource.json, source.fieldPath)
        : undefined;
      const overrideValue = normalizeRaw(explicitOverride, parameter.unit);
      if (overrideValue !== null) {
        return {
          key: parameter.key,
          label: parameter.label,
          value: overrideValue,
          unit: parameter.unit,
          status: 'verified',
          sourceMode: 'coop-override',
          upstreamPath: `${UPSTREAM_ROOT}/${coopFile}#${source.fieldPath}`,
          checkedAt: CHECKED_AT,
        };
      }
      return {
        key: parameter.key,
        label: parameter.label,
        value: parameter.value,
        unit: parameter.unit,
        status: 'verified',
        sourceMode: 'base-inherited',
        upstreamPath: parameter.upstreamPath,
        checkedAt: CHECKED_AT,
      };
    },
  );
  return {
    id: `salmon-${weapon.id}`,
    kind: 'regular',
    weaponId: weapon.id,
    upstreamRowId: weapon.upstreamRowId,
    name: weapon.name,
    family: weapon.family,
    sourceId: SOURCE_ID,
    baseFiles: [
      ...new Set(
        parameters.flatMap((parameter) => {
          const parsed = parseSourcePath(parameter.upstreamPath);
          return parameter.sourceMode === 'base-inherited' && parsed
            ? [parsed.fileName]
            : [];
        }),
      ),
    ],
    coopFile: coopSource ? coopFile : null,
    parameters,
    unresolvedParameterKeys: battleRecord.parameters
      .filter((parameter) => parameter.status !== 'verified')
      .map((parameter) => parameter.key),
  };
}

const semanticRegistry = new Map();
for (const record of battleParameters.records) {
  const weapon = weaponById.get(record.weaponId);
  if (!weapon) continue;
  const familyEntries = semanticRegistry.get(weapon.family) ?? [];
  for (const { parameter, source } of verifiedDirectParameters(record)) {
    if (
      !familyEntries.some(
        (entry) =>
          entry.key === parameter.key && entry.fieldPath === source.fieldPath,
      )
    ) {
      familyEntries.push({
        key: parameter.key,
        label: parameter.label,
        unit: parameter.unit,
        fieldPath: source.fieldPath,
      });
    }
  }
  semanticRegistry.set(weapon.family, familyEntries);
}

function parentFileName(parent) {
  if (typeof parent !== 'string' || !parent) return null;
  return basename(parent).replace(/\.gyml$/, '.json');
}

function inheritedParentParameters(parentFile, family) {
  if (!parentFile) return [];
  const matchingRecord = battleParameters.records.find((record) => {
    const weapon = weaponById.get(record.weaponId);
    return (
      weapon?.family === family &&
      verifiedDirectParameters(record).some(
        ({ source }) => source.fileName === parentFile,
      )
    );
  });
  if (!matchingRecord) return [];
  readSource(parentFile);
  return verifiedDirectParameters(matchingRecord)
    .filter(({ source }) => source.fileName === parentFile)
    .map(({ parameter }) => ({
      key: parameter.key,
      label: parameter.label,
      value: parameter.value,
      unit: parameter.unit,
      status: 'verified',
      sourceMode: 'parent-inherited',
      upstreamPath: parameter.upstreamPath,
      checkedAt: CHECKED_AT,
    }));
}

function grizzcoRecord([id, name, family, coopFile]) {
  const coopSource = readSource(coopFile);
  if (!coopSource) throw new Error(`Missing Grizzco file: ${coopFile}`);
  const parentFile = parentFileName(coopSource.json.$parent);
  const byKey = new Map(
    inheritedParentParameters(parentFile, family).map((parameter) => [
      parameter.key,
      parameter,
    ]),
  );
  const ambiguousKeys = new Set();
  const resolvedByKey = new Map();
  for (const semantic of semanticRegistry.get(family) ?? []) {
    const rawValue = getAtPath(coopSource.json, semantic.fieldPath);
    const value = normalizeRaw(rawValue, semantic.unit);
    if (value === null) continue;
    const previous = resolvedByKey.get(semantic.key);
    if (previous && previous.value !== value) {
      ambiguousKeys.add(semantic.key);
      continue;
    }
    resolvedByKey.set(semantic.key, { ...semantic, value });
  }
  for (const [key, semantic] of resolvedByKey) {
    if (ambiguousKeys.has(key)) continue;
    byKey.set(key, {
      key,
      label: semantic.label,
      value: semantic.value,
      unit: semantic.unit,
      status: 'verified',
      sourceMode: 'bear-explicit',
      upstreamPath: `${UPSTREAM_ROOT}/${coopFile}#${semantic.fieldPath}`,
      checkedAt: CHECKED_AT,
    });
  }
  return {
    id,
    kind: 'grizzco',
    weaponId: null,
    upstreamRowId: null,
    name,
    family,
    sourceId: SOURCE_ID,
    baseFiles: parentFile ? [parentFile] : [],
    coopFile,
    parameters: [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key)),
    unresolvedParameterKeys: [...ambiguousKeys].sort((a, b) =>
      a.localeCompare(b),
    ),
  };
}

const regularWeapons = mainWeapons.weapons.filter(
  (weapon) =>
    weapon.upstreamRowId.endsWith('_00') &&
    !weapon.upstreamRowId.includes('Scope'),
);
const records = [
  ...regularWeapons.map(regularRecord),
  ...grizzcoSpecs.map(grizzcoRecord),
];

const parameterDocument = {
  gameVersion: GAME_VERSION,
  checkedAt: CHECKED_AT,
  datasetStatus: 'source-backed-partial-parameters',
  sourceId: SOURCE_ID,
  attribution: 'Data provided by Lean',
  records,
};

const allParameters = records.flatMap((record) => record.parameters);
const report = {
  gameVersion: GAME_VERSION,
  checkedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: SOURCE_COMMIT,
  attribution: 'Data provided by Lean',
  scope:
    'All 63 regular Salmon Run weapon chassis and eight Grizzco weapons; only source-backed, semantically registered fields are normalized',
  inputs: [...sourceInputs.values()].sort((a, b) =>
    a.upstreamPath.localeCompare(b.upstreamPath),
  ),
  outputCounts: {
    regularWeapons: regularWeapons.length,
    grizzcoWeapons: grizzcoSpecs.length,
    totalWeapons: records.length,
    recordsWithParameters: records.filter(
      (record) => record.parameters.length > 0,
    ).length,
    verifiedParameters: allParameters.length,
    coopOverrides: allParameters.filter(
      (parameter) => parameter.sourceMode === 'coop-override',
    ).length,
    grizzcoExplicitParameters: allParameters.filter(
      (parameter) => parameter.sourceMode === 'bear-explicit',
    ).length,
    inheritedParameters: allParameters.filter((parameter) =>
      ['base-inherited', 'parent-inherited'].includes(parameter.sourceMode),
    ).length,
  },
  missingCoopOverrideFiles: records
    .filter((record) => record.kind === 'regular' && !record.coopFile)
    .map(({ weaponId, name }) => ({ weaponId, name })),
  boundaries: [
    'Permission and source presence do not prove field semantics; only fields already registered by a verified battle-family model are normalized.',
    'A missing _Coop file means no dedicated override was found at the pinned upstream commit; the verified battle base remains the only recorded value source.',
    'This dataset does not yet calculate recovery cycles, post-action ink lock, WAVE throughput or practical clear thresholds.',
  ],
};

writeDatabase('salmon-weapon-parameters.v11.3.0.json', parameterDocument);
writeDatabase('salmon-parameter-source-report.v11.3.0.json', report);

console.log(
  `Imported ${records.length} Salmon Run weapons with ${allParameters.length} source-backed parameters.`,
);
