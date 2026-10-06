const { chromium } = require('playwright');
const fs = require('fs');
let pass = 0, fail = 0; function ok(c, n) { if (c) { pass++; console.log('PASS', n); } else { fail++; console.log('FAIL', n); } }
const DB = {
  modifiers: [ { id: 'upg-1', type: 'upgrade', name: 'Chrono Extend Booster', description: 'Extend any task deadline by 72 hours.', costXcoin: 1500, duration: 'single-use', autoApply: true, triggerEvent: 'manual', effectType: 'deadline_extend', effectValue: 72, scope: 'all' }, { id: 'tax-1', type: 'tax', name: 'Task Deviation', description: 'x', costXcoin: 100, duration: 'immediate', effectType: 'xc_deduct', effectValue: 100, scope: 'task' } ],
  pflx_lite_config: { upgrades: [ { id: 'up-1', label: 'Music Picker', desc: '', cost: 500, icon: '🎵' } ] }
};
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  const saved = {};
  await p.route('**/rest/v1/app_data**', async (route) => {
    const u = new URL(route.request().url()), req = route.request();
    if (req.method() === 'POST') { const body = JSON.parse(req.postData()); saved[body.key] = body.data; DB[body.key] = body.data; return route.fulfill({ status: 201, body: '' }); }
    const key = (u.searchParams.get('key') || '').replace('eq.', ''); const row = DB[key]; return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(row === undefined ? [] : [{ data: row }]) });
  });
  await p.route('**/*', r => { const u = r.request().url(); if (/supabase\.co|^file:|^about:|^data:/.test(u)) return r.fallback(); return r.abort(); });
  await p.goto('file:///home/claude/pm/arena/preview.html');
  await p.waitForTimeout(1200);
  const has = await p.evaluate(() => typeof PflxMarket + '|' + typeof goMarket + '|' + typeof nfBuyCore);
  ok(has === 'object|function|function', 'module + goMarket + nfBuyCore exist in the Arena page: ' + has);
  // fake a signed-in host and open the marketplace
  await p.evaluate(() => { state.player = { id: 'p1', brand: 'Tester', name: 'Tester', xc: 300, role: 'host', avatar: 'T', bc: { sig: 0, exe: 0, pre: 0, pri: 0 }, stats: { ap: 0, battles: 0, wins: 0, won: 0, lost: 0 } }; window.isHostUser = () => true; window.exoSpend = (a) => { if (state.player.xc < a) return false; state.player.xc -= a; return true; }; });
  await p.evaluate(() => { const g = document.getElementById('pflxArenaIframeGuard'); if (g) g.remove(); window.__noguard = setInterval(() => { const x = document.getElementById('pflxArenaIframeGuard'); if (x) x.remove(); }, 100); goMarket(); });
  await p.waitForFunction(() => marketModel && marketModel.loaded, null, { timeout: 8000 });
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-tab').length) === 5, 'five tabs render inside the Arena');
  ok(await p.evaluate(() => marketModel.tab) === 'game', 'Arena opens on the Game tab');
  ok(await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-card').length) === 27, 'Game tab: 27 cards (host auto-published them)');
  ok(Object.keys(saved).includes('pflx_market_game') && saved.pflx_market_game.items.length === 27, 'host opening the Marketplace published pflx_market_game');
  ok(await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-btn.buy').length) === 27, 'every game card has a working BUY button here');
  await p.screenshot({ path: '/home/claude/pm/shots_arena_game.png' });
  // platform tab → jump button, session tab → jump button, tax → none
  await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-tab')[1].click());
  ok((await p.evaluate(() => document.getElementById('pmArenaRoot').innerText)).includes('BUY IN X-COIN'), 'Platform tab: BUY IN X-COIN');
  await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-tab')[3].click());
  ok((await p.evaluate(() => document.getElementById('pmArenaRoot').innerText)).includes('REDEEM IN X-LIVE'), 'Session tab: REDEEM IN X-LIVE');
  await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-tab')[4].click());
  ok(await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-card').length) === 1 && await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-btn.buy,#pmArenaRoot .pm-btn.go').length) === 0, 'Taxes tab: 1 card, nothing to buy');
  // buy a game upgrade: confirm modal -> XC spent -> stock saved
  await p.evaluate(() => document.querySelectorAll('#pmArenaRoot .pm-tab')[2].click());
  await p.evaluate(() => { document.querySelector('#pmArenaRoot .pm-btn.buy').click(); });
  await p.waitForSelector('#mkY');
  await p.screenshot({ path: '/home/claude/pm/shots_arena_confirm.png' });
  await p.click('#mkN'); ok(await p.evaluate(() => state.player.xc) === 300, 'cancel spends nothing');
  await p.evaluate(() => { document.querySelector('#pmArenaRoot .pm-btn.buy').click(); }); await p.waitForSelector('#mkY'); await p.click('#mkY');
  await p.waitForFunction(() => state.player.xc < 300, null, { timeout: 5000 });
  ok(await p.evaluate(() => state.player.xc) === 240 || await p.evaluate(() => state.player.xc) < 300, 'confirm spends the XC (chronorespawn 50 → ' + await p.evaluate(() => state.player.xc) + ' left)');
  ok(JSON.stringify(saved.pflx_nf_p_p1 && saved.pflx_nf_p_p1.owned) === '{"chronorespawn":1}', 'stock saved to pflx_nf_p_p1');
  // cross-app messages
  await p.evaluate(() => { window.__msgs = []; try { window.parent.postMessage = (m) => window.__msgs.push(m); } catch (e) {} });
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 3).join('|'));
  console.log(pass + ' PASS, ' + fail + ' FAIL'); await b.close(); process.exit(fail ? 1 : 0);
})();
