# Claude Cowork switchover — Evo game avatars and cinematics

## Latest confirmed map and learning loop — 2026-10-03

The user selected top-down/high-angle arena maps in the supplied action-game reference format. All required enemies and finite waves must be defeated before a section gate opens; the main boss must be defeated before the next stage unlocks. Correct quiz answers power attacks; defeated Archives drop collectible orbs. Orbs do not open quizzes or automatically become permanent XP/X-Coin. Read [NEXUS-LEVEL-MAP-DESIGN.md](NEXUS-LEVEL-MAP-DESIGN.md) for current gate, quiz, orb and prototype rules. This supersedes side-view/controller suggestions and earlier collect-XP-then-checkpoint assumptions where inconsistent. No game implementation is claimed.


## Latest handoff checkpoint — Archive token set ready

2026-10-03: Both token collections are available locally: 20 Evo core icons with 40 branch badges, plus eight Archive enemy icons. Archive import verified: eight manifest entries and all 40 PNG size variants. Read [ARCHIVE-GAME-ICONS.md](ARCHIVE-GAME-ICONS.md); preview `public/archive-icons.html`; catalog `public/assets/archive-icons/manifest.json`. Archive deployment has not been verified. Earlier local-only statements describe this asset-production work; preserve any separately recorded Claude deployment status for Evo files.

Claude's current platform handoff records a remaining five-stage player-state migration before trusted ten-level/branch unlock integration. Treat that as unresolved game implementation work, not a reason to change the approved ten-level artwork scheme. No automatic stage-to-level conversion or unearned branch unlock is authorized by the icons. Use enemy IDs for Archive tokens, and preserve the existing detailed art for cinematic powers and boss scenes.

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


## Archive game icons — added 2026-10-03

Eight existing Archive enemies now have static transparent tokens: `scout`, `interceptor`, `sentry`, `elite`, `hive`, `trojan`, `nightmare`, `agent-glitch`. Local runtime catalog: `public/assets/archive-icons/manifest.json`; preview: `public/archive-icons.html`; guide: [ARCHIVE-GAME-ICONS.md](ARCHIVE-GAME-ICONS.md). Each token has 512/256/128/64/48-pixel PNGs. Workspace `Archive Game Icons/` preserves originals, exact prompts, exporter and preview. All 40 exports were checked for alpha, dimensions, local import parity and preview file references; 48/64-pixel appearances reviewed on light/dark backgrounds.

Select enemy icons by stable enemy ID, independently of player studio/level/build. Keep existing detailed Archive art for cinematic use. This supplies tokens only: enemy stats, encounter difficulty, boss phases, AI behavior and game integration remain to be developed. Hack Guild is a faction grouping, not an additional invented icon, and Agent Glitch remains a possible leader rather than a confirmed one. No deployment or scheduled production was initiated.


## Archive combat progression — 2026-10-03

Read [ARCHIVE-POWER-PROGRESSION.md](ARCHIVE-POWER-PROGRESSION.md) before designing encounters. User-confirmed: Agent Glitch is the strongest existing Archive; Scout is basic, Interceptor is stronger and less frequent (suggested 7:1), Sentry is a recurring larger mini-boss, and Elite is the first main-boss tier. Proposed higher-boss order: Hive → Trojan → Nightmare → Agent Glitch. Strongest combat rank does not identify the Archive creator or hidden operators. Earlier tentative encounter ordering is superseded where inconsistent. The document maps all eight powers/counters, encounter frequency, mission introductions, temporary vs persistent progression and the original action-game synthesis. Combat values are prototype proposals; no gameplay implementation is claimed.


## Level maps and platform-action direction — 2026-10-03

Read [NEXUS-LEVEL-MAP-DESIGN.md](NEXUS-LEVEL-MAP-DESIGN.md). Three concept maps are saved in workspace `PFLX Level Maps/` and copied locally to `public/assets/level-map-concepts/`; preview `public/level-map-concepts.html`. Studio Skyway teaches platform traversal and Sentry weak points, Nexus Drift explores digital-space islands, and Archive Citadel culminates in Elite as the first main boss. A Hive variant follows Elite; Agent Glitch remains the strongest. User references are incorporated as traversal, discovery modules, precise patterned combat and team powers with original PFLX identity. Artwork is conceptual; enemy glyphs are placeholders and routes require playable graybox validation. No controller, collision map, gameplay or deployment was added.


