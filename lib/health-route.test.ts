import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from '../app/api/health/route.ts';

void test('health route exposes only stable public service metadata', async () => {
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'inklab',
    schemaVersion: 1,
    gameData: { version: '12.0.0', updatedAt: '2026-11-22' },
  });
});
