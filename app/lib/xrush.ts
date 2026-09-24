// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — X-Rush (Sept 24, Battle Arena Games Expansion
// Phase D): a Mario-Kart/Quizlet-Live-style team quiz race, native to
// Battle Arena. Launched from an X-Live session via a new-tab-per-
// player mechanic (confirmed Decision 1, plan file) rather than an
// iframe embed.
//
// CORE MECHANIC (Quizlet Live): every racer answers the SAME shared
// term/definition deck, but each racer's own screen shows the choices
// in an INDEPENDENTLY randomized position (xrushBuildOptions is a pure,
// deterministic function of raceId+cardId+playerId, so a reload never
// reshuffles a racer's current question, but two racers never see the
// same arrangement). A wrong answer resets that racer's OWN progress
// to the start of the deck (Ennis's explicit spec) -- it never affects
// any other racer.
//
// SYNC: a single shared Supabase app_data row (XRUSH_RACES_KEY),
// merge-safe read-merge-write per pflx-persistence-guardrail -- the
// SAME discipline mergeSession()/mergeSparMatch() already use in
// x-live-check. Each client only ever proposes ITS OWN player's
// progress entry; xrushMergeRace unions races by id and, within a
// race, unions `progress` by playerId with per-entry updatedAt as the
// tiebreak, so two racers finishing at once can never clobber each
// other's result.
//
// Team score = each team's average racer progress (0..totalRounds);
// a team is "finished" once EVERY member of that team has completed
// totalRounds.
//
// NOT built this pass (documented backlog, not faked): team-targeted
// "Data Cache" powerups (the Mario-Kart-item-box mechanic) and energy
// orbs. This ships the real, working core race first -- the same
// "core mechanic first, juice later" sequencing every other phase in
// this plan has used. See docs/HANDOFF.md PATCH ARENA xrush-1 entry.
// ═══════════════════════════════════════════════════════════════════

import type { KnowledgeCard } from "./decks";

export const XRUSH_RACES_KEY = "pflx_xrush_races";
export const XRUSH_ACTIVE_KEY = "pflx_xrush_active"; // small pointer row X-Live polls: {raceId, startedAt} | null
export const MAX_OPTIONS = 4;
export const MAX_ROUNDS = 60;

export interface XRushPlayerProgress {
  playerId: string;
  playerName: string;
  team: string; // team name, or '' for a free-for-all (no teams) race
  roundIndex: number; // 0-based index into race.cardOrder the player is currently answering
  correct: number;
  wrong: number;
  updatedAt: number;
  finishedAt?: number;
}

export interface XRushRace {
  id: string;
  deckId: string;
  deckName: string;
  cardOrder: string[]; // fixed shared order of card ids -- the "track"
  totalRounds: number; // <= cardOrder.length
  teams: string[]; // team names in play, [] = free-for-all
  status: "lobby" | "active" | "ended";
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  endedAt?: number;
  progress: Record<string, XRushPlayerProgress>;
}

function uid(prefix: string): string {
  return prefix + "_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
}

