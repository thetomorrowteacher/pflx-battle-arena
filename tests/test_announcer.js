// BATTLE ARENA -- announcer: static checks on public/preview.html. Usage: node test_announcer.js [public/preview.html]
const fs = require('fs'); const path = require('path');
const src = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'public', 'preview.html'), 'utf8');
let pass = 0, fail = 0;
function check(l, c, x) { if (c) { pass++; console.log('PASS: ' + l); } else { fail++; console.log('FAIL: ' + l + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); } }
const has = (s, n) => src.split(s).length - 1 === (n || 1);
check('ANN engine defined once, after SFX and before MUSIC', has('const ANN = (() => {') && src.indexOf('const SFX = (() => {') < src.indexOf('const ANN = (() => {') && src.indexOf('const ANN = (() => {') < src.indexOf('const MUSIC = (() => {'));
check('clips from the Platform announcer folder', has("const ROOT = 'https://www.prototypeflx.com/public/sounds/pflx-announcer/';"));
check('host arena voice stored in app_data arena_announcer', has("const KEY = 'arena_announcer';") && src.indexOf('ANN.load();') > 0);
check('player device toggle (side panel + settings)', has('id="annNavToggle"') && has('id="annToggle"'));
check('SFX + MUSIC silent outside the PFLX sound window', src.indexOf("(muted || window.__baAudioHere === false) ? 0 : val * volume") > 0 && src.indexOf("(muted || window.__baAudioHere === false) ? 0 : volume * (window.__baAnnDuck ? 0.35 : 1)") > 0);
check('asks PFLX for the sound window', src.indexOf("post('pflx_audio_query')") > 0 && src.indexOf("post('pflx_audio_use')") > 0);
check('quiz battle lines', src.indexOf("ANN.line('battleStart');") > 0 && src.indexOf("ANN.line('correct');") > 0 && src.indexOf("ANN.line('wrong');") > 0 && src.indexOf("'tie' : (won ? 'win' : 'lose')") > 0);
check('Cipher lines', src.indexOf("ANN.line(won ? 'missionWin' : 'missionLose'") > 0 && src.indexOf("ANN.line('crisis'") > 0 && src.indexOf("ANN.line('eject')") > 0);
check('Rift lines', has("ANN.line('kill', { throttle: 3000 })", 2) && src.indexOf("ANN.line('finalRound', { force: true })") > 0);
check('Showdown: per-mode voice copied onto the match', src.indexOf("announcer: '',   // '' = Arena default voice") > 0 && src.indexOf("announcer: esportsHostConfig[mode.id]?.announcer || ''") > 0 && src.indexOf('function mspSetAnnouncer(v)') > 0);
check('Showdown: hurry up + countdown + time over', src.indexOf("ANN.line('hurry', { voice: m.announcer || undefined })") > 0 && src.indexOf('ANN.count(m.timeLeft') > 0 && src.indexOf("ANN.line('timeout', { voice:") > 0);
check('LIVE events: host picks the voice at launch and on the card', src.indexOf('id="lpAnn"') > 0 && src.indexOf('function baLiveSetAnnouncer(id)') > 0 && src.indexOf("return v === 'male' || v === 'off' ? v : 'female'; })(),") > 0);
check('cartridge results: level up / high score / win / lose', src.indexOf("ANN.line('levelup'") > 0 && src.indexOf("ANN.line('highscore'") > 0);
// every clip the engine names is in the Platform pack list
const m = src.match(/const LINES = \{([\s\S]*?)\};/);
const clips = new Set((m ? m[1] : '').match(/'([a-z0-9_]+)'/g).map(s => s.slice(1, -1)));
const pack = ['1','2','3','4','5','6','7','8','9','10','congratulations','correct','final_round','game_over','go','hurry_up','its_a_tie','level','level_up','mission_completed','mission_failed','new_highscore','objective_achieved','power_up','ready','round','set','time_over','war_call_for_backup','war_cover_me','war_go_go_go','war_hold','war_look_out','war_target_destroyed','war_target_engaged','war_watch_my_back','wrong','you_lose','you_win'];
const missing = [...clips].filter(c => pack.indexOf(c) < 0);
check('every named clip exists in the pack', clips.size > 20 && missing.length === 0, missing);
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
