"use client";

import { useState, useEffect } from "react";
import { useArenaStore } from "../lib/store";
import { ArenaPlayer } from "../lib/types";
import { fetchAllPlayers, authenticatePlayer } from "../lib/xcoin-bridge";

export default function LoginScreen() {
  const { login } = useArenaStore();
  const [brandName, setBrandName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [roster, setRoster] = useState<ArenaPlayer[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  // Load real players from X-Coin bridge (Supabase)
  useEffect(() => {
    fetchAllPlayers()
      .then((players) => {
        if (players.length > 0) {
          setRoster(players);
        }
        setLoadingRoster(false);
      })
      .catch(() => setLoadingRoster(false));
  }, []);

  // PFLX SSO AUTO-LOGIN — bypass login when embedded in PFLX Platform
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sso = params.get("sso");
    const brand = params.get("brand");
    const ssoPin = params.get("pin");
    const role = params.get("role");
    if (sso !== "pflx" || !brand) return;

    setRedirecting(true);

    // Fetch real player from Supabase via X-Coin bridge
    fetchAllPlayers()
      .then((players) => {
        const player = players.find(
          (p) => p.brandName?.toLowerCase() === brand.toLowerCase()
        );
        if (player) {
          // Override role if specified in SSO params
          if (role === "host" || role === "admin") {
            player.role = "admin";
          }
          console.log("[Battle Arena] SSO auto-login for:", player.brandName || player.name);
          login(player);
          // Set the role from SSO
          if (role) {
            try {
              localStorage.setItem("pflx_active_role", role === "admin" ? "host" : role);
              document.body.dataset.pflxRole = role === "admin" ? "host" : role;
            } catch {}
          }
        } else {
          setRedirecting(false);
          setError("SSO player not found in roster.");
        }
      })
      .catch(() => {
        setRedirecting(false);
        setError("SSO login failed — try manual login.");
      });
  }, [login]);

  const handleLogin = async () => {
    if (!brandName.trim()) {
      setError("Enter a brand name.");
      return;
    }
    setError("");

    // Try authenticating via X-Coin bridge (Supabase)
    const player = await authenticatePlayer(brandName, pin);
    if (player) {
      login(player);
      return;
    }

    // Fallback: check loaded roster
    const rosterMatch = roster.find(
      (p) => p.brandName?.toLowerCase() === brandName.toLowerCase()
    );
    if (rosterMatch) {
      login(rosterMatch);
    } else {
      setError("Player not found. Check your brand name.");
    }
  };

  const handleQuickLogin = (player: ArenaPlayer) => {
    login(player);
  };

  // SSO redirect screen
  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pflx-cyan/20 to-pflx-purple/20 border border-pflx-cyan/30 flex items-center justify-center text-3xl shadow-cyan-glow">
          ⚔️
        </div>
        <p className="font-mono text-xs text-pflx-cyan/50 uppercase tracking-wider">
          Entering arena...
        </p>
      </div>
    );
  }

  const displayRoster = roster.length > 0 ? roster.slice(0, 8) : [];

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

        {/* Quick Select (from real roster) */}
        {displayRoster.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
              Select Player
            </p>
            <div className="grid grid-cols-2 gap-2">
              {displayRoster.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p)}
                  className="glass-panel glass-panel-hover p-2 text-left flex items-center gap-2"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-pflx-cyan/20"
                    />
                  ) : (
                    <span className="text-lg w-8 h-8 rounded-full bg-pflx-glass border border-pflx-cyan/20 flex items-center justify-center text-sm">
                      {p.avatar || "👤"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-pflx-cyan truncate">
                      {p.brandName || p.name}
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

        {loadingRoster && (
          <div className="mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              Loading roster...
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-pflx-cyan/10" />
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            Manual Login
          </span>
          <div className="flex-1 h-px bg-pflx-cyan/10" />
        </div>

        {/* Manual Login */}
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

        {/* Footer */}
        <p className="text-[9px] text-gray-600 mt-4">
          Your XC balance and badges are synced from the PFLX X-Coin app
        </p>
      </div>
    </div>
  );
}
