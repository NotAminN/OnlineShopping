import os, sys
from PIL import Image, ImageDraw, ImageFont

SRC = r"D:\A_Footages\alpha-shop\Front\public\images\products"
OUT = r"D:\A_Footages\alpha-shop\public\images\review"

files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
COLS = 6
TW, TH, LABEL_H = 300, 400, 26
BATCH = int(sys.argv[1]) if len(sys.argv) > 1 else 36

os.makedirs(OUT, exist_ok=True)
try:
    font = ImageFont.truetype("arial.ttf", 15)
except Exception:
    font = ImageFont.load_default()

for batch_start in range(0, len(files), BATCH):
    batch = files[batch_start:batch_start + BATCH]
    rows = (len(batch) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * TW, rows * (TH + LABEL_H)), "white")
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(batch):
        r, c = divmod(i, COLS)
        x, y = c * TW, r * (TH + LABEL_H)
        try:
            im = Image.open(os.path.join(SRC, name)).convert("RGB")
            im.thumbnail((TW - 8, TH - 8))
            sheet.paste(im, (x + (TW - im.width) // 2, y + (TH - im.height) // 2))
        except Exception as e:
            draw.text((x + 10, y + 10), f"ERR {e}", fill="red", font=font)
        draw.text((x + 4, y + TH + 4), name[:44], fill="black", font=font)
        draw.rectangle([x, y, x + TW - 1, y + TH + LABEL_H - 1], outline="#cccccc")
    out_path = os.path.join(OUT, f"sheet_{batch_start:03d}.jpg")
    sheet.save(out_path, quality=82)
    print(out_path, f"items {batch_start}-{batch_start+len(batch)-1}")
