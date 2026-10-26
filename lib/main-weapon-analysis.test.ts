import assert from 'node:assert/strict';
import test from 'node:test';
import type { MainWeaponParameterRecord } from '../database/schema.ts';
import {
  analyzeBlasterEfficiency,
  analyzeBrushEfficiency,
  analyzeChargerEfficiency,
  analyzeMainWeaponEfficiency,
  analyzeManeuverEfficiency,
  analyzeRollerEfficiency,
  analyzeSaberEfficiency,
  analyzeShelterEfficiency,
  analyzeSlosherEfficiency,
  analyzeSpinnerEfficiency,
  analyzeStringerEfficiency,
} from './main-weapon-analysis.ts';
import { getMainWeaponParameters } from './weapons.ts';

void test('derives N-ZAP89 efficiency only from verified 11.3.0 fields', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-quickmiddle-cstm01'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 6,
    damagePerShot: 30,
    fireIntervalFrames: 5,
    inkConsumptionPerShot: 0.8,
    damageFalloffStartFrames: 8,
    damageFalloffEndFrames: 24,
    projectileSpawnSpeed: 2.2,
    shotsPerFullTank: 125,
    fullTankFiringWindowFrames: 620,
    fullTankFiringWindowSeconds: 620 / 60,
    shotsToSplat: 4,
    inkConsumptionPerSplat: 3.2,
    splatTimeFrames: 15,
    splatTimeSeconds: 0.25,
  });
});

void test('derives partial Splattershot results without guessing its omitted fire interval', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-normalt'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 5,
    damagePerShot: 36,
    fireIntervalFrames: null,
    inkConsumptionPerShot: 0.92,
    damageFalloffStartFrames: 8,
    damageFalloffEndFrames: 40,
    projectileSpawnSpeed: 2.266,
    shotsPerFullTank: 108,
    fullTankFiringWindowFrames: null,
    fullTankFiringWindowSeconds: null,
    shotsToSplat: 3,
    inkConsumptionPerSplat: 2.76,
    splatTimeFrames: null,
    splatTimeSeconds: null,
  });
});

void test('derives complete Splash-o-matic results from the corrected weapon identity', () => {
  const result = analyzeMainWeaponEfficiency(
    getMainWeaponParameters('shooter-precision'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 6,
    damagePerShot: 28,
    fireIntervalFrames: 5,
    inkConsumptionPerShot: 0.8,
    damageFalloffStartFrames: 4,
    damageFalloffEndFrames: 20,
    projectileSpawnSpeed: 4.0376,
    shotsPerFullTank: 125,
    fullTankFiringWindowFrames: 620,
    fullTankFiringWindowSeconds: 620 / 60,
    shotsToSplat: 4,
    inkConsumptionPerSplat: 3.2,
    splatTimeFrames: 15,
    splatTimeSeconds: 0.25,
  });
});

void test('derives Nova Blaster direct and blast profiles independently', () => {
  const result = analyzeBlasterEfficiency(getMainWeaponParameters('main-200'));
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 8,
    directHitDamage: 125,
    nearBlastDamage: 70,
    farBlastDamage: 50,
    nearBlastDistance: 1.7,
    farBlastDistance: 3.9,
    burstFrame: 11,
    fireIntervalFrames: 40,
    inkConsumptionPerShot: 7.5,
    shotsPerFullTank: 13,
    directHitsToSplat: 1,
    nearBlastHitsToSplat: 2,
    farBlastHitsToSplat: 2,
    directSplatTimeFrames: 0,
    directSplatTimeSeconds: 0,
  });
});

void test('derives verified Splat Charger results without guessing charge time', () => {
  const result = analyzeChargerEfficiency(
    getMainWeaponParameters('charger-normalt'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 5,
    fullChargeDamage: 160,
    fullChargeFrames: null,
    inkConsumptionPerCharge: 18,
    fullChargesPerTank: 5,
    shotsToSplat: 1,
    inkConsumptionPerSplat: 18,
    chargeHold: true,
    chargeHoldFrames: 75,
    chargeHoldSeconds: 1.25,
    fullChargeTravelDistance: 24.037,
  });
});

