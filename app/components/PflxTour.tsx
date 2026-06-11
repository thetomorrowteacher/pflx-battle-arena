"use client";
// ═══════════════════════════════════════════════════════════════════
// PFLX TOUR — Battle Arena edition. Spotlight walkthrough that auto-runs on
// a player's first visit (per browser) with a ? replay button.
// Steps whose selector isn't found degrade to a centered card, so the
// tour never breaks when the UI shifts. Same pattern as the Console
// and Core Pathways tours.
// ═══════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useState } from "react";

interface TourStep { sel?: string; title: string; body: string; }

const STORAGE_KEY = "pflx_tour_arena_v1";
const ACCENT = "#ff2040";

const STEPS: TourStep[] = [
  {
    title: "WELCOME TO BATTLE ARENA",
    body: "Quick games and design challenges - the fastest way to earn XC. Compete head-to-head, wager what you can afford to lose, and rack up achievements.",
  },
  {
    sel: 'a[href="/lobby"]',
    title: "THE LOBBY",
    body: "Pick a game cartridge, set your wager, and queue up. Wins pay XC instantly; results also feed the platform leaderboard.",
  },
  {
    sel: 'a[href="/leaderboard"]',
    title: "LEADERBOARD",
    body: "Season standings across every arena game. Climb it for bragging rights - and the XC that comes with them.",
  },
  {
    sel: 'a[href="/settings"]',
    title: "SETTINGS",
    body: "Controls, sound, and your arena profile. That is the briefing - go win something.",
  },
];

export default function PflxTour() {
  const [idx, setIdx] = useState(-1);
  const [rect, setRect] = useState<{ t: number; l: number; w: number; h: number } | null>(null);

  const position = useCallback((i: number) => {
    const st = STEPS[i];
    if (st && st.sel) {
      const el = document.querySelector(st.sel);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) { setRect({ t: r.top, l: r.left, w: r.width, h: r.height }); return; }
      }
    }
    setRect(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("embed")) return;               // hidden chrome inside Mission Control
      if (localStorage.getItem(STORAGE_KEY)) return; // already seen
    } catch { return; }
    const t = setTimeout(() => setIdx(0), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (idx >= 0) position(idx);
    const onResize = () => { if (idx >= 0) position(idx); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [idx, position]);

  const end = () => {
    try { localStorage.setItem(STORAGE_KEY, "seen"); } catch {}
    setIdx(-1);
  };
  const next = () => (idx >= STEPS.length - 1 ? end() : setIdx(idx + 1));
  const back = () => setIdx(Math.max(0, idx - 1));

  // tooltip placement
  const tipW = Math.min(340, typeof window !== "undefined" ? window.innerWidth * 0.9 : 340);
  let tipStyle: React.CSSProperties;
  if (rect) {
    let top = rect.t + rect.h + 18;
    if (typeof window !== "undefined" && top + 230 > window.innerHeight) top = Math.max(12, rect.t - 240);
    let left = rect.l + rect.w / 2 - tipW / 2;
    if (typeof window !== "undefined") left = Math.max(12, Math.min(window.innerWidth - tipW - 12, left));
    tipStyle = { position: "fixed", top, left, width: tipW };
  } else {
    tipStyle = { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: tipW };
  }

  return (
    <>
      {idx >= 0 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99990 }}>
          {rect ? (
            <div style={{
              position: "fixed", top: rect.t - 8, left: rect.l - 8, width: rect.w + 16, height: rect.h + 16,
              border: `2px solid ${ACCENT}`, borderRadius: 12, pointerEvents: "none",
              boxShadow: `0 0 0 9999px rgba(2,6,12,0.82), 0 0 24px ${ACCENT}66`,
              transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
            }} />
          ) : (
            <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,12,0.82)" }} />
          )}
          <div style={{
            ...tipStyle, zIndex: 99991, padding: "16px 18px", borderRadius: 12,
            background: "linear-gradient(160deg, rgba(14,12,6,0.98), rgba(20,16,8,0.98))",
            border: `1px solid ${ACCENT}66`, boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            color: "#fdf3d8", fontFamily: "inherit",
          }}>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: `${ACCENT}99`, marginBottom: 4, fontWeight: 700 }}>
              ARENA TOUR · {idx + 1} / {STEPS.length}
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.1em", color: ACCENT, marginBottom: 8 }}>
              {STEPS[idx].title}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(253,243,216,0.85)", marginBottom: 14 }}>
              {STEPS[idx].body}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={end} style={{ padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>SKIP</button>
              {idx > 0 && (
                <button onClick={back} style={{ padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>BACK</button>
              )}
              <button onClick={next} style={{ padding: "7px 18px", borderRadius: 8, cursor: "pointer", background: `${ACCENT}26`, border: `1px solid ${ACCENT}80`, color: ACCENT, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em" }}>
                {idx === STEPS.length - 1 ? "FINISH ▶" : "NEXT ▶"}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setIdx(0)}
        title="Replay the Battle Arena tour"
        style={{
          position: "fixed", bottom: 16, left: 16, zIndex: 9000, width: 30, height: 30,
          borderRadius: "50%", background: "rgba(14,12,6,0.9)", border: `1px solid ${ACCENT}4d`,
          color: `${ACCENT}cc`, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
      >?</button>
    </>
  );
}
