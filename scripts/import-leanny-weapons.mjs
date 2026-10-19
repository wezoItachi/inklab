import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '11.3.0';
const CHECKED_AT = '2026-10-07';
const DATASET_STATUS = 'full-weapon-catalog-partial-parameters';
const SOURCE_ID = 'leanny-splat3';
const SOURCE_COMMIT = '7280ff9cde8bb1c5dcef46c700c326471584d2e6';
const REPRESENTATIVE_ID_BY_UPSTREAM_ID = new Map([
  [61, 'shooter-quickmiddle-cstm01'],
  [40, 'shooter-normalt'],
  [20, 'shooter-precision'],
  [2010, 'charger-normalt'],
  [1010, 'roller-normalt'],
  [4010, 'spinner-standardt'],
]);
const REPRESENTATIVE_ORDER = [...REPRESENTATIVE_ID_BY_UPSTREAM_ID.keys()];
const FAMILY_BY_PREFIX = {
  Shooter: '射击枪',
  Blaster: '爆破枪',
  Roller: '滚筒',
  Brush: '画笔',
  Charger: '蓄力枪',
  Slosher: '泼桶',
  Spinner: '加特林',
  Maneuver: '双枪',
  Shelter: '伞',
  Stringer: '弓',
  Saber: '刮水刀',
};
const FAMILY_ORDER = Object.keys(FAMILY_BY_PREFIX);
const SUB_ID_BY_UPSTREAM_ID = {
  Bomb_Splash: 'splat-bomb',
  Bomb_Suction: 'suction-bomb',
  Bomb_Quick: 'burst-bomb',
  Sprinkler: 'sprinkler',
  Shield: 'splash-wall',
  Bomb_Fizzy: 'fizzy-bomb',
  Bomb_Curling: 'curling-bomb',
  Bomb_Robot: 'autobomb',
  Beacon: 'squid-beakon',
  PointSensor: 'point-sensor',
  Trap: 'ink-mine',
  PoisonMist: 'toxic-mist',
  LineMarker: 'angle-shooter',
  Bomb_Torpedo: 'torpedo',
};
const SPECIAL_ID_BY_UPSTREAM_ID = {
  SpUltraShot: 'trizooka',
  SpGreatBarrier: 'big-bubbler',
  SpSuperHook: 'zipcaster',
  SpMultiMissile: 'tenta-missiles',
  SpInkStorm: 'ink-storm',
  SpNiceBall: 'booyah-bomb',
  SpShockSonar: 'wave-breaker',
  SpBlower: 'ink-vac',
  SpMicroLaser: 'killer-wail-5.1',
  SpJetpack: 'inkjet',
  SpUltraStamp: 'ultra-stamp',
  SpChariot: 'crab-tank',
  SpSkewer: 'reef-slider',
  SpTripleTornado: 'triple-inkstrike',
  SpEnergyStand: 'tacticooler',
  SpFirework: 'decoy',
  SpCastle: 'kraken-royale',
  SpPogo: 'triple-splashdown',
  SpChimney: 'splattercolor-screen',
};

const sourceFlagIndex = process.argv.indexOf('--source-dir');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-weapons.mjs --source-dir <directory>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const sourceDir = resolve(process.argv[sourceFlagIndex + 1]);
const weaponSourcePath = resolve(sourceDir, 'WeaponInfoMain.json');
const languageSourcePath = resolve(sourceDir, 'CNzh.json');
const weaponSourceText = readFileSync(weaponSourcePath, 'utf8');
const languageSourceText = readFileSync(languageSourcePath, 'utf8');
const upstreamWeapons = JSON.parse(weaponSourceText);
const language = JSON.parse(languageSourceText);
const mainNames = language['CommonMsg/Weapon/WeaponName_Main'];
const subNames = language['CommonMsg/Weapon/WeaponName_Sub'];
const specialNames = language['CommonMsg/Weapon/WeaponName_Special'];

const readDatabase = (name) =>
  JSON.parse(readFileSync(resolve(databaseDir, name), 'utf8'));
const previousMainWeapons = readDatabase('main-weapons.v11.3.0.json');
const previousParameters = readDatabase('main-weapon-parameters.v11.3.0.json');
const previousSubWeapons = readDatabase('sub-weapons.v11.3.0.json');
const previousSpecialWeapons = readDatabase('special-weapons.v11.3.0.json');
const previousKits = readDatabase('weapon-kits.v11.3.0.json');
const previousWeaponsById = new Map(
  previousMainWeapons.weapons.map((weapon) => [weapon.id, weapon]),
);
const previousParametersById = new Map(
  previousParameters.records.map((record) => [record.weaponId, record]),
);
const previousSubsById = new Map(
  previousSubWeapons.subWeapons.map((sub) => [sub.id, sub]),
);
const previousSpecialsById = new Map(
  previousSpecialWeapons.specialWeapons.map((special) => [special.id, special]),
);
const previousKitsById = new Map(
  previousKits.kits.map((kit) => [kit.weaponId, kit]),
);

