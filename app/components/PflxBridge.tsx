"use client";
import { useEffect } from "react";
import {
  saveArenaSettings,
  loadArenaSettings,
  fetchEntitiesFromSupabase,
  showCloudSaveIndicator,
} from "../lib/xcoin-bridge";

/**
 * PflxBridge — Cross-app message listener for Battle Arena.
 * Receives data sync messages from the PFLX Platform (Mission Control)
 * and responds with fresh data when requested.
 *
 * Unlike the X-Coin PflxBridge, this one persists arena-specific overlays
 * to Supabase via the xcoin-bridge Supabase helpers (same DB, different keys).
 * Shared entities (users, checkpoints, tasks, etc.) are fetched directly
 * from Supabase when postMessage isn't available (standalone browsing).
 */
export default function PflxBridge() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // ── Cloud Save: MC/Platform pushes data for persistence ──
        if (msg.type === "pflx_cloud_save" && msg.key && msg.data) {
          console.log("[Arena Bridge] Cloud save received:", msg.key);
          // If it's arena settings, persist to Supabase
          if (msg.key === "arena_settings_overrides") {
            saveArenaSettings(msg.data).then((ok) => {
              if (ok) showCloudSaveIndicator("Arena settings saved");
            });
          }
          // Also cache in localStorage as fallback
          try {
            localStorage.setItem(`pflx_arena_${msg.key}`, JSON.stringify(msg.data));
          } catch { /* storage full */ }
        }

        // ── MC Broadcast events ──
        if (msg.type && msg.type.startsWith("pflx_mc_")) {
          console.log("[Arena Bridge] MC event:", msg.type);
        }

        // ── Data request from parent (Platform asking for arena data) ──
        if (msg.type === "pflx_data_request" && msg.key) {
          handleDataRequest(msg.key);
        }

        // ── Data response from parent (entities sent to us) ──
        if (msg.type === "pflx_cloud_data" && msg.key && msg.data) {
          // Dispatch custom DOM event so Settings page can listen
          window.dispatchEvent(
            new CustomEvent("pflx_entities_received", {
              detail: { key: msg.key, data: msg.data },
            })
          );
        }

        // ── SSO auto-select ──
        if (msg.type === "pflx_player_login_sync" && msg.data) {
          console.log("[Arena Bridge] Player login sync:", msg.data);
          try {
            localStorage.setItem("pflx_arena_session", JSON.stringify(msg.data));
          } catch { /* ignore */ }
        }

        // ── SSO identity broadcast from shell (unified contract) ──
        if ((msg.type === "pflx_identity_broadcast" || msg.type === "pflx_identity_response") && msg.user) {
          try {
            localStorage.setItem(
              "pflx_identity",
              JSON.stringify({
                user: msg.user,
                role: msg.role || "player",
                onboardingComplete: !!msg.onboardingComplete,
              })
            );
            // Also write the canonical pflx_user shape used by the Platform
            localStorage.setItem("pflx_user", JSON.stringify({
              id: msg.user.id || "",
              brandName: msg.user.brand || msg.user.brandName || msg.user.name || "",
              brand: msg.user.brand || msg.user.brandName || "",
              name: msg.user.name || msg.user.brand || "Player",
              role: msg.user.role || "Student",
              cohort: msg.user.cohort || "PlayerPool",
              email: msg.user.email || "",
              image: msg.user.image || "",
              level: typeof msg.user.level === "number" ? msg.user.level : 1,
              xcoin: typeof msg.user.xc === "number" ? msg.user.xc : (typeof msg.user.xcoin === "number" ? msg.user.xcoin : 0),
              totalXcoin: typeof msg.user.totalXcoin === "number" ? msg.user.totalXcoin : (typeof msg.user.xc === "number" ? msg.user.xc : 0),
              digitalBadges: typeof msg.user.digitalBadges === "number" ? msg.user.digitalBadges : 0,
              __pflxFromPlatform: true,
            }));
            if (msg.role === "host" || msg.role === "player") {
              localStorage.setItem("pflx_active_role", msg.role);
              document.body.dataset.pflxRole = msg.role;
            }
            window.dispatchEvent(new CustomEvent("pflx-identity-changed", { detail: msg.user }));
            console.log("[Arena Bridge] ✓ Adopted Platform identity:", msg.user.brand);
          } catch { /* ignore */ }
        }

        // ── Force-sync: drop cached identity and re-request ──
        if (msg.type === "pflx_force_identity_sync") {
          try {
            localStorage.removeItem("pflx_user");
            localStorage.removeItem("pflx_identity");
            window.dispatchEvent(new CustomEvent("pflx-identity-cleared"));
            if (window.parent !== window) {
              window.parent.postMessage(JSON.stringify({ type: "pflx_identity_request" }), "*");
            }
          } catch { /* ignore */ }
        }

        // ── XC update from Platform (someone else moved the balance) ──
        if (msg.type === "pflx_xc_update" && typeof msg.xc === "number") {
          try {
            const cached = JSON.parse(localStorage.getItem("pflx_user") || "{}");
            cached.xcoin = msg.xc;
            cached.totalXcoin = Math.max(cached.totalXcoin || 0, msg.xc);
            localStorage.setItem("pflx_user", JSON.stringify(cached));
            window.dispatchEvent(new CustomEvent("pflx-xc-update", { detail: { xc: msg.xc, reason: msg.reason || "" } }));
          } catch { /* ignore */ }
        }

        // ── Role change from Platform ──
        if (msg.type === "pflx_role_changed" && msg.role) {
          try {
            document.body.classList.toggle("pflx-as-player", msg.role === "player");
            document.body.dataset.pflxRole = msg.role;
            localStorage.setItem("pflx_active_role", msg.role);
            window.dispatchEvent(new CustomEvent("pflx-role-changed", { detail: { role: msg.role } }));
          } catch { /* ignore */ }
        }
      } catch {
        // Ignore non-JSON messages
      }
    }

    async function handleDataRequest(key: string) {
      // Try loading from Supabase first
      if (key === "arena_settings_overrides") {
        const data = await loadArenaSettings();
        if (window.parent !== window) {
          window.parent.postMessage(
            JSON.stringify({ type: "pflx_cloud_data", key, data }),
            "*"
          );
        }
        return;
      }
      // For other keys, try localStorage fallback
      try {
        const stored = localStorage.getItem(`pflx_arena_${key}`);
        if (stored && window.parent !== window) {
          window.parent.postMessage(
            JSON.stringify({ type: "pflx_cloud_data", key, data: JSON.parse(stored) }),
            "*"
          );
        }
      } catch { /* ignore */ }
    }

    window.addEventListener("message", handleMessage);

    // ── Iframe body class so CSS can hide local login UI when running
    //    inside the Platform shell ──
    if (window.parent !== window) {
      document.body.classList.add("pflx-in-iframe");
    }

    // ── Helper exposed for Arena code to call when XC moves locally
    //    (match win, tournament prize). Platform re-broadcasts to siblings. ──
    (window as unknown as Record<string, unknown>).pflxNotifyXcChange = function (newXc: number, reason?: string) {
      try {
        const xc = typeof newXc === "number" ? newXc : parseInt(String(newXc), 10) || 0;
        const cached = JSON.parse(localStorage.getItem("pflx_user") || "{}");
        cached.xcoin = xc;
        cached.totalXcoin = Math.max(cached.totalXcoin || 0, xc);
        localStorage.setItem("pflx_user", JSON.stringify(cached));
        if (window.parent !== window) {
          window.parent.postMessage(
            JSON.stringify({ type: "pflx_xc_changed", xc, reason: reason || "" }),
            "*"
          );
        }
      } catch { /* ignore */ }
    };

    // Announce readiness + request identity from shell
    if (window.parent !== window) {
      try {
        window.parent.postMessage(
          JSON.stringify({ type: "pflx_subapp_ready", app: "battle-arena" }),
          "*"
        );
        window.parent.postMessage(
          JSON.stringify({ type: "pflx_identity_request" }),
          "*"
        );
      } catch { /* ignore */ }
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
