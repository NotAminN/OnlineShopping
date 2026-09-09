"""Download final chosen images at full res into _dl/."""
import json, os, time, urllib.request
PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0", "Accept": "*/*"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def dl(url, out):
    if not url:
        return 0
    for k in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % 2].open(req, timeout=40) as r:
                data = r.read()
            open(out, "wb").write(data)
            return len(data)
        except Exception:
            time.sleep(1.2 * (k + 1))
    return 0

os.makedirs("_dl", exist_ok=True)
JOBS = [
    # straight-fabric-pants-w primary: Commons Fashion-woman-girl-jacket (woman in white straight trousers)
    ("https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Fashion-woman-girl-jacket_%2823697925184%29.jpg/800px-Fashion-woman-girl-jacket_%2823697925184%29.jpg", "_dl/pants_w3.jpg"),
    # slide-sandals primary: black flip-flops beach (#17)
    ("https://live.staticflickr.com/2504/3923266048_31c17c216c_b.jpg", "_dl/slide17.jpg"),
    # slide-sandals backup: Birkenstock-style two-strap on sand (#20)
    ("https://live.staticflickr.com/2450/3699056198_1b73a66910_b.jpg", "_dl/slide20.jpg"),
]
for url, out in JOBS:
    n = dl(url, out)
    print(out, n, flush=True)
print("DLDONE")
