"use client";

import { useRouter } from "next/navigation";
import { useArenaStore } from "../lib/store";
import { mockLeaderboard } from "../lib/mock-data";
import { getArenaRankInfo } from "../lib/types";
import Navbar from "../components/Navbar";
import LoginScreen from "../components/LoginScreen";

export default function LeaderboardPage() {
  const router = useRouter();
  const { currentPlayer, isLoggedIn } = useArenaStore();

  if (!isLoggedIn || !currentPlayer) return <LoginScreen />;

  const positionIcons: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="font-mono text-2xl font-bold tracking-wider text-pflx-cyan text-glow-cyan uppercase mb-2">
            Arena Leaderboard
          </h2>
          <p className="text-sm text-gray-500">
            Top fighters ranked by Arena Points. Synced with X-Coin.
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {mockLeaderboard.slice(0, 3).map((entry, i) => {
            const rankInfo = getArenaRankInfo(entry.arenaPoints);
            const heights = ["h-40", "h-48", "h-36"];
            const order = [1, 0, 2]; // 2nd, 1st, 3rd
            const idx = order[i];
            const e = mockLeaderboard[idx];
            const ri = getArenaRankInfo(e.arenaPoints);
            const isMe = e.playerId === currentPlayer.id;

            return (
              <div key={e.playerId} className={`w-36 ${heights[i]} flex flex-col items-center justify-end`}>
                <div className="text-3xl mb-1">{e.player.avatar}</div>
                <p className={`font-mono text-xs font-bold truncate w-full text-center ${isMe ? "text-pflx-gold" : "text-pflx-cyan"}`}>
                  {e.player.brandName}
                </p>
                <p className="font-mono text-lg font-bold text-white">{e.arenaPoints} AP</p>
                <div
                  className={`w-full rounded-t-xl flex items-start justify-center pt-2 ${
                    idx === 0
                      ? "bg-gradient-to-t from-pflx-gold/20 to-pflx-gold/5 border-t border-x border-pflx-gold/30"
                      : idx === 1
                      ? "bg-gradient-to-t from-gray-500/20 to-gray-500/5 border-t border-x border-gray-500/30"
                      : "bg-gradient-to-t from-amber-700/20 to-amber-700/5 border-t border-x border-amber-700/30"
                  } ${heights[i]}`}
                >
                  <span className="text-2xl">{positionIcons[idx + 1]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Leaderboard Table */}
        <div className="glass-panel overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-pflx-glass border-b border-pflx-cyan/10">
            <div className="col-span-1 text-[9px] text-gray-500 uppercase tracking-wider font-mono">#</div>
            <div className="col-span-3 text-[9px] text-gray-500 uppercase tracking-wider font-mono">Player</div>
            <div className="col-span-2 text-[9px] text-gray-500 uppercase tracking-wider font-mono text-center">Rank</div>
            <div className="col-span-1 text-[9px] text-gray-500 uppercase tracking-wider font-mono text-center">W</div>
            <div className="col-span-1 text-[9px] text-gray-500 uppercase tracking-wider font-mono text-center">L</div>
            <div className="col-span-1 text-[9px] text-gray-500 uppercase tracking-wider font-mono text-center">Win%</div>
            <div className="col-span-1 text-[9px] text-gray-500 uppercase tracking-wider font-mono text-center">🔥</div>
            <div className="col-span-2 text-[9px] text-gray-500 uppercase tracking-wider font-mono text-right">AP</div>
          </div>

          {/* Rows */}
          {mockLeaderboard.map((entry) => {
            const rankInfo = getArenaRankInfo(entry.arenaPoints);
            const isMe = entry.playerId === currentPlayer.id;

            return (
              <div
                key={entry.playerId}
                className={`grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-pflx-cyan/5 transition-colors ${
                  isMe ? "bg-pflx-cyan/5 border-l-2 border-l-pflx-cyan" : "hover:bg-pflx-glass"
                }`}
              >
                {/* Position */}
                <div className="col-span-1 font-mono text-sm font-bold text-gray-500">
                  {positionIcons[entry.position] || entry.position}
                </div>

                {/* Player */}
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  <span className="text-lg">{entry.player.avatar}</span>
                  <div className="min-w-0">
                    <p className={`font-mono text-xs font-bold truncate ${isMe ? "text-pflx-gold" : "text-gray-300"}`}>
                      {entry.player.brandName}
                    </p>
                    <p className="text-[9px] text-gray-600">{entry.player.pathway}</p>
                  </div>
                </div>

                {/* Arena Rank */}
                <div className="col-span-2 flex justify-center">
                  <div
                    className="rank-badge text-[9px]"
                    style={{
                      background: `${rankInfo.color}15`,
                      border: `1px solid ${rankInfo.color}40`,
                      color: rankInfo.color,
                    }}
                  >
                    {rankInfo.icon} {rankInfo.tier}
                  </div>
                </div>

                {/* W/L */}
                <div className="col-span-1 font-mono text-xs text-pflx-green text-center">{entry.wins}</div>
                <div className="col-span-1 font-mono text-xs text-pflx-red text-center">{entry.losses}</div>

                {/* Win Rate */}
                <div className="col-span-1 font-mono text-xs text-center" style={{
                  color: entry.winRate >= 60 ? "#00e676" : entry.winRate >= 40 ? "#ffd740" : "#ff1744"
                }}>
                  {entry.winRate}%
                </div>

                {/* Streak */}
                <div className="col-span-1 font-mono text-xs text-pflx-gold text-center">
                  {entry.streak > 0 ? `${entry.streak}🔥` : "—"}
                </div>

                {/* Arena Points */}
                <div className="col-span-2 font-mono text-sm font-bold text-right" style={{ color: rankInfo.color }}>
                  {entry.arenaPoints.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button onClick={() => router.push("/")} className="btn-arena text-xs">
            ← Back to Arena
          </button>
        </div>
      </div>
    </div>
  );
}
