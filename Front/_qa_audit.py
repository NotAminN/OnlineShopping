# -*- coding: utf-8 -*-
"""Audit all 124 product images: dims, size, MD5 groups, contact sheets."""
import json, os, hashlib, sys
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
PROD = os.path.join(ROOT, 'public', 'images', 'products')
OUT = os.path.join(ROOT, '_qa')
os.makedirs(OUT, exist_ok=True)

products = json.load(open(os.path.join(ROOT, '_task_products.json'), encoding='utf-8'))

rows = []
hash_groups = {}
for p in products:
    slug = p['slug']
    for suffix in ('', '-2'):
        fn = f'{slug}{suffix}.jpg'
        fpath = os.path.join(PROD, fn)
        rec = {'slug': slug, 'name': p['name'], 'cat': p['cat'], 'file': fn}
        if not os.path.exists(fpath):
            rec.update(status='MISSING', w=0, h=0, kb=0, md5='')
        else:
            kb = os.path.getsize(fpath) // 1024
            md5 = hashlib.md5(open(fpath, 'rb').read()).hexdigest()
            try:
                with Image.open(fpath) as im:
                    w, h = im.size
            except Exception as e:
                w, h = -1, -1
            rec.update(status='OK', w=w, h=h, kb=kb, md5=md5)
            hash_groups.setdefault(md5, []).append(fn)
        rows.append(rec)

json.dump(rows, open(os.path.join(OUT, 'inventory.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)

# duplicates report
dups = {h: fl for h, fl in hash_groups.items() if len(fl) > 1}
rep = ['== DUPLICATE GROUPS ==']
for h, fl in sorted(dups.items(), key=lambda x: -len(x[1])):
    rep.append(f'{len(fl)}x: {", ".join(fl)}')
rep.append('')
rep.append('== BAD FILES ==')
for r in rows:
    if r['status'] != 'OK' or r['w'] < 400 or r['kb'] < 8:
        rep.append(f"{r['file']}: {r['status']} {r['w']}x{r['h']} {r['kb']}KB")
open(os.path.join(OUT, 'report.txt'), 'w', encoding='utf-8').write('\n'.join(rep))
print('\n'.join(rep))
print('total files:', len(rows), '| dup groups:', len(dups))
