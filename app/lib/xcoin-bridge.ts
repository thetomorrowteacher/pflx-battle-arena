// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — X-Coin Bridge (LIVE)
// Connects to X-Coin's /api/pflx-bridge for real player data,
// XC wagers, awards, and cross-app event publishing.
//
// Arena-specific stats (wins, losses, AP) are stored in Supabase
// under the "arena_stats" key alongside X-Coin's shared data.
// ═══════════════════════════════════════════════════════════════════

import { ArenaPlayer, ArenaStats, XCoinMessage, getArenaRankTier } from "./types";

// ── Configuration ─────────────────────────────────────────────────
const XCOIN_URL =
  process.env.NEXT_PUBLIC_XCOIN_APP_URL ||
  (typeof window !== "undefined"
    ? window.location.origin.replace(":3002", ":3000")
    : "http://localhost:3000");

const BRIDGE = `${XCOIN_URL}/api/pflx-bridge`;

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hyxiagexyptzvetqjmnj.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eGlhZ2V4eXB0enZldHFqbW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODM4MTYsImV4cCI6MjA4OTY1OTgxNn0.hqHVlRu775dZfJrKxSFMNEPhANu5EFm7gJpaJ3RnbnY";

// ── Arena Stats Cache (loaded from Supabase) ──────────────────────
let _arenaStatsCache: Record<string, ArenaStats> = {};
let _arenaStatsLoaded = false;

const DEFAULT_ARENA_STATS: ArenaStats = {
  totalBattles: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  bestWinStreak: 0,
  totalXCWagered: 0,
  totalXCWon: 0,
  totalXCLost: 0,
  arenaRank: "Bronze",
  arenaPoints: 0,
};

// ── Supabase direct helpers (for arena-specific data) ─────────────
async function supabaseLoad(key: string): Promise<unknown> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_data?key=eq.${key}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0]?.data ?? null;
  } catch { return null; }
}

async function supabaseSave(key: string, value: unknown): Promise<boolean> {
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
  } catch { return false; }
}

// ── Arena Stats Persistence ───────────────────────────────────────
async function loadArenaStats(): Promise<Record<string, ArenaStats>> {
  if (_arenaStatsLoaded) return _arenaStatsCache;
  const data = await supabaseLoad("arena_stats");
  if (data && typeof data === "object") {
    _arenaStatsCache = data as Record<string, ArenaStats>;
  }
  _arenaStatsLoaded = true;
  return _arenaStatsCache;
}

async function saveArenaStats(): Promise<void> {
  await supabaseSave("arena_stats", _arenaStatsCache);
}

async function getPlayerArenaStats(playerId: string): Promise<ArenaStats> {
  const stats = await loadArenaStats();
  return stats[playerId] || { ...DEFAULT_ARENA_STATS };
}

async function updatePlayerArenaStats(playerId: string, updater: (s: ArenaStats) => ArenaStats): Promise<ArenaStats> {
  const stats = await loadArenaStats();
  const current = stats[playerId] || { ...DEFAULT_ARENA_STATS };
  const updated = updater(current);
  _arenaStatsCache[playerId] = updated;
  await saveArenaStats();
  return updated;
}

// ── Merge X-Coin player data + arena stats → ArenaPlayer ──────────
async function toArenaPlayer(xcPlayer: Record<string, unknown>): Promise<ArenaPlayer> {
  const id = xcPlayer.id as string;
  const stats = await getPlayerArenaStats(id);
  return {
    id,
    name: (xcPlayer.name as string) || "",
    brandName: xcPlayer.brandName as string | undefined,
    role: (xcPlayer.role as "admin" | "player") || "player",
    avatar: (xcPlayer.avatar as string) || "",
    digitalBadges: (xcPlayer.digitalBadges as number) || 0,
    xcoin: (xcPlayer.xcoin as number) || 0,
    totalXcoin: (xcPlayer.totalXcoin as number) || 0,
    level: (xcPlayer.level as number) || 1,
    rank: (xcPlayer.rank as number) || 1,
    cohort: (xcPlayer.cohort as string) || "",
    pathway: (xcPlayer.pathway as string) || "",
    image: xcPlayer.image as string | undefined,
    pin: xcPlayer.pin as string | undefined,
    badgeCounts: xcPlayer.badgeCounts as ArenaPlayer["badgeCounts"],
    arenaStats: stats,
  };
}

