import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-26';
const SOURCE_ID = 'leanny-splat3';
const SOURCE_COMMIT = '7280ff9cde8bb1c5dcef46c700c326471584d2e6';
const UPSTREAM_ROOT = 'data/parameter/1130';

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-salmon-ink-cycle.mjs --source-dir <1130 parameter directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const outputPath = resolve(
  projectRoot,
  'database/salmon-ink-cycle-evidence.v11.3.0.json',
);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const inputs = new Map();

function readSource(relativePath) {
  const raw = readFileSync(resolve(sourceDir, relativePath), 'utf8');
  inputs.set(relativePath, {
    upstreamPath: `${UPSTREAM_ROOT}/${relativePath}`,
    sha256: sha256(raw),
  });
  return JSON.parse(raw);
}

function getAtPath(root, path) {
  const tokens = path.match(/[^.[\]]+/g) ?? [];
  let value = root;
  for (const token of tokens) value = value?.[token];
  if (value === undefined) throw new Error(`Missing source field: ${path}`);
  return value;
}

function sourceField(relativePath, fieldPath, transform = (value) => value) {
  const document = readSource(relativePath);
  return {
    value: transform(getAtPath(document, fieldPath)),
    upstreamPath: `${UPSTREAM_ROOT}/${relativePath}#${fieldPath}`,
  };
}

const standingRecovery = sourceField(
  'misc/params.json',
  'InkRecoverFrm_Std[2]',
);
const submergedRecovery = sourceField(
  'misc/params.json',
  'InkRecoverFrm_Stealth[2]',
);
const bombInkConsumption = sourceField(
  'weapon/WeaponBombSplash_coop.game__GameParameterTable.json',
  'GameParameters.WeaponParam.InkConsume',
  (value) => value * 100,
);
const bombRecoveryLock = sourceField(
  'weapon/WeaponBombSplash.game__GameParameterTable.json',
  'GameParameters.WeaponParam.InkRecoverStop',
);
const aerosprayRecoveryLock = sourceField(
  'weapon/WeaponShooterShort.game__GameParameterTable.json',
  'GameParameters.WeaponParam.InkRecoverStop',
);
const squidRollSpeedCurve = sourceField(
  'misc/params.json',
  'Somersault_MoveVelKd',
);

const document = {
  gameVersion: GAME_VERSION,
  datasetStatus: 'evidence-only',
  defaultSourceId: SOURCE_ID,
  sourceCommit: SOURCE_COMMIT,
  checkedAt: CHECKED_AT,
  modelGate: {
    sustainedOutput: 'blocked',
    reasons: [
      '未找到明确的 Ver. 11.3.0 打工玩家通用回墨覆盖字段。',
      '普通回墨曲线的打工适用性尚未通过源码或实机验证。',
      '四把首批试算武器中只有广域标记枪暴露了明确的主武墨锁字段。',
      '鱿鱼滚行空中回墨与绕过墨锁的底层字段尚未定位。',
    ],
  },
  evidence: {
    commonRecoveryCurve: {
      scope: '普通模式无装备能力曲线；打工适用性待验证',
      fields: [
        {
          key: 'standingFullTankRecoveryFrames',
          label: '人形／非潜墨状态回满一管墨的帧数',
          ...standingRecovery,
          unit: 'frames',
          sourceStatus: 'verified',
          salmonApplicability: 'pending',
        },
        {
          key: 'submergedFullTankRecoveryFrames',
          label: '潜墨状态回满一管墨的帧数',
          ...submergedRecovery,
          unit: 'frames',
          sourceStatus: 'verified',
          salmonApplicability: 'pending',
        },
      ],
    },
    salmonSplatBomb: {
      scope: '打工固定副武器三角雷',
      inheritance: '打工文件只覆盖耗墨；墨锁来自其普通父参数文件',
      fields: [
        {
          key: 'inkConsumption',
          label: '打工三角雷耗墨',
          ...bombInkConsumption,
          unit: 'percent',
          sourceStatus: 'verified',
          salmonApplicability: 'verified',
        },
        {
          key: 'inkRecoveryLock',
          label: '投掷后三角雷墨锁',
          ...bombRecoveryLock,
          unit: 'frames',
          sourceStatus: 'verified',
          salmonApplicability: 'inherited',
        },
      ],
    },
    mainWeaponRecoveryLockSamples: {
      scope: '首批压力试算武器的显式字段覆盖',
      fields: [
        {
          weaponId: 'salmon-shooter-short-00',
          key: 'inkRecoveryLock',
          label: '广域标记枪射击墨锁',
          ...aerosprayRecoveryLock,
          unit: 'frames',
          sourceStatus: 'verified',
          salmonApplicability: 'base-inherited',
        },
      ],
      unresolvedWeaponIds: [
        'splash-o-matic',
        'salmon-shooter-heavy-00',
        'tri-stringer',
      ],
    },
    squidRoll: {
      scope: '鱿鱼滚行与墨锁交互',
      sourceFieldsLocated: [
        {
          key: 'somersaultMovementSpeedCurve',
          ...squidRollSpeedCurve,
          unit: 'curve',
          sourceStatus: 'verified',
        },
      ],
      recoveryFieldStatus: 'not-located',
      communityObservationStatus: 'hypothesis-pending-source-or-capture',
      note: '已知字段只描述 Somersault 动作速度曲线，不能证明空中按潜墨速率回墨或绕过墨锁。',
    },
  },
  inputs: [...inputs.values()].sort((left, right) =>
    left.upstreamPath.localeCompare(right.upstreamPath),
  ),
};

writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      output: outputPath,
      inputs: document.inputs.length,
      sustainedOutput: document.modelGate.sustainedOutput,
    },
    null,
    2,
  ),
);
