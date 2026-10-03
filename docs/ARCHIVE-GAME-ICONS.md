# PFLX Archive Game Icons

Eight static enemy tokens adapted from the existing Archive character artwork: Scout, Interceptor, Sentry, Elite Archive, The Hive, Trojan, Nightmare and Agent Glitch. These complement the Evo game icons in quizzes, races, encounters and leaderboards without requiring character animation.

The palette preserves obsidian black/charcoal facets with lime-green and yellow cores. Drone silhouettes, dragon features, siege armor, fragmented masks and the broken data halo distinguish enemy identities. The Hive represents its swarm with a compact core and simplified drone cluster. Agent Glitch's icon does not establish him as the confirmed leader. Hack Guild is a faction grouping; no additional unnamed guild boss designs are invented here.

## Assets

`originals/` preserves built-in image-generation output. `prompts/` preserves the exact prompt for every icon. `icons/` contains transparent PNGs at 512, 256, 128, 64 and 48 pixels. `manifest.json` maps stable enemy IDs to size variants. `preview.html` shows large and small tokens on light/dark backgrounds. Exporting normalizes padding and preserves alpha without repainting the artwork.

The local PFLX copy is under `PFLX Overlay/pflx-arena-check/public/assets/archive-icons/`, with the preview at `public/archive-icons.html`. Paths in the runtime manifest resolve from the public root. Use the stable enemy ID to choose a token; these enemies are not mapped onto player Evo levels or studio branches.

## Claude integration

Load the runtime manifest, select a card by enemy ID, and use the size appropriate to the game. Move the whole token for lightweight game motion. Keep detailed Archive artwork for encounters/cinematics. Game stats, boss phases, AI behaviors, encounter difficulty, damage rules and cinematic clips still require implementation. This package adds local assets, not deployed gameplay.

Created with built-in image generation using each existing Archive artwork as identity reference and an Evo game icon as style reference. Do not replace the detailed Archive artwork or use retired exo_import.py for these icons.


## Archive combat progression — 2026-10-03

Read [ARCHIVE-POWER-PROGRESSION.md](ARCHIVE-POWER-PROGRESSION.md) before designing encounters. User-confirmed: Agent Glitch is the strongest existing Archive; Scout is basic, Interceptor is stronger and less frequent (suggested 7:1), Sentry is a recurring larger mini-boss, and Elite is the first main-boss tier. Proposed higher-boss order: Hive → Trojan → Nightmare → Agent Glitch. Strongest combat rank does not identify the Archive creator or hidden operators. Earlier tentative encounter ordering is superseded where inconsistent. The document maps all eight powers/counters, encounter frequency, mission introductions, temporary vs persistent progression and the original action-game synthesis. Combat values are prototype proposals; no gameplay implementation is claimed.
