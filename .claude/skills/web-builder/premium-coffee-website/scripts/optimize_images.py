#!/usr/bin/env python3
"""
Image Optimization Script for Premium Coffee Websites

This script converts images to WebP format and optimizes them for web use.
It helps maintain the premium quality while reducing file sizes for better performance.

Requirements:
  pip install Pillow

Usage:
  python optimize_images.py <input_directory> [output_directory]

Example:
  python optimize_images.py ./images ./optimized
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library is required. Install it with: pip install Pillow")
    sys.exit(1)


def optimize_image(input_path, output_path, quality=85):
    """
    Convert and optimize an image to WebP format.

    Args:
        input_path: Path to the input image
        output_path: Path to save the optimized image
        quality: WebP quality (0-100), default 85 for premium quality
    """
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Save as WebP with optimization
            img.save(output_path, 'WebP', quality=quality, method=6)

            # Calculate size reduction
            original_size = os.path.getsize(input_path)
            optimized_size = os.path.getsize(output_path)
            reduction = ((original_size - optimized_size) / original_size) * 100

            print(f"✓ {input_path.name} → {output_path.name} ({reduction:.1f}% reduction)")

    except Exception as e:
        print(f"✗ Error processing {input_path.name}: {str(e)}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python optimize_images.py <input_directory> [output_directory]")
        sys.exit(1)

    input_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else input_dir / "optimized"

    if not input_dir.exists():
        print(f"Error: Input directory '{input_dir}' does not exist")
        sys.exit(1)

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Supported image formats
    supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'}

    print(f"\n🖼️  Optimizing images from: {input_dir}")
    print(f"📁 Output directory: {output_dir}\n")

    # Process all images in the directory
    image_files = [f for f in input_dir.iterdir()
                   if f.is_file() and f.suffix.lower() in supported_formats]

    if not image_files:
        print("No images found to optimize.")
        return

    for img_file in image_files:
        output_file = output_dir / f"{img_file.stem}.webp"
        optimize_image(img_file, output_file)

    print(f"\n✅ Optimization complete! {len(image_files)} images processed.")
    print(f"📂 Optimized images saved to: {output_dir}")


if __name__ == "__main__":
    main()
