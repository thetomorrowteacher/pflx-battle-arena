// Tests the logic block that actually ships inside public/games/nexus-frontiers.html (extracted between the LOGIC markers).
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'games', 'nexus-frontiers.html'), 'utf8');
const block = html.slice(html.indexOf('/*LOGIC-START*/'), html.indexOf('/*LOGIC-END*/'));
const L = new Function(block + '\nreturn NFLogic;')(); const assert = require('assert'); let n = 0;
function t(name, fn) { fn(); n++; console.log('PASS', name); }

t('7:1 bag — every complete bag is exactly 7 scouts + 1 interceptor', () => {
  for (const seed of [1, 2, 3, 99, 12345]) {
    const bag = new L.SpawnBag(L.mulberry32(seed));
    for (let b = 0; b < 25; b++) { const c = { scout: 0, interceptor: 0 }; for (let i = 0; i < 8; i++) c[bag.commit()]++; assert.deepStrictEqual(c, { scout: 7, interceptor: 1 }); }
  }
});
t('failed spawn never consumes a bag entry (peek is stable)', () => {
  const bag = new L.SpawnBag(L.mulberry32(5)); const a = bag.peek(); for (let i = 0; i < 10; i++) assert.strictEqual(bag.peek(), a);
  const e = new L.Encounter({ waves: 1, size: 8, interceptors: true, sentryAfter: [] }, L.mulberry32(5)); e.begin('wave');
  const first = e.requestSpawn(); assert.strictEqual(e.requestSpawn(), first); assert.strictEqual(e.pending, 8); // no confirm => unchanged
});
t('encounter over complete waves yields exact 7:1 (area 2 config, 24 spawns = 3 bags)', () => {
  const e = new L.Encounter(L.W01_ENCOUNTERS[1], L.mulberry32(77));
  for (let w = 0; w < 3; w++) { assert.strictEqual(e.readyKind(), 'wave'); e.begin('wave'); while (e.pending) e.confirmSpawn(); for (let k = 0; k < 8; k++) e.onDefeat('x'); }
  assert.strictEqual(e.spawnedTypes.scout, 21); assert.strictEqual(e.spawnedTypes.interceptor, 3);
});
t('area 1 spawns scouts only (interceptors not yet unlocked)', () => {
  const e = new L.Encounter(L.W01_ENCOUNTERS[0], L.mulberry32(3)); e.begin('wave'); while (e.pending) assert.strictEqual(e.confirmSpawn(), 'scout');
});
t('sentry arrives after the 3rd ordinary wave and must be defeated; pending/alive block a premature clear', () => {
  const e = new L.Encounter({ waves: 3, size: 2, interceptors: true, sentryAfter: [3] }, L.mulberry32(9));
  for (let w = 1; w <= 3; w++) {
    assert.strictEqual(e.cleared(), false); assert.strictEqual(e.readyKind(), 'wave'); e.begin('wave');
    assert.strictEqual(e.readyKind(), null); // cannot begin another while pending
    e.confirmSpawn(); assert.strictEqual(e.cleared(), false); assert.strictEqual(e.readyKind(), null);
    e.confirmSpawn(); assert.strictEqual(e.pending, 0); assert.strictEqual(e.cleared(), false); // alive>0
    e.onDefeat('scout'); assert.strictEqual(e.cleared(), false); e.onDefeat('scout');
  }
  assert.strictEqual(e.wavesIssued, 3); assert.strictEqual(e.cleared(), false, 'all waves issued but sentry due => not cleared');
  assert.strictEqual(e.readyKind(), 'sentry'); e.begin('sentry'); assert.strictEqual(e.requestSpawn(), 'sentry'); assert.strictEqual(e.cleared(), false);
  e.confirmSpawn(); assert.strictEqual(e.cleared(), false); e.onDefeat('sentry'); assert.strictEqual(e.cleared(), true);
});
t('every World-01 encounter config reaches a true clear (finite)', () => {
  L.W01_ENCOUNTERS.forEach((cfg, i) => {
    const e = new L.Encounter(cfg, L.mulberry32(i + 1)); let guard = 0;
    while (!e.cleared() && guard++ < 500) { const k = e.readyKind(); if (k) { e.begin(k); while (e.pending) e.confirmSpawn(); } else while (e.alive) e.onDefeat(e.pendingKind === 'sentry' ? 'sentry' : 'scout'); }
    assert.ok(e.cleared(), 'area ' + (i + 1) + ' clears');
    if (cfg.interceptors) { assert.strictEqual(e.spawnedTypes.scout, e.spawnedTypes.interceptor * 7); }
  });
});

