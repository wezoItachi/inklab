import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLoadoutContextSections } from './loadout-context-analysis.ts';
import { getWeapon, weapons } from './weapon-catalog.ts';

void test('context analysis reads the current kit and verified equipped AP curves', () => {
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
  const main = sections.find(({ id }) => id === 'main');
  const sub = sections.find(({ id }) => id === 'sub');
  const special = sections.find(({ id }) => id === 'special');
  const mobility = sections.find(({ id }) => id === 'mobility');

  assert.equal(sections.length, 6);
  assert.equal(main?.summary, 'N-ZAP89 · 主省 10AP');
  assert.equal(main?.metrics[0]?.label, '主武省墨');
  assert.equal(main?.metrics[0]?.abilityId, 'ism');
  assert.match(main?.metrics[0]?.value ?? '', /10AP · 耗墨 −/);
  assert.match(main?.metrics[0]?.note ?? '', /满墨/);
  assert.equal(main?.metrics[1]?.label, '可复算动作');
  assert.equal(sub?.summary, '机器人炸弹 · 当前套装');
  assert.equal(sub?.metrics[0]?.value, '55%');
  assert.match(sub?.metrics[0]?.note ?? '', /完整使用 1 次/);
  assert.equal(sub?.metrics[1]?.value, '13AP · 48.67%');
  assert.equal(sub?.metrics[1]?.abilityId, 'iss');
  assert.match(sub?.metrics[1]?.note ?? '', /Lv1 曲线.*完整使用 2 次/);
  assert.equal(sub?.metrics[2]?.state, 'equipped');
  assert.match(sub?.metrics[2]?.note ?? '', /投掷初速度/);
  assert.equal(special?.metrics[0]?.state, 'verified');
  assert.equal(special?.metrics[1]?.state, 'verified');
  assert.equal(special?.metrics[2]?.state, 'weapon-specific');
  assert.match(special?.metrics[2]?.note ?? '', /爆炸涂墨半径/);
  assert.equal(mobility?.metrics[0]?.label, '快跳');
  assert.equal(mobility?.metrics[0]?.abilityId, 'qsj');
  assert.match(mobility?.metrics[0]?.value ?? '', /3AP · \d+帧/);
});

void test('weapon-specific models remain distinct from universal verified curves', () => {
  const weapon = getWeapon('shooter-quickmiddle-cstm01');
  const sections = buildLoadoutContextSections(weapon, []);
  const sub = sections.find(({ id }) => id === 'sub');
  const special = sections.find(({ id }) => id === 'special');

  assert.equal(sub?.metrics[2]?.state, 'weapon-specific');
  assert.match(sub?.metrics[2]?.note ?? '', /投掷初速度/);
  assert.equal(special?.metrics[2]?.state, 'weapon-specific');
  assert.match(special?.metrics[2]?.note ?? '', /爆炸涂墨半径/);

  const verifiedSpecialWeapon = weapons.find((candidate) => {
    const specialMetric = buildLoadoutContextSections(candidate, []).find(
      ({ id }) => id === 'special',
    )?.metrics[2];
    return specialMetric?.state === 'weapon-specific';
  });
  assert.ok(verifiedSpecialWeapon);
});

void test('fixed main abilities merge with their verified current-loadout models', () => {
  const sections = buildLoadoutContextSections(
    getWeapon('shooter-quickmiddle-cstm01'),
    [
      { id: 'ssu', ap: 6 },
      { id: 'qsj', ap: 3 },
      { id: 'qr', ap: 3 },
      { id: 'ss', ap: 3 },
      { id: 'ninja', ap: 10 },
      { id: 'stealth', ap: 10 },
      { id: 'rp', ap: 10 },
    ],
  );
  const mobility = sections.find(({ id }) => id === 'mobility');
  const survival = sections.find(({ id }) => id === 'survival');
  const special = sections.find(({ id }) => id === 'special');

  assert.equal(mobility?.metrics[0]?.label, '游速＋隐游');
  assert.match(mobility?.metrics[0]?.note ?? '', /0\.9 倍固定修正/);
  assert.equal(mobility?.metrics[1]?.label, '快跳＋隐跳');
  assert.match(mobility?.metrics[1]?.note ?? '', /最多增加到/);
  assert.equal(survival?.metrics[0]?.label, '快活＋死惩');
  assert.match(survival?.metrics[0]?.note ?? '', /固定复活代价/);
  assert.match(special?.metrics[1]?.note ?? '', /自身提升复活惩罚代价/);
  assert.equal(
    sections.some(({ metrics }) =>
      metrics.some(({ note }) => /固定主能力.*曲线.*待/.test(note)),
    ),
    false,
  );
});

void test('unverified kit fields remain visibly pending', () => {
  const weapon = {
    ...getWeapon('shooter-quickmiddle-cstm01'),
    sub: {
      ...getWeapon('shooter-quickmiddle-cstm01').sub,
      baseInkCost: null,
      inkSaverLevel: null,
      inkCostSource: null,
      inkSaverLevelSource: null,
      subPowerEffect: null,
    },
  };
  const sub = buildLoadoutContextSections(weapon, []).find(
    ({ id }) => id === 'sub',
  );
  assert.equal(sub?.metrics[0]?.state, 'pending');
  assert.equal(sub?.metrics[2]?.state, 'weapon-specific');
});

void test('all battle weapons produce finite linked summaries for fixed-ability variants', () => {
  const ninjaStealthTotals = [
    { id: 'ssu', ap: 6 },
    { id: 'qsj', ap: 3 },
    { id: 'ia', ap: 3 },
    { id: 'inkres', ap: 3 },
    { id: 'subr', ap: 3 },
    { id: 'ism', ap: 6 },
    { id: 'ninja', ap: 10 },
    { id: 'stealth', ap: 10 },
  ];
  const respawnPunisherTotals = [
    { id: 'qr', ap: 6 },
    { id: 'ss', ap: 6 },
    { id: 'rp', ap: 10 },
  ];

  for (const weapon of weapons) {
    for (const totals of [ninjaStealthTotals, respawnPunisherTotals]) {
      const sections = buildLoadoutContextSections(weapon, totals);
      assert.equal(sections.length, 6, weapon.name);
      const text = sections
        .flatMap(({ metrics }) =>
          metrics.flatMap(({ value, note }) => [value, note]),
        )
        .join(' ');
      assert.doesNotMatch(text, /NaN|Infinity/, weapon.name);
    }
  }
});