void test('derives Squiffer results from its own explicit charger class', () => {
  const result = analyzeChargerEfficiency(getMainWeaponParameters('main-2000'));
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 6,
    fullChargeDamage: 140,
    fullChargeFrames: 45,
    inkConsumptionPerCharge: 10.5,
    fullChargesPerTank: 9,
    shotsToSplat: 1,
    inkConsumptionPerSplat: 10.5,
    chargeHold: true,
    chargeHoldFrames: 75,
    chargeHoldSeconds: 1.25,
    fullChargeTravelDistance: 16.765,
  });
});

void test('derives verified Splat Roller results without treating swing phase as the full interval', () => {
  const result = analyzeRollerEfficiency(
    getMainWeaponParameters('roller-normalt'),
  );
  assert.ok(result);
  assert.deepEqual(result, {
    verifiedInputCount: 11,
    horizontalSwingDamageMax: 150,
    horizontalSwingPhaseFrames: 21,
    horizontalSwingFrames: null,
    horizontalInkConsumptionPerSwing: 8.5,
    verticalSwingDamageMax: 150,
    verticalSwingPhaseFrames: 26,
    verticalSwingFrames: null,
    verticalInkConsumptionPerSwing: 8.5,
    rollDamageMax: 125,
    horizontalSwingsPerTank: 11,
    verticalSwingsPerTank: 11,
    horizontalSwingsToSplat: 1,
    verticalSwingsToSplat: 1,
    rollHitsToSplat: 1,
    rollInkConsumptionMinPerFrame: 0.02,
    rollInkConsumptionMaxPerFrame: 0.1,
    rollDurationMinSeconds: 100 / 0.1 / 60,
    rollDurationMaxSeconds: 100 / 0.02 / 60,
    rollSpeedNormal: 0.108,
    rollSpeedDash: 0.132,
  });
});

void test('derives Heavy Splatling values and its divisible-window shot estimate', () => {
  const result = analyzeSpinnerEfficiency(
    getMainWeaponParameters('spinner-standardt'),
  );
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 14);
  assert.equal(result.damagePerShot, 30);
  assert.equal(result.standardMaximumDamagePerShot, 30);
  assert.equal(result.minimumDamagePerShot, 15);
  assert.equal(result.firstChargeStageFrames, 48);
  assert.equal(result.secondChargeStageFrames, 72);
  assert.equal(result.fullChargeFrames, 120);
  assert.equal(result.firstChargeShotsEstimate, 20);
  assert.equal(result.firingDurationFrames, 160);
  assert.equal(result.fireIntervalFrames, 4);
  assert.equal(result.fullChargeOverrideApplied, false);
  assert.equal(result.fullChargesPerTank, 4);
  assert.equal(result.shotsPerFullCharge, 40);
  assert.equal(result.fullChargeWindowDps, 450);
  assert.equal(result.shotsToSplat, 4);
  assert.equal(result.splatTimeFrames, 12);
  assert.equal(result.canRecharge, null);
});

void test('separates Hydra full-charge damage from its standard maximum', () => {
  const result = analyzeSpinnerEfficiency(getMainWeaponParameters('main-4020'));
  assert.ok(result);
  assert.equal(result.damagePerShot, 40);
  assert.equal(result.standardMaximumDamagePerShot, 32);
  assert.equal(result.minimumDamagePerShot, 16);
  assert.equal(result.fullChargeFrames, 270);
  assert.equal(result.shotsToSplat, 3);
  assert.equal(result.fullChargeWindowDps, 600);
});

