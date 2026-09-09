"""Fast parallel thumbnail downloader.
ThreadPoolExecutor(10), 2 tries per candidate, thumb then source URL fallback.
Skips slugs whose sheet already exists.
"""
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
    tp = f"_thumbs/{slug}/{i}.jpg"
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

os.makedirs("_thumbs", exist_ok=True)
os.makedirs("_sheets", exist_ok=True)
font = ImageFont.truetype("arial.ttf", 13)
TH_W, TH_H, COLS = 200, 260, 5

done = {f[:-4] for f in os.listdir("_sheets")}
tasks = []
for f in sorted(os.listdir("_cands")):
    slug = f[:-5]
    if slug in done:
        continue
    cands = json.load(open(f"_cands/{f}", encoding="utf-8"))
    os.makedirs(f"_thumbs/{slug}", exist_ok=True)
    for i, c in enumerate(cands):
        tasks.append((i, slug, c.get("thumb"), c.get("url")))

print(f"{len(tasks)} candidate thumbs to fetch", flush=True)
results = {}
with ThreadPoolExecutor(max_workers=10) as ex:
    futs = {ex.submit(get_thumb, t): t[0] for t in tasks}
    n = 0
    for fu in as_completed(futs):
        try:
            i, tp = fu.result()
        except Exception:
            continue
        n += 1
        if n % 50 == 0:
            print(f"  {n}/{len(tasks)}", flush=True)

# group by slug
by_slug = {}
for i, slug, _, _ in tasks:
    tp = f"_thumbs/{slug}/{i}.jpg"
    if os.path.exists(tp):
        by_slug.setdefault(slug, []).append(i)

for slug, ids in by_slug.items():
    try:
        tiles = []
        for i in sorted(ids):
            try:
                im = Image.open(f"_thumbs/{slug}/{i}.jpg").convert("RGB")
                im.thumbnail((TH_W, TH_H))
                tiles.append((i, im))
            except Exception:
                continue
        if not tiles:
            print(f"{slug}: no usable thumbs", flush=True)
            continue
        rows = -(-len(tiles) // COLS)
        sheet = Image.new("RGB", (COLS * TH_W, rows * (TH_H + 20)), "white")
        dr = ImageDraw.Draw(sheet)
        for j, (i, im) in enumerate(tiles):
            x = (j % COLS) * TH_W
            y = (j // COLS) * (TH_H + 20)
            sheet.paste(im, (x + (TH_W - im.width) // 2, y + (TH_H - im.height) // 2))
            dr.text((x + 6, y + TH_H + 2), f"#{i}", fill="black", font=font)
        sheet.save(f"_sheets/{slug}.jpg", quality=80)
        print(f"{slug}: sheet {len(tiles)} tiles", flush=True)
    except Exception as e:
        print(f"{slug}: ERR {str(e)[:80]}", flush=True)
print("THUMBS DONE")
