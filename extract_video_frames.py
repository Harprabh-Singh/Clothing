"""
Video to High-Quality Frames Extractor

Usage:
    python extract_video_frames.py --video <path_to_video> [--fps 30] [--watermarks]

What it does:
    1. Extracts frames from the original video at the specified FPS using ffmpeg.
    2. Removes bottom-left and bottom-right watermarks (same as existing frames).
    3. Saves clean, crisp frames as AVIF in public/kimi_folder.

Requirements:
    - ffmpeg (already installed at node_modules/ffmpeg-static/ffmpeg.exe)
    - Python 3 with Pillow, numpy

Example:
    python extract_video_frames.py --video "C:/Users/Harprabh/Videos/door.mp4" --fps 30 --watermarks
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

# ─── Config ───────────────────────────────────────────────────────────────────
FFMPEG_EXE = r"E:\websites\clothing\streetwear-site\node_modules\ffmpeg-static\ffmpeg.exe"
OUTPUT_DIR = r"E:\websites\clothing\streetwear-site\public\kimi_folder"


def get_watermark_regions(h, w):
    """Return watermark bounding boxes for a given image size."""
    left_wm = {
        'x1': 0, 'x2': 160,
        'y1': h - 85, 'y2': h - 10
    }
    right_wm = {
        'x1': w - 280, 'x2': w,
        'y1': h - 80, 'y2': h - 5
    }
    return left_wm, right_wm


def remove_watermark_region(arr, region, source_offset=120):
    """Remove a watermark by extrapolating from pixels above it."""
    x1, x2 = region['x1'], region['x2']
    y1, y2 = region['y1'], region['y2']
    result = arr.copy()
    src_y1 = max(0, y1 - source_offset)
    src_y2 = y1
    source_strip = result[src_y1:src_y2, x1:x2].astype(np.float32)
    if source_strip.shape[0] == 0:
        return result
    top_row = source_strip[0]
    bottom_row = source_strip[-1]
    fill_h = y2 - y1
    for dy in range(fill_h):
        t = (dy + 1) / (fill_h + source_offset)
        row = bottom_row + (bottom_row - top_row) * t * 0.3
        noise = np.random.normal(0, 1.5, row.shape)
        row = row + noise
        row = np.clip(row, 0, 255)
        result[y1 + dy, x1:x2] = row.astype(np.uint8)
    return result


def process_frame(input_path, output_path, remove_watermarks=True):
    """Open a frame, optionally remove watermarks, sharpen, save as AVIF."""
    img = Image.open(input_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    arr = np.array(img)
    h, w = arr.shape[:2]

    if remove_watermarks:
        left_wm, right_wm = get_watermark_regions(h, w)
        arr = remove_watermark_region(arr, left_wm, source_offset=100)
        arr = remove_watermark_region(arr, right_wm, source_offset=100)

    img = Image.fromarray(arr)

    # Slight sharpening for crispness (native video frames are already high quality,
    # so we only do a light unsharp mask instead of heavy upscaling)
    sharpened = img.filter(ImageFilter.UnsharpMask(radius=1, percent=80, threshold=3))

    # Save as AVIF with high quality
    sharpened.save(output_path, format='AVIF', quality=85)


def extract_frames(video_path, fps, temp_dir):
    """Use ffmpeg to extract frames at the given FPS."""
    pattern = os.path.join(temp_dir, "frame_%06d.png")
    cmd = [
        FFMPEG_EXE,
        '-y',                           # overwrite
        '-i', video_path,               # input
        '-vf', f'fps={fps},scale=1920:1080:flags=lanczos',  # fps + lanczos scale
        '-pix_fmt', 'rgb24',            # full color
        pattern,                        # output pattern
    ]
    print(f"Running ffmpeg extraction at {fps}fps...")
    print(f"Command: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ffmpeg stderr: {result.stderr}")
        raise RuntimeError(f"ffmpeg failed with code {result.returncode}")
    print("Extraction complete.")


def main():
    parser = argparse.ArgumentParser(description="Extract high-quality frames from video")
    parser.add_argument('--video', required=True, help='Path to the original video file')
    parser.add_argument('--fps', type=int, default=30, help='Frames per second to extract (default: 30)')
    parser.add_argument('--watermarks', action='store_true', default=True, help='Remove watermarks (default: True)')
    parser.add_argument('--no-watermarks', dest='watermarks', action='store_false', help='Skip watermark removal')
    args = parser.parse_args()

    video_path = os.path.abspath(args.video)
    if not os.path.exists(video_path):
        print(f"ERROR: Video not found: {video_path}")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with tempfile.TemporaryDirectory() as temp_dir:
        # Step 1: Extract raw frames with ffmpeg
        extract_frames(video_path, args.fps, temp_dir)

        # Step 2: Get sorted list of extracted frames
        extracted = sorted([
            f for f in os.listdir(temp_dir)
            if f.lower().endswith('.png')
        ])
        print(f"Extracted {len(extracted)} frames.")

        if len(extracted) == 0:
            print("ERROR: No frames were extracted.")
            sys.exit(1)

        # Step 3: Process each frame (watermark removal + AVIF)
        for i, filename in enumerate(extracted, 1):
            input_path = os.path.join(temp_dir, filename)
            output_name = f"ezgif-frame-{str(i).zfill(3)}.avif"
            output_path = os.path.join(OUTPUT_DIR, output_name)

            process_frame(input_path, output_path, remove_watermarks=args.watermarks)

            if i % 30 == 0 or i == len(extracted):
                print(f"  Processed {i}/{len(extracted)} -> {output_name}")

    print(f"\nDone! All frames saved to: {OUTPUT_DIR}")
    print(f"Total frames: {len(extracted)}")
    print(f"Resolution: 1920x1080 (native from video)")
    print(f"Format: AVIF")
    print(f"\nUpdate DoorSequence.jsx TOTAL_FRAMES to {len(extracted)} if needed.")


if __name__ == '__main__':
    main()
