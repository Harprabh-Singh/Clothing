"""Cut the walk-in closet interior into depth layers for the parallax fix pass.

Layers (desktop 2048w + mobile 2:3 center-crop 1080w, alpha WebP):
  mid - the two side wardrobe blocks (hanging garments, shelves, drawers)
  fg  - nearest strips: extreme left/right dark edges + bottom floor strip

The background layer is the existing full interior image (interior-desktop/
mobile.webp) left intact underneath, so differential parallax motion can never
open holes — cutouts slide over their own baked surroundings.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SRC = Path(__file__).parent
PUB = Path("E:/websites/clothing/streetwear-site/public/images/entry")

interior = Image.open(SRC / "closet-interior.png").convert("RGB")


def erase_corner(img, box=(0, 1048, 175, 1152), feather=20):
    """Hide the generator watermark (bottom-left) with feathered dark texture
    sampled just to its right — same patch as process_entry_assets.py, which
    only applied it in memory and never wrote the masters back to disk."""
    l, t, r, b = box
    w, h = r - l, b - t
    ref = img.crop((l + 210, t, l + 210 + w, b)).filter(ImageFilter.GaussianBlur(8))
    ref = ref.point(lambda v: int(v * 0.85))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rectangle((feather // 2, feather // 2, w - feather // 2, h - feather // 2), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    img.paste(ref, (l, t), mask)


erase_corner(interior)
W, H = interior.size  # 2048 x 1152

# --- masks, in fractions of master size (from the 5% grid overlay) ---
MID_RECTS = [
    (0.070, 0.0, 0.395, 1.0),  # left wardrobe block
    (0.625, 0.0, 0.890, 1.0),  # right wardrobe block
]
FG_RECTS = [
    (0.0, 0.0, 0.070, 1.0),    # nearest left edge
    (0.890, 0.0, 1.0, 1.0),    # nearest right edge
    (0.0, 0.920, 1.0, 1.0),    # nearest floor strip
]


def build_mask(rects, feather_px):
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    for l, t, r, b in rects:
        d.rectangle((round(W * l), round(H * t), round(W * r), round(H * b)), fill=255)
    return mask.filter(ImageFilter.GaussianBlur(feather_px))


def center_crop_ratio(img, rw, rh):
    w, h = img.size
    target = rw / rh
    nw = round(h * target)
    x0 = (w - nw) // 2
    return img.crop((x0, 0, x0 + nw, h))


def save_layer(name, mask):
    rgba = interior.convert("RGBA")
    rgba.putalpha(mask)
    rgba.save(PUB / f"{name}-desktop.webp", "WEBP", quality=85, method=6)
    mobile = center_crop_ratio(rgba, 2, 3)
    mobile = mobile.resize((1080, round(1080 * mobile.height / mobile.width)), Image.LANCZOS)
    mobile.save(PUB / f"{name}-mobile.webp", "WEBP", quality=85, method=6)
    for f in (PUB / f"{name}-desktop.webp", PUB / f"{name}-mobile.webp"):
        print(f"{f.name:28s} {f.stat().st_size // 1024} KB")
    return rgba


mid_rgba = save_layer("interior-mid", build_mask(MID_RECTS, 14))
fg_rgba = save_layer("interior-fg", build_mask(FG_RECTS, 10))

# --- previews: layers over magenta (coverage check) + reassembled stack ---
for name, rgba in (("mid", mid_rgba), ("fg", fg_rgba)):
    check = Image.new("RGBA", (W, H), (255, 0, 255, 255))
    check.alpha_composite(rgba)
    check.convert("RGB").save(SRC / f"layer-{name}-preview.jpg", quality=88)

stack = interior.convert("RGBA")
stack.alpha_composite(mid_rgba)
stack.alpha_composite(fg_rgba)
stack.convert("RGB").save(SRC / "layer-stack-preview.jpg", quality=88)
print("previews written")
