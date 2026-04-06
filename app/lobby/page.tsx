"use client";

import { useRouter } from "next/navigation";
import { useArenaStore } from "../lib/store";
import Navbar from "../components/Navbar";
import LoginScreen from "../components/LoginScreen";
import PlayerCard from "../components/PlayerCard";
import { GAME_MODES, getArenaRankInfo } from "../lib/types";

export default function LobbyPage() {
  const router = useRouter();
  const { currentPlayer, isLoggedIn, activeBattles, joinBattle } = useArenaStore();

  if (!isLoggedIn || !currentPlayer) return <LoginScreen />;

  const waitingBattles = activeBattles.filter((b) => b.status === "waiting");
  const inProgressBattles = activeBattles.filter((b) => b.status === "in_progress");

  const handleJoin = async (battleId: string) => {
    const success = await joinBattle(battleId);
    if (success) {
      router.push(`/arena?battleId=${battleId}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="font-mono text-2xl font-bold tracking-wider text-pflx-cyan text-glow-cyan uppercase mb-2">
            Battle Lobby
          </h2>
          <p className="text-sm text-gray-500">
            Join an open battle or spectate an ongoing match
          </p>
        </div>

        {/* Waiting Battles */}
        <div className="mb-10">
          <h3 className="font-mono text-sm font-bold text-pflx-gold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pflx-gold animate-pulse" />
            Open Battles — Waiting for Challengers
          </h3>

          {waitingBattles.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <p className="text-gray-500 text-sm">No open battles right now.</p>
              <button onClick={() => router.push("/")} className="btn-arena mt-4 text-xs">
                Create a Battle
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {waitingBattles.map((battle) => {
                const modeConfig = GAME_MODES.find((m) => m.id === battle.mode);
                const creator = battle.players[0];
                const creatorRank = creator ? getArenaRankInfo(creator.player.arenaStats.arenaPoints) : null;
                const isOwnBattle = creator?.playerId === currentPlayer.id;

                return (
                  <div key={battle.id} className="glass-panel glass-panel-hover p-5">
                    {/* Battle Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{modeConfig?.icon}</span>
                        <div>
                          <h4 className="font-mono text-sm font-bold text-gray-300 uppercase">
                            {modeConfig?.name}
                          </h4>
                          <p className="text-[10px] text-gray-500">
                            {battle.totalRounds} rounds • {battle.players.length}/{modeConfig?.maxPlayers || 2} players
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-pflx-gold">
                          {battle.wagerAmount.toLocaleString()} XC
                        </p>
                        <p className="text-[9px] text-gray-500 uppercase">per player</p>
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="flex items-center gap-2 mb-3 bg-pflx-glass rounded-lg p-2">
                      <span className="text-lg">{creator?.player.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-pflx-cyan truncate">
                          {creator?.player.brandName}
                        </p>
                        <p className="text-[9px] text-gray-500">
                          W/L: {creator?.player.arenaStats.wins}/{creator?.player.arenaStats.losses}
                        </p>
                      </div>
                      {creatorRank && (
                        <div
                          className="rank-badge text-[9px]"
                          style={{
                            background: `${creatorRank.color}15`,
                            border: `1px solid ${creatorRank.color}40`,
                            color: creatorRank.color,
                          }}
                        >
                          {creatorRank.icon} {creatorRank.tier}
                        </div>
                      )}
                    </div>

                    {/* Prize Pool */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Prize Pool</span>
                      <span className="font-mono text-sm font-bold text-pflx-green">
                        {battle.prizePool.toLocaleString()} XC
                      </span>
                    </div>

                    {/* Join Button */}
                    {isOwnBattle ? (
                      <button
                        onClick={() => router.push(`/arena?battleId=${battle.id}`)}
                        className="btn-arena w-full justify-center text-xs py-2"
                      >
                        Return to Battle
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(battle.id)}
                        disabled={currentPlayer.xcoin < battle.wagerAmount}
                        className={`btn-arena btn-arena-gold w-full justify-center text-xs py-2 ${
                          currentPlayer.xcoin < battle.wagerAmount ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      >
                        {currentPlayer.xcoin < battle.wagerAmount
                          ? "Insufficient XC"
                          : `⚔️ Challenge — ${battle.wagerAmount.toLocaleString()} XC`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* In Progress Battles */}
        <div>
          <h3 className="font-mono text-sm font-bold text-pflx-red uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pflx-red animate-pulse" />
            Live Battles — In Progress
          </h3>

          {inProgressBattles.length === 0 ? (
            <div className="glass-panel p-6 text-center">
              <p className="text-gray-500 text-sm">No battles in progress.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {inProgressBattles.map((battle) => {
                const modeConfig = GAME_MODES.find((m) => m.id === battle.mode);
                return (
                  <div key={battle.id} className="glass-panel p-4 border-pflx-red/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{modeConfig?.icon}</span>
                      <h4 className="font-mono text-sm font-bold text-gray-300 uppercase">
                        {modeConfig?.name}
                      </h4>
                      <span className="ml-auto text-[9px] font-mono bg-pflx-red/20 text-pflx-red px-2 py-0.5 rounded uppercase">
                        Live
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Round {battle.currentRound}/{battle.totalRounds}</span>
                      <span className="font-mono text-pflx-gold">{battle.prizePool.toLocaleString()} XC</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {battle.players.map((p) => (
                        <div key={p.playerId} className="flex items-center gap-1 bg-pflx-glass rounded px-2 py-1">
                          <span className="text-sm">{p.player.avatar}</span>
                          <span className="text-[10px] font-mono text-gray-400">{p.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
