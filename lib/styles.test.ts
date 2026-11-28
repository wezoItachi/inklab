import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

void test('every referenced CSS custom property is declared', () => {
  const stylesheet = readFileSync('app/globals.css', 'utf8');
  const declared = new Set(
    [...stylesheet.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]),
  );
  const referenced = new Set(
    [...stylesheet.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]),
  );
  const missing = [...referenced].filter((name) => !declared.has(name)).sort();
  assert.deepEqual(missing, []);
});
