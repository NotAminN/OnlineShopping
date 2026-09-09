"""Query Openverse API for candidate images per product, save results to JSON.
Robust: tries proxies [9910, 10808] each request, honors skip-files.
Writes: _cands/<slug>.json
"""
import json, os, sys, time, urllib.request, urllib.parse

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
UA = "ModStyleQA/1.0 (image audit; contact dev@modstyle.local)"
HEADERS = {"User-Agent": UA, "Accept": "application/json"}
API = "https://api.openverse.org/v1/images/"

openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch(url, binary=False, tries=4):
    last = None
    for k in range(tries):
        op = openers[k % len(openers)]
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with op.open(req, timeout=30) as r:
                data = r.read()
                return data if binary else json.loads(data.decode("utf-8"))
        except Exception as e:
            last = e
            time.sleep(1.5 * (k + 1))
    print(f"  FAIL after {tries}: {str(last)[:80]}", flush=True)
    return None

queries = json.load(open("_queries.json", encoding="utf-8"))
os.makedirs("_cands", exist_ok=True)
only = sys.argv[1:] if len(sys.argv) > 1 else None
for slug, qs in queries.items():
    if only and slug not in only:
        continue
    out = f"_cands/{slug}.json"
    if os.path.exists(out):
        d0 = json.load(open(out, encoding="utf-8"))
        if d0:
            print(f"skip {slug} ({len(d0)})", flush=True)
            continue
    results = []
    for q in qs:
        u = API + "?" + urllib.parse.urlencode({"q": q, "page_size": 20, "mature": "false"})
        d = fetch(u)
        if not d:
            continue
        for r_ in d.get("results", []):
            w, h = r_.get("width") or 0, r_.get("height") or 0
            if w < 500 or h < 500:
                continue
            if w / h > 1.9 or h / w > 2.1:
                continue
            results.append({
                "id": r_.get("id"), "title": (r_.get("title") or "")[:90],
                "url": r_.get("url"), "thumb": r_.get("thumbnail"),
                "land": r_.get("foreign_landing_url"), "license": r_.get("license"),
                "creator": r_.get("creator"), "w": w, "h": h, "q": q,
                "source": r_.get("source"),
            })
        time.sleep(0.8)
    json.dump(results, open(out, "w", encoding="utf-8"), indent=1)
    print(f"{slug}: {len(results)} candidates", flush=True)
print("DONE")
