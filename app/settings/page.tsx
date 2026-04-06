"use client";
/**
 * Battle Arena Settings — per-entity arena settings surface.
 *
 * Battle Arena does not own Season / Checkpoint / Project / Job / Task
 * entities. It only layers arena-specific config on top of them:
 *
 *   Season      → activeGameModes, wager curve, tournament bracket, rewards
 *   Checkpoint  → modes, theme, wager caps, XC multiplier, double-XP windows
 *   Project     → arenaQuest, questionPack, arenaBoss, wager pool, spectators
 *   Task        → micro-challenge, criterion→arena map, bot opponents, fallback
 *
 * The host picks an entity type + entity id, then tunes arena rules.
 * All settings are persisted to Supabase via xcoin-bridge + cloud save indicator.
 */

import { useEffect, useState, useCallback } from "react";
import {
  loadArenaSettings,
  saveArenaSettings,
  fetchEntitiesFromSupabase,
  showCloudSaveIndicator,
} from "../lib/xcoin-bridge";
import { GAME_MODES } from "../lib/types";
import Navbar from "../components/Navbar";

type EntityType = "season" | "checkpoint" | "project" | "task";

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
  // Project
  projectArenaQuest?: boolean;
  projectQuestionPack?: string;
  projectArenaBoss?: string;
  projectWagerPool?: number;
  projectArenaXcMultiplier?: number;
  projectSpectators?: boolean;
  // Task
  taskArenaMicroChallenge?: string;
  taskArenaBestOf?: number;
  taskArenaBotOpponents?: boolean;
  taskArenaRequiredForCompletion?: boolean;
  taskArenaFallback?: string;
}

