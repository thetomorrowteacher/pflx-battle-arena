"use client";
import { useEffect, useState } from "react";

/**
 * PflxIframeGuard — Enforces that this app only renders when launched from
 * the PFLX Platform.
 *
 * Two states:
 *   1. NOT in iframe (standalone)        → permanent block screen with a
 *                                          link back to the Platform
 *   2. In iframe, identity not yet here  → "Syncing with Platform" overlay
 *   3. In iframe, identity received      → app renders
 *
 * The local login UI is effectively dead code now; identity comes solely
 * from the Platform via PflxBridge's pflx_identity_broadcast handler.
 */

const PLATFORM_URL = "https://www.prototypeflx.com/";

export default function PflxIframeGuard() {
  // null = checking, "blocked" = standalone, "syncing" = waiting for identity, "ready" = render
  const [state, setState] = useState<"checking" | "blocked" | "syncing" | "ready">("checking");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.parent === window) {
      setState("blocked"); // standalone access — block permanently
      return;
    }
    // Fast-path 1 — any platform-launched URL. Previously we required both
    // sso=pflx AND brand. That trapped fresh self-signups where the parent
    // built the iframe URL before activeSession.brand resolved (brand=""
    // is a falsy URLSearchParams value). The platform is the auth source
    // of truth — if it launched us with sso=pflx, that's identity enough
    // for us to render. PflxBridge will hydrate the actual brand /
    // role / cohort over postMessage shortly after.
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get("sso") === "pflx") {
        setState("ready");
        return;
      }
    } catch {}
    // Fast-path 2 — anything in localStorage that looks like a prior
    // identity. Same loosened rule: presence is enough; field shape
    // doesn't matter. PflxBridge will refresh it with fresh data.
    try {
      const cached = localStorage.getItem("pflx_user") || localStorage.getItem("pflx_identity") || localStorage.getItem("pflx_active_session");
      if (cached && cached.length > 2) {
        setState("ready");
        return;
      }
    } catch {}
    // Fast-path 3 — even with no identity hint at all, if we're embedded
    // by the platform domain, trust the parent. This is the new floor
    // for the Sphinx Link class of bug: a self-signed-up player whose
    // record landed in the parent after the iframe URL was built.
    try {
      const ref = String(document.referrer || "");
      if (ref.indexOf("prototypeflx.com") !== -1
       || ref.indexOf("pflx-platform") !== -1
       || ref.indexOf("localhost") !== -1) {
        setState("ready");
        return;
      }
    } catch {}

    setState("syncing");
    let cleared = false;
    const reveal = () => {
      if (cleared) return;
      cleared = true;
      setState("ready");
    };
    window.addEventListener("pflx-identity-changed", reveal as EventListener);
    // Proactively ask the parent for identity. The platform shell responds
    // with pflx_identity_broadcast which PflxBridge translates into the
    // pflx-identity-changed event the reveal handler listens for.
    try {
      window.parent.postMessage(JSON.stringify({ type: "pflx_identity_request" }), "*");
    } catch {}
    // Retry the request a few times in case the parent isn't ready yet.
    const retryTimers: number[] = [];
    [200, 600, 1200].forEach((delay) => {
      retryTimers.push(window.setTimeout(() => {
        if (cleared) return;
        try { window.parent.postMessage(JSON.stringify({ type: "pflx_identity_request" }), "*"); } catch {}
      }, delay));
    });
    // Safety: never trap longer than 1.5s. Reduced from 3.5s because
    // even when identity is genuinely missing, we'd rather render the
    // app and let the player click into a screen they can act on than
    // stare at a spinner for 3+ seconds wondering if it's broken.
    const timer = window.setTimeout(reveal, 1500);
    return () => {
      window.removeEventListener("pflx-identity-changed", reveal as EventListener);
      window.clearTimeout(timer);
      retryTimers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  if (state === "ready") return null;
  if (state === "checking") return null; // brief gap before useEffect runs

  if (state === "blocked") {
    return (
      <div
        data-pflx-iframe-guard="blocked"
        style={blockStyle}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, maxWidth: 460, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 56, lineHeight: 1 }}>🛰️</div>
          <div style={{ color: "#00f0ff", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700 }}>
            Access via PFLX Platform
          </div>
          <div style={{ color: "#8a92b0", fontSize: 13, lineHeight: 1.6, fontFamily: "Rajdhani, sans-serif" }}>
            This app runs inside the PFLX Platform. Your profile, X-Coin, badges, and progress are all
            managed there. Open the Platform and launch this app from inside.
          </div>
          <a
            href={PLATFORM_URL}
            style={{
              marginTop: 8,
              padding: "12px 28px",
              background: "linear-gradient(135deg,#00d4ff,#7c3aed)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 10,
              fontFamily: "Orbitron, sans-serif",
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 700,
              boxShadow: "0 4px 24px rgba(0,212,255,0.35)",
            }}
          >
            OPEN PFLX PLATFORM →
          </a>
        </div>
      </div>
    );
  }

  // syncing
  return (
    <div data-pflx-iframe-guard="syncing" style={blockStyle}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "2px solid rgba(0,240,255,0.18)",
            borderTopColor: "#00f0ff",
            animation: "pflx-iframe-spin 0.9s linear infinite",
          }}
        />
        <div style={{ color: "#00f0ff", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
          Syncing with Platform
        </div>
        <div style={{ color: "#6a7290", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
          Loading your profile across all apps
        </div>
      </div>
      <style>{`@keyframes pflx-iframe-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const blockStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483647,
  background: "linear-gradient(135deg, #02060f 0%, #0a1228 60%, #0f1830 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  fontFamily: "Orbitron, 'Share Tech Mono', monospace",
  color: "#e0e6ff",
};
