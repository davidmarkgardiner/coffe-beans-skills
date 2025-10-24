#!/usr/bin/env python3
"""Test script to capture the current state of the hero section"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the website
    page.goto('http://localhost:5173')

    # Wait for the page to load completely
    page.wait_for_load_state('networkidle')
    time.sleep(2)  # Extra wait for animations

    # Take a screenshot of the hero section
    page.screenshot(path='/tmp/hero_current.png', full_page=False)

    # Get the hero section HTML
    hero_html = page.locator('section#home').inner_html()

    print("Hero section HTML captured")
    print(f"Screenshot saved to /tmp/hero_current.png")

    # Check for duplicate "Stockbridge Coffee" text
    text_elements = page.locator('text="Stockbridge Coffee"').all()
    print(f"\nFound {len(text_elements)} instances of 'Stockbridge Coffee' text")

    # Check the logo
    logo_img = page.locator('img[alt*="Stockbridge"]').first
    if logo_img:
        print(f"Logo found with alt text: {logo_img.get_attribute('alt')}")
        print(f"Logo class: {logo_img.get_attribute('class')}")

    browser.close()
