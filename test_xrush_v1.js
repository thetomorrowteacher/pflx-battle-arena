// Unit tests for the real compiled app/lib/xrush.ts (PATCH ARENA xrush-1).
// Run: node test_xrush_v1.js  (from /tmp/xrush_test, alongside xrush.js/decks.js)
'use strict';
const X = require('/tmp/xrush_test/xrush.js');

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', label); }
}

const CARDS = [
  { id: 'c1', term: 'Photosynthesis', definition: 'Plants making food from sunlight' },
  { id: 'c2', term: 'Mitosis', definition: 'Cell division producing identical cells' },
  { id: 'c3', term: 'Osmosis', definition: 'Movement of water across a membrane' },
  { id: 'c4', term: 'Gravity', definition: 'Force pulling masses together' },
  { id: 'c5', term: 'Friction', definition: 'Force resisting relative motion' },
  { id: 'c6', term: 'Inertia', definition: 'Resistance to a change in motion' },
];

// ── seededShuffle / seedFromString ──────────────────────────────────
(function () {
  const s1 = X.seedFromString('race1:playerA:0:c1');
  const s2 = X.seedFromString('race1:playerA:0:c1');
  ok(s1 === s2, 'seedFromString is deterministic for the same input');
  const s3 = X.seedFromString('race1:playerB:0:c1');
  ok(s1 !== s3, 'seedFromString differs for a different player');

  const arr = [1, 2, 3, 4, 5];
  const sh1 = X.seededShuffle(arr, 42);
  const sh2 = X.seededShuffle(arr, 42);
  ok(JSON.stringify(sh1) === JSON.stringify(sh2), 'seededShuffle is deterministic for the same seed');
  ok(JSON.stringify(arr) === JSON.stringify([1, 2, 3, 4, 5]), 'seededShuffle does not mutate the input array');
  const sh3 = X.seededShuffle(arr, 43);
  ok(JSON.stringify(sh1) !== JSON.stringify(sh3), 'seededShuffle differs for a different seed (sanity, not guaranteed but true for this fixture)');
  ok(sh1.slice().sort().join(',') === '1,2,3,4,5', 'seededShuffle is a permutation, nothing lost or duplicated');
})();

// ── buildCardOrder / newRace ─────────────────────────────────────────
(function () {
  const order = X.buildCardOrder(CARDS, 4, 7);
  ok(order.length === 4, 'buildCardOrder respects the requested count');
  ok(new Set(order).size === 4, 'buildCardOrder never repeats a card id');
  const orderBig = X.buildCardOrder(CARDS, 999, 7);
  ok(orderBig.length === CARDS.length, 'buildCardOrder caps at the deck size when count exceeds it');
  const orderCap = X.buildCardOrder(CARDS, 9999, 7);
  ok(orderCap.length <= X.MAX_ROUNDS, 'buildCardOrder never exceeds MAX_ROUNDS');

  const race = X.newRace({ deckId: 'd1', deckName: 'Bio & Physics', cards: CARDS, totalRounds: 5, teams: ['Red', 'Blue'], createdBy: 'host1' });
  ok(race.status === 'lobby', 'newRace starts in lobby status');
  ok(race.totalRounds === 5, 'newRace totalRounds matches the built cardOrder length');
  ok(race.teams.length === 2, 'newRace keeps the given teams');
  ok(Object.keys(race.progress).length === 0, 'newRace starts with no progress entries');
  ok(!!race.id && !!race.createdAt, 'newRace stamps an id and createdAt');
})();

// ── joinRace ──────────────────────────────────────────────────────────
(function () {
  let race = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 4, teams: ['Red'], createdBy: 'host1' });
  race = X.joinRace(race, 'p1', 'Alex', 'Red');
  ok(!!race.progress.p1, 'joinRace adds a progress entry');
  ok(race.progress.p1.roundIndex === 0, 'a joined player starts at roundIndex 0');
  ok(race.progress.p1.team === 'Red', 'joinRace records the team');
  const again = X.joinRace(race, 'p1', 'Alex', 'Red');
  ok(again.progress.p1.updatedAt === race.progress.p1.updatedAt, 'joinRace is a no-op if the player already joined');
})();

