> SUPERSEDED 2026-09-22: the companions are now Evos on the five stage spine. Use `PFLX Apps/Evo Avatars/PRODUCTION-PLAN.md` and `CHATGPT_EVO_INSTRUCTIONS.md` there. Do not run exo_import.py.

# EXO art handoff (for ChatGPT, Claude, or anyone dropping images)

Save every generated EXO card into `_inbox/` in this folder. Put the card id in the filename.
Either form works:

1. Code form: `EXO-GT-3-AC-O.png` (studio GT MF EM IN, stage 1 to 5, colorway code, form S or O).
2. Word form: `ironwright vanguard acid orbcharged.png`, or the stage name: `forgeguard acid.png`.

Lines and studios: ironwright = Gentech, resonant = MindForge, mythweaver = eMagination, neonborn = Innov8.
Stage names, 1 to 5:
- ironwright: Cogling, Gearframe, Forgeguard, Titanwright, Omniforge
- resonant: Emberling, Pulseframe, Chorusguard, Soulbeacon, Luminarch
- mythweaver: Sketchling, Fableframe, Dreamguard, Mythmaker, Worldsmith
- neonborn: Bitling, Glitchframe, Neonguard, Cipher, Singularity
Colorways: ironwright default magma titan verdant prime; resonant default aurora solar violet prime;
mythweaver default inkgold rose forest prime; neonborn default ultraviolet acid chrome prime.
Forms: standard, orbcharged.

Then run `python3 exo_import.py` here. It cover-fits each image to 1024x1536, writes it to
`<line>/<stage>-<colorway>-<form>.png` plus a 256px thumb, rebuilds `manifest.json`, and moves the
inbox file to `_inbox/done/`. Files it cannot name are left in `_inbox/` and listed.

`manifest.json` is what the Battle Arena EXO Bay and X-Live will read to show real art instead of
the procedural SVG. Until that renderer patch lands, the files sit here ready and nothing else changes.