import json, os
for f in sorted(os.listdir('_cands3')):
    d = json.load(open(f'_cands3/{f}', encoding='utf-8'))
    print(f[:-5], len(d))
