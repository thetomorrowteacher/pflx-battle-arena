"use client";

import { useState } from "react";
import { useArenaStore } from "./lib/store";
import { GAME_MODES, GameMode } from "./lib/types";
import Navbar from "./components/Navbar";
import LoginScreen from "./components/LoginScreen";
import PlayerCard from "./components/PlayerCard";
import GameModeCard from "./components/GameModeCard";
import WagerSelector from "./components/WagerSelector";
import { useRouter } from "next/navigation";

export default function ArenaHome() {
  const router = useRouter();
  const { currentPlayer, isLoggedIn, selectedMode, setSelectedMode, createBattle } = useArenaStore();
  const [showWager, setShowWager] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isLoggedIn || !currentPlayer) {
    return <LoginScreen />;
  }

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowWager(false);
  };

  const handleStartBattle = () => {
    if (!selectedMode) return;
    setShowWager(true);
  };

  const handleWagerConfirm = async (amount: number) => {
    if (!selectedMode) return;
    setIsCreating(true);
    const battle = await createBattle(selectedMode, amount, 5);
    setIsCreating(false);
    if (battle) {
      router.push(`/arena?battleId=${battle.id}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="font-mono text-3xl font-bold tracking-wider text-pflx-cyan text-glow-cyan uppercase mb-2">
            Choose Your Battle
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Select a game mode, set your wager, and enter the arena. Victory rewards XC — defeat costs it.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Player Card */}
          <div className="lg:col-span-1">
            <PlayerCard player={currentPlayer} size="lg" showStats={true} />

            {/* Recent Activity */}
            <div className="glass-panel p-4 mt-4">
              <h4 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Arena Record
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Battles</span>
                  <span className="text-xs font-mono text-gray-300">{currentPlayer.arenaStats.totalBattles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Best Streak</span>
                  <span className="text-xs font-mono text-pflx-gold">{currentPlayer.arenaStats.bestWinStreak}🔥</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Net XC P/L</span>
                  {(() => {
                    const net = currentPlayer.arenaStats.totalXCWon - currentPlayer.arenaStats.totalXCLost;
                    return (
                      <span className={`text-xs font-mono ${net >= 0 ? "text-pflx-green" : "text-pflx-red"}`}>
                        {net >= 0 ? "+" : ""}{net.toLocaleString()} XC
                      </span>
                    );
                  })()}
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Arena Points</span>
                  <span className="text-xs font-mono text-pflx-purple">{currentPlayer.arenaStats.arenaPoints} AP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Game Modes or Wager */}
          <div className="lg:col-span-2">
            {showWager ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <WagerSelector
                  balance={currentPlayer.xcoin}
                  onConfirm={handleWagerConfirm}
                  onCancel={() => setShowWager(false)}
                />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {GAME_MODES.map((mode) => (
                    <GameModeCard
                      key={mode.id}
                      mode={mode}
                      isSelected={selectedMode === mode.id}
                      onSelect={() => handleModeSelect(mode.id)}
                    />
                  ))}
                </div>

                {/* Start Battle Button */}
                {selectedMode && (
                  <div className="text-center">
                    <button
                      onClick={handleStartBattle}
                      disabled={isCreating}
                      className="btn-arena btn-arena-gold text-base px-12 py-3"
                    >
                      {isCreating ? (
                        <>
                          <span className="animate-spin">⚡</span> Creating Battle...
                        </>
                      ) : (
                        <>⚔️ Enter the Arena</>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2">
                      You&apos;ll set your XC wager next
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active Battles Banner */}
        <div className="mt-12">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-sm font-bold text-pflx-cyan uppercase tracking-wider">
                ⚡ Live Battles
              </h3>
              <button
                onClick={() => router.push("/lobby")}
                className="text-[10px] font-mono text-pflx-cyan uppercase tracking-wider hover:text-pflx-cyan/80"
              >
                View All →
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Join an existing battle in the lobby or create your own above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
