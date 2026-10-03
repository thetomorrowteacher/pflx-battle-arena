# Archive power progression and Nexus action-game direction

## Latest confirmed map and learning loop — 2026-10-03

The user selected top-down/high-angle arena maps in the supplied action-game reference format. All required enemies and finite waves must be defeated before a section gate opens; the main boss must be defeated before the next stage unlocks. Correct quiz answers power attacks; defeated Archives drop collectible orbs. Orbs do not open quizzes or automatically become permanent XP/X-Coin. Read [NEXUS-LEVEL-MAP-DESIGN.md](NEXUS-LEVEL-MAP-DESIGN.md) for current gate, quiz, orb and prototype rules. This supersedes side-view/controller suggestions and earlier collect-XP-then-checkpoint assumptions where inconsistent. No game implementation is claimed.


Updated 2026-10-03. Design specification, not implemented gameplay. This document supersedes earlier tentative Archive encounter ordering where inconsistent. Player Evo progression remains ten levels; enemy ranks, mission difficulty and temporary run upgrades are separate systems.

## Confirmed user decisions

Agent Glitch is the strongest Archive character in the current roster. Scouts, Interceptors and Sentries are recurring enemies. Scout is basic; Interceptor is stronger and less frequent, with a suggested seven Scouts to one Interceptor. Sentry is a larger boss-like threat than Interceptor. Elite Archive is the lowest main-boss tier. Higher bosses escalate from there. The game should draw on Monster Brawl and the user's Kirby Dreamland, Pokémon Legends, League of Legends, TMNT and Marvel Ultimate Alliance references while keeping original PFLX characters and designs.

Being the strongest establishes Agent Glitch's combat rank, not proof that he created the Archive or identifies its hidden human operators. Hack Guild remains a boss faction/order, not a ninth illustrated character.

## Proposed complete enemy ladder

Ranks and mechanics below are design proposals for the existing eight characters. The Hive → Trojan → Nightmare ordering is proposed; Agent Glitch's highest rank and Elite's entry main-boss role are confirmed.

| Rank | Enemy ID | Encounter role | Primary power | How the player counters it |
| --- | --- | --- | --- | --- |
| 1 | scout | Constant basic enemy | Pursuit and short contact pulse; later variants use a clearly marked scanning shot | Keep moving; clear clustered drones with basic attacks |
| 2 | interceptor | Recurring stronger hunter | Faster movement; marked charge/dash across the arena, then recovery | Step out of its indicated path and attack during recovery |
| 3 | sentry | Recurring mini-boss / wave commander | Shield petals, targeted beam and stationary area denial | Break a shield node or flank; strike its exposed core |
| 4 | elite | First and lowest-tier main boss | Draconic dive, claw sweep and blade-wing spread | Dodge the dive, avoid the sweep cone, punish the landing window |
| 5 | hive | Swarm main boss | Coordination core commands formations; drone groups detach and reform | Destroy linked swarm nodes to expose the central core |
| 6 | trojan | Heavy siege boss | Armored shell, hidden hangars and exposed reactor blasts | Close hangars, bait shell opening, attack the reactor window |
| 7 | nightmare | Master boss | False targets, marked corrupted zones and delayed glitch echoes | Identify consistent real-core cues; clear safe space and exploit the genuine target |
| 8 | agent-glitch | Strongest / final boss of this roster | Commands lesser Archives, locks sectors of the arena and combines disruption with precision attacks | Break control anchors, coordinate a safe lane, use charged team powers during vulnerability |

Make escalation about behavior as well as durability: Scout teaches movement; Interceptor teaches timing; Sentry teaches weak points; Elite combines them; Hive adds target priority; Trojan adds objectives; Nightmare adds observation; Glitch tests coordination and everything learned. Every damaging attack needs a visible warning, a response opportunity and a readable recovery or vulnerability window. Enemy attacks must not become unavoidable merely because they are higher rank.

## Encounter frequency and wave rules

Use a repeating shuffled bag of seven Scouts and one Interceptor for normal spawning after Interceptors are introduced. This gives exactly 7:1 over complete eight-unit bags (87.5% / 12.5%) without relying on random sampling. Before Interceptors unlock, spawn Scouts only. Avoid spawning an Interceptor directly on a player; provide entry cues. Failed spawns do not consume the bag entry.

