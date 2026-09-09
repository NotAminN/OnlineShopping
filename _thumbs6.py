"""Thumbs+sheet for _cands6/slide-sandals (47) -> _vs6. Also re-check quilted-vest-men via Commons once more."""
import json, os, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0 (image audit)", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch(url):
    if not url:
        return None
    for k in range(2):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % 2].open(req, timeout=20) as r:
                return r.read()
        except Exception:
            time.sleep(0.5)
    return None

cands = json.load(open("_cands6/slide-sandals.json", encoding="utf-8"))
os.makedirs("_thumbs6/slide-sandals", exist_ok=True)
os.makedirs("_vs6", exist_ok=True)

def get(t):
    i, c = t
    tp = f"_thumbs6/slide-sandals/{i}.jpg"
    if os.path.exists(tp):
        return True
    d = fetch(c.get("thumb")) or fetch(c.get("url"))
    if not d:
        return False
    open(tp, "wb").write(d)
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
print("thumbs", sum(res), "/", len(cands))

font = ImageFont.truetype("arial.ttf", 13)
TH_W, TH_H, COLS = 200, 260, 5
tiles = []
for i in range(len(cands)):
    tp = f"_thumbs6/slide-sandals/{i}.jpg"
    if os.path.exists(tp):
        try:
            im = Image.open(tp).convert("RGB")
            im.thumbnail((TH_W, TH_H))
            tiles.append((i, im))
        except Exception:
            pass
rows = -(-len(tiles) // COLS)
sheet = Image.new("RGB", (COLS * TH_W, rows * (TH_H + 20)), "white")
dr = ImageDraw.Draw(sheet)
for j, (i, im) in enumerate(tiles):
    x = (j % COLS) * TH_W
    y = (j // COLS) * (TH_H + 20)
    sheet.paste(im, (x + (TH_W - im.width) // 2, y + (TH_H - im.height) // 2))
    dr.text((x + 6, y + TH_H + 2), f"#{i}", fill="black", font=font)
sheet.save("_vs6/slide_full.jpg", quality=78)
import os as _o
print("sheet KB", _o.path.getsize("_vs6/slide_full.jpg") // 1024)
