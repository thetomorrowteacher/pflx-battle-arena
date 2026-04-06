"use client";

import { useEffect, useState } from "react";
import { registerSaveToast } from "../lib/xcoin-bridge";

/**
 * Cloud Save Indicator — pops up when a save completes.
 * Matches the universal PFLX cloud save indicator pattern.
 */
export default function CloudSaveToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Saved to cloud");

  useEffect(() => {
    registerSaveToast((msg) => {
      setMessage(msg || "Saved to cloud");
      setVisible(true);
      setTimeout(() => setVisible(false), 2200);
    });
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 10,
        background: "rgba(0, 230, 118, 0.12)",
        border: "1px solid rgba(0, 230, 118, 0.3)",
        backdropFilter: "blur(12px)",
        color: "#00e676",
        fontFamily: "monospace",
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        boxShadow: "0 0 20px rgba(0, 230, 118, 0.15)",
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "0.9rem" }}>☁️</span>
      {message} ✓
    </div>
  );
}
