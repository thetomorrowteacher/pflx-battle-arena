"use client";
import { useEffect } from "react";

/**
 * RoleGuard (generic) — listens for the Platform shell's `pflx_role_changed`
 * postMessage and keeps `document.body.dataset.pflxRole` in sync. Any element
 * tagged with `.host-only` / `.admin-only` is hidden in player mode; any
 * element tagged with `.player-only` is hidden in host mode. Components can
 * additionally read `document.body.dataset.pflxRole` for imperative branching.
 *
 * Apps that also split routes into /admin and /player should layer a route
 * redirect on top of this — see X-Coin RoleGuard for that pattern.
 */
export default function RoleGuard() {
  useEffect(() => {
    // Seed from localStorage, then ask the parent shell for authoritative state.
    let initial: "host" | "player" = "player";
    try {
      const stored = localStorage.getItem("pflx_active_role");
      if (stored === "host" || stored === "player") initial = stored;
    } catch {}
    document.body.dataset.pflxRole = initial;

    if (window.parent !== window) {
      try {
        window.parent.postMessage(JSON.stringify({ type: "pflx_role_query" }), "*");
      } catch {}
    }

    function handleMessage(ev: MessageEvent) {
      try {
        const msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (msg?.type !== "pflx_role_changed") return;
        const role: "host" | "player" = msg.role === "host" ? "host" : "player";
        try { localStorage.setItem("pflx_active_role", role); } catch {}
        document.body.dataset.pflxRole = role;
      } catch {}
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
