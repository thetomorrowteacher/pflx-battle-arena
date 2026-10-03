# PFLX: Nexus Frontiers — PNG asset pack

This pack supplies clean static visual assets for game integration: one ten-server campaign background, three asymmetric maze backgrounds and an open circuit portal sprite. Original annotated concept art remains in PFLX Level Maps.

Use manifest.json to load files at native resolution. Backgrounds include their environment and cosmic backdrop; they are opaque complete plates, not tile sets or individually layered walls. They have no baked-in labels, enemies, boss tokens, reward markers or progression UI. Fixed environmental circuitry and light fixtures remain. Portal variants preserve actual alpha transparency.

Campaign labels, routes and portals belong in the interactive layer. Use server IDs1–10 and explicit links1→2→3→4→5→6→7→8→9→10. In particular Forge Circuit6 connects to Prism Commons7. Server10 is Archive Mainframe HQ with Agent Glitch. Stage numbers do not automatically equal Evo levels.

The maze backgrounds are illustration assets, not collision masks. Before playable integration, trace walkable polygons against the final exported backgrounds, define six gate boundaries and seven combat districts, and verify that all alternate routes into later districts remain locked until required prior combat is cleared. Generated edit geometry can differ from the concept art, so reuse of an old collision mask is unsafe. Correct answers power attacks; enemy defeat drops collectible orbs. Place existing canonical Evo and Archive icons over the background, with collision and occlusion handled separately.

The portal sprite is a static open-state image. Locked-state barrier art and animations are not included. Optional glow effects can be implemented in game code. Authoring prompts are preserved under prompts/; runtime copies are in PFLX Overlay/pflx-arena-check/public/assets/nexus-frontiers/. Local copy does not deploy or implement the game.

Only three individual server level backgrounds exist in this pack. The other seven worlds are represented on the overall atlas; their individual level backgrounds are future work.


## Collectible orb asset and proposed types

A cyan diamond-core orb PNG with verified alpha is available as `sprites/orb-energy.png`, with512/256/128/64/32 longest-edge variants in the Nexus Frontiers pack. This is the current visual asset; Energy recharge is a proposed role, not an implemented or approved economy effect. Suggested additional types: Recovery (health/shield restoration) and Upgrade (temporary run-only power choice), differentiated by color and core symbol. Neither additional sprite exists yet. Quiz answers still power attacks. Do not automatically convert pickups into permanent Evo progression or X-Coin. Boss drops can increase value/quantity rather than add a separate orb type. Await the creator's choice before implementing these effects.


## Holographic training and four-player studio teams

Three year-round training backgrounds are created: Spar Chamber, Circuit Labyrinth and Overload Reactor. Current PNG pack and preview include all three. Optional local X-Live Teams setting now drafts four-player studio-balanced squads with diverse fallback. The co-op game launch and training progression are still pending implementation. Read `NEXUS-TRAINING-AND-COOP.md` for confirmed scope, proposed difficulty ladder, test results and remaining live-session work.
