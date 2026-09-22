# EXO Character Design: ChatGPT Image Prompting Guide

For the four Startup Studio EXO companions in PFLX Story Mode, drawn in the X-Gem card style. Use this with ChatGPT image generation. Copy blocks as written, swap the bracketed parts, and keep the order: Style, then Subject, then Stage, then Colorway, then Form, then Output.

The X-Gem cards (CharacterForge, ClientCall, ThinkTable, ProtoDev) are the style anchor. Everything here is written to sit in that grid without looking like a different game.

---

## 1. Read the X-Gem style first

Before writing a prompt, this is what the four X-Gem cards actually do. Every EXO card should match all seven points.

1. Medium: high energy anime mecha illustration. Clean confident line art, saturated cel shading with two or three tone steps, hard rim light on the armor edges.
2. Color: one dominant key color per card with one accent. CharacterForge is orange gold, ClientCall is magenta violet, ThinkTable is gold with blue, ProtoDev is blue with orange. The key color fills roughly 70 percent of the card.
3. Camera: low angle, slightly below the chest, so the character towers. Three quarter view, never flat front.
4. Pose: mid action. A reach toward the viewer, a stride, a turn. Weight on one side. Nothing standing still.
5. Background: an abstract sci-fi arena made of light rings, holographic grids, floating panels and particle sparks. It reads as depth, not as a location.
6. Framing: the character fills the card, head near the top edge, the body cut just below the hips or knees. Portrait, 2:3.
7. Nothing else: no text, no logos, no borders, no frame, no watermark. The PFLX UI adds the frame, the STEP hex, the heart, the strand chip and the name plate. Art that carries its own frame breaks the grid.

---

## 2. The base prompt

Paste this first in every request. Do not shorten it. The consistency across 200 cards comes from this block staying identical.

```
Trading card portrait illustration, vertical 2:3, in the style of a high energy anime mecha collectible card: bold clean line art, saturated cel shading with hard rim light, dramatic low camera angle, three quarter view, dynamic mid action pose, particle sparks, one dominant key color with one accent color filling most of the image.

The subject is an EXO, a companion creature the size of a large dog: a feline and dragon hybrid with digital monster pet energy, part organic and part armored tech. It has a cat's face, ears and posture, dragon horns, a long expressive tail, small wings, and visible glowing energy orb sockets set into the chest and shoulders.

Background: an abstract sci-fi arena of glowing light rings, holographic grids, floating panels and drifting sparks, blurred for depth, no location, no ground plane detail.

No text, no letters, no logo, no watermark, no border, no frame, no card template. Leave the top left corner and the bottom fifth of the image uncluttered.
```

---

## 3. The four EXOs

One block per Studio. Paste the whole block after the base prompt. The line names and the five stage names are the ones already shipped in the Battle Arena EXO Bay, so the art matches what the code already calls the creature at each stage.

### Gentech Studios: IRONWRIGHT line (Cogling, Gearframe, Forgeguard, Titanwright, Omniforge)

```
This EXO is of the IRONWRIGHT line, the Gentech Studios companion. Brass plated lynx-dragon with tufted ears, an exposed gear spine of interlocking cogs running down the back, a wrench tipped tail, hexagonal armor plates on the shoulders and forelegs, welding glow at every joint, steel claws. Key color teal, accent brass, secondary gunmetal. Expression: focused, engineer's confidence.
```

### MindForge Studios: RESONANT line (Emberling, Pulseframe, Chorusguard, Soulbeacon, Luminarch)

```
This EXO is of the RESONANT line, the MindForge Studios companion. Caracal-dragon in ember red and obsidian, long black ear tufts, a circular drum plate set into the chest that pulses with visible sound rings, tribal circuit markings in warm gold running along the legs and tail, a mane of ember light. Key color ember red, accent warm gold, secondary obsidian black. Expression: proud, grounded, hears everything.
```

### eMagination Studios: MYTHWEAVER line (Sketchling, Fableframe, Dreamguard, Mythmaker, Worldsmith)

