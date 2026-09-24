// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — X-Rush persistence (Sept 24, PATCH ARENA xrush-1)
// Thin Supabase app_data read/write wrapper around the pure functions
// in xrush.ts, following the EXACT read-merge-write discipline
// decks.ts's loadDecks/upsertDeck already use for this same project
// (pflx-persistence-guardrail): never a wholesale overwrite, always
// merge the freshest cloud copy with the local change before writing.
// ═══════════════════════════════════════════════════════════════════

import { XRushRace, XRUSH_RACES_KEY, XRUSH_ACTIVE_KEY, xrushMergeRace, xrushMergeRaceList } from "./xrush";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hyxiagexyptzvetqjmnj.supabase.co";
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
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ key, data: value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadRaces(): Promise<XRushRace[]> {
  const cloud = (await kvLoad(XRUSH_RACES_KEY)) as { races?: XRushRace[] } | null;
  return cloud && Array.isArray(cloud.races) ? cloud.races : [];
}

export async function loadRace(raceId: string): Promise<XRushRace | null> {
  const races = await loadRaces();
  return races.find((r) => r.id === raceId) || null;
}

/**
 * Read-merge-write: fetch the freshest cloud copy, merge the caller's
 * (possibly stale) race into it, write the merged result. Returns the
 * merged race actually saved. This is what makes two racers finishing
 * within the same poll window safe -- neither client's write can ever
 * discard the other's progress (see xrushMergeRace).
 */
export async function saveRace(race: XRushRace): Promise<XRushRace> {
  const cloudRaces = await loadRaces();
  const cloudMatch = cloudRaces.find((r) => r.id === race.id);
  const merged = cloudMatch ? xrushMergeRace(cloudMatch, race) : race;
  const mergedList = xrushMergeRaceList(cloudRaces, [merged]);
  const trimmed = mergedList.slice(0, 40); // keep the KV row bounded
  await kvSave(XRUSH_RACES_KEY, { races: trimmed, updatedAt: Date.now() });
  return merged;
}

export interface XRushActivePointer {
  raceId: string;
  deckName: string;
  startedAt: number;
}

export async function setActiveRacePointer(ptr: XRushActivePointer | null): Promise<boolean> {
  return kvSave(XRUSH_ACTIVE_KEY, ptr);
}

export async function getActiveRacePointer(): Promise<XRushActivePointer | null> {
  const v = (await kvLoad(XRUSH_ACTIVE_KEY)) as XRushActivePointer | null;
  return v && v.raceId ? v : null;
}

// ── Shared X-Live teams config (read-only from Arena's side) ───────
// X-Live owns pflx_lite_config.teams = { names: string[], assign: {playerId: teamName} }.
// Arena reads it directly (same project, same anon key, same pattern
// already proven for pflx_ba_decks) rather than duplicating a team
// system -- teams drafted in X-Live show up here automatically.
export interface XLiveTeamsConfig {
  names: string[];
  assign: Record<string, string>;
}

export async function loadXLiveTeams(): Promise<XLiveTeamsConfig> {
  const cfg = (await kvLoad("pflx_lite_config")) as { teams?: XLiveTeamsConfig } | null;
  if (cfg && cfg.teams && Array.isArray(cfg.teams.names)) {
    return { names: cfg.teams.names, assign: cfg.teams.assign || {} };
  }
  return { names: [], assign: {} };
}
