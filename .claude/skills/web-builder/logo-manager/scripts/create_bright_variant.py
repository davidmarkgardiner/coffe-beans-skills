#!/usr/bin/env python3
"""
Create a bright off-white/light gold logo variant for maximum visibility on dark backgrounds

This script converts a logo with correct spelling but dark colors into a bright,
high-contrast variant suitable for hero sections with dark backgrounds.

Usage:
    python create_bright_variant.py <input_logo.png> <output_logo.png>

    Or with default paths:
    python create_bright_variant.py

Requirements:
    pip install Pillow
"""

from PIL import Image, ImageEnhance
import sys

def create_bright_logo(input_path, output_path):
    """
    Create a bright logo variant with off-white/light gold coloring

    Args:
        input_path: Path to input logo (should have correct spelling)
        output_path: Path to save bright logo variant
    """

    # Load the logo
    logo = Image.open(input_path)

    # Convert to RGBA if not already
    logo = logo.convert('RGBA')

    # Get pixel data
    pixels = logo.load()
    width, height = logo.size

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
    enhancer = ImageEnhance.Contrast(logo)
    logo = enhancer.enhance(1.3)

    # Enhance sharpness for crisp details
    sharpness_enhancer = ImageEnhance.Sharpness(logo)
    logo = sharpness_enhancer.enhance(1.5)

    # Save the bright logo
    logo.save(output_path, 'PNG')

    print(f"✓ Created bright logo variant at: {output_path}")
    print(f"✓ Logo size: {logo.size}")
    print(f"✓ Logo mode: {logo.mode}")
    print(f"✓ Colors: RGB({bright_r}, {bright_g}, {bright_b}) - Soft off-white with golden tint")

if __name__ == "__main__":
    if len(sys.argv) == 3:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
    else:
        # Default paths
        input_path = 'logo-source.png'
        output_path = 'logo-bright.png'
        print(f"Using default paths:")
        print(f"  Input: {input_path}")
        print(f"  Output: {output_path}")
        print()

    create_bright_logo(input_path, output_path)
