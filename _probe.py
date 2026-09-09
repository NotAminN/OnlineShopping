import urllib.request, ssl, sys
ctx = ssl.create_default_context()
def fetch(url, ua="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"):
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            data = r.read(400)
            return r.status, len(data), data[:16]
    except Exception as e:
        return 'ERR', str(e)[:100], b''

for name, url in [
  ("unsplash", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200"),
  ("flickr", "https://live.staticflickr.com/8704/17552979525_7c457e45b5_b.jpg"),
  ("commons", "https://upload.wikimedia.org/wikipedia/commons/e/e2/Felis_catus-cat_on_snow.jpg"),
  ("openverse-api", "https://api.openverse.org/v1/images/?q=hat&page_size=1"),
]:
    print(name, fetch(url), flush=True)
