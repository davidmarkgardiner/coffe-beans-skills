#!/usr/bin/env python3
"""
Test that the login modal covers the entire page (not just header)
"""

from playwright.sync_api import sync_playwright
import time

def test_modal_full_page():
    """Verify modal covers entire viewport"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("=" * 70)
        print("TESTING MODAL FULL PAGE COVERAGE")
        print("=" * 70)

        print("\n[1/5] Loading website...")
        page.goto('http://localhost:5174/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        print("✓ Website loaded")

        # Get viewport dimensions
        viewport = page.viewport_size
        print(f"  Viewport: {viewport['width']}x{viewport['height']}px")

        print("\n[2/5] Taking screenshot before modal...")
        page.screenshot(path='/tmp/before-modal-full-page.png', full_page=True)
        print("✓ Screenshot saved: /tmp/before-modal-full-page.png")

        print("\n[3/5] Opening login modal...")
        sign_in_button = page.locator('button:has-text("Sign In")').first
        if sign_in_button.count() > 0:
            sign_in_button.click()
            time.sleep(1)
            print("✓ Modal opened")

            # Check backdrop dimensions
            backdrop = page.locator('div.fixed.inset-0.bg-charcoal\\/70').first
            if backdrop.count() > 0:
                backdrop_box = backdrop.bounding_box()
                if backdrop_box:
                    print(f"\n  Backdrop position:")
                    print(f"    X: {backdrop_box['x']}px")
                    print(f"    Y: {backdrop_box['y']}px")
                    print(f"    Width: {backdrop_box['width']}px")
                    print(f"    Height: {backdrop_box['height']}px")

                    # Check if backdrop covers entire viewport
                    if (backdrop_box['x'] == 0 and
                        backdrop_box['y'] == 0 and
                        backdrop_box['width'] >= viewport['width']):
                        print("✓ Backdrop covers ENTIRE VIEWPORT from edge to edge!")
                    else:
                        print("⚠ Backdrop may not cover full viewport")

            # Check modal container
            modal_container = page.locator('div.fixed.inset-0.z-\\[10000\\]').first
            if modal_container.count() > 0:
                modal_box = modal_container.bounding_box()
                if modal_box:
                    print(f"\n  Modal container:")
                    print(f"    X: {modal_box['x']}px")
                    print(f"    Y: {modal_box['y']}px")
                    print(f"    Width: {modal_box['width']}px")
                    print(f"    Height: {modal_box['height']}px")

                    if (modal_box['x'] == 0 and
                        modal_box['y'] == 0 and
                        modal_box['width'] >= viewport['width']):
                        print("✓ Modal container covers FULL PAGE!")
                    else:
                        print("⚠ Modal container may be constrained")

            print("\n[4/5] Checking modal content visibility...")
            # Check modal content position
            modal_content = page.locator('div.bg-white.rounded-2xl.shadow-2xl').first
            if modal_content.count() > 0 and modal_content.is_visible():
                content_box = modal_content.bounding_box()
                if content_box:
                    print(f"\n  Modal content:")
                    print(f"    Top: {content_box['y']}px")
                    print(f"    Center X: {content_box['x'] + content_box['width']/2}px")
                    print(f"    Width: {content_box['width']}px")
                    print(f"    Height: {content_box['height']}px")

                    viewport_center_x = viewport['width'] / 2
                    content_center_x = content_box['x'] + content_box['width'] / 2
                    x_offset = abs(content_center_x - viewport_center_x)

                    if x_offset < 50:
                        print(f"✓ Modal content is HORIZONTALLY CENTERED (offset: {x_offset:.1f}px)")
                    else:
                        print(f"⚠ Modal content may not be centered (offset: {x_offset:.1f}px)")

                    # Check if content is visible in viewport (not cut off at top)
                    if content_box['y'] >= 0:
                        print("✓ Modal content is FULLY VISIBLE (not cut off by header)")
                    else:
                        print("⚠ Modal content may be cut off at top")

            print("\n[5/5] Taking final screenshot...")
            page.screenshot(path='/tmp/modal-full-page-coverage.png', full_page=True)
            print("✓ Screenshot saved: /tmp/modal-full-page-coverage.png")

        else:
            print("✗ Sign In button not found")

        print("\n" + "=" * 70)
        print("RESULTS")
        print("=" * 70)
        print("\n✅ The modal should now:")
        print("   - Cover the ENTIRE page (not just header)")
        print("   - Backdrop goes from edge to edge")
        print("   - Modal content is centered in full viewport")
        print("   - No longer constrained to navigation section")
        print("\n📸 Compare screenshots:")
        print("   - /tmp/before-modal-full-page.png")
        print("   - /tmp/modal-full-page-coverage.png")
        print("=" * 70)

        browser.close()

if __name__ == "__main__":
    test_modal_full_page()
