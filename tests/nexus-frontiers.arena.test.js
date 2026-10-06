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
    baSessions: { byId: id => id === 's1' ? { id: 's1', seasonMode: true, seasonId: 'fall', config: env.sessCfg || {} } : (id === 'sx' ? { id: 'sx', config: env.sessCfg || {} } : null) },
    supabaseLoad: async k => db[k] === undefined ? null : JSON.parse(JSON.stringify(db[k])), supabaseSave: async (k, v) => { if (env.failSave) return false; db[k] = JSON.parse(JSON.stringify(v)); return true; },
    exoGamePayloadFor: () => ({ level: env.level || 5 }), PFLX_BADGES: [], isHostUser: () => !!env.host, exoSpend: (amt) => { if (env.state.player.xc < amt) return false; env.state.player.xc -= amt; return true; }, arenaPostAward: (pid, a) => awards.push(a), SUPABASE_URL: 'https://x.supabase.co', SUPABASE_KEY: 'anon-key'
  };
  const f = new Function('env', 'with (env) {' + block + '\n return { NF_MARKET, nfMergeTeam, nfApplyConsumed, nfScopeFor, nfHandleBuy, nfBuyCore, nfMarketItems, nfPublishMarket, nfEnsureMarketPublished, NF_DESC, nfHandleSave, nfLoadState, nfClamp, nfHandleWager, nfHandleEvolve, nfHandleArm, nfHandleSettle, nfHandleClaim, nfReleaseStale, nfEvalWindows, nfWindowFor, nfMergeCats, nfPickWinner, nfCleanCatalog, nfPriceOf, nfWagerCap, nfClampWager, NF_ORB_COST, NF_BADGES, NF_MIN_ROUND_SEC, NF_BANK_CAP_DEFAULT, NF_STATS, nfCoopRules, nfSquadFor, nfCoopContext, nfHandleScope, nfSessionTagsHtml }; }')(env);
  return { f, db, sent, awards, env };
}
(async () => {
  await t('prices in the Arena match the cartridge catalog exactly (27 tiered keys; session upgrades are NOT sold here)', () => {
    const h = harness(), keys = L.marketKeys(); assert.strictEqual(keys.length, 27); keys.forEach(k => assert.strictEqual(h.f.NF_MARKET[k], L.priceOf(k), k)); assert.deepStrictEqual(Object.keys(h.f.NF_MARKET).sort(), keys.slice().sort());
    assert.ok(!('deadline' in h.f.NF_MARKET) && !('reassess' in h.f.NF_MARKET));
    keys.forEach(k => { const pr = h.f.NF_MARKET[k]; assert.ok(pr >= 10 && pr % 5 === 0, k + ' price is >= 10 and a multiple of 5'); });
    assert.deepStrictEqual(Array.from(h.f.NF_ORB_COST), L.ORB_COST); Object.keys(L.BADGES).forEach(k => { assert.strictEqual(h.f.NF_BADGES[k].id, L.BADGES[k].id); assert.strictEqual(h.f.NF_BADGES[k].name, L.BADGES[k].name); assert.strictEqual(h.f.NF_BADGES[k].xc, L.BADGES[k].xc, k); });
    assert.strictEqual(h.f.NF_MIN_ROUND_SEC, L.MIN_ROUND_SEC); assert.strictEqual(h.f.NF_BANK_CAP_DEFAULT, L.BANK_CAP_DEFAULT); assert.deepStrictEqual(Array.from(h.f.NF_STATS), L.TEAM_STATS.map(x => x.id));
    [1, 3, 5, 10].forEach(l => assert.strictEqual(h.f.nfWagerCap(l), L.wagerCap(l))); assert.strictEqual(h.f.nfClampWager(437, 5), L.clampWager(437, 5, 1e9)); assert.strictEqual(h.f.nfClampWager(9999, 3), 150);
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
    const h = harness(); await h.f.nfHandleBuy('chronorespawn'); assert.strictEqual(h.env.state.player.xc, 50); assert.deepStrictEqual(h.db.pflx_nf_p_p1.owned, { chronorespawn: 1 });
    const r = h.sent.pop(); assert.strictEqual(r.type, 'pflx_arena_nf_state'); assert.strictEqual(r.xc, 50); assert.deepStrictEqual(r.owned, { chronorespawn: 1 });
  });
  await t('buying: unknown item, too poor, over the stock limit, and a failed save (refunded) never leave a half-purchase', async () => {
    const h = harness(); await h.f.nfHandleBuy('hax'); assert.ok(h.sent.pop().error); assert.strictEqual(h.env.state.player.xc, 100);
    h.env.state.player.xc = 3; await h.f.nfHandleBuy('aegis'); assert.ok(h.sent.pop().error); assert.ok(!h.db.pflx_nf_p_p1);
    h.env.state.player.xc = 500; h.db.pflx_nf_p_p1 = { owned: { aegis: 9 } }; await h.f.nfHandleBuy('aegis'); assert.ok(/maximum/.test(h.sent.pop().error)); assert.strictEqual(h.env.state.player.xc, 500);
    h.env.failSave = true; h.db.pflx_nf_p_p1 = { owned: {} }; await h.f.nfHandleBuy('magnet'); const r = h.sent.pop(); assert.ok(/returned/.test(r.error)); assert.strictEqual(h.env.state.player.xc, 500); assert.strictEqual(h.awards.length, 1); assert.strictEqual(h.awards[0].xc, 10);
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
    ['stNfDiff', 'stNfRound', 'stNfSolo', 'stNfStudio', 'stNfMeter', 'stNfShop', 'stNfGoalC', 'stNfGoalK', 'stNfGoalX', 'stNfCap', 'stNfMinT'].forEach(id => assert.ok(arena.includes('id="' + id + '"'), id));
    assert.ok(/nfDifficulty: studioSelTemplate === 'nexus-frontiers'/.test(arena)); assert.ok(/if \(c\.template === 'nexus-frontiers'\) \{ o\.nfDifficulty/.test(arena));
    assert.ok(/set\('stNfDiff'/.test(arena) && /set\('stNfShop'/.test(arena));
  });
  await t('the deck message carries the nf payload only to Nexus Frontiers; other cartridges still get the deck synchronously', () => {
    assert.ok(/nf: nf \|\| null/.test(arena)); assert.ok(/else sendDeck\(null\)/.test(arena)); assert.ok(/pflx_arena_nf_buy/.test(arena) && /pflx_arena_game_save/.test(arena));
    assert.ok(/pflx_arena_nf_state/.test(game) && /pflx_arena_game_save/.test(game) && /pflx_arena_nf_buy/.test(game));
  });
  // ── Co-op (v0.3) ──
  await t('co-op rules: round time clamps to 1–10 min (default 10), 1-player squads and same-studio teammates are opt-in', () => {
    const { f } = harness();
    assert.deepStrictEqual(f.nfCoopRules(null), { nfRoundMin: 10, nfAllowSolo: false, nfStudioRule: 'strict' });
    assert.deepStrictEqual(f.nfCoopRules({ nfRoundMin: 45, nfAllowSolo: true, nfStudioRule: 'relaxed' }), { nfRoundMin: 10, nfAllowSolo: true, nfStudioRule: 'relaxed' });
    assert.strictEqual(f.nfCoopRules({ nfRoundMin: 0 }).nfRoundMin, 1); assert.strictEqual(f.nfCoopRules({ nfRoundMin: 6 }).nfRoundMin, 6); assert.strictEqual(f.nfCoopRules({ nfAllowSolo: 'yes' }).nfAllowSolo, false);
  });
  await t('co-op context: players get their X-Live squad, hosts get the observer role; nothing without a session', () => {
    const { f } = harness(), sess = { id: 'sess_ab12', title: 'Fall Forward', config: { nfRoundMin: 8 } }, lite = { teams: { names: ['Alpha'], assign: { p1: 'Alpha' } } };
    const pl = f.nfCoopContext({ coop: true, sessionId: 'sess_ab12' }, sess, { id: 'p1' }, lite);
    assert.strictEqual(pl.role, 'player'); assert.strictEqual(pl.squad, 'Alpha'); assert.strictEqual(pl.scope, 'sess_ab12'); assert.strictEqual(pl.rules.nfRoundMin, 8); assert.deepStrictEqual(pl.net, { url: 'https://x.supabase.co', key: 'anon-key' });
    const ho = f.nfCoopContext({ coop: true, observe: true, sessionId: 'sess_ab12' }, sess, { id: 'host' }, lite); assert.strictEqual(ho.role, 'host'); assert.strictEqual(ho.squad, '');
    assert.strictEqual(f.nfCoopContext({ coop: true, sessionId: 'sess_ab12' }, sess, { id: 'zz' }, lite).squad, ''); // not assigned → the cartridge forms an open squad
    assert.strictEqual(f.nfCoopContext({ sessionId: 'sess_ab12' }, sess, { id: 'p1' }, lite), null); assert.strictEqual(f.nfCoopContext({ coop: true }, null, { id: 'p1' }, lite), null);
    assert.strictEqual(f.nfSquadFor({ teams: { assign: { p1: 5 } } }, 'p1'), ''); assert.strictEqual(f.nfSquadFor(null, 'p1'), '');
  });
  await t('squad scope: the cartridge asks for ITS squad\'s checkpoint and gets that record + the player\'s stock back', async () => {
    const h = harness(); h.db.pflx_nf_team_sess_s9_alpha = { cleared: 4, clears: 1, runs: 3, best: 700 }; h.db.pflx_nf_p_p1 = { owned: { aegis: 2 } };
    await h.f.nfHandleScope('sess_s9_alpha'); const r = h.sent.pop(); assert.strictEqual(r.type, 'pflx_arena_nf_state'); assert.strictEqual(r.progress.cleared, 4); assert.deepStrictEqual(r.owned, { aegis: 2 });
    await h.f.nfHandleScope('../bad scope!'); assert.ok(h.sent.length === 0 || /^[A-Za-z0-9_\-]*$/.test(String(h.sent[h.sent.length - 1].progress && 'ok') || ''));
  });
  await t('wiring: deck message carries coop; session play sends players to their lobby and hosts to observation; scope message is handled; Quick Launch exists', () => {
    assert.ok(/coop: coop \|\| null/.test(arena)); assert.ok(/pflx_arena_nf_scope' && arenaGame\.open/.test(arena)); assert.ok(/coop: nx, observe: nx && isHostUser\(state\.player\)/.test(arena));
    assert.ok(/studioLaunchLive\(true\)/.test(arena) && /async function studioLaunchLive\(quick\)/.test(arena)); assert.ok(/dev: isHostUser\(state\.player\)/.test(arena));
    assert.ok(/pflx_arena_nf_scope/.test(game) && /coop/.test(game) && /OBSERVING/.test(game));
  });
  await t('session tags: Nexus cards show the co-op rule and an Observe button only for hosts', () => {
    const h = harness(); h.env.isHostUser = () => false; let html = h.f.nfSessionTagsHtml({ id: 's1', config: { nfRoundMin: 7 } }); assert.ok(/Co-op/.test(html) && /7 min rounds/.test(html) && !/OBSERVE/.test(html));
    h.env.isHostUser = () => true; html = h.f.nfSessionTagsHtml({ id: 's1', config: {} }); assert.ok(/OBSERVE SQUADS/.test(html) && /10 min rounds/.test(html));
  });

  // ── Round economy (Oct 2026) ──
  const settleMsg = (o) => Object.assign({ roundId: 'r1', scope: 'sx', team: 'alpha', teamName: 'Alpha', payout: 400, wager: 200, goalMet: true, badges: ['participant', 'collaborator', 'resilient'], kind: 'clear', t: 400, members: ['p1', 'p2'], cs: 2500, ts: { archives: 40, correct: 22, accuracy: 85, keys: 3, bank: 400, revives: 1, fastest: 380 }, tm: {}, score: 900, bank: 400 }, o || {});
  const armMsg = (o) => Object.assign({ roundId: 'r1', scope: 'sx', team: 'alpha', teamName: 'Alpha', members: [{ id: 'p1', name: 'A' }, { id: 'p2', name: 'B' }], startedAt: Date.now(), stake: 200 }, o || {});
  const lastState = (h) => h.sent[h.sent.length - 1];
  await t('wager: the cap is 50 XC x Evo level (taken from the Evo, not the cartridge), steps of 5, X-Coin leaves the wallet and is held', async () => {
    const h = harness(); h.env.state.player.xc = 1000; h.env.level = 3;
    await h.f.nfHandleWager({ amount: 400, level: 10, scope: 'sx' }); const r = lastState(h);
    assert.strictEqual(r.stakeReply, true); assert.strictEqual(r.stake, 150); assert.strictEqual(r.xc, 850); assert.strictEqual(h.db.pflx_nf_p_p1.stake.amount, 150); assert.strictEqual(h.db.pflx_nf_p_p1.stake.round, null);
    assert.ok(h.awards.some(a => a.xc === -150 && a.noMultiplier === true && /^exo\./.test(a.reason)), 'a debit through the award path that does not feed Evo sync XP');
    await h.f.nfHandleWager({ amount: 77 }); assert.strictEqual(lastState(h).stake, 75); assert.strictEqual(lastState(h).xc, 925); // changing the wager moves only the difference
  });
  await t('wager: too poor is refused, unready/cancel refunds, and a round-locked wager cannot be changed', async () => {
    const h = harness(); h.env.state.player.xc = 40; h.env.level = 5; await h.f.nfHandleWager({ amount: 100 }); assert.ok(/Not enough/.test(lastState(h).error)); assert.ok(!h.db.pflx_nf_p_p1);
    h.env.state.player.xc = 500; await h.f.nfHandleWager({ amount: 100 }); assert.strictEqual(h.env.state.player.xc, 400);
    await h.f.nfHandleWager({ cancel: true, amount: 0 }); assert.strictEqual(lastState(h).stake, 0); assert.strictEqual(h.env.state.player.xc, 500); assert.strictEqual(h.db.pflx_nf_p_p1.stake, null);
    await h.f.nfHandleWager({ amount: 100 }); await h.f.nfHandleArm(armMsg()); await h.f.nfHandleWager({ amount: 50 }); assert.ok(/locked/.test(lastState(h).error)); assert.strictEqual(h.env.state.player.xc, 400);
    h.env.failSave = true; const h2 = harness(); h2.env.failSave = true; h2.env.state.player.xc = 300; await h2.f.nfHandleWager({ amount: 100 }); assert.ok(/not be saved/.test(lastState(h2).error)); assert.strictEqual(h2.env.state.player.xc, 300, 'a failed save returns the held X-Coin');
  });
  await t('stale holds: an unarmed hold is returned when the cartridge opens; a fresh armed round is left alone', async () => {
    const h = harness(); h.env.state.player.xc = 100; h.db.pflx_nf_p_p1 = { owned: {}, stake: { amount: 120, round: null, at: Date.now() } };
    await h.f.nfReleaseStale(); assert.strictEqual(h.env.state.player.xc, 220); assert.strictEqual(h.db.pflx_nf_p_p1.stake, null);
    h.db.pflx_nf_p_p1 = { owned: {}, stake: { amount: 120, round: 'r9', at: Date.now() } }; await h.f.nfReleaseStale(); assert.strictEqual(h.env.state.player.xc, 220); assert.strictEqual(h.db.pflx_nf_p_p1.stake.amount, 120);
    h.db.pflx_nf_p_p1 = { owned: {}, stake: { amount: 120, round: 'r9', at: Date.now() - 31 * 60000 } }; await h.f.nfReleaseStale(); assert.strictEqual(h.env.state.player.xc, 340, 'a round that never settled for 30 min is returned');
  });
  await t('evolve: one Mk-N plus orbs becomes one Mk-(N+1); not enough orbs, not owned and Mk III are refused; a failed save spends nothing', async () => {
    const h = harness(); h.db.pflx_nf_p_p1 = { owned: { aegis: 2, 'repair#2': 1 }, orbs: 30 };
    await h.f.nfHandleEvolve('aegis'); let r = lastState(h); assert.deepStrictEqual(r.owned, { aegis: 1, 'aegis#2': 1, 'repair#2': 1 }); assert.strictEqual(r.orbs, 22);
    await h.f.nfHandleEvolve('repair#2'); r = lastState(h); assert.strictEqual(r.orbs, 6); assert.strictEqual(r.owned['repair#3'], 1); assert.ok(!r.owned['repair#2']);
    await h.f.nfHandleEvolve('aegis#2'); assert.ok(/needs 16 orbs/.test(lastState(h).error)); assert.strictEqual(h.db.pflx_nf_p_p1.orbs, 6);
    await h.f.nfHandleEvolve('magnet'); assert.ok(/do not hold/.test(lastState(h).error)); await h.f.nfHandleEvolve('repair#3'); assert.ok(/cannot evolve/.test(lastState(h).error)); await h.f.nfHandleEvolve('hax'); assert.ok(lastState(h).error);
    const h2 = harness(); h2.db.pflx_nf_p_p1 = { owned: { aegis: 1 }, orbs: 30 }; h2.env.failSave = true; await h2.f.nfHandleEvolve('aegis'); assert.ok(lastState(h2).error); assert.deepStrictEqual(lastState(h2).owned, { aegis: 1 }); assert.strictEqual(lastState(h2).orbs, 30);
  });
  await t('orbs collected in a round are banked with the final save (and only then)', async () => {
    const h = harness(); h.db.pflx_nf_p_p1 = { owned: { aegis: 1 }, orbs: 3 };
    await h.f.nfHandleSave({ scope: 'sx', cleared: 2, final: false, consumed: { aegis: 1 }, orbs: 40 }); assert.strictEqual(h.db.pflx_nf_p_p1.orbs, 3);
    await h.f.nfHandleSave({ scope: 'sx', cleared: 2, final: true, consumed: { aegis: 1 }, orbs: 40 }); assert.strictEqual(h.db.pflx_nf_p_p1.orbs, 43); assert.strictEqual(lastState(h).orbs, 43);
    await h.f.nfHandleSave({ scope: 'sx', cleared: 2, final: true, consumed: {}, orbs: 99999 }); assert.strictEqual(h.db.pflx_nf_p_p1.orbs, 343, 'one round banks at most 300 orbs');
  });
  await t('settle: goals met pays the whole team bank once; the same round id never pays twice; the hold is cleared', async () => {
    const h = harness(); h.env.state.player.xc = 800; h.env.level = 5; await h.f.nfHandleWager({ amount: 200 }); await h.f.nfHandleArm(armMsg());
    await h.f.nfHandleSettle(settleMsg()); const pays = () => h.awards.filter(a => /payout/.test(a.reason));
    assert.strictEqual(pays().length, 1); assert.strictEqual(pays()[0].xc, 400); assert.strictEqual(pays()[0].noMultiplier, true); assert.strictEqual(h.env.state.player.xc, 1000); assert.strictEqual(h.db.pflx_nf_p_p1.stake, null); assert.ok(h.db.pflx_nf_p_p1.settled.includes('r1'));
    await h.f.nfHandleSettle(settleMsg()); assert.strictEqual(pays().length, 1, 'idempotent'); assert.strictEqual(h.env.state.player.xc, 1000);
  });
  await t('settle: goals missed pays nothing (the wager is already gone) but the completion badges are still earned', async () => {
    const h = harness(); h.env.state.player.xc = 500; await h.f.nfHandleWager({ amount: 100 }); await h.f.nfHandleArm(armMsg({ roundId: 'r2' }));
    await h.f.nfHandleSettle(settleMsg({ roundId: 'r2', goalMet: false, payout: 400 })); assert.strictEqual(h.awards.filter(a => /payout/.test(a.reason)).length, 0); assert.strictEqual(h.env.state.player.xc, 400);
    const b = h.awards.filter(a => a.badge); assert.deepStrictEqual(b.map(a => a.badge.name), ['Positive Participant', 'Master Collaborator', 'Resilient Learner']); assert.ok(b.every(a => a.badge.xcValue === 100 && a.noMultiplier));
    assert.ok(/lost/.test(lastState(h).note));
  });
  await t('settle: nothing is paid without an armed round, a payout is capped, short rounds earn no badges, only the 3 completion badges can be claimed', async () => {
    const h = harness(); await h.f.nfHandleSettle(settleMsg({ roundId: 'nope' })); assert.strictEqual(h.awards.length, 0, 'never armed -> no payout, no badges');
    h.env.sessCfg = { nfBankCap: 1000 }; h.env.state.player.xc = 300; h.env.level = 5; await h.f.nfHandleWager({ amount: 100 }); await h.f.nfHandleArm(armMsg({ roundId: 'r3', scope: '' }));
    await h.f.nfHandleSettle(settleMsg({ roundId: 'r3', scope: '', payout: 999999, badges: ['participant', 'champion', 'beacon', 'hax'], t: 60 }));
    h.env.arenaGame = null; const pay = h.awards.find(a => /payout/.test(a.reason)); assert.ok(!pay || pay.xc <= 5000); assert.strictEqual(h.awards.filter(a => a.badge).length, 0, 'under 2 minutes and non-completion badges earn nothing');
  });
  await t('settle: a payout is capped by the host\'s bank cap', async () => {
    const h = harness(); h.env.arenaGame.opts = { sessionId: 's1', config: { nfBankCap: 500 } }; h.env.state.player.xc = 300; await h.f.nfHandleWager({ amount: 100 }); await h.f.nfHandleArm(armMsg({ roundId: 'r4', scope: '' }));
    await h.f.nfHandleSettle(settleMsg({ roundId: 'r4', scope: '', payout: 4000, badges: [] })); assert.strictEqual(h.awards.find(a => /payout/.test(a.reason)).xc, 500);
  });
  await t('launch windows: squads launched together compete; the highest collaboration score wins, ties go to the earlier finish', () => {
    const { f } = harness(); assert.strictEqual(f.nfPickWinner({ a: { score: 100, endedAt: 5 }, b: { score: 300, endedAt: 9 } }).winner, 'b'); assert.strictEqual(f.nfPickWinner({ a: { score: 300, endedAt: 9 }, b: { score: 300, endedAt: 5 } }).winner, 'b'); assert.strictEqual(f.nfPickWinner({}).winner, null);
    const doc = { windows: [] }, t0 = 1e12; const w1 = f.nfWindowFor(doc, t0, 'a', 'ra'), w2 = f.nfWindowFor(doc, t0 + 60000, 'b', 'rb'); assert.strictEqual(w1, w2); w1.teams.a = { roundId: 'ra' };
    const w3 = f.nfWindowFor(doc, t0 + 600000, 'c', 'rc'); assert.notStrictEqual(w3, w1, 'a squad launched 10 minutes later is a new window');
    const w4 = f.nfWindowFor(doc, t0 + 70000, 'a', 'ra2'); assert.notStrictEqual(w4, w1, 'the same squad launching again starts a new window');
  });
  await t('Champion is ALWAYS first place; Beacon needs first place AND beating the squad\'s own record; both need the host\'s minimum number of squads', async () => {
    const { f } = harness(), now = Date.now(), mk = () => ({ windows: [{ id: 'w', first: now, status: 'open', claims: {}, teams: { a: { name: 'A', members: ['a1', 'a2'], roundId: 'ra', res: { cs: 3000, at: 2 } }, b: { name: 'B', members: ['b1'], roundId: 'rb', res: { cs: 2000, at: 1 } } } }], rec: {}, cats: {} });
    let d = mk(); assert.strictEqual(f.nfEvalWindows(d, 2, now), true); assert.strictEqual(d.windows[0].winner, 'a'); assert.deepStrictEqual(d.windows[0].claims, { a1: { champion: 1, beacon: 1 }, a2: { champion: 1, beacon: 1 } }); assert.strictEqual(d.rec.a.best, 3000); assert.strictEqual(d.rec.b.best, 2000);
    assert.strictEqual(f.nfEvalWindows(d, 2, now), false, 'idempotent once closed');
    d = mk(); d.rec.a = { best: 3000 }; f.nfEvalWindows(d, 2, now); assert.deepStrictEqual(d.windows[0].claims.a1, { champion: 1, beacon: 0 }, 'first place but no new record: Champion yes, Beacon no');
    d = mk(); d.rec.a = { best: 2999 }; f.nfEvalWindows(d, 2, now); assert.strictEqual(d.windows[0].claims.a1.beacon, 1);
    d = mk(); delete d.windows[0].teams.b; f.nfEvalWindows(d, 2, now); assert.strictEqual(d.windows[0].winner, null, 'one squad alone does not win when the host needs two'); f.nfEvalWindows(Object.assign(mk(), {}), 1, now);
    d = mk(); delete d.windows[0].teams.b; f.nfEvalWindows(d, 1, now); assert.strictEqual(d.windows[0].winner, 'a');
    d = mk(); d.windows[0].teams.b.res = null; assert.strictEqual(f.nfEvalWindows(d, 2, now), false, 'waits for every squad'); assert.strictEqual(f.nfEvalWindows(d, 2, now + 16 * 60000), true, 'a squad that never reports does not block the window forever'); assert.strictEqual(d.windows[0].winner, 'a');
  });
  await t('end to end: two squads settle, the winner claims Champion + Beacon exactly once, the other squad gets neither, session-best stats are tracked', async () => {
    const h = harness(); h.env.state.player.xc = 1000; h.env.level = 5; h.env.sessCfg = { nfAwardMinTeams: 2 };
    await h.f.nfHandleWager({ amount: 100 }); await h.f.nfHandleArm(armMsg());
    // a second squad (other players) registers + settles directly in the shared session doc
    h.db.pflx_nf_sess_sx = JSON.parse(JSON.stringify(h.db.pflx_nf_sess_sx)); const w = h.db.pflx_nf_sess_sx.windows[0]; w.teams.bravo = { name: 'Bravo', members: ['q1', 'q2'], roundId: 'rq', startedAt: w.first, res: { cs: 1500, goalMet: false, at: Date.now() } };
    await h.f.nfHandleSettle(settleMsg({ cs: 2600 }));
    let sess = h.db.pflx_nf_sess_sx; assert.strictEqual(sess.windows[0].status, 'done'); assert.strictEqual(sess.windows[0].winner, 'alpha'); assert.deepStrictEqual(sess.windows[0].claims.p1, { champion: 1, beacon: 1 }); assert.strictEqual(sess.cats.correct.value, 22); assert.strictEqual(sess.cats.fastest.value, 380);
    h.awards.length = 0; await h.f.nfHandleClaim({ scope: 'sx', team: 'alpha' }); const names = h.awards.filter(a => a.badge).map(a => a.badge.name).sort(); assert.deepStrictEqual(names, ['Battle Arena Champion', 'Beacon of Collaboration']);
    const r = lastState(h); assert.deepStrictEqual(r.award.map(a => a.name).sort(), ['Battle Arena Champion', 'Beacon of Collaboration']); assert.strictEqual(r.sessStats.cats.correct.mine, true);
    h.awards.length = 0; await h.f.nfHandleClaim({ scope: 'sx', team: 'alpha' }); assert.strictEqual(h.awards.length, 0, 'claimed once');
    assert.strictEqual(sess.rec.alpha.best, 2600);
  });
  await t('session-best stats: higher wins, except fastest clear where lower wins; zero never counts', () => {
    const { f } = harness(), d = {}; f.nfMergeCats(d, 'a', 'A', { archives: 10, fastest: 400, keys: 0 }); f.nfMergeCats(d, 'b', 'B', { archives: 8, fastest: 380, keys: 2 }); f.nfMergeCats(d, 'c', 'C', { archives: 12, fastest: 0 });
    assert.strictEqual(d.cats.archives.team, 'c'); assert.strictEqual(d.cats.fastest.team, 'b'); assert.ok(!d.cats.keys || d.cats.keys.team === 'b');
  });
  await t('host catalog: names, descriptions, pictures and prices are validated (prices: multiples of 5, 10-2000); unknown keys are dropped', () => {
    const { f } = harness(); const c = f.nfCleanCatalog({ aegis: { name: '  Shield  ', desc: 'x', price: 35, image: 'data:image/png;base64,AAAA' }, 'aegis#2': { price: 33 }, magnet: { price: 5 }, hax: { name: 'z' }, rapid: { image: 'javascript:alert(1)', price: 2500 } });
    assert.deepStrictEqual(c, { aegis: { name: 'Shield', desc: 'x', image: 'data:image/png;base64,AAAA', price: 35 } }); assert.strictEqual(f.nfPriceOf('aegis', c), 35); assert.strictEqual(f.nfPriceOf('aegis#2', c), f.NF_MARKET['aegis#2']);
  });
  await t('buying uses the host catalog price when one is set', async () => {
    const h = harness(); h.db.pflx_nf_catalog = { items: { aegis: { price: 35 } } }; h.env.state.player.xc = 100; await h.f.nfHandleBuy('aegis'); assert.strictEqual(h.env.state.player.xc, 65);
    h.env.state.player.xc = 200; await h.f.nfHandleBuy('aegis#3'); assert.strictEqual(h.env.state.player.xc, 200 - h.f.NF_MARKET['aegis#3']);
  });
  await t('wiring: the router handles wager / evolve / arm / settle / claim; the deck carries orbs, catalog and net; host settings and catalog editor exist', () => {
    ['wager', 'evolve', 'arm', 'settle', 'claim'].forEach(k => assert.ok(new RegExp("pflx_arena_nf_" + k + "' && arenaGame\\.open").test(arena), k));
    assert.ok(/orbs: st\.orbs, catalog: st\.catalog/.test(arena) && /net: \{ url: SUPABASE_URL, key: SUPABASE_KEY \}/.test(arena) && /nfReleaseStale\(\)/.test(arena));
    ['pflx_arena_nf_wager', 'pflx_arena_nf_evolve', 'pflx_arena_nf_arm', 'pflx_arena_nf_settle', 'pflx_arena_nf_claim'].forEach(k => assert.ok(game.includes(k), 'cartridge posts ' + k));
    ['nfGoalCorrect', 'nfGoalKeys', 'nfGoalClear', 'nfBankCap', 'nfAwardMinTeams'].forEach(k => assert.ok(arena.includes(k), k)); assert.ok(/onclick="nfCatalogToggle\(\)"/.test(arena) && /function nfCatImage/.test(arena) && /type="file" accept="image\/\*"/.test(arena));
  });

  // ── Marketplace (Oct 2026): the Arena owns game upgrades and publishes them for X-Coin / X-Live / the Console ──
  await t('marketplace: published game items cover all 27 keys and match the cartridge (names, descriptions, prices, which ones fire)', () => {
    const h = harness(), items = h.f.nfMarketItems({}); assert.strictEqual(items.length, 27);
    items.forEach(i => { const u = L.UPGRADES[i.id], tr = u.tiers[i.tier - 1]; assert.strictEqual(i.desc, tr.d, i.key); assert.strictEqual(i.price, tr.p, i.key); assert.strictEqual(i.fires, !!u.trigger, i.key); assert.ok(i.effect && i.icon === u.icon, i.key); assert.strictEqual(i.name, u.name + (i.tier > 1 ? ' Mk ' + ['I', 'II', 'III'][i.tier - 1] : ''), i.key); });
    const o = h.f.nfMarketItems({ aegis: { name: 'Big Shield', desc: 'Hosted text', price: 35, image: 'https://x/y.png' } }).find(i => i.key === 'aegis');
    assert.deepStrictEqual([o.name, o.desc, o.price, o.image], ['Big Shield', 'Hosted text', 35, 'https://x/y.png']);
  });
  await t('marketplace: only a host publishes; a player never writes pflx_market_game', async () => {
    const h = harness(); h.env.host = false; assert.strictEqual(await h.f.nfPublishMarket({}, 0), false); assert.ok(!h.db.pflx_market_game);
    h.env.host = true; assert.strictEqual(await h.f.nfPublishMarket({}, 123), true); assert.strictEqual(h.db.pflx_market_game.items.length, 27); assert.strictEqual(h.db.pflx_market_game.catAt, 123); assert.strictEqual(h.db.pflx_market_game.v, 1);
  });
  await t('marketplace: an oversized catalog (big pictures) is published without the pictures instead of bloating the row', async () => {
    const h = harness(); h.env.host = true; const big = 'data:image/png;base64,' + 'A'.repeat(39000), cat = {}; Object.keys(h.f.NF_MARKET).forEach(k => cat[k] = { image: big });
    await h.f.nfPublishMarket(cat, 1); assert.ok(h.db.pflx_market_game.imagesStripped); assert.ok(h.db.pflx_market_game.items.every(i => i.image === '')); assert.ok(JSON.stringify(h.db.pflx_market_game).length < 700000);
  });
  await t('marketplace: a host opening the Marketplace publishes when the row is missing or older than the catalog, and leaves a fresh row alone', async () => {
    const h = harness(); h.env.host = true; await h.f.nfEnsureMarketPublished(); assert.strictEqual(h.db.pflx_market_game.items.length, 27); const t1 = h.db.pflx_market_game.updatedAt;
    h.db.pflx_market_game.updatedAt = 1; await h.f.nfEnsureMarketPublished(); assert.strictEqual(h.db.pflx_market_game.updatedAt, 1);
    h.db.pflx_nf_catalog = { v: 1, items: { aegis: { price: 25 } }, updatedAt: 5000 }; await h.f.nfEnsureMarketPublished(); assert.ok(h.db.pflx_market_game.updatedAt > 1); assert.strictEqual(h.db.pflx_market_game.items.find(i => i.key === 'aegis').price, 25); assert.strictEqual(h.db.pflx_market_game.catAt, 5000);
    const p = harness(); p.env.host = false; await p.f.nfEnsureMarketPublished(); assert.ok(!p.db.pflx_market_game);
  });
  await t('marketplace: buying from the Marketplace screen uses the same path as the cartridge but never posts to a game frame', async () => {
    const h = harness(); const r = await h.f.nfBuyCore('aegis'); assert.strictEqual(r.xc, 80); assert.deepStrictEqual(r.owned, { aegis: 1 }); assert.strictEqual(h.sent.length, 0);
    const bad = await h.f.nfBuyCore('hax'); assert.ok(bad.error); assert.strictEqual(h.env.state.player.xc, 80); assert.strictEqual(h.sent.length, 0);
  });
  await t('marketplace: wiring — screen, nav links, publish on catalog save, message hook, and the inlined card module is byte-identical to the shared copy', () => {
    assert.ok(/state\.screen === "market"/.test(arena) && /goMarket\(\);togglePanel\(\)/.test(arena) && /onclick="goMarket\(\)"/.test(arena) && /marketAttach\(\)/.test(arena));
    assert.ok(/await nfPublishMarket\(clean, catAt\)/.test(arena) && /pflx_market_open/.test(arena) && /type: 'pflx_open_app'/.test(arena) && /buy: \{ game: marketBuyGame \}/.test(arena));
    const shared = fs.readFileSync(path.join(__dirname, '..', '..', 'pflx-market', 'pflx-market.js'), 'utf8').trim(), m0 = arena.indexOf('/* ═══ PflxMarket BEGIN'), m1 = arena.indexOf('/* ═══ PflxMarket END');
    assert.ok(m0 > 0 && m1 > m0); assert.strictEqual(arena.slice(arena.indexOf('\n', m0) + 1, m1).trim(), shared);
  });

  console.log('\n' + n + ' arena-side tests passed');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
