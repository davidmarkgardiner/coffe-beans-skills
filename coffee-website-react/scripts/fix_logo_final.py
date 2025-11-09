#!/usr/bin/env python3
"""
Final fix for logo - remove ALL black and white backgrounds, keep only brown.
"""

from PIL import Image

def fix_logo_transparency(input_path, output_path):
    """Remove black and white backgrounds, keep only brown logo."""

    # Open image
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    # Create new transparent image
    new_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    new_pixels = new_img.load()

    # Process each pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # Calculate brightness
            brightness = (r + g + b) / 3

            # Keep only medium-brightness pixels (brown logo)
            # Reject very dark (black) and very bright (white)
            if 30 <= brightness <= 220:
                # This is part of the logo - keep it
                new_pixels[x, y] = (r, g, b, 255)
            else:
                # Background (black or white) - make transparent
                new_pixels[x, y] = (0, 0, 0, 0)

    # Save
    new_img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Fixed logo transparency")
    print(f"  Kept pixels with brightness 30-220 (brown logo)")
    print(f"  Removed black (< 30) and white (> 220) backgrounds")
    print(f"  Output: {output_path}")

if __name__ == '__main__':
    input_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo3.png'
    output_path = input_path

    fix_logo_transparency(input_path, output_path)
    print("\n✓ Logo is now fully transparent!")