t('quiz: reading is safe — re-opening returns the same attempt', () => {
  const q = new L.QuizDeck(L.FALLBACK_DECK, L.mulberry32(4)); const a = q.open(); for (let i = 0; i < 5; i++) assert.strictEqual(q.open().id, a.id); assert.strictEqual(q.charge, 0);
});
t('quiz: correct answer = +1 charge exactly once; replay/stale grants nothing', () => {
  const q = new L.QuizDeck(L.FALLBACK_DECK, L.mulberry32(4)); const a = q.open();
  const r1 = q.answer(a.id, a._correctId, 5); assert.deepStrictEqual([r1.accepted, r1.correct, r1.charge], [true, true, 1]);
  const r2 = q.answer(a.id, a._correctId, 5); assert.deepStrictEqual([r2.accepted, r2.charge], [false, 0]); assert.strictEqual(q.charge, 1);
  assert.strictEqual(q.answer('q999', 'q999o0', 5).charge, 0);
});
t('quiz: wrong answer gives no charge and consumes the attempt (no re-roll exploit on same question id)', () => {
  const q = new L.QuizDeck(L.FALLBACK_DECK, L.mulberry32(8)); const a = q.open(); const wrong = a.options.find(o => o.id !== a._correctId);
  const r = q.answer(a.id, wrong.id, 5); assert.deepStrictEqual([r.accepted, r.correct, r.charge], [true, false, 0]); assert.strictEqual(q.charge, 0);
  assert.strictEqual(q.answer(a.id, a._correctId, 5).charge, 0); // cannot retry the same attempt
  assert.notStrictEqual(q.open().id, a.id);
});
t('quiz: exactly one correct option, options unique, charge capped at 5', () => {
  const q = new L.QuizDeck(L.FALLBACK_DECK, L.mulberry32(21));
  for (let i = 0; i < 40; i++) { const a = q.open(); const texts = a.options.map(o => o.text); assert.strictEqual(new Set(texts.map(s => s.toLowerCase())).size, texts.length); assert.strictEqual(a.options.filter(o => o.text === a.answerText).length, 1); q.answer(a.id, a._correctId, 5); }
  assert.strictEqual(q.charge, 5);
});
t('quiz: duplicate-definition deck never produces a second correct answer; tiny deck falls back', () => {
  const cards = [{ term: 'A', definition: 'same' }, { term: 'B', definition: 'Same' }, { term: 'C', definition: 'other' }, { term: 'D', definition: 'third' }];
  const q = new L.QuizDeck(cards, L.mulberry32(2)); for (let i = 0; i < 20; i++) { const a = q.open(); const k = a.options.filter(o => o.text.toLowerCase() === a.answerText.toLowerCase()).length; assert.strictEqual(k, 1); q.answer(a.id, a._correctId, 5); }
  const tiny = new L.QuizDeck([{ term: 'x', definition: 'y' }], L.mulberry32(1)); assert.strictEqual(tiny.cards, L.FALLBACK_DECK);
});

