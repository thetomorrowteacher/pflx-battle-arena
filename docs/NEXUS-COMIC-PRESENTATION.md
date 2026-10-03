# Nexus Frontiers — Comic and Anime Presentation Asset Plan

Updated 2026-10-04. Confirmed creative direction and proposed production inventory; not a claim that these assets or runtime systems are complete.

## Creative direction

Use original PFLX characters and digital-universe design. The supplied recordings inform presentation: TMNT Splintered Fate-style large speaker portraits and dialogue panels over top-down gameplay; MegaMan X-style character-led mission scenes and dramatic illustrated close-ups; Scott Pilgrim-style graphic cuts, panel compositions, speed lines and impact accents. Sampled frames from all three supplied recordings were reviewed, not a frame-by-frame or audio analysis. Voice and sound design remain a later task.

Maintain readable, restrained gameplay surfaces, with bolder comic treatments for introductions, dialogue, boss reveals and resolved super moves. Existing small Evo icons remain gameplay tokens; dedicated bust portraits convey dialogue. Do not replace earned Evo level/branch identity with a generic portrait. Use the matching earned icon until matching portrait art exists. Expression changes are cosmetic and do not imply new powers.

## Confirmed world image count

Each of ten server-worlds has 14 planned scene images: one detailed cinematic introduction, six combat spaces, six navigation transitions (including the approach to the boss), and one final boss space. Total: 140. Transparent world-selection icons, portraits, props, UI and effects are additional shared assets, not included in 140. This supersedes the earlier 12/13 image proposals. Scene art does not constitute collision, navigation or playable encounter implementation.

## Proposed shared production kit

| Asset family | Initial deliverables | Format and behavior |
|---|---|---|
| Speaker portraits | Four studio Evo leads and speaking Archive characters; begin with neutral, determined, alarmed and triumphant expressions for each selected speaker | Transparent PNG busts, consistent eye line and anchor, separate from dialogue text; final speaker roster and earned-form coverage determine count |
| Dialogue shells | Standard speech, urgent/shout, thought, Archive transmission, narration, team communication | Reusable scalable shells; SVG/CSS or nine-slice PNG borders with separate pointer tails; no baked dialogue |
| Speaker identifiers | Four studio badges, Archive badge, nameplate frame, continue indicator | Transparent art where needed; names rendered as live text |
| Comic panel kit | Horizontal strip, diagonal split, inset close-up, full-screen reveal | Layout/masks in code, reusable ink/halftone overlays as transparent PNGs |
| Impact kit | Speed lines, radial burst, slash, shield ripple, glitch fragments, portal flare | Separate transparent effects; short scale/fade/slide animations; optional sprite sheets only where internal motion is required |
| Transition kit | Circuit wipe, portal entry/exit, comic-page/panel cut, Archive glitch interruption | Code-driven masks and timing with reusable textures; no full-screen flashing dependence |
| Combat interface | Vitality/energy frame, shield overlay, turn marker, move-card selection frame, status symbols and orb counters | Frames/icons as assets; values, cooldowns, fills and labels remain live UI |
| Cinematic layers | Foreground silhouettes, middle-distance structures, distant environment and portal light where a scene needs parallax | Separately authored PNG layers; do not assume a flattened intro image contains hidden scenery |

Suggested exports: portrait masters 1024px longest edge with 512px variants; effects 1024/512/256 as needed; cinematic plates 16:9 with planned foreground/text safe areas. These are export targets, not promises about existing resolution. Preserve alpha, consistent canvas dimensions within each expression set and untrimmed anchor padding. Record pivot, intended display size and asset ID in a manifest. Never mirror asymmetric studio badges or weapon placement blindly.

## Dialogue behavior for Claude

Speaker icon/bust slides or pops into a panel with a speech bubble. Reveal dialogue as live text, not an animated image. Proposed default: roughly 30 characters per second with short punctuation pauses and user-selectable instant text. First advance reveals the whole line; next advance proceeds. Never auto-advance an unfinished line by default. Keep full text in the accessibility tree without announcing every character; support keyboard, touch, adjustable text size and reduced motion. Keep a dialogue history.

Each dialogue entry needs scene ID, speaker ID, portrait/form ID, expression, text/localization key, placement, next entry/choice, and optional future voice cue. Separate scene events from text timing. Portrait pop-in, expression changes and subtle idle movement work without mouth animation. Voice cue fields may remain empty until sound planning.

In co-op, synchronize the scene and line ID. Each client may reveal text instantly locally; shared progression uses an explicit host/all-ready policy, to be chosen for implementation. Essential story/quiz dialogue pauses hostile action for the team. Optional brief chatter must not obscure controls or enemy warnings. Skip/reconnect must never repeat attacks, drops or progression rewards.

## Example scene sequence (storyboard proposal)

1. A circuit portal wipe reveals the detailed server-world intro; slow pan and separately layered foreground drift establish depth.
2. A studio Evo portrait appears with mission dialogue in a comic panel. A second portrait can answer using a split composition.
3. A brief Archive transmission interrupts with controlled glitch fragments and a changed dialogue shell.
4. The panel retracts into the first playable combat map. The whole squad begins together.
5. After room clearance, a navigation transition provides a short environmental story beat before the next encounter.
6. The sixth transition builds toward the boss; a portrait reveal and turn-order interface introduce RPG combat.
7. A correctly authorized super move receives a short card/portrait cut-in, slash/impact effect and return to the already-resolved battle state.

This is reusable scene structure, not final story dialogue. Use the established lore and leave TheTomorrowTeacher's unrevealed backstory unwritten.

## Spar Chamber clarification

Spar Chamber practices the boss-style RPG loop in player-versus-player or team-versus-team matches: choose an earned attack/defense move, answer the quiz, resolve the move, advance the turn. Opposing Evos replace the Archive boss. PvP targeting, turn ordering, fairness and reward tuning need separate rules; do not automatically give every player the Archive boss's team-wide attack. Rush Circuit remains the race room; Overload Reactor remains the escalating combat training concept.

## Production order and acceptance

Start with one complete conversation kit: one Evo and one Archive portrait, two expressions each, standard and Archive dialogue shells, continue marker and one panel transition. Verify that dialogue remains readable on mobile and over bright maps. Then expand the approved visual language across speakers and world introductions.

Verify earned-form portrait mapping, instant-text/advance behavior, keyboard/touch access, reduced motion, co-op pause/readiness, long localized lines and cutscene skip without repeated game events. PNGs provide artwork; Claude implements typewriter text, panels, timing, hitboxes, collision and game synchronization. No new assets, animations or deployment are claimed by this planning document.


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
