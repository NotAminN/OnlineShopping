"""Thumbs+sheet for _cands4 -> _sheets4/_vs4."""
import json, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageDraw, ImageFont

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModStyleQA/1.0", "Accept": "*/*"}
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

def get_thumb(args):
    i, slug, thumb, url = args
    tp = f"_thumbs4/{slug}/{i}.jpg"
    if os.path.exists(tp):
        return (i, tp)
    data = fetch(thumb) or fetch(url)
    if not data:
        return (i, None)
    try:
        open(tp, "wb").write(data)
        Image.open(tp).verify()
        return (i, tp)
    except Exception:
        try:
            os.remove(tp)
        except OSError:
            pass
        return (i, None)

os.makedirs("_thumbs4", exist_ok=True)
os.makedirs("_sheets4", exist_ok=True)
os.makedirs("_vs4", exist_ok=True)
font = ImageFont.truetype("arial.ttf", 13)
TH_W, TH_H, COLS = 200, 260, 5

tasks = []
for f in sorted(os.listdir("_cands4")):
    slug = f[:-5]
    cands = json.load(open(f"_cands4/{f}", encoding="utf-8"))
    os.makedirs(f"_thumbs4/{slug}", exist_ok=True)
    for i, c in enumerate(cands):
        tasks.append((i, slug, c.get("thumb"), c.get("url")))

print(f"{len(tasks)} thumbs", flush=True)
with ThreadPoolExecutor(max_workers=10) as ex:
    futs = [ex.submit(get_thumb, t) for t in tasks]
    for fu in as_completed(futs):
        pass

by_slug = {}
for i, slug, _, _ in tasks:
    if os.path.exists(f"_thumbs4/{slug}/{i}.jpg"):
        by_slug.setdefault(slug, []).append(i)

for slug, ids in by_slug.items():
    tiles = []
    for i in sorted(ids):
        try:
            im = Image.open(f"_thumbs4/{slug}/{i}.jpg").convert("RGB")
            im.thumbnail((TH_W, TH_H))
            tiles.append((i, im))
        except Exception:
            continue
    if not tiles:
        continue
    rows = -(-len(tiles) // COLS)
    sheet = Image.new("RGB", (COLS * TH_W, rows * (TH_H + 20)), "white")
    dr = ImageDraw.Draw(sheet)
    for j, (i, im) in enumerate(tiles):
        x = (j % COLS) * TH_W
        y = (j // COLS) * (TH_H + 20)
        sheet.paste(im, (x + (TH_W - im.width) // 2, y + (TH_H - im.height) // 2))
        dr.text((x + 6, y + TH_H + 2), f"#{i}", fill="black", font=font)
    sheet.save(f"_sheets4/{slug}.jpg", quality=80)
    im = Image.open(f"_sheets4/{slug}.jpg")
    W, H = im.size
    rows_total = -(-H // TH_H)
    half = -(-rows_total // 2)
    for part, (r0, r1) in enumerate([(0, half), (half, rows_total)]):
        if r0 >= rows_total:
            continue
        crop = im.crop((0, r0 * TH_H, W, min(r1 * TH_H, H)))
        crop.save(f"_vs4/{slug}__{part+1}.jpg", quality=82)
    print(f"{slug}: {len(tiles)}", flush=True)
print("THUMBS4 DONE")
