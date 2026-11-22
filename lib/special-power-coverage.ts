import specialPowerCoverageJson from '../database/special-power-coverage.v12.0.0.json' with { type: 'json' };

export type SpecialPowerCoverageRecord = {
  specialId: string;
  status: 'source-backed' | 'interpretation-pending';
  fields: string[];
  note: string;
};

const records =
  specialPowerCoverageJson.records as SpecialPowerCoverageRecord[];
const recordsById = new Map(
  records.map((record) => [record.specialId, record]),
);

export function getSpecialPowerCoverage(specialId: string) {
  return recordsById.get(specialId) ?? null;
}

export function summarizeSpecialPowerCoverage() {
  return {
    total: records.length,
    sourceBacked: records.filter(({ status }) => status === 'source-backed')
      .length,
    interpretationPending: records.filter(
      ({ status }) => status === 'interpretation-pending',
    ).length,
    fieldCount: records.reduce((sum, record) => sum + record.fields.length, 0),
  };
}
