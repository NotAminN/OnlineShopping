from PIL import Image, ImageDraw
import json, os

DIR = 'Front/public/images/products'
products = {p['slug']: p for p in json.load(open('seed_data.json', encoding='utf-8'))['products']}

FLAGGED = ['long-crepe-manteau','quilted-vest-men','oversize-linen-coat','crop-knit-cardigan',
'office-laptop-bag','patterned-cotton-scarf','silk-crepe-blouse','wrap-midi-dress','satin-slip-skirt',
'straight-fabric-pants-w','wide-leg-pants-w','warm-knit-coat','pleated-midi-skirt','minimal-steel-necklace',
'classic-leather-belt','cat-eye-sunglasses','simple-cotton-top','kids-summer-hat','kids-denim-overall',
'kids-hoodie-set','kids-comfort-shorts','kids-knit-jacket','kids-striped-set','kids-cotton-dress','kids-sneakers']

CW, CH, LH = 380, 420, 26
PER = 5  # products per sheet
os.makedirs('_audit_current/flagged', exist_ok=True)

def thumb(path):
    img = Image.open(path).convert('RGB')
    r = min((CW-6)/img.width, (CH-LH)/img.height)
    return img.resize((max(1,int(img.width*r)), max(1,int(img.height*r))))

batch = 0
for s in range(0, len(FLAGGED), PER):
    chunk = FLAGGED[s:s+PER]
    W = 2*CW + 2*4
    H = len(chunk)*(CH+LH)
    sheet = Image.new('RGB', (W, H), (22,22,26))
    d = ImageDraw.Draw(sheet)
    for ri, slug in enumerate(chunk):
        y = ri*(CH+LH)
        d.rectangle([0,y,W,y+LH], fill=(12,30,60))
        d.text((4,y+6), f"{slug}  [{products[slug]['category']}]  {products[slug]['name']}", fill=(255,255,180))
        for ci in (0,1):
            fn = products[slug]['images'][ci].split('/')[-1]
            try:
                t = thumb(os.path.join(DIR, fn))
                sheet.paste(t, (ci*CW+4+(CW-6-t.width)//2, y+LH))
            except Exception as e:
                d.text((ci*CW+10, y+200), f"ERR {e}", fill=(255,80,80))
            d.text((ci*CW+4, y+LH+CH-LH), f"img{ci+1}: {fn}", fill=(120,255,120))
    sheet.save(f'_audit_current/flagged/f_{batch}.jpg', quality=85)
    batch += 1
print(f'{len(FLAGGED)} flagged products -> {batch} sheets')
