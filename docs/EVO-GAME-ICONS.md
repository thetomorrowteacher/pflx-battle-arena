# PFLX Evo Game Icons

Static game avatar collection: four studios × five visual tiers = 20 core icons. These tiers display the existing ten-level Evo progression; they do not replace its levels or 196 power cards.

| Tier | Evo levels | Appearance |
| --- | --- | --- |
| 1 | 1–2 | Base companion |
| 2 | 3–4 | Armored companion |
| 3 | 5–6 | Dragon features |
| 4 | 7–9 | Ascended dragon |
| 5 | 10 | Celestial halo and wing accents |

Gentech: teal/brass/cyan. Mindforge: rose/burgundy/gold/pink. eMagination: blue/gold/golden eyes. Innov8: purple/charcoal/cyan/continuous violet visor.

Each token is a front-facing head and small chest silhouette, on a transparent background, with no character animation required. Shared facing is intentional for icon consistency, unlike the varied attack poses in card artwork.

## Files and usage

`originals/` preserves built-in image-generation outputs. `prompts/` records each exact prompt. `icons/` contains normalized transparent PNGs at 512, 256, 128, 64 and 48 pixels. `manifest.json` maps studio, tier and compatible levels to files. `preview.html` displays all tiers and small-size checks.

Use the tier icon as a static player token, with position, scale or CSS effects controlled by the game. Keep branch/power selection in the existing Evo card data; this core collection represents studio and tier, not all 196 branches. Select the catalog entry whose `levels` includes the actual player level; do not divide the level by two, because celestial unlocks only at level 10. Preserve the real level and branch in player state.

Customization such as palettes, accessories, expressions and frames remains a future asset expansion. These are flattened PNGs, not editable accessory layers. Cosmetics should not determine power. Detailed Evo artwork can support a cinematic super move; video cutscenes and their game triggers are not included in this icon collection.

Created with the built-in image generation tool. Original PFLX designs, using simplified collectible game-token proportions. Local assets only; no deployment.

## Branch progression and handoff

`progression.json` records the exact card branch availability: BASE at level 1; A/B/C at levels 2–4; A1/A2/B1/B2/C1/C2 at levels 5–7; those six plus H at levels 8–10. At the level-5 split, A leads to A1/A2, B to B1/B2 and C to C1/C2. H is the shared hybrid introduced at level 8; its gameplay unlock conditions remain for game design.

Forty original SVG badges (ten paths for each studio) identify branches with studio colors, geometric symbols and readable path codes. Place the badge beside or at the corner of the token; keep it separate so players retain the same core icon. The labels for subbranches intentionally preserve their parent name rather than inventing new powers. BASE has no badge.

The local PFLX package includes `assets/evo-icons/progression.json`, `badges/` and `resolve-evo-icon.mjs`. The resolver validates level/studio/branch and returns icon and badge paths while preserving the actual level and branch. The preview offers studio, level and branch selectors. This supplies assets and a resolver for Claude Cowork; live player data, earned unlock enforcement, game screens and cutscene triggers still require integration.


## Claude Evo game switchover — 2026-10-03

See [the current Claude Cowork handoff](<CLAUDE-EVO-GAME-SWITCHOVER.md>) for static icon unlocks, card branch mapping, assets, verified status and remaining game/cinematic integration work. Celestial icons unlock only at level 10; five icon tiers do not replace the ten-level card system.
