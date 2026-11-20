import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assessSalmonComposition,
  assessSalmonEvents,
} from './salmon-assessment.ts';
import { salmonWeapons } from './salmon-run.ts';

function weapon(id: string) {
  const result = salmonWeapons.find((item) => item.id === id);
  assert.ok(result, `missing test weapon ${id}`);
  return result;
}

void test('composition assessment replaces role letters with a player-facing verdict', () => {
  const result = assessSalmonComposition([
    weapon('splat-roller'),
    weapon('splattershot'),
    weapon('heavy-splatling'),
    weapon('splat-charger'),
  ]);
  assert.equal(result.grade, 'strong');
  assert.equal(result.label, '优势编成');
  assert.match(result.recommendation, /冲分/);
});

void test('composition assessment lowers the verdict when key coverage is missing', () => {
  const shortRange = salmonWeapons
    .filter((item) => item.tags.includes('短手'))
    .slice(0, 4);
  assert.notEqual(assessSalmonComposition(shortRange).grade, 'strong');
});

void test('all eight special events receive an explicit provisional assessment', () => {
  const events = assessSalmonEvents([
    weapon('splat-roller'),
    weapon('splattershot'),
    weapon('heavy-splatling'),
    weapon('splat-charger'),
  ]);
  assert.equal(events.length, 8);
  assert.deepEqual(
    events.map((event) => event.id),
    [
      'rush',
      'griller',
      'goldie-seeking',
      'mothership',
      'cohock-charge',
      'fog',
      'mudmouth',
      'tornado',
    ],
  );
  assert.equal(events.every((event) => event.label.length > 0), true);
  assert.equal(events.every((event) => event.summary.length > 0), true);
  assert.deepEqual(
    events.map((event) => event.name),
    [
      '狂潮',
      '烤架鱼进发',
      '寻找金鲑鱼',
      '走私鱼来袭',
      '大胖鱼大量出现',
      '雾',
      '泥鲑鱼喷发',
      '巨型龙卷风',
    ],
  );
  assert.equal(
    events.find((event) => event.id === 'mothership')?.alias,
    '走私关',
  );
  assert.equal(events.find((event) => event.id === 'tornado')?.alias, undefined);
});