// ── Player Authentication ─────────────────────────────────────────
export async function authenticatePlayer(brandName: string, pin: string): Promise<ArenaPlayer | null> {
  try {
    // Fetch all users from X-Coin to find matching credentials
    const res = await fetch(`${BRIDGE}?action=users`);
    if (!res.ok) return null;
    const { players } = await res.json();
    const match = (players || []).find(
      (p: Record<string, unknown>) =>
        ((p.brandName as string) || "").toLowerCase() === brandName.toLowerCase() &&
        (p.pin as string) === pin
    );
    if (!match) return null;

    const arenaPlayer = await toArenaPlayer(match);

    // Publish login event
    await publishBridgeEvent("PLAYER_LOGIN", { playerId: arenaPlayer.id, brandName: arenaPlayer.brandName });

    return arenaPlayer;
  } catch (err) {
    console.error("[Battle Arena] Auth error:", err);
    return null;
  }
}

// ── Fetch Player Data from X-Coin ─────────────────────────────────
export async function fetchPlayerData(playerId: string): Promise<ArenaPlayer | null> {
  try {
    const res = await fetch(`${BRIDGE}?action=user&id=${encodeURIComponent(playerId)}`);
    if (!res.ok) return null;
    const { player } = await res.json();
    if (!player) return null;
    return toArenaPlayer(player);
  } catch (err) {
    console.error("[Battle Arena] fetchPlayerData error:", err);
    return null;
  }
}

export async function fetchAllPlayers(): Promise<ArenaPlayer[]> {
  try {
    const res = await fetch(`${BRIDGE}?action=users`);
    if (!res.ok) return [];
    const { players } = await res.json();
    if (!players || !Array.isArray(players)) return [];
    return Promise.all(players.map((p: Record<string, unknown>) => toArenaPlayer(p)));
  } catch (err) {
    console.error("[Battle Arena] fetchAllPlayers error:", err);
    return [];
  }
}

// ── XC Transactions (via PFLX Bridge) ─────────────────────────────
export async function deductXC(playerId: string, amount: number, reason: string): Promise<boolean> {
  try {
    const res = await fetch(BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "xc_update",
        playerId,
        delta: -amount,
        reason: `[Battle Arena] ${reason}`,
        app: "battle-arena",
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success) return false;

    // Update arena stats
    await updatePlayerArenaStats(playerId, (s) => ({
      ...s,
      totalXCWagered: s.totalXCWagered + amount,
    }));

    await publishBridgeEvent("XC_DEDUCT", { playerId, amount, reason, newBalance: data.newXC });
    return true;
  } catch (err) {
    console.error("[Battle Arena] deductXC error:", err);
    return false;
  }
}

export async function awardXC(playerId: string, amount: number, reason: string): Promise<boolean> {
  try {
    const res = await fetch(BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "xc_update",
        playerId,
        delta: amount,
        reason: `[Battle Arena] ${reason}`,
        app: "battle-arena",
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success) return false;

    // Update arena stats
    await updatePlayerArenaStats(playerId, (s) => ({
      ...s,
      totalXCWon: s.totalXCWon + amount,
    }));

    await publishBridgeEvent("XC_AWARD", { playerId, amount, reason, newBalance: data.newXC });
    return true;
  } catch (err) {
    console.error("[Battle Arena] awardXC error:", err);
    return false;
  }
}

