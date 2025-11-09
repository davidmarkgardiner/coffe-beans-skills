#!/usr/bin/env python3
"""
Convert stockbridge-logo2.png from beige background to white background.
"""

from PIL import Image
import os

def convert_to_white_background(input_path, output_path):
    """Convert logo from beige background to white background."""

    # Open the image
    img = Image.open(input_path).convert('RGBA')

    # Create a new white background image
    white_bg = Image.new('RGBA', img.size, (255, 255, 255, 255))

    # Get the pixel data
    pixels = img.load()
    width, height = img.size

    # Define the beige color range to replace (the current background)
    # The current background is approximately #F7F4ED (247, 244, 237)
    beige_min = (240, 235, 225)
    beige_max = (255, 250, 245)

    # Create a new image with white background
    new_img = Image.new('RGBA', img.size, (255, 255, 255, 255))

    # Process each pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # Check if pixel is in the beige range
            if (beige_min[0] <= r <= beige_max[0] and
                beige_min[1] <= g <= beige_max[1] and
                beige_min[2] <= b <= beige_max[2]):
                # Replace with white
                new_img.putpixel((x, y), (255, 255, 255, 255))
            else:
                # Keep the original pixel (the logo design)
                new_img.putpixel((x, y), (r, g, b, a))

    # Convert to RGB (remove alpha channel) for final output
    final_img = Image.new('RGB', new_img.size, (255, 255, 255))
    final_img.paste(new_img, mask=new_img.split()[3] if new_img.mode == 'RGBA' else None)

    # Save the result
    final_img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Successfully converted logo to white background")
    print(f"  Input: {input_path}")
    print(f"  Output: {output_path}")

if __name__ == '__main__':
    # Define paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    input_path = os.path.join(project_root, 'public', 'images', 'stockbridge-logo2.png')
    output_path = input_path  # Overwrite the original

    # Create a backup first
    backup_path = input_path.replace('.png', '-backup.png')
    if os.path.exists(input_path):
        img = Image.open(input_path)
        img.save(backup_path)
        print(f"✓ Created backup: {backup_path}")

    # Convert the logo
    convert_to_white_background(input_path, output_path)
