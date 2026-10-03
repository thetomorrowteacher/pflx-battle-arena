# PFLX: Nexus Frontiers — Training Simulations and Co-op Teams

## Confirmed direction

Three original holographic training maps support sparring and other game modes outside seasonal Nexus Frontiers campaigns. They use the general simulation-room concept referenced by the creator; no X-Men characters, branding or location designs are part of these assets. Training is intended to help players strengthen their Evos before and between seasons. Seasonal campaign access is not required for training.

| Map | Proposed modes | Challenge focus |
|---|---|---|
| Spar Chamber | Solo drills, duels, four-player sparring | Aim, dodge, cooldown timing, reading opponents |
| Circuit Labyrinth | Four-player pursuit, objective defense, coordinated trials | Flanks, sightlines, teamwork and route decisions |
| Overload Reactor | Survival waves, elite trials and simulated boss encounters | Sustained execution, hazards and coordinated pressure |

These three static PNG backgrounds are created and locally imported. Game modes, hitboxes, enemy spawns and rewards are not yet implemented. The seasonal seven-area rule does not automatically constrain a training arena: these are reusable mode spaces.

## Increasing challenge — proposed balancing framework

Every completed trial advances to a harder step. Increase required skill through enemy behavior, objectives and telegraphed hazards as well as tuned combat values. Use escalating finite waves so each step can be completed, with recovery/checkpoint opportunities between steps. Suggested tier ladder:

1. Scout pressure and basic movement/quiz attack timing.
2. Mixed Scout/Interceptor waves; preserve the established7:1 bag for ordinary enemies.
3. More coordinated wave angles and cover decisions.
4. Sentry encounters and timed objectives.
5. Elite Archive simulations with readable phase transitions.
6. Multi-objective defense and controlled environmental hazards.
7. Hive simulations requiring team positioning.
8. Trojan simulations and coordinated counters.
9. Nightmare simulations with identifiable illusion tells.
10. Agent Glitch master trials; hardest training challenge.

Boss simulations are training projections, not story defeats or proof of seasonal completion. Boss tier placements are balance proposals. Four-player enemy budgets and solo budgets must be different. Difficulty must never expose a player to damage while reading a quiz; use protected question phases. Correct answers power attacks, and defeated enemy projections can drop configured orbs.

Permanent Evo progression through training is requested by the creator, but XP amounts, unlock criteria and caps are still undefined. Implement validated achievements/mastery and explicit progression rules rather than treating temporary orb pickup as permanent advancement. Completed training must not silently skip seasonal campaign gates or award unearned forms. Energy/Recovery/Upgrade orb roles remain proposals awaiting confirmation.

## X-Live team functionality — local implementation

A host-only optional checkbox in the existing Teams tool enables Nexus Frontiers teams of four. Drafting first creates as many complete squads as possible with one Gentech, one Mindforge, one eMagination and one Innov8 member. Remaining participants are distributed to maximize the available studio variety, with at most four per squad. Unknown studio values stay eligible without counting as a known studio. The draft uses the tool's existing cohort-filtered roster.

If the roster cannot divide into four, a partial squad remains visible and is reported; no fake player or duplicate membership is inserted. A full co-op launch should require four actual ready participants or an explicitly designed short-squad mode. No automated filler or bot policy is selected.

Reshuffling preserves the balancing mode. Renaming and clearing teams preserve the setting. Manual moves cannot exceed four members. With the mode off, existing random team drafting remains. The Teams tool's manual team-count field is ignored in this mode; team count is automatically derived from the roster.

Current implementation: `PFLX Overlay/x-live-check/index.html`. Nine inline scripts parse successfully;320 draft cases tested balanced, uneven, unknown, empty and partial rosters. Additional checks cover duplicate IDs, enable/disable, reshuffle, renaming, capacity and legacy drafting.

## Remaining co-op launch integration for Claude

The campaign's intended default is four-player co-op, with all four Evo types when available. X-Live hosting must snapshot participating ready players from the live session, revalidate squad size and membership, persist session-to-squad assignments and pass each participant's earned Evo/studio identity to the game. The current draft operates on cohort roster membership, not a live readiness filter. Confirm actual attendees before launch.

Late joiners and disconnects need an explicit ready/rejoin policy; don't silently redraft active squads. Session difficulty and rewards require authoritative validation. The co-op launch, multiplayer state, combat, training XP and deployment are not implemented by this change. The local draft prepares assignments; it does not launch Nexus Frontiers.

Assets: `public/assets/nexus-frontiers/manifest.json`. Preview: `public/nexus-frontiers-assets.html`. Exact generation prompts and originals: `Nexus Frontiers Game Assets/`.


## 2026-10-04 — Team quizzes and hybrid combat (latest design)

Read NEXUS-TEAM-QUIZ-AND-COMBAT.md before implementing combat. Normal rooms use real-time Archive swarms with an energy bar on every enemy; all required enemies/waves must clear and the squad advances together. Boss encounters switch to turn-based RPG move cards: select attack/defense → quiz → resolve hit/miss/block/critical or prepared defense → next Evo/Archive turn. Boss moves target all opposing Evos, with individual defensive outcomes. Metrics derive from Evo level, Archive level and applied upgrades.

An independent optional Team Answer Hunt setting shows the same prompt to everyone but gives each player different answer options; exactly one teammate holds the correct answer. Recommended rule: that answer activates the active player's selected move. Exact turn scheduling and combat formulas remain proposals. These requirements supersede earlier real-time main-boss suggestions; only local studio-balanced team drafting is implemented so far.


## Rush Circuit replaces Circuit Labyrinth — 2026-10-04

The three active training maps are Spar Chamber, Rush Circuit and Overload Reactor. Rush Circuit is a continuous asymmetric racing loop for X-Rush / Evo Rush, with four starting boxes and a finish stripe. The old Circuit Labyrinth remains an archived concept. Race modes use lap/checkpoint completion, not the seasonal rule requiring every enemy to be defeated. Quiz-powered acceleration, boosts, collisions, lap counts and progression rewards require explicit game tuning and implementation. This update supplies the PNG background only; it does not wire the existing X-Rush game to a new movement model.
