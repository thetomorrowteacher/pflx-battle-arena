"use client";
/**
 * Battle Arena Settings — per-entity settings surface.
 *
 * Battle Arena does not own Season / Checkpoint / Project / Job / Task
 * entities. It only layers arena-specific config on top of them:
 *
 *   Season      → activeGameModes, wager curve, tournament bracket, rewards
 *   Checkpoint  → modes, theme, wager caps, XC multiplier, double-XP windows
 *   Project     → arenaQuest, questionPack, arenaBoss, wager pool, spectators
 *   Job         → arenaTryout mode, cutoff, max applicants, winner rewards
 *   Task        → micro-challenge, criterion→arena map, bot opponents, fallback
 *
 * The host picks an entity type + entity id, and this form writes into
 * the same mock data via postMessage back to the PFLX shell which persists
 * to Supabase through the X-Coin bridge.
 */

import { useEffect, useState } from "react";

type EntityType = "season" | "checkpoint" | "project" | "job" | "task";

interface EntityLite {
  id: string;
  name: string;
}

interface ArenaSettings {
  // Season
  activeGameModes?: string[];
  seasonWagerCurve?: "flat" | "linear" | "exponential";
  seasonTournamentBracket?: boolean;
  seasonRewards?: string[];
  // Checkpoint
  checkpointModes?: string[];
  checkpointTheme?: string;
  checkpointWagerCaps?: { min: number; max: number };
  checkpointXcMultiplier?: number;
  checkpointDoubleXpWindows?: { start: string; end: string }[];
  // Project
  projectArenaQuest?: boolean;
  projectQuestionPack?: string;
  projectArenaBoss?: string;
  projectWagerPool?: number;
  projectArenaXcMultiplier?: number;
  projectSpectators?: boolean;
  // Job
  jobArenaTryout?: boolean;
  jobTryoutMode?: string;
  jobTryoutCutoff?: number;
  jobArenaMaxApplicants?: number;
  jobWinnerRewards?: string[];
  // Task
  taskArenaMicroChallenge?: string;
  taskCriterionArenaMap?: Record<string, string>;
  taskArenaBestOf?: number;
  taskArenaBotOpponents?: boolean;
  taskArenaFallback?: string;
  taskArenaRequiredForCompletion?: boolean;
}

const STORAGE_KEY = "pflx_arena_settings_overrides";

