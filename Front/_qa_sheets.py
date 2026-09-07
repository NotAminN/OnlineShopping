# -*- coding: utf-8 -*-
"""Build labeled contact sheets (6-col grid) of all product images."""
import json, os, math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(ROOT, 'public', 'images', 'products')
OUT = os.path.join(ROOT, '_qa')
os.makedirs(OUT, exist_ok=True)

rows = json.load(open(os.path.join(OUT, 'inventory.json'), encoding='utf-8'))

TW, TH, LABEL_H = 210, 280, 26
COLS = 6
PER_SHEET = 24

try:
    font = ImageFont.truetype('arial.ttf', 13)
except Exception:
    font = ImageFont.load_default()

items = [r for r in rows if r['status'] == 'OK']
sheets = math.ceil(len(items) / PER_SHEET)
for s in range(sheets):
    chunk = items[s*PER_SHEET:(s+1)*PER_SHEET]
    rowsn = math.ceil(len(chunk) / COLS)
    W = COLS * TW
    H = rowsn * (TH + LABEL_H)
    sheet = Image.new('RGB', (W, H), 'white')
    dr = ImageDraw.Draw(sheet)
    for i, r in enumerate(chunk):
        cx, cy = (i % COLS) * TW, (i // COLS) * (TH + LABEL_H)
        fpath = os.path.join(PROD, r['file'])
        try:
            im = Image.open(fpath).convert('RGB')
            im.thumbnail((TW, TH))
            sheet.paste(im, (cx + (TW - im.width)//2, cy + (TH - im.height)//2))
        except Exception:
            pass
        label = f"{r['slug']}{'.jpg' == r['file'][-4:] and '' or ' [2]'}"
        dr.rectangle([cx, cy+TH, cx+TW, cy+TH+LABEL_H], fill=(24, 24, 24))
        dr.text((cx+4, cy+TH+5), label[:34], fill='white', font=font)
    outp = os.path.join(OUT, f'sheet_{s+1:02d}.png')
    sheet.save(outp)
    print('saved', outp, f'({len(chunk)} imgs)')
print('sheets:', sheets)
