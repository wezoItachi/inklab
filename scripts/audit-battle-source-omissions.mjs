import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const GENERATED_AT = '2026-10-26';
const SOURCE_COMMIT = '7280ff9cde8bb1c5dcef46c700c326471584d2e6';
const UPSTREAM_ROOT = 'data/parameter/1130/weapon';
const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/audit-battle-source-omissions.mjs --source-dir <1130 weapon parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const familyPrefixes = {
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

const fieldPaths = {
  fireIntervalFrames: ['GameParameters', 'WeaponParam', 'RepeatFrame'],
  chargeHold: ['GameParameters', 'WeaponKeepChargeParam'],
  fullChargeFrames: ['GameParameters', 'WeaponParam', 'ChargeFrameFullCharge'],
  canStoreCharge: ['GameParameters', 'WeaponKeepChargeParam', 'EnableKeepChargeAnytime'],
  chargeHoldFrames: ['GameParameters', 'WeaponKeepChargeParam', 'KeepChargeFullFrame'],
  fullChargeOverrideFireIntervalFrames: [
    'GameParameters',
    'WeaponFullChargeParam',
    'RepeatFrame',
  ],
  fullChargeOverrideFiringDurationFrames: [
    'GameParameters',
    'WeaponFullChargeParam',
    'MaxShootingFrame_Second',
  ],
  variableDamagePerShot: [
    'GameParameters',
    'VariableDamageParam',
    'ValueFullChargeMax',
  ],
  variableFireIntervalFrames: [
    'GameParameters',
    'VariableShotParam',
    'RepeatFrame',
  ],
  variableMovementSpeedWhileFiring: [
    'GameParameters',
    'VariableShotParam',
    'MoveSpeed',
  ],
  variableTransitionFrames: [
    'GameParameters',
    'VariableShotParam',
    'VariableInterpolatedFrame',
  ],
  canRecharge: ['GameParameters', 'WeaponParam', 'EnableRecharge'],
  burstFrame: ['GameParameters', 'BlasterBurstParam', 'BurstFrame'],
  rollingInkRecoveryLockFrames: [
    'GameParameters',
    'WeaponRollParam',
    'InkRecoverStop',
  ],
  rollingPaintStartFrames: ['GameParameters', 'WeaponRollParam', 'ToPaintFrame'],
  rollingSpeed: ['GameParameters', 'WeaponRollParam', 'SpeedNormal'],
  swingRepeatFrames: ['GameParameters', 'WeaponRollParam', 'SwingRepeatFrame'],
  blastDamage: [
    'GameParameters',
    'BlastParam',
    'BlastParam',
    'DistanceDamage',
    0,
    'Damage',
  ],
  blastDamageRadius: [
    'GameParameters',
    'BlastParam',
    'BlastParam',
    'DistanceDamage',
    0,
    'Distance',
  ],
  movementLimitFrames: ['GameParameters', 'WeaponParam', 'MoveLmtFrame'],
  postDelayFrames: ['GameParameters', 'WeaponParam', 'PostDelayFrame'],
  postDodgeDamagePerShot: [
    'GameParameters',
    'DamageLapOverParam',
    'ValueMax',
  ],
  dodgeMoveFrames: ['GameParameters', 'SideStepParam', 'MoveFrame'],
  canopyShotInkRecoveryLockFrames: [
    'GameParameters',
    'spl__WeaponShelterShotgunParam',
    'InkRecoverStopCanopy',
  ],
  canLaunchCanopy: [
    'GameParameters',
    'spl__WeaponShelterCanopyParam',
    'IsCanopyShot',
  ],
  canopyLaunchFrames: [
    'GameParameters',
    'spl__WeaponShelterCanopyParam',
    'CanopyShotFrame',
  ],
  canopyChargeFrames: [
    'GameParameters',
    'spl__WeaponShelterCanopyParam',
    'CanopyChargeFrame',
  ],
  canopyDurability: [
    'GameParameters',
    'spl__BulletShelterCanopyParam',
    'CanopyHP',
  ],
  canopyOpenFrames: [
    'GameParameters',
    'spl__WeaponShelterCanopyParam',
    'CanopyOpenFrame',
  ],
  shotInkRecoveryLockFrames: [
    'GameParameters',
    'spl__WeaponShelterShotgunParam',
    'InkRecoverStop',
  ],
  projectileCount: null,
};

const familyFieldPaths = {
  '弓:canStoreCharge': [
    'GameParameters',
    'spl__WeaponStringerParam',
    'IsEnableChargeKeep',
  ],
};

const weapons = readDatabase('main-weapons.v11.3.0.json').weapons;
const gapReport = readDatabase('battle-parameter-gap-report.v11.3.0.json');
const weaponById = new Map(weapons.map((weapon) => [weapon.id, weapon]));
const sourceFiles = new Map();

function parameterFileName(weapon, family) {
  const [, className] = weapon.upstreamRowId.split('_');
  if (!className) throw new Error(`Invalid upstream row id: ${weapon.upstreamRowId}`);
  return `Weapon${familyPrefixes[family]}${className}.game__GameParameterTable.json`;
}

function readSource(fileName) {
  if (!sourceFiles.has(fileName)) {
    const text = readFileSync(resolve(sourceDir, fileName), 'utf8');
    sourceFiles.set(fileName, { text, value: JSON.parse(text) });
  }
  return sourceFiles.get(fileName).value;
}

function parentFileName(document) {
  if (typeof document.$parent !== 'string') return null;
  return basename(document.$parent).replace(/\.gyml$/, '.json');
}

function inspectPath(document, path) {
  let cursor = document;
  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index];
    if (cursor === null || cursor === undefined || !(segment in Object(cursor))) {
      return {
        found: false,
        missingAt: path.slice(0, index + 1).join('.'),
        mechanismRootPresent:
          document.GameParameters?.[path[1]] !== undefined,
      };
    }
    cursor = cursor[segment];
  }
  return { found: true, value: cursor };
}