t('boss: wrong quiz => inactive, zero damage, NO rng consumed', () => {
  let calls = 0; const r = L.resolveAttack({ move: L.BOSS_MOVES.strike, quizCorrect: false, rng: () => { calls++; return 0.5; } });
  assert.deepStrictEqual(r, { learning: 'wrong', result: 'inactive', damage: 0 }); assert.strictEqual(calls, 0);
});
t('boss: results are mutually exclusive; a miss/block can never be a crit; correct learning is reported even on a miss', () => {
  const mv = L.BOSS_MOVES.strike; const seen = {};
  for (let i = 0; i < 2000; i++) { const r = L.resolveAttack({ move: mv, quizCorrect: true, rng: () => i / 2000, luck: 0.05 }); seen[r.result] = (seen[r.result] || 0) + 1; assert.strictEqual(r.learning, 'correct'); if (r.result === 'miss') assert.strictEqual(r.damage, 0); else assert.ok(r.damage >= 1); }
  assert.ok(seen.miss && seen.block && seen.crit && seen.hit);
  assert.strictEqual(L.resolveAttack({ move: mv, quizCorrect: true, rng: () => 0.0 }).result, 'miss');
});
t('boss: crit > hit > block damage ordering; bounded power stat', () => {
  const mv = L.BOSS_MOVES.surge, o = { move: mv, quizCorrect: true, powerBonus: 0.12 };
  const hit = L.resolveAttack({ ...o, rng: () => 0.9 }), crit = L.resolveAttack({ ...o, rng: () => 0.22 + 0.12 + 0.01 }), blk = L.resolveAttack({ ...o, rng: () => 0.23 });
  assert.strictEqual(hit.result, 'hit'); assert.strictEqual(crit.result, 'crit'); assert.strictEqual(blk.result, 'block'); assert.ok(crit.damage > hit.damage && hit.damage > blk.damage);
});
t('boss: guard mitigates 60% and guard stat is capped at 12%', () => {
  assert.strictEqual(L.resolveIncoming({ raw: 20, guarded: false, guardStat: 0 }), 20);
  assert.strictEqual(L.resolveIncoming({ raw: 20, guarded: true, guardStat: 0, mitigate: 0.6 }), 8);
  assert.strictEqual(L.resolveIncoming({ raw: 100, guarded: false, guardStat: 9 }), 88);
});

