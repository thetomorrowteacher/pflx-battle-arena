"use client";

import { GameModeConfig } from "../lib/types";

interface GameModeCardProps {
  mode: GameModeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export default function GameModeCard({ mode, isSelected, onSelect }: GameModeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`glass-panel glass-panel-hover p-5 text-left w-full transition-all duration-300 ${
        isSelected
          ? "border-pflx-cyan/50 shadow-cyan-glow"
          : "border-pflx-cyan/10 hover:border-pflx-cyan/25"
      }`}
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          isSelected
            ? "bg-pflx-cyan/15 border border-pflx-cyan/30"
            : "bg-pflx-glass border border-pflx-cyan/10"
        }`}>
          {mode.icon}
        </div>
        <div>
          <h3 className={`font-mono text-sm font-bold tracking-wider uppercase ${
            isSelected ? "text-pflx-cyan text-glow-cyan" : "text-gray-300"
          }`}>
            {mode.name}
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {mode.minPlayers === mode.maxPlayers
              ? `${mode.minPlayers} players`
              : `${mode.minPlayers}-${mode.maxPlayers} players`}
            {" • "}
            ~{mode.estimatedMinutes} min
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed">
        {mode.description}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-2 mt-3">
        {mode.teamBased && (
          <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-pflx-purple/15 text-pflx-purple border border-pflx-purple/20">
            Team
          </span>
        )}
        {mode.requiredBadges && mode.requiredBadges.length > 0 && (
          <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-pflx-gold/15 text-pflx-gold border border-pflx-gold/20">
            Badge-Gated
          </span>
        )}
        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-pflx-green/15 text-pflx-green border border-pflx-green/20">
          Ranked
        </span>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-pflx-cyan">
          <div className="w-2 h-2 rounded-full bg-pflx-cyan animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider">Selected</span>
        </div>
      )}
    </button>
  );
}
