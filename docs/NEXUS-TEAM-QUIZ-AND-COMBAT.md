# PFLX: Nexus Frontiers — Team Quiz and Hybrid Combat

Updated 2026-10-04. This is the current combat design for Claude implementation. It supersedes earlier suggestions that main-boss encounters use the same real-time combat as ordinary rooms. Gameplay described here is not yet implemented.

## Confirmed gameplay structure

Four-player teams progress through rooms and stages together. The preferred squad contains one Evo from each startup studio; the existing optional local X-Live draft supports complete studio quartets and diverse fallback squads. Normal rooms use real-time top-down action: moving Evo tokens, projectile/ability effects and challenging swarms of Archive Scouts. Stronger henchmen spawn periodically. Every enemy has a visible current/max energy bar. Main-boss encounters switch to turn-based RPG combat using earned Evo move cards and quiz-gated actions.

The existing seven-area seasonal level structure remains: six combat districts, then the final boss district. Each district has a finite encounter budget. A gate opens only when all required enemies, pending waves and required summons are resolved. The squad advances together; an individual cannot enter the next room or stage ahead of teammates. Defeating the final boss and clearing required encounter enemies allows the shared stage transition.

## Optional distributed-answer team quizzes

Host setting: **Team Answer Hunt** (working UI label). This is independent of the four-player team-drafting setting. It can be enabled or disabled per game session. A settings change applies between encounters, not during an active question.

When enabled, all four players see the same question or term at the same time. Each player receives their own answer set. Across all four sets combined, exactly ONE player has exactly ONE correct answer option. Other options are plausible incorrect answers. Players communicate to identify who holds the right answer and that player submits it. Do not reveal the designated answer-holder in the shared view.

Recommended resolution policy, pending playtesting: one final team submission per question, with an explicit confirm step so exploring options does not accidentally resolve the question. Rotate the answer-holder fairly among connected eligible players; randomize the option position. The player holding the correct option need not be the player whose turn it is. A correct team answer authorizes the ACTIVE player's selected move, not a bonus turn for the answer-holder. This preserves turn ownership while involving the entire team.

When disabled, ordinary quiz behavior applies: a player answering a quiz receives a complete valid answer set containing its correct option. In a boss battle the active player answers their selected move's question. The precise ordinary-room quiz cadence is a tuning decision.

For terminology cards, either the term or definition may be the shared prompt, but a generated question must have one unambiguous accepted answer. Validate option IDs and semantic equivalence so a synonym does not accidentally create a second correct answer. If the content lacks enough unique distractors, use fewer options or replace the question; do not silently produce an impossible quiz.

Keep the correct-answer key and answer-holder assignment in authoritative session state; send each player only their own options. Resolve an attempt once. If the sole answer-holder disconnects, pause/redeal the same learning objective with a new question-attempt ID; invalidate old options. No automatic success, duplicate attacks or abandoned unwinnable question.

## Real-time room combat

Scouts are the dominant recurring enemies. Retain the proposed shuffled seven-Scout/one-Interceptor bag after Interceptors are introduced. Sentries and other stronger encounters use separately configured milestones. Waves should feel sustained and intense but are finite, making full room clearance possible. Scale the encounter budget for four players and increase challenge through formations, target priority, tougher henchmen and objectives as rooms/stages advance. Exact counts, caps, damage and intervals require playtesting.

Correct quiz answers power attacks; enemies are defeated through combat, then drop collectible orbs. A protected shared quiz phase pauses hostile damage, projectiles, spawns and action timers for the entire squad. Resume together after resolution. Do not leave other players taking damage while a teammate reads or discusses a question.

Treat the enemy energy bar as remaining combat vitality (HP): damage reduces it and zero defeats the enemy. Keep it distinct from Evo attack charge and orb resources. Show bars above every enemy, including Scouts; larger boss bars can include phase segments. Shield overlays may show protection without concealing remaining vitality. This terminology distinction is the recommended UI interpretation of the requested energy bars.

## Turn-based boss flow

