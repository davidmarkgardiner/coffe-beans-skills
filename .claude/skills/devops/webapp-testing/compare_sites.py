#!/usr/bin/env python3
"""Compare production and localhost sites by capturing screenshots."""

from playwright.sync_api import sync_playwright
import sys

def capture_sites():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Capture production site
        print("Capturing production site...")
        page = browser.new_page()
        page.set_default_timeout(60000)  # 60 second timeout
        page.goto('https://stockbridgecoffee.co.uk/', wait_until='domcontentloaded')
        page.wait_for_timeout(3000)  # Wait 3 seconds for content to load
        page.screenshot(path='/tmp/production.png', full_page=False)
        print("✓ Production screenshot saved to /tmp/production.png")

        # Capture localhost
        print("\nCapturing localhost...")
        page.goto('http://localhost:5173/#home', wait_until='domcontentloaded')
        page.wait_for_timeout(3000)  # Wait 3 seconds for content to load
        page.screenshot(path='/tmp/localhost.png', full_page=False)
        print("✓ Localhost screenshot saved to /tmp/localhost.png")

        browser.close()
        print("\n✓ Screenshots captured successfully")

if __name__ == '__main__':
    try:
        capture_sites()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
