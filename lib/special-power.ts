import specialPowerJson from '../database/special-power.v12.0.0.json' with { type: 'json' };
import {
  clampAbilityPoints,
  interpolateAbilityValue,
} from './ability-curves.ts';

type SpecialPowerMetric = {
  key: string;
  label: string;
  unit: string;
  kind: 'number' | 'frames' | 'hp10' | 'percent' | 'zipInk';
  values: [number, number, number];
};

type SpecialPowerRecord = {
  specialId: string;
  status: 'verified' | 'pending';
  metrics: SpecialPowerMetric[];
};

const records = new Map(
  (specialPowerJson.records as SpecialPowerRecord[]).map((record) => [
    record.specialId,
    record,
  ]),
);

function convertMetric(metric: SpecialPowerMetric, ap: number) {
  const raw = interpolateAbilityValue(metric.values, ap);
  if (metric.kind === 'frames') return Math.ceil(raw) / 60;
  if (metric.kind === 'hp10') return Math.round(raw / 10);
  if (metric.kind === 'percent') return raw * 100;
  if (metric.kind === 'zipInk') return (raw * 100) / 1.5;
  return raw;
}

export function analyzeSpecialPower(specialId: string, ap: number) {
  const boundedAp = clampAbilityPoints(ap);
  const record = records.get(specialId);
  if (!record) return null;
  return {
    ap: boundedAp,
    gameVersion: specialPowerJson.gameVersion,
    status: record.status,
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

export function summarizeSpecialPowerData() {
  return {
    total: records.size,
    verified: [...records.values()].filter(({ status }) => status === 'verified')
      .length,
    pending: [...records.values()].filter(({ status }) => status === 'pending')
      .length,
    metricCount: [...records.values()].reduce(
      (sum, record) => sum + record.metrics.length,
      0,
    ),
  };
}
