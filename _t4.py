import json, os
# Print titles of pass-1 candidates for the still-unsolved slugs so I can pick any usable by title as fallback
for slug in ['quilted-vest-men','straight-fabric-pants-w','slide-sandals','crossbody-mini-bag']:
    for src in [f'_cands/{slug}.json', f'_cands3/{slug}.json', f'_cands4/{slug}.json']:
        if os.path.exists(src):
            d=json.load(open(src,encoding='utf-8'))
            print(f'== {src} ({len(d)})')
            for i,c in enumerate(d):
                print(' ', i, (c['title'] or '')[:70], '|', c.get('q',''))