void test('models Ballpoint variable firing state separately', () => {
  const result = analyzeSpinnerEfficiency(getMainWeaponParameters('main-4030'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 19);
  assert.equal(result.canRecharge, true);
  assert.equal(result.damagePerShot, 28);
  assert.equal(result.fireIntervalFrames, 3);
  assert.equal(result.fullChargeWindowDps, 560);
  assert.equal(result.variableDamagePerShot, 30);
  assert.equal(result.variableFireIntervalFrames, 5);
  assert.equal(result.variableWindowDps, 360);
  assert.equal(result.variableShotsToSplat, 4);
  assert.equal(result.variableTransitionFrames, 10);
});

void test('exposes Nautilus recharge and charge storage independently', () => {
  const result = analyzeSpinnerEfficiency(getMainWeaponParameters('main-4040'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 17);
  assert.equal(result.canRecharge, true);
  assert.equal(result.canStoreCharge, true);
  assert.equal(result.chargeHoldFrames, 200);
  assert.equal(result.chargeHoldSeconds, 200 / 60);
});

void test('applies Heavy Edit full-charge cadence override', () => {
  const result = analyzeSpinnerEfficiency(getMainWeaponParameters('main-4050'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 17);
  assert.equal(result.canRecharge, false);
  assert.equal(result.configuredFiringDurationFrames, 240);
  assert.equal(result.configuredFireIntervalFrames, 4);
  assert.equal(result.fullChargeOverrideApplied, true);
  assert.equal(result.firingDurationFrames, 180);
  assert.equal(result.fireIntervalFrames, 3);
  assert.equal(result.shotsPerFullCharge, 60);
  assert.equal(result.fullChargeWindowDps, 520);
});

void test('does not infer spinner shot count from an ambiguous firing-window endpoint', () => {
  const record: MainWeaponParameterRecord = {
    weaponId: 'test-spinner',
    parameters: [
      {
        key: 'firingDurationFrames',
        label: 'firing duration',
        value: 161,
        unit: 'frames',
        status: 'verified',
        note: 'test fixture',
      },
      {
        key: 'fireIntervalFrames',
        label: 'fire interval',
        value: 4,
        unit: 'frames',
        status: 'verified',
        note: 'test fixture',
      },
    ],
  };
  assert.equal(analyzeSpinnerEfficiency(record)?.shotsPerFullCharge, null);
});

void test('compares all three Tri-Stringer charge stages without defaulting to full charge', () => {
  const result = analyzeStringerEfficiency(
    getMainWeaponParameters('main-7010'),
  );
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 11);
  assert.equal(result.projectileCount, 3);
  assert.equal(result.bestDirectDpsStage, 'minimum');
  assert.equal(result.fastestSplatStage, 'minimum');
  assert.deepEqual(
    result.stages.map((stage) => ({
      id: stage.id,
      volleyDamage: stage.volleyDamage,
      actionFrames: stage.actionFrames,
      volleysToSplat: stage.volleysToSplat,
      volleysPerTank: stage.volleysPerTank,
    })),
    [
      {
        id: 'minimum',
        volleyDamage: 90,
        actionFrames: 19,
        volleysToSplat: 2,
        volleysPerTank: 20,
      },
      {
        id: 'middle',
        volleyDamage: 105,
        actionFrames: 40,
        volleysToSplat: 1,
        volleysPerTank: 16,
      },
      {
        id: 'full',
        volleyDamage: 105,
        actionFrames: 82,
        volleysToSplat: 1,
        volleysPerTank: 11,
      },
    ],
  );
  assert.ok(
    Math.abs((result.stages[0]?.directDps ?? 0) - (90 * 60) / 19) < 1e-9,
  );
});

void test('keeps REEF-LUX volley calculations pending when projectile count lacks a cited source', () => {
  const result = analyzeStringerEfficiency(
    getMainWeaponParameters('main-7020'),
  );
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 10);
  assert.equal(result.projectileCount, null);
  assert.equal(result.bestDirectDpsStage, null);
  assert.equal(result.fastestSplatStage, null);
  assert.deepEqual(
    result.stages.map(({ arrowDamage, volleyDamage, directDps }) => ({
      arrowDamage,
      volleyDamage,
      directDps,
    })),
    [
      { arrowDamage: 30, volleyDamage: null, directDps: null },
      { arrowDamage: 45, volleyDamage: null, directDps: null },
      { arrowDamage: 45, volleyDamage: null, directDps: null },
    ],
  );
});

void test('uses the official five-shot count for Wellstring V charge-stage totals', () => {
  const result = analyzeStringerEfficiency(
    getMainWeaponParameters('main-7030'),
  );
  assert.ok(result);
  assert.equal(result.projectileCount, 5);
  assert.equal(result.bestDirectDpsStage, 'minimum');
  assert.deepEqual(
    result.stages.map(({ volleyDamage, actionFrames, volleysToSplat }) => ({
      volleyDamage,
      actionFrames,
      volleysToSplat,
    })),
    [
      { volleyDamage: 120, actionFrames: 22, volleysToSplat: 1 },
      { volleyDamage: 120, actionFrames: 50, volleysToSplat: 1 },
      { volleyDamage: 175, actionFrames: 90, volleysToSplat: 1 },
    ],
  );
});

void test('derives ordinary dualie output while leaving an omitted post-dodge damage pending', () => {
  const result = analyzeManeuverEfficiency(
    getMainWeaponParameters('main-5000'),
  );
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 10);
  assert.deepEqual(result.normal, {
    damagePerShot: 36,
    fireIntervalFrames: 5,
    spreadDegrees: 6.8,
    shotsToSplat: 3,
    splatTimeFrames: 10,
    splatTimeSeconds: 1 / 6,
    directDps: 432,
  });
  assert.deepEqual(result.postDodge, {
    damagePerShot: null,
    fireIntervalFrames: 4,
    spreadDegrees: 3.89,
    shotsToSplat: null,
    splatTimeFrames: null,
    splatTimeSeconds: null,
    directDps: null,
  });
  assert.equal(result.shotsPerFullTank, 150);
  assert.equal(result.shotsAfterOneDodge, 143);
  assert.equal(result.dodgeMoveFrames, 8);
});

