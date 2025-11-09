#!/usr/bin/env python3
"""
Make stockbridge-logo3.png background completely transparent.
"""

from PIL import Image
import os

def make_background_transparent(input_path, output_path):
    """Convert logo background to fully transparent."""

    # Open the image and convert to RGBA
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    # Create new image with transparent background
    new_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    new_pixels = new_img.load()

    # Process each pixel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # Calculate brightness (0-255)
            brightness = (r + g + b) / 3

            # If pixel is dark (part of the logo), keep it with full opacity
            # If pixel is light (background), make it fully transparent
            if brightness < 200:  # Dark pixels (logo design)
                new_pixels[x, y] = (r, g, b, 255)  # Keep with full opacity
            else:  # Light pixels (background)
                new_pixels[x, y] = (0, 0, 0, 0)  # Fully transparent

    # Save the result as PNG with transparency
    new_img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Successfully made logo background transparent")
    print(f"  Output: {output_path}")

if __name__ == '__main__':
    # Define paths
    input_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo3.png'
    output_path = input_path

    # Create backup
    backup_path = input_path.replace('.png', '-backup.png')
    if os.path.exists(input_path):
        img = Image.open(input_path)
        img.save(backup_path)
        print(f"✓ Created backup: {backup_path}")

    # Convert the logo
    make_background_transparent(input_path, output_path)
    print("\n✓ Logo transparency conversion complete!")
