"use client";

// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — PlayGate
// Resolves the signed-in player from:
//   1) SSO URL params (?sso=pflx&brand=...&role=...)
//   2) localStorage pflx_user (set by PFLX Platform shell)
//   3) Shared Supabase roster (fallback)
//
// Always renders: Battle Arena logo + PLAY button.
// Auto-completes the login as soon as the player resolves.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from "react";
import { useArenaStore } from "../lib/store";
import { fetchAllPlayers, fetchPlayerData } from "../lib/xcoin-bridge";
import { ArenaPlayer } from "../lib/types";

type Status = "resolving" | "ready" | "error";

export default function PlayGate() {
  const { login } = useArenaStore();
  const [status, setStatus] = useState<Status>("resolving");
  const [resolvedPlayer, setResolvedPlayer] = useState<ArenaPlayer | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const attemptedRef = useRef(false);
  const autoLoggedInRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      try {
        // ── 1) SSO URL params (from PFLX Platform shell) ─────────
        const params = new URLSearchParams(window.location.search);
        const sso = params.get("sso");
        const brand = params.get("brand");
        const role = params.get("role");

        let resolved: ArenaPlayer | null = null;

        if (sso === "pflx" && brand) {
          const players = await fetchAllPlayers();
          const match = players.find(
            (p) => (p.brandName || "").toLowerCase() === brand.toLowerCase()
          );
          if (match) {
            if (role === "host" || role === "admin") match.role = "admin";
            try {
              localStorage.setItem(
                "pflx_active_role",
                role === "admin" || role === "host" ? "host" : "player"
              );
              document.body.dataset.pflxRole =
                role === "admin" || role === "host" ? "host" : "player";
            } catch {}
            resolved = match;
          }
        }

        // ── 2) localStorage pflx_user (platform SSO cache) ───────
        if (!resolved) {
          const stored =
            typeof window !== "undefined"
              ? localStorage.getItem("pflx_user")
              : null;
          if (stored) {
            try {
              const u = JSON.parse(stored) as {
                id?: string;
                brandName?: string;
                role?: string;
                isHost?: boolean;
              };
              if (u.id) {
                const player = await fetchPlayerData(u.id);
                if (player) resolved = player;
              }
              if (!resolved && u.brandName) {
                const players = await fetchAllPlayers();
                resolved =
                  players.find(
                    (p) =>
                      (p.brandName || "").toLowerCase() ===
                      (u.brandName || "").toLowerCase()
                  ) || null;
              }
              if (resolved && (u.isHost || u.role === "admin")) {
                resolved.role = "admin";
              }
            } catch {}
          }
        }

        // ── 3) Last-resort fallback: first player in roster ──────
        if (!resolved) {
          const players = await fetchAllPlayers();
          if (players.length > 0) resolved = players[0];
        }

        if (resolved) {
          setResolvedPlayer(resolved);
          setStatus("ready");
        } else {
          setStatus("error");
          setErrorMsg(
            "Could not resolve your player identity. Open Battle Arena from the PFLX Platform shell."
          );
        }
      } catch (err) {
        console.error("[PlayGate] resolve error:", err);
        setStatus("error");
        setErrorMsg("Connection to X-Coin failed. Please try again.");
      }
    })();
  }, []);

  // Auto-login as soon as the player resolves — Platform SSO should
  // propagate straight into the arena without a second click.
  useEffect(() => {
    if (status === "ready" && resolvedPlayer && !autoLoggedInRef.current) {
      autoLoggedInRef.current = true;
      const t = setTimeout(() => login(resolvedPlayer), 600);
      return () => clearTimeout(t);
    }
  }, [status, resolvedPlayer, login]);

  const handlePlay = () => {
    if (resolvedPlayer) login(resolvedPlayer);
  };

  const handleRetry = () => {
    attemptedRef.current = false;
    autoLoggedInRef.current = false;
    setStatus("resolving");
    setErrorMsg("");
    window.location.reload();
  };

  const playLabel =
    status === "ready"
      ? "▶ PLAY"
      : status === "error"
      ? "RETRY"
      : "CONNECTING…";

  const playDisabled = status === "resolving";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="glass-panel p-10 text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <img
            src="/battle-arena.png"
            alt="PFLX Battle Arena"
            className="w-40 h-40 object-contain drop-shadow-[0_0_24px_rgba(0,212,255,0.45)]"
          />
        </div>

        <h1 className="font-mono text-3xl font-bold tracking-widest text-pflx-cyan text-glow-cyan mb-1">
          BATTLE ARENA
        </h1>
        <p className="text-[11px] text-gray-500 tracking-[0.25em] uppercase mb-6">
          PFLX Combat System
        </p>

        {/* Player identity card (renders once resolved) */}
        {status === "ready" && resolvedPlayer && (
          <div className="flex items-center justify-center gap-3 mb-5 px-4 py-3 rounded-lg bg-pflx-darker/60 border border-pflx-cyan/10">
            {resolvedPlayer.image ? (
              <img
                src={resolvedPlayer.image}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-pflx-cyan/30"
              />
            ) : (
              <span className="w-10 h-10 rounded-full bg-pflx-glass border border-pflx-cyan/30 flex items-center justify-center text-xl">
                {resolvedPlayer.avatar || "👤"}
              </span>
            )}
            <div className="text-left">
              <p className="text-sm font-mono text-pflx-cyan font-bold">
                {resolvedPlayer.brandName || resolvedPlayer.name}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                {resolvedPlayer.xcoin.toLocaleString()} XC ·{" "}
                {resolvedPlayer.digitalBadges} 🪙
              </p>
            </div>
          </div>
        )}

        {status === "resolving" && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <span
              className="w-2 h-2 rounded-full bg-pflx-cyan animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-pflx-cyan animate-pulse"
              style={{ animationDelay: "200ms" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-pflx-cyan animate-pulse"
              style={{ animationDelay: "400ms" }}
            />
            <span className="ml-2 text-[10px] text-pflx-cyan/50 uppercase tracking-wider font-mono">
              Authenticating via PFLX…
            </span>
          </div>
        )}

        {status === "error" && (
          <p className="text-xs text-pflx-red font-mono mb-4">{errorMsg}</p>
        )}

        {/* PLAY button: always visible */}
        <button
          onClick={status === "error" ? handleRetry : handlePlay}
          disabled={playDisabled}
          className="w-full py-4 rounded-xl font-mono font-bold text-lg tracking-[0.2em] uppercase transition-all disabled:opacity-60 disabled:cursor-wait"
          style={{
            background:
              "linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ff006e 100%)",
            color: "#ffffff",
            boxShadow:
              "0 0 32px rgba(0,212,255,0.45), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)",
            border: "1px solid rgba(0,212,255,0.4)",
          }}
          onMouseEnter={(e) => {
            if (playDisabled) return;
            e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 0 48px rgba(0,212,255,0.7), 0 12px 48px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow =
              "0 0 32px rgba(0,212,255,0.45), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)";
          }}
        >
          {playLabel}
        </button>
        <p className="text-[9px] text-gray-600 mt-4 tracking-wider">
          XC · Badges · Upgrades · Fines synced from X-Coin
        </p>
      </div>
    </div>
  );
}
