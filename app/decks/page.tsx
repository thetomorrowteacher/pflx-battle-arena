"use client";

// ═══════════════════════════════════════════════════════════════════
// KNOWLEDGE DECKS — the game database behind Battle Arena Studio.
// Import a deck from a Quizlet export paste, a CSV file, or by hand;
// arena games bind a deck as their question/content dataset.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useArenaStore } from "../lib/store";
import {
  KnowledgeDeck,
  ParseResult,
  parseDelimited,
  parseCsv,
  loadDecks,
  upsertDeck,
  deleteDeck,
  newDeck,
  MAX_CARDS_PER_DECK,
} from "../lib/decks";

type TermSep = "tab" | "comma" | "dash" | "custom";
type RowSep = "newline" | "semicolon" | "custom";

const SOURCE_BADGE: Record<string, { label: string; cls: string }> = {
  quizlet: { label: "QUIZLET", cls: "text-pflx-cyan border-pflx-cyan/40 bg-pflx-cyan/10" },
  csv: { label: "CSV", cls: "text-pflx-gold border-pflx-gold/40 bg-pflx-gold/10" },
  manual: { label: "MANUAL", cls: "text-pflx-purple border-pflx-purple/40 bg-pflx-purple/10" },
};

export default function DecksPage() {
  const router = useRouter();
  const { currentPlayer, isLoggedIn } = useArenaStore();
  const isHost = currentPlayer?.role === "admin";

  const [decks, setDecks] = useState<KnowledgeDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [viewDeck, setViewDeck] = useState<KnowledgeDeck | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // import form
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [termSep, setTermSep] = useState<TermSep>("tab");
  const [rowSep, setRowSep] = useState<RowSep>("newline");
  const [customTerm, setCustomTerm] = useState("::");
  const [customRow, setCustomRow] = useState("||");
  const [isCsvFile, setIsCsvFile] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/"); return; }
    (async () => {
      try { setDecks(await loadDecks()); } finally { setLoading(false); }
    })();
  }, [isLoggedIn, router]);

  const preview: ParseResult = useMemo(() => {
    if (!text.trim()) return { cards: [], skipped: 0, totalRows: 0 };
    if (isCsvFile) return parseCsv(text);
    const ts = termSep === "tab" ? "\t" : termSep === "comma" ? "," : termSep === "dash" ? " - " : customTerm || "::";
    const rs = rowSep === "newline" ? "\n" : rowSep === "semicolon" ? ";" : customRow || "||";
    return parseDelimited(text, ts, rs);
  }, [text, termSep, rowSep, customTerm, customRow, isCsvFile]);

  function resetForm() {
    setName(""); setSubject(""); setText("");
    setTermSep("tab"); setRowSep("newline"); setIsCsvFile(false); setError("");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { setError("File too large (max 1 MB)."); return; }
    const content = await file.text();
    setText(content);
    setIsCsvFile(/\.csv$/i.test(file.name));
    if (!name) setName(file.name.replace(/\.(csv|txt)$/i, ""));
    e.target.value = "";
  }

  async function handleImport() {
    setError("");
    if (!name.trim()) { setError("Give the deck a name."); return; }
    if (preview.cards.length === 0) { setError("No cards parsed yet — check the separators against your paste."); return; }
    setBusy(true);
    try {
      const deck = newDeck(
        name,
        preview.cards,
        isCsvFile ? "csv" : "quizlet",
        currentPlayer?.id || "unknown",
        currentPlayer?.brandName || currentPlayer?.name,
        subject
      );
      setDecks(await upsertDeck(deck));
      setImportOpen(false);
      resetForm();
    } catch {
      setError("Import failed — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(deck: KnowledgeDeck) {
    if (!confirm(`Delete deck "${deck.name}" (${deck.cards.length} cards)? Games bound to it lose their dataset.`)) return;
    setBusy(true);
    try { setDecks(await deleteDeck(deck.id)); } finally { setBusy(false); }
  }

  const filtered = decks.filter(
    (d) =>
      !search.trim() ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen arena-grid-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-widest text-pflx-cyan text-glow-cyan">
              📚 KNOWLEDGE DECKS
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
              The game database. Import flashcard decks — every Side Quest game can bind a deck as
              its question set. Quizlet: open your set → ⋯ → <span className="text-pflx-cyan">Export</span> →
              copy the text → paste it here (keep Tab / New line).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search decks…"
              className="bg-black/40 border border-pflx-cyan/20 rounded px-3 py-2 text-xs text-gray-200 outline-none focus:border-pflx-cyan/60 w-44"
            />
            <button className="btn-arena text-xs py-2 px-5" onClick={() => { resetForm(); setImportOpen(true); }}>
              ⬆ IMPORT DECK
            </button>
          </div>
        </div>

        {/* Deck grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-20 font-mono text-sm">LOADING DECKS…</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">🃏</div>
            <p className="text-gray-400 text-sm">
              {decks.length === 0 ? "No decks yet. Import your first Quizlet set and it becomes a game dataset." : "No decks match that search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((deck) => {
              const badge = SOURCE_BADGE[deck.source] || SOURCE_BADGE.manual;
              const canDelete = isHost || deck.createdBy === currentPlayer?.id;
              return (
                <div key={deck.id} className="glass-panel rounded-xl p-5 border border-pflx-cyan/15 hover:border-pflx-cyan/40 transition-colors flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-mono text-sm font-bold text-gray-100 tracking-wide leading-snug">{deck.name}</h3>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${badge.cls} whitespace-nowrap`}>{badge.label}</span>
                  </div>
                  {deck.subject && (
                    <span className="self-start text-[10px] text-pflx-purple bg-pflx-purple/10 border border-pflx-purple/30 rounded px-2 py-0.5 mb-2">
                      {deck.subject}
                    </span>
                  )}
                  <div className="text-[11px] text-gray-500 mb-4">
                    <span className="text-pflx-gold font-bold">{deck.cards.length}</span> cards
                    {deck.createdByName ? <> · by {deck.createdByName}</> : null}
                    {" · "}{new Date(deck.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <button className="btn-arena text-[10px] py-1.5 px-4 flex-1" onClick={() => setViewDeck(deck)}>
                      VIEW CARDS
                    </button>
                    {canDelete && (
                      <button className="btn-arena-red text-[10px] py-1.5 px-3" disabled={busy} onClick={() => handleDelete(deck)}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Import modal ── */}
        {importOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setImportOpen(false)}>
            <div className="glass-panel rounded-xl border border-pflx-cyan/30 w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-mono text-lg font-bold text-pflx-cyan tracking-widest mb-1">⬆ IMPORT DECK</h2>
              <p className="text-[11px] text-gray-500 mb-4">
                Paste a Quizlet export (set → ⋯ → Export → Copy text), or upload a .csv / .txt file
                (columns: term, definition, optional tags).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Deck name *"
                  className="bg-black/40 border border-pflx-cyan/20 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-pflx-cyan/60"
                />
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (e.g. Biology, Design Thinking)"
                  className="bg-black/40 border border-pflx-cyan/20 rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-pflx-cyan/60"
                />
              </div>

              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setIsCsvFile(false); }}
                placeholder={"Paste your export here…\nphotosynthesis\tprocess plants use to convert light into energy\nmitochondria\tpowerhouse of the cell"}
                rows={8}
                className="w-full bg-black/40 border border-pflx-cyan/20 rounded px-3 py-2 text-xs text-gray-200 outline-none focus:border-pflx-cyan/60 font-mono mb-3"
              />

              <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] text-gray-400">
                <label className="btn-arena text-[10px] py-1.5 px-4 cursor-pointer">
                  📄 UPLOAD .CSV / .TXT
                  <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
                </label>
                {!isCsvFile && (
                  <>
                    <span>
                      term/definition:{" "}
                      <select value={termSep} onChange={(e) => setTermSep(e.target.value as TermSep)} className="bg-black/60 border border-pflx-cyan/20 rounded px-2 py-1 text-gray-200">
                        <option value="tab">Tab (Quizlet default)</option>
                        <option value="comma">Comma</option>
                        <option value="dash">&quot; - &quot;</option>
                        <option value="custom">Custom…</option>
                      </select>
                      {termSep === "custom" && (
                        <input value={customTerm} onChange={(e) => setCustomTerm(e.target.value)} className="w-14 ml-1 bg-black/60 border border-pflx-cyan/20 rounded px-2 py-1 text-gray-200" />
                      )}
                    </span>
                    <span>
                      rows:{" "}
                      <select value={rowSep} onChange={(e) => setRowSep(e.target.value as RowSep)} className="bg-black/60 border border-pflx-cyan/20 rounded px-2 py-1 text-gray-200">
                        <option value="newline">New line (default)</option>
                        <option value="semicolon">Semicolon</option>
                        <option value="custom">Custom…</option>
                      </select>
                      {rowSep === "custom" && (
                        <input value={customRow} onChange={(e) => setCustomRow(e.target.value)} className="w-14 ml-1 bg-black/60 border border-pflx-cyan/20 rounded px-2 py-1 text-gray-200" />
                      )}
                    </span>
                  </>
                )}
                {isCsvFile && <span className="text-pflx-gold">CSV mode — parsing columns term, definition, tags</span>}
              </div>

              {/* Live preview */}
              <div className="bg-black/30 border border-pflx-cyan/15 rounded-lg p-3 mb-4">
                <div className="font-mono text-[10px] tracking-widest text-pflx-cyan mb-2">
                  PREVIEW — {preview.cards.length} card{preview.cards.length === 1 ? "" : "s"} parsed
                  {preview.skipped > 0 && <span className="text-pflx-gold"> · {preview.skipped} row{preview.skipped === 1 ? "" : "s"} skipped</span>}
                  {preview.cards.length >= MAX_CARDS_PER_DECK && <span className="text-pflx-gold"> · capped at {MAX_CARDS_PER_DECK}</span>}
                </div>
                {preview.cards.length === 0 ? (
                  <div className="text-[11px] text-gray-600">Nothing parsed yet — paste above and the cards appear here.</div>
                ) : (
                  <div className="space-y-1">
                    {preview.cards.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex gap-2 text-[11px]">
                        <span className="text-gray-200 font-semibold min-w-0 truncate max-w-[38%]">{c.term}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-gray-400 min-w-0 truncate">{c.definition}</span>
                      </div>
                    ))}
                    {preview.cards.length > 5 && (
                      <div className="text-[10px] text-gray-600">…and {preview.cards.length - 5} more</div>
                    )}
                  </div>
                )}
              </div>

              {error && <div className="text-xs text-red-400 mb-3">{error}</div>}

              <div className="flex justify-end gap-3">
                <button className="btn-arena-red text-xs py-2 px-4" onClick={() => setImportOpen(false)}>CANCEL</button>
                <button className="btn-arena-gold text-xs py-2 px-6" disabled={busy || preview.cards.length === 0} onClick={handleImport}>
                  {busy ? "IMPORTING…" : `IMPORT ${preview.cards.length || ""} CARDS`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Deck detail modal ── */}
        {viewDeck && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewDeck(null)}>
            <div className="glass-panel rounded-xl border border-pflx-cyan/30 w-full max-w-3xl max-h-[85vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="font-mono text-lg font-bold text-pflx-cyan tracking-widest">{viewDeck.name}</h2>
                <button className="text-gray-500 hover:text-gray-200 text-lg" onClick={() => setViewDeck(null)}>✕</button>
              </div>
              <div className="text-[11px] text-gray-500 mb-4">
                {viewDeck.cards.length} cards
                {viewDeck.subject ? <> · {viewDeck.subject}</> : null}
                {viewDeck.createdByName ? <> · by {viewDeck.createdByName}</> : null}
              </div>
              <div className="overflow-y-auto flex-1 space-y-1 pr-1">
                {viewDeck.cards.map((c, i) => (
                  <div key={c.id} className="grid grid-cols-[24px_1fr_1fr] gap-3 items-start bg-black/30 border border-white/5 rounded px-3 py-2">
                    <span className="text-[10px] text-gray-600 font-mono pt-0.5">{i + 1}</span>
                    <span className="text-xs text-gray-100 font-semibold break-words">{c.term}</span>
                    <span className="text-xs text-gray-400 break-words">
                      {c.definition}
                      {c.tags && c.tags.length > 0 && (
                        <span className="block mt-1">
                          {c.tags.map((t) => (
                            <span key={t} className="inline-block text-[9px] text-pflx-purple bg-pflx-purple/10 border border-pflx-purple/30 rounded px-1.5 py-0.5 mr-1">{t}</span>
                          ))}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
