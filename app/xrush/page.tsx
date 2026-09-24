"use client";

// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — X-Rush (Sept 24, Battle Arena Games Expansion
// Phase D). A Mario-Kart/Quizlet-Live-style team quiz race, native to
// Battle Arena -- launched from X-Live via a new-tab-per-player
// mechanic (confirmed Decision 1) rather than an iframe embed.
//
// Two entry points into this page:
//   /xrush            -- host flow: pick a deck + length + (optional)
//                         X-Live teams, create the race, share it.
//   /xrush?race=<id>   -- player flow: auto-joins the given race using
//                         the logged-in Arena player's identity + the
//                         team X-Live already assigned them (if any).
//
// See app/lib/xrush.ts for the pure race-engine functions (all unit
// tested, test_xrush_v1.js) and app/lib/xrush-store.ts for the
// merge-safe Supabase persistence layer. NOT built this pass: team
// "Data Cache" powerups -- documented backlog, see docs/HANDOFF.md.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useArenaStore } from "../lib/store";
import LoginScreen from "../components/LoginScreen";
import Navbar from "../components/Navbar";
import { loadDecks, KnowledgeDeck } from "../lib/decks";
import { awardXC } from "../lib/xcoin-bridge";
import {
  XRushRace,
  XRushQuestion,
  XRUSH_LENGTH_OPTIONS,
  newRace,
  joinRace,
  xrushStartRace,
  xrushBuildQuestion,
  xrushRecordAnswer,
  xrushTeamStandings,
  xrushIsRaceComplete,
  xrushEndRace,
} from "../lib/xrush";
import { loadRace, saveRace, loadXLiveTeams, setActiveRacePointer } from "../lib/xrush-store";

const POLL_MS = 2500;

