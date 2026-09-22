> SUPERSEDED 2026-09-22: the companions are now Evos on the five stage spine. Use `PFLX Apps/Evo Avatars/PRODUCTION-PLAN.md` and `CHATGPT_EVO_INSTRUCTIONS.md` there. Do not run exo_import.py.

# Instructions for ChatGPT: importing EXO card images into PFLX

You are generating EXO companion cards for PFLX Story Mode. This file tells you exactly where each image goes and how to name it so the importer files it without help. Follow it as written. Do not invent new folders, names or sizes.

## 1. The only place you save

Save every finished card to this folder and nowhere else:

```
PFLX Apps/PFLX Overlay/pflx-arena-check/public/assets/exo/_inbox/
```

Do not write into `ironwright/`, `resonant/`, `mythweaver/` or `neonborn/` yourself. The importer does that. Do not edit `manifest.json`.

## 2. How to name each file

Put the card id in the filename. Use the code form:

```
EXO-<studio>-<stage>-<colorway>-<form>.png
```

1. Studio: `GT` Gentech (IRONWRIGHT line), `MF` MindForge (RESONANT), `EM` eMagination (MYTHWEAVER), `IN` Innov8 (NEONBORN).
2. Stage: `1` to `5`. The stage names per line are below; the number is what goes in the filename.
3. Colorway: `DF` default, `PR` prime, and the line's own three: IRONWRIGHT `MG` magma `TI` titan `VD` verdant; RESONANT `AU` aurora `SO` solar `VI` violet; MYTHWEAVER `IG` inkgold `RO` rose `FO` forest; NEONBORN `UV` ultraviolet `AC` acid `CH` chrome.
4. Form: `S` standard, `O` orbcharged.

Examples: `EXO-GT-1-DF-S.png` is the Gentech Cogling master card. `EXO-IN-4-AC-O.png` is Innov8 at Apex (Cipher), Acid colorway, Orbcharged.

If you cannot use the code form, the word form also works: `neonborn cipher acid orbcharged.png`. Words the importer understands: the line name or studio name, the stage name or the word core, frame, vanguard, apex, paragon, the colorway name, and standard or orbcharged.

Stage names, 1 to 5:

| Line | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| IRONWRIGHT | Cogling | Gearframe | Forgeguard | Titanwright | Omniforge |
| RESONANT | Emberling | Pulseframe | Chorusguard | Soulbeacon | Luminarch |
| MYTHWEAVER | Sketchling | Fableframe | Dreamguard | Mythmaker | Worldsmith |
| NEONBORN | Bitling | Glitchframe | Neonguard | Cipher | Singularity |

## 3. Image requirements

1. Portrait, 2:3. Generate at 1024 by 1536 if you can. Any size is accepted; the importer cover-fits and crops to 1024 by 1536, so keep the creature centered and away from the top left corner and the bottom fifth.
2. PNG preferred. JPG and WebP are accepted.
3. No text, no logo, no border, no frame, no watermark in the image. The PFLX card frame is added by the app.
4. One card per file. Never a contact sheet or a grid.

## 4. After you save

If you can run commands, run this from the `exo` folder:

```
python3 exo_import.py
```

It moves each inbox file into its line folder as `<stage>-<colorway>-<form>.png`, makes a thumbnail, rebuilds `manifest.json`, and moves your original into `_inbox/done/`. It prints one line per file. If it prints `SKIPPED`, the filename did not carry a readable card id: rename the file and run it again.

If you cannot run commands, leave the files in `_inbox/` and stop. Claude or Ennis will run the importer.

## 5. Keep a log

Append one line per card to `_inbox/LOG.md` in this format:

```
EXO-GT-1-DF-S | 2026-09-22 | master card, approved reference for the IRONWRIGHT line
```

When a card replaces an earlier one with the same id, say so on its line. The importer overwrites the file; the log is the only record of why.

## 6. Order of work

1. The four masters first: `EXO-GT-1-DF-S`, `EXO-MF-1-DF-S`, `EXO-EM-1-DF-S`, `EXO-IN-1-DF-S`. Stop after these four and wait for approval before generating anything else, because every later card of a line uses its master as the reference image.
2. Then the four Apex cards, stage 4, default, standard.
3. Then the remaining stages, then colorways, then Orbcharged last.

The full prompt kit is `EXO-Character-Design-Prompting-Guide.md` in the `exo` folder. Use its base prompt unchanged on every card.

## 7. Things you must not do

1. Do not rename, move or delete anything outside `_inbox/`.
2. Do not create new colorways, stages or line names. If a request needs one, write it in `LOG.md` as an open question instead.
3. Do not touch `preview.html`, `index.html` or any code file. Art only.
4. Do not save into `Claude outputs/` or `_screenshots/`. Those are not asset folders.