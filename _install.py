"""Install all selected replacement images into Front/public/images/products/.
- Downloads full-res from source URLs (via local proxy).
- Validates with PIL (decode + min dimensions).
- Converts/pads nothing: keeps original aspect; saves as high-quality JPEG (max 1200px long edge).
- Writes to <dest>.tmp then os.replace (atomic).
- Records a manifest _install_manifest.json.
"""
import json, os, time, urllib.request
from PIL import Image

PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ModStyleQA/1.0", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

DEST = "Front/public/images/products"

def fetch(url):
    if not url:
        return None
    for k in range(4):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % 2].open(req, timeout=60) as r:
                return r.read()
        except Exception:
            time.sleep(1.5 * (k + 1))
    return None

def candidate_url(slug, idx):
    """Return (url, source) for chosen candidate from any _cands dir."""
    for d in ["_cands", "_cands3", "_cands4", "_cands6", "_cands7"]:
        p = f"{d}/{slug}.json"
        if os.path.exists(p):
            cands = json.load(open(p, encoding="utf-8"))
            if idx < len(cands):
                c = cands[idx]
                return c.get("url"), f"{d}/{slug}#{idx}"
    return None, None

def save_jpeg(data, dest_path):
    """Validate + normalize to JPEG <=1200px long edge, save atomically."""
    import io
    im = Image.open(io.BytesIO(data))
    im.load()
    if im.format not in ("JPEG", "PNG", "WEBP"):
        raise ValueError(f"bad format {im.format}")
    w, h = im.size
    if w < 400 or h < 400:
        raise ValueError(f"too small {w}x{h}")
    if max(w, h) > 1200:
        scale = 1200 / max(w, h)
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    if im.mode != "RGB":
        im = im.convert("RGB")
    tmp = dest_path + ".tmp"
    with open(tmp, "wb") as f:
        im.save(f, "JPEG", quality=87)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, dest_path)
    return im.size

# ---- final mapping: dest filename -> (kind, source)
# kind 'local' = local file path; kind 'cand' = (slug, idx) lookup; kind 'url' = direct URL
PLAN = {
    # === both replaced ===
    "kids-denim-overall.jpg":    ("local", "_thumbs/u_den1.jpg"),
    "kids-denim-overall-2.jpg":  ("local", "_thumbs/u_den2.jpg"),
    "kids-sneakers.jpg":         ("cand", ("kids-sneakers", 10)),
    "kids-sneakers-2.jpg":       ("cand", ("kids-sneakers", 13)),
    "kids-cotton-dress.jpg":     ("cand", ("kids-cotton-dress", 18)),
    "kids-cotton-dress-2.jpg":   ("cand", ("kids-cotton-dress", 31)),
    "kids-summer-hat.jpg":       ("cand", ("kids-summer-hat", 5)),
    "kids-summer-hat-2.jpg":     ("cand", ("kids-summer-hat", 18)),
    "minimal-satin-dress.jpg":   ("cand", ("minimal-satin-dress", 3)),
    "minimal-satin-dress-2.jpg": ("cand", ("minimal-satin-dress", 10)),
    "cat-eye-sunglasses.jpg":    ("cand", ("cat-eye-sunglasses", 1)),
    "cat-eye-sunglasses-2.jpg":  ("cand", ("cat-eye-sunglasses", 2)),
    "simple-cotton-top.jpg":     ("cand", ("simple-cotton-top", 11)),
    "simple-cotton-top-2.jpg":   ("cand", ("simple-cotton-top", 1)),
    "cargo-pants-men.jpg":       ("cand", ("cargo-pants-men", 13)),
    "cargo-pants-men-2.jpg":     ("cand", ("cargo-pants-men", 14)),
    "quilted-vest-men.jpg":      ("cand", ("quilted-vest-men", 22)),  # from _cands7
    "quilted-vest-men-2.jpg":    ("cand", ("quilted-vest-men", 0)),   # from _cands  (coral quilted vest product shot)
    # === one replaced ===
    "kids-comfort-shorts-2.jpg":      ("cand", ("kids-comfort-shorts", 4)),
    "kids-hoodie-set.jpg":            ("cand", ("kids-hoodie-set", 19)),
    "kids-knit-jacket-2.jpg":         ("cand", ("kids-knit-jacket", 4)),
    "kids-striped-set.jpg":           ("cand", ("kids-striped-set", 1)),
    "long-crepe-manteau-2.jpg":       ("cand", ("long-crepe-manteau", 0)),
    "oversize-linen-coat.jpg":        ("cand", ("oversize-linen-coat", 2)),   # _cands4
    "satin-slip-skirt-2.jpg":         ("cand", ("satin-slip-skirt", 7)),      # _cands3
    "patterned-cotton-scarf-2.jpg":   ("cand", ("patterned-cotton-scarf", 12)),
    "crop-knit-cardigan-2.jpg":       ("cand", ("crop-knit-cardigan", 12)),
    "minimal-steel-necklace-2.jpg":   ("cand", ("minimal-steel-necklace", 0)),
    "office-laptop-bag-2.jpg":        ("cand", ("office-laptop-bag", 6)),
    "warm-knit-coat.jpg":             ("cand", ("warm-knit-coat", 0)),
    "straight-linen-pants-men-2.jpg": ("cand", ("straight-linen-pants-men", 2)),
    "slide-sandals.jpg":              ("local", "_dl/slide20.jpg"),
    "wool-fedora-hat-2.jpg":          ("cand", ("wool-fedora-hat", 3)),
    "oversize-denim-jacket-w.jpg":    ("cand", ("oversize-denim-jacket-w", 9)),
    "crossbody-mini-bag-2.jpg":       ("cand", ("crossbody-mini-bag", 10)),
    "aviator-sunglasses-2.jpg":       ("cand", ("aviator-sunglasses", 1)),
    "bomber-jacket.jpg":              ("cand", ("bomber-jacket", 0)),
}

manifest = {}
for dest, (kind, src) in PLAN.items():
    dest_path = os.path.join(DEST, dest)
    try:
        if kind == "url":
            url, provenance = src, src[:80]
            data = fetch(url)
        elif kind == "local":
            provenance = src
            data = open(src, "rb").read() if os.path.exists(src) else None
        else:
            slug, idx = src
            url, provenance = candidate_url(slug, idx)
            data = fetch(url) if url else None
        if not data:
            raise ValueError("download failed")
        size = save_jpeg(data, dest_path)
        manifest[dest] = {"ok": True, "from": provenance, "size": size}
        print(f"OK  {dest}  {size}  <- {provenance}", flush=True)
    except Exception as e:
        manifest[dest] = {"ok": False, "error": str(e)[:100], "from": str(provenance)[:60]}
        print(f"ERR {dest}  {str(e)[:80]}", flush=True)

json.dump(manifest, open("_install_manifest.json", "w", encoding="utf-8"), indent=1)
ok = sum(1 for v in manifest.values() if v["ok"])
print(f"INSTALLED {ok}/{len(PLAN)}")
