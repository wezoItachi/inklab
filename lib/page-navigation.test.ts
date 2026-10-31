import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageHash, parsePageHash } from './page-navigation.ts';

void test('page hashes resolve every public Web section', () => {
  assert.equal(parsePageHash('#lab'), 'lab');
  assert.equal(parsePageHash('#salmon'), 'salmon');
  assert.equal(parsePageHash('#wiki'), 'wiki');
  assert.equal(parsePageHash('#library'), 'library');
  assert.equal(parsePageHash('#motion'), 'motion');
});

void test('page hash parsing is tolerant and safely defaults to the laboratory', () => {
  assert.equal(parsePageHash(' #SALMON '), 'salmon');
  assert.equal(parsePageHash(''), 'lab');
  assert.equal(parsePageHash('#unknown'), 'lab');
});

void test('page hash generation keeps section links stable', () => {
  assert.equal(getPageHash('lab'), '#lab');
  assert.equal(getPageHash('library'), '#library');
});
