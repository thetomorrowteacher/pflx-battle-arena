# Nexus level maps and platform-action design

2026-10-03. Proposed design for review. Concept maps illustrate spatial intent; they are not collision data, final tile art or playable levels.

## Incorporating the user's platform-action references

Use the references as design ingredients in original PFLX missions, not copied assets or characters.

| Reference direction | Original PFLX mechanic | How it works with static Evo tokens |
| --- | --- | --- |
| Super Mario-style traversal | Jump timing, moving platforms, safe teaching sections, secrets and alternate routes | Move the whole icon; jump height and a ground marker communicate airborne state |
| Kirby-style discovery | Friendly exploration, temporary power modules, flexible routes and readable bosses | Pick up a module that adds a separate effect/projectile; preserve the selected Evo identity |
| Mega Man-style action | Aimed energy attacks, telegraphed hazards, patterned bosses and tools that open routes | Aim reticle, projectile trails, shield/node markers and card-based attack effects |

Prototype input: move, jump/dodge, basic attack, one equipped module and a charged super. Introduce one mechanic at a time; touch controls need large buttons and aim assistance. Normal gameplay does not require skeletal animation. Brief token squash/scale, facing flips, trails and shadows are optional feedback, with reduced-motion alternatives.

Temporary modules can give dash, shield, pulse or a traversal tool for the mission. They are distinct from permanent Evo levels, earned card powers and branch selection. Discovery should not erase a player's chosen studio or grant an unearned celestial form. Boss-specific vulnerability must remain discoverable and beatable with the starter loadout; a useful module makes the fight easier but never requires replaying another level merely to escape a hard lock.

## Two movement modes, one progression

Side-view studio/fortress missions provide platforms, jumps and precise combat. Top-down digital-space missions provide exploration, swarms and wider tactical movement. Reuse player identity, equipped powers and enemy IDs across both. They require separate camera/collision/controllers; do not treat a top-down map as a platformer by only changing the background.

For the first playable slice, implement one side-view route and its controller, then validate the top-down controller separately. Later flying missions can use top-down drift with marked attack lanes. In platform missions, free flight would bypass the intended jumps: use an explicitly signposted mission traversal rule (bounded glide, flight zones or flight challenges) without claiming the Evo has lost its lore abilities. Exact flight unlocks remain a design decision.

## Map 01 — Studio Skyway

Purpose: accessible tutorial and first encounter at a futuristic startup studio.

Sequence: studio spawn → safe low jumps → stepped rooftop traversal with low alternate path → safe learning checkpoint → Scout/Interceptor combat courtyard → recurring Sentry gate → exit.

Teach movement before enemies. Teach jump before a dangerous gap. Introduce a basic attack before a pursuing Scout. Demonstrate Interceptor's marked dash with escape space. Sentry teaches shield weak points. The illustration contains representative encounter tokens, not the final spawn count; apply the seven-Scout/one-Interceptor bag from the Archive progression doc during ordinary spawning.

Optional route: accessible cache loop returning to the main route, rewarding exploration without blocking the exit. All four studios share the geometry and encounter logic; studio variants can use their own colors and set dressing.

## Map 02 — Nexus Drift

Purpose: top-down exploration and swarm movement in digital space.

Sequence: safe arrival → Scout encounter island → safe checkpoint sanctuary → Sentry gate island → broad swarm arena → exit portal. Optional cache island reconnects to the Scout route. Floating islands are walkable platforms with bridges; separate flight/gap-crossing links require explicit jump-pad or portal triggers.

A Hive marker indicates a later mission variant with the coordinated boss active; the introductory version uses ordinary waves in the same arena. Hive is not placed before the player's first Elite main-boss encounter. Show safe travel routes and mark corrupted areas. Keep enough open space to dodge and avoid spawning behind a reading player. Flight scenery does not make the token invulnerable or remove collision rules.

## Map 03 — Archive Citadel

Purpose: the first full main-boss mission, culminating in Elite Archive.

Sequence: entry combat corridor → lift shaft/platform bypass → safe checkpoint → Sentry shield gate → broad Elite chamber → unlocked exit portal. Optional cache branch rejoins at the lift.

The lift gives an accessible traversal alternative. Boss arena includes a clear floor and two side ledges, visible dive/sweep warnings and recovery windows. Seal the arena only after players enter safely; clear the exit after the verified defeat. Later Hive, Trojan, Nightmare and Agent Glitch missions use different boss objectives and map layouts, not merely recolored Elite rooms. Agent Glitch remains the strongest roster enemy.

## Production geometry and safety of learning flow

Concept arrows show intended order, not final navigation or collision truth. Claude must construct tile/collision data and prove every mandatory route reachable with the starter traversal tools. Set jump height, travel distance, collision margins and platform spacing from an actual controller before finalizing geometry. Checkpoint restart must retain the mission's minimum viable loadout and restore safe positioning.

Use safe-room gates for questions: pause solo encounters; gather co-op players into a shared protected checkpoint. No damaging enemies or projectiles should enter the reading area. After a question, release the checkpoint with a clear resume cue. Do not use question speed as a hidden combat penalty.

Telegraph damaging attacks and hazards. Separate optional challenges from mandatory progression. Co-op camera, player separation, revives and checkpoint synchronization need explicit implementation; these concepts do not settle them. Motion effects, color cues and enemy symbols must have readable alternatives.

## Super-move presentation

The player charges an earned card ability through approved actions. Validate availability, target, charge and cooldown before playing a short detailed-card cutscene or static fallback. Apply its result exactly once. During multiplayer presentation, use authoritative shared encounter timing so one player's cinematic cannot freeze or damage other players inconsistently. Returning to gameplay preserves token position, health, actual Evo level and branch. Numeric balance and video production remain future work.

## Deliverables and next checks

Workspace `PFLX Level Maps/` contains three original map concept images and their exact prompts. They use built-in image generation. These are review artifacts, not automatic gameplay integration or deployment. The pictures may simplify or vary the intended route; the sequence specifications above govern implementation.

Build one playable Studio Skyway graybox before producing final tiles: verify start-to-exit reachability, safe checkpoint, ordinary spawn ratio, Interceptor dodge, Sentry weak point and restart recovery. Then implement Elite's separate boss slice and validate Nexus Drift movement. Keep existing ten-level progression decisions and pending migration separate from map prototyping.

Related: [Archive powers](ARCHIVE-POWER-PROGRESSION.md), [Evo tokens](EVO-GAME-ICONS.md), [Archive tokens](ARCHIVE-GAME-ICONS.md), [Claude handoff](CLAUDE-EVO-GAME-SWITCHOVER.md).


## Concept-art review notes

Studio Skyway includes a purple Sentry placeholder; Archive Citadel includes red small enemy placeholders. These are diagram glyphs, not new canonical enemies or palette changes. Replace them with the established black/lime Archive tokens in the playable version. Nexus Drift uses angled island presentation and some arrows differ from the intended mission order; the documented sequence controls implementation. Citadel hazard floors and exit access require controller-based reachability validation and safe standing zones in the graybox. Concept illustrations do not prove a playable route.
