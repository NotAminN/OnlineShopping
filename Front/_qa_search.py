# -*- coding: utf-8 -*-
"""Search+rank images from Openverse (CC-licensed, web-scraped) for each product slot.
No Unsplash. No AI generation. Writes candidates to _qa/candidates.json."""
import json, os, time, urllib.request, urllib.parse, ssl

ROOT = os.path.dirname(os.path.abspath(__file__))
CTX = ssl.create_default_context()
UA = {'User-Agent': 'ModStyleImageQA/1.0 (fashion storefront; contact: dev@local)'}

# product slot -> search queries (first match wins)
QUERIES = {
  # KIDS (worst offenders first)
  'kids-summer-hat':        ['child sun hat straw beach', 'toddler sun hat', 'kid wide brim hat summer'],
  'kids-summer-hat-2':      ['toddler sun hat', 'child panama hat', 'kid beach hat'],
  'kids-denim-overall':     ['toddler denim overalls', 'child dungarees jeans', 'baby overall jeans'],
  'kids-denim-overall-2':   ['child dungarees', 'toddler overalls', 'kids denim clothes'],
  'kids-hoodie-set':        ['kids hoodie tracksuit', 'child hooded sweatshirt', 'children sweatsuit'],
  'kids-hoodie-set-2':      ['children tracksuit', 'kid hoodie pants set', 'child jogging suit'],
  'kids-comfort-shorts':    ['kids shorts clothes', 'children shorts', 'toddler shorts'],
  'kids-comfort-shorts-2':  ['children shorts', 'kids summer clothes'],
  'kids-striped-set':       ['kids striped shirt', 'children striped clothes', 'toddler striped tee'],
  'kids-striped-set-2':     ['children striped outfit', 'kids striped clothes'],
  'kids-knit-jacket':       ['kids knit cardigan', 'children knitted jacket', 'child cardigan wool'],
  'kids-knit-jacket-2':     ['children cardigan', 'kids sweater knitted'],
  'kids-cotton-dress':      ['girl cotton dress', 'child summer dress', 'kids dress cotton'],
  'kids-cotton-dress-2':    ['child dress', 'girl dress summer'],
  'kids-sneakers':          ['kids sneakers shoes', 'children sport shoes', 'child trainers'],
  'kids-sneakers-2':        ['children shoes sport', 'kids trainers'],
  # WOMEN mismatches
  'pleated-midi-skirt':     ['pleated midi skirt woman', 'plisse skirt', 'accordion pleat skirt'],
  'pleated-midi-skirt-2':   ['pleated skirt fashion', 'midi pleated'],
  'oversize-denim-jacket-w':['oversized denim jacket woman', 'jeans jacket women', 'denim jacket oversized'],
  'oversize-denim-jacket-w-2':['woman denim jacket', 'jean jacket fashion'],
  'silk-crepe-blouse':      ['silk blouse woman', 'crepe blouse', 'woman blouse elegant'],
  'silk-crepe-blouse-2':    ['white blouse woman', 'silk shirt women'],
  'warm-knit-coat':         ['knitted cardigan beige', 'wool cardigan knit', 'knit sweater coat'],
  'warm-knit-coat-2':       ['knit cardigan fashion', 'woolen cardigan'],
  'simple-cotton-top':      ['white t-shirt woman flat', 'cotton tee woman', 'plain tshirt woman'],
  'simple-cotton-top-2':    ['woman t-shirt casual', 'white tee fashion'],
  'straight-fabric-pants-w':['straight trousers woman', 'tailored pants women', 'woman trousers elegant'],
  'straight-fabric-pants-w-2':['woman trousers fashion', 'wide trousers women'],
  'crewneck-sweater-w':     ['crewneck sweater woman', 'woman knit sweater', 'pullover women'],
  'crewneck-sweater-w-2':   ['woman sweater fashion', 'knitwear woman'],
  'satin-slip-skirt':       ['satin skirt woman', 'slip skirt fashion', 'silk midi skirt'],
  'satin-slip-skirt-2':     ['satin skirt', 'silk skirt woman'],
  'wrap-midi-dress':        ['wrap midi dress woman', 'wrap dress fashion', 'woman wrap dress'],
  'wrap-midi-dress-2':      ['wrap dress', 'midi dress woman'],
  'minimal-satin-dress':    ['satin dress woman', 'satin slip dress', 'elegant satin dress'],
  'minimal-satin-dress-2':  ['satin dress fashion', 'silk dress woman'],
  'oversize-linen-coat':    ['beige long coat woman', 'linen coat women', 'oversized coat woman'],
  'oversize-linen-coat-2':  ['woman long coat fashion', 'camel coat street'],
  'long-crepe-manteau':     ['long trench coat woman', 'woman coat elegant', 'crepe coat long'],
  'long-crepe-manteau-2':   ['trench coat woman fashion', 'long coat street style'],
  'shimmer-party-dress':    ['party dress woman elegant', 'evening gown woman', 'cocktail dress woman'],
  'shimmer-party-dress-2':  ['evening dress fashion', 'party dress glamour'],
  'crop-knit-cardigan':     ['knit cardigan woman', 'cropped cardigan', 'woman cardigan knit'],
  'crop-knit-cardigan-2':   ['cardigan fashion woman', 'knitted shrug'],
  # MEN mismatches
  'bomber-jacket':          ['bomber jacket fashion', 'man bomber jacket', 'mens bomber'],
  'bomber-jacket-2':        ['bomber jacket man style', 'ma1 bomber'],
  'cargo-pants-men':        ['cargo pants men', 'man cargo trousers', 'cargo pants fashion men'],
  'cargo-pants-men-2':      ['cargo pants style', 'man cargo pocket pants'],
  'quilted-vest-men':       ['quilted vest men', 'man gilet quilted', 'puffer vest men'],
  'quilted-vest-men-2':     ['men vest quilted fashion', 'gilet bodywarmer'],
  'straight-linen-pants-men':['linen pants men', 'man linen trousers', 'linen trousers fashion'],
  'straight-linen-pants-men-2':['linen trousers men style', 'man summer pants'],
  'oxford-shirt-men':       ['oxford shirt man', 'man white shirt jeans', 'mens oxford shirt style'],
  'oxford-shirt-men-2':     ['man button shirt casual', 'oxford shirt fashion'],
  'straight-jeans-men':     ['straight jeans men', 'man denim jeans', 'mens straight leg jeans'],
  'straight-jeans-men-2':   ['man jeans fashion', 'denim jeans men style'],
  'linen-shirt-men':        ['linen shirt men', 'man linen shirt fashion', 'mens linen shirt'],
  'linen-shirt-men-2':      ['linen shirt style', 'man summer shirt'],
  'pique-polo':             ['polo shirt folded', 'pique polo men', 'polo shirt cotton'],
  'pique-polo-2':           ['man polo shirt', 'polo shirt fashion'],
  'cotton-tee-men':         ['white t-shirt man', 'man plain tee', 'cotton tshirt men'],
  'cotton-tee-men-2':       ['man t-shirt fashion', 'basic tee men'],
  'oversize-hoodie':        ['oversized hoodie man', 'man hoodie street', 'hoodie oversized fashion'],
  'oversize-hoodie-2':      ['man hoodie fashion', 'hooded sweatshirt men'],
  'knit-mock-neck-men':     ['turtleneck sweater men', 'man mock neck knit', 'rollneck men'],
  'knit-mock-neck-men-2':   ['man turtleneck fashion', 'knitted pullover men'],
  'classic-single-breasted-suit':['man navy suit', 'single breasted suit men', 'man suit fashion'],
  'classic-single-breasted-suit-2':['man suit tailored', 'mens suit style'],
  'leather-jacket-men':     ['leather jacket man', 'man biker jacket', 'leather jacket fashion men'],
  'leather-jacket-men-2':   ['leather jackets rack', 'man leather jacket style'],
  # SHOES (mostly OK, fix notable drift)
  'minimal-white-sneakers': ['white sneakers product', 'white leather sneakers', 'minimal sneakers'],
  'minimal-white-sneakers-2':['white sneakers shoes', 'clean white trainers'],
  'winter-leather-boots':   ['winter leather boots', 'leather boots snow', 'mens boots winter'],
  'winter-leather-boots-2': ['leather boots warm', 'winter boots leather'],
  'leather-summer-sandals': ['leather sandals men', 'summer leather sandals', 'sandals product'],
  'leather-summer-sandals-2':['leather sandals', 'summer sandals shoes'],
  'chunky-sole-sneakers':   ['chunky sneakers shoes', 'chunky sole trainer', 'platform sneakers'],
  'chunky-sole-sneakers-2': ['chunky sneakers fashion', 'dad sneakers'],
  'suede-derby-shoes':      ['suede derby shoes', 'suede shoes men', 'derby shoes product'],
  'suede-derby-shoes-2':    ['suede derby', 'suede oxford shoes'],
  'slide-sandals':          ['slide sandals product', 'leather slides', 'slide slippers'],
  'slide-sandals-2':        ['slide sandals', 'sliders shoes'],
  'leather-loafers':        ['leather loafers men', 'loafer shoes product', 'leather moccasins'],
  'leather-loafers-2':      ['loafers shoes', 'penny loafers'],
  'leather-college-shoes':  ['leather college shoes', 'derby leather shoes men', 'oxford leather shoes'],
  'leather-college-shoes-2':['leather dress shoes', 'college shoes leather'],
  'running-sneakers':       ['running shoes product', 'running sneakers', 'sport shoe single'],
  'running-sneakers-2':     ['running shoe product', 'sneaker sport shoe'],
  # BAGS
  'leather-handbag':        ['leather handbag product', 'leather purse elegant', 'handbag product shot'],
  'leather-handbag-2':      ['leather handbag', 'woman bag leather'],
  'mini-shoulder-bag':      ['mini shoulder bag', 'small leather shoulder bag', 'shoulder bag product'],
  'mini-shoulder-bag-2':    ['mini bag leather', 'small shoulder bag fashion'],
  'urban-backpack':         ['urban backpack product', 'black backpack product', 'minimal backpack'],
  'urban-backpack-2':       ['backpack product', 'leather backpack'],
  'office-laptop-bag':      ['laptop bag product', 'briefcase laptop bag', 'laptop backpack product'],
  'office-laptop-bag-2':    ['laptop bag leather', 'work bag men'],
  'party-clutch':           ['clutch bag product', 'party clutch purse', 'evening clutch'],
  'party-clutch-2':         ['clutch purse elegant', 'satin clutch'],
  'tote-bag-canvas':        ['canvas tote bag', 'tote bag product', 'canvas bag product'],
  'tote-bag-canvas-2':      ['tote bag canvas fashion', 'shopping tote canvas'],
  'crossbody-mini-bag':     ['crossbody bag leather', 'crossbody purse product', 'leather crossbody'],
  'crossbody-mini-bag-2':   ['crossbody bag fashion', 'small crossbody leather'],
  'leather-wallet-unisex':  ['leather wallet product', 'bifold wallet leather', 'wallet product shot'],
  'leather-wallet-unisex-2':['leather wallet dark', 'wallet leather brown'],
  # ACCESSORIES
  'aviator-sunglasses':     ['aviator sunglasses product', 'pilot sunglasses', 'aviator sunglasses'],
  'aviator-sunglasses-2':   ['aviator sunglasses', 'metal sunglasses product'],
  'minimal-steel-watch':    ['steel watch product', 'minimal watch wrist', 'chronograph watch product'],
  'minimal-steel-watch-2':  ['steel wristwatch', 'minimal watch product'],
  'classic-leather-belt':   ['leather belt product', 'leather belt buckle', 'brown belt product'],
  'classic-leather-belt-2': ['leather belt', 'belt leather fashion'],
  'patterned-cotton-scarf': ['cotton scarf folded', 'scarf pattern product', 'scarf fashion product'],
  'patterned-cotton-scarf-2':['scarf neck woman', 'plaid scarf coat'],
  'minimal-steel-necklace': ['necklace pendant product', 'steel necklace', 'chain necklace product'],
  'minimal-steel-necklace-2':['necklace gold product', 'pendant necklace jewelry'],
  'cat-eye-sunglasses':     ['cat eye sunglasses product', 'cateye sunglasses', 'retro sunglasses product'],
  'cat-eye-sunglasses-2':   ['cat eye sunglasses', 'womens sunglasses product'],
  'wool-fedora-hat':        ['wool fedora hat product', 'fedora hat', 'felt fedora'],
  'wool-fedora-hat-2':      ['fedora hat product', 'wool hat brim'],
  'leather-card-holder':    ['card holder leather', 'cardholder wallet product', 'leather card case'],
  'leather-card-holder-2':  ['card holder wallet', 'credit card holder'],
  'chain-bracelet':         ['chain bracelet gold', 'bracelet jewelry product', 'gold bracelet product'],
  'chain-bracelet-2':       ['silver chain bracelet', 'bracelet product'],
}

def ov_search(q, n=20):
    url = ('https://api.openverse.org/v1/images/?q=' + urllib.parse.quote(q) +
           '&page_size=%d&license_type=all&mature=false' % n)
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            time.sleep(2 + attempt)
    return {'results': []}

candidates = {}
for slot, qs in QUERIES.items():
    got = []
    for q in qs:
        data = ov_search(q)
        for r in data.get('results', []):
            w, h = r.get('width') or 0, r.get('height') or 0
            u = r.get('url') or ''
            if not u or w < 600 or h < 600:
                continue
            got.append({
                'title': (r.get('title') or '')[:110],
                'url': u,
                'thumb': r.get('thumbnail') or '',
                'w': w, 'h': h,
                'source': r.get('source'),
                'license': r.get('license'),
                'land': r.get('foreign_landing_url') or '',
            })
            if len(got) >= 14:
                break
        if len(got) >= 8:
            break
        time.sleep(0.4)
    candidates[slot] = got
    print(slot, '->', len(got), 'candidates')

json.dump(candidates, open(os.path.join(ROOT, '_qa', 'candidates.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('DONE', len(candidates))