Latest map rule: seven combat areas per level (six sequential rooms/stations plus Area 7 main boss), all set in the Nexus digital-space frontier. Arrival/exit are within Areas 1/7. Earlier three-room and physical studio scenery concepts are superseded. See the current map specification.


## Confirmed server-world setting — 2026-10-03

The Nexus is the AI digital universe, a higher-dimensional plane that already existed before humanity discovered access. Within it, servers can contain entire cities or worlds. A level map is stationed inside one such server-world, with a digital-space frontier appearance: circuit terrain, holographic structures, floating data platforms and cosmic data streams.

The rogue Archive AI infiltrate and attack these servers. Their interference causes problems in the associated Nexus Narrative storylines. Evos track the Archive across the affected servers, entering and travelling through circuit portals and gateways. This gives game missions a direct narrative purpose: pursue the infiltrators and defend the server-world where the storyline is unfolding. Server-world names, individual city problems and the redesigned client stories will be developed with the creator; do not invent them as established canon.

Each level inside a server contains seven combat areas: six sequential rooms/stations and a final main-boss area. Circuit gateways between areas remain locked until all required enemies and waves are defeated. Defeating the final boss unlocks the next stage and its onward circuit portal. Travel or flight cannot bypass progression gates. A server-world may contain multiple levels; seven areas describes a level map, not the maximum size of a city or world.

Correct quiz answers power Evo attacks. Defeated Archives drop collectible orbs. This combat loop connects to the server mission without automatically granting permanent XP, X-Coin or completing a real-world client project. The specific effects of restoring a server on narrative state remain design work, not implemented behavior.



## Confirmed asymmetric maze direction — 2026-10-03

Current map floorplans must be asymmetric labyrinths within server-worlds. Replace repeated circular arenas and evenly spaced rows with seven irregular combat districts, varied in size and shape, joined by winding circuit corridors. Use staggered placement, switchbacks, blocked sightlines, dead ends and exploration alcoves. Retain a readable overhead viewpoint and enough combat/dodge space.

Seven areas remains the progression rule: 1 → 2 → 3 → 4 → 5 → 6 → 7 (final boss). Maze choices occur within the current area. Optional branches terminate or reconnect within that area and cannot bypass its locked exit or enter an uncleared later district. Corridors and alcoves do not add extra combat areas. Six gate boundaries control progression; arrival is within Area 1 and the onward portal within Area 7.

Implementation must check reachability with each gate closed: later districts and the boss must remain inaccessible by every route, including flight, teleport and other abilities. Opening the cleared area's gate must make the next district reachable. Avoid endless backtracking by visibly marking explored corridors and cleared gates. These requirements guide implementation; generated art alone does not validate collision or route topology.



## Overall campaign map and final headquarters — 2026-10-03

The overall map displays the current server-world locations under Archive attack and the circuit portal/gateway routes used by Evos to track the infiltration. It is a campaign atlas, separate from each level's seven-area maze. The current mapped locations are Studio Defense Grid, Nexus Swarmway and Archive Citadel; these remain concept names rather than finalized Nexus Narrative city names. Additional city/world servers may be added when their storylines are authored.

The user confirmed that the final stage takes place at the Archive's mainframe headquarters. Agent Glitch is the strongest Archive and the final headquarters adversary. The headquarters is the enemy destination, distinct from the attacked server-worlds. Proposed current atlas route: Studio Defense Grid → Nexus Swarmway → Archive Citadel → Archive Mainframe HQ. The exact allocation of other bosses, number of levels per server and client/story consequences remain to be developed. A location on the atlas does not imply only one seven-area level exists there.

Atlas asset: `PFLX Level Maps/04-nexus-server-campaign-v1.png`. Each local map remains an asymmetric maze with six combat areas and a final boss area. Gate completion within levels and the stage-clear circuit portal control forward travel; atlas routes do not bypass unlock requirements.



## Ten server-world campaign concepts — latest direction

Ten server-world concepts now appear in the campaign atlas, including Archive Mainframe HQ as Server 10 and the final stage. Servers 1–9 face Archive infiltration. Existing concept names are retained; the six new names and associated problems are proposals for the Nexus Narrative redesign. Each server may contain multiple seven-area levels. Server numbers are campaign identifiers, not automatic Evo evolution levels.