// ── Deterministic seeded RNG (mulberry32) ──────────────────────────
// Pure, no Math.random -- the whole point is that the SAME seed always
// produces the SAME sequence, so a given player sees a stable option
// arrangement for a given round across reloads, while a different
// player (different seed, since playerId is part of the seed) sees a
// different one.
export function seedFromString(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// ── Track building (host action) ───────────────────────────────────
export function buildCardOrder(cards: KnowledgeCard[], count: number, seed: number): string[] {
  const ids = cards.map((c) => c.id);
  const shuffled = seededShuffle(ids, seed);
  const n = Math.max(1, Math.min(count, shuffled.length, MAX_ROUNDS));
  return shuffled.slice(0, n);
}

export function newRace(opts: {
  deckId: string;
  deckName: string;
  cards: KnowledgeCard[];
  totalRounds: number;
  teams: string[];
  createdBy: string;
}): XRushRace {
  const now = Date.now();
  const cardOrder = buildCardOrder(opts.cards, opts.totalRounds, seedFromString(opts.deckId + ":" + now));
  return {
    id: uid("race"),
    deckId: opts.deckId,
    deckName: opts.deckName,
    cardOrder,
    totalRounds: cardOrder.length,
    teams: (opts.teams || []).filter(Boolean),
    status: "lobby",
    createdBy: opts.createdBy,
    createdAt: now,
    updatedAt: now,
    progress: {},
  };
}

export function joinRace(race: XRushRace, playerId: string, playerName: string, team: string): XRushRace {
  if (race.progress[playerId]) return race; // already joined, no-op
  const now = Date.now();
  return {
    ...race,
    updatedAt: now,
    progress: {
      ...race.progress,
      [playerId]: { playerId, playerName, team: team || "", roundIndex: 0, correct: 0, wrong: 0, updatedAt: now },
    },
  };
}

// ── Per-player option arrangement (the Quizlet Live mechanic) ──────
export interface XRushOption {
  cardId: string;
  text: string;
  correct: boolean;
}

export interface XRushQuestion {
  cardId: string;
  term: string;
  options: XRushOption[];
}

/**
 * Deterministic per-(race, player, round) question: the correct
 * definition plus up to MAX_OPTIONS-1 distractor definitions drawn
 * from OTHER cards in the same deck, shuffled into a position unique
 * to this player. Degrades gracefully when the deck has too few cards
 * for a full 4-option spread (never duplicates the correct answer,
 * never crashes on a 1- or 2-card deck).
 */
export function xrushBuildQuestion(
  cards: KnowledgeCard[],
  cardOrder: string[],
  roundIndex: number,
  raceId: string,
  playerId: string
): XRushQuestion | null {
  if (roundIndex < 0 || roundIndex >= cardOrder.length) return null;
  const cardId = cardOrder[roundIndex];
  const byId: Record<string, KnowledgeCard> = {};
  for (const c of cards) byId[c.id] = c;
  const correctCard = byId[cardId];
  if (!correctCard) return null;

  const seed = seedFromString(raceId + ":" + playerId + ":" + roundIndex + ":" + cardId);
  const others = cards.filter((c) => c.id !== cardId);
  const shuffledOthers = seededShuffle(others, seed);
  const distractorCount = Math.min(MAX_OPTIONS - 1, shuffledOthers.length);
  const distractors = shuffledOthers.slice(0, distractorCount);

  const options: XRushOption[] = [
    { cardId: correctCard.id, text: correctCard.definition, correct: true },
    ...distractors.map((c) => ({ cardId: c.id, text: c.definition, correct: false })),
  ];
  const shuffledOptions = seededShuffle(options, seed ^ 0x9e3779b9);

  return { cardId, term: correctCard.term, options: shuffledOptions };
}

// ── Answer resolution (pure) ────────────────────────────────────────
export function xrushRecordAnswer(
  race: XRushRace,
  playerId: string,
  chosenCardId: string
): XRushRace {
  const p = race.progress[playerId];
  if (!p) return race;
  if (race.status !== "active") return race;
  const expectedCardId = race.cardOrder[p.roundIndex];
  const correct = !!expectedCardId && chosenCardId === expectedCardId;
  const now = Date.now();
  const next: XRushPlayerProgress = correct
    ? {
        ...p,
        roundIndex: p.roundIndex + 1,
        correct: p.correct + 1,
        updatedAt: now,
        finishedAt: p.roundIndex + 1 >= race.totalRounds ? now : p.finishedAt,
      }
    : { ...p, roundIndex: 0, wrong: p.wrong + 1, updatedAt: now };
  return { ...race, updatedAt: now, progress: { ...race.progress, [playerId]: next } };
}

export function xrushStartRace(race: XRushRace): XRushRace {
  const now = Date.now();
  return { ...race, status: "active", startedAt: now, updatedAt: now };
}

export function xrushIsRaceComplete(race: XRushRace): boolean {
  const entries = Object.values(race.progress);
  if (!entries.length) return false;
  return entries.every((p) => !!p.finishedAt);
}

export function xrushEndRace(race: XRushRace): XRushRace {
  const now = Date.now();
  return { ...race, status: "ended", endedAt: now, updatedAt: now };
}

// ── Team aggregation (pure) ─────────────────────────────────────────
export interface XRushTeamStanding {
  team: string;
  memberCount: number;
  avgRoundIndex: number; // 0..totalRounds
  progressPct: number; // 0..100
  finished: boolean;
}

export function xrushTeamStandings(race: XRushRace): XRushTeamStanding[] {
  const byTeam: Record<string, XRushPlayerProgress[]> = {};
  for (const p of Object.values(race.progress)) {
    const key = p.team || "(no team)";
    (byTeam[key] = byTeam[key] || []).push(p);
  }
  const totalRounds = Math.max(1, race.totalRounds);
  return Object.keys(byTeam)
    .map((team) => {
      const members = byTeam[team];
      const sum = members.reduce((s, m) => s + m.roundIndex, 0);
      const avg = sum / members.length;
      return {
        team,
        memberCount: members.length,
        avgRoundIndex: avg,
        progressPct: Math.min(100, Math.round((avg / totalRounds) * 100)),
        finished: members.every((m) => !!m.finishedAt),
      };
    })
    .sort((a, b) => b.avgRoundIndex - a.avgRoundIndex);
}

// ── Merge-safe sync (pflx-persistence-guardrail discipline) ────────
// A client NEVER overwrites another player's progress entry -- it
// only ever proposes its own. Within a race: union progress by
// playerId, newer `updatedAt` wins per entry, a finishedAt is sticky
// (never un-finished by a stale merge). Across races: union by id,
// a terminal 'ended' status is sticky (a stale 'active'/'lobby' copy
// can never resurrect an ended race), otherwise newer race-level
// updatedAt wins for scalar fields (status/startedAt/etc).
export function xrushMergeRaceProgress(
  local: Record<string, XRushPlayerProgress>,
  incoming: Record<string, XRushPlayerProgress>
): Record<string, XRushPlayerProgress> {
  const out: Record<string, XRushPlayerProgress> = { ...local };
  for (const pid of Object.keys(incoming || {})) {
    const inc = incoming[pid];
    const cur = out[pid];
    if (!cur) { out[pid] = inc; continue; }
    // finishedAt is sticky: never drop it once set, regardless of timestamps
    const finishedAt = cur.finishedAt || inc.finishedAt;
    const winner = (inc.updatedAt || 0) > (cur.updatedAt || 0) ? inc : cur;
    out[pid] = { ...winner, finishedAt };
  }
  return out;
}

export function xrushMergeRace(local: XRushRace, incoming: XRushRace): XRushRace {
  const statusRank: Record<XRushRace["status"], number> = { lobby: 0, active: 1, ended: 2 };
  // status only ever advances forward (lobby -> active -> ended), never backward
  const status = statusRank[incoming.status] > statusRank[local.status] ? incoming.status : local.status;
  const base = (incoming.updatedAt || 0) > (local.updatedAt || 0) ? incoming : local;
  return {
    ...base,
    status,
    startedAt: local.startedAt || incoming.startedAt,
    endedAt: local.endedAt || incoming.endedAt,
    progress: xrushMergeRaceProgress(local.progress, incoming.progress),
    updatedAt: Math.max(local.updatedAt || 0, incoming.updatedAt || 0),
  };
}

export function xrushMergeRaceList(local: XRushRace[], incoming: XRushRace[]): XRushRace[] {
  const byId: Record<string, XRushRace> = {};
  for (const r of local || []) byId[r.id] = r;
  for (const r of incoming || []) byId[r.id] = byId[r.id] ? xrushMergeRace(byId[r.id], r) : r;
  return Object.values(byId).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

// ── Length picker (per Ennis: fixed interval list, not free-form) ──
export const XRUSH_LENGTH_OPTIONS = [3, 5, 7, 10, 12, 15, 20, 30];