export default function BattleArenaSettingsPage() {
  const [entityType, setEntityType] = useState<EntityType>("season");
  const [entityId, setEntityId] = useState("");
  const [entities, setEntities] = useState<EntityLite[]>([]);
  const [settings, setSettings] = useState<ArenaSettings>({});
  const [overrides, setOverrides] = useState<Record<string, ArenaSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Load overrides from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await loadArenaSettings();
        if (data && typeof data === "object") {
          setOverrides(data as Record<string, ArenaSettings>);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Load entities when entityType changes — try postMessage first, then Supabase direct
  const loadEntities = useCallback(async (type: EntityType) => {
    const key = pluralize(type);
    setEntities([]);

    // 1. Ask parent shell via postMessage
    if (window.parent !== window) {
      try {
        window.parent.postMessage(
          JSON.stringify({ type: "pflx_data_request", key }),
          "*"
        );
      } catch {}
    }

    // 2. Fetch directly from Supabase as fallback
    try {
      const rows = await fetchEntitiesFromSupabase(key);
      if (rows.length > 0) {
        const list: EntityLite[] = rows.map((e: any) => ({
          id: e.id,
          name: e.name || e.title || e.id,
        }));
        setEntities((prev) => (prev.length === 0 ? list : prev));
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadEntities(entityType);
  }, [entityType, loadEntities]);

  // Listen for postMessage responses from parent
  useEffect(() => {
    function handleEntities(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (detail?.key === pluralize(entityType) && Array.isArray(detail.data)) {
        const list: EntityLite[] = detail.data.map((e: any) => ({
          id: e.id,
          name: e.name || e.title || e.id,
        }));
        if (list.length > 0) setEntities(list);
      }
    }
    window.addEventListener("pflx_entities_received", handleEntities);
    return () => window.removeEventListener("pflx_entities_received", handleEntities);
  }, [entityType]);

  // When entity selection changes, load that entity's current override
  useEffect(() => {
    if (!entityId) {
      setSettings({});
      return;
    }
    setSettings(overrides[entityKey(entityType, entityId)] || {});
  }, [entityId, entityType, overrides]);

  const handleSave = async () => {
    if (!entityId) return;
    setSaving(true);
    const next = { ...overrides, [entityKey(entityType, entityId)]: settings };
    setOverrides(next);

    // Save to Supabase
    const ok = await saveArenaSettings(next);
    if (ok) {
      showCloudSaveIndicator("Arena settings saved");
      setSaveMsg("Saved to cloud");
    } else {
      setSaveMsg("Save failed — retrying...");
      // Retry once
      const retry = await saveArenaSettings(next);
      setSaveMsg(retry ? "Saved to cloud" : "Save failed");
    }
    setSaving(false);

    // Also broadcast to Platform shell
    if (window.parent !== window) {
      try {
        window.parent.postMessage(
          JSON.stringify({
            type: "pflx_arena_entity_settings_saved",
            entityType,
            entityId,
            settings,
          }),
          "*"
        );
      } catch {}
    }

    setTimeout(() => setSaveMsg(""), 3000);
  };

  const entityTypes: EntityType[] = ["season", "checkpoint", "project", "task"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-mono text-2xl font-bold tracking-wider text-pflx-cyan text-glow-cyan uppercase mb-2">
            Arena Settings
          </h2>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Layer arena-specific configuration onto entities owned by Mission Control.
            Pick an entity type, select an entity, and tune the arena rules.
          </p>
        </div>

        {/* Entity Type Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {entityTypes.map((t) => (
            <button
              key={t}
              onClick={() => { setEntityType(t); setEntityId(""); }}
              className={`font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg border transition-all duration-300 ${
                entityType === t
                  ? "border-pflx-cyan/50 bg-gradient-to-r from-pflx-cyan/15 to-pflx-purple/15 text-pflx-cyan shadow-cyan-glow"
                  : "border-pflx-cyan/10 bg-transparent text-gray-400 hover:border-pflx-cyan/25 hover:text-gray-300"
              }`}
            >
              {t === "season" ? "🏆" : t === "checkpoint" ? "🎯" : t === "project" ? "🚀" : "⚡"}{" "}
              {t}s
            </button>
          ))}
        </div>

        {/* Entity Selector */}
        <div className="glass-panel p-5 mb-6">
          <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
            Select {entityType}
          </label>
          {loading ? (
            <div className="text-xs text-gray-500 py-3">Loading...</div>
          ) : entities.length === 0 ? (
            <div className="text-xs text-gray-500 py-3">
              No {entityType}s found. Create them in Mission Control first.
            </div>
          ) : (
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full bg-pflx-darker border border-pflx-cyan/20 rounded-lg px-4 py-2.5 font-mono text-sm text-pflx-cyan focus:border-pflx-cyan/50 focus:outline-none"
            >
              <option value="">— Select {entityType} —</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Settings Form */}
        {entityId && (
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono text-sm font-bold text-pflx-cyan uppercase tracking-wider">
                {entityType === "season" ? "🏆" : entityType === "checkpoint" ? "🎯" : entityType === "project" ? "🚀" : "⚡"}{" "}
                Arena Config — {entities.find((e) => e.id === entityId)?.name || entityId}
              </h3>
              {saveMsg && (
                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                  saveMsg.includes("failed") ? "text-pflx-red" : "text-pflx-green"
                }`}>
                  {saveMsg}
                </span>
              )}
            </div>

            <ArenaSettingsForm entityType={entityType} settings={settings} onChange={setSettings} />

            <div className="flex items-center gap-4 mt-6 pt-5 border-t border-pflx-cyan/10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-arena btn-arena-gold text-xs py-2.5 px-8"
              >
                {saving ? "Saving..." : "Save to Cloud"}
              </button>
              <button
                onClick={() => setSettings({})}
                className="text-[10px] font-mono text-gray-500 uppercase tracking-wider hover:text-pflx-red transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pluralize(t: EntityType): string {
  if (t === "season") return "gamePeriods"; // seasons are stored as gamePeriods in X-Coin
  if (t === "checkpoint") return "checkpoints";
  if (t === "project") return "projects";
  return "tasks";
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
  const gameModeOptions = GAME_MODES.map((m) => m.id);

  const fieldLabel = (label: string) => (
    <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
  );

  const textInput = (value: string | number | undefined, key: keyof ArenaSettings, type = "text", placeholder = "") => (
    <input
      type={type}
      value={String(value ?? "")}
      placeholder={placeholder}
      onChange={(e) =>
        onChange({
          ...settings,
          [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
        })
      }
      className="w-full bg-pflx-darker border border-pflx-cyan/15 rounded-lg px-3 py-2 font-mono text-xs text-gray-200 focus:border-pflx-cyan/40 focus:outline-none placeholder:text-gray-600"
    />
  );

  const checkbox = (value: boolean | undefined, key: keyof ArenaSettings, label: string) => (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
        value ? "bg-pflx-cyan/20 border-pflx-cyan/50" : "border-gray-600 bg-transparent group-hover:border-gray-500"
      }`}>
        {value && <span className="text-pflx-cyan text-[10px]">✓</span>}
      </div>
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange({ ...settings, [key]: e.target.checked })}
        className="hidden"
      />
      <span className="text-xs text-gray-300">{label}</span>
    </label>
  );

  const multiSelect = (selected: string[], key: keyof ArenaSettings, options: string[], labels?: string[]) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => {
              const next = isActive ? selected.filter((s) => s !== opt) : [...selected, opt];
              onChange({ ...settings, [key]: next });
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider border transition-all ${
              isActive
                ? "border-pflx-cyan/40 bg-pflx-cyan/10 text-pflx-cyan"
                : "border-gray-700 bg-transparent text-gray-500 hover:border-gray-600"
            }`}
          >
            {labels?.[i] || opt.replace(/_/g, " ")}
          </button>
        );
      })}
    </div>
  );

  switch (entityType) {
    case "season":
      return (
        <div className="space-y-4">
          <div>
            {fieldLabel("Active Game Modes")}
            {multiSelect(
              settings.activeGameModes || [],
              "activeGameModes" as keyof ArenaSettings,
              gameModeOptions,
              GAME_MODES.map((m) => `${m.icon} ${m.name}`)
            )}
          </div>
          <div>
            {fieldLabel("Wager Curve")}
            <div className="flex gap-2">
              {(["flat", "linear", "exponential"] as const).map((curve) => (
                <button
                  key={curve}
                  onClick={() => onChange({ ...settings, seasonWagerCurve: curve })}
                  className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider border transition-all ${
                    settings.seasonWagerCurve === curve
                      ? "border-pflx-gold/40 bg-pflx-gold/10 text-pflx-gold"
                      : "border-gray-700 bg-transparent text-gray-500 hover:border-gray-600"
                  }`}
                >
                  {curve}
                </button>
              ))}
            </div>
          </div>
          {checkbox(settings.seasonTournamentBracket, "seasonTournamentBracket", "Enable tournament bracket mode")}
          <div>
            {fieldLabel("Season Rewards (comma-separated)")}
            {textInput((settings.seasonRewards || []).join(", "), "seasonRewards" as keyof ArenaSettings, "text", "e.g. XC bonus, exclusive badge, rank boost")}
          </div>
        </div>
      );

    case "checkpoint":
      return (
        <div className="space-y-4">
          <div>
            {fieldLabel("Allowed Game Modes")}
            {multiSelect(
              settings.checkpointModes || [],
              "checkpointModes" as keyof ArenaSettings,
              gameModeOptions,
              GAME_MODES.map((m) => `${m.icon} ${m.name}`)
            )}
          </div>
          <div>
            {fieldLabel("Arena Theme")}
            {textInput(settings.checkpointTheme, "checkpointTheme", "text", "e.g. Cyber Blitz, Neon Showdown")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {fieldLabel("Min Wager (XC)")}
              {textInput(settings.checkpointWagerCaps?.min, "checkpointWagerCaps" as keyof ArenaSettings, "number", "50")}
            </div>
            <div>
              {fieldLabel("Max Wager (XC)")}
              {textInput(settings.checkpointWagerCaps?.max, "checkpointWagerCaps" as keyof ArenaSettings, "number", "5000")}
            </div>
          </div>
          <div>
            {fieldLabel("XC Multiplier")}
            {textInput(settings.checkpointXcMultiplier, "checkpointXcMultiplier", "number", "1.0")}
          </div>
        </div>
      );

    case "project":
      return (
        <div className="space-y-4">
          {checkbox(settings.projectArenaQuest, "projectArenaQuest", "Treat this project as an Arena Quest")}
          <div>
            {fieldLabel("Question Pack")}
            {textInput(settings.projectQuestionPack, "projectQuestionPack", "text", "e.g. entrepreneurship-101, pflx-lore")}
          </div>
          <div>
            {fieldLabel("Arena Boss")}
            {textInput(settings.projectArenaBoss, "projectArenaBoss", "text", "e.g. X-Bot Level 3, Final Guardian")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {fieldLabel("Wager Pool (XC)")}
              {textInput(settings.projectWagerPool, "projectWagerPool", "number", "1000")}
            </div>
            <div>
              {fieldLabel("XC Multiplier")}
              {textInput(settings.projectArenaXcMultiplier, "projectArenaXcMultiplier", "number", "1.5")}
            </div>
          </div>
          {checkbox(settings.projectSpectators, "projectSpectators", "Allow spectators to watch arena battles")}
        </div>
      );

    case "task":
      return (
        <div className="space-y-4">
          <div>
            {fieldLabel("Micro-Challenge")}
            {textInput(settings.taskArenaMicroChallenge, "taskArenaMicroChallenge", "text", "e.g. Speed Quiz, Code Sprint")}
          </div>
          <div>
            {fieldLabel("Arena Best-of (rounds)")}
            {textInput(settings.taskArenaBestOf, "taskArenaBestOf", "number", "3")}
          </div>
          {checkbox(settings.taskArenaBotOpponents, "taskArenaBotOpponents", "Allow bot opponents when no human available")}
          {checkbox(settings.taskArenaRequiredForCompletion, "taskArenaRequiredForCompletion", "Arena challenge required for task completion")}
          <div>
            {fieldLabel("Fallback mode")}
            {textInput(settings.taskArenaFallback, "taskArenaFallback", "text", "e.g. quiz_duel, skip")}
          </div>
        </div>
      );
  }
}