void test('treats an explicit zero-degree post-dodge spread as verified data', () => {
  const result = analyzeManeuverEfficiency(
    getMainWeaponParameters('main-5010'),
  );
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 10);
  assert.equal(result.postDodge.spreadDegrees, 0);
});

void test('uses Kelvin 525 explicit post-dodge damage instead of its ordinary damage', () => {
  const result = analyzeManeuverEfficiency(
    getMainWeaponParameters('main-5020'),
  );
  assert.ok(result);
  assert.equal(result.normal.damagePerShot, 36);
  assert.equal(result.normal.directDps, 240);
  assert.equal(result.normal.shotsToSplat, 3);
  assert.equal(result.postDodge.damagePerShot, 52.5);
  assert.equal(result.postDodge.directDps, 350);
  assert.equal(result.postDodge.shotsToSplat, 2);
  assert.equal(result.postDodge.splatTimeFrames, 9);
  assert.equal(result.shotsPerFullTank, 71);
  assert.equal(result.shotsAfterOneDodge, 65);
  assert.equal(result.dodgeMoveFrames, null);
});

void test('compares explicit ordinary and post-dodge Douser Dualies FF windows', () => {
  const result = analyzeManeuverEfficiency(
    getMainWeaponParameters('main-5050'),
  );
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 11);
  assert.equal(result.normal.directDps, 191.25);
  assert.equal(result.normal.splatTimeFrames, 24);
  assert.equal(result.postDodge.directDps, 382.5);
  assert.equal(result.postDodge.splatTimeFrames, 12);
  assert.equal(result.shotsAfterOneDodge, 75);
});

