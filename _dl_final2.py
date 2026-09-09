"""Get correct thumburl for the Commons pants file and download slide17 via flickr size suffix."""
import json, urllib.request, urllib.parse, time
PROXIES = ["http://127.0.0.1:10808", "http://127.0.0.1:9910"]
HEADERS = {"User-Agent": "ModStyleQA/1.0", "Accept": "application/json"}
openers = [urllib.request.build_opener(urllib.request.ProxyHandler({"http": p, "https": p})) for p in PROXIES]

def fetch(url, binary=False, timeout=40):
    for k in range(4):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with openers[k % 2].open(req, timeout=timeout) as r:
                data = r.read()
            return data if binary else json.loads(data.decode())
        except Exception as e:
            last = e
            time.sleep(1.5 * (k + 1))
    print("FAIL", str(last)[:80])
    return None

params = {"action": "query", "format": "json", "titles": "File:Fashion-woman-girl-jacket (23697925184).jpg",
          "prop": "imageinfo", "iiprop": "url|size", "iiurlwidth": "900"}
u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
d = fetch(u)
if d:
    p = list(d["query"]["pages"].values())[0]
    tu = p["imageinfo"][0]["thumburl"]
    print("thumburl:", tu)
    data = fetch(tu, binary=True)
    if data:
        open("_dl/pants_w3.jpg", "wb").write(data)
        print("pants saved", len(data))

# flickr _b is 1024; try larger _h (1600) or keep _b
data = fetch("https://live.staticflickr.com/2504/3923266048_31c17c216c_b.jpg", binary=True)
if data:
    open("_dl/slide17.jpg", "wb").write(data)
    print("slide17 saved", len(data))
print("DLDONE")
