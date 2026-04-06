// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — Zustand Store
// Global state management for battle arena
// ═══════════════════════════════════════════════════════════════════

import { create } from "zustand";
import {
  ArenaPlayer,
  Battle,
  BattleStatus,
  GameMode,
  QuizQuestion,
  BattleAnswer,
} from "./types";
import { mockArenaPlayers, mockActiveBattles, mockQuizQuestions } from "./mock-data";
import { deductXC, awardXC, reportBattleResult } from "./xcoin-bridge";

interface ArenaState {
  // Auth
  currentPlayer: ArenaPlayer | null;
  isLoggedIn: boolean;

  // Battles
  activeBattles: Battle[];
  currentBattle: Battle | null;
  availableQuestions: QuizQuestion[];

  // UI
  selectedMode: GameMode | null;
  isMatchmaking: boolean;

  // Actions — Auth
  login: (player: ArenaPlayer) => void;
  logout: () => void;

  // Actions — Battle Management
  setSelectedMode: (mode: GameMode | null) => void;
  createBattle: (mode: GameMode, wagerAmount: number, totalRounds: number) => Promise<Battle | null>;
  joinBattle: (battleId: string) => Promise<boolean>;
  startBattle: (battleId: string) => void;
  submitAnswer: (battleId: string, playerId: string, answer: string, timeMs: number) => void;
  nextRound: (battleId: string) => void;
  endBattle: (battleId: string) => void;

  // Actions — Matchmaking
  startMatchmaking: () => void;
  cancelMatchmaking: () => void;
}

