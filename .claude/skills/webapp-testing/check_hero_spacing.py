#!/usr/bin/env python3
"""
Screenshot the hero section of the coffee website to check spacing
"""

from playwright.sync_api import sync_playwright
import sys

def main():
    url = "https://coffee-65c46.web.app/"

    print(f"📸 Taking screenshot of {url}")

    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)

        # Create a page with desktop viewport
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})

        print("🌐 Navigating to website...")
        page.goto(url)

        # Wait for page to fully load
        print("⏳ Waiting for content to load...")
        page.wait_for_load_state('networkidle')

        # Wait for the logo image to be visible
        page.wait_for_selector('img[alt="Stockbridge Coffee Edinburgh"]', timeout=10000)

        # Take full page screenshot
        screenshot_path = '/tmp/hero_section_full.png'
        page.screenshot(path=screenshot_path, full_page=False)
        print(f"✅ Screenshot saved to: {screenshot_path}")

        # Get the hero section element bounds to check spacing
        logo = page.locator('img[alt="Stockbridge Coffee Edinburgh"]')
        est_text = page.locator('text=Est. 2025 · Stockbridge')
        desc_text = page.locator('text=Independent roastery')

        if logo.count() > 0 and est_text.count() > 0:
            logo_box = logo.bounding_box()
            est_box = est_text.bounding_box()

            if logo_box and est_box:
                gap = est_box['y'] - (logo_box['y'] + logo_box['height'])
                print(f"\n📏 Spacing measurements:")
                print(f"  Logo bottom: {logo_box['y'] + logo_box['height']}px")
                print(f"  'Est. 2025' top: {est_box['y']}px")
                print(f"  Gap between logo and text: {gap}px")

                if desc_text.count() > 0:
                    desc_box = desc_text.bounding_box()
                    if desc_box:
                        gap2 = desc_box['y'] - (est_box['y'] + est_box['height'])
                        print(f"  Gap between 'Est. 2025' and description: {gap2}px")

        # Get computed styles
        logo_margin = page.evaluate("""
            () => {
                const logo = document.querySelector('img[alt="Stockbridge Coffee Edinburgh"]');
                return window.getComputedStyle(logo).marginBottom;
            }
        """)
        print(f"\n🎨 Computed styles:")
        print(f"  Logo margin-bottom: {logo_margin}")

        browser.close()

        return screenshot_path

if __name__ == '__main__':
    try:
        screenshot_path = main()
        print(f"\n✨ Done! View screenshot at: {screenshot_path}")
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
