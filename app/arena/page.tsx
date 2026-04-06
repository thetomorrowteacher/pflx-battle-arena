"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useArenaStore } from "../lib/store";
import Navbar from "../components/Navbar";
import LoginScreen from "../components/LoginScreen";
import PlayerCard from "../components/PlayerCard";
import { mockArenaPlayers } from "../lib/mock-data";

function ArenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const battleId = searchParams.get("battleId");

  const {
    currentPlayer,
    isLoggedIn,
    currentBattle,
    activeBattles,
    startBattle,
    submitAnswer,
    nextRound,
  } = useArenaStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());
  const [showResult, setShowResult] = useState(false);

  // Find the battle
  const battle = currentBattle?.id === battleId
    ? currentBattle
    : activeBattles.find((b) => b.id === battleId) || null;

  // Timer effect
  useEffect(() => {
    if (!battle || battle.status !== "in_progress") return;
    const round = battle.rounds[battle.currentRound - 1];
    if (!round?.question) return;

    setTimeLeft(round.question.timeLimit);
    setRoundStartTime(Date.now());
    setSelectedAnswer(null);
    setShowResult(false);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [battle?.currentRound, battle?.status]);

  // ── Not logged in ───────────────────────────────────────────────
  if (!isLoggedIn || !currentPlayer) return <LoginScreen />;

  // ── Battle not found ────────────────────────────────────────────
  if (!battle) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="font-mono text-xl text-pflx-red text-glow-red mb-4">Battle Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">This battle doesn&apos;t exist or has been cancelled.</p>
          <button onClick={() => router.push("/")} className="btn-arena">
            Return to Arena
          </button>
        </div>
      </div>
    );
  }

  const currentRound = battle.rounds[battle.currentRound - 1];
  const question = currentRound?.question;
  const opponent = battle.players.find((p) => p.playerId !== currentPlayer.id);
  const myScore = battle.players.find((p) => p.playerId === currentPlayer.id)?.score || 0;
  const opponentScore = opponent?.score || 0;
  const alreadyAnswered = currentRound?.answers.some((a) => a.playerId === currentPlayer.id);

  // ── Waiting State ───────────────────────────────────────────────
  if (battle.status === "waiting") {
    const isCreator = battle.createdBy === currentPlayer.id;
    const hasEnoughPlayers = battle.players.length >= 2;

    const handleSimulate = () => {
      const simOpponent = mockArenaPlayers.find((p) => p.id !== currentPlayer.id) || mockArenaPlayers[1];
      battle.players.push({
        playerId: simOpponent.id,
        player: simOpponent,
        score: 0,
        isReady: true,
        joinedAt: new Date().toISOString(),
      });
      battle.prizePool += battle.wagerAmount;
      startBattle(battle.id);
    };

    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="glass-panel p-8 text-center">
            <div className="text-5xl mb-4">⚔️</div>
            <h2 className="font-mono text-xl font-bold text-pflx-cyan text-glow-cyan uppercase tracking-wider mb-2">
              Waiting for Challenger
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Share this battle or wait for someone to join from the lobby.
            </p>

            {/* Players */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-48">
                <PlayerCard player={currentPlayer} size="sm" showStats={false} />
              </div>
              <div className="vs-divider">VS</div>
              <div className="w-48 glass-panel p-6 border-dashed border-gray-700 text-center">
                <div className="text-3xl mb-2 opacity-30">❓</div>
                <p className="text-xs text-gray-600 font-mono">Waiting...</p>
              </div>
            </div>

            {/* Wager Info */}
            <div className="bg-pflx-glass rounded-lg p-3 mb-6 max-w-xs mx-auto">
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Wager</span>
                <span className="font-mono text-sm text-pflx-gold">{battle.wagerAmount.toLocaleString()} XC</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Prize Pool</span>
                <span className="font-mono text-sm text-pflx-green">{battle.prizePool.toLocaleString()} XC</span>
              </div>
            </div>

            {isCreator && hasEnoughPlayers ? (
              <button onClick={() => startBattle(battle.id)} className="btn-arena btn-arena-gold text-sm px-8 py-3">
                ⚡ Start Battle
              </button>
            ) : isCreator ? (
              <div>
                <p className="text-[10px] text-gray-600 mb-3">Demo: simulate an opponent joining</p>
                <button onClick={handleSimulate} className="btn-arena text-xs">
                  🤖 Simulate Opponent & Start
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ── Completed State ─────────────────────────────────────────────
  if (battle.status === "completed") {
    const isWinner = battle.winnerId === currentPlayer.id;
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className={`glass-panel p-8 text-center ${isWinner ? "border-pflx-gold/30 shadow-gold-glow" : "border-pflx-red/30"}`}>
            <div className="text-6xl mb-4">{isWinner ? "🏆" : "💀"}</div>
            <h2 className={`font-mono text-2xl font-bold tracking-wider uppercase mb-2 ${
              isWinner ? "text-pflx-gold text-glow-gold" : "text-pflx-red text-glow-red"
            }`}>
              {isWinner ? "Victory!" : "Defeat"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isWinner
                ? `You won ${battle.winnerReward?.toLocaleString()} XC!`
                : `You lost ${battle.wagerAmount.toLocaleString()} XC.`}
            </p>

            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">{currentPlayer.brandName}</p>
                <p className="font-mono text-3xl font-bold text-pflx-cyan">{myScore}</p>
              </div>
              <div className="text-xl text-gray-600">—</div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">{opponent?.player.brandName || "Opponent"}</p>
                <p className="font-mono text-3xl font-bold text-pflx-red">{opponentScore}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/")} className="btn-arena text-xs">
                Back to Arena
              </button>
              <button onClick={() => router.push("/leaderboard")} className="btn-arena btn-arena-gold text-xs">
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── In-Progress State (Quiz Duel) ──────────────────────────────
  const handleAnswer = (answer: string) => {
    if (alreadyAnswered || !question) return;
    setSelectedAnswer(answer);
    const timeMs = Date.now() - roundStartTime;
    submitAnswer(battle.id, currentPlayer.id, answer, timeMs);

    // Simulate opponent answering
    setTimeout(() => {
      if (opponent) {
        const opponentCorrect = Math.random() > 0.4;
        const opponentAnswer = question.options[opponentCorrect ? question.correctAnswer : (question.correctAnswer + 1) % question.options.length];
        submitAnswer(battle.id, opponent.playerId, opponentAnswer, timeMs + Math.random() * 3000);
      }
      setShowResult(true);

      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
        if (battle.currentRound >= battle.totalRounds) {
          // End the battle
          const { endBattle } = useArenaStore.getState();
          endBattle(battle.id);
        } else {
          nextRound(battle.id);
        }
      }, 2500);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Battle Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="glass-panel px-3 py-1.5 rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Round</span>
              <span className="font-mono text-sm font-bold text-pflx-cyan ml-2">
                {battle.currentRound}/{battle.totalRounds}
              </span>
            </div>
          </div>
          <div className="glass-panel px-4 py-1.5 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Prize</span>
            <span className="font-mono text-sm font-bold text-pflx-gold ml-2">
              {battle.prizePool.toLocaleString()} XC
            </span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentPlayer.avatar}</span>
            <div>
              <p className="font-mono text-xs text-pflx-cyan">{currentPlayer.brandName}</p>
              <p className="font-mono text-2xl font-bold text-white">{myScore}</p>
            </div>
          </div>
          <div className="vs-divider text-xl">VS</div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-mono text-xs text-pflx-red">{opponent?.player.brandName || "Opponent"}</p>
              <p className="font-mono text-2xl font-bold text-white">{opponentScore}</p>
            </div>
            <span className="text-2xl">{opponent?.player.avatar || "❓"}</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full bg-pflx-glass rounded-full h-1.5 mb-6">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft > 10 ? "bg-pflx-cyan" : timeLeft > 5 ? "bg-pflx-gold" : "bg-pflx-red animate-pulse"
            }`}
            style={{ width: `${(timeLeft / (question?.timeLimit || 15)) * 100}%` }}
          />
        </div>

        {/* Question */}
        {question && (
          <div className="glass-panel p-6 mb-6 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
              {question.category.replace(/_/g, " ")} • {question.difficulty}
            </p>
            <h3 className="font-mono text-lg text-white font-bold leading-relaxed">
              {question.question}
            </h3>
          </div>
        )}

        {/* Answer Options */}
        {question && (
          <div className="grid sm:grid-cols-2 gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = index === question.correctAnswer;
              const showCorrectness = showResult;

              return (
                <button
                  key={index}
                  onClick={() => !alreadyAnswered && handleAnswer(option)}
                  disabled={!!alreadyAnswered}
                  className={`glass-panel p-4 text-left transition-all duration-300 ${
                    showCorrectness && isCorrect
                      ? "border-pflx-green/50 bg-pflx-green/10 shadow-[0_0_20px_rgba(0,230,118,0.2)]"
                      : showCorrectness && isSelected && !isCorrect
                      ? "border-pflx-red/50 bg-pflx-red/10"
                      : isSelected
                      ? "border-pflx-cyan/50 shadow-cyan-glow"
                      : alreadyAnswered
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-pflx-cyan/30 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold ${
                        showCorrectness && isCorrect
                          ? "bg-pflx-green/20 text-pflx-green"
                          : showCorrectness && isSelected && !isCorrect
                          ? "bg-pflx-red/20 text-pflx-red"
                          : isSelected
                          ? "bg-pflx-cyan/20 text-pflx-cyan"
                          : "bg-pflx-glass text-gray-500"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`text-sm ${
                      showCorrectness && isCorrect ? "text-pflx-green font-bold" : "text-gray-300"
                    }`}>
                      {option}
                    </span>
                    {showCorrectness && isCorrect && (
                      <span className="ml-auto text-pflx-green">✓</span>
                    )}
                    {showCorrectness && isSelected && !isCorrect && (
                      <span className="ml-auto text-pflx-red">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-pflx-cyan animate-pulse">Loading Arena...</div>
      </div>
    }>
      <ArenaContent />
    </Suspense>
  );
}
