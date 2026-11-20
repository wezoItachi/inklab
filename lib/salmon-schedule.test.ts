import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSalmonScheduleEnvelope,
  parseSalmonScheduleEnvelope,
  readSalmonScheduleCache,
  SALMON_SCHEDULE_CACHE_KEY,
  writeSalmonScheduleCache,
} from './salmon-schedule.ts';

const rotations = [
  {
    stage: 'Sockeye Station',
    startTime: '2026-11-19T16:00:00Z',
    endTime: '2026-11-21T08:00:00Z',
    weapons: [{ id: 'hash', name: "N-ZAP '85" }],
  },
];

void test('schedule envelope round-trips through browser storage', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
  const envelope = createSalmonScheduleEnvelope(
    rotations,
    '2026-11-20T00:00:00Z',
  );
  assert.equal(writeSalmonScheduleCache(storage, envelope), true);
  assert.equal(values.has(SALMON_SCHEDULE_CACHE_KEY), true);
  assert.deepEqual(readSalmonScheduleCache(storage), envelope);
});

void test('schedule envelope rejects malformed dates and partial weapons', () => {
  const envelope = createSalmonScheduleEnvelope(rotations);
  assert.equal(
    parseSalmonScheduleEnvelope({ ...envelope, fetchedAt: 'not-a-date' }),
    null,
  );
  assert.equal(
    parseSalmonScheduleEnvelope({
      ...envelope,
      rotations: [{ ...rotations[0], weapons: [{ id: 'hash' }] }],
    }),
    null,
  );
});

void test('schedule cache failure remains non-fatal', () => {
  const storage = {
    getItem: () => '{broken',
    setItem: () => {
      throw new Error('blocked');
    },
  };
  const envelope = createSalmonScheduleEnvelope(rotations);
  assert.equal(readSalmonScheduleCache(storage), null);
  assert.equal(writeSalmonScheduleCache(storage, envelope), false);
});
