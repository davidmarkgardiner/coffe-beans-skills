#!/usr/bin/env python3
"""
Convert stockbridge-logo2.png to have a pure white background.
More aggressive conversion that replaces all light colors with white.
"""

from PIL import Image, ImageDraw
import os

def convert_to_white_background_v2(input_path, output_path):
    """Convert logo to white background by replacing all light pixels."""

    # Open the image
    img = Image.open(input_path).convert('RGB')
    pixels = img.load()
    width, height = img.size

    # Create new image with white background
    new_img = Image.new('RGB', (width, height), (255, 255, 255))
    new_pixels = new_img.load()

    # Process each pixel
    # Keep only dark pixels (the logo design), replace light pixels with white
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]

            # Calculate brightness (0-255)
            brightness = (r + g + b) / 3

            # If pixel is dark (part of the logo), keep it
            # If pixel is light (background), make it white
            if brightness < 200:  # Dark pixels (logo design)
                new_pixels[x, y] = (r, g, b)
            else:  # Light pixels (background)
                new_pixels[x, y] = (255, 255, 255)

    # Save the result
    new_img.save(output_path, 'PNG', optimize=True, quality=95)
    print(f"✓ Successfully converted logo to pure white background")
    print(f"  Output: {output_path}")

if __name__ == '__main__':
    # Define paths
    input_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo2.png'
    output_path = input_path

    # Convert the logo
    convert_to_white_background_v2(input_path, output_path)
    print("\n✓ Logo conversion complete!")
