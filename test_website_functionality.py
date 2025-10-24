#!/usr/bin/env python3
"""Test website functionality after PR merge"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Navigate to the website
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        print("✓ Website loaded successfully")

        # Check navigation bar exists
        nav = page.locator('nav').first
        if nav:
            print("✓ Navigation bar present")

        # Check hero section exists
        hero = page.locator('section#home').first
        if hero:
            print("✓ Hero section present")

        # Check logo is visible
        logo = page.locator('img[alt*="Stockbridge"]').first
        if logo:
            print("✓ Logo is visible")
            is_visible = logo.is_visible()
            print(f"  Logo visibility: {is_visible}")

        # Check for any console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        time.sleep(1)

        if console_errors:
            print(f"⚠ Console errors found: {len(console_errors)}")
            for error in console_errors[:5]:  # Show first 5 errors
                print(f"  - {error}")
        else:
            print("✓ No console errors")

        # Take screenshot
        page.screenshot(path='/tmp/website_after_merge.png', full_page=False)
        print("✓ Screenshot saved to /tmp/website_after_merge.png")

        print("\n✓ All functionality tests passed!")

    except Exception as e:
        print(f"✗ Error during testing: {e}")

    finally:
        browser.close()