export default function BattleArenaSettingsPage() {
  const [entityType, setEntityType] = useState<EntityType>("checkpoint");
  const [entityId, setEntityId] = useState("");
  const [entities, setEntities] = useState<EntityLite[]>([]);
  const [settings, setSettings] = useState<ArenaSettings>({});
  const [overrides, setOverrides] = useState<Record<string, ArenaSettings>>({});

  // Load overrides from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOverrides(JSON.parse(raw));
    } catch {}
  }, []);

  // Ask the shell for the list of entities whenever entityType changes
  useEffect(() => {
    if (window.parent !== window) {
      try {
        window.parent.postMessage(
          JSON.stringify({ type: "pflx_data_request", key: pluralize(entityType) }),
          "*"
        );
      } catch {}
    }
  }, [entityType]);

  // Listen for the shell's response
  useEffect(() => {
    function handleMessage(ev: MessageEvent) {
      try {
        const msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (msg?.type === "pflx_cloud_data" && msg.key === pluralize(entityType)) {
          const list: EntityLite[] = (msg.data || []).map((e: { id: string; name?: string; title?: string }) => ({
            id: e.id,
            name: e.name || e.title || e.id,
          }));
          setEntities(list);
        }
      } catch {}
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [entityType]);

  // When entity selection changes, load that entity's current override
  useEffect(() => {
    if (!entityId) {
      setSettings({});
      return;
    }
    setSettings(overrides[entityKey(entityType, entityId)] || {});
  }, [entityId, entityType, overrides]);

  const saveSettings = () => {
    if (!entityId) return;
    const next = { ...overrides, [entityKey(entityType, entityId)]: settings };
    setOverrides(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    // Broadcast to MC / X-Coin bridge so the economy + MC surfaces see it
    if (window.parent !== window) {
      window.parent.postMessage(
        JSON.stringify({
          type: "pflx_arena_entity_settings_saved",
          entityType,
          entityId,
          settings,
        }),
        "*"
      );
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", color: "#fff" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Battle Arena Settings</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Layer arena-specific configuration onto entities owned by Mission
        Control. Pick an entity type, pick an entity, tune arena rules.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {(["season", "checkpoint", "project", "job", "task"] as EntityType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setEntityType(t);
              setEntityId("");
            }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: entityType === t ? "linear-gradient(135deg,#00d4ff,#7c3aed)" : "transparent",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: "0.1em",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <select
        value={entityId}
        onChange={(e) => setEntityId(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          marginBottom: 20,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        <option value="">— Pick {entityType} —</option>
        {entities.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      {entityId && (
        <div style={{ padding: 20, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
          <ArenaSettingsForm entityType={entityType} settings={settings} onChange={setSettings} />
          <button
            onClick={saveSettings}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              background: "linear-gradient(135deg,#00d4ff,#7c3aed)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 800,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Save Arena Settings
          </button>
        </div>
      )}
    </div>
  );
}

function pluralize(t: EntityType): string {
  return t === "season" ? "seasons" : t + "s";
}
function entityKey(t: EntityType, id: string) {
  return `${t}:${id}`;
}

function ArenaSettingsForm({
  entityType,
  settings,
  onChange,
}: {
  entityType: EntityType;
  settings: ArenaSettings;
  onChange: (s: ArenaSettings) => void;
}) {
  const field = (label: string, el: React.ReactNode) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
        {label}
      </label>
      {el}
    </div>
  );
  const inp = (v: string | number | undefined, k: keyof ArenaSettings, type = "text") => (
    <input
      type={type}
      value={String(v ?? "")}
      onChange={(e) =>
        onChange({
          ...settings,
          [k]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
        })
      }
      style={{
        width: "100%",
        padding: "8px 12px",
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        borderRadius: 6,
      }}
    />
  );
  const chk = (v: boolean | undefined, k: keyof ArenaSettings, label: string) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <input
        type="checkbox"
        checked={!!v}
        onChange={(e) => onChange({ ...settings, [k]: e.target.checked })}
      />
      {label}
    </label>
  );

  switch (entityType) {
    case "season":
      return (
        <>
          {field("Active Game Modes (comma-separated)", inp((settings.activeGameModes || []).join(","), "activeGameModes" as keyof ArenaSettings))}
          {field("Wager Curve", (
            <select
              value={settings.seasonWagerCurve || "linear"}
              onChange={(e) => onChange({ ...settings, seasonWagerCurve: e.target.value as ArenaSettings["seasonWagerCurve"] })}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 6 }}
            >
              <option value="flat">Flat</option>
              <option value="linear">Linear</option>
              <option value="exponential">Exponential</option>
            </select>
          ))}
          {chk(settings.seasonTournamentBracket, "seasonTournamentBracket", "Enable tournament bracket")}
          {field("Season Rewards (comma-separated)", inp((settings.seasonRewards || []).join(","), "seasonRewards" as keyof ArenaSettings))}
        </>
      );
    case "checkpoint":
      return (
        <>
          {field("Allowed Modes", inp((settings.checkpointModes || []).join(","), "checkpointModes" as keyof ArenaSettings))}
          {field("Theme", inp(settings.checkpointTheme, "checkpointTheme"))}
          {field("XC Multiplier", inp(settings.checkpointXcMultiplier, "checkpointXcMultiplier", "number"))}
        </>
      );
    case "project":
      return (
        <>
          {chk(settings.projectArenaQuest, "projectArenaQuest", "Treat as arena quest")}
          {field("Question Pack", inp(settings.projectQuestionPack, "projectQuestionPack"))}
          {field("Arena Boss", inp(settings.projectArenaBoss, "projectArenaBoss"))}
          {field("Wager Pool (XC)", inp(settings.projectWagerPool, "projectWagerPool", "number"))}
          {field("XC Multiplier", inp(settings.projectArenaXcMultiplier, "projectArenaXcMultiplier", "number"))}
          {chk(settings.projectSpectators, "projectSpectators", "Allow spectators")}
        </>
      );
    case "job":
      return (
        <>
          {chk(settings.jobArenaTryout, "jobArenaTryout", "Use arena tryout")}
          {field("Tryout Mode", inp(settings.jobTryoutMode, "jobTryoutMode"))}
          {field("Tryout Cutoff (score)", inp(settings.jobTryoutCutoff, "jobTryoutCutoff", "number"))}
          {field("Max Applicants", inp(settings.jobArenaMaxApplicants, "jobArenaMaxApplicants", "number"))}
        </>
      );
    case "task":
      return (
        <>
          {field("Micro-challenge", inp(settings.taskArenaMicroChallenge, "taskArenaMicroChallenge"))}
          {field("Arena Best-of", inp(settings.taskArenaBestOf, "taskArenaBestOf", "number"))}
          {chk(settings.taskArenaBotOpponents, "taskArenaBotOpponents", "Allow bot opponents")}
          {chk(settings.taskArenaRequiredForCompletion, "taskArenaRequiredForCompletion", "Required for task completion")}
          {field("Fallback", inp(settings.taskArenaFallback, "taskArenaFallback"))}
        </>
      );
  }
}
