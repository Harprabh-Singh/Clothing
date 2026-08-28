"""Cut closet-interior.png into 5 depth layers for the parallax dolly-through.

Layers (desktop 2048w + mobile 2:3 center-crop, alpha WebP):
  layer-back   - center corridor / far back wall (smallest apparent motion)
  layer-left   - left wardrobe wall columns (medium motion, translates left)
  layer-right  - right wardrobe wall columns (medium motion, translates right)
  layer-ceil   - top ceiling strip (large motion, translates up)
  layer-floor  - bottom floor plane (largest motion, translates down)

Each layer is a masked alpha cutout of the full interior. The bg
(interior-desktop.webp) stays underneath as a fill so that no holes appear
when the layers spread apart during the parallax animation.

Feathering at mask edges prevents hard seams between moving layers.

Usage:
  cd e:/websites/clothing/streetwear-site
  python assets-src/entry/build_depth_layers.py
Requires: Pillow  (pip install pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SRC = Path(__file__).parent
PUB = Path("E:/websites/clothing/streetwear-site/public/images/entry")

interior = Image.open(SRC / "closet-interior.png").convert("RGB")
W, H = interior.size  # expect 2048 x 1152


# ── watermark erase (same patch as existing scripts) ─────────────────────────
def erase_corner(img, box=(0, 1048, 175, 1152), feather=20):
    l, t, r, b = box
    w, h = r - l, b - t
    ref = img.crop((l + 210, t, l + 210 + w, b)).filter(ImageFilter.GaussianBlur(8))
    ref = ref.point(lambda v: int(v * 0.85))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rectangle(
        (feather // 2, feather // 2, w - feather // 2, h - feather // 2), fill=255
    )
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    img.paste(ref, (l, t), mask)


erase_corner(interior)

# ── helper: build a soft mask from a list of fractional rects ────────────────
def build_mask(rects_frac, feather_px):
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    for l, t, r, b in rects_frac:
        d.rectangle(
            (round(W * l), round(H * t), round(W * r), round(H * b)), fill=255
        )
    return mask.filter(ImageFilter.GaussianBlur(feather_px))


# ── helper: save desktop + mobile versions ───────────────────────────────────
def center_crop_ratio(img, rw, rh):
    w, h = img.size
    target = rw / rh
    nw = round(h * target)
    x0 = (w - nw) // 2
    return img.crop((x0, 0, x0 + nw, h))


def save_layer(name, mask):
    rgba = interior.convert("RGBA")
    rgba.putalpha(mask)
    desk = PUB / f"{name}-desktop.webp"
    mob  = PUB / f"{name}-mobile.webp"
    rgba.save(desk, "WEBP", quality=85, method=6)
    mobile = center_crop_ratio(rgba, 2, 3)
    mobile = mobile.resize(
        (1080, round(1080 * mobile.height / mobile.width)), Image.LANCZOS
    )
    mobile.save(mob, "WEBP", quality=85, method=6)
    print(f"{desk.name:36s} {desk.stat().st_size // 1024:>4} KB")
    print(f"{mob.name:36s} {mob.stat().st_size // 1024:>4} KB")
    return rgba


# ── Layer definitions (fractions of master width/height) ─────────────────────
LAYERS = {
    "layer-back":  ([(0.39, 0.08, 0.61, 0.88)],  40),
    "layer-left":  ([(0.00, 0.00, 0.42, 1.00)],  30),
    "layer-right": ([(0.58, 0.00, 1.00, 1.00)],  30),
    "layer-ceil":  ([(0.00, 0.00, 1.00, 0.13)],  22),
    "layer-floor": ([(0.00, 0.82, 1.00, 1.00)],  22),
}

for name, (rects, feather) in LAYERS.items():
    mask = build_mask(rects, feather)
    save_layer(name, mask)

print("\nAll 5 depth layers written.")