```
This EXO is of the MYTHWEAVER line, the eMagination Studios companion. Feathered feline-dragon in ink blue and violet, quill shaped horns, wings made of floating glowing story glyphs and star dust, a tail that trails ink ribbons, star gold eyes. Key color violet, accent star gold, secondary ink blue. Expression: curious, playful, half smiling.
```

### Innov8 Studios: NEONBORN line (Bitling, Glitchframe, Neonguard, Cipher, Singularity)

```
This EXO is of the NEONBORN line, the Innov8 Studios companion. Panther-dragon in matte black with holographic magenta and cyan edge lighting, a single visor band instead of eyes, angular plated limbs, a chromatic glitch trail behind the tail where the body breaks into pixel fragments, neon noir cyberpunk finish. Key color magenta, accent cyan, secondary matte black. Expression: sharp, fast, unreadable.
```

---

## 4. Stage modifiers

The five stages are the shipped EXO ladder: Core, Frame, Vanguard, Apex, Paragon, unlocked at 0, 500, 2,500, 8,000 and 20,000 Sync XP. Each line has its own name per stage (listed in section 3), so name the stage in the prompt with both words, for example `STAGE 3 VANGUARD, this form is called Forgeguard`. Paste one. The body shape changes here; the color does not.

```
STAGE 1 CORE: cub proportions, oversized head and paws, stubby wings, two orb sockets on the chest, thin bare plating, small horns just budding.
```

```
STAGE 2 FRAME: adolescent, longer limbs, wings open but small, four orb sockets, first armor plates on the shoulders and forehead, horns grown in.
```

```
STAGE 3 VANGUARD: full adult, complete wingspan, six orb sockets, layered armor across chest and legs, energy claws, tail fully armored.
```

```
STAGE 4 APEX: heroic scale, ornate armor engraved with the Studio sigil pattern, eight orb sockets, a mane or crest of light, the arena lights bend toward it.
```

```
STAGE 5 PARAGON: mythic, floating armor pieces orbiting the body, ten orb sockets, a halo ring behind the head, the arena behind it warps around the creature, wings become pure light.
```

---

## 5. Colorway modifiers

The Arena already ships four colorways per line, and Players pick them in the EXO Bay. Prime is the fifth, new for the card set: the Studio signature look, reserved for Vault pulls. Paste one. A colorway changes the key and accent colors and the glow. It never changes the body.

```
IRONWRIGHT colorways:
DEFAULT Foundry: key teal #06b6d4, deep #155e75, glow #67e8f9.
MAGMA: key orange #f97316, deep #7c2d12, glow #fdba74, heat shimmer.
TITAN: key steel #94a3b8, deep #334155, glow #e2e8f0, brushed metal.
VERDANT: key green #22c55e, deep #14532d, glow #86efac.
PRIME: teal body with full brass armor and gold welding light.
```

```
RESONANT colorways:
DEFAULT Pulse: key rose #f43f5e, deep #881337, glow #fda4af.
AURORA: key teal #2dd4bf, deep #134e4a, glow #99f6e4.
SOLAR: key amber #f59e0b, deep #78350f, glow #fcd34d.
VIOLET: key violet #a78bfa, deep #4c1d95, glow #ddd6fe.
PRIME: ember red body with obsidian plates and warm gold glyphs at full brightness.
```

```
MYTHWEAVER colorways:
DEFAULT Fable: key blue #2563eb, deep #1e3a8a, glow #93c5fd.
INKGOLD: key gold #eab308, deep #713f12, glow #fde047.
ROSE: key pink #ec4899, deep #831843, glow #f9a8d4.
FOREST: key green #10b981, deep #064e3b, glow #6ee7b7.
PRIME: violet body, star gold wings, ink blue shadows.
```

```
NEONBORN colorways:
DEFAULT Neon: key purple #9333ea, deep #3b0764, glow #d8b4fe.
ULTRAVIOLET: key #7c3aed, deep #2e1065, glow #c4b5fd.
ACID: key lime #84cc16, deep #365314, glow #d9f99d, code fragments in the glow.
CHROME: key crimson #e11d48, deep #4c0519, glow #fecdd3, mirror chrome plating.
PRIME: matte black body, magenta and cyan edge light at full intensity.
```

---

## 6. Form modifiers

Two forms. Orbcharged is the temporary form a Player lights by filling the orb bar, so it should look like the same card turned up to maximum.

```
STANDARD FORM: orb sockets half lit, calm ready stance, one paw forward.
```

```
ORBCHARGED FORM: every orb socket fully lit and overflowing, streams of energy pouring out of the sockets, mid leap toward the viewer, maximum intensity, sparks everywhere.
```

---

## 7. Output block

Paste last.

```
Output a single image, vertical portrait, 1024 by 1536 pixels, sharp focus on the creature, no text of any kind.
```

---

## 8. Assembling a full prompt

Order: Base, Studio, Stage, Colorway, Form, Output. Here is the IRONWRIGHT line at Vanguard (Forgeguard) in the Acid colorway, Orbcharged, which is card `EXO-GT-3-AC-O`.

```
Trading card portrait illustration, vertical 2:3, in the style of a high energy anime mecha collectible card: bold clean line art, saturated cel shading with hard rim light, dramatic low camera angle, three quarter view, dynamic mid action pose, particle sparks, one dominant key color with one accent color filling most of the image.

The subject is an EXO, a companion creature the size of a large dog: a feline and dragon hybrid with digital monster pet energy, part organic and part armored tech. It has a cat's face, ears and posture, dragon horns, a long expressive tail, small wings, and visible glowing energy orb sockets set into the chest and shoulders.

Background: an abstract sci-fi arena of glowing light rings, holographic grids, floating panels and drifting sparks, blurred for depth, no location, no ground plane detail.

No text, no letters, no logo, no watermark, no border, no frame, no card template. Leave the top left corner and the bottom fifth of the image uncluttered.

This EXO is of the IRONWRIGHT line, the Gentech Studios companion. Brass plated lynx-dragon with tufted ears, an exposed gear spine of interlocking cogs running down the back, a wrench tipped tail, hexagonal armor plates on the shoulders and forelegs, welding glow at every joint, steel claws. Key color teal, accent brass, secondary gunmetal. Expression: focused, engineer's confidence.

STAGE 3 VANGUARD, this form is called Forgeguard: full adult, complete wingspan, six orb sockets, layered armor across chest and legs, energy claws, tail fully armored.

ACID colorway: key lime #84cc16, deep #365314, glow #d9f99d, code fragments in the glow.

ORBCHARGED FORM: every orb socket fully lit and overflowing, streams of energy pouring out of the sockets, mid leap toward the viewer, maximum intensity, sparks everywhere.

Output a single image, vertical portrait, 1024 by 1536 pixels, sharp focus on the creature, no text of any kind.
```

---

## 9. Keeping one character across 50 cards

ChatGPT will drift if you only use words. This is the workflow that holds the design together.

1. Generate the Core Standard card for each line first, in the Default colorway. Regenerate until you love it. That image is the master reference for that EXO.
2. For every other card of that EXO, attach the master reference image and open the prompt with this line before the base block: `Use the attached image as the exact character reference. Keep the same creature: same face, same ear shape, same horn shape, same markings, same key and accent colors. Change only what the stage, colorway and form lines below describe.`
3. Once you have an Apex card you like, use it as the reference for Paragon, since Paragon is Apex pushed further.
4. Change one axis at a time. Stage first across the five stages in Default colorway and Standard form. Then colorways at one stage. Then Orbcharged last, since it is the same card with lit sockets.
5. If a result drifts, do not re-prompt from scratch. Reply with: `Same image, same character, fix only: [what drifted].` ChatGPT holds the composition better on an edit than on a fresh run.
6. Keep the pose vocabulary small. Four poses cover the whole set: reach toward the viewer, prowl in three quarter view, leap toward the viewer, rear up with wings open. Name the pose in the prompt when a run keeps choosing something else.

