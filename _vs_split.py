"""Merge each product's candidate sheet (split into halves, max ~14 tiles each)
so vision analysis stays reliable. Output: _vs/<slug>__<part>.jpg
"""
import os
from PIL import Image, ImageDraw, ImageFont

font = ImageFont.truetype("arial.ttf", 15)
os.makedirs("_vs", exist_ok=True)
for f in sorted(os.listdir("_sheets")):
    slug = f[:-4]
    im = Image.open(f"_sheets/{f}")
    W, H = im.size
    TH_H = 280  # tile height + label row (260+20)
    rows_total = -(-H // TH_H)
    half = -(-rows_total // 2)
    for part, (r0, r1) in enumerate([(0, half), (half, rows_total)]):
        if r0 >= rows_total:
            continue
        crop = im.crop((0, r0 * TH_H, W, min(r1 * TH_H, H)))
        crop.save(f"_vs/{slug}__{part+1}.jpg", quality=82)
        print(f"_vs/{slug}__{part+1}.jpg", crop.size)
