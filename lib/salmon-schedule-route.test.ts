import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchSalmonSchedule } from '../app/api/salmon-schedule/route.ts';
import { SALMON_SCHEDULE_SOURCE_URL } from './salmon-schedule.ts';

const validPayload = {
  data: {
    coopGroupingSchedule: {
      regularSchedules: {
        nodes: [
          {
            startTime: '2026-11-29T00:00:00Z',
            endTime: '2026-11-30T16:00:00Z',
            setting: {
              coopStage: { name: 'Sockeye Station' },
              weapons: [
                { __splatoon3ink_id: 1, name: "N-ZAP '85" },
                { __splatoon3ink_id: 2, name: 'Splat Roller' },
                { __splatoon3ink_id: 3, name: 'Splat Charger' },
                { __splatoon3ink_id: 4, name: 'Tri-Stringer' },
              ],
            },
          },
        ],
      },
    },
  },
};

void test('schedule proxy validates upstream data before publishing it', async () => {
  let requestedUrl = '';
  let hasTimeoutSignal = false;
  const envelope = await fetchSalmonSchedule(async (input, init) => {
    requestedUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    hasTimeoutSignal = init?.signal !== undefined;
    return Response.json(validPayload);
  });
  assert.equal(requestedUrl, SALMON_SCHEDULE_SOURCE_URL);
  assert.equal(hasTimeoutSignal, true);
  assert.equal(envelope.schemaVersion, 1);
  assert.equal(envelope.rotations.length, 1);
  assert.equal(envelope.rotations[0]?.weapons.length, 4);
});

void test('schedule proxy rejects invalid and oversized upstream payloads', async () => {
  await assert.rejects(
    fetchSalmonSchedule(async () => Response.json({ data: {} })),
    /invalid upstream schedule/,
  );
  await assert.rejects(
    fetchSalmonSchedule(
      async () =>
        new Response('{}', {
          headers: { 'content-length': String(2 * 1024 * 1024 + 1) },
        }),
    ),
    /payload too large/,
  );
});
