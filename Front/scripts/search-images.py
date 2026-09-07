import urllib.request
import urllib.parse
import json
import re

def ddg_images(query):
    # Step 1: get vqd token
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    vqd_url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(vqd_url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
    
    match = re.search(r'vqd=([\d-]+)', content) or re.search(r'vqd=([a-zA-Z0-9_-]+)', content) or re.search(r'vqd="([^"]+)"', content)
    if not match:
        print("No vqd found")
        return []
    vqd = match.group(1)
    print("Found vqd:", vqd)

    # Step 2: request i.js
    img_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
    req2 = urllib.request.Request(img_url, headers=headers)
    with urllib.request.urlopen(req2) as resp:
        data = json.loads(resp.read())
        return data.get('results', [])

try:
    results = ddg_images("kids sun hat fashion")
    print(f"Got {len(results)} results")
    for r in results[:5]:
        print(f"Title: {r.get('title')}\nURL: {r.get('image')}\n")
except Exception as e:
    print("Error:", e)
