#!/usr/bin/env python3
"""EXO art importer. Drop ChatGPT images into _inbox/ with the card id somewhere in the
filename (EXO-GT-3-HK-O, or words: ironwright vanguard acid orbcharged), run this, and each
file lands at <line>/<stage>-<colorway>-<form>.png at 1024x1536 with a 256px thumb, and
manifest.json is rebuilt. Safe to run any time; nothing is deleted, handled inbox files are
moved to _inbox/done/.  Usage: python3 exo_import.py"""
import json, os, re, shutil, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
LINES = {'GT': 'ironwright', 'MF': 'resonant', 'EM': 'mythweaver', 'IN': 'neonborn'}
LINE_WORDS = {'ironwright': 'ironwright', 'gentech': 'ironwright', 'cogling': 'ironwright',
              'resonant': 'resonant', 'mindforge': 'resonant', 'emberling': 'resonant',
              'mythweaver': 'mythweaver', 'emagination': 'mythweaver', 'sketchling': 'mythweaver',
              'neonborn': 'neonborn', 'innov8': 'neonborn', 'bitling': 'neonborn'}
STAGE_WORDS = {'core': 1, 'frame': 2, 'vanguard': 3, 'apex': 4, 'paragon': 5,
               'cogling': 1, 'gearframe': 2, 'forgeguard': 3, 'titanwright': 4, 'omniforge': 5,
               'emberling': 1, 'pulseframe': 2, 'chorusguard': 3, 'soulbeacon': 4, 'luminarch': 5,
               'sketchling': 1, 'fableframe': 2, 'dreamguard': 3, 'mythmaker': 4, 'worldsmith': 5,
               'bitling': 1, 'glitchframe': 2, 'neonguard': 3, 'cipher': 4, 'singularity': 5}
COLORWAYS = {'ironwright': ['default', 'magma', 'titan', 'verdant', 'prime'],
             'resonant': ['default', 'aurora', 'solar', 'violet', 'prime'],
             'mythweaver': ['default', 'inkgold', 'rose', 'forest', 'prime'],
             'neonborn': ['default', 'ultraviolet', 'acid', 'chrome', 'prime']}
CW_CODES = {'DF': 'default', 'PR': 'prime', 'MG': 'magma', 'TI': 'titan', 'VD': 'verdant', 'AU': 'aurora', 'SO': 'solar',
            'VI': 'violet', 'IG': 'inkgold', 'RO': 'rose', 'FO': 'forest', 'UV': 'ultraviolet', 'AC': 'acid', 'CH': 'chrome',
            # aura codes from the first prompt kit map onto colorways so old filenames still land
            'GD': 'default', 'PW': 'magma', 'SP': 'solar', 'HK': 'acid', 'LK': 'inkgold'}
FORM_WORDS = {'standard': 'standard', 's': 'standard', 'orbcharged': 'orbcharged', 'o': 'orbcharged', 'charged': 'orbcharged'}
W, H, THUMB = 1024, 1536, 256

def parse(name):
    n = name.lower()
    m = re.search(r'exo[-_ ]?(gt|mf|em|in)[-_ ]?([1-5])[-_ ]?([a-z]{2})[-_ ]?([so])\b', n)
    if m:
        line = LINES[m.group(1).upper()]
        cw = CW_CODES.get(m.group(3).upper(), 'default')
        return line, int(m.group(2)), cw if cw in COLORWAYS[line] else 'default', FORM_WORDS[m.group(4)]
    words = re.findall(r'[a-z0-9]+', n)
    line = next((LINE_WORDS[w] for w in words if w in LINE_WORDS), None)
    stage = next((STAGE_WORDS[w] for w in words if w in STAGE_WORDS), None)
    if stage is None:
        s = re.search(r'(?:stage|st|s)[-_ ]?([1-5])\b', n); stage = int(s.group(1)) if s else None
    form = next((FORM_WORDS[w] for w in words if w in FORM_WORDS and len(w) > 1), 'standard')
    cw = next((w for w in words if line and w in COLORWAYS[line]), 'default')
    if line and stage: return line, stage, cw, form
    return None

def place(src, line, stage, cw, form):
    dest_dir = os.path.join(HERE, line); os.makedirs(dest_dir, exist_ok=True)
    base = f'{stage}-{cw}-{form}'
    im = Image.open(src).convert('RGBA')
    # cover-fit to 2:3, then resize
    r = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    im = im.crop((x, y, x + W, y + H))
    im.convert('RGB').save(os.path.join(dest_dir, base + '.png'), optimize=True)
    t = im.copy(); t.thumbnail((THUMB, THUMB * 3 // 2), Image.LANCZOS)
    t.convert('RGB').save(os.path.join(dest_dir, base + '.thumb.jpg'), quality=82)
    return f'{line}/{base}.png'

def manifest():
    cards = {}
    for line in COLORWAYS:
        d = os.path.join(HERE, line)
        if not os.path.isdir(d): continue
        for f in sorted(os.listdir(d)):
            m = re.match(r'([1-5])-([a-z]+)-(standard|orbcharged)\.png$', f)
            if m:
                key = f'{line}/{m.group(1)}/{m.group(2)}/{m.group(3)}'
                cards[key] = {'line': line, 'stage': int(m.group(1)), 'colorway': m.group(2), 'form': m.group(3),
                              'src': f'assets/exo/{line}/{f}', 'thumb': f'assets/exo/{line}/{f[:-4]}.thumb.jpg'}
    out = {'version': 1, 'size': [W, H], 'count': len(cards), 'cards': cards}
    json.dump(out, open(os.path.join(HERE, 'manifest.json'), 'w'), indent=1)
    return len(cards)

def main():
    inbox = os.path.join(HERE, '_inbox'); done = os.path.join(inbox, 'done'); os.makedirs(done, exist_ok=True)
    placed, skipped = [], []
    for f in sorted(os.listdir(inbox)):
        p = os.path.join(inbox, f)
        if not os.path.isfile(p) or not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
        parsed = parse(f)
        if not parsed: skipped.append(f); continue
        rel = place(p, *parsed); placed.append((f, rel))
        shutil.move(p, os.path.join(done, f))
    n = manifest()
    for f, rel in placed: print('placed ', f, '->', rel)
    for f in skipped: print('SKIPPED (could not read the card id from the name):', f)
    print(f'manifest.json: {n} cards')

if __name__ == '__main__': main()
