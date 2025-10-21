#!/usr/bin/env python3
"""
Test that the golden bean cursor is visible
"""

from playwright.sync_api import sync_playwright
import time

def test_cursor_visibility():
    """Test that the custom cursor is visible"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Testing golden bean cursor visibility...")
        print("=" * 60)

        # Navigate to the website
        print("\n[1/4] Loading website...")
        page.goto('http://localhost:5174/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        print("✓ Website loaded")

        # Move mouse to trigger cursor
        print("\n[2/4] Moving mouse to activate cursor...")
        page.mouse.move(400, 300)
        time.sleep(0.5)
        print("✓ Mouse moved")

        # Check if custom cursor element exists
        print("\n[3/4] Checking for custom cursor element...")
        cursor = page.locator('.custom-cursor')
        if cursor.count() > 0:
            print("✓ Custom cursor element found")

            # Check if cursor is visible (has is-active class)
            has_active_class = cursor.evaluate('el => el.classList.contains("is-active")')
            if has_active_class:
                print("✓ Cursor has 'is-active' class - should be visible")
            else:
                print("⚠ Cursor doesn't have 'is-active' class")

            # Get cursor styles
            opacity = cursor.evaluate('el => window.getComputedStyle(el).opacity')
            display = cursor.evaluate('el => window.getComputedStyle(el).display')
            width = cursor.evaluate('el => window.getComputedStyle(el).width')

            print(f"  - Opacity: {opacity}")
            print(f"  - Display: {display}")
            print(f"  - Width: {width}")

            if opacity == '1' and display != 'none':
                print("✓ Cursor is visible!")
            else:
                print("✗ Cursor might not be visible")
        else:
            print("✗ Custom cursor element not found")

        # Take screenshot
        print("\n[4/4] Taking screenshot...")
        page.screenshot(path='/tmp/cursor-test.png', full_page=False)
        print("✓ Screenshot saved: /tmp/cursor-test.png")

        # Hover over a button to test hover state
        print("\nTesting hover state on Sign In button...")
        sign_in_button = page.locator('button:has-text("Sign In")').first
        if sign_in_button.count() > 0:
            sign_in_button.hover()
            time.sleep(0.5)

            has_hovering_class = cursor.evaluate('el => el.classList.contains("is-hovering")')
            if has_hovering_class:
                print("✓ Cursor has 'is-hovering' class when over button")

                # Take screenshot of hover state
                page.screenshot(path='/tmp/cursor-hover-test.png', full_page=False)
                print("✓ Hover screenshot saved: /tmp/cursor-hover-test.png")
            else:
                print("⚠ Cursor doesn't have 'is-hovering' class")

        print("\n" + "=" * 60)
        print("Cursor test complete!")
        print("Check screenshots:")
        print("  - /tmp/cursor-test.png (normal state)")
        print("  - /tmp/cursor-hover-test.png (hover state)")
        print("=" * 60)

        browser.close()

if __name__ == "__main__":
    test_cursor_visibility()