export default function XRushPage() {
  const router = useRouter();
  const params = useSearchParams();
  const raceIdParam = params.get("race");
  const { currentPlayer, isLoggedIn } = useArenaStore();

  const [decks, setDecks] = useState<KnowledgeDeck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [length, setLength] = useState<number>(10);
  const [useTeams, setUseTeams] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [race, setRace] = useState<XRushRace | null>(null);
  const [question, setQuestion] = useState<XRushQuestion | null>(null);
  const [rewardGiven, setRewardGiven] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadDecks().then(setDecks).catch(() => setDecks([]));
  }, [isLoggedIn]);

  // ── Player flow: load + auto-join a race passed via ?race= ────────
  useEffect(() => {
    if (!isLoggedIn || !currentPlayer || !raceIdParam) return;
    let cancelled = false;

    async function joinAndPoll() {
      const found = await loadRace(raceIdParam!);
      if (cancelled) return;
      if (!found) { setError("That race doesn't exist (or has ended)."); return; }

      let r = found;
      if (!r.progress[currentPlayer!.id]) {
        const teams = await loadXLiveTeams();
        const myTeam = r.teams.length ? teams.assign[currentPlayer!.id] || "" : "";
        r = joinRace(r, currentPlayer!.id, currentPlayer!.name, myTeam);
        r = await saveRace(r);
      }
      if (!cancelled) setRace(r);
    }

    joinAndPoll();
    pollRef.current = window.setInterval(async () => {
      const cur = await loadRace(raceIdParam!);
      if (cur && !cancelled) setRace((prev) => (prev ? { ...cur } : cur));
    }, POLL_MS);

    return () => { cancelled = true; if (pollRef.current) window.clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, currentPlayer?.id, raceIdParam]);

  // ── Build this player's current question whenever the race/round changes ──
  useEffect(() => {
    if (!race || !currentPlayer) { setQuestion(null); return; }
    const myProgress = race.progress[currentPlayer.id];
    if (!myProgress || race.status !== "active" || myProgress.finishedAt) { setQuestion(null); return; }
    const deck = decks.find((d) => d.id === race.deckId);
    if (!deck) { setQuestion(null); return; }
    const q = xrushBuildQuestion(deck.cards, race.cardOrder, myProgress.roundIndex, race.id, currentPlayer.id);
    setQuestion(q);
  }, [race, currentPlayer, decks]);

  // ── Award XC once, the moment MY OWN progress finishes ─────────────
  useEffect(() => {
    if (!race || !currentPlayer || rewardGiven) return;
    const mine = race.progress[currentPlayer.id];
    if (mine?.finishedAt) {
      setRewardGiven(true);
      awardXC(currentPlayer.id, 25, "arena.xrush.finish").catch(() => {});
    }
  }, [race, currentPlayer, rewardGiven]);

  const standings = useMemo(() => (race ? xrushTeamStandings(race) : []), [race]);
  const myProgress = race && currentPlayer ? race.progress[currentPlayer.id] : null;

  if (!isLoggedIn || !currentPlayer) return <LoginScreen />;

  // ── HOST SETUP SCREEN (no ?race= param yet) ─────────────────────────
  if (!raceIdParam && !race) {
    const selectedDeck = decks.find((d) => d.id === selectedDeckId);

    const handleCreate = async () => {
      if (!selectedDeck || !currentPlayer) return;
      setCreating(true);
      setError(null);
      try {
        const teamsCfg = useTeams ? await loadXLiveTeams() : { names: [], assign: {} };
        const r = newRace({
          deckId: selectedDeck.id,
          deckName: selectedDeck.name,
          cards: selectedDeck.cards,
          totalRounds: length,
          teams: teamsCfg.names,
          createdBy: currentPlayer.id,
        });
        await saveRace(r);
        await setActiveRacePointer({ raceId: r.id, deckName: selectedDeck.name, startedAt: Date.now() });
        router.push(`/xrush?race=${r.id}`);
      } catch {
        setError("Couldn't create the race -- check your connection and try again.");
      } finally {
        setCreating(false);
      }
    };

    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="font-mono text-3xl font-bold tracking-wider text-pflx-cyan text-glow-cyan uppercase mb-2 text-center">
            🏁 X-Rush
          </h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            A team quiz race -- same term for everyone, your own answer order. Wrong answer sends you back to the start.
          </p>

          <div className="glass-panel p-6 space-y-6">
            <div>
              <label className="font-mono text-xs text-pflx-gold uppercase tracking-wider">Deck</label>
              {decks.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">No decks yet -- import one from the Decks tab first.</p>
              ) : (
                <select
                  className="w-full mt-2 bg-black/40 border border-gray-700 rounded-lg px-3 py-2 font-mono text-sm text-white"
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                >
                  <option value="">Choose a deck…</option>
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.cards.length} cards)</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="font-mono text-xs text-pflx-gold uppercase tracking-wider">Race length</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {XRUSH_LENGTH_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setLength(n)}
                    className={`btn-arena text-xs px-4 py-2 ${length === n ? "btn-arena-gold" : ""}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="useTeams"
                type="checkbox"
                checked={useTeams}
                onChange={(e) => setUseTeams(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="useTeams" className="text-sm text-gray-300">
                Use X-Live's current teams (falls back to free-for-all if none are set)
              </label>
            </div>

            {error && <p className="text-sm text-pflx-red">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={!selectedDeck || creating}
              className="btn-arena btn-arena-gold w-full text-sm py-3 disabled:opacity-40"
            >
              {creating ? "Starting…" : "🏁 CREATE RACE"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <p className="text-pflx-red font-mono mb-4">{error}</p>
          <button onClick={() => router.push("/xrush")} className="btn-arena text-xs">Start a new race</button>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-pflx-cyan animate-pulse">Loading race…</p>
      </div>
    );
  }

  const isHost = race.createdBy === currentPlayer.id;
  const complete = xrushIsRaceComplete(race);

  async function handleStart() {
    if (!race) return;
    const started = xrushStartRace(race);
    const saved = await saveRace(started);
    setRace(saved);
  }

  async function handleEnd() {
    if (!race) return;
    const ended = xrushEndRace(race);
    const saved = await saveRace(ended);
    setRace(saved);
    await setActiveRacePointer(null);
  }

  async function handleAnswer(cardId: string) {
    if (!race || !currentPlayer) return;
    const updated = xrushRecordAnswer(race, currentPlayer.id, cardId);
    const saved = await saveRace(updated);
    setRace(saved);
  }

  // ── LOBBY (not started yet) ─────────────────────────────────────────
  if (race.status === "lobby") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <h1 className="font-mono text-2xl font-bold text-pflx-cyan text-glow-cyan uppercase mb-2">🏁 X-Rush -- Lobby</h1>
          <p className="text-sm text-gray-500 mb-6">{race.deckName} · {race.totalRounds} rounds</p>
          <div className="glass-panel p-6 mb-6">
            <p className="font-mono text-xs text-pflx-gold uppercase tracking-wider mb-3">Racers ({Object.keys(race.progress).length})</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.values(race.progress).map((p) => (
                <span key={p.playerId} className="glass-panel px-3 py-1 rounded-lg text-sm font-mono">
                  {p.playerName}{p.team ? ` (${p.team})` : ""}
                </span>
              ))}
            </div>
          </div>
          {isHost ? (
            <button onClick={handleStart} className="btn-arena btn-arena-gold text-sm px-8 py-3">🏁 START RACE</button>
          ) : (
            <p className="font-mono text-sm text-pflx-cyan animate-pulse">Waiting for the host to start…</p>
          )}
        </div>
      </div>
    );
  }

  // ── FINISHED (my own progress is done, or the race ended) ──────────
  if (race.status === "ended" || myProgress?.finishedAt) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <h1 className="font-mono text-2xl font-bold text-pflx-gold text-glow-gold uppercase mb-2">🏆 Race {race.status === "ended" ? "Ended" : "Finished"}</h1>
          <p className="text-sm text-gray-400 mb-6">
            {myProgress?.finishedAt ? "You finished the deck! +25 XC" : "This race has ended."}
          </p>
          <div className="glass-panel p-6 mb-6 text-left">
            <p className="font-mono text-xs text-pflx-gold uppercase tracking-wider mb-3">Standings</p>
            {standings.map((s) => (
              <div key={s.team} className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm">{s.team} {s.finished ? "✅" : ""}</span>
                <div className="flex-1 mx-3 h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-pflx-cyan" style={{ width: `${s.progressPct}%` }} />
                </div>
                <span className="font-mono text-xs text-gray-400">{s.progressPct}%</span>
              </div>
            ))}
          </div>
          {isHost && race.status !== "ended" && (
            <button onClick={handleEnd} className="btn-arena text-xs mr-3">END RACE FOR EVERYONE</button>
          )}
          <button onClick={() => router.push("/")} className="btn-arena text-xs">BACK TO ARENA</button>
        </div>
      </div>
    );
  }

  // ── ACTIVE RACE ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="glass-panel p-4 mb-6">
          <p className="font-mono text-xs text-pflx-gold uppercase tracking-wider mb-2">Standings</p>
          {standings.map((s) => (
            <div key={s.team} className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs w-24 truncate">{s.team}</span>
              <div className="flex-1 mx-3 h-2 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-pflx-cyan transition-all" style={{ width: `${s.progressPct}%` }} />
              </div>
              <span className="font-mono text-xs text-gray-400 w-10 text-right">{s.progressPct}%</span>
            </div>
          ))}
        </div>

        {myProgress && (
          <p className="text-center font-mono text-xs text-gray-500 mb-4">
            Your progress: {myProgress.roundIndex}/{race.totalRounds} · {myProgress.correct} correct · {myProgress.wrong} wrong
          </p>
        )}

        {question ? (
          <div className="glass-panel p-6 text-center">
            <p className="font-mono text-lg font-bold text-white mb-6">{question.term}</p>
            <div className="grid grid-cols-1 gap-3">
              {question.options.map((opt) => (
                <button
                  key={opt.cardId}
                  onClick={() => handleAnswer(opt.cardId)}
                  className="btn-arena text-sm py-3 text-left px-4"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center font-mono text-pflx-cyan animate-pulse">Loading your question…</p>
        )}

        {isHost && (
          <div className="text-center mt-6">
            <button onClick={handleEnd} className="btn-arena text-xs">END RACE FOR EVERYONE</button>
          </div>
        )}
      </div>
    </div>
  );
}