Sentries recur throughout missions but are milestone mini-bosses, not members of that bag. Initial tuning proposal: introduce one Sentry after every three ordinary waves. Elite and later bosses are mission gates or featured encounters, not constant random spawns. A main-boss summon can contain Scouts/Interceptors without changing the ordinary-spawn ratio; count those summons separately. Cap active enemies and suspend ordinary spawning during dense boss phases to preserve readable play.

These waves are encounter events, not fixed wall-clock timers. Later tuning must define wave size, active cap, spawn interval and target session length. A short classroom session and a longer story campaign should use the same enemy behaviors with different encounter budgets.

## First-introduction storyboard across Evo levels

This is a proposed mission-access ladder, not a replacement for XP requirements or a mandatory boss at every player level. Encounter difficulty should follow the selected mission; do not secretly scale enemies to cancel earned player upgrades.

| Evo level band | Suggested first exposure | Story beat |
| --- | --- | --- |
| 1 | Scouts | Defend the studio's connection to the Nexus |
| 2 | Interceptors | Chase corrupted signals at the studio boundary |
| 3 | Sentries | Break a defended gate into digital space |
| 4 | Elite | Defeat the first main boss and open a space route |
| 5–6 | The Hive | Disrupt coordinated swarms as Evo branches specialize |
| 7–8 | Trojan | Breach siege formations and protect Nexus relay points |
| 9 | Nightmare | Navigate deceptive corrupted space and reach the command frontier |
| 10 | Agent Glitch | Celestial confrontation using signature swords and team powers |

All lesser enemy types remain available in later regions. Reuse their static icons with readable mission-tier indicators; stronger instances do not require new artwork. Mastery runs can revisit prior bosses. Keep the H hybrid's unlock rule unresolved until the user decides it; this boss ladder does not grant H automatically.

## Combat power and tuning model

Do not use rank as a single damage multiplier. Each enemy needs separate health, attack damage, move speed, windup, cooldown, range, shield/weak-point rules, phase transitions and summon budget. Relative starting health budgets for one solo encounter at the same test difficulty could be Scout 1, Interceptor 3, Sentry 12, Elite 30, Hive 45, Trojan 65, Nightmare 85 and Glitch 120. These are prototype budgets, not canon stats or balanced live values. Boss shields, adds and objectives increase effective encounter difficulty beyond the health number.

Begin with a fixed player damage baseline and measure time to defeat, incoming hit frequency and successful dodge rate. Boss attacks should punish mistakes rather than remove a player with an untelegraphed single hit. Co-op tuning should adjust encounter health/add budgets for participating players, not multiply both boss health and attack damage indiscriminately. Glitch's full encounter should remain the hardest of the roster, including Hive add pressure and Trojan armor phases in the comparison.

Proposed boss phases: Elite teaches two patterns then combines them; Hive loses coordination nodes before the core fight; Trojan alternates protected-shell and reactor-open phases; Nightmare moves from decoys to combined zone/echo pressure; Glitch alternates command anchors, direct confrontation and a final combined phase. Use phase objectives and labeled health segments; exact thresholds await playtesting.

## Original PFLX game synthesis

Recommended foundation: top-down PvE action with static token movement, visible projectiles, dodge indicators and weak-point markers. This fits the current icons and permits flying digital-space encounters without skeletal character animation. A side-scrolling platformer would require a different movement/collision layer, so it should be a later optional mission type.

| User reference | Proposed ingredient for PFLX |
| --- | --- |
| Monster Brawl | Accessible arena movement, XP collection, question-driven ability upgrades and growing survival pressure |
| Kirby Dreamland | Approachable action, readable themed regions and discovering temporary power tools |
| Pokémon Legends | Exploration, tracking encounters, field missions and a creature-discovery journal |
| League of Legends | Distinct studio roles, aimable abilities, cooldown decisions and map objectives |
| TMNT | Cooperative wave encounters, revives and coordinated attacks |
| Marvel Ultimate Alliance | Four-member team synergy and cinematic combined super moves |