1. The whole team enters the boss encounter together; freeze real-time room simulation and show the turn queue, boss energy bar and team status.
2. On an Evo's turn, show only move cards that player has earned and can currently afford/use. The player chooses an attack or defense move and a valid target where relevant.
3. Lock that choice and activate a quiz. With Team Answer Hunt on, everyone sees the prompt and receives distributed options. With it off, the active player receives the ordinary quiz.
4. A correct answer authorizes the selected move. Resolve combat against the current boss/player stats and upgrades. Correct knowledge does not guarantee combat contact: an attack can miss, be blocked, hit normally or critically hit. Show learning success separately from the combat result.
5. A successful defense action prepares its specified guard/dodge effect for the upcoming boss attack. Defense behavior and duration come from the card.
6. Apply the result once, update bars/statuses and advance to the next queued Evo or Archive turn. Optional cutscenes present an already-resolved action and cannot change damage when skipped.
7. On the Archive boss turn, its move targets all opposing team members still in the encounter. Resolve damage, guard and dodge separately for each player. A player's prepared defensive card can block, mitigate or evade that attack according to its stats.
8. Continue through all boss phases. Boss defeat plus required enemy clearance ends the encounter and permits the shared stage transition.

Recommended incorrect-answer rule: explain the answer, the chosen move does not activate, and the active turn ends. Do not perform a hit/critical roll after a failed quiz. Resource charging/consumption on a failed question still needs a balance decision. No permanent experience is removed for an incorrect answer.

Recommended initial turn queue: one opportunity per eligible Evo and one boss action per round, ordered by an initiative stat derived from the combat build. Display the queue before choices. Exact speed ties, status interrupts, extra turns, revive policy and downed-player handling remain design decisions. This is a proposal; the user confirmed that either the next Evo or Archive acts next, not a specific scheduling formula.

A boss-tagged encounter uses this RPG mode. Strong ordinary henchmen can remain in real-time rooms; a Sentry explicitly configured as a boss encounter should use the boss mode. If bosses summon required minions, those summons must belong to the turn-based encounter with finite budgets and targetable energy bars; do not run a second uncontrolled real-time battle during quiz selection.

## Combat metrics and upgrades

Confirmed dependencies: player Evo level, Archive level and each player's applied upgrades affect attack and defense. Resolve against the actual participating player's build, not a team average or an unrelated answer-holder's stats. Server-world number, Evo level and enemy level remain separate values.

Suggested stat fields for implementation: maximum/current vitality, attack, defense, accuracy, evasion, critical chance, critical multiplier, initiative, shield/guard strength and move resource cost. Each move specifies its base power, target rule, attack/defense category and allowed modifiers. Archive moves use Archive stats and their own move definition.

Recommended resolver order: validate actor/turn/card/resource → validate quiz success → derive effective stats from level/build/upgrades/statuses → resolve miss/dodge or block → if eligible resolve normal/critical damage → apply bounded damage and update vitality → expire relevant statuses → advance turn. A fully blocked or missed hit cannot also be a critical hit. Defense cards can specify partial mitigation instead of full block. Boss-wide attacks need one result per defender, never a single all-or-nothing team roll.

Percentages, level curves, damage equations and upgrade stacking limits are deliberately unassigned until balancing. Show meaningful card effects to players. Earned higher levels should confer real strength while later enemies introduce harder tactical problems. Agent Glitch remains the strongest final boss. Training simulations can practice these systems outside seasons, with persistent training progression defined separately from temporary run upgrades.

## Implementation boundaries and acceptance

The existing local X-Live checkbox only drafts studio-balanced teams. Team Answer Hunt, synchronized room movement, enemy bars, real-time swarm combat, turn-based boss combat and multiplayer combat validation are new requirements, not shipped features.

Acceptance cases for Claude:

- Distributed mode: four personalized answer sets, exactly one correct option overall; toggled-off mode remains answerable.
- A teammate's correct answer activates the current actor's move once and never steals turn ownership.
- Wrong answers do not activate moves; correct answers with combat misses still show correct learning feedback.
- Disconnected answer-holder and stale submissions cannot cause a stuck quiz or duplicate result.
- Every enemy has a readable energy bar; finite waves and pending summons prevent premature gate opening.
- One player reaching a gate cannot move the squad ahead before full clear and shared transition readiness.
- Boss mode freezes room simulation and uses legal earned cards, explicit turn ownership and a visible queue.
- Boss area attack resolves guard/dodge/damage individually for every eligible opposing Evo.
- Level/build/upgrades affect the proper actor and target; cosmetic icons do not change combat stats.
- Cutscene skip, retries and reconnects cannot duplicate damage, drops, progression or rewards.

Related: NEXUS-TRAINING-AND-COOP.md, NEXUS-LEVEL-MAP-DESIGN.md, ARCHIVE-POWER-PROGRESSION.md and CLAUDE-EVO-GAME-SWITCHOVER.md.


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
