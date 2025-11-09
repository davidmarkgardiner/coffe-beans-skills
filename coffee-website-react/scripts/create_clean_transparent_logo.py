#!/usr/bin/env python3
"""
Create a clean transparent version from logo2.
"""

from PIL import Image

def create_transparent_logo(input_path, output_path):
    """Create transparent logo from white background logo."""

    # Open the image
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

            # If pixel is bright (white/light background), make transparent
            # If pixel is dark (logo), keep it
            if brightness > 240:  # Very bright = background
                new_pixels[x, y] = (0, 0, 0, 0)  # Transparent
            else:  # Logo design
                new_pixels[x, y] = (r, g, b, 255)  # Opaque

    # Save
    new_img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Created transparent logo: {output_path}")

if __name__ == '__main__':
    input_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo2.png'
    output_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo3.png'

    create_transparent_logo(input_path, output_path)
