"use client";

import Link from "next/link";
import { useArenaStore } from "../lib/store";
import { getArenaRankInfo } from "../lib/types";

export default function Navbar() {
  const { currentPlayer, isLoggedIn, logout } = useArenaStore();

  return (
    <nav className="glass-panel border-b border-pflx-cyan/10 sticky top-0 z-50 rounded-none">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pflx-cyan/20 to-pflx-purple/20 border border-pflx-cyan/30 flex items-center justify-center text-xl group-hover:shadow-cyan-glow transition-shadow">
            ⚔️
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-widest text-pflx-cyan text-glow-cyan">
              PFLX BATTLE ARENA
            </h1>
            <p className="text-[10px] text-gray-500 tracking-wider uppercase">
              Enter • Fight • Conquer
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-xs tracking-wider text-gray-400 hover:text-pflx-cyan transition-colors uppercase"
          >
            Arena
          </Link>
          <Link
            href="/lobby"
            className="font-mono text-xs tracking-wider text-gray-400 hover:text-pflx-cyan transition-colors uppercase"
          >
            Lobby
          </Link>
          <Link
            href="/leaderboard"
            className="font-mono text-xs tracking-wider text-gray-400 hover:text-pflx-cyan transition-colors uppercase"
          >
            Leaderboard
          </Link>
          <Link
            href="/cartridges"
            className="font-mono text-xs tracking-wider text-gray-400 hover:text-pflx-gold transition-colors uppercase"
          >
            Cartridges
          </Link>
          <Link
            href="/settings"
            className="font-mono text-xs tracking-wider text-gray-400 hover:text-pflx-purple transition-colors uppercase host-only admin-only"
          >
            Settings
          </Link>
        </div>

        {/* Player Info / Login */}
        {isLoggedIn && currentPlayer ? (
          <div className="flex items-center gap-4">
            {/* XC Balance */}
            <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-pflx-gold text-xs font-mono font-bold">
                {currentPlayer.xcoin.toLocaleString()} XC
              </span>
            </div>

            {/* Arena Rank */}
            {(() => {
              const rankInfo = getArenaRankInfo(currentPlayer.arenaStats.arenaPoints);
              return (
                <div
                  className="rank-badge"
                  style={{
                    background: `${rankInfo.color}15`,
                    border: `1px solid ${rankInfo.color}40`,
                    color: rankInfo.color,
                  }}
                >
                  {rankInfo.icon} {rankInfo.tier}
                </div>
              );
            })()}

            {/* Player Avatar & Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pflx-glass border border-pflx-cyan/20 flex items-center justify-center text-sm">
                {currentPlayer.avatar}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-mono font-semibold text-pflx-cyan">
                  {currentPlayer.brandName || currentPlayer.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  Rank {currentPlayer.rank} • Lv.{currentPlayer.level}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="text-[10px] font-mono text-gray-500 hover:text-pflx-red transition-colors uppercase tracking-wider"
            >
              Exit
            </button>
          </div>
        ) : (
          <Link href="/" className="btn-arena text-xs py-2 px-4">
            Enter Arena
          </Link>
        )}
      </div>
    </nav>
  );
}
