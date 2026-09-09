# -*- coding: utf-8 -*-
"""Build labeled contact sheets of ALL product images for visual audit."""
import os, sys
from PIL import Image, ImageDraw, ImageFont

SRC = r"D:\A_Footages\alpha-shop\Front\public\images\products"
OUT = r"D:\A_Footages\alpha-shop\_audit_sheets"
os.makedirs(OUT, exist_ok=True)

files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(('.jpg', '.png', '.webp')))
sec = os.path.join(SRC, 'secondary')
sec_files = sorted(f for f in os.listdir(sec) if f.lower().endswith(('.jpg', '.png'))) if os.path.isdir(sec) else []

COLS, TH_W, TH_H, LABEL_H = 6, 300, 380, 26
PER_SHEET = 24

def sheet(paths_labels, out_path):
    rows = (len(paths_labels) + COLS - 1) // COLS
    W, H = COLS * TH_W, rows * (TH_H + LABEL_H)
    canvas = Image.new('RGB', (W, H), (24, 24, 24))
    d = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("arial.ttf", 15)
    except Exception:
        font = ImageFont.load_default()
    for i, (p, label) in enumerate(paths_labels):
        r, c = divmod(i, COLS)
        x0, y0 = c * TH_W, r * (TH_H + LABEL_H)
        try:
            im = Image.open(p).convert('RGB')
            im.thumbnail((TH_W - 8, TH_H - 8))
            ox = x0 + (TH_W - im.width) // 2
            oy = y0 + (TH_H - im.height) // 2
            canvas.paste(im, (ox, oy))
        except Exception as e:
            d.text((x0 + 8, y0 + TH_H // 2), "ERR: %s" % e, fill=(255, 80, 80), font=font)
        d.text((x0 + 6, y0 + TH_H + 4), label, fill=(255, 255, 0), font=font)
    canvas.save(out_path)
    print("wrote", out_path, len(paths_labels), "tiles")

# sheet 1..N: main product files
batches = [files[i:i + PER_SHEET] for i in range(0, len(files), PER_SHEET)]
for bi, batch in enumerate(batches, 1):
    items = [(os.path.join(SRC, f), f) for f in batch]
    sheet(items, os.path.join(OUT, "sheet_%02d.png" % bi))

# extra sheet: secondary/gen files
if sec_files:
    items = [(os.path.join(sec, f), "secondary/" + f) for f in sec_files]
    sheet(items, os.path.join(OUT, "sheet_secondary.png"))

# dimension report
print("\n=== DIMENSIONS ===")
for f in files:
    p = os.path.join(SRC, f)
    try:
        with Image.open(p) as im:
            print(f, im.size, os.path.getsize(p))
    except Exception as e:
        print(f, "UNREADABLE", e)
for f in sec_files:
    p = os.path.join(sec, f)
    try:
        with Image.open(p) as im:
            print("secondary/" + f, im.size, os.path.getsize(p))
    except Exception as e:
        print("secondary/" + f, "UNREADABLE", e)
print("TOTAL main:", len(files), "secondary:", len(sec_files))
