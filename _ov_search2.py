"""Second-pass Openverse search for slugs with too few candidates.
Appends to existing _cands/<slug>.json (dedup by id)."""
import json, os, time, urllib.request, urllib.parse

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0 (image audit)", "Accept": "application/json"}
API = "https://api.openverse.org/v1/images/"
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch(url, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % len(openers)].open(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            time.sleep(1.5 * (k + 1))
    return None

queries = json.load(open("_queries2.json", encoding="utf-8"))
for slug, qs in queries.items():
    out = f"_cands/{slug}.json"
    existing = json.load(open(out, encoding="utf-8")) if os.path.exists(out) else []
    have = {c["id"] for c in existing}
    for q in qs:
        u = API + "?" + urllib.parse.urlencode({"q": q, "page_size": 20, "mature": "false"})
        d = fetch(u)
        if not d:
            continue
        for r_ in d.get("results", []):
            w, h = r_.get("width") or 0, r_.get("height") or 0
            if w < 500 or h < 500 or w / h > 1.9 or h / w > 2.1:
                continue
            if r_.get("id") in have:
                continue
            have.add(r_.get("id"))
            existing.append({
                "id": r_.get("id"), "title": (r_.get("title") or "")[:90],
                "url": r_.get("url"), "thumb": r_.get("thumbnail"),
                "land": r_.get("foreign_landing_url"), "license": r_.get("license"),
                "creator": r_.get("creator"), "w": w, "h": h, "q": q,
                "source": r_.get("source"),
            })
        time.sleep(0.8)
    json.dump(existing, open(out, "w", encoding="utf-8"), indent=1)
    print(slug, len(existing), flush=True)
print("DONE2")