const upstreamIdFromPath = (value) => value.split('/').at(-1).split('.')[0];
const projectWeaponId = (upstreamId) =>
  REPRESENTATIVE_ID_BY_UPSTREAM_ID.get(upstreamId) ?? `main-${upstreamId}`;
const badgeFor = (name, upstreamId) => {
  const digits = name.match(/[0-9]+/)?.[0];
  return digits ? digits.slice(-2) : String(upstreamId).slice(-2);
};
const normalizeLocalizedName = (value, label) => {
  if (typeof value !== 'string')
    throw new Error(`Missing localized name: ${label}`);
  const normalized = value.normalize('NFC').trim();
  if (
    !normalized ||
    /^(?:武器|主武器|示例武器|模板武器|未命名|待定)(?:\s*[0-9]+)?$/i.test(
      normalized,
    )
  ) {
    throw new Error(`Invalid placeholder localized name: ${label} = ${value}`);
  }
  return normalized;
};
const pendingParameterTemplate = () =>
  [
    ['damageProfile', '伤害模型'],
    ['inkConsumption', '主武器耗墨'],
    ['actionInterval', '射击／挥击／蓄力间隔'],
    ['effectiveRange', '有效射程'],
    ['classMechanic', '武器类别机制'],
  ].map(([key, label]) => ({
    key,
    label,
    value: null,
    unit: null,
    status: 'pending',
    note: '已完成武器身份与套装导入；此参数需按武器类别逐字段核对后才能用于计算',
  }));

const versusWeapons = upstreamWeapons
  .filter((weapon) => weapon.Type === 'Versus' && weapon.Id < 10000)
  .sort((left, right) => {
    const leftRepresentative = REPRESENTATIVE_ORDER.indexOf(left.Id);
    const rightRepresentative = REPRESENTATIVE_ORDER.indexOf(right.Id);
    if (leftRepresentative >= 0 || rightRepresentative >= 0) {
      if (leftRepresentative < 0) return 1;
      if (rightRepresentative < 0) return -1;
      return leftRepresentative - rightRepresentative;
    }
    const leftFamily = FAMILY_ORDER.indexOf(left.__RowId.split('_')[0]);
    const rightFamily = FAMILY_ORDER.indexOf(right.__RowId.split('_')[0]);
    return (
      leftFamily - rightFamily ||
      left.DebugDispOrder - right.DebugDispOrder ||
      left.Id - right.Id
    );
  });

if (versusWeapons.length !== 174) {
  throw new Error(
    `Expected 174 versus weapons, received ${versusWeapons.length}`,
  );
}

const upstreamSubIds = [
  ...new Set(
    versusWeapons.map((weapon) => upstreamIdFromPath(weapon.SubWeapon)),
  ),
].sort((left, right) => left.localeCompare(right));
const upstreamSpecialIds = [
  ...new Set(
    versusWeapons.map((weapon) => upstreamIdFromPath(weapon.SpecialWeapon)),
  ),
].sort((left, right) => left.localeCompare(right));
for (const upstreamId of upstreamSubIds) {
  if (!SUB_ID_BY_UPSTREAM_ID[upstreamId] || !subNames[upstreamId])
    throw new Error(`Missing sub weapon mapping: ${upstreamId}`);
}
for (const upstreamId of upstreamSpecialIds) {
  if (!SPECIAL_ID_BY_UPSTREAM_ID[upstreamId] || !specialNames[upstreamId])
    throw new Error(`Missing special weapon mapping: ${upstreamId}`);
}

const weapons = versusWeapons.map((upstream) => {
  const id = projectWeaponId(upstream.Id);
  const previous = previousWeaponsById.get(id);
  const family = FAMILY_BY_PREFIX[upstream.__RowId.split('_')[0]];
  const rawName = mainNames[upstream.__RowId];
  if (!family || !rawName)
    throw new Error(`Missing weapon metadata: ${upstream.Id}`);
  const name = normalizeLocalizedName(rawName, upstream.__RowId);
  return {
    id,
    upstreamId: upstream.Id,
    upstreamRowId: upstream.__RowId,
    name,
    badge: previous?.badge ?? badgeFor(name, upstream.Id),
    family,
    role: previous?.role ?? '打法定位待验证',
    verification: 'kit-verified',
    sourceId: previous?.sourceId ?? SOURCE_ID,
    checkedAt: previous?.checkedAt ?? CHECKED_AT,
  };
});

