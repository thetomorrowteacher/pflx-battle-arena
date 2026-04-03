"use client";

import { useState, useEffect } from "react";
import { useArenaStore } from "../lib/store";
import { mockArenaPlayers } from "../lib/mock-data";

export default function LoginScreen() {
  const { login } = useArenaStore();
  const [brandName, setBrandName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showQuickSelect, setShowQuickSelect] = useState(true);

  // PFLX SSO AUTO-LOGIN — bypass login when embedded in PFLX Overlay
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sso = params.get("sso");
    const brand = params.get("brand");
    if (sso === "pflx" && brand) {
      const player = mockArenaPlayers.find(
        (p) => p.brandName?.toLowerCase() === brand.toLowerCase()
      );
      if (player) {
        login(player);
        return;
      }
    }
  }, [login]);

  const handleLogin = () => {
    // Mock login: find player by brand name (case-insensitive)
    const player = mockArenaPlayers.find(
      (p) => p.brandName?.toLowerCase() === brandName.toLowerCase()
    );
    if (player) {
      login(player);
      setError("");
    } else {
      setError("Player not found. Try a brand name from the roster.");
    }
  };

  const handleQuickLogin = (playerId: string) => {
    const player = mockArenaPlayers.find((p) => p.id === playerId);
    if (player) login(player);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-lg w-full text-center">
        {/* Arena Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-pflx-cyan/20 to-pflx-red/20 border border-pflx-cyan/30 flex items-center justify-center text-4xl mb-4 shadow-cyan-glow">
            ⚔️
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-widest text-pflx-cyan text-glow-cyan">
            BATTLE ARENA
          </h1>
          <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">
            Powered by PFLX X-Coin
          </p>
        </div>

        {/* Quick Select (dev mode) */}
        {showQuickSelect && (
          <div className="mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
              Quick Select Player
            </p>
            <div className="grid grid-cols-2 gap-2">
              {mockArenaPlayers.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p.id)}
                  className="glass-panel glass-panel-hover p-2 text-left flex items-center gap-2"
                >
                  <span className="text-lg">{p.avatar}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-pflx-cyan truncate">
                      {p.brandName}
                    </p>
                    <p className="text-[9px] text-gray-500">
                      {p.xcoin.toLocaleString()} XC
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-pflx-cyan/10" />
          <button
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="text-[10px] text-gray-500 uppercase tracking-wider hover:text-pflx-cyan transition-colors"
          >
            {showQuickSelect ? "Manual Login" : "Quick Select"}
          </button>
          <div className="flex-1 h-px bg-pflx-cyan/10" />
        </div>

        {/* Manual Login */}
        {!showQuickSelect && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block text-left mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter your brand name..."
                className="w-full bg-pflx-darker border border-pflx-cyan/20 rounded-lg px-4 py-2.5 font-mono text-sm text-pflx-cyan focus:border-pflx-cyan/50 focus:outline-none placeholder:text-gray-600"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block text-left mb-1">
                PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                className="w-full bg-pflx-darker border border-pflx-cyan/20 rounded-lg px-4 py-2.5 font-mono text-sm text-pflx-cyan focus:border-pflx-cyan/50 focus:outline-none placeholder:text-gray-600 tracking-[0.5em]"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {error && (
              <p className="text-xs text-pflx-red font-mono">{error}</p>
            )}
            <button onClick={handleLogin} className="btn-arena w-full justify-center">
              Enter Arena
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-[9px] text-gray-600 mt-4">
          Your XC balance and badges are synced from the PFLX X-Coin app
        </p>
      </div>
    </div>
  );
}
