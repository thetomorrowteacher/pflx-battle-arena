# Claude Cowork switchover — Evo game avatars and cinematics

Updated 2026-10-03. This is the current handoff for the Evo game-icon work. It complements the existing platform/module handoffs. Local assets are prepared; live gameplay integration and deployment are not complete.

## Decisions to preserve

There are four studios: Gentech, Mindforge, eMagination and Innov8. The player-card system has **ten levels**, 196 Default Standard cards (49 per studio), with seven possible branches per studio at the highest levels. Earlier five-stage character proposals and retired EXO import instructions are superseded. The five **icon tiers** below are a display grouping of the ten card levels, not a change to the card progression.

Players unlock a different core icon when they enter its level set. The selected branch appears as a separate small emblem. Preserve the actual card level and branch in player state. Do not replace the card level with the icon tier.

| Icon tier | Player levels | Appearance |
| --- | --- | --- |
| 1 | 1–2 | Base companion |
| 2 | 3–4 | Armored companion |
| 3 | 5–6 | Dragon |
| 4 | 7–9 | Ascended dragon |
| 5 | 10 only | Celestial halo and angelic wings |

The earlier 9–10 celestial icon mapping was corrected. Do not use `Math.ceil(level / 2)` to select the tier. Find the catalog entry whose `levels` includes the actual player level.

| Card levels | Available branches |
| --- | --- |
| 1 | BASE |
| 2–4 | A, B, C |
| 5–7 | A1, A2, B1, B2, C1, C2 |
| 8–10 | A1, A2, B1, B2, C1, C2, H |

A splits into A1/A2, B into B1/B2, C into C1/C2 at level 5. H is one shared hybrid per studio introduced at level 8. Its earned unlock requirements remain to be designed; the asset availability table is not permission to grant it automatically.

## Ready assets and references

Paths below are relative to `PFLX Overlay/pflx-arena-check/` unless marked otherwise.

- `public/evo-icons.html`: interactive studio/level/branch preview, plus all 20 core icons.
- `public/assets/evo-icons/manifest.json`: 20 icons with explicit level arrays and transparent PNGs at 512, 256, 128, 64 and 48 pixels.
- `public/assets/evo-icons/progression.json`: branch availability, studio branch names, parent relationships and badge paths.
- `public/assets/evo-icons/badges/`: 40 original SVG branch identifiers, ten paths per studio. BASE has no badge. Each uses studio color, a geometric symbol and a readable branch code.
- `public/assets/evo-icons/resolve-evo-icon.mjs`: exported `resolveEvoIcon(catalog, progression, studio, level, branch)` validates combinations and returns icon/badge paths, display tier, branch name and unchanged player level/branch. Paths resolve from the app public root; use the host's base URL when embedding elsewhere.
- `public/assets/exo/manifest.json`: existing ten-level detailed card catalog. Its legacy folder name does not mean the retired five-stage schema is current. Card branch field is `build`; translate explicitly to the icon resolver's `branch` argument. Preserve card IDs and catalog keys.
- `docs/EVO-GAME-ICONS.md`: icon usage guide.
- `docs/EVO-ARCHIVE-STORYBOARD.md`: confirmed background lore, character design, Archive hierarchy and story direction.
- Workspace `Evo Game Icons/`: originals, exact generation prompts, export/rebuild scripts, local preview and log.
- Workspace `Evo Avatars/`: card production plan, index, original artwork, prompts and completion record.

Studio identities: Gentech/Cogling/Ironwright (teal, brass, cyan); Mindforge/Emberling/Resonant (rose, burgundy, gold, pink); eMagination/Sketchling/Mythweaver (royal blue, gold); Innov8/Bitling/Neonborn (purple, charcoal, cyan, violet visor). Preserve these recognizable faces and palettes.

## Claude's next implementation work

1. Connect trusted player progression to studio, actual level and chosen card `build`. Load the icon manifest and progression rules, then call the resolver. Handle absent/invalid saved state explicitly; do not silently grant a branch or celestial form.
2. Use a static icon token in game lobbies, races, quizzes and leaderboards. Display the branch badge separately beside or at the corner of the token. Maintain readability at small sizes. Character animation is not required; game movement can move the whole token.
3. Enforce earned unlocks using the authoritative progression system. The resolver only validates catalog availability; it does not enforce XP, ownership or rewards. Preserve the ten-level power/card progression.
4. Plan customization as separate cosmetic assets (frames, accessories, expressions or palettes). These icons are flattened PNGs, not layered accessory rigs. Cosmetics should not change combat power. Additional cosmetics have not been created.
5. Develop the cutscene and game system collaboratively: detailed Evo cards represent abilities/super moves, while static icons represent the player during ordinary gameplay. Cutscenes, videos, trigger logic and attack balance have not been implemented. Prototype one complete move flow before expanding it across all branches.

For a cinematic prototype, proposed sequence: the game validates the selected power and its cost/cooldown, locks the action against duplicate input, shows a short skippable or reduced-motion-friendly ability sequence, applies the authoritative result once, then returns to token gameplay. Clip availability should have a static-card fallback. These are implementation recommendations, not existing features or settled timing rules. Confirm the project's game rules before setting damage, cooldowns, clip length or multiplayer synchronization.

## Story and visual continuity

Read the storyboard for full lore. The setting is 2487; access to the already-existing higher-dimensional Nexus was discovered in 2026, and the digital Cyber War of 2077 was World War III. TheTomorrowTeacher developed PFLX; its four studios created Evos to enter and protect the Nexus. Creator backstory details are reserved for the user. X-Coin represents experience earned through work, projects and character growth.

The Archive is rogue AI with unknown operators and a hierarchy. Existing enemy art and lore cover base Archives, The Hive, Hack Guild bosses, Trojan, Nightmare and Agent Glitch, whose leadership remains uncertain. Their visual identity is dark with lime-green/yellow glow. Use original PFLX designs; external fictional comparisons are references, not characters to reproduce.

Detailed cards evolve from feline-dragon companions into upright humanoid dragon/angelic AI avatars. Higher-level scenes feature varied airborne attacks and digital-space Archive battles. Level 10 celestial forms carry powerful studio-specific swords. The static icons intentionally use consistent front-facing heads and small chests; they do not replace these detailed bodies, equipment or battle scenes.

## Verified status and boundaries

All 196 detailed Evo cards were recorded complete, checked and locally imported, with 588 full/thumbnail/web derivatives. Eight existing Archive artworks are outside that 196-card total. The icon work adds 20 core icons, 100 PNG size exports, 40 SVG badges and a resolver. All 196 valid studio/level/branch combinations were checked against the icon catalog and files; unavailable branches were rejected. This is asset/catalog validation, not an end-to-end player gameplay test.

No live player unlock wiring, cosmetic editor, cinematic videos, new game modes or deployment is claimed. Scheduled production remains stopped; this handoff does not restart it. Do not regenerate completed artwork or run retired `exo_import.py`. Follow the current `evo_import.py` and ten-level production plan if future card import is required.
