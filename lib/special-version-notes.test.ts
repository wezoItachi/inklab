import assert from 'node:assert/strict';
import test from 'node:test';
import { getSpecialVersionNote, summarizeSpecialVersionNotes } from './special-version-notes.ts';

void test('Ver. 12.0.0 special notes separate linked parameters from rule-only changes', () => {
  assert.deepEqual(summarizeSpecialVersionNotes(), {
    total: 5,
    parameterLinked: 2,
    ruleOnly: 3,
  });

  assert.equal(getSpecialVersionNote('tenta-missiles')?.modelStatus, 'parameter-linked');
  assert.equal(getSpecialVersionNote('tacticooler')?.modelStatus, 'parameter-linked');
  assert.equal(getSpecialVersionNote('reef-slider')?.modelStatus, 'rule-only');
  assert.equal(getSpecialVersionNote('ink-storm'), null);
});

void test('official rule notes do not claim unsupported calculations', () => {
  for (const specialId of ['reef-slider', 'zipcaster', 'splattercolor-screen']) {
    const note = getSpecialVersionNote(specialId);
    assert.equal(note?.modelStatus, 'rule-only');
    assert.match(note?.modelNote ?? '', /不进入|不与|不等同/);
  }
});
