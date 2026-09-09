"""Fetch crossbody-mini-bag thumbs in parallel (was partially downloaded)."""
import json, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "Mozilla/5.0 ModStyleQA/1.0", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch(url):
    if not url:
        return None
    for k in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % 2].open(req, timeout=25) as r:
                return r.read()
        except Exception:
            time.sleep(0.6)
    return None

cands = json.load(open('_cands/crossbody-mini-bag.json', encoding='utf-8'))
os.makedirs('_thumbs/crossbody-mini-bag', exist_ok=True)

def get(t):
    i, c = t
    tp = f'_thumbs/crossbody-mini-bag/{i}.jpg'
    if os.path.exists(tp):
        return True
    d = fetch(c.get('thumb')) or fetch(c.get('url'))
    if not d:
        return False
    open(tp, 'wb').write(d)
    try:
        Image.open(tp).verify()
        return True
    except Exception:
        try:
            os.remove(tp)
        except OSError:
            pass
        return False

with ThreadPoolExecutor(max_workers=10) as ex:
    res = list(ex.map(get, enumerate(cands)))
print('downloaded', sum(res), '/', len(cands))

# Build sheet
from PIL import ImageDraw, ImageFont
font = ImageFont.truetype("arial.ttf", 13)
TH_W, TH_H, COLS = 200, 260, 5
tiles = []
for i in sorted(range(len(cands))):
    tp = f'_thumbs/crossbody-mini-bag/{i}.jpg'
    if os.path.exists(tp):
        try:
            im = Image.open(tp).convert('RGB')
            im.thumbnail((TH_W, TH_H))
            tiles.append((i, im))
        except Exception:
            pass
rows = -(-len(tiles) // COLS)
sheet = Image.new('RGB', (COLS * TH_W, rows * (TH_H + 20)), 'white')
dr = ImageDraw.Draw(sheet)
for j, (i, im) in enumerate(tiles):
    x = (j % COLS) * TH_W
    y = (j // COLS) * (TH_H + 20)
    sheet.paste(im, (x + (TH_W - im.width) // 2, y + (TH_H - im.height) // 2))
    dr.text((x + 6, y + TH_H + 2), f'#{i}', fill='black', font=font)
sheet.save('_vs4/cross_full.jpg', quality=82)
print('sheet', sheet.size)
