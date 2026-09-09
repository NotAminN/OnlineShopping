"""Last resort for quilted-vest-men: Openverse with different query vocabulary.
The product: 'جلیقه لحاف‌دوزی مردانه' = men's quilted vest. Try: 'man vest winter', 'padded gilet', 'men jacket vest snow', 'quilted jacket man'.
Output _cands7/quilted-vest-men.json then thumbs->sheet _vs7."""
import json, os, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
H_JSON = {"User-Agent": "ModStyleQA/1.0", "Accept": "application/json"}
H_IMG = {"User-Agent": "ModStyleQA/1.0", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch_json(url):
    for k in range(3):
        try:
            req = urllib.request.Request(url, headers=H_JSON)
            with openers[k % 2].open(req, timeout=30) as r:
                return json.loads(r.read().decode())
        except Exception:
            time.sleep(1.2 * (k + 1))
    return None

def fetch_img(url):
    if not url:
        return None
    for k in range(2):
        try:
            req = urllib.request.Request(url, headers=H_IMG)
            with openers[k % 2].open(req, timeout=25) as r:
                return r.read()
        except Exception:
            time.sleep(0.6)
    return None

QS = ["man puffer jacket winter street", "man winter jacket outdoor", "padded jacket men", "man vest snow"]
OV = "https://api.openverse.org/v1/images/"
results, have = [], set()
for q in QS:
    u = OV + "?" + urllib.parse.urlencode({"q": q, "page_size": 20, "mature": "false"})
    d = fetch_json(u)
    for r_ in ((d or {}).get("results", [])):
        w, h = r_.get("width") or 0, r_.get("height") or 0
        if w < 500 or h < 500 or w / h > 2.2 or h / w > 2.2 or r_.get("id") in have:
            continue
        have.add(r_.get("id"))
        results.append({"id": r_.get("id"), "title": (r_.get("title") or "")[:90], "url": r_.get("url"),
                        "thumb": r_.get("thumbnail"), "license": r_.get("license"), "w": w, "h": h, "q": q})
    time.sleep(0.7)
os.makedirs("_cands7", exist_ok=True)
json.dump(results, open("_cands7/quilted-vest-men.json", "w", encoding="utf-8"), indent=1)
print("cands", len(results))

os.makedirs("_thumbs7/quilted-vest-men", exist_ok=True)
os.makedirs("_vs7", exist_ok=True)
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

with ThreadPoolExecutor(max_workers=10) as ex:
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
sheet.save("_vs7/vest7.jpg", quality=78)
import os as _o
print("sheet KB", _o.path.getsize("_vs7/vest7.jpg") // 1024)
