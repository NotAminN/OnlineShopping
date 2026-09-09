"""Download quilted vest candidate (Cor Serpentis coral quilted vest product shot)."""
import time, urllib.request
PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch(url):
    for k in range(4):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % 2].open(req, timeout=40) as r:
                return r.read()
        except Exception:
            time.sleep(1.5 * (k + 1))
    return None

data = fetch("https://live.staticflickr.com/8572/16221222579_a8e9dba24a_b.jpg")
if data:
    open("_dl/vest0.jpg", "wb").write(data)
    print("vest0 saved", len(data))
else:
    print("vest0 FAIL")
