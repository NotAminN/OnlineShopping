"""Pass-4: reuse _ov_search3 logic against _queries4.json -> _cands4/."""
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
        except Exception:
            time.sleep(1.5 * (k + 1))
    return None

queries = json.load(open("_queries4.json", encoding="utf-8"))
os.makedirs("_cands4", exist_ok=True)
for slug, qs in queries.items():
    results = []
    have = set()
    for q in qs:
        u = API + "?" + urllib.parse.urlencode({"q": q, "page_size": 20, "mature": "false"})
        d = fetch(u)
        if not d:
            continue
        for r_ in d.get("results", []):
            w, h = r_.get("width") or 0, r_.get("height") or 0
            if w < 500 or h < 500 or w / h > 2.2 or h / w > 2.2:
                continue
            if r_.get("id") in have:
                continue
            have.add(r_.get("id"))
            results.append({
                "id": r_.get("id"), "title": (r_.get("title") or "")[:90],
                "url": r_.get("url"), "thumb": r_.get("thumbnail"),
                "land": r_.get("foreign_landing_url"), "license": r_.get("license"),
                "creator": r_.get("creator"), "w": w, "h": h, "q": q,
                "source": r_.get("source"),
            })
        time.sleep(0.7)
    json.dump(results, open(f"_cands4/{slug}.json", "w", encoding="utf-8"), indent=1)
    print(slug, len(results), flush=True)
print("DONE4")
