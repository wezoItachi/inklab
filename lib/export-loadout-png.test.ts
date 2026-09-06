import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTags, sanitizePngFilename } from './export-loadout-png.ts';

void test('tag input accepts Chinese and western separators and removes duplicates', () => {
  assert.deepEqual(normalizeTags('前线, 机动，57AP、前线 续航'), ['前线', '机动', '57AP', '续航']);
});

void test('tag export is capped to keep the image layout stable', () => {
  assert.equal(normalizeTags('一 二 三 四 五 六').length, 5);
});

void test('PNG filenames remove filesystem-reserved characters', () => {
  assert.equal(sanitizePngFilename(' N-ZAP89: 双投/机动 '), 'N-ZAP89-双投-机动.png');
  assert.equal(sanitizePngFilename('   '), 'inklab-loadout.png');
});
