#!/usr/bin/env python3
"""
Regenerates the brand assets derived from the client's master logo.

    python3 scripts/make-brand-assets.py

Inputs
    assets-source/logo-primary-original.jpg   the untouched master lockup

Outputs
    public/images/logo-primary.jpg   trimmed lockup used by the nav + footer
    public/images/og-default.jpg     1200x630 social share card
    app/favicon.ico                  16/32/48 tooth mark
    app/icon.png                     256px tooth mark
    app/apple-icon.png               512px tooth mark

Why the trim: the master file carries ~117px of white margin on every side
(17% of its height). Rendered at 62px tall in the nav that leaves only ~41px of
actual artwork, so the logo reads as undersized. This crops to the ink bounding
box plus an even 6% margin, then resizes to 1400px wide (crisp at 3x DPR for the
~190px slot) and re-encodes at quality 90.

After running: update SITE_CONFIG.logo.width/height in site.config.ts if the
output dimensions changed, then
    npm run build:static && npm run preview:offline

Requires: pillow, fonttools, brotli
    pip install pillow fonttools brotli
"""
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFont

SRC = "assets-source/logo-primary-original.jpg"
NAVY = (14, 53, 102)
CYAN = (38, 184, 219)
GREY = (74, 88, 102)

# Kept in step with site.config.ts — update here when the site config changes.
ADDRESS = "13 Cronulla Street, Cronulla NSW 2230"
OPENING = "Opening late November 2026"  # in 'open' mode use "Now taking new patients"
HOOKS = "Open until 7pm Mondays  ·  Early appointments from 7am Fridays"

if not os.path.exists(SRC):
    sys.exit(f"{SRC} not found — put the master logo there first.")

im = Image.open(SRC).convert("RGB")
w, h = im.size
blank = Image.new("RGB", (w, h), (255, 255, 255))
mask = ImageChops.difference(im, blank).convert("L").point(lambda p: 255 if p > 18 else 0)
bbox = mask.getbbox()
print(f"master {w}x{h}, ink bbox {bbox}")

# ---- 1. Trimmed lockup for nav + footer ----------------------------------
pad = round((bbox[3] - bbox[1]) * 0.06)
logo = im.crop((bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad))
target_w = 1400
logo = logo.resize((target_w, round(logo.height * target_w / logo.width)), Image.LANCZOS)
logo.save("public/images/logo-primary.jpg", quality=90, optimize=True, subsampling=0)
print(f"public/images/logo-primary.jpg {logo.size}  ← set SITE_CONFIG.logo.width/height to this")

# ---- 2. Icons from the tooth mark ----------------------------------------
# The mark is the first run of ink; the wordmark starts after the gap.
cols = [mask.crop((x, 0, x + 1, h)).getbbox() is not None for x in range(w)]
mark_end = next(x for x in range(bbox[0], w) if not cols[x])
mark = im.crop((bbox[0], bbox[1], mark_end, bbox[3]))
side = max(mark.size)
square = Image.new("RGB", (side, side), (255, 255, 255))
square.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2))
square = square.resize((512, 512), Image.LANCZOS)
square.save("app/apple-icon.png")
square.resize((256, 256), Image.LANCZOS).save("app/icon.png")
square.resize((16, 16), Image.LANCZOS).save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("app/favicon.ico, app/icon.png, app/apple-icon.png")

# ---- 3. Open Graph card ---------------------------------------------------
def poppins(weight, size):
    """Poppins ships as woff2 for the browser; convert on the fly for Pillow."""
    from fontTools.ttLib import TTFont

    out = f"/tmp/poppins-{weight}.ttf"
    if not os.path.exists(out):
        f = TTFont(f"app/fonts/poppins-latin-{weight}-normal.woff2")
        f.flavor = None
        f.save(out)
    return ImageFont.truetype(out, size)


og = Image.new("RGB", (1200, 630), (255, 255, 255))
d = ImageDraw.Draw(og)
lw = 720
lg = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
og.paste(lg, ((1200 - lw) // 2, 150))


def centre(text, font, y, fill):
    d.text(((1200 - d.textlength(text, font=font)) // 2, y), text, font=font, fill=fill)


centre(ADDRESS, poppins("600", 34), 396, NAVY)
centre(OPENING, poppins("500", 27), 448, CYAN)
centre(HOOKS, poppins("500", 27), 496, GREY)
d.rectangle([(0, 606), (1200, 630)], fill=CYAN)
og.save("public/images/og-default.jpg", quality=90, optimize=True)
print("public/images/og-default.jpg (1200, 630)")