export const useArenaStore = create<ArenaState>((set, get) => ({
  // ── Initial state ───────────────────────────────────────────────
  currentPlayer: null,
  isLoggedIn: false,
  activeBattles: mockActiveBattles,
  currentBattle: null,
  availableQuestions: [...mockQuizQuestions],
  selectedMode: null,
  isMatchmaking: false,

  // ── Auth ────────────────────────────────────────────────────────
  login: (player) => set({ currentPlayer: player, isLoggedIn: true }),
  logout: () => set({ currentPlayer: null, isLoggedIn: false, currentBattle: null }),

  // ── Mode Selection ──────────────────────────────────────────────
  setSelectedMode: (mode) => set({ selectedMode: mode }),

  // ── Create Battle ───────────────────────────────────────────────
  createBattle: async (mode, wagerAmount, totalRounds) => {
    const { currentPlayer, activeBattles } = get();
    if (!currentPlayer) return null;

    // Deduct wager from player via X-Coin bridge
    const success = await deductXC(currentPlayer.id, wagerAmount, `Battle wager: ${mode}`);
    if (!success) return null;

    const newBattle: Battle = {
      id: `battle-${Date.now()}`,
      mode,
      status: "waiting",
      createdBy: currentPlayer.id,
      createdAt: new Date().toISOString(),
      players: [
        {
          playerId: currentPlayer.id,
          player: currentPlayer,
          score: 0,
          isReady: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      wagerAmount,
      prizePool: wagerAmount,
      rounds: [],
      currentRound: 0,
      totalRounds,
      settings: {
        timePerQuestion: 15,
        difficulty: "mixed",
        allowSpectators: true,
        isRanked: true,
      },
    };

    set({ activeBattles: [...activeBattles, newBattle], currentBattle: newBattle });
    return newBattle;
  },

  // ── Join Battle ─────────────────────────────────────────────────
  joinBattle: async (battleId) => {
    const { currentPlayer, activeBattles } = get();
    if (!currentPlayer) return false;

    const battle = activeBattles.find((b) => b.id === battleId);
    if (!battle || battle.status !== "waiting") return false;

    // Deduct wager
    const success = await deductXC(currentPlayer.id, battle.wagerAmount, `Joined battle: ${battleId}`);
    if (!success) return false;

    const updatedBattle: Battle = {
      ...battle,
      players: [
        ...battle.players,
        {
          playerId: currentPlayer.id,
          player: currentPlayer,
          score: 0,
          isReady: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      prizePool: battle.prizePool + battle.wagerAmount,
    };

    set({
      activeBattles: activeBattles.map((b) => (b.id === battleId ? updatedBattle : b)),
      currentBattle: updatedBattle,
    });
    return true;
  },

  // ── Start Battle ────────────────────────────────────────────────
  startBattle: (battleId) => {
    const { activeBattles, availableQuestions } = get();
    const battle = activeBattles.find((b) => b.id === battleId);
    if (!battle) return;

    // Pick random questions for quiz duel
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const battleQuestions = shuffled.slice(0, battle.totalRounds);

    const updatedBattle: Battle = {
      ...battle,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      currentRound: 1,
      rounds: battleQuestions.map((q, i) => ({
        roundNumber: i + 1,
        question: q,
        answers: [],
        startedAt: i === 0 ? new Date().toISOString() : undefined,
      })),
    };

    set({
      activeBattles: activeBattles.map((b) => (b.id === battleId ? updatedBattle : b)),
      currentBattle: updatedBattle,
    });
  },

  // ── Submit Answer ───────────────────────────────────────────────
  submitAnswer: (battleId, playerId, answer, timeMs) => {
    const { activeBattles } = get();
    const battle = activeBattles.find((b) => b.id === battleId);
    if (!battle) return;

    const round = battle.rounds[battle.currentRound - 1];
    if (!round || !round.question) return;

    const isCorrect = round.question.options[round.question.correctAnswer] === answer;
    const basePoints = isCorrect ? 100 : 0;
    const speedBonus = isCorrect ? Math.max(0, Math.floor((round.question.timeLimit * 1000 - timeMs) / 100)) : 0;
    const pointsEarned = basePoints + speedBonus;

    const battleAnswer: BattleAnswer = {
      playerId,
      answer,
      isCorrect,
      timeMs,
      pointsEarned,
    };

    const updatedRounds = battle.rounds.map((r, i) =>
      i === battle.currentRound - 1
        ? { ...r, answers: [...r.answers, battleAnswer] }
        : r
    );

    const updatedPlayers = battle.players.map((p) =>
      p.playerId === playerId ? { ...p, score: p.score + pointsEarned } : p
    );

    const updatedBattle: Battle = {
      ...battle,
      rounds: updatedRounds,
      players: updatedPlayers,
    };

    set({
      activeBattles: activeBattles.map((b) => (b.id === battleId ? updatedBattle : b)),
      currentBattle: updatedBattle,
    });
  },

  // ── Next Round ──────────────────────────────────────────────────
  nextRound: (battleId) => {
    const { activeBattles } = get();
    const battle = activeBattles.find((b) => b.id === battleId);
    if (!battle) return;

    if (battle.currentRound >= battle.totalRounds) {
      // Battle is over
      get().endBattle(battleId);
      return;
    }

    const updatedRounds = battle.rounds.map((r, i) =>
      i === battle.currentRound
        ? { ...r, startedAt: new Date().toISOString() }
        : r
    );

    const updatedBattle: Battle = {
      ...battle,
      currentRound: battle.currentRound + 1,
      rounds: updatedRounds,
    };

    set({
      activeBattles: activeBattles.map((b) => (b.id === battleId ? updatedBattle : b)),
      currentBattle: updatedBattle,
    });
  },

  // ── End Battle ──────────────────────────────────────────────────
  endBattle: async (battleId) => {
    const { activeBattles } = get();
    const battle = activeBattles.find((b) => b.id === battleId);
    if (!battle) return;

    // Determine winner
    const sortedPlayers = [...battle.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    const loser = sortedPlayers[1];

    // Award XC to winner via X-Coin bridge
    if (winner && loser) {
      await awardXC(winner.playerId, battle.prizePool, `Battle victory: ${battleId}`);
      await reportBattleResult(battleId, winner.playerId, loser.playerId, battle.prizePool, battle.mode);
    }

    const updatedBattle: Battle = {
      ...battle,
      status: "completed",
      endedAt: new Date().toISOString(),
      winnerId: winner?.playerId,
      winnerReward: battle.prizePool,
    };

    set({
      activeBattles: activeBattles.map((b) => (b.id === battleId ? updatedBattle : b)),
      currentBattle: updatedBattle,
    });
  },

  // ── Matchmaking ─────────────────────────────────────────────────
  startMatchmaking: () => set({ isMatchmaking: true }),
  cancelMatchmaking: () => set({ isMatchmaking: false }),
}));
