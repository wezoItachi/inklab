import assert from 'node:assert/strict';
import test from 'node:test';
import { getLinearNavigationIndex } from './keyboard-navigation.ts';

void test('linear navigation wraps in both directions', () => {
  assert.equal(getLinearNavigationIndex(2, 'ArrowRight', 4), 3);
  assert.equal(getLinearNavigationIndex(3, 'ArrowDown', 4), 0);
  assert.equal(getLinearNavigationIndex(0, 'ArrowLeft', 4), 3);
  assert.equal(getLinearNavigationIndex(2, 'ArrowUp', 4), 1);
});

void test('linear navigation supports boundaries and empty results', () => {
  assert.equal(getLinearNavigationIndex(2, 'Home', 4), 0);
  assert.equal(getLinearNavigationIndex(0, 'End', 4), 3);
  assert.equal(getLinearNavigationIndex(0, 'ArrowDown', 0), null);
});