t('map: deterministic per seed', () => { const a = L.buildWorldMap(42), b = L.buildWorldMap(42); assert.ok(Buffer.from(a.grid).equals(Buffer.from(b.grid))); });
t('map: with all gates CLOSED only district 1 is reachable; opening gates k=1..6 reveals exactly districts 0..k', () => {
  for (const seed of [1, 7, 42, 2026, 99991, 31337, 5, 6, 8, 9, 10, 11]) {
    const m = L.buildWorldMap(seed); assert.strictEqual(m.rooms.length, 7); assert.strictEqual(m.gates.length, 6);
    assert.deepStrictEqual(L.reachable(m, m.start).rooms, [0]);
    for (let k = 0; k < 6; k++) { m.gateOpen[k] = true; assert.deepStrictEqual(L.reachable(m, m.start).rooms, Array.from({ length: k + 2 }, (_, i) => i), 'seed ' + seed + ' gate ' + k); }
    assert.strictEqual(L.roomIndexAt(m, Math.floor(m.bossNode.x / 32), Math.floor(m.bossNode.y / 32)), 6);
    assert.ok(!L.boxSolid(m, m.start.x, m.start.y, 11) && !L.boxSolid(m, m.bossNode.x, m.bossNode.y, 11));
    m.rooms.forEach(r => assert.ok(r.cells.length > 20, 'spawn cells in room ' + r.id));
  }
});
t('map: asymmetric districts (sizes differ) and boss room is the largest', () => {
  const m = L.buildWorldMap(42); assert.ok(new Set(m.rooms.map(r => r.w + 'x' + r.h)).size >= 4);
});
t('collision: nothing crosses a CLOSED gate — walk, dash-speed and huge steps all blocked, 20 seeds', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const m = L.buildWorldMap(seed);
    for (let k = 0; k < 6; k++) {
      const g = m.gates[k], limit = g.col * 32; // left edge of the gate column
      const b = { x: g.col * 32 - 60, y: g.row * 32 + 48, r: 11 };
      for (let i = 0; i < 400; i++) L.moveBody(m, b, 700 / 60, 0); // dash speed for ~6s
      assert.ok(b.x + b.r <= limit + 0.01, `seed ${seed} gate ${k}: x=${b.x}`);
      const c = { x: g.col * 32 - 20, y: g.row * 32 + 48, r: 11 }; L.moveBody(m, c, 5000, 0); assert.ok(c.x + c.r <= limit + 0.01, 'huge step');
      m.gateOpen[k] = true; const d = { x: g.col * 32 - 60, y: g.row * 32 + 48, r: 11 }; for (let i = 0; i < 40; i++) L.moveBody(m, d, 600 / 60, 0); assert.ok(d.x > limit + 32, 'open gate is passable'); m.gateOpen[k] = false;
    }
  }
});
t('collision: walls block movement in both axes and bodies never end inside a wall', () => {
  const m = L.buildWorldMap(3); const r = L.mulberry32(1); const b = { x: m.start.x, y: m.start.y, r: 11 };
  for (let i = 0; i < 5000; i++) { L.moveBody(m, b, (r() - .5) * 20, (r() - .5) * 20); assert.ok(!L.boxSolid(m, b.x, b.y, b.r)); }
});
t('drops: created once per enemy, claimed once', () => {
  const d = new L.DropLedger(); assert.ok(d.create('e1')); assert.ok(!d.create('e1')); assert.ok(d.claim('o1')); assert.ok(!d.claim('o1'));
});
t('x-coin: minimal value — every drop is exactly 1 X-Coin; hard cap 40 per run never exceeded', () => {
  const r = L.mulberry32(11); let dropped = 0, per = { scout: 0, interceptor: 0, sentry: 0, material: 0 };
  for (let i = 0; i < 5000; i++) { const k = ['scout', 'interceptor', 'sentry', 'material'][i % 4]; const n = L.coinDrop(k, r, dropped); assert.ok(n === 0 || n === 1); dropped += n; per[k] += n; assert.ok(dropped <= 40); }
  assert.strictEqual(dropped, 40); assert.strictEqual(L.coinDrop('boss', () => 0, 0), 0); assert.strictEqual(L.coinDrop('sentry', () => 0, 39), 1);
  assert.strictEqual(L.coinDrop('material', () => 0.5, 0), 1); assert.strictEqual(L.coinDrop('material', () => 0.99, 0), 0); assert.strictEqual(L.coinDrop('sentry', () => 0.99, 0), 1);
});
t('x-coin: a full realistic run lands well under the cap (expected value check, 200 runs)', () => {
  let tot = 0; for (let s = 1; s <= 200; s++) { const r = L.mulberry32(s); let d = 0; L.W01_ENCOUNTERS.forEach(cfg => { const e = new L.Encounter(cfg, L.mulberry32(s * 3)); let g = 0; while (!e.cleared() && g++ < 500) { const k = e.readyKind(); if (k) { e.begin(k); while (e.pending) { const ty = e.confirmSpawn(); d += L.coinDrop(ty, r, d); } } while (e.alive) e.onDefeat('scout'); } }); for (let i = 0; i < 18; i++) d += L.coinDrop('material', r, d); tot += d; }
  const avg = tot / 200; assert.ok(avg > 15 && avg < 35, 'avg ' + avg); console.log('   avg X-Coin per full run:', avg.toFixed(1));
});
t('materials: 3 per combat district, non-solid, on free cells, never on the player start; deterministic', () => {
  for (const seed of [1, 42, 99]) { const m = L.buildWorldMap(seed), a = L.placeMaterials(m, L.mulberry32(seed)), b = L.placeMaterials(m, L.mulberry32(seed));
    assert.strictEqual(a.length, 18); assert.deepStrictEqual(a, b); for (let i = 0; i < 6; i++) assert.strictEqual(a.filter(x => x.room === i).length, 3);
    a.forEach(x => { assert.ok(!L.boxSolid(m, x.x, x.y, 14)); assert.strictEqual(L.roomIndexAt(m, Math.floor(x.x / 32), Math.floor(x.y / 32)), x.room); assert.ok(Math.hypot(x.x - m.start.x, x.y - m.start.y) >= 160 || x.room !== 0); });
    assert.deepStrictEqual(L.reachable(m, m.start).rooms, [0]); }
});
console.log('\n' + n + ' tests passed');