// ── Badge Checks ──────────────────────────────────────────────────
export async function checkPlayerBadges(playerId: string, requiredBadges: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${BRIDGE}?action=user&id=${encodeURIComponent(playerId)}`);
    if (!res.ok) return false;
    const { player } = await res.json();
    if (!player) return false;
    // Check if player has enough total badges (simplified check)
    return (player.digitalBadges || 0) >= requiredBadges.length;
  } catch {
    return false;
  }
}

export async function awardBadge(playerId: string, badgeName: string): Promise<boolean> {
  await publishBridgeEvent("BADGE_AWARD", { playerId, badgeName });
  // Cross-app event for X-Coin to pick up
  try {
    await fetch(BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "event",
        app: "battle-arena",
        type: "badge_earned",
        data: { badgeName },
        playerId,
      }),
    });
    return true;
  } catch { return false; }
}

// ── Battle Results → X-Coin ───────────────────────────────────────
export async function reportBattleResult(
  battleId: string,
  winnerId: string,
  loserId: string,
  xcWon: number,
  mode: string,
): Promise<void> {
  // Update winner arena stats
  await updatePlayerArenaStats(winnerId, (s) => {
    const newStreak = s.winStreak + 1;
    const newAP = s.arenaPoints + 50;
    return {
      ...s,
      wins: s.wins + 1,
      totalBattles: s.totalBattles + 1,
      winStreak: newStreak,
      bestWinStreak: Math.max(s.bestWinStreak, newStreak),
      arenaPoints: newAP,
      arenaRank: getArenaRankTier(newAP),
    };
  });

  // Update loser arena stats
  await updatePlayerArenaStats(loserId, (s) => {
    const newAP = Math.max(0, s.arenaPoints - 20);
    return {
      ...s,
      losses: s.losses + 1,
      totalBattles: s.totalBattles + 1,
      winStreak: 0,
      totalXCLost: s.totalXCLost + xcWon,
      arenaPoints: newAP,
      arenaRank: getArenaRankTier(newAP),
    };
  });

  // Publish cross-app event
  try {
    await fetch(BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "event",
        app: "battle-arena",
        type: "battle_won",
        data: { battleId, winnerId, loserId, xcWon, mode },
        playerId: winnerId,
      }),
    });
  } catch (err) {
    console.error("[Battle Arena] reportBattleResult event error:", err);
  }

  await publishBridgeEvent("BATTLE_RESULT", { battleId, winnerId, loserId, xcWon, mode });
}

// ── Leaderboard Sync ──────────────────────────────────────────────
export async function syncLeaderboard(): Promise<void> {
  const stats = await loadArenaStats();
  const topPlayers = Object.entries(stats)
    .sort(([, a], [, b]) => b.arenaPoints - a.arenaPoints)
    .slice(0, 10)
    .map(([id, s]) => ({ id, ap: s.arenaPoints, wins: s.wins, losses: s.losses }));

  try {
    await fetch(BRIDGE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "event",
        app: "battle-arena",
        type: "system",
        data: { leaderboard: topPlayers },
      }),
    });
  } catch (err) {
    console.error("[Battle Arena] syncLeaderboard error:", err);
  }

  await publishBridgeEvent("LEADERBOARD_UPDATE", { topPlayers });
}

// ── Message Logger ────────────────────────────────────────────────
const messageLog: XCoinMessage[] = [];

function publishBridgeEvent(type: XCoinMessage["type"], payload: Record<string, unknown>): void {
  const msg: XCoinMessage = {
    type,
    payload,
    timestamp: new Date().toISOString(),
    sourceApp: "battle_arena",
  };
  messageLog.push(msg);
  if (messageLog.length > 200) messageLog.splice(0, messageLog.length - 200);
  if (typeof window !== "undefined") {
    console.log(`[PFLX Bridge] ${msg.type}:`, msg.payload);
  }
}

export function getMessageLog(): XCoinMessage[] {
  return [...messageLog];
}
