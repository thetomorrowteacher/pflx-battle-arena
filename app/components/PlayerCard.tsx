"use client";

import { ArenaPlayer, getArenaRankInfo } from "../lib/types";

interface PlayerCardProps {
  player: ArenaPlayer;
  size?: "sm" | "md" | "lg";
  showStats?: boolean;
  isOpponent?: boolean;
  highlight?: boolean;
}

export default function PlayerCard({
  player,
  size = "md",
  showStats = true,
  isOpponent = false,
  highlight = false,
}: PlayerCardProps) {
  const rankInfo = getArenaRankInfo(player.arenaStats.arenaPoints);
  const winRate = player.arenaStats.totalBattles > 0
    ? Math.round((player.arenaStats.wins / player.arenaStats.totalBattles) * 100)
    : 0;

  const borderColor = isOpponent ? "border-pflx-red/30" : "border-pflx-cyan/20";
  const glowClass = highlight
    ? isOpponent
      ? "shadow-red-glow"
      : "shadow-cyan-glow"
    : "";

  return (
    <div
      className={`glass-panel ${borderColor} ${glowClass} transition-all duration-300 ${
        size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4"
      }`}
    >
      {/* Header: Avatar + Name + Rank */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`rounded-full bg-pflx-glass border flex items-center justify-center ${
            isOpponent ? "border-pflx-red/30" : "border-pflx-cyan/30"
          } ${size === "sm" ? "w-10 h-10 text-lg" : size === "lg" ? "w-16 h-16 text-3xl" : "w-12 h-12 text-2xl"}`}
        >
          {player.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-mono font-bold truncate ${
              isOpponent ? "text-pflx-red" : "text-pflx-cyan"
            } ${size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"}`}
          >
            {player.brandName || player.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              {player.pathway}
            </span>
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
        </div>
      </div>

      {/* Stats Grid */}
      {showStats && (
        <div className={`grid gap-2 ${size === "lg" ? "grid-cols-4" : "grid-cols-3"}`}>
          <StatBox label="W/L" value={`${player.arenaStats.wins}/${player.arenaStats.losses}`} />
          <StatBox label="Win %" value={`${winRate}%`} color={winRate >= 60 ? "#00e676" : winRate >= 40 ? "#ffd740" : "#ff1744"} />
          <StatBox label="Streak" value={`${player.arenaStats.winStreak}🔥`} />
          {size === "lg" && (
            <StatBox label="XC Won" value={player.arenaStats.totalXCWon.toLocaleString()} color="#ffd740" />
          )}
        </div>
      )}

      {/* XC Balance Bar */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</span>
        <span className="font-mono text-xs font-bold text-pflx-gold">
          {player.xcoin.toLocaleString()} XC
        </span>
      </div>

      {/* Rank + Level */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Evolution Rank</span>
        <span className="font-mono text-xs text-gray-400">
          Rank {player.rank} • Lv.{player.level}
        </span>
      </div>

      {/* Badges */}
      {player.badgeCounts && size !== "sm" && (
        <div className="mt-3 flex items-center gap-1">
          <BadgeDot color="#ff1744" count={player.badgeCounts.signature} label="SIG" />
          <BadgeDot color="#ffd740" count={player.badgeCounts.executive} label="EXE" />
          <BadgeDot color="#7c4dff" count={player.badgeCounts.premium} label="PRE" />
          <BadgeDot color="#2979ff" count={player.badgeCounts.primary} label="PRI" />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-pflx-glass rounded-lg p-2 text-center">
      <p className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="font-mono text-xs font-bold mt-0.5" style={{ color: color || "#e0e0e0" }}>
        {value}
      </p>
    </div>
  );
}

function BadgeDot({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div className="flex items-center gap-1 bg-pflx-glass rounded px-1.5 py-0.5">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[9px] font-mono text-gray-400">{count}</span>
    </div>
  );
}
