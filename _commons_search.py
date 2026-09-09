"""Final hunt for the 4 unresolved slugs via Wikimedia Commons search API.
Commons search: action=query generator=search gsrnamespace=6 gsrsearch=...
Filter to JPEG/PNG, width/height >= 500. Output _cands5/<slug>.json
"""
import json, os, time, urllib.request, urllib.parse

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0 (image audit)", "Accept": "application/json"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch_json(url, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % len(openers)].open(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:
            time.sleep(1.5 * (k + 1))
    return None

Q = {
    "quilted-vest-men": ["puffer vest man", "gilet man jacket", "bodywarmer"],
    "slide-sandals": ["slide sandals", "sandal pair leather", "flip-flops sandals pair"],
    "straight-fabric-pants-w": ["woman trousers fashion", "trousers suit woman", "pants fashion woman"],
}
os.makedirs("_cands5", exist_ok=True)
API = "https://commons.wikimedia.org/w/api.php"
for slug, qs in Q.items():
    results = []
    have = set()
    for q in qs:
        params = {
            "action": "query", "format": "json", "generator": "search",
            "gsrsearch": f"filetype:bitmap {q}", "gsrnamespace": "6", "gsrlimit": "25",
            "prop": "imageinfo", "iiprop": "url|size|mime", "iiurlwidth": "400",
        }
        d = fetch_json(API + "?" + urllib.parse.urlencode(params))
        if not d:
            continue
        for pid, p in (d.get("query", {}).get("pages", {}) or {}).items():
            ii = (p.get("imageinfo") or [{}])[0]
            w, h = ii.get("width", 0), ii.get("height", 0)
            mime = ii.get("mime", "")
            if mime not in ("image/jpeg", "image/png"):
                continue
            if w < 500 or h < 500 or w / h > 2.2 or h / w > 2.2:
                continue
            title = p.get("title", "")
            if title in have:
                continue
            have.add(title)
            results.append({
                "id": title, "title": title[:100],
                "url": ii.get("url"), "thumb": ii.get("thumburl"),
                "land": ii.get("descriptionurl"), "license": "commons",
                "creator": "", "w": w, "h": h, "q": q, "source": "commons",
            })
        time.sleep(0.7)
    json.dump(results, open(f"_cands5/{slug}.json", "w", encoding="utf-8"), indent=1)
    print(slug, len(results), flush=True)
print("DONE5")