// ── xrushBuildQuestion ────────────────────────────────────────────────
(function () {
  const order = X.buildCardOrder(CARDS, 6, 1);
  const q = X.xrushBuildQuestion(CARDS, order, 0, 'raceA', 'playerX');
  ok(!!q, 'xrushBuildQuestion returns a question for a valid round');
  ok(q.options.some((o) => o.correct), 'the question always includes the correct option');
  ok(q.options.filter((o) => o.correct).length === 1, 'the question never includes the correct option twice');
  ok(q.options.length <= X.MAX_OPTIONS, 'the question never exceeds MAX_OPTIONS');
  ok(new Set(q.options.map((o) => o.cardId)).size === q.options.length, 'options never repeat the same card');

  const qOOB = X.xrushBuildQuestion(CARDS, order, 999, 'raceA', 'playerX');
  ok(qOOB === null, 'xrushBuildQuestion returns null for an out-of-range round');

  // Same round, two different players -> different option arrangement (at least the ORDER differs)
  const qA = X.xrushBuildQuestion(CARDS, order, 0, 'raceA', 'playerA');
  const qB = X.xrushBuildQuestion(CARDS, order, 0, 'raceA', 'playerB');
  ok(qA.term === qB.term, 'two players on the same round see the SAME term');
  ok(JSON.stringify(qA.options.map((o) => o.cardId)) !== JSON.stringify(qB.options.map((o) => o.cardId)),
    'two players on the same round see a DIFFERENT option arrangement (the Quizlet Live mechanic)');

  // Same player, reloaded -> identical question (deterministic, not re-rolled on refresh)
  const qA2 = X.xrushBuildQuestion(CARDS, order, 0, 'raceA', 'playerA');
  ok(JSON.stringify(qA) === JSON.stringify(qA2), 'the same player sees an identical question on reload (deterministic)');

  // Degrades gracefully on a tiny deck
  const tinyCards = [CARDS[0], CARDS[1]];
  const tinyOrder = X.buildCardOrder(tinyCards, 2, 1);
  const qTiny = X.xrushBuildQuestion(tinyCards, tinyOrder, 0, 'raceB', 'p1');
  ok(qTiny.options.length === 2, 'a 2-card deck yields a 2-option question, not a crash');
  ok(qTiny.options.filter((o) => o.correct).length === 1, 'a tiny deck still has exactly one correct option');

  const oneCard = [CARDS[0]];
  const oneOrder = X.buildCardOrder(oneCard, 1, 1);
  const qOne = X.xrushBuildQuestion(oneCard, oneOrder, 0, 'raceC', 'p1');
  ok(qOne.options.length === 1, 'a 1-card deck yields a single (correct-only) option, not a crash');
})();