| Server | Concept | Environment and narrative problem | Boss direction |
|---|---|---|---|
| 01 | Studio Defense Grid | Studio launch city; corrupted collaboration and access systems | Elite Archive |
| 02 | Nexus Swarmway | Frontier routing world; swarm infiltration disrupts digital travel | The Hive |
| 03 | Lumen Transit | Luminous transport city; sabotaged gateways strand districts | Unassigned |
| 04 | Verdant Protocol | Holographic ecosystem world; corrupted resource balance | Unassigned |
| 05 | Memory Harbor | Data port city; lost records and blocked knowledge access | Unassigned |
| 06 | Forge Circuit | Industrial innovation city; compromised production networks | Hack Guild encounter proposed |
| 07 | Prism Commons | Public communication world; manipulation fractures trust | Unassigned |
| 08 | Archive Citadel | Corrupted stronghold; Trojan infiltration threatens linked servers | Trojan |
| 09 | Null Horizon | Fractured frontier world; hostile illusion and failing navigation | Nightmare proposed |
| 10 | Archive Mainframe HQ | Enemy command world; final confrontation | Agent Glitch |

Agent Glitch remains the strongest final adversary. Other boss placements are proposed. Circuit portals connect the ten worlds in numbered order. Local levels remain asymmetric mazes with six combat areas then a final boss. Correct answers power attacks; defeated Archives drop orbs; cleared areas open gates and final-boss defeat opens onward travel.

Atlas: `PFLX Level Maps/04-nexus-ten-server-worlds-v2.png`. The earlier four-location atlas is superseded. Studio Defense Grid, Nexus Swarmway and Archive Citadel have individual maze concepts; the other seven locations have atlas concepts, not finished individual maps. No playable map implementation or deployment is claimed.


## Confirmed game title — 2026-10-03

The user selected **PFLX: Nexus Frontiers** as the game title. Use this name for the server-world campaign, map previews and Claude development handoff. The Nexus remains the universe name; Archive Mainframe HQ remains the final campaign destination. A campaign subtitle has not been selected.


## Campaign portal correction

The atlas must show only the nine sequential links 1→2, 2→3, 3→4, 4→5, 5→6, 6→7, 7→8, 8→9 and 9→10. Each links a source EXIT portal to the next world's ENTRY portal. The return links3→4 and6→7 travel leftward across the composition; their arrows must point left, remain separate and land at the correct world's entry. Server1 has START; Server10 has no onward campaign exit. Earlier atlas route drawings are superseded. The exact route list is saved in `PFLX Level Maps/PORTAL-ROUTES.md`.


Latest atlas: `PFLX Level Maps/04-nexus-ten-server-worlds-v3-portals.png`. Server6 Forge Circuit now connects directly to Server7 Prism Commons, terminating at its upper entry portal. The mistaken return loop into Server4 has been removed. Original drafts are preserved. Generated entry/exit text remains illustrative; use PORTAL-ROUTES.md for implementation.


## Nexus Frontiers PNG pack — local integration assets

Clean PNG assets are saved in `Nexus Frontiers Game Assets/` with manifest, exact prompts and README. Runtime copies: `public/assets/nexus-frontiers/`; preview: `public/nexus-frontiers-assets.html`. Four backgrounds at1536×1024: ten-world campaign atlas, Studio Defense Grid, Nexus Swarmway and Archive Citadel mazes. One open circuit portal sprite has verified RGBA alpha and512/256/128/64 longest-edge exports. Nine PNG files total. Keep labels, routes, gates, characters and rewards in separate runtime layers. Collision and seven-district reachability still need authored game geometry; these are static visual plates, not playable levels. No deployment performed. Remaining seven individual server-world level backgrounds are not included.


## Collectible orb asset and proposed types

A cyan diamond-core orb PNG with verified alpha is available as `sprites/orb-energy.png`, with512/256/128/64/32 longest-edge variants in the Nexus Frontiers pack. This is the current visual asset; Energy recharge is a proposed role, not an implemented or approved economy effect. Suggested additional types: Recovery (health/shield restoration) and Upgrade (temporary run-only power choice), differentiated by color and core symbol. Neither additional sprite exists yet. Quiz answers still power attacks. Do not automatically convert pickups into permanent Evo progression or X-Coin. Boss drops can increase value/quantity rather than add a separate orb type. Await the creator's choice before implementing these effects.


