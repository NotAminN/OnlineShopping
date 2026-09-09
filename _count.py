import json, glob, os
total = 0
for f in sorted(glob.glob('_cands/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    total += len(d)
    print(os.path.basename(f), len(d))
print('TOTAL candidates:', total)