function inspectWithParents(fileName, path) {
  let currentFile = fileName;
  const chain = [];
  while (currentFile) {
    const document = readSource(currentFile);
    chain.push(currentFile);
    const result = inspectPath(document, path);
    if (result.found) {
      return {
        disposition: chain.length === 1 ? 'explicit-local' : 'explicit-parent',
        value: result.value,
        sourceFile: currentFile,
        chain,
      };
    }
    const parent = parentFileName(document);
    if (!parent) {
      return {
        disposition: result.mechanismRootPresent
          ? 'leaf-omitted-schema-default-unresolved'
          : 'optional-mechanism-object-absent',
        missingAt: result.missingAt,
        chain,
      };
    }
    currentFile = parent;
  }
  throw new Error(`Unreachable parent traversal for ${fileName}`);
}

const groups = gapReport.unresolvedInheritanceCandidates.map((candidate) => {
  const path =
    familyFieldPaths[`${candidate.family}:${candidate.key}`] ??
    fieldPaths[candidate.key];
  const occurrences = candidate.weaponIds.map((weaponId) => {
    const weapon = weaponById.get(weaponId);
    if (!weapon) throw new Error(`Missing weapon: ${weaponId}`);
    const fileName = parameterFileName(weapon, candidate.family);
    if (path === null) {
      readSource(fileName);
      return {
        weaponId,
        fileName,
        disposition: 'external-semantic-evidence-required',
      };
    }
    if (!path) throw new Error(`Missing audit path for ${candidate.key}`);
    return { weaponId, fileName, ...inspectWithParents(fileName, path) };
  });
  const dispositionCounts = Object.fromEntries(
    [...new Set(occurrences.map(({ disposition }) => disposition))]
      .sort((left, right) => left.localeCompare(right))
      .map((disposition) => [
        disposition,
        occurrences.filter((entry) => entry.disposition === disposition).length,
      ]),
  );
  return {
    family: candidate.family,
    key: candidate.key,
    label: candidate.label,
    occurrenceCount: occurrences.length,
    inspectedPath: path?.join('.') ?? null,
    dispositionCounts,
    occurrences,
  };
});

const allOccurrences = groups.flatMap(({ occurrences }) => occurrences);
const dispositionCounts = Object.fromEntries(
  [...new Set(allOccurrences.map(({ disposition }) => disposition))]
    .sort((left, right) => left.localeCompare(right))
    .map((disposition) => [
      disposition,
      allOccurrences.filter((entry) => entry.disposition === disposition).length,
    ]),
);

const report = {
  gameVersion: GAME_VERSION,
  generatedAt: GENERATED_AT,
  sourceId: 'leanny-splat3',
  sourceCommit: SOURCE_COMMIT,
  attribution: 'Data provided by Lean',
  scope: 'All inheritance/default-related pending battle-weapon parameter groups',
  interpretation: {
    'explicit-local': 'The requested leaf is explicit in the weapon parameter file.',
    'explicit-parent': 'The requested leaf is explicit in a declared $parent chain.',
    'leaf-omitted-schema-default-unresolved':
      'The mechanism object exists, but the leaf is omitted and its schema/runtime default is not present in this snapshot.',
    'optional-mechanism-object-absent':
      'The optional mechanism object itself is absent; dependent numeric fields may be classified as not applicable, but capability booleans remain unresolved unless explicitly stated.',
    'external-semantic-evidence-required':
      'The value is not represented by this parameter schema and requires an official description or another auditable source.',
  },
  summary: {
    candidateGroups: groups.length,
    fieldOccurrences: allOccurrences.length,
    sourceFiles: sourceFiles.size,
    dispositionCounts,
  },
  inputs: [...sourceFiles.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([fileName, { text }]) => ({
      upstreamPath: `${UPSTREAM_ROOT}/${fileName}`,
      sha256: sha256(text),
    })),
  groups,
};

writeFileSync(
  resolve(databaseDir, 'battle-parameter-source-audit.v11.3.0.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(
  `Audited ${groups.length} candidate groups and ${allOccurrences.length} field occurrences from ${sourceFiles.size} fixed upstream files.`,
);