void test('keeps Splatana Stamper projectile and close slash damage separate', () => {
  const result = analyzeSaberEfficiency(getMainWeaponParameters('main-8000'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 17);
  assert.deepEqual(result.horizontal, {
    projectileDamage: 35,
    projectileHitsToSplat: 3,
    slashDamage: 20,
    slashHitsToSplat: 5,
    inkConsumption: 5.2,
    actionsPerFullTank: 19,
    swingFrames: 26,
    postDelayFrames: 22,
    projectileReleaseFrame: 9,
    slashReleaseFrame: 6,
    inkRecoveryLockFrames: 40,
  });
  assert.equal(result.charged.projectileDamage, 70);
  assert.equal(result.charged.projectileHitsToSplat, 2);
  assert.equal(result.charged.slashDamage, 140);
  assert.equal(result.charged.slashHitsToSplat, 1);
  assert.equal(result.charged.actionsPerFullTank, 8);
  assert.equal(result.charged.inputToProjectileReleaseFrames, 26);
  assert.equal(result.charged.inputToSlashReleaseFrames, 23);
});

void test('derives Splatana Wiper release points without inventing a cycle DPS', () => {
  const result = analyzeSaberEfficiency(getMainWeaponParameters('main-8010'));
  assert.ok(result);
  assert.equal(result.horizontal.actionsPerFullTank, 33);
  assert.equal(result.charged.actionsPerFullTank, 16);
  assert.equal(result.charged.fullChargeFrames, 14);
  assert.equal(result.charged.inputToProjectileReleaseFrames, 20);
  assert.equal(result.charged.inputToSlashReleaseFrames, 17);
  assert.equal(result.horizontal.inkRecoveryLockFrames, 30);
  assert.equal(result.charged.inkRecoveryLockFrames, 30);
});

void test('derives Decavitator full-charge input-to-release timing', () => {
  const result = analyzeSaberEfficiency(getMainWeaponParameters('main-8020'));
  assert.ok(result);
  assert.equal(result.horizontal.projectileDamage, 40);
  assert.equal(result.horizontal.slashDamage, 30);
  assert.equal(result.charged.projectileDamage, 80);
  assert.equal(result.charged.slashDamage, 160);
  assert.equal(result.charged.inputToProjectileReleaseFrames, 43);
  assert.equal(result.charged.inputToSlashReleaseFrames, 40);
  assert.equal(result.charged.actionsPerFullTank, 7);
  assert.equal(result.charged.inkRecoveryLockFrames, 50);
});

void test('uses the explicit Splat Brella shot cap without multiplying every pellet', () => {
  const result = analyzeShelterEfficiency(getMainWeaponParameters('main-6000'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 7);
  assert.equal(result.maximumPelletDamage, 16.2);
  assert.equal(result.pelletCount, 11);
  assert.equal(result.effectiveTotalDamageCap, 81);
  assert.equal(result.shotsToSplatAtCap, 2);
  assert.equal(result.shotsPerFullTank, 20);
  assert.equal(result.canLaunchCanopy, null);
});

void test('keeps Tenta Brella launch support pending when the source omits the boolean', () => {
  const result = analyzeShelterEfficiency(getMainWeaponParameters('main-6010'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 12);
  assert.equal(result.canLaunchCanopy, null);
  assert.equal(result.canopyLaunchesPerFullTank, null);
  assert.equal(result.canopyChargeFrames, 45);
  assert.equal(result.canopyOpenFrames, 30);
  assert.equal(result.canopyLaunchFrames, 30);
  assert.equal(result.canopyDurability, 700);
});

void test('does not interpret Undercover Brella zero launch ink as a free launch', () => {
  const result = analyzeShelterEfficiency(getMainWeaponParameters('main-6020'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 12);
  assert.equal(result.canLaunchCanopy, false);
  assert.equal(result.canopyLaunchInkConsumption, 0);
  assert.equal(result.canopyLaunchesPerFullTank, null);
  assert.equal(result.shotsToSplatAtCap, 3);
  assert.equal(result.shotsPerFullTank, 27);
  assert.equal(result.canopyDurability, 200);
});

void test('derives Recycled Brella canopy budget only from explicit launch support', () => {
  const result = analyzeShelterEfficiency(getMainWeaponParameters('main-6030'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 14);
  assert.equal(result.canLaunchCanopy, true);
  assert.equal(result.canopyLaunchesPerFullTank, 6);
  assert.equal(result.canopyLaunchFrames, 20);
  assert.equal(result.canopyRecoveryFrames, 130);
  assert.equal(result.canopyRecoverySeconds, 130 / 60);
  assert.equal(result.shotInkRecoveryLockFrames, 50);
  assert.equal(result.canopyShotInkRecoveryLockFrames, 55);
  assert.equal(result.canopyDurability, 150);
});

void test('derives Inkbrush swing and rolling windows from separate explicit fields', () => {
  const result = analyzeBrushEfficiency(getMainWeaponParameters('main-1100'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 11);
  assert.equal(result.maximumSwingDamage, 30);
  assert.equal(result.minimumSwingDamage, 15);
  assert.equal(result.maximumDamageHitsToSplat, 4);
  assert.equal(result.minimumDamageHitsToSplat, 7);
  assert.equal(result.swingsPerFullTank, 50);
  assert.equal(result.swingRepeatFrames, 6);
  assert.equal(result.maximumDamageRepeatWindowDps, 300);
  assert.equal(result.maximumDamageSplatWindowFrames, 18);
  assert.equal(result.rollingInkConsumptionPerFrame, 0.125);
  assert.equal(result.fullTankRollingFrames, 800);
  assert.equal(result.fullTankRollingSeconds, 800 / 60);
});

void test('keeps Octobrush inherited repeat and rolling values pending', () => {
  const result = analyzeBrushEfficiency(getMainWeaponParameters('main-1110'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 8);
  assert.equal(result.maximumSwingDamage, 40);
  assert.equal(result.maximumDamageHitsToSplat, 3);
  assert.equal(result.swingRepeatFrames, null);
  assert.equal(result.maximumDamageRepeatWindowDps, null);
  assert.equal(result.rollingSpeed, null);
  assert.equal(result.rollingPaintStartFrames, null);
});

void test('keeps Painbrush startup and repeat timing as different controls', () => {
  const result = analyzeBrushEfficiency(getMainWeaponParameters('main-1120'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 12);
  assert.equal(result.maximumSwingDamage, 60);
  assert.equal(result.maximumDamageHitsToSplat, 2);
  assert.equal(result.swingPhaseFrames, 23);
  assert.equal(result.swingRepeatFrames, 13);
  assert.equal(result.maximumDamageSplatWindowFrames, 13);
  assert.equal(result.swingInkRecoveryLockFrames, 50);
  assert.equal(result.contactHitsToSplat, 4);
  assert.equal(result.rollingInkRecoveryLockFrames, 20);
});

void test('derives Slosher unit damage without multiplying trajectory groups', () => {
  const result = analyzeSlosherEfficiency(getMainWeaponParameters('main-3000'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 9);
  assert.equal(result.maximumUnitDamage, 70);
  assert.equal(result.minimumUnitDamage, 50);
  assert.equal(result.maximumUnitHitsToSplat, 2);
  assert.equal(result.minimumUnitHitsToSplat, 2);
  assert.equal(result.fireIntervalFrames, 29);
  assert.equal(result.maximumUnitSplatWindowFrames, 29);
  assert.equal(result.swingsPerFullTank, 13);
  assert.equal(result.unitGroupCount, 3);
  assert.equal(result.maximumUnitDelayFrames, 4);
});

void test('keeps Bloblobber bounce groups separate from one-unit damage', () => {
  const result = analyzeSlosherEfficiency(getMainWeaponParameters('main-3030'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 11);
  assert.equal(result.maximumUnitDamage, 32);
  assert.equal(result.maximumUnitHitsToSplat, 4);
  assert.equal(result.unitGroupCount, 2);
  assert.equal(result.maximumUnitDelayFrames, 5);
  assert.equal(result.maximumUnitSplatWindowFrames, 96);
  assert.equal(result.maximumUnitSplatWindowSeconds, 1.6);
  assert.equal(result.swingsPerFullTank, 12);
});

void test('shows Explosher blast separately from its direct unit', () => {
  const result = analyzeSlosherEfficiency(getMainWeaponParameters('main-3040'));
  assert.ok(result);
  assert.equal(result.verifiedInputCount, 13);
  assert.equal(result.maximumUnitDamage, 55);
  assert.equal(result.maximumUnitHitsToSplat, 2);
  assert.equal(result.maximumUnitDelayFrames, 0);
  assert.equal(result.blastDamage, 35);
  assert.equal(result.blastHitsToSplat, 3);
  assert.equal(result.blastDamageRadius, 2.87);
  assert.equal(result.inkRecoveryLockFrames, 70);
});

void test('models Dread Wringer units without summing both waves', () => {
  const result = analyzeSlosherEfficiency(getMainWeaponParameters('main-3050'));
  assert.ok(result);
  assert.equal(result.maximumUnitDamage, 48);
  assert.equal(result.minimumUnitDamage, 35);
  assert.equal(result.maximumUnitHitsToSplat, 3);
  assert.equal(result.unitGroupCount, 2);
  assert.equal(result.maximumUnitDelayFrames, 8);
  assert.equal(result.fireIntervalFrames, 45);
  assert.equal(result.maximumUnitSplatWindowFrames, 90);
});

void test('rejects invalid target health and ignores unverified values', () => {
  const record: MainWeaponParameterRecord = {
    weaponId: 'test',
    parameters: [
      {
        key: 'damagePerShot',
        label: 'damage',
        value: 100,
        unit: 'damage',
        status: 'demo',
        note: 'not verified',
      },
    ],
  };
  assert.equal(analyzeMainWeaponEfficiency(record), null);
  assert.equal(analyzeManeuverEfficiency(record), null);
  assert.equal(analyzeBlasterEfficiency(record), null);
  assert.equal(analyzeBrushEfficiency(record), null);
  assert.equal(analyzeChargerEfficiency(record), null);
  assert.equal(analyzeRollerEfficiency(record), null);
  assert.equal(analyzeSaberEfficiency(record), null);
  assert.equal(analyzeShelterEfficiency(record), null);
  assert.equal(analyzeSlosherEfficiency(record), null);
  assert.equal(analyzeSpinnerEfficiency(record), null);
  assert.equal(analyzeStringerEfficiency(record), null);
  assert.throws(() => analyzeMainWeaponEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeManeuverEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeBlasterEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeBrushEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeChargerEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeRollerEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeSaberEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeShelterEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeSlosherEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeSpinnerEfficiency(record, 0), RangeError);
  assert.throws(() => analyzeStringerEfficiency(record, 0), RangeError);
});
