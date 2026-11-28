import assert from 'node:assert/strict';
import test from 'node:test';
import { copyTextToClipboard } from './clipboard.ts';

void test('clipboard writer succeeds without invoking the fallback', async () => {
  let copied = '';
  let fallbackCalls = 0;
  const result = await copyTextToClipboard('share-url', {
    clipboard: {
      writeText: async (text) => {
        copied = text;
      },
    },
    fallback: () => {
      fallbackCalls += 1;
      return true;
    },
  });
  assert.equal(result, true);
  assert.equal(copied, 'share-url');
  assert.equal(fallbackCalls, 0);
});

void test('clipboard rejection falls back without losing the share text', async () => {
  let fallbackText = '';
  const result = await copyTextToClipboard('share-url', {
    clipboard: {
      writeText: () => Promise.reject(new Error('permission denied')),
    },
    fallback: (text) => {
      fallbackText = text;
      return true;
    },
  });
  assert.equal(result, true);
  assert.equal(fallbackText, 'share-url');
});

void test('copy failure remains explicit when no method succeeds', async () => {
  assert.equal(
    await copyTextToClipboard('share-url', {
      clipboard: null,
      fallback: () => false,
    }),
    false,
  );
});
