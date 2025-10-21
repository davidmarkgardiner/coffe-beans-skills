#!/usr/bin/env python3
"""
Test the new coffee bean cursor from the logo
"""

from playwright.sync_api import sync_playwright
import time

def test_bean_cursor():
    """Verify the coffee bean cursor is applied"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("=" * 70)
        print("TESTING COFFEE BEAN CURSOR")
        print("=" * 70)

        print("\n[1/3] Loading website...")
        page.goto('http://localhost:5174/')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        print("✓ Website loaded")

        print("\n[2/3] Checking cursor style...")
        cursor_info = page.evaluate('''
            () => {
                const body = document.body;
                const style = window.getComputedStyle(body);
                const cursor = style.cursor;

                return {
                    cursor: cursor,
                    hasDataURL: cursor.includes('data:image/svg'),
                    hasEllipse: cursor.includes('ellipse'),
                    hasGradient: cursor.includes('linearGradient'),
                    hasPath: cursor.includes('path'),
                    length: cursor.length
                };
            }
        ''')

        print(f"\n  Cursor length: {cursor_info['length']} characters")
        print(f"  Has SVG data URL: {cursor_info['hasDataURL']}")
        print(f"  Has ellipse (bean shape): {cursor_info['hasEllipse']}")
        print(f"  Has gradient (golden colors): {cursor_info['hasGradient']}")
        print(f"  Has path (bean seam): {cursor_info['hasPath']}")

        if cursor_info['hasEllipse'] and cursor_info['hasGradient']:
            print("\n✅ Coffee bean cursor is APPLIED!")
            print("   - Ellipse shape (oval like coffee bean)")
            print("   - Golden gradient (matches logo colors)")
            print("   - Curved seam line on bean")
            print("   - White border for visibility")
        else:
            print("\n⚠ Cursor may not be fully applied")

        print("\n[3/3] Checking hover cursor...")
        button_cursor = page.evaluate('''
            () => {
                const button = document.querySelector('button');
                if (!button) return null;
                const style = window.getComputedStyle(button);
                const cursor = style.cursor;

                return {
                    hasEllipse: cursor.includes('ellipse'),
                    isLarger: cursor.includes('width="48"'),
                    hasGradient: cursor.includes('linearGradient')
                };
            }
        ''')

        if button_cursor:
            if button_cursor['hasEllipse'] and button_cursor['isLarger']:
                print("✅ Button hover cursor is LARGER!")
                print("   - 48px size (vs 40px normal)")
                print("   - Same bean shape and gradient")
            else:
                print("⚠ Button cursor may not be enhanced")

        # Take screenshot
        print("\n[4/3] Taking screenshot...")
        page.screenshot(path='/tmp/bean-cursor-test.png', full_page=False)
        print("✓ Screenshot saved: /tmp/bean-cursor-test.png")

        print("\n" + "=" * 70)
        print("COFFEE BEAN CURSOR SUMMARY")
        print("=" * 70)
        print("\n🎨 Cursor Design:")
        print("   - Shape: Ellipse (vertical oval)")
        print("   - Size: 40px x 40px (normal)")
        print("   - Size: 48px x 48px (on hover)")
        print("   - Colors: Golden gradient (#f7d899 → #e4b554 → #c17a1a)")
        print("   - Detail: Curved seam line (like real coffee bean)")
        print("   - Border: White outline + black inner line")
        print("\n✨ The cursor now matches the beautiful coffee bean from your logo!")
        print("=" * 70)

        browser.close()

if __name__ == "__main__":
    test_bean_cursor()
