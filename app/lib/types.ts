// ═══════════════════════════════════════════════════════════════════
// PFLX Battle Arena — Core Types
// Mirrors X-Coin app types for cross-app communication
// ═══════════════════════════════════════════════════════════════════

// ── Player types (synced from X-Coin) ─────────────────────────────

export type Role = "admin" | "player";

export interface BadgeBreakdown {
  signature: number;
  executive: number;
  premium: number;
  primary: number;
}

export interface ArenaPlayer {
  id: string;
  name: string;
  brandName?: string;
  role: Role;
  avatar: string;
  digitalBadges: number;
  xcoin: number;
  totalXcoin: number;
  level: number;
  rank: number;
  cohort: string;
  pathway: string;
  image?: string;
  pin?: string;
  badgeCounts?: BadgeBreakdown;
  // Arena-specific stats
  arenaStats: ArenaStats;
}

export interface ArenaStats {
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  totalXCWagered: number;
  totalXCWon: number;
  totalXCLost: number;
  arenaRank: ArenaRankTier;
  arenaPoints: number; // AP — determines arena rank tier
  favoriteMode?: GameMode;
}

// ── Arena Rank Tiers ──────────────────────────────────────────────

export type ArenaRankTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Champion"
  | "Legend";

export const ARENA_RANK_TIERS: { tier: ArenaRankTier; minAP: number; icon: string; color: string }[] = [
  { tier: "Bronze",    minAP: 0,     icon: "🥉", color: "#cd7f32" },
  { tier: "Silver",    minAP: 500,   icon: "🥈", color: "#c0c0c0" },
  { tier: "Gold",      minAP: 1500,  icon: "🥇", color: "#ffd740" },
  { tier: "Platinum",  minAP: 3000,  icon: "💠", color: "#00e5ff" },
  { tier: "Diamond",   minAP: 5000,  icon: "💎", color: "#7c4dff" },
  { tier: "Champion",  minAP: 8000,  icon: "🏆", color: "#e040fb" },
  { tier: "Legend",    minAP: 12000, icon: "🔱", color: "#ff1744" },
];

export function getArenaRankTier(ap: number): ArenaRankTier {
  for (let i = ARENA_RANK_TIERS.length - 1; i >= 0; i--) {
    if (ap >= ARENA_RANK_TIERS[i].minAP) return ARENA_RANK_TIERS[i].tier;
  }
  return "Bronze";
}

export function getArenaRankInfo(ap: number) {
  for (let i = ARENA_RANK_TIERS.length - 1; i >= 0; i--) {
    if (ap >= ARENA_RANK_TIERS[i].minAP) return ARENA_RANK_TIERS[i];
  }
  return ARENA_RANK_TIERS[0];
}

// ── Game Modes ────────────────────────────────────────────────────

export type GameMode =
  | "quiz_duel"
  | "project_showdown"
  | "team_clash"
  | "strategy_battle";

export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  teamBased: boolean;
  estimatedMinutes: number;
  requiredBadges?: string[];  // Badge-gated entry
  minRank?: number;           // Minimum Evolution Rank to enter
  minArenaRank?: ArenaRankTier;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: "quiz_duel",
    name: "Quiz Duel",
    description: "1v1 head-to-head knowledge battles. Answer questions faster and more accurately than your opponent to win XC.",
    icon: "⚡",
    minPlayers: 2,
    maxPlayers: 2,
    teamBased: false,
    estimatedMinutes: 5,
  },
  {
    id: "project_showdown",
    name: "Project Showdown",
    description: "Submit your best work and let the community vote. The highest-rated project wins the pot.",
    icon: "🎨",
    minPlayers: 2,
    maxPlayers: 8,
    teamBased: false,
    estimatedMinutes: 15,
  },
  {
    id: "team_clash",
    name: "Team Clash",
    description: "Form squads and compete in timed collaborative missions. Teamwork makes the dream work — and the XC flow.",
    icon: "👥",
    minPlayers: 4,
    maxPlayers: 12,
    teamBased: true,
    estimatedMinutes: 20,
  },
  {
    id: "strategy_battle",
    name: "Strategy Battle",
    description: "Deploy cards, abilities, and XC resources in turn-based tactical combat. Outsmart your opponent to claim victory.",
    icon: "♟️",
    minPlayers: 2,
    maxPlayers: 2,
    teamBased: false,
    estimatedMinutes: 10,
  },
];

// ── Battle Types ──────────────────────────────────────────────────

export type BattleStatus =
  | "waiting"     // In lobby, waiting for players
  | "ready"       // All players joined, about to start
  | "in_progress" // Battle is live
  | "completed"   // Battle finished
  | "cancelled";  // Battle was cancelled

export interface Battle {
  id: string;
  mode: GameMode;
  status: BattleStatus;
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  players: BattlePlayer[];
  teams?: BattleTeam[];
  wagerAmount: number;        // XC wagered per player
  prizePool: number;          // Total XC in the pot
  winnerId?: string;          // Player or team ID
  winnerReward?: number;      // XC awarded to winner
  rounds: BattleRound[];
  currentRound: number;
  totalRounds: number;
  settings: BattleSettings;
}