// ── xrushRecordAnswer ────────────────────────────────────────────────
(function () {
  let race = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 3, teams: [], createdBy: 'h' });
  race = X.joinRace(race, 'p1', 'Alex', '');
  race = X.xrushStartRace(race);
  ok(race.status === 'active', 'xrushStartRace flips status to active');

  const inactive = { ...race, status: 'lobby' };
  const noOp = X.xrushRecordAnswer(inactive, 'p1', race.cardOrder[0]);
  ok(noOp.progress.p1.roundIndex === 0 && noOp === inactive, 'xrushRecordAnswer is a no-op when the race is not active');

  // correct answer advances
  let r2 = X.xrushRecordAnswer(race, 'p1', race.cardOrder[0]);
  ok(r2.progress.p1.roundIndex === 1, 'a correct answer advances roundIndex by 1');
  ok(r2.progress.p1.correct === 1, 'a correct answer increments the correct counter');
  ok(!r2.progress.p1.finishedAt, 'not finished until totalRounds is reached');

  // wrong answer resets to 0 (Ennis's explicit spec)
  let r3 = X.xrushRecordAnswer(r2, 'p1', 'not-the-right-card');
  ok(r3.progress.p1.roundIndex === 0, 'a wrong answer resets roundIndex to 0');
  ok(r3.progress.p1.wrong === 1, 'a wrong answer increments the wrong counter');
  ok(r3.progress.p1.correct === 1, 'a wrong answer does not touch the correct counter');

  // unknown player -> no-op
  const r4 = X.xrushRecordAnswer(race, 'ghost', race.cardOrder[0]);
  ok(r4 === race, 'xrushRecordAnswer no-ops for a player who never joined');

  // finishing: 3 correct in a row on a 3-round race sets finishedAt
  let r5 = X.xrushRecordAnswer(race, 'p1', race.cardOrder[0]);
  r5 = X.xrushRecordAnswer(r5, 'p1', r5.cardOrder[1]);
  r5 = X.xrushRecordAnswer(r5, 'p1', r5.cardOrder[2]);
  ok(r5.progress.p1.roundIndex === 3, 'three correct answers on a 3-round race reach roundIndex 3');
  ok(!!r5.progress.p1.finishedAt, 'reaching totalRounds sets finishedAt');
})();

// ── xrushIsRaceComplete / xrushEndRace ──────────────────────────────
(function () {
  let race = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 1, teams: [], createdBy: 'h' });
  race = X.joinRace(race, 'p1', 'A', '');
  race = X.joinRace(race, 'p2', 'B', '');
  race = X.xrushStartRace(race);
  ok(X.xrushIsRaceComplete(race) === false, 'a race with no finishers is not complete');
  ok(X.xrushIsRaceComplete({ ...race, progress: {} }) === false, 'a race with zero joined players is not "complete" (nothing to finish)');

  let r2 = X.xrushRecordAnswer(race, 'p1', race.cardOrder[0]);
  ok(X.xrushIsRaceComplete(r2) === false, 'race is not complete until EVERY joined player has finished');
  let r3 = X.xrushRecordAnswer(r2, 'p2', r2.cardOrder[0]);
  ok(X.xrushIsRaceComplete(r3) === true, 'race is complete once every joined player has finished');

  const ended = X.xrushEndRace(r3);
  ok(ended.status === 'ended' && !!ended.endedAt, 'xrushEndRace sets status/endedAt');
})();

// ── xrushTeamStandings ───────────────────────────────────────────────
(function () {
  let race = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 4, teams: ['Red', 'Blue'], createdBy: 'h' });
  race = X.joinRace(race, 'p1', 'A', 'Red');
  race = X.joinRace(race, 'p2', 'B', 'Red');
  race = X.joinRace(race, 'p3', 'C', 'Blue');
  race = X.xrushStartRace(race);
  race = X.xrushRecordAnswer(race, 'p1', race.cardOrder[0]); // Red p1 -> 1
  race = X.xrushRecordAnswer(race, 'p1', race.cardOrder[1]); // Red p1 -> 2
  race = X.xrushRecordAnswer(race, 'p3', race.cardOrder[0]); // Blue p3 -> 1

  const standings = X.xrushTeamStandings(race);
  const red = standings.find((s) => s.team === 'Red');
  const blue = standings.find((s) => s.team === 'Blue');
  ok(red.memberCount === 2, 'Red team has 2 members');
  ok(red.avgRoundIndex === 1, 'Red team avg is (2+0)/2 = 1');
  ok(blue.avgRoundIndex === 1, 'Blue team avg is 1/1 = 1');
  ok(red.progressPct === 25, 'Red progressPct = round(1/4*100) = 25');
  ok(!red.finished && !blue.finished, 'neither team is finished yet');
  ok(standings[0].avgRoundIndex >= standings[1].avgRoundIndex, 'standings are sorted highest-progress first');

  // an unassigned player groups under "(no team)" rather than crashing
  let raceNoTeam = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 2, teams: [], createdBy: 'h' });
  raceNoTeam = X.joinRace(raceNoTeam, 'solo', 'Solo', '');
  const soloStandings = X.xrushTeamStandings(raceNoTeam);
  ok(soloStandings[0].team === '(no team)', 'a teamless player groups under "(no team)"');
})();

