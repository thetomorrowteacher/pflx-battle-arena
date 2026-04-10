"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useArenaStore } from "../lib/store";
import { Cartridge, CartridgeConfig, DEFAULT_CARTRIDGE_CONFIG, CoinType, ArenaRankTier, ARENA_RANK_TIERS } from "../lib/types";
import { loadCartridges, upsertCartridge, deleteCartridge } from "../lib/xcoin-bridge";

// ── Helpers ────────────────────────────────────────────────────────
function uid() { return "cart_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36); }
async function sha256(text: string): Promise<string> {
  try {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch { return ""; }
}

// ── Page ───────────────────────────────────────────────────────────
export default function CartridgesPage() {
  const router = useRouter();
  const { currentPlayer, isLoggedIn } = useArenaStore();
  const isHost = currentPlayer?.role === "admin";

  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [configOpen, setConfigOpen] = useState<Cartridge | null>(null);
  const [playOpen, setPlayOpen] = useState<Cartridge | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/"); return; }
    (async () => {
      try {
        const list = await loadCartridges();
        setCartridges(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, router]);

  // ── Upload ────────────────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    // Size limit: 2MB to keep Supabase row reasonable
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File too large (max 2 MB).");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".html") && file.type !== "text/html") {
      setUploadError("Only .html files are supported.");
      return;
    }

    setUploading(true);
    try {
      const htmlContent = await file.text();
      // Basic safety: strip obvious parent-frame escape attempts
      if (/window\.parent|top\.location/.test(htmlContent)) {
        setUploadError("Cartridges cannot reference parent window or top location.");
        setUploading(false);
        return;
      }
      const checksum = await sha256(htmlContent);
      // Extract a nice name from the file name or <title>
      let name = file.name.replace(/\.html?$/i, "").replace(/[_-]+/g, " ");
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1].trim()) name = titleMatch[1].trim();

      const cart: Cartridge = {
        id: uid(),
        name,
        version: "1.0.0",
        author: currentPlayer?.brandName || currentPlayer?.name || "unknown",
        authorId: currentPlayer?.id || "unknown",
        uploadedAt: new Date().toISOString(),
        htmlContent,
        sizeBytes: file.size,
        checksum,
        config: { ...DEFAULT_CARTRIDGE_CONFIG },
        status: isHost ? "approved" : "pending",
        published: false,
        playCount: 0,
        tags: [],
      };
      const ok = await upsertCartridge(cart);
      if (ok) {
        setCartridges(prev => [...prev, cart]);
        setConfigOpen(cart);
      } else {
        setUploadError("Upload failed. Try again.");
      }
    } catch (err) {
      setUploadError("Failed to read file: " + (err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // ── Save config (host-only) ──────────────────────────────────────
  async function handleSaveConfig(updated: Cartridge) {
    const ok = await upsertCartridge(updated);
    if (ok) {
      setCartridges(prev => prev.map(c => c.id === updated.id ? updated : c));
      setConfigOpen(null);
    } else {
      alert("Failed to save config.");
    }
  }

  async function handlePublishToggle(cart: Cartridge) {
    if (!isHost) return;
    const updated = { ...cart, published: !cart.published, status: (!cart.published ? "live" : "approved") as Cartridge["status"] };
    const ok = await upsertCartridge(updated);
    if (ok) setCartridges(prev => prev.map(c => c.id === cart.id ? updated : c));
  }

  async function handleDelete(cart: Cartridge) {
    if (!confirm(`Delete "${cart.name}"? This cannot be undone.`)) return;
    const ok = await deleteCartridge(cart.id);
    if (ok) setCartridges(prev => prev.filter(c => c.id !== cart.id));
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-wider text-pflx-cyan text-glow-cyan uppercase mb-2">
            Cartridges
          </h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Upload a custom HTML game mode, configure its rewards and fines, then go live in the Arena. Anyone can submit; hosts approve and publish.
          </p>
        </div>

        {/* Upload panel */}
        <div className="glass-panel p-6 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-mono text-sm font-bold text-pflx-gold uppercase tracking-wider mb-1">
                Upload a Cartridge
              </h3>
              <p className="text-xs text-gray-500">Accepts .html files up to 2 MB. Self-contained games only.</p>
            </div>
            <label
              className="btn-arena btn-arena-gold cursor-pointer"
              style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}
            >
              {uploading ? "UPLOADING…" : "▲ UPLOAD .HTML"}
              <input type="file" accept=".html,text/html" style={{ display: "none" }} onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
          {uploadError && (
            <div className="mt-3 text-xs text-pflx-red font-mono">{uploadError}</div>
          )}
        </div>

        {/* Cartridge grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-16 font-mono text-xs uppercase tracking-wider">
            Loading cartridges…
          </div>
        ) : cartridges.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <div className="text-5xl mb-3">💾</div>
            <h3 className="font-mono text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">No cartridges yet</h3>
            <p className="text-xs text-gray-500">Be the first to upload a custom game mode.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartridges.map(cart => (
              <div key={cart.id} className="glass-panel p-5 flex flex-col" style={{ minHeight: 240 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="font-mono text-sm font-bold text-pflx-cyan uppercase tracking-wider">{cart.name}</div>
                    <div className="text-[10px] text-gray-500">by {cart.author} · v{cart.version}</div>
                  </div>
                  <div className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${cart.published ? "bg-pflx-green/10 text-pflx-green border border-pflx-green/30" : "bg-gray-800 text-gray-500 border border-gray-700"}`}>
                    {cart.published ? "LIVE" : cart.status}
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 mb-3 line-clamp-2 min-h-[32px]">
                  {cart.config.description || "No description."}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                  <div><span className="text-gray-500">Win XC:</span> <span className="text-pflx-gold font-mono">{cart.config.winXC}</span></div>
                  <div><span className="text-gray-500">Fine:</span> <span className="text-pflx-red font-mono">{cart.config.loseXC}</span></div>
                  <div><span className="text-gray-500">Entry:</span> <span className="text-gray-300 font-mono">{cart.config.entryFee}</span></div>
                  <div><span className="text-gray-500">Coin:</span> <span className="text-pflx-purple font-mono uppercase">{cart.config.coinType}</span></div>
                </div>
                <div className="mt-auto flex gap-2 flex-wrap">
                  <button
                    onClick={() => setPlayOpen(cart)}
                    disabled={!cart.published && !isHost}
                    className="btn-arena text-[10px] px-3 py-1.5"
                    style={{ opacity: (!cart.published && !isHost) ? 0.4 : 1 }}
                  >
                    ▶ PLAY
                  </button>
                  {isHost && (
                    <>
                      <button onClick={() => setConfigOpen(cart)} className="btn-arena text-[10px] px-3 py-1.5">⚙ CONFIG</button>
                      <button onClick={() => handlePublishToggle(cart)} className="btn-arena text-[10px] px-3 py-1.5">
                        {cart.published ? "⏸ UNPUBLISH" : "✓ PUBLISH"}
                      </button>
                      <button onClick={() => handleDelete(cart)} className="btn-arena text-[10px] px-3 py-1.5" style={{ color: "#ff4d6d" }}>✕</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Config modal (host) */}
        {configOpen && (
          <ConfigModal
            cart={configOpen}
            onClose={() => setConfigOpen(null)}
            onSave={handleSaveConfig}
          />
        )}

        {/* Play modal (iframe) */}
        {playOpen && (
          <PlayModal cart={playOpen} onClose={() => setPlayOpen(null)} />
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Config Modal
// ═════════════════════════════════════════════════════════════════════
function ConfigModal({ cart, onClose, onSave }: { cart: Cartridge; onClose: () => void; onSave: (c: Cartridge) => void }) {
  const [config, setConfig] = useState<CartridgeConfig>({ ...cart.config });
  const [name, setName] = useState(cart.name);
  const [badgesText, setBadgesText] = useState((cart.config.requiredBadges || []).join(", "));

  function handleSave() {
    const updated: Cartridge = {
      ...cart,
      name: name.trim() || cart.name,
      config: {
        ...config,
        requiredBadges: badgesText.split(",").map(s => s.trim()).filter(Boolean),
      },
    };
    onSave(updated);
  }

  const set = <K extends keyof CartridgeConfig>(k: K, v: CartridgeConfig[K]) => setConfig(c => ({ ...c, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="glass-panel" style={{ maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-bold text-pflx-gold uppercase tracking-wider">Configure Cartridge</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <Field label="Name">
            <input className="w-full bg-black/40 border border-pflx-cyan/20 text-white px-3 py-2 rounded font-mono text-sm"
              value={name} onChange={e => setName(e.target.value)} />
          </Field>

          <Field label="Description">
            <textarea className="w-full bg-black/40 border border-pflx-cyan/20 text-white px-3 py-2 rounded text-xs h-16"
              value={config.description || ""} onChange={e => set("description", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry Fee (XC)"><NumInput val={config.entryFee} onChange={v => set("entryFee", v)} /></Field>
            <Field label="Coin Type">
              <select className="w-full bg-black/40 border border-pflx-cyan/20 text-white px-3 py-2 rounded font-mono text-xs uppercase"
                value={config.coinType} onChange={e => set("coinType", e.target.value as CoinType)}>
                <option value="primary">Primary</option>
                <option value="premium">Premium</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Win XC"><NumInput val={config.winXC} onChange={v => set("winXC", v)} /></Field>
            <Field label="Lose XC (Fine)"><NumInput val={config.loseXC} onChange={v => set("loseXC", v)} /></Field>
            <Field label="Draw XC"><NumInput val={config.drawXC || 0} onChange={v => set("drawXC", v)} /></Field>
          </div>

          <Field label="Win Coins (of coin type)">
            <NumInput val={config.winCoins} onChange={v => set("winCoins", v)} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Min Players"><NumInput val={config.minPlayers} onChange={v => set("minPlayers", v)} /></Field>
            <Field label="Max Players"><NumInput val={config.maxPlayers} onChange={v => set("maxPlayers", v)} /></Field>
            <Field label="Est. Minutes"><NumInput val={config.estimatedMinutes} onChange={v => set("estimatedMinutes", v)} /></Field>
          </div>

          <Field label="Required Badges (comma-separated)">
            <input className="w-full bg-black/40 border border-pflx-cyan/20 text-white px-3 py-2 rounded font-mono text-xs"
              value={badgesText} onChange={e => setBadgesText(e.target.value)} placeholder="eg. signature-2025, quiz-master" />
          </Field>

          <Field label="Min Arena Rank">
            <select className="w-full bg-black/40 border border-pflx-cyan/20 text-white px-3 py-2 rounded font-mono text-xs"
              value={config.minArenaRank || ""} onChange={e => set("minArenaRank", (e.target.value || undefined) as ArenaRankTier | undefined)}>
              <option value="">— Any —</option>
              {ARENA_RANK_TIERS.map(t => <option key={t.tier} value={t.tier}>{t.icon} {t.tier}</option>)}
            </select>
          </Field>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-arena text-xs px-4 py-2 flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-arena btn-arena-gold text-xs px-4 py-2 flex-1">Save Config</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}
function NumInput({ val, onChange }: { val: number; onChange: (n: number) => void }) {
  return (
    <input type="number" min={0}
      className="w-full bg-black/40 border border-pflx-cyan/20 text-white px-3 py-2 rounded font-mono text-sm"
      value={val} onChange={e => onChange(Number(e.target.value) || 0)} />
  );
}

// ═════════════════════════════════════════════════════════════════════
// Play Modal (sandboxed iframe runs the cartridge HTML)
// ═════════════════════════════════════════════════════════════════════
function PlayModal({ cart, onClose }: { cart: Cartridge; onClose: () => void }) {
  const srcDoc = cart.htmlContent;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(0,240,255,0.15)" }}>
        <div>
          <div className="font-mono text-sm font-bold text-pflx-cyan uppercase tracking-wider">{cart.name}</div>
          <div className="text-[10px] text-gray-500">Win: {cart.config.winXC} XC · Fine: {cart.config.loseXC} XC · Coin: {cart.config.coinType}</div>
        </div>
        <button onClick={onClose} className="btn-arena text-xs px-4 py-2">✕ CLOSE</button>
      </div>
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        style={{ flex: 1, width: "100%", border: 0, background: "#000" }}
        title={cart.name}
      />
    </div>
  );
}
