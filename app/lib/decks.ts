// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — Knowledge Decks (July 2026)
// The knowledge & game database behind Battle Arena Studio / Side
// Quest: hosts + players import flashcard decks (Quizlet export
// paste, CSV, or manual) and every arena game can bind a deck as its
// question/content dataset.
//
// NOTE: Quizlet's official API is discontinued — the supported path
// is Quizlet's built-in EXPORT (set page → ⋯ → Export), which yields
// term<TAB>definition rows. We parse that paste directly, plus CSV.
//
// Storage: Supabase app_data KV row `pflx_ba_decks` { decks: [...] }
// with a localStorage mirror. All writes are read-modify-write on the
// freshest cloud copy (stomp-guard lesson from MC, July 2026).
// ═══════════════════════════════════════════════════════════════════

export interface KnowledgeCard {
  id: string;
  term: string;
  definition: string;
  image?: string;
  tags?: string[];
}

export type DeckSource = "quizlet" | "csv" | "manual";

export interface KnowledgeDeck {
  id: string;
  name: string;
  subject?: string;
  description?: string;
  source: DeckSource;
  cards: KnowledgeCard[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export const DECKS_KEY = "pflx_ba_decks";
export const MAX_CARDS_PER_DECK = 500;
export const MAX_DECKS = 120;

function uid(prefix: string): string {
  return prefix + "_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
}

// ── Parsers ─────────────────────────────────────────────────────────

export interface ParseResult {
  cards: KnowledgeCard[];
  skipped: number;
  totalRows: number;
}

/**
 * Parse delimiter-separated flashcards — matches Quizlet's Export
 * dialog options ("between term and definition": Tab / Comma / custom;
 * "between rows": New line / Semicolon / custom). The term/definition
 * split happens on the FIRST separator occurrence only, so definitions
 * containing the separator survive intact.
 */
export function parseDelimited(text: string, termSep: string, rowSep: string): ParseResult {
  const rows =
    rowSep === "\n"
      ? String(text || "").split(/\r?\n/)
      : String(text || "").split(rowSep);
  const cards: KnowledgeCard[] = [];
  let skipped = 0;
  let totalRows = 0;
  for (const raw of rows) {
    const row = raw.trim();
    if (!row) continue;
    totalRows++;
    const idx = row.indexOf(termSep);
    if (idx <= 0) { skipped++; continue; }
    const term = row.slice(0, idx).trim();
    const definition = row.slice(idx + termSep.length).trim();
    if (!term || !definition) { skipped++; continue; }
    cards.push({ id: uid("card"), term, definition });
    if (cards.length >= MAX_CARDS_PER_DECK) break;
  }
  return { cards, skipped, totalRows };
}

/**
 * Minimal RFC-4180-ish CSV parser (quoted fields, escaped quotes,
 * CRLF). Column 0 = term, column 1 = definition, optional column 2 =
 * tags (split on ; or |). Header rows like "term,definition" are
 * skipped automatically.
 */
export function parseCsv(text: string): ParseResult {
  const src = String(text || "");
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else {
      field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const cards: KnowledgeCard[] = [];
  let skipped = 0;
  let totalRows = 0;
  for (const r of rows) {
    const term = (r[0] || "").trim();
    const definition = (r[1] || "").trim();
    if (!term && !definition) continue;
    totalRows++;
    // skip an obvious header row
    if (cards.length === 0 && /^(term|question|front)$/i.test(term) && /^(definition|answer|back)$/i.test(definition)) {
      continue;
    }
    if (!term || !definition) { skipped++; continue; }
    const tags = (r[2] || "")
      .split(/[;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
    cards.push({ id: uid("card"), term, definition, ...(tags.length ? { tags } : {}) });
    if (cards.length >= MAX_CARDS_PER_DECK) break;
  }
  return { cards, skipped, totalRows };
}

/** Best-guess parse: tabs → Quizlet export; else CSV; else " - " rows. */
export function autoParse(text: string): { result: ParseResult; mode: string } {
  const t = String(text || "");
  if (t.indexOf("\t") !== -1) return { result: parseDelimited(t, "\t", "\n"), mode: "quizlet-tab" };
  const firstLines = t.split(/\r?\n/).slice(0, 5).filter(Boolean);
  const commaish = firstLines.length > 0 && firstLines.every((l) => l.indexOf(",") !== -1);
  if (commaish) return { result: parseCsv(t), mode: "csv" };
  return { result: parseDelimited(t, " - ", "\n"), mode: "dash" };
}

// ── Persistence (Supabase app_data KV + localStorage mirror) ───────

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hyxiagexyptzvetqjmnj.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eGlhZ2V4eXB0enZldHFqbW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODM4MTYsImV4cCI6MjA4OTY1OTgxNn0.hqHVlRu775dZfJrKxSFMNEPhANu5EFm7gJpaJ3RnbnY";

async function kvLoad(key: string): Promise<unknown> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_data?key=eq.${key}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.data ?? null;
  } catch {
    return null;
  }
}

async function kvSave(key: string, value: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_data`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ key, data: value, updated_at: new Date().toISOString() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function mirrorLocal(decks: KnowledgeDeck[]) {
  try { localStorage.setItem(DECKS_KEY, JSON.stringify({ decks })); } catch { /* quota */ }
}

function readLocal(): KnowledgeDeck[] {
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.decks) ? parsed.decks : [];
  } catch {
    return [];
  }
}

export async function loadDecks(): Promise<KnowledgeDeck[]> {
  const cloud = (await kvLoad(DECKS_KEY)) as { decks?: KnowledgeDeck[] } | null;
  if (cloud && Array.isArray(cloud.decks)) {
    mirrorLocal(cloud.decks);
    return cloud.decks;
  }
  return readLocal();
}

/**
 * Read-modify-write against the freshest cloud copy so two clients
 * can't stomp each other's decks (MC stomp-guard lesson).
 */
export async function upsertDeck(deck: KnowledgeDeck): Promise<KnowledgeDeck[]> {
  const decks = await loadDecks();
  const i = decks.findIndex((d) => d.id === deck.id);
  if (i >= 0) decks[i] = deck;
  else decks.unshift(deck);
  const trimmed = decks.slice(0, MAX_DECKS);
  await kvSave(DECKS_KEY, { decks: trimmed, updatedAt: Date.now() });
  mirrorLocal(trimmed);
  return trimmed;
}

export async function deleteDeck(deckId: string): Promise<KnowledgeDeck[]> {
  const decks = (await loadDecks()).filter((d) => d.id !== deckId);
  await kvSave(DECKS_KEY, { decks, updatedAt: Date.now() });
  mirrorLocal(decks);
  return decks;
}

export function newDeck(
  name: string,
  cards: KnowledgeCard[],
  source: DeckSource,
  createdBy: string,
  createdByName?: string,
  subject?: string,
  description?: string
): KnowledgeDeck {
  const now = new Date().toISOString();
  return {
    id: uid("deck"),
    name: name.trim(),
    ...(subject ? { subject: subject.trim() } : {}),
    ...(description ? { description: description.trim() } : {}),
    source,
    cards: cards.slice(0, MAX_CARDS_PER_DECK),
    createdBy,
    ...(createdByName ? { createdByName } : {}),
    createdAt: now,
    updatedAt: now,
  };
}

// ── Game SDK surface ────────────────────────────────────────────────
// Cartridge games receive a deck as their dataset via postMessage:
//   { type: "pflx_arena_deck", deck: DeckGameData }
// (The play-side wiring lands with the Studio; this is the contract.)
export interface DeckGameData {
  id: string;
  name: string;
  subject?: string;
  cards: Array<{ term: string; definition: string; tags?: string[] }>;
}

export function deckToGameData(deck: KnowledgeDeck): DeckGameData {
  return {
    id: deck.id,
    name: deck.name,
    ...(deck.subject ? { subject: deck.subject } : {}),
    cards: deck.cards.map((c) => ({
      term: c.term,
      definition: c.definition,
      ...(c.tags && c.tags.length ? { tags: c.tags } : {}),
    })),
  };
}
