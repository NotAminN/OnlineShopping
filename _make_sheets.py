from PIL import Image, ImageDraw
import json, os, sys

DIR = 'Front/public/images/products'
CATS = {'women':'زنانه','men':'مردانه','shoes':'کفش','bags':'کیف','accessories':'اکسسوری','kids':'بچگانه'}

products = json.load(open('seed_data.json', encoding='utf-8'))['products']

CELL_W, CELL_H, LABEL_H, COLS, ROWS = 420, 520, 34, 4, 3
PER = COLS*ROWS

items = []
for p in products:
    for i, im in enumerate(p['images']):
        fn = im.split('/')[-1]
        items.append((p['slug'], i+1, fn, p['category'], p['name']))

os.makedirs('_audit_current/sheets', exist_ok=True)
batch = 0
for start in range(0, len(items), PER):
    chunk = items[start:start+PER]
    sheet = Image.new('RGB', (COLS*CELL_W, ROWS*(CELL_H+LABEL_H)), (24,24,28))
    d = ImageDraw.Draw(sheet)
    for idx, (slug, pos, fn, cat, name) in enumerate(chunk):
        cx, cy = (idx % COLS)*CELL_W, (idx // COLS)*(CELL_H+LABEL_H)
        path = os.path.join(DIR, fn)
        try:
            img = Image.open(path).convert('RGB')
            r = min((CELL_W-8)/img.width, (CELL_H-LABEL_H-8)/img.height)
            img = img.resize((max(1,int(img.width*r)), max(1,int(img.height*r))))
            ox, oy = cx+4+(CELL_W-8-img.width)//2, cy+4
            sheet.paste(img, (ox, oy))
        except Exception as e:
            d.text((cx+10, cy+200), f"ERROR {e}", fill=(255,80,80))
        d.rectangle([cx, cy+CELL_H-LABEL_H+2, cx+CELL_W, cy+CELL_H], fill=(10,10,12))
        d.text((cx+6, cy+CELL_H-LABEL_H+6), f"{pos}. {fn}", fill=(255,255,120))
        d.text((cx+6, cy+CELL_H-16), f"[{cat}] {slug}", fill=(140,220,140))
    sheet.save(f'_audit_current/sheets/sheet_{batch:02d}.jpg', quality=82)
    batch += 1
print(f'{len(items)} images -> {batch} sheets in _audit_current/sheets')
