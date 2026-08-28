"""Build the web-ready entry-sequence assets from the generated masters.

Outputs (public/images/entry/):
  door.webp              - door slab cropped from the closed render (baked grain/light/handle)
  frame-desktop.webp     - open-doorway hallway, 2048w
  frame-mobile.webp      - open-doorway hallway, 2:3 center crop, 1080w
  interior-desktop.webp  - walk-in closet interior, 2048w
  interior-mobile.webp   - interior, 2:3 center crop, 1080w
  interior-blur.webp     - heavily blurred interior (pre-sharpen layer), 1024w
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path(__file__).parent
PUB = Path("E:/websites/clothing/streetwear-site/public/images/entry")
PUB.mkdir(parents=True, exist_ok=True)

closed = Image.open(SRC / "hallway-closed.png").convert("RGB")
opened = Image.open(SRC / "hallway-open.png").convert("RGB")
interior = Image.open(SRC / "closet-interior.png").convert("RGB")


def erase_corner(img, box=(0, 1048, 175, 1152), feather=20):
    """Hide the generator watermark (bottom-left) with feathered dark texture
    sampled just to its right. Mobile crops and the door crop never include it."""
    l, t, r, b = box
    w, h = r - l, b - t
    ref = img.crop((l + 210, t, l + 210 + w, b)).filter(ImageFilter.GaussianBlur(8))
    ref = ref.point(lambda v: int(v * 0.85))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rectangle((feather // 2, feather // 2, w - feather // 2, h - feather // 2), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    img.paste(ref, (l, t), mask)


for img in (closed, opened, interior):
    erase_corner(img)

# measured from the 5% grid overlays: door slab incl. baked edge glow
DOOR = (39.0, 7.5, 61.4, 91.8)  # left, top, right, bottom in % (bottom stops at the threshold, excluding the floor light pool)


def pct_crop(img, box):
    w, h = img.size
    l, t, r, b = box
    return img.crop((round(w * l / 100), round(h * t / 100), round(w * r / 100), round(h * b / 100)))


def center_crop_ratio(img, rw, rh):
    w, h = img.size
    target = rw / rh
    if w / h > target:
        nw = round(h * target)
        x0 = (w - nw) // 2
        return img.crop((x0, 0, x0 + nw, h))
    nh = round(w / target)
    y0 = (h - nh) // 2
    return img.crop((0, y0, w, y0 + nh))


def save_webp(img, name, q=80):
    path = PUB / name
    img.save(path, "WEBP", quality=q, method=6)
    print(f"{name:24s} {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} KB")


save_webp(pct_crop(closed, DOOR), "door.webp", 85)
save_webp(opened, "frame-desktop.webp")
save_webp(interior, "interior-desktop.webp")

for name, img in (("frame", opened), ("interior", interior)):
    mobile = center_crop_ratio(img, 2, 3)
    mobile = mobile.resize((1080, round(1080 * mobile.height / mobile.width)), Image.LANCZOS)
    save_webp(mobile, f"{name}-mobile.webp")

blur = interior.filter(ImageFilter.GaussianBlur(18)).resize((1024, 576), Image.LANCZOS)
save_webp(blur, "interior-blur.webp", 70)

# door crop preview for visual verification
preview = pct_crop(closed, DOOR)
preview.save(SRC / "door-preview.jpg", quality=90)
print("preview:", SRC / "door-preview.jpg", preview.size)