## Holographic training and four-player studio teams

Three year-round training backgrounds are created: Spar Chamber, Circuit Labyrinth and Overload Reactor. Current PNG pack and preview include all three. Optional local X-Live Teams setting now drafts four-player studio-balanced squads with diverse fallback. The co-op game launch and training progression are still pending implementation. Read `NEXUS-TRAINING-AND-COOP.md` for confirmed scope, proposed difficulty ladder, test results and remaining live-session work.


## 2026-10-04 — Team quizzes and hybrid combat (latest design)

Read NEXUS-TEAM-QUIZ-AND-COMBAT.md before implementing combat. Normal rooms use real-time Archive swarms with an energy bar on every enemy; all required enemies/waves must clear and the squad advances together. Boss encounters switch to turn-based RPG move cards: select attack/defense → quiz → resolve hit/miss/block/critical or prepared defense → next Evo/Archive turn. Boss moves target all opposing Evos, with individual defensive outcomes. Metrics derive from Evo level, Archive level and applied upgrades.

An independent optional Team Answer Hunt setting shows the same prompt to everyone but gives each player different answer options; exactly one teammate holds the correct answer. Recommended rule: that answer activates the active player's selected move. Exact turn scheduling and combat formulas remain proposals. These requirements supersede earlier real-time main-boss suggestions; only local studio-balanced team drafting is implemented so far.


## Rush Circuit replaces Circuit Labyrinth — 2026-10-04

The three active training maps are Spar Chamber, Rush Circuit and Overload Reactor. Rush Circuit is a continuous asymmetric racing loop for X-Rush / Evo Rush, with four starting boxes and a finish stripe. The old Circuit Labyrinth remains an archived concept. Race modes use lap/checkpoint completion, not the seasonal rule requiring every enemy to be defeated. Quiz-powered acceleration, boosts, collisions, lap counts and progression rewards require explicit game tuning and implementation. This update supplies the PNG background only; it does not wire the existing X-Rush game to a new movement model.


## Comic/anime presentation — 2026-10-04

Read NEXUS-COMIC-PRESENTATION.md in the arena docs (also COMIC-PRESENTATION.md in the asset pack). Latest confirmed scope is 14 scene images per server-world, 140 total, plus shared portraits/UI/effects. Use live typewriter dialogue with pop-up speaker portraits, comic panels and code-driven transitions. Voice design comes later. Spar Chamber is boss-style turn-based PvP/team-vs-team practice. These are design requirements, not implemented features.


## Latest gameplay and art direction — 2026-10-04

The creator clarified that actual gameplay graphics should primarily resemble the approachable, readable 2D icon/token and tile-based presentation of the supplied Blooket and Gimkit references. This supersedes treating TMNT Splintered Fate as the primary gameplay rendering target. Keep PFLX original characters, studio identities and digital-server environments. Comic/anime portraits, typewriter dialogue, graphic cuts and cinematic world introductions remain the storytelling layer. Detailed world paintings are establishing shots/concept plates; playable surfaces need simpler ground, readable paths and separately placed interactive objects.

Confirmed gameplay ingredients:
- Monster Brawl-inspired Archive swarms, moving Evo icons, visible enemy energy bars and collectible drops.
- Apocalypse-inspired cooperative roles, gathering/mining materials around a base, and constructing a defense system or fortress.
- No Way Out-inspired escape-room objectives: collect keys, solve puzzles and unlock gates.
- Terraria-inspired mining interactions and harvestable materials. This does not yet prescribe fully destructible terrain, side-scrolling gameplay or an unlimited sandbox.

Integrate these into the established top-down digital universe. Keep six combat areas, six transition areas, one cinematic intro and one final boss space per world: 14 images each, 140 total. Do not add a separate mandatory mining/puzzle image count. Existing swarm combat and turn-based boss rules remain.

