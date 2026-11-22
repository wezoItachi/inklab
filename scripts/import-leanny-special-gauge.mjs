import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GAME_VERSION = '12.0.0';
const CHECKED_AT = '2026-11-22';
const SOURCE_COMMIT = 'b669d55e0eef1f1a7f18cb7468c636ed7746c189';

const sourceFlagIndex = process.argv.indexOf('--source-file');
if (sourceFlagIndex < 0 || !process.argv[sourceFlagIndex + 1]) {
  throw new Error(
    'Usage: node scripts/import-leanny-special-gauge.mjs --source-file <WeaponInfoMain.json>',
  );
}

const projectRoot = resolve(import.meta.dirname, '..');
const databaseDir = resolve(projectRoot, 'database');
const mainWeapons = JSON.parse(
  readFileSync(resolve(databaseDir, 'main-weapons.v12.0.0.json'), 'utf8'),
);
const upstreamRows = JSON.parse(
  readFileSync(resolve(process.argv[sourceFlagIndex + 1]), 'utf8'),
);
const upstreamByRowId = new Map(upstreamRows.map((row) => [row.__RowId, row]));

const records = mainWeapons.weapons.map((weapon) => {
  const source = upstreamByRowId.get(weapon.upstreamRowId);
  if (!source || source.Type !== 'Versus') {
    throw new Error(`Missing versus row ${weapon.upstreamRowId}`);
  }
  if (!Number.isInteger(source.SpecialPoint) || source.SpecialPoint <= 0) {
    throw new Error(`Invalid SpecialPoint for ${weapon.upstreamRowId}`);
  }
  return {
    weaponId: weapon.id,
    upstreamRowId: weapon.upstreamRowId,
    specialPoints: source.SpecialPoint,
    upstreamPath: `data/mush/1200/WeaponInfoMain.json#__RowId=${weapon.upstreamRowId}.SpecialPoint`,
  };
});

const pointDistribution = Object.fromEntries(
  [...new Set(records.map(({ specialPoints }) => specialPoints))]
    .sort((left, right) => left - right)
    .map((points) => [
      String(points),
      records.filter((record) => record.specialPoints === points).length,
    ]),
);

writeFileSync(
  resolve(databaseDir, 'weapon-special-gauge.v12.0.0.json'),
  `${JSON.stringify(
    {
      gameVersion: GAME_VERSION,
      checkedAt: CHECKED_AT,
      datasetStatus: 'complete-battle-special-gauge-points',
      sourceId: 'leanny-splat3',
      sourceCommit: SOURCE_COMMIT,
      specialChargeMultiplier: { high: 1.3, mid: 1.15, low: 1 },
      specialLossRate: { high: 1, mid: 0.8, low: 0.5 },
      respawnPunisherExtraLoss: { ownAbility: 0.225, opponentAbility: 0.15 },
      pointDistribution,
      records,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Imported ${records.length} special gauge records: ${JSON.stringify(pointDistribution)}.`,
);
