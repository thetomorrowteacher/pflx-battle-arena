"use client";

import { useState } from "react";

interface WagerSelectorProps {
  balance: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

const PRESET_WAGERS = [100, 250, 500, 1000, 2500, 5000];

export default function WagerSelector({ balance, onConfirm, onCancel }: WagerSelectorProps) {
  const [wagerAmount, setWagerAmount] = useState(500);
  const [customMode, setCustomMode] = useState(false);

  const canAfford = wagerAmount <= balance;

  return (
    <div className="glass-panel p-6 max-w-md w-full">
      <h3 className="font-mono text-sm font-bold text-pflx-gold text-glow-gold tracking-wider uppercase mb-1">
        Set Your Wager
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Your balance: <span className="text-pflx-gold font-mono font-bold">{balance.toLocaleString()} XC</span>
      </p>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESET_WAGERS.map((amount) => (
          <button
            key={amount}
            onClick={() => { setWagerAmount(amount); setCustomMode(false); }}
            disabled={amount > balance}
            className={`py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              wagerAmount === amount && !customMode
                ? "bg-pflx-gold/20 border border-pflx-gold/50 text-pflx-gold shadow-gold-glow"
                : amount > balance
                ? "bg-pflx-glass border border-gray-700/30 text-gray-600 cursor-not-allowed"
                : "bg-pflx-glass border border-pflx-cyan/10 text-gray-400 hover:border-pflx-cyan/30"
            }`}
          >
            {amount.toLocaleString()} XC
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-4">
        <button
          onClick={() => setCustomMode(true)}
          className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${
            customMode ? "text-pflx-cyan" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          Custom amount →
        </button>
        {customMode && (
          <input
            type="number"
            min={10}
            max={balance}
            value={wagerAmount}
            onChange={(e) => setWagerAmount(Math.max(10, parseInt(e.target.value) || 0))}
            className="w-full bg-pflx-darker border border-pflx-cyan/20 rounded-lg px-4 py-2 font-mono text-sm text-pflx-gold focus:border-pflx-gold/50 focus:outline-none"
            placeholder="Enter amount..."
          />
        )}
      </div>

      {/* Wager Summary */}
      <div className="bg-pflx-glass rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Your Wager</span>
          <span className="font-mono text-lg font-bold text-pflx-gold">
            {wagerAmount.toLocaleString()} XC
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Potential Prize</span>
          <span className="font-mono text-sm font-bold text-pflx-green">
            {(wagerAmount * 2).toLocaleString()} XC
          </span>
        </div>
        {!canAfford && (
          <p className="text-[10px] text-pflx-red font-mono mt-2">
            ⚠ Insufficient XC balance
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-arena btn-arena-red flex-1 justify-center text-xs py-2">
          Cancel
        </button>
        <button
          onClick={() => canAfford && onConfirm(wagerAmount)}
          disabled={!canAfford}
          className={`btn-arena btn-arena-gold flex-1 justify-center text-xs py-2 ${
            !canAfford ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          Lock In Wager
        </button>
      </div>
    </div>
  );
}
