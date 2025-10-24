#!/usr/bin/env python3
"""Create a golden/warm toned transparent logo with correct spelling"""

from PIL import Image

# Load the correct logo (has proper spelling)
correct_logo = Image.open('/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/src/assets/stockbridge-logo.png')

# Convert to RGBA if not already
correct_logo = correct_logo.convert('RGBA')

# Get pixel data
pixels = correct_logo.load()
width, height = correct_logo.size

# Background threshold - pixels lighter than this become transparent
background_threshold = 200

# Golden color for the logo - brighter and more vibrant
golden_r = 218
golden_g = 165
golden_b = 32

# Process each pixel
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]

        # Check if this is a background pixel (light colored)
        if r > background_threshold and g > background_threshold and b > background_threshold:
            # Make background transparent
            pixels[x, y] = (r, g, b, 0)
        else:
            # This is part of the logo - convert to golden
            # Calculate brightness of original pixel
            brightness = (r + g + b) / 3.0 / 255.0

            # Apply golden color scaled by original brightness
            new_r = int(golden_r * brightness)
            new_g = int(golden_g * brightness)
            new_b = int(golden_b * brightness)

            pixels[x, y] = (new_r, new_g, new_b, a)

# Save the golden logo
output_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/src/assets/logo-variants/logo-stockbridge-golden-correct.png'
correct_logo.save(output_path, 'PNG')

print(f"✓ Created golden logo with correct spelling at: {output_path}")
print(f"✓ Logo size: {correct_logo.size}")
print(f"✓ Logo mode: {correct_logo.mode}")
