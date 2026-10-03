# Nexus maps — top-down gated action campaign

## Confirmed server-world setting — 2026-10-03

The Nexus is the AI digital universe, a higher-dimensional plane that already existed before humanity discovered access. Within it, servers can contain entire cities or worlds. A level map is stationed inside one such server-world, with a digital-space frontier appearance: circuit terrain, holographic structures, floating data platforms and cosmic data streams.

The rogue Archive AI infiltrate and attack these servers. Their interference causes problems in the associated Nexus Narrative storylines. Evos track the Archive across the affected servers, entering and travelling through circuit portals and gateways. This gives game missions a direct narrative purpose: pursue the infiltrators and defend the server-world where the storyline is unfolding. Server-world names, individual city problems and the redesigned client stories will be developed with the creator; do not invent them as established canon.

Each level inside a server contains seven combat areas: six sequential rooms/stations and a final main-boss area. Circuit gateways between areas remain locked until all required enemies and waves are defeated. Defeating the final boss unlocks the next stage and its onward circuit portal. Travel or flight cannot bypass progression gates. A server-world may contain multiple levels; seven areas describes a level map, not the maximum size of a city or world.

Correct quiz answers power Evo attacks. Defeated Archives drop collectible orbs. This combat loop connects to the server mission without automatically granting permanent XP, X-Coin or completing a real-world client project. The specific effects of restoring a server on narrative state remain design work, not implemented behavior.


## Latest confirmed map structure and setting

Each level map contains exactly seven playable combat areas: six sequential rooms/stations (Areas 1–6), then the final main-boss arena (Area 7). The arrival pad belongs inside Area 1 and the exit portal inside Area 7; neither creates an eighth area. Every area is gated by completion of the preceding required encounter, and the stage exit unlocks only after the final boss and required summons are defeated. Optional rewards stay inside these seven areas rather than adding mandatory rooms. The earlier three-room concepts are superseded.

All maps exist within the Nexus digital universe and should look like a digital-space frontier. Use suspended data-landmasses, cosmic voids, circuit terrain, holographic architecture, luminous route bridges and floating code/data fragments. Studio environments are digital projections/outposts within the Nexus, not ordinary Earth rooftops or natural gardens. Archive fortresses are corrupted data strongholds. Keep floor silhouettes and combat routes clear despite the cosmic scenery. A space backdrop does not allow flight to bypass the gate rules.


Updated 2026-10-03 after the user's screenshot references and explicit correction. This supersedes the earlier side-view platform-map direction. Current maps use an overhead/high-angle top-down arena viewpoint with shallow 2.5D environment depth. Original PFLX studio, digital-space and Archive art remains the visual universe. These are concepts and design rules, not implemented gameplay.

## Confirmed gameplay loop

Enter zone → sealed combat encounter → answer quiz cards correctly to power attacks → defeat Archives → collect dropped orbs → clear all required enemies and waves → gate opens → next zone → defeat the stage's main boss → next stage unlocks.

Correct answers power attacks; they do not automatically kill enemies. Orb pickup does not trigger the quiz. Defeated enemies drop collectible orbs. Exact attack-charge values and orb reward uses remain balance/economy decisions. Do not equate collected orbs with permanent Evo XP or X-Coin without a separate approved rule.

## Map gates and encounter completion

The Evo cannot enter the next map section until all required enemies in its current section are defeated. Each section has a finite encounter budget: ordinary waves, scheduled Interceptors and Sentries, and any required summons. Scouts and Interceptors recur during that encounter but are not an endless stream that prevents completion. The suggested seven-Scout/one-Interceptor bag remains the ordinary spawning rule after Interceptors are introduced; Sentries and boss summons are tracked separately.

A zone clears only when: all planned waves have been issued, all required enemies are resolved as defeated, pending required spawns/summons are zero, and no boss phase or required objective remains. An enemy moving off-camera, despawning, disconnecting or being hidden is not a defeat. Track enemy IDs and encounter state authoritatively. A main boss is defeated only after its final phase and required spawned enemies are cleared. Do not let an exit open between boss phases.

The next stage requires verified main-boss defeat. Gate/exit collision stays locked until that result; merely walking to the exit or collecting all orbs is insufficient. Optional treasure alcoves stay within the current accessible zone. Dash, flight, knockback and teleport powers must respect encounter boundaries; no bypass through a decorative wall. After a stage clear, preserve the completion result so the player can return to collect rewards without fighting the cleared boss again in that run.

Proposed room states: dormant → sealed/active → cleared → next-room accessible. Stage states: locked → accessible → boss active → completed. Display remaining enemies and waves separately so players understand why a gate is locked. Co-op uses shared encounter/gate state; define defeated-player revival/rejoining so one disconnected player cannot permanently block exit.

## Quiz cards and combat safety

Successful answers add attack energy or arm a usable attack charge. Basic attacks and card-based powers draw from this validated charge system; charge cap, action costs and whether any fallback attack is free remain tuning decisions. Preserve real Evo level, branch and owned powers. No answer can unlock an unearned branch or celestial form.