export interface BattlePlayer {
  playerId: string;
  player: ArenaPlayer;
  teamId?: string;
  score: number;
  isReady: boolean;
  joinedAt: string;
}

export interface BattleTeam {
  id: string;
  name: string;
  playerIds: string[];
  score: number;
  color: string;
}

export interface BattleRound {
  roundNumber: number;
  question?: QuizQuestion;
  answers: BattleAnswer[];
  winnerId?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface BattleAnswer {
  playerId: string;
  answer: string;
  isCorrect: boolean;
  timeMs: number; // How fast they answered
  pointsEarned: number;
}

export interface BattleSettings {
  timePerQuestion: number;  // seconds
  category?: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  allowSpectators: boolean;
  isRanked: boolean;
  badgeGated?: string[];    // Required badges to enter
  minRank?: number;
}

// ── Quiz Questions ────────────────────────────────────────────────

export type QuestionCategory =
  | "entrepreneurship"
  | "content_creation"
  | "digital_art"
  | "3d_modeling"
  | "cs_ai"
  | "sound_design"
  | "game_design"
  | "general_knowledge"
  | "pflx_lore";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index into options
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // seconds
  xcBonus?: number;  // bonus XC for answering correctly
}

// ── Wager System ──────────────────────────────────────────────────

export interface Wager {
  id: string;
  battleId: string;
  playerId: string;
  amount: number;
  type: "entry" | "side_bet";
  status: "locked" | "won" | "lost" | "refunded";
  createdAt: string;
  resolvedAt?: string;
}

// ── Leaderboard ───────────────────────────────────────────────────

export interface LeaderboardEntry {
  playerId: string;
  player: ArenaPlayer;
  position: number;
  arenaPoints: number;
  wins: number;
  losses: number;
  winRate: number;
  totalXCWon: number;
  streak: number;
}

// ── Cartridges (uploaded custom game modes) ──────────────────────
// A "cartridge" is a self-contained HTML file defining a custom game mode.
// Hosts configure rewards/fines, coin type, badge/rank gating, then players play.

export type CoinType = "primary" | "premium";

export interface CartridgeConfig {
  // Reward / fine economy (XC)
  winXC: number;       // XC awarded to winner(s)
  loseXC: number;      // XC deducted from loser(s) — set 0 for no fine
  drawXC?: number;     // XC for draws
  // Coin types (primary/premium) awarded on win
  coinType: CoinType;  // Which coin slot the rewards credit
  winCoins: number;    // Amount of coinType credited on win
  // Gating
  requiredBadges: string[]; // Badge IDs/names required to enter
  minArenaRank?: ArenaRankTier;
  minEvolutionRank?: number;
  // Entry
  entryFee: number;    // XC required to enter (0 = free)
  minPlayers: number;
  maxPlayers: number;
  estimatedMinutes: number;
  // Optional per-mode metadata
  description?: string;
  icon?: string;       // Emoji or image URL
}

export interface Cartridge {
  id: string;
  name: string;
  version: string;
  author: string;       // Brand of uploader
  authorId: string;     // Player id of uploader
  uploadedAt: string;
  // The HTML payload (self-contained game HTML file content)
  htmlContent: string;
  // How big the file was (bytes)
  sizeBytes: number;
  // SHA-256 of the content for integrity
  checksum?: string;
  // Current host-configured game settings
  config: CartridgeConfig;
  // Lifecycle
  status: "pending" | "approved" | "live" | "archived";
  // Published = visible in lobby and playable
  published: boolean;
  // Cached thumbnail (optional)
  thumbnail?: string;
  // Audit
  playCount: number;
  rating?: number;
  tags?: string[];
}

export const DEFAULT_CARTRIDGE_CONFIG: CartridgeConfig = {
  winXC: 100,
  loseXC: 25,
  drawXC: 0,
  coinType: "primary",
  winCoins: 1,
  requiredBadges: [],
  entryFee: 10,
  minPlayers: 2,
  maxPlayers: 4,
  estimatedMinutes: 10,
};

// ── X-Coin Integration Messages ───────────────────────────────────
// Messages sent between Battle Arena and X-Coin app

export type XCoinMessageType =
  | "PLAYER_LOGIN"
  | "PLAYER_DATA_REQUEST"
  | "PLAYER_DATA_RESPONSE"
  | "XC_DEDUCT"
  | "XC_AWARD"
  | "BADGE_CHECK"
  | "BADGE_CHECK_RESPONSE"
  | "BADGE_AWARD"
  | "LEADERBOARD_UPDATE"
  | "BATTLE_RESULT";

export interface XCoinMessage {
  type: XCoinMessageType;
  payload: Record<string, unknown>;
  timestamp: string;
  sourceApp: "battle_arena" | "xcoin";
}