---

## 10. Things to say no to

Add any of these lines when a run goes wrong.

1. Text showing up: `Absolutely no text, letters, numbers, glyph strings that look like writing, or UI elements.`
2. It drew a frame: `No card border, no frame, no rounded rectangle edge. The art runs to every edge of the image.`
3. Too human: `This is a four legged animal companion, not a humanoid, not a mech suit with a pilot.`
4. Too cute or too monstrous: `Keep it a pet you would want on your team: friendly eyes, strong body, tech armor, no fangs bared, no gore.`
5. Wrong colors: `Key color is [teal]. It must cover most of the creature and the light. Accent [brass] only on edges and details.`
6. Copyright drift: `An original design. Not any existing Pokemon, Digimon or named creature.`

---

## 11. Naming, files and the card frame

1. Card id: `EXO-<studio>-<stage>-<colorway>-<form>`. Studio codes GT, MF, EM, IN. Stage 1 to 5. Colorway codes DF default, PR prime, MG magma, TI titan, VD verdant, AU aurora, SO solar, VI violet, IG inkgold, RO rose, FO forest, UV ultraviolet, AC acid, CH chrome. Form S or O. Example: `EXO-IN-4-AC-O` is the NEONBORN line at Apex (Cipher), Acid colorway, Orbcharged.
2. Where to save: `PFLX Apps/PFLX Overlay/pflx-arena-check/public/assets/exo/_inbox/` with the card id anywhere in the filename. Word form also works: `neonborn cipher acid orbcharged.png`. Then run `python3 exo_import.py` in the `exo` folder. It cover-fits to 1024 by 1536, files the card at `<line>/<stage>-<colorway>-<form>.png` with a thumb, and rebuilds `manifest.json`. The handoff note `EXO_ART_HANDOFF.md` in that folder says the same thing for ChatGPT.
3. The card frame in PFLX crops the top fifth for the STAGE hex and the bottom fifth for the name plate, which is why the base prompt keeps those areas quiet.
4. Frame metal by stage is added by the UI, not the art: Core steel, Frame bronze, Vanguard silver, Apex gold, Paragon prismatic. Never ask ChatGPT for the frame.
5. The detail sheet reads: stage name, then EXO UNIT · <STUDIO> STUDIOS, then two chips LINE · <LINE> and STAGE <n> · <NAME>, then the one line blurb from season.json. The art only needs to look right behind those.

---

## 12. Batch order

Fifty cards per EXO, two hundred total. This order gets a playable set in the first session and the full deck without redoing work.

| Session | Cards | Why first |
| --- | --- | --- |
| 1 | 4 Core Standard Default (the masters: Cogling, Emberling, Sketchling, Bitling) | Every Player starts here |
| 2 | 4 Apex Standard Default (Titanwright, Soulbeacon, Mythmaker, Cipher) | The reward card people chase |
| 3 | 12 remaining stages, Standard Default (Frame, Vanguard, Paragon for each) | Full ladder |
| 4 | 16 colorways at Core (the four non default colorways per line) | Vault pulls have something to give |
| 5 | 64 remaining Standard colorway cards | Complete Standard set |
| 6 | 100 Orbcharged cards from their Standard twins | Same card, lit sockets, fastest batch |

---

## 13. Lore lines for the card blurbs

One sentence per line, already in season.json, here so the art and the words match.

1. IRONWRIGHT: Runs the Ring's outer shell and carries stray orbs home to the Gems.
2. RESONANT: Hears the Ring's pulse and answers it; orbs gather where it drums.
3. MYTHWEAVER: Weaves loose story threads into orbs; the Gems read what it brings back.
4. NEONBORN: Phases through the grid faster than the Archive can trace it.

The shared line for all four: the X-Gems are the minds, the EXOs are their pets, and every orb an EXO brings home is one more charge for the Gem that guides the Player.