These are selected inspirations, not a promise to reproduce every system or copy characters, assets, UI or named abilities. Start with solo and optional four-player co-op PvE. Competitive lanes, elaborate capture systems and full platforming should not be dependencies of the first prototype.

Four proposed studio roles: Gentech frontline/control; Mindforge resonance/support; eMagination area creation/decoys; Innov8 mobility/disruption. Match abilities to existing card builds. Branch customization and power selection must preserve actual player level/build; cosmetic changes confer no power.

## Learning, XP and cinematic loop

Explore a zone → answer protected quiz challenges to power attacks → face Scouts/Interceptors in real-time combat → collect enemy-dropped orbs → clear all required enemies → enter the main boss RPG encounter → choose move cards and resolve quiz-gated turns → receive a verified mission result.

Temporary run upgrades reset at run end. Persistent Evo levels represent the player's broader experience and project development; do not grant permanent levels merely for farming drones. Persistent rewards, X-Coin payout and assessment rules remain for the PFLX economy/design decisions. A wrong answer should provide feedback and another learning opportunity, not remove earned progression.

For solo play, a question checkpoint may pause the encounter. For co-op, use a shared safe-room/checkpoint phase; do not leave a player defenseless while reading. Prevent duplicate reward claims and handle disconnects before introducing persistent payouts.

Charge a super through approved gameplay actions, validate its availability/cost, show a short detailed-card cinematic or static fallback, resolve its effect once, then return to token play. Offer skip/reduced-motion presentation. Cutscene skipping must not change combat outcomes. Exact charge values, cooldowns and video lengths remain proposals to test.

## Claude implementation sequence and acceptance checks

First playable slice: one arena, one Evo token, Scout pursuit, Interceptor marked dash, seven-to-one spawn bag, movement/basic attack, a safe learning checkpoint, temporary upgrades and a Sentry weak-point encounter. Implement Elite next as the first main boss, then expand in the ladder order. Add co-op only after the solo loop and authoritative encounter results work.

Use `public/assets/archive-icons/manifest.json` IDs for enemies and the existing Evo resolver for player appearance. Keep boss rank and mission tier separate from Evo level. No database migration, new unlock rule, combat implementation or deployment is performed by this document.

Acceptance: complete spawn bags produce 7 Scouts/1 Interceptor; Sentries recur at configured milestones; all eight enemy IDs resolve; attacks have visible cues and avoid spawn-on-player damage; boss progression follows the ladder; Agent Glitch is strongest; question flow is safe; temporary XP never silently changes persistent Evo level; rewards and super effects cannot apply twice. Review actual difficulty through playtesting, not health numbers alone.

## Reference

Blooket's official mode guide describes Monster Brawl as moving around the map, collecting XP and answering questions to upgrade abilities and survive: https://help.blooket.com/hc/en-us/articles/21408591795351-Blooket-Game-Mode-Previews . The PFLX synthesis and tuning values above are original proposals.


Latest map rule: seven combat areas per level (six sequential rooms/stations plus Area 7 main boss), all set in the Nexus digital-space frontier. Arrival/exit are within Areas 1/7. Earlier three-room and physical studio scenery concepts are superseded. See the current map specification.


## 2026-10-04 — Team quizzes and hybrid combat (latest design)

Read NEXUS-TEAM-QUIZ-AND-COMBAT.md before implementing combat. Normal rooms use real-time Archive swarms with an energy bar on every enemy; all required enemies/waves must clear and the squad advances together. Boss encounters switch to turn-based RPG move cards: select attack/defense → quiz → resolve hit/miss/block/critical or prepared defense → next Evo/Archive turn. Boss moves target all opposing Evos, with individual defensive outcomes. Metrics derive from Evo level, Archive level and applied upgrades.

An independent optional Team Answer Hunt setting shows the same prompt to everyone but gives each player different answer options; exactly one teammate holds the correct answer. Recommended rule: that answer activates the active player's selected move. Exact turn scheduling and combat formulas remain proposals. These requirements supersede earlier real-time main-boss suggestions; only local studio-balanced team drafting is implemented so far.
