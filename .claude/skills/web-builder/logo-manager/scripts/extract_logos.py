#!/usr/bin/env python3
"""
Script to extract individual logo variants from the logos.png composite image.
Creates transparent PNG files for each color variant.
"""

from PIL import Image
import os

def extract_logo_variants(input_path, output_dir):
    """
    Extract individual logo variants from the composite image.

    Args:
        input_path: Path to the composite logos.png image
        output_dir: Directory to save extracted logos
    """
    # Load the image
    img = Image.open(input_path)
    width, height = img.size

    # Calculate grid positions (2 columns, 3 rows)
    col_width = width // 2
    row_height = height // 3

    # Define the variants and their positions
    variants = [
        ("teal", 0, 0),           # Top left - teal variant
        ("golden", 1, 0),         # Top right - golden variant
        ("grey", 0, 1),           # Middle left - light grey variant
        ("golden-dark", 1, 1),    # Middle right - dark golden variant
        ("golden-icon", 0, 2),    # Bottom left - golden icon only
        ("grey-icon", 1, 2),      # Bottom right - grey icon only
    ]

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Extract each variant
    for name, col, row in variants:
        # Calculate crop box
        left = col * col_width
        top = row * row_height
        right = left + col_width
        bottom = top + row_height

        # Crop the image
        cropped = img.crop((left, top, right, bottom))

        # Add some padding trim to remove excess whitespace
        # Find the bounding box of non-white pixels
        if cropped.mode == 'RGBA':
            # If already RGBA, use alpha channel
            bbox = cropped.getbbox()
        else:
            # Convert to RGBA first
            cropped = cropped.convert('RGBA')
            # Get pixels
            pixels = cropped.load()

            # Find bounds by checking for non-white/transparent pixels
            min_x, min_y = cropped.size
            max_x = max_y = 0

            for x in range(cropped.size[0]):
                for y in range(cropped.size[1]):
                    r, g, b, a = pixels[x, y]
                    # Check if pixel is not white or transparent
                    if a > 10 and (r < 250 or g < 250 or b < 250):
                        min_x = min(min_x, x)
                        min_y = min(min_y, y)
                        max_x = max(max_x, x)
                        max_y = max(max_y, y)

            # Add small padding
            padding = 20
            bbox = (
                max(0, min_x - padding),
                max(0, min_y - padding),
                min(cropped.size[0], max_x + padding),
                min(cropped.size[1], max_y + padding)
            )

        if bbox:
            cropped = cropped.crop(bbox)

        # Save as transparent PNG
        output_path = os.path.join(output_dir, f"logo-stockbridge-{name}.png")
        cropped.save(output_path, 'PNG', optimize=True)
        print(f"✓ Created: {output_path}")

    # Create the main three variants we need
    # Copy the best ones to the standard names
    import shutil

    mappings = [
        (f"logo-stockbridge-teal.png", f"logo-stockbridge-teal.png"),
        (f"logo-stockbridge-golden.png", f"logo-stockbridge-golden.png"),
        (f"logo-stockbridge-grey.png", f"logo-stockbridge-grey.png"),
    ]

    print("\n✓ Logo variants extracted successfully!")
    print(f"✓ Output directory: {output_dir}")

if __name__ == "__main__":
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    input_path = os.path.join(project_dir, "src", "assets", "logos.png")
    output_dir = os.path.join(project_dir, "src", "assets", "logo-variants")

    print("Extracting logo variants...")
    print(f"Input: {input_path}")
    print(f"Output: {output_dir}\n")

    extract_logo_variants(input_path, output_dir)