// ── xrushMergeRaceProgress / xrushMergeRace / xrushMergeRaceList ─────
// This is the load-bearing safety property per pflx-persistence-guardrail:
// a client proposing ONLY its own player's progress must never clobber
// another player's progress, and a finished player can never be un-finished.
(function () {
  const now = Date.now();
  const localProgress = {
    p1: { playerId: 'p1', playerName: 'A', team: 'Red', roundIndex: 3, correct: 3, wrong: 0, updatedAt: now, finishedAt: now },
  };
  const incomingFromP2 = {
    p2: { playerId: 'p2', playerName: 'B', team: 'Red', roundIndex: 2, correct: 2, wrong: 1, updatedAt: now + 10 },
  };
  const merged = X.xrushMergeRaceProgress(localProgress, incomingFromP2);
  ok(!!merged.p1 && !!merged.p2, 'merge unions two different players -- neither is dropped');
  ok(!!merged.p1.finishedAt, 'a finished local player stays finished after merging an unrelated incoming update');

  // A stale incoming copy of p1 (older updatedAt, no finishedAt) must NOT un-finish p1
  const staleP1 = {
    p1: { playerId: 'p1', playerName: 'A', team: 'Red', roundIndex: 1, correct: 1, wrong: 0, updatedAt: now - 5000 },
  };
  const mergedStale = X.xrushMergeRaceProgress(localProgress, staleP1);
  ok(!!mergedStale.p1.finishedAt, 'finishedAt is sticky -- a stale incoming copy can never un-finish a player');
  ok(mergedStale.p1.roundIndex === 3, 'a stale (older updatedAt) incoming entry does not overwrite the newer local one');

  // A newer incoming copy of p1 DOES win
  const newerP1 = {
    p1: { playerId: 'p1', playerName: 'A', team: 'Red', roundIndex: 4, correct: 4, wrong: 0, updatedAt: now + 5000, finishedAt: now + 5000 },
  };
  const mergedNewer = X.xrushMergeRaceProgress(localProgress, newerP1);
  ok(mergedNewer.p1.roundIndex === 4, 'a genuinely newer incoming entry DOES win over a local one');
})();

(function () {
  const base = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 2, teams: ['Red'], createdBy: 'h' });
  const localRace = X.joinRace(base, 'p1', 'A', 'Red');
  const incomingRace = X.joinRace(base, 'p2', 'B', 'Red');

  const merged = X.xrushMergeRace(localRace, incomingRace);
  ok(!!merged.progress.p1 && !!merged.progress.p2, 'xrushMergeRace unions progress from both sides');

  // status is sticky forward-only: local 'ended' must never revert to incoming 'active'
  const endedLocal = { ...localRace, status: 'ended', endedAt: Date.now() };
  const staleActiveIncoming = { ...incomingRace, status: 'active' };
  const mergedEnded = X.xrushMergeRace(endedLocal, staleActiveIncoming);
  ok(mergedEnded.status === 'ended', 'an ended race can never be reverted to active by a stale incoming copy');

  // list-level merge: races unioned by id
  const raceA = X.newRace({ deckId: 'd1', deckName: 'D', cards: CARDS, totalRounds: 2, teams: [], createdBy: 'h' });
  const raceB = X.newRace({ deckId: 'd2', deckName: 'D2', cards: CARDS, totalRounds: 2, teams: [], createdBy: 'h' });
  const mergedList = X.xrushMergeRaceList([raceA], [raceB]);
  ok(mergedList.length === 2, 'xrushMergeRaceList unions two distinct races by id');
  const mergedListSame = X.xrushMergeRaceList([raceA], [raceA]);
  ok(mergedListSame.length === 1, 'xrushMergeRaceList collapses the same race id into one entry');
})();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
