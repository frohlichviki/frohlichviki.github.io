#!/usr/bin/env python3
"""
add-image-dimensions.py

Reads the real pixel dimensions of every gallery image referenced in art.html
and injects width="..." height="..." into each <img> tag. This lets the browser
reserve the correct space before an image loads, which makes loading="lazy" work
properly (only images near the viewport download) and stops layout jumps.

HOW TO USE (one time):
  1. Put this file in the SAME folder as art.html (your site root).
  2. Make sure your images are in place: images/photo, images/astro,
     images/draw, images/travel — with the exact filenames the site uses.
  3. Install Pillow if you don't have it:   pip3 install pillow
  4. Run:                                    python3 add-image-dimensions.py
  5. It rewrites art.html in place (a backup art.html.bak is saved first).

Safe to re-run: if a tag already has width/height, it's updated, not duplicated.
"""

import os
import re
import sys
import shutil
import urllib.parse

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip3 install pillow   then try again.")

ART = "art.html"
if not os.path.exists(ART):
    sys.exit(f"Can't find {ART}. Put this script in the same folder as art.html.")

html = open(ART, encoding="utf-8").read()
shutil.copy(ART, ART + ".bak")

# Match <img ... src="images/.../file" ...> tags
img_tag_re = re.compile(r'<img\b[^>]*\bsrc="(images/[^"]+)"[^>]*>', re.IGNORECASE)

updated = 0
missing = []

def process(match):
    global updated
    tag = match.group(0)
    src_enc = match.group(1)
    # decode %20 etc. to find the real file on disk
    src_path = urllib.parse.unquote(src_enc)
    if not os.path.exists(src_path):
        missing.append(src_path)
        return tag  # leave tag unchanged
    try:
        with Image.open(src_path) as im:
            w, h = im.size
    except Exception as e:
        missing.append(src_path + f"  (couldn't read: {e})")
        return tag

    # remove any existing width/height attributes, then add fresh ones
    new_tag = re.sub(r'\s+(width|height)="[^"]*"', '', tag)
    # insert width/height right after <img
    new_tag = re.sub(r'^<img\b', f'<img width="{w}" height="{h}"', new_tag)
    updated += 1
    return new_tag

new_html = img_tag_re.sub(process, html)
open(ART, "w", encoding="utf-8").write(new_html)

print(f"Done. Updated {updated} <img> tags with real dimensions.")
print(f"Backup saved as {ART}.bak")
if missing:
    print(f"\n{len(missing)} image(s) not found on disk (tags left unchanged):")
    for m in missing:
        print("   ", m)
    print("Check these filenames match exactly (case + extension), then re-run.")
