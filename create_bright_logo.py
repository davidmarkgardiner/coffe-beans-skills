#!/usr/bin/env python3
"""Create a bright off-white/light gold logo for maximum visual impact"""

from PIL import Image, ImageEnhance

# Load the correct logo (has proper spelling)
correct_logo = Image.open('/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/src/assets/stockbridge-logo.png')

# Convert to RGBA if not already
correct_logo = correct_logo.convert('RGBA')

# Get pixel data
pixels = correct_logo.load()
width, height = correct_logo.size

# Background threshold - pixels lighter than this become transparent
background_threshold = 200

# Bright light gold/off-white color for maximum visibility
# Using a warm off-white with golden undertones
bright_r = 250  # Very light, almost white
bright_g = 240  # Slightly warmer
bright_b = 210  # Golden tint

# Process each pixel
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]

        # Check if this is a background pixel (light colored)
        if r > background_threshold and g > background_threshold and b > background_threshold:
            # Make background transparent
            pixels[x, y] = (r, g, b, 0)
        else:
            # This is part of the logo - convert to bright light gold
            # Calculate brightness of original pixel to preserve detail and edges
            brightness = (r + g + b) / 3.0 / 255.0

            # For very dark pixels (edges, details), use higher brightness
            # For mid-tones, use even brighter values
            if brightness < 0.3:
                # Dark edges and details - make them bright but preserve definition
                enhanced_brightness = 0.85
            else:
                # Everything else - make very bright
                enhanced_brightness = 0.95

            # Apply bright light gold color
            new_r = int(bright_r * enhanced_brightness)
            new_g = int(bright_g * enhanced_brightness)
            new_b = int(bright_b * enhanced_brightness)

            pixels[x, y] = (new_r, new_g, new_b, a)

# Enhance contrast for crisp edges
enhancer = ImageEnhance.Contrast(correct_logo)
correct_logo = enhancer.enhance(1.3)

# Enhance sharpness for crisp details
sharpness_enhancer = ImageEnhance.Sharpness(correct_logo)
correct_logo = sharpness_enhancer.enhance(1.5)

# Save the bright logo
output_path = '/Users/davidgardiner/Desktop/repo/coffe-beans-skills/coffee-website-react/src/assets/logo-variants/logo-stockbridge-bright.png'
correct_logo.save(output_path, 'PNG')

print(f"✓ Created bright off-white/light gold logo at: {output_path}")
print(f"✓ Logo size: {correct_logo.size}")
print(f"✓ Logo mode: {correct_logo.mode}")
print(f"✓ Colors: RGB({bright_r}, {bright_g}, {bright_b}) - Soft off-white with golden tint")
