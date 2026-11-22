import subPowerJson from '../database/sub-power.v12.0.0.json' with { type: 'json' };
import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

type SubPowerMetric = {
  key: string;
  label: string;
  unit: string;
  kind: 'number' | 'frames' | 'hp10' | 'beakon';
  values: [number, number, number];
};

type SubPowerRecord = {
  subId: string;
  metrics: SubPowerMetric[];
};

const records = new Map(
  (subPowerJson.records as SubPowerRecord[]).map((record) => [
    record.subId,
    record,
  ]),
);

function calculateBeakonQsjAp(
  [high, mid, low]: readonly [number, number, number],
  ap: number,
) {
  const v7 =
    ((mid - low) / high - 17.8 / high) / ((17.8 / high) * (17.8 / high - 1));
  const normalized = ap / high;
  const value = normalized * (normalized * v7 + (1 - v7));
  return Math.floor(low + (high - low) * value);
}

function convertMetric(metric: SubPowerMetric, ap: number) {
  const raw =
    metric.kind === 'beakon'
      ? calculateBeakonQsjAp(metric.values, ap)
      : interpolateAbilityValue(metric.values, ap);

  if (metric.kind === 'frames') return Math.ceil(raw) / 60;
  if (metric.kind === 'hp10') return raw / 10;
  return raw;
}

export function analyzeSubPower(subId: string, ap: number) {
  const boundedAp = clampAbilityPoints(ap);
  const record = records.get(subId);
  if (!record) return null;

  return {
    ap: boundedAp,
    gameVersion: subPowerJson.gameVersion,
    metrics: record.metrics.map((metric) => ({
      key: metric.key,
      label: metric.label,
      unit: metric.unit,
      value: convertMetric(metric, boundedAp),
      baseValue: convertMetric(metric, 0),
      maximumValue: convertMetric(metric, 57),
    })),
  };
}

export function getSubPowerCoverage() {
  return {
    recordCount: records.size,
    metricCount: [...records.values()].reduce(
      (sum, record) => sum + record.metrics.length,
      0,
    ),
  };
}
