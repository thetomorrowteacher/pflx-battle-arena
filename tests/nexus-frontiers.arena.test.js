// Tests the Arena-side half of Nexus Frontiers v0.2 (market, inventory, team progress, host settings) against the shipped public/preview.html
// and checks it agrees with the shipped cartridge (public/games/nexus-frontiers.html). Run: node tests/nexus-frontiers.arena.test.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const pub = path.join(__dirname, '..', 'public');
const arena = fs.readFileSync(path.join(pub, 'preview.html'), 'utf8'), game = fs.readFileSync(path.join(pub, 'games', 'nexus-frontiers.html'), 'utf8');
let n = 0; function t(name, fn) { return Promise.resolve().then(fn).then(() => { n++; console.log('PASS', name); }); }
const a0 = arena.indexOf('// ═══ NEXUS FRONTIERS — market'), a1 = arena.indexOf('// ═══ ARENA GAME CARTRIDGE LAUNCHER');
assert.ok(a0 > 0 && a1 > a0, 'Nexus Frontiers block found in preview.html');
const block = arena.slice(a0, a1);
const L = new Function(game.slice(game.indexOf('/*LOGIC-START*/'), game.indexOf('/*LOGIC-END*/')) + '\nreturn NFLogic;')();
function harness() {
  const db = {}, sent = [], awards = []; const env = {
    state: { player: { id: 'p1', xc: 100 } }, arenaGame: { open: true, frame: { contentWindow: { postMessage: m => sent.push(m) } }, opts: { sessionId: 's1' } },
    baSessions: { byId: id => id === 's1' ? { id: 's1', seasonMode: true, seasonId: 'fall' } : null },
    supabaseLoad: async k => db[k] === undefined ? null : JSON.parse(JSON.stringify(db[k])), supabaseSave: async (k, v) => { if (env.failSave) return false; db[k] = JSON.parse(JSON.stringify(v)); return true; },
    exoSpend: (amt) => { if (env.state.player.xc < amt) return false; env.state.player.xc -= amt; return true; }, arenaPostAward: (pid, a) => awards.push(a)
  };
  const f = new Function('env', 'with (env) {' + block + '\n return { NF_MARKET, nfMergeTeam, nfApplyConsumed, nfScopeFor, nfHandleBuy, nfHandleSave, nfLoadState, nfClamp }; }')(env);
  return { f, db, sent, awards, env };
}
(async () => {
  await t('prices in the Arena match the cartridge catalog exactly (and every cartridge upgrade is for sale)', () => {
    const h = harness(); Object.keys(L.UPGRADES).forEach(k => assert.strictEqual(h.f.NF_MARKET[k], L.UPGRADES[k].price, k)); assert.deepStrictEqual(Object.keys(h.f.NF_MARKET).sort(), Object.keys(L.UPGRADES).sort());
  });
  await t('scope: season sessions share ONE team record; plain sessions, games and solo are separate', () => {
    const h = harness(); assert.strictEqual(h.f.nfScopeFor({ sessionId: 's1' }, 'p1'), 'season_fall'); assert.strictEqual(h.f.nfScopeFor({ sessionId: 'zz' }, 'p1'), 'sess_zz');
    assert.strictEqual(h.f.nfScopeFor({ gameId: 'g9' }, 'p1'), 'game_g9'); assert.strictEqual(h.f.nfScopeFor(null, 'p1'), 'solo_p1');
  });
  await t('team progress: checkpoints only move forward; a boss win closes the cycle; runs and bests are tracked per player', () => {
    const { f } = harness(); let tm = f.nfMergeTeam(null, { cleared: 2, final: false, score: 300, pid: 'a' }); assert.strictEqual(tm.cleared, 2); assert.strictEqual(tm.runs, 0);
    tm = f.nfMergeTeam(tm, { cleared: 1, final: true, score: 100, pid: 'b' }); assert.strictEqual(tm.cleared, 2); assert.strictEqual(tm.runs, 1); assert.strictEqual(tm.best, 300);
    tm = f.nfMergeTeam(tm, { cleared: 5, final: true, score: 900, pid: 'a' }); assert.strictEqual(tm.cleared, 5); assert.deepStrictEqual(tm.byPlayer.a, { runs: 1, best: 900 });
    tm = f.nfMergeTeam(tm, { cleared: 6, bossDone: true, final: true, score: 1500, pid: 'c' }); assert.strictEqual(tm.cleared, 0); assert.strictEqual(tm.clears, 1);
    tm = f.nfMergeTeam(tm, { cleared: 99, final: false, score: 1e12, pid: 'a' }); assert.strictEqual(tm.cleared, 6); assert.strictEqual(tm.best, 1000000); // clamped
    const big = {}; for (let i = 0; i < 80; i++) big['x' + i] = { runs: i, best: i }; tm = f.nfMergeTeam({ byPlayer: big }, { cleared: 0, final: true, score: 1, pid: 'new' }); assert.ok(Object.keys(tm.byPlayer).length <= 60);
  });
  await t('used-up items: only known ids, never below zero', () => {
    const { f } = harness(); assert.deepStrictEqual(f.nfApplyConsumed({ aegis: 2, magnet: 1 }, { aegis: 1, magnet: 5, hax: 3 }), { aegis: 1 }); assert.deepStrictEqual(f.nfApplyConsumed(null, { aegis: 1 }), {});
  });
  await t('buying: charges X-Coin through exoSpend, stores stock, replies with the confirmed state', async () => {
    const h = harness(); await h.f.nfHandleBuy('chronorespawn'); assert.strictEqual(h.env.state.player.xc, 75); assert.deepStrictEqual(h.db.pflx_nf_p_p1.owned, { chronorespawn: 1 });
    const r = h.sent.pop(); assert.strictEqual(r.type, 'pflx_arena_nf_state'); assert.strictEqual(r.xc, 75); assert.deepStrictEqual(r.owned, { chronorespawn: 1 });
  });
  await t('buying: unknown item, too poor, over the stock limit, and a failed save (refunded) never leave a half-purchase', async () => {
    const h = harness(); await h.f.nfHandleBuy('hax'); assert.ok(h.sent.pop().error); assert.strictEqual(h.env.state.player.xc, 100);
    h.env.state.player.xc = 3; await h.f.nfHandleBuy('aegis'); assert.ok(h.sent.pop().error); assert.ok(!h.db.pflx_nf_p_p1);
    h.env.state.player.xc = 500; h.db.pflx_nf_p_p1 = { owned: { aegis: 9 } }; await h.f.nfHandleBuy('aegis'); assert.ok(/maximum/.test(h.sent.pop().error)); assert.strictEqual(h.env.state.player.xc, 500);
    h.env.failSave = true; h.db.pflx_nf_p_p1 = { owned: {} }; await h.f.nfHandleBuy('magnet'); const r = h.sent.pop(); assert.ok(/returned/.test(r.error)); assert.strictEqual(h.env.state.player.xc, 500); assert.strictEqual(h.awards.length, 1); assert.strictEqual(h.awards[0].xc, 6);
  });
  await t('saving: merges the team checkpoint and removes used-up stock in one step; a mid-round save does not touch stock', async () => {
    const h = harness(); h.db.pflx_nf_p_p1 = { owned: { chronorespawn: 2, aegis: 1, magnet: 1 } };
    await h.f.nfHandleSave({ scope: 'season_fall', cleared: 3, bossDone: false, score: 400, final: false, consumed: null }); assert.strictEqual(h.db.pflx_nf_team_season_fall.cleared, 3); assert.deepStrictEqual(h.db.pflx_nf_p_p1.owned, { chronorespawn: 2, aegis: 1, magnet: 1 });
    await h.f.nfHandleSave({ scope: 'season_fall', cleared: 3, bossDone: false, score: 450, final: true, consumed: { chronorespawn: 1, magnet: 1 } });
    assert.deepStrictEqual(h.db.pflx_nf_p_p1.owned, { chronorespawn: 1, aegis: 1 }); assert.strictEqual(h.db.pflx_nf_team_season_fall.runs, 1);
    const r = h.sent.pop(); assert.strictEqual(r.progress.cleared, 3); assert.deepStrictEqual(r.owned, { chronorespawn: 1, aegis: 1 });
    const st = await h.f.nfLoadState('season_fall', 'p1'); assert.strictEqual(st.progress.cleared, 3); assert.deepStrictEqual(st.owned, { chronorespawn: 1, aegis: 1 });
  });
  await t('scope strings from a cartridge are sanitised', async () => {
    const h = harness(); await h.f.nfHandleSave({ scope: '../../evil key!', cleared: 1, final: false }); assert.ok(Object.keys(h.db).every(k => /^[A-Za-z0-9_\-]+$/.test(k)));
  });
  await t('Studio: host settings exist for Nexus Frontiers, are saved into the game/session config, and non-NF games are untouched', () => {
    ['stNfDiff', 'stNfTeam', 'stNfMeter', 'stNfShop'].forEach(id => assert.ok(arena.includes('id="' + id + '"'), id));
    assert.ok(/nfDifficulty: studioSelTemplate === 'nexus-frontiers'/.test(arena)); assert.ok(/if \(c\.template === 'nexus-frontiers'\) \{ o\.nfDifficulty/.test(arena));
    assert.ok(/set\('stNfDiff'/.test(arena) && /set\('stNfShop'/.test(arena));
  });
  await t('the deck message carries the nf payload only to Nexus Frontiers; other cartridges still get the deck synchronously', () => {
    assert.ok(/nf: nf \|\| null/.test(arena)); assert.ok(/else sendDeck\(null\)/.test(arena)); assert.ok(/pflx_arena_nf_buy/.test(arena) && /pflx_arena_game_save/.test(arena));
    assert.ok(/pflx_arena_nf_state/.test(game) && /pflx_arena_game_save/.test(game) && /pflx_arena_nf_buy/.test(game));
  });
  console.log('\n' + n + ' arena-side tests passed');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
