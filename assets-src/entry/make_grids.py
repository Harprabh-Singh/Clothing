"""Overlay a 5% measurement grid on the entry images so doorway geometry can be read off."""
from pathlib import Path

from PIL import Image, ImageDraw

SRC = Path(__file__).parent
OUT = SRC / "grids"
OUT.mkdir(exist_ok=True)

for name in ("hallway-closed.png", "hallway-open.png", "closet-interior.png"):
    img = Image.open(SRC / name).convert("RGB")
    w, h = img.size
    d = ImageDraw.Draw(img)
    for i in range(1, 20):
        x = round(w * i / 20)
        d.line([(x, 0), (x, h)], fill=(255, 60, 60), width=3)
        d.text((x + 6, 10), f"{i*5}", fill=(255, 120, 120))
    for j in range(1, 20):
        y = round(h * j / 20)
        d.line([(0, y), (w, y)], fill=(60, 120, 255), width=3)
        d.text((6, y + 6), f"{j*5}", fill=(120, 160, 255))
    # center crosshair
    d.line([(w // 2 - 40, h // 2), (w // 2 + 40, h // 2)], fill=(0, 255, 0), width=3)
    d.line([(w // 2, h // 2 - 40), (w // 2, h // 2 + 40)], fill=(0, 255, 0), width=3)
    out = OUT / name.replace(".png", "-grid.jpg")
    img.save(out, quality=88)
    print(out)
