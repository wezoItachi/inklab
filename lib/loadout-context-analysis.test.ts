import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLoadoutContextSections } from './loadout-context-analysis.ts';
import { getWeapon } from './weapon-catalog.ts';

void test('context analysis reads the current kit and equipped AP without inventing curves', () => {
  const sections = buildLoadoutContextSections(
    getWeapon('shooter-quickmiddle-cstm01'),
    [
      { id: 'iss', ap: 13 },
      { id: 'subp', ap: 3 },
      { id: 'qsj', ap: 3 },
      { id: 'inkres', ap: 3 },
      { id: 'ism', ap: 10 },
    ],
  );
  const sub = sections.find(({ id }) => id === 'sub');
  const mobility = sections.find(({ id }) => id === 'mobility');
  const other = sections.find(({ id }) => id === 'other');

  assert.equal(sections.length, 5);
  assert.equal(sub?.summary, '机器人炸弹 · 当前套装');
  assert.equal(sub?.metrics[0]?.value, '55%');
  assert.match(sub?.metrics[0]?.note ?? '', /完整使用 1 次/);
  assert.equal(sub?.metrics[1]?.value, '13AP');
  assert.match(sub?.metrics[1]?.note ?? '', /不输出调整后耗墨/);
  assert.equal(mobility?.metrics[0]?.label, '快跳');
  assert.equal(other?.metrics[0]?.label, '主省');
  assert.match(other?.metrics[0]?.note ?? '', /正式效果曲线/);
});

void test('fixed main abilities are not described as pending AP curves', () => {
  const sections = buildLoadoutContextSections(
    getWeapon('shooter-quickmiddle-cstm01'),
    [
      { id: 'og', ap: 10 },
      { id: 'ninja', ap: 10 },
      { id: 'stealth', ap: 10 },
    ],
  );
  const notes = sections.flatMap(({ metrics }) =>
    metrics.map(({ note }) => note),
  );
  assert.equal(notes.filter((note) => note.includes('固定主能力')).length, 3);
  assert.equal(
    notes.some((note) => /固定主能力.*曲线.*待/.test(note)),
    false,
  );
});

void test('unverified kit fields remain visibly pending', () => {
  const weapon = {
    ...getWeapon('shooter-quickmiddle-cstm01'),
    sub: {
      ...getWeapon('shooter-quickmiddle-cstm01').sub,
      baseInkCost: null,
      subPowerEffect: null,
    },
  };
  const sub = buildLoadoutContextSections(weapon, []).find(
    ({ id }) => id === 'sub',
  );
  assert.equal(sub?.metrics[0]?.state, 'pending');
  assert.equal(sub?.metrics[2]?.state, 'pending');
});
