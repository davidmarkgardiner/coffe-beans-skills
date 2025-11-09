#!/usr/bin/env python3
"""
Fix logo black background issue - make only the brown logo visible, everything else transparent.
"""

from PIL import Image
import numpy as np

def remove_all_backgrounds(input_path, output_path):
    """Remove both black and white backgrounds, keep only brown logo."""

    # Open image
    img = Image.open(input_path).convert('RGBA')
    data = np.array(img)

    # Separate channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

    # Calculate brightness
    brightness = (r.astype(float) + g.astype(float) + b.astype(float)) / 3

    # Create mask: keep only medium-brightness pixels (the brown logo)
    # Brown colors are typically in the 40-180 brightness range
    # Black is < 30, White is > 220
    logo_mask = (brightness >= 30) & (brightness <= 220)

    # Apply mask - make everything else fully transparent
    new_alpha = np.where(logo_mask, 255, 0)

    # Create new image
    new_data = data.copy()
    new_data[:,:,3] = new_alpha

    # Save
    result = Image.fromarray(new_data, 'RGBA')
    result.save(output_path, 'PNG', optimize=True)
    print(f"✓ Removed all backgrounds from logo")
    print(f"  Output: {output_path}")

if __name__ == '__main__':
    input_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/public/images/stockbridge-logo3.png'
    output_path = input_path

    remove_all_backgrounds(input_path, output_path)
    print("\n✓ Logo background fixed!")