Recommended implementation design (proposals, not confirmed balance):
- A role kit could include defender, gatherer, builder and scout/puzzle specialist. Treat roles as separate from the four startup studios; let all teammates contribute and provide fallback capabilities when a player disconnects. Exact assignments and bonuses remain open.
- Use digital resources such as circuit fragments, alloy data-blocks and energy crystals as proposed names. Keep construction resources separate from combat orbs, permanent Evo experience and X-Coin. Do not invent conversion rates or permanent rewards.
- Harvest resource nodes, bring materials to the shared base supply, then build/repair approved defenses between or during configured finite waves. Candidate structures: barricades, shield pylons, repair stations and turrets; costs and capabilities need tuning.
- Encounter gates require BOTH full clearance of required enemies/waves/summons AND any configured key/puzzle objective. A key alone must not bypass combat. The squad advances together; final stage completion still requires the boss.
- Puzzle clues and navigation keys can add teamwork without turning every interaction into another quiz. Correct quiz answers still power attacks. Quiz costs/requirements for mining or building are undecided.
- Shared keys must not be permanently lost on disconnect. Provide sufficient reachable resources, prevent defenses sealing the only route, and prohibit mining through progression boundaries. Reset/recovery must prevent impossible puzzles and reward duplication.

Additional asset requirements beyond the 140 scene plates: modular ground/path tiles; wall/corner/door sections; resource nodes in intact/damaged/depleted states; material pickup icons; keys/keycards and matching locks; switches/terminals/puzzle symbols; base core with damage states; defense structures in construction/active/damaged states; placement-valid/invalid overlays; mining sparks, build dust and repair effects. Use transparent PNGs for illustrated props and effects, scalable code/vector shapes for simple UI. Collision, harvesting quantities, inventory, placement, gate state and multiplayer authority are code/data systems. A flattened PNG cannot provide these mechanics.

Reference review: sampled frames from the four new recordings show Blooket token combat, Gimkit tile/corridor navigation and base/resource HUDs. One sampled segment of 00-53-46 shows unrelated basketball footage; do not infer mechanics from that segment. The written creator requirements above are authoritative regardless of incidental video content. No gameplay implementation or new asset completion is claimed by this update.


## Quizlet Live reference applied to Team Answer Hunt — 2026-10-04

Reviewed six sampled visual moments from the supplied 79.5-second ScreenRecording_10-04-2026 01-04-50_1.MP4. The reference shows teammates receiving a shared question, coordinating to find the matching answer on a teammate's device, team progress on a shared display, incorrect-answer feedback, and a post-game review contrasting learned answers with confused answers. This is a visual reference review, not audio transcription or a claim about current Quizlet product rules.

Apply the creator's previously confirmed distributed-answer logic to PFLX:
1. Host may enable Team Answer Hunt independently of studio-balanced team drafting. Disabled mode supplies the ordinary complete answer set.
2. For each team attempt, show the same question/term to every participating teammate; distribute different answer options privately. Exactly one eligible teammate holds exactly one correct option. Do not reveal that holder on the host/shared display.
3. Players discuss who has the match; the holder submits. Recommended: one confirmed team submission, validated once by authoritative session state. Rotate the holder fairly across attempts.
4. Correct team answers authorize the configured attack/charge. In a boss or Spar turn, authorize the CURRENT actor's selected move even when another teammate answers. Correctness does not guarantee a combat hit; keep learning feedback separate from miss/block/critical results.
5. Incorrect answers receive constructive correction. Retain the proposed failed-move/end-turn boss policy; do not import a team-progress-reset penalty from a reference game without approval. Never erase cleared rooms, built defenses, permanent XP or earned Evo forms for a wrong answer.
6. Show shared team objective progress and participation/readiness; private devices retain their own answer options. Competitive progress displays are appropriate to configured race/PvP modes, not an automatic competition between a co-op squad's members.
7. Add a proposed post-encounter/session learning review: question/term, chosen incorrect answer where applicable, correct match and a short explanation. Record learning correctness independently from damage/hits, and offer retry practice without duplicate combat rewards.

Implementation checks: exactly one correct option across the team; no synonym duplicates; answer options scoped to player and attempt; one resolution despite simultaneous submissions; stale attempts rejected; missing answer-holder triggers pause/redeal; quiz phases pause hostile actions for the squad. Teams of fewer than four use the same one-correct-holder invariant among eligible connected players. Do not require an absent studio or disconnected player to make a question answerable. Submission policy and review presentation are recommendations; four-player distributed answers and optional enablement are already confirmed.

This adds documentation requirements only. No multiplayer quiz implementation or deployment is claimed.
