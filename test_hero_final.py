#!/usr/bin/env python3
"""Final test to verify corrected logo with proper styling"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    time.sleep(3)

    # Take screenshot
    page.screenshot(path='/tmp/hero_final.png', full_page=False)
    print("✓ Final hero screenshot saved to /tmp/hero_final.png")

    # Verify logo
    logo_img = page.locator('img[alt*="Stockbridge"]').first
    if logo_img:
        print(f"✓ Logo alt text: {logo_img.get_attribute('alt')}")
        logo_width = logo_img.evaluate('el => el.getBoundingClientRect().width')
        logo_height = logo_img.evaluate('el => el.getBoundingClientRect().height')
        print(f"✓ Logo dimensions: {logo_width:.0f}px x {logo_height:.0f}px")

    browser.close()
