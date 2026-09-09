"""Pass-6: Openverse + Commons hybrid for quilted-vest-men & slide-sandals -> _cands6/."""
import json, os, time, urllib.request, urllib.parse

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0 (image audit)", "Accept": "application/json"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch_json(url, tries=3):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % len(openers)].open(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:
            time.sleep(1.2 * (k + 1))
    return None

OV = "https://api.openverse.org/v1/images/"
CM = "https://commons.wikimedia.org/w/api.php"
queries = json.load(open("_queries6.json", encoding="utf-8"))
os.makedirs("_cands6", exist_ok=True)
for slug, qs in queries.items():
    results, have = [], set()
    for q in qs:
        u = OV + "?" + urllib.parse.urlencode({"q": q, "page_size": 20, "mature": "false"})
        d = fetch_json(u)
        for r_ in ((d or {}).get("results", [])):
            w, h = r_.get("width") or 0, r_.get("height") or 0
            if w < 500 or h < 500 or w / h > 2.2 or h / w > 2.2 or r_.get("id") in have:
                continue
            have.add(r_.get("id"))
            results.append({"id": r_.get("id"), "title": (r_.get("title") or "")[:90], "url": r_.get("url"),
                            "thumb": r_.get("thumbnail"), "land": r_.get("foreign_landing_url"),
                            "license": r_.get("license"), "creator": r_.get("creator"),
                            "w": w, "h": h, "q": q, "source": "openverse"})
        time.sleep(0.7)
    json.dump(results, open(f"_cands6/{slug}.json", "w", encoding="utf-8"), indent=1)
    print(slug, len(results), flush=True)
print("DONE6")
