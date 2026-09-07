# -*- coding: utf-8 -*-
"""Download candidate sheet: Wikimedia Commons search per product slot.
Builds mini contact sheets of top Commons results per query so we can pick correct photos."""
import json, os, re, io, sys, time, urllib.request, urllib.parse, math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
QA = os.path.join(ROOT, '_qa')
os.makedirs(QA, exist_ok=True)
UA = {'User-Agent': 'ModStyleImageQA/1.0 (fashion storefront; contact: dev@local)'}

# import the QUERIES map from _qa_search.py
sys.path.insert(0, ROOT)
import importlib.util
spec = importlib.util.spec_from_file_location('q', os.path.join(ROOT, '_qa_search.py'))

# cannot import (it runs); parse instead
txt = open(os.path.join(ROOT, '_qa_search.py'), encoding='utf-8').read()
m = re.search(r'QUERIES\s*=\s*\{([\s\S]*?)\n\}', txt)
QUERIES = {}
for line in re.finditer(r"'([a-z0-9-]+)':\s*\[([^\]]*)\]", m.group(1)):
    slot = line.group(1)
    qs = re.findall(r"'([^']+)'", line.group(2))
    QUERIES[slot] = qs

def api_search(q, limit=12):
    url = ('https://commons.wikimedia.org/w/api.php?action=query&format=json'
           '&generator=search&gsrsearch=' + urllib.parse.quote('filetype:bitmap ' + q) +
           '&gsrnamespace=6&gsrlimit=%d&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1200' % limit)
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception:
            time.sleep(2 + attempt)
    return {}

def dl(url, timeout=40):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def get_results(q):
    d = api_search(q)
    pages = d.get('query', {}).get('pages', {})
    out = []
    for p in pages.values():
        ii = (p.get('imageinfo') or [{}])[0]
        w, h = ii.get('width', 0), ii.get('height', 0)
        if w < 700 or h < 700:
            continue
        title = p.get('title', '').replace('File:', '')
        out.append({'title': title, 'thumb': ii.get('thumburl'), 'w': w, 'h': h})
    return out

TW, TH, LH, COLS, PER = 210, 280, 40, 6, 18
try:
    font = ImageFont.truetype('arial.ttf', 12)
except Exception:
    font = ImageFont.load_default()

sheet_no = 0
index = {}
slots = list(QUERIES.items())
for slot, qs in slots:
    photos = []
    for q in qs:
        for ph in get_results(q):
            t = ph['title'].lower()
            # skip obvious junk: maps, charts, logos, drawings of buildings
            if any(b in t for b in ['map', 'logo', 'diagram', 'chart', 'coat_of_arms', 'flag', 'plan ', 'drawing', '.svg']):
                continue
            photos.append(ph)
        time.sleep(0.3)
        if len(photos) >= 9:
            break
    photos = photos[:9]
    index[slot] = photos
    # build sheet for this slot
    if not photos:
        continue
    rn = math.ceil(len(photos) / COLS)
    sheet = Image.new('RGB', (COLS * TW, rn * (TH + LH)), 'white')
    dr = ImageDraw.Draw(sheet)
    for i, ph in enumerate(photos):
        cx, cy = (i % COLS) * TW, (i // COLS) * (TH + LH)
        try:
            data = dl(ph['thumb'])
            im = Image.open(io.BytesIO(data)).convert('RGB')
            im.thumbnail((TW, TH))
            sheet.paste(im, (cx + (TW - im.width)//2, cy + (TH - im.height)//2))
        except Exception as e:
            dr.text((cx+4, cy+4), 'ERR', fill='red', font=font)
        label = f'#{i} {ph["title"][:36]}'
        dr.rectangle([cx, cy+TH, cx+TW, cy+TH+LH], fill=(24, 24, 24))
        dr.text((cx+4, cy+TH+3), label, fill='white', font=font)
    sheet_no += 1
    sheet.save(os.path.join(QA, f'cand_{slot}.png'))
    print('sheet', slot, len(photos))
    time.sleep(0.2)

json.dump(index, open(os.path.join(QA, 'commons_index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('DONE slots:', sheet_no)
