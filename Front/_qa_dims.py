# -*- coding: utf-8 -*-
import json, os
rows = json.load(open('_qa/inventory.json', encoding='utf-8'))
dims = {}
for r in rows:
    k = (r['w'], r['h'])
    dims[k] = dims.get(k, 0) + 1
print('top dims:')
for k, v in sorted(dims.items(), key=lambda x: -x[1])[:10]:
    print(' ', k, v)
print()
print('=== dist ===')
for p in ['dist', 'dist/images/products']:
    print(p, '->', os.listdir(p)[:8] if os.path.isdir(p) else 'NO')
print()
seed = 'D:/A_Footages/alpha-shop/seed_data.json'
if os.path.exists(seed):
    txt = open(seed, encoding='utf-8').read()
    print('seed_data.json mentions images/products:', txt.count('images/products'))