const subWeapons = upstreamSubIds.map((upstreamId) => {
  const id = SUB_ID_BY_UPSTREAM_ID[upstreamId];
  const previous = previousSubsById.get(id);
  return {
    id,
    upstreamId,
    name: normalizeLocalizedName(subNames[upstreamId], upstreamId),
    baseInkCost: previous?.baseInkCost ?? null,
    subPowerEffect: previous?.subPowerEffect ?? null,
    subPowerDoesNotChange: previous?.subPowerDoesNotChange ?? [],
    verification: previous?.verification ?? 'pending',
    sourceId: previous?.sourceId ?? SOURCE_ID,
    checkedAt: previous?.checkedAt ?? CHECKED_AT,
  };
});

const specialWeapons = upstreamSpecialIds.map((upstreamId) => {
  const id = SPECIAL_ID_BY_UPSTREAM_ID[upstreamId];
  const previous = previousSpecialsById.get(id);
  return {
    id,
    upstreamId,
    name: normalizeLocalizedName(specialNames[upstreamId], upstreamId),
    verification: 'kit-verified',
    sourceId: previous?.sourceId ?? SOURCE_ID,
    checkedAt: previous?.checkedAt ?? CHECKED_AT,
  };
});

const kits = versusWeapons.map((upstream) => {
  const weaponId = projectWeaponId(upstream.Id);
  const previous = previousKitsById.get(weaponId);
  return {
    weaponId,
    subId: SUB_ID_BY_UPSTREAM_ID[upstreamIdFromPath(upstream.SubWeapon)],
    specialId:
      SPECIAL_ID_BY_UPSTREAM_ID[upstreamIdFromPath(upstream.SpecialWeapon)],
    recommendedPreset: previous?.recommendedPreset ?? null,
    verification: 'kit-verified',
    sourceId: previous?.sourceId ?? SOURCE_ID,
    checkedAt: previous?.checkedAt ?? CHECKED_AT,
  };
});

const records = versusWeapons.map((upstream) => {
  const weaponId = projectWeaponId(upstream.Id);
  return (
    previousParametersById.get(weaponId) ?? {
      weaponId,
      parameters: pendingParameterTemplate(),
    }
  );
});

const versioned = (key, value) => ({
  gameVersion: GAME_VERSION,
  datasetStatus: DATASET_STATUS,
  defaultSourceId: SOURCE_ID,
  [key]: value,
});
const writeDatabase = (name, value) =>
  writeFileSync(
    resolve(databaseDir, name),
    `${JSON.stringify(value, null, 2)}\n`,
  );
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

writeDatabase('main-weapons.v11.3.0.json', versioned('weapons', weapons));
writeDatabase(
  'main-weapon-parameters.v11.3.0.json',
  versioned('records', records),
);
writeDatabase('sub-weapons.v11.3.0.json', versioned('subWeapons', subWeapons));
writeDatabase(
  'special-weapons.v11.3.0.json',
  versioned('specialWeapons', specialWeapons),
);
writeDatabase('weapon-kits.v11.3.0.json', versioned('kits', kits));
writeDatabase('import-report.v11.3.0.json', {
  gameVersion: GAME_VERSION,
  importedAt: CHECKED_AT,
  sourceId: SOURCE_ID,
  sourceCommit: SOURCE_COMMIT,
  attribution: 'Data provided by Lean',
  inputs: [
    {
      upstreamPath: 'data/mush/1130/WeaponInfoMain.json',
      sha256: sha256(weaponSourceText),
    },
    {
      upstreamPath: 'data/language/CNzh.json',
      sha256: sha256(languageSourceText),
    },
  ],
  outputCounts: {
    mainWeapons: weapons.length,
    subWeapons: subWeapons.length,
    specialWeapons: specialWeapons.length,
    weaponKits: kits.length,
    preservedVerifiedParameterRecords: records.filter((record) =>
      record.parameters.some((parameter) => parameter.status === 'verified'),
    ).length,
    pendingParameterRecords: records.filter((record) =>
      record.parameters.every((parameter) => parameter.status === 'pending'),
    ).length,
  },
});

console.log(
  `Imported ${weapons.length} weapons, ${subWeapons.length} sub weapons, and ${specialWeapons.length} special weapons.`,
);
