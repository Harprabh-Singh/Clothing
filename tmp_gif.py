from PIL import Image
from pathlib import Path

def make_gif(src, out, ms, width=880):
    files = sorted(Path(src).glob('f*.png'))
    frames = []
    for f in files:
        im = Image.open(f).convert('RGB')
        h = int(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
        frames.append(im)
    frames[0].save(out, save_all=True, append_images=frames[1:],
                   duration=ms, loop=0, optimize=True)
    print(out, len(frames), 'frames')

make_gif('tmp_rec/swipe', 'tmp_shots/rec-swipe-between-doors.gif', 70)
make_gif('tmp_rec/select', 'tmp_shots/rec-garment-selection.gif', 80)
