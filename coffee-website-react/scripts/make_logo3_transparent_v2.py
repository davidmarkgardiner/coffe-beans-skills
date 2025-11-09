#!/usr/bin/env python3
"""
Create a truly transparent version of stockbridge logo.
Uses stockbridge-logo.png as source since it has good transparency.
"""

from PIL import Image
import os

def ensure_transparent_background(input_path, output_path):
    """Ensure logo has fully transparent background."""

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

            # Keep dark pixels (logo), make light pixels transparent
            # Use a threshold of 230 to be more aggressive
            if brightness < 230:  # Dark pixels (logo design)
                new_pixels[x, y] = (r, g, b, 255)  # Keep with full opacity
            else:  # Light pixels (background)
                new_pixels[x, y] = (0, 0, 0, 0)  # Fully transparent

    # Save the result as PNG with transparency
    new_img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Successfully created transparent logo")
    print(f"  Output: {output_path}")

if __name__ == '__main__':
    # Use the stockbridge-logo.png as source (it has better transparency)
    input_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo.png'
    output_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo3.png'

    # Convert the logo
    ensure_transparent_background(input_path, output_path)
    print("\n✓ Transparent logo created successfully!")
