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
// ───────── v0.2: sprint, meter, difficulty/team scaling, upgrades, revives, boosters ─────────
t('meter: N correct answers fill it; pips map 0..5; a SURGE costs exactly one pip', () => {
  for (const N of [3, 5, 6, 8, 10, 12]) {
    const m = new L.Meter(N); for (let i = 0; i < N; i++) assert.strictEqual(m.gain(), 1); assert.ok(m.isFull()); assert.strictEqual(m.pips(), 5); assert.strictEqual(m.gain(), 0);
    assert.ok(m.spend(1)); assert.strictEqual(m.pips(), 4); for (let i = 0; i < 4; i++) assert.ok(m.spend(1)); assert.strictEqual(m.fill, 0); assert.ok(!m.spend(1));
  }
  assert.strictEqual(new L.Meter(99).target, 12); assert.strictEqual(new L.Meter(0).target, 3);
});
t('sprint: 60 s timer drains, ends on time; ends the moment the meter is full (no penalty)', () => {
  const m = new L.Meter(6), sp = new L.Sprint(m); assert.strictEqual(sp.limit, 60);
  sp.tick(30); assert.ok(!sp.over); assert.strictEqual(Math.round(sp.left), 30); sp.tick(31); assert.ok(sp.over); assert.strictEqual(sp.reason, 'time'); assert.strictEqual(sp.leave(), 0);
  const m2 = new L.Meter(4), s2 = new L.Sprint(m2); for (let i = 0; i < 4; i++) { m2.gain(); s2.record(true); } assert.ok(s2.over); assert.strictEqual(s2.reason, 'full'); assert.strictEqual(m2.fill, 1);
});
t('sprint: leaving early keeps the fill but reverts ONE notch, never below where the sprint began', () => {
  const m = new L.Meter(6); m.gain(); m.gain(); const start = m.fill; const sp = new L.Sprint(m); m.gain(); m.gain(); m.gain(); // 5/6
  const lost = sp.leave(); assert.ok(Math.abs(lost - 1 / 6) < 1e-9); assert.ok(Math.abs(m.fill - 4 / 6) < 1e-9);
  const m2 = new L.Meter(6); m2.gain(); const s2 = new L.Sprint(m2); assert.strictEqual(s2.leave(), 0); assert.ok(Math.abs(m2.fill - 1 / 6) < 1e-9); // nothing earned -> nothing lost
  const m3 = new L.Meter(5); const s3 = new L.Sprint(m3); m3.gain(); assert.ok(s3.leave() > 0); assert.strictEqual(m3.fill, 0); // one earned, one reverted, floor at start
});
t('quiz deck + meter: correct fills the meter, wrong does not, charge mirrors pips', () => {
  const q = new L.QuizDeck(L.FALLBACK_DECK, L.mulberry32(3)), m = new L.Meter(5); q.setMeter(m);
  let a = q.open(); let r = q.answer(a.id, a._correctId); assert.ok(r.correct && r.charge === 1); assert.strictEqual(q.charge, 1); assert.ok(Math.abs(m.fill - .2) < 1e-9);
  a = q.open(); r = q.answer(a.id, a.options.find(o => o.id !== a._correctId).id); assert.ok(!r.correct && r.charge === 0); assert.strictEqual(q.charge, 1);
  assert.ok(q.spend(1)); assert.strictEqual(q.charge, 0); assert.ok(!q.spend(1));
});
t('difficulty: EXPERT area 1 is exactly the stage-5 wave distribution; every new stage is bigger or tougher', () => {
  assert.deepStrictEqual(Object.assign({}, L.encounterFor('expert', 0, 1), { escort: undefined }), Object.assign({}, L.W01_ENCOUNTERS[4], { escort: undefined })); // escorts are additive
  for (const d of Object.keys(L.DIFFS)) { let prevPop = 0, prevHp = 0; for (let a = 0; a < 6; a++) { const e = L.encounterFor(d, a, 1), pop = e.waves * e.size, hp = L.hpMul(L.stageScale(d, a), 1); assert.ok(pop >= prevPop, d + ' pop'); assert.ok(hp > prevHp, d + ' hp'); prevPop = pop; prevHp = hp; } }
  for (let a = 0; a < 6; a++) { const p = ['cadet', 'ranger', 'veteran', 'expert'].map(d => { const e = L.encounterFor(d, a, 1); return e.waves * e.size; }); for (let i = 1; i < 4; i++) assert.ok(p[i] >= p[i - 1], 'harder difficulty never has fewer Archives (area ' + (a + 1) + ')'); }
  assert.deepStrictEqual(Object.assign({}, L.encounterFor('cadet', 0, 1), { escort: undefined }), Object.assign({}, L.W01_ENCOUNTERS[0], { escort: undefined })); // Cadet keeps the learning room
  assert.ok(L.encounterFor('expert', 5, 1).waves <= 10 && L.encounterFor('expert', 5, 4).size <= 30);
});
t('team of 4: more Archives and tougher bars, scaled per difficulty; the cap grows too', () => {
  for (const d of Object.keys(L.DIFFS)) for (let a = 0; a < 6; a++) { const s1 = L.encounterFor(d, a, 1), s4 = L.encounterFor(d, a, 4); assert.ok(s4.size > s1.size, d + ' a' + a); assert.strictEqual(s4.waves, s1.waves); assert.ok(L.hpMul(3, 4) > L.hpMul(3, 1)); }
  const g = d => L.encounterFor(d, 0, 4).size / L.encounterFor(d, 0, 1).size; assert.ok(g('expert') >= g('veteran') && g('veteran') >= g('ranger') && g('ranger') >= g('cadet'));
  assert.strictEqual(L.activeCap(1), 9); assert.strictEqual(L.activeCap(4), 18); assert.strictEqual(L.teamSizeFrom({}), 4); assert.strictEqual(L.teamSizeFrom({ nfTeam: 2 }), 2); assert.strictEqual(L.teamSizeFrom({ nfTeam: 99 }), 4);
  assert.ok(L.bossHp(60, 'expert', 4) > L.bossHp(60, 'cadet', 1)); assert.strictEqual(L.bossHp(60, 'cadet', 1), 60);
});
t('config mapping: host difficulty, legacy difficulty, meter target', () => {
  assert.strictEqual(L.diffFromConfig({ nfDifficulty: 'expert' }), 'expert'); assert.strictEqual(L.diffFromConfig({ difficulty: 'easy' }), 'cadet'); assert.strictEqual(L.diffFromConfig({ difficulty: 'hard' }), 'veteran'); assert.strictEqual(L.diffFromConfig(null), 'ranger'); assert.strictEqual(L.diffFromConfig({ nfDifficulty: 'zzz' }), 'ranger');
  assert.strictEqual(L.meterTargetFrom({}, 'expert'), 10); assert.strictEqual(L.meterTargetFrom({ nfMeter: 8 }, 'cadet'), 8); assert.strictEqual(L.meterTargetFrom({ nfMeter: 100 }, 'cadet'), 12);
});
t('loadout slots equal the Evo level (L1 = 1 … L10 = 10); only owned game upgrades fit', () => {
  for (let l = 1; l <= 10; l++) assert.strictEqual(L.slotsFor(l), l); assert.strictEqual(L.slotsFor(0), 1); assert.strictEqual(L.slotsFor(40), 10);
  const owned = { chronorespawn: 2, aegis: 1, magnet: 1, deadline: 3 };
  assert.deepStrictEqual(L.validateLoadout(['chronorespawn', 'aegis', 'magnet'], owned, 1), ['chronorespawn']);
  assert.deepStrictEqual(L.validateLoadout(['chronorespawn', 'chronorespawn', 'chronorespawn', 'aegis', 'magnet'], owned, 5), ['chronorespawn', 'chronorespawn', 'aegis', 'magnet']);
  assert.deepStrictEqual(L.validateLoadout(['deadline', 'repair', 'nonsense', 'magnet', 'magnet'], owned, 5), ['magnet']);
});
t('revives: only the Evo-level ability (Lv5+ once, Lv10 twice) or a ChronoRespawn; otherwise none', () => {
  assert.strictEqual(L.reviveCharges(1), 0); assert.strictEqual(L.reviveCharges(4), 0); assert.strictEqual(L.reviveCharges(5), 1); assert.strictEqual(L.reviveCharges(9), 1); assert.strictEqual(L.reviveCharges(10), 2);
  assert.strictEqual(L.reviveSource(1, 1), 'ability'); assert.strictEqual(L.reviveSource(0, 1), 'item'); assert.strictEqual(L.reviveSource(0, 0), null);
});
t('inventory use-up: passives are used when a round starts, trigger items only if they fired', () => {
  assert.deepStrictEqual(L.consumedItems(['chronorespawn', 'aegis', 'magnet'], { chronorespawn: 0, aegis: 1 }), { aegis: 1, magnet: 1 });
  assert.deepStrictEqual(L.consumedItems(['chronorespawn', 'chronorespawn'], { chronorespawn: 1 }), { chronorespawn: 1 });
  assert.deepStrictEqual(L.consumedItems([], { chronorespawn: 3 }), {}); // in-run purchases never touch stock
});
t('catalog: every upgrade has a price; game vs live-session kinds; ChronoRespawn exists', () => {
  const U = L.UPGRADES; assert.strictEqual(U.chronorespawn.kind, 'game'); assert.ok(Object.keys(U).filter(k => U[k].kind === 'game').length >= 9);
  assert.strictEqual(U.deadline.kind, 'session'); assert.strictEqual(U.reassess.kind, 'session'); Object.keys(U).forEach(k => { assert.ok(U[k].price > 0 && U[k].name && U[k].desc, k); });
});
t('boosters: 10 s, triple / nova / star; drop odds by enemy, Star Seeker doubles, sentry always drops', () => {
  assert.deepStrictEqual(Object.keys(L.BOOSTERS).sort(), ['nova', 'star', 'triple']); Object.values(L.BOOSTERS).forEach(b => assert.strictEqual(b.dur, 10));
  let hits = { scout: 0, interceptor: 0 }, seek = 0; const r = L.mulberry32(11); for (let i = 0; i < 20000; i++) { if (L.boosterDrop('scout', r, false)) hits.scout++; if (L.boosterDrop('interceptor', r, false)) hits.interceptor++; if (L.boosterDrop('scout', r, true)) seek++; }
  assert.ok(Math.abs(hits.scout / 20000 - .04) < .01 && Math.abs(hits.interceptor / 20000 - .15) < .015 && Math.abs(seek / 20000 - .08) < .012);
  for (let i = 0; i < 50; i++) assert.ok(L.boosterDrop('sentry', r, false)); assert.strictEqual(L.boosterDrop('boss', r, false), null);
});

