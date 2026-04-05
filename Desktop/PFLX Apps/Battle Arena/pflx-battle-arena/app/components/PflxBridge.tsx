"use client";
import { useEffect } from "react";

/**
 * PflxBridge — Cross-app message listener for Battle Arena.
 * Receives data sync messages from the PFLX Platform (Mission Control)
 * and responds with fresh data when requested.
 */
export default function PflxBridge() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        // ── Cloud Save: MC pushes data to Arena for persistence ──
        if (msg.type === "pflx_cloud_save" && msg.key && msg.data) {
          console.log("[Arena Bridge] Cloud save received:", msg.key);
          try {
            localStorage.setItem(`pflx_arena_${msg.key}`, JSON.stringify(msg.data));
          } catch { /* storage full */ }
        }

        // ── MC Broadcast events ──
        if (msg.type && msg.type.startsWith("pflx_mc_")) {
          console.log("[Arena Bridge] MC event:", msg.type);
        }

        // ── Data request from parent ──
        if (msg.type === "pflx_data_request" && msg.key) {
          try {
            const stored = localStorage.getItem(`pflx_arena_${msg.key}`);
            if (stored && window.parent !== window) {
              window.parent.postMessage(JSON.stringify({
                type: "pflx_cloud_data",
                key: msg.key,
                data: JSON.parse(stored),
              }), "*");
            }
          } catch { /* ignore */ }
        }

        // ── SSO auto-select ──
        if (msg.type === "pflx_player_login_sync" && msg.data) {
          console.log("[Arena Bridge] Player login sync:", msg.data);
          try {
            localStorage.setItem("pflx_arena_session", JSON.stringify(msg.data));
          } catch { /* ignore */ }
        }
      } catch {
        // Ignore non-JSON messages
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
