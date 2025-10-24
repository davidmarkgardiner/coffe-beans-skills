#!/usr/bin/env python3
"""Test script to verify responsive hero section across different screen sizes"""

from playwright.sync_api import sync_playwright
import time

viewports = [
    {'name': 'mobile', 'width': 375, 'height': 667},      # iPhone SE
    {'name': 'tablet', 'width': 768, 'height': 1024},     # iPad
    {'name': 'desktop', 'width': 1920, 'height': 1080},   # Full HD
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for viewport in viewports:
        page = browser.new_page(viewport={'width': viewport['width'], 'height': viewport['height']})

        # Navigate to the website
        page.goto('http://localhost:5173')

        # Wait for the page to load completely
        page.wait_for_load_state('networkidle')
        time.sleep(3)  # Extra wait for animations

        # Take a screenshot
        screenshot_path = f'/tmp/hero_{viewport["name"]}.png'
        page.screenshot(path=screenshot_path, full_page=False)

        print(f"✓ {viewport['name']} ({viewport['width']}x{viewport['height']}): {screenshot_path}")

        # Check the logo size
        logo_img = page.locator('img[alt*="Stockbridge"]').first
        if logo_img:
            logo_width = logo_img.evaluate('el => el.getBoundingClientRect().width')
            logo_height = logo_img.evaluate('el => el.getBoundingClientRect().height')
            print(f"  Logo dimensions: {logo_width:.0f}px x {logo_height:.0f}px")

        # Check for "Stockbridge Coffee" text instances
        text_elements = page.locator('text="Stockbridge Coffee"').all()
        print(f"  'Stockbridge Coffee' text instances: {len(text_elements)}")

        page.close()

    browser.close()

print("\n✓ All screenshots saved to /tmp/")