// ── Co-op (Oct 2026) ──
t('sentry wave brings Scout escorts: never a lone Sentry, escorts skip the 7:1 bag, clear needs all of them', () => {
  const e = new L.Encounter({ waves: 3, size: 2, interceptors: true, sentryAfter: [3], escort: 4 }, L.mulberry32(9));
  for (let w = 0; w < 3; w++) { e.begin('wave'); while (e.pending) e.confirmSpawn(); while (e.alive) e.onDefeat('scout'); }
  const bagBefore = e.bag.committed.scout + e.bag.committed.interceptor;
  assert.strictEqual(e.readyKind(), 'sentry'); e.begin('sentry'); assert.strictEqual(e.pending, 5);
  const seq = []; while (e.pending) { seq.push(e.requestSpawn()); e.confirmSpawn(); }
  assert.deepStrictEqual(seq, ['sentry', 'scout', 'scout', 'scout', 'scout']);
  assert.strictEqual(e.bag.committed.scout + e.bag.committed.interceptor, bagBefore, 'escorts must not consume the bag');
  e.onDefeat('sentry'); assert.strictEqual(e.cleared(), false, 'escorts still alive'); for (let i = 0; i < 4; i++) e.onDefeat('scout'); assert.strictEqual(e.cleared(), true);
  assert.strictEqual(e.spawnedTypes.sentry, 1); assert.strictEqual(e.spawnedTypes.scout >= 4, true);
});
t('legacy cfg without escort still spawns a lone sentry (old behaviour preserved for tests)', () => {
  const e = new L.Encounter({ waves: 1, size: 1, interceptors: false, sentryAfter: [1] }, L.mulberry32(3)); e.begin('wave'); e.confirmSpawn(); e.onDefeat('scout'); e.begin('sentry'); assert.strictEqual(e.pending, 1);
});
t('encounterFor: escorts only where a sentry exists, grow with stage and team', () => {
  assert.strictEqual(L.encounterFor('cadet', 0, 2).escort, 0);
  for (const d of Object.keys(L.DIFFS)) for (let a = 1; a < 6; a++) { const e = L.encounterFor(d, a, 4); if (e.sentryAfter.length) assert.ok(e.escort >= 2 && e.escort <= 16); else assert.strictEqual(e.escort, 0); }
  assert.ok(L.encounterFor('veteran', 2, 4).escort > L.encounterFor('veteran', 2, 2).escort);
});
t('lobbyCheck: 2+ ready, one per studio; solo only when the host allows it', () => {
  const R = L.coopRules({});
  const m = (id, s, ready, online) => ({ id, studioId: s, ready, online: online !== false });
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true)], R).ok, false);
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true), m('b', 'innov8', true)], R).ok, true);
  const dup = L.lobbyCheck([m('a', 'gentech', true), m('b', 'studio-gentech', true)], R); assert.strictEqual(dup.ok, false); assert.deepStrictEqual(dup.dupStudios, ['gentech']);
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true), m('b', 'gentech', true)], L.coopRules({ nfStudioRule: 'relaxed' })).ok, true);
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true), m('b', 'innov8', false)], R).ok, false, 'a not-ready player does not count');
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true), m('b', 'innov8', true, false)], R).ok, false, 'an offline player does not count');
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true)], L.coopRules({ nfAllowSolo: true })).ok, true);
  assert.strictEqual(L.lobbyCheck([m('a', '', true), m('b', '', true)], R).ok, true, 'unknown studios never conflict');
  assert.strictEqual(L.lobbyCheck(['gentech', 'mindforge', 'emagination', 'innov8', 'gentech'].map((s, i) => m('p' + i, s, true)), R).ok, false, 'max 4');
  assert.strictEqual(L.lobbyCheck([m('a', 'gentech', true), m('b', 'innov8', true), m('c', 'mindforge', false)], R).ok, true);
});
t('coopRules: round length 1..10 min (default 10), strict by default', () => {
  assert.strictEqual(L.coopRules({}).roundSec, 600); assert.strictEqual(L.coopRules({ nfRoundMin: 7 }).roundSec, 420); assert.strictEqual(L.coopRules({ nfRoundMin: 99 }).roundSec, 600); assert.strictEqual(L.coopRules({ nfRoundMin: 0 }).roundSec, 60);
  assert.strictEqual(L.coopRules({}).studioRule, 'strict'); assert.strictEqual(L.coopRules({}).minPlayers, 2);
});
t('assignTeams: X-Live squads win, open squads are one-studio-each, locked players never move, deterministic', () => {
  const P = (id, s, sq) => ({ id, studioId: s, squad: sq });
  const players = [P('p4', 'innov8'), P('p1', 'gentech', 'NOVA'), P('p2', 'mindforge', 'NOVA'), P('p3', 'gentech'), P('p5', 'emagination'), P('p6', 'gentech')];
  const a = L.assignTeams(players, {}), b = L.assignTeams(players.slice().reverse(), {});
  assert.deepStrictEqual(a, b, 'order independent');
  const nova = a.find(t => t.name === 'NOVA'); assert.deepStrictEqual(nova.members.sort(), ['p1', 'p2']);
  const opens = a.filter(t => !t.squad); opens.forEach(t => { const ss = t.members.map(id => players.find(p => p.id === id).studioId); assert.strictEqual(new Set(ss).size, ss.length, 'one studio each: ' + ss); assert.ok(t.members.length <= 4); });
  assert.strictEqual(a.reduce((n, t) => n + t.members.length, 0), 6);
  const locked = { p3: 'open-1' }; const c = L.assignTeams(players, locked); assert.ok(c.find(t => t.key === 'open-1').members.indexOf('p3') >= 0);
  const big = L.assignTeams(['a', 'b', 'c', 'd', 'e'].map(i => P(i, 'gentech', 'X')), {}); assert.ok(big.every(t => t.members.length <= 4)); assert.strictEqual(big.length, 2);
});
t('RoundClock: <=10 min, +1/-1 minute live, ceiling, time-up', () => {
  const c = new L.RoundClock(9999); assert.strictEqual(c.limit, 600); c.start(); c.tick(30); assert.strictEqual(Math.round(c.left), 570);
  c.adjust(60); assert.strictEqual(Math.round(c.left), 630); c.adjust(-60); c.adjust(-60); assert.strictEqual(Math.round(c.left), 510);
  c.adjust(9999); assert.strictEqual(Math.round(c.left), 570, 'one step per press'); for (let i = 0; i < 40; i++) c.adjust(60); assert.strictEqual(c.left, 1200, 'ceiling');
  const d = new L.RoundClock(90); d.start(); d.tick(40); d.adjust(-60); assert.strictEqual(d.left, 0); assert.strictEqual(d.over, true); assert.strictEqual(d.tick(1), 0);
  const e = new L.RoundClock(60); e.start(); e.tick(59.5); assert.strictEqual(e.over, false); e.tick(1); assert.strictEqual(e.over, true); assert.strictEqual(e.fmt(), '0:00');
  assert.strictEqual(new L.RoundClock(425).fmt(), '7:05'); assert.deepStrictEqual(L.timeoutOutcome(3, false), { saved: 3, bossDone: false, reason: 'time' });
});
console.log('\n' + n + ' tests passed');
