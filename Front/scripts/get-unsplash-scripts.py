import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

try:
    req = urllib.request.Request('https://unsplash.com', headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print("HTML len:", len(html))
        # Find script tags
        scripts = re.findall(r'src="([^"]+\.js)"', html)
        print("Scripts:", len(scripts))
        for s in scripts[:10]:
            print(s)
except Exception as e:
    print("Error:", e)
