#!/usr/bin/env python3
"""
Logo Asset Export Script

Generates optimized logo assets in various formats and sizes for web deployment.
Supports PNG, WebP, and generates favicon and social media preview images.

Requirements:
    pip install Pillow

Usage:
    python export_logo_assets.py <input_logo.png> --variant teal --output ./public/images
    python export_logo_assets.py logo.svg --all-variants --output ./dist

Example:
    # Export single variant
    python export_logo_assets.py stockbridge-teal.png --variant teal

    # Export all variants with custom output
    python export_logo_assets.py logo-base.png --all-variants --output ./public/images

    # Export with specific DPI for retina
    python export_logo_assets.py logo.png --variant golden --dpi 3
"""

import argparse
import sys
from pathlib import Path
from typing import List, Tuple

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library not found.")
    print("Install it with: pip install Pillow")
    sys.exit(1)


class LogoExporter:
    """Handles logo export in various formats and sizes."""

    VARIANTS = ['teal', 'golden', 'grey']

    # Standard sizes for web usage
    WEB_SIZES = {
        'navigation': 56,
        'hero': 120,
        'footer': 48,
    }

    # Favicon and social media sizes
    ICON_SIZES = {
        'favicon-32': (32, 32),
        'favicon-192': (192, 192),
        'apple-touch-icon': (180, 180),
        'og-image': (1200, 630),
        'twitter-card': (1200, 600),
    }

    def __init__(self, input_path: str, output_dir: str = './output', dpi: int = 2):
        """
        Initialize the logo exporter.

        Args:
            input_path: Path to the input logo file
            output_dir: Directory to output generated files
            dpi: DPI multiplier for retina displays (2 or 3)
        """
        self.input_path = Path(input_path)
        self.output_dir = Path(output_dir)
        self.dpi = dpi

        if not self.input_path.exists():
            raise FileNotFoundError(f"Input file not found: {self.input_path}")

        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export_variant(self, variant: str, export_icons: bool = False) -> List[Path]:
        """
        Export a single logo variant in multiple formats.

        Args:
            variant: Variant name (teal, golden, grey)
            export_icons: Whether to export favicon and social media icons

        Returns:
            List of generated file paths
        """
        if variant not in self.VARIANTS:
            raise ValueError(f"Invalid variant: {variant}. Must be one of {self.VARIANTS}")

        generated_files = []

        # Load the source image
        with Image.open(self.input_path) as img:
            # Ensure RGBA mode for transparency
            if img.mode != 'RGBA':
                img = img.convert('RGBA')

            # Export web-optimized PNG (standard size)
            png_path = self.output_dir / f"logo-stockbridge-{variant}.png"
            img.save(png_path, 'PNG', optimize=True)
            generated_files.append(png_path)
            print(f"✓ Generated: {png_path}")

            # Export WebP (smaller file size)
            webp_path = self.output_dir / f"logo-stockbridge-{variant}.webp"
            img.save(webp_path, 'WEBP', quality=90, method=6)
            generated_files.append(webp_path)
            print(f"✓ Generated: {webp_path}")

            # Export retina versions
            if self.dpi > 1:
                retina_img = img.resize(
                    (img.width * self.dpi, img.height * self.dpi),
                    Image.Resampling.LANCZOS
                )
                retina_path = self.output_dir / f"logo-stockbridge-{variant}@{self.dpi}x.png"
                retina_img.save(retina_path, 'PNG', optimize=True)
                generated_files.append(retina_path)
                print(f"✓ Generated: {retina_path} (retina)")

            # Export icons if requested
            if export_icons:
                icon_files = self._export_icons(img, variant)
                generated_files.extend(icon_files)

        return generated_files

    def _export_icons(self, img: Image.Image, variant: str) -> List[Path]:
        """
        Export favicon and social media icons.

        Args:
            img: Source PIL Image
            variant: Variant name

        Returns:
            List of generated icon file paths
        """
        generated_files = []

        for icon_name, size in self.ICON_SIZES.items():
            # Create square canvas for favicon/icons
            if icon_name.startswith('favicon') or icon_name == 'apple-touch-icon':
                icon_img = self._create_square_icon(img, size[0])
            else:
                # Social media cards - maintain aspect ratio with padding
                icon_img = self._create_social_card(img, size)

            # Determine format and path
            if icon_name.startswith('favicon'):
                icon_path = self.output_dir / f"{icon_name}.png"
            else:
                icon_path = self.output_dir / f"{icon_name}-{variant}.png"

            icon_img.save(icon_path, 'PNG', optimize=True)
            generated_files.append(icon_path)
            print(f"✓ Generated: {icon_path}")

        return generated_files

    def _create_square_icon(self, img: Image.Image, size: int) -> Image.Image:
        """
        Create a square icon by fitting the logo in a square canvas.

        Args:
            img: Source image
            size: Target size (width and height)

        Returns:
            Square PIL Image
        """
        # Calculate scaling to fit within square while maintaining aspect ratio
        aspect = img.width / img.height
        if aspect > 1:
            # Wide logo
            new_width = size
            new_height = int(size / aspect)
        else:
            # Tall logo
            new_height = size
            new_width = int(size * aspect)

        # Resize logo
        resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Create transparent square canvas
        canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))

        # Paste logo in center
        offset = ((size - new_width) // 2, (size - new_height) // 2)
        canvas.paste(resized, offset, resized)

        return canvas

    def _create_social_card(self, img: Image.Image, size: Tuple[int, int]) -> Image.Image:
        """
        Create a social media card by centering logo on a background.

        Args:
            img: Source image
            size: Target size (width, height)

        Returns:
            Social card PIL Image
        """
        # Create white background
        canvas = Image.new('RGBA', size, (255, 255, 255, 255))

        # Scale logo to fit (max 60% of canvas)
        max_width = int(size[0] * 0.6)
        max_height = int(size[1] * 0.6)

        aspect = img.width / img.height
        if img.width > max_width or img.height > max_height:
            if aspect > 1:
                new_width = max_width
                new_height = int(max_width / aspect)
            else:
                new_height = max_height
                new_width = int(max_height * aspect)

            logo = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        else:
            logo = img

        # Paste logo in center
        offset = ((size[0] - logo.width) // 2, (size[1] - logo.height) // 2)
        canvas.paste(logo, offset, logo)

        return canvas

    def export_all_variants(self, export_icons: bool = False) -> List[Path]:
        """
        Export all logo variants.

        Args:
            export_icons: Whether to export icons for all variants

        Returns:
            List of all generated file paths
        """
        all_files = []
        for variant in self.VARIANTS:
            print(f"\n📦 Exporting {variant} variant...")
            files = self.export_variant(variant, export_icons)
            all_files.extend(files)
        return all_files


def main():
    parser = argparse.ArgumentParser(
        description='Export logo assets for web deployment',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    parser.add_argument('input', help='Input logo file (PNG, SVG, etc.)')
    parser.add_argument(
        '--variant',
        choices=['teal', 'golden', 'grey'],
        help='Export a single variant'
    )
    parser.add_argument(
        '--all-variants',
        action='store_true',
        help='Export all variants (assumes input is base logo)'
    )
    parser.add_argument(
        '--output',
        default='./output',
        help='Output directory (default: ./output)'
    )
    parser.add_argument(
        '--dpi',
        type=int,
        default=2,
        choices=[1, 2, 3],
        help='DPI multiplier for retina displays (default: 2)'
    )
    parser.add_argument(
        '--icons',
        action='store_true',
        help='Also export favicons and social media icons'
    )

    args = parser.parse_args()

    if not args.variant and not args.all_variants:
        parser.error('Either --variant or --all-variants must be specified')

    try:
        exporter = LogoExporter(args.input, args.output, args.dpi)

        print(f"🚀 Logo Export Tool")
        print(f"📁 Input: {args.input}")
        print(f"📁 Output: {args.output}")
        print(f"🎨 DPI: {args.dpi}x")
        print()

        if args.all_variants:
            generated = exporter.export_all_variants(export_icons=args.icons)
        else:
            generated = exporter.export_variant(args.variant, export_icons=args.icons)

        print(f"\n✅ Successfully generated {len(generated)} files")
        print(f"📂 Output directory: {args.output}")

    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