Quiz prompts need safe presentation: pause and resume solo combat consistently; in co-op use a shared protected question phase or agreed safe checkpoint before opening cards. Do not leave a player taking damage while reading. Resume cues must be clear. Incorrect answers give feedback/retry and no attack-energy grant; they do not erase earned persistent progression. Associate each question resolution with a unique attempt so repeated submissions cannot create duplicate charge.

## Orb collection

On a verified enemy defeat, create a limited orb drop associated with that enemy's defeat ID. A collected orb can be claimed once. Use visible cyan orb pickups with a symbol as well as color, distinguishable from enemy projectiles. Larger/boss drops may differ in size; amounts and effects are not final.

Recommended first prototype: orbs are temporary run resources displayed separately from account rewards. Charge is earned through correct quiz answers; orbs can later support run upgrades if approved. Co-op ownership/sharing must be decided before implementation; use one clear policy rather than whichever player races to a drop. Orbs are not required to open a combat-clear gate. Keep unclaimed drops accessible after clear, and define resume/recovery behavior before any persistent payout.

## Revised three-map sequence

| Map | Layout and encounter structure | Main-boss gate |
| --- | --- | --- |
| Studio Defense Grid | Safe arrival, broad studio courtyards, six sequential sealed combat zones; Scouts, Interceptors and recurring Sentry commanders | Elite is the first main boss; victory opens the stage exit |
| Nexus Swarmway | Digital-space islands with wide bridges, open dodge space and six gated swarm zones | The Hive commands its core arena after Elite's earlier stage |
| Archive Citadel | Top-down fortress chambers with low obstacles, broad corridors and locked energy barriers | Trojan siege encounter and reactor objectives; victory opens the next stage |

Nightmare and Agent Glitch require later stage maps. Agent Glitch remains the strongest. These are stage names, not Evo level assignments or a shortcut to earned ten-level progression.

Playable view: large clear walkable floor shapes, small static Evo/Archive tokens, visible aim indicators, skill effects, ground markers and orbiting/flying tokens within arena bounds. Use top-down movement and dodge/ability actions. Side-view jumping, ladders and platform physics are no longer the map foundation. Earlier Mario/Kirby/Mega Man inspirations can contribute discovery, optional within-zone rewards, temporary modules and boss patterns without changing the confirmed viewpoint.

## Concept art and implementation

Current images: workspace `PFLX Level Maps/*-maze-v4.png`, exact prompts under `prompts/`. Local app preview: `public/level-map-concepts.html`; copied concept images under `public/assets/level-map-concepts/`. Earlier images remain archived design exploration, not current playable instructions.

Generated route arrows, enemy glyphs and drawn barriers are illustrative. Final gameplay must use canonical enemy icons, real collision masks, scripted gate objects and validated reachability. Gate code, not a painted lock, enforces progression. Check each route for geometric bypass and ensure boss chambers have safe dodge space. Concept counts do not define final wave sizes.

Claude's first playable slice: one top-down studio zone, Scout/Interceptor finite waves with the 7:1 bag, protected quiz phase, correct-answer attack charge, defeat-linked orb drops, a Sentry encounter and a locked gate that opens only on true clear. Add Elite and a stage exit next. Then expand to Hive/Trojan and co-op. No combat implementation, economy grants, database migration or deployment is performed by this document.

## Acceptance checks

- Players cannot cross a locked room or stage gate, including through powers or flight.
- Pending waves/summons prevent a premature clear; finite waves eventually permit completion.
- A correct answer powers an attack; an incorrect/replayed submission cannot grant charge.
- A defeated Archive creates a drop once; an orb is claimed once.
- Reading a quiz is safe; solo/co-op simulation resumes consistently.
- Killing the last ordinary enemy cannot bypass an active boss or its next phase.
- Only verified final main-boss defeat unlocks the next stage.
- Orb pickup does not silently grant permanent XP, X-Coin or an Evo form.

Related: [Archive powers](ARCHIVE-POWER-PROGRESSION.md), [Claude handoff](CLAUDE-EVO-GAME-SWITCHOVER.md), [Evo tokens](EVO-GAME-ICONS.md), [Archive tokens](ARCHIVE-GAME-ICONS.md).


### Current seven-area frontier concept review

Each current illustration depicts seven irregular maze districts in order 1 → 2 → 3 → 4 → 5 → 6 → 7. Area 7 contains the final main boss and stage exit. The six inter-area links require locked gate objects; there is no direct Area 5 → Area 7 route. Arrival and exit are pads within existing arenas. All three settings are regions within the Nexus digital universe: the studio outpost, open cosmic data frontier and corrupted Archive stronghold.

The illustrations are concept art, not collision maps or wave configuration. Use the documented Scout/Interceptor 7:1 spawn bag rather than counting drawn enemies. Canonical gameplay tokens come from the existing Evo/Archive catalogs. Correct answers power attacks; defeated enemies drop collectible orbs. Full room clear opens the next gate, and verified final-boss defeat unlocks the next stage.


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
