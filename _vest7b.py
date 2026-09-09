"""Try remaining quilted-vest-men pass-7 thumbs (#3 caveat is a render; #22 amateur but real puffer vest).
Also grab any remaining unfetched thumbs of pass-7 and build full sheet to check others (5-34)."""
import json, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
H_IMG = {"User-Agent": "ModStyleQA/1.0", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch_img(url):
    if not url:
        return None
    for k in range(3):
        try:
            req = urllib.request.Request(url, headers=H_IMG)
            with openers[k % 2].open(req, timeout=30) as r:
                return r.read()
        except Exception:
            time.sleep(1.0 * (k + 1))
    return None

results = json.load(open("_cands7/quilted-vest-men.json", encoding="utf-8"))
os.makedirs("_thumbs7/quilted-vest-men", exist_ok=True)

def get(t):
    i, c = t
    tp = f"_thumbs7/quilted-vest-men/{i}.jpg"
    if os.path.exists(tp):
        return True
    d = fetch_img(c.get("thumb")) or fetch_img(c.get("url"))
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

with ThreadPoolExecutor(max_workers=8) as ex:
    res = list(ex.map(get, enumerate(results)))
print("thumbs", sum(res), "/", len(results))

font = ImageFont.truetype("arial.ttf", 13)
TH_W, TH_H, COLS = 200, 260, 5
tiles = []
for i in range(len(results)):
    tp = f"_thumbs7/quilted-vest-men/{i}.jpg"
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
sheet.save("_vs7/vest7_full.jpg", quality=78)
import os as _o
print("sheet KB", _o.path.getsize("_vs7/vest7_full.jpg") // 1024)
