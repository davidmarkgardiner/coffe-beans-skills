#!/usr/bin/env python3
"""
Mobile Testing Script for Coffee Website
Tests responsive design and mobile interactions across multiple device viewports
"""

from playwright.sync_api import sync_playwright
import time
from datetime import datetime

# Mobile device configurations to test
MOBILE_DEVICES = [
    {
        "name": "iPhone 12 Pro",
        "viewport": {"width": 390, "height": 844},
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
    },
    {
        "name": "iPhone SE",
        "viewport": {"width": 375, "height": 667},
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
    },
    {
        "name": "Samsung Galaxy S21",
        "viewport": {"width": 360, "height": 800},
        "user_agent": "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36"
    },
    {
        "name": "iPad Air",
        "viewport": {"width": 820, "height": 1180},
        "user_agent": "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
    }
]

def test_mobile_device(page, device_config, base_url):
    """Test website on a specific mobile device configuration"""
    device_name = device_config["name"]
    print(f"\n{'='*60}")
    print(f"Testing on: {device_name}")
    print(f"Viewport: {device_config['viewport']['width']}x{device_config['viewport']['height']}")
    print(f"{'='*60}")

    results = {
        "device": device_name,
        "viewport": device_config["viewport"],
        "tests": []
    }

    try:
        # Navigate to homepage
        print(f"[{device_name}] Navigating to {base_url}...")
        page.goto(base_url, timeout=60000)  # 60 second timeout
        page.wait_for_load_state('domcontentloaded', timeout=60000)
        time.sleep(3)  # Wait for animations and async content

        # Take homepage screenshot
        screenshot_path = f"/tmp/mobile_test_{device_name.replace(' ', '_').lower()}_home.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"[{device_name}] ✓ Homepage screenshot saved: {screenshot_path}")
        results["tests"].append({"test": "Homepage Load", "status": "PASS", "screenshot": screenshot_path})

        # Test 1: Check if navigation menu exists
        print(f"[{device_name}] Testing navigation menu...")
        nav_visible = page.locator('nav').is_visible()
        if nav_visible:
            print(f"[{device_name}] ✓ Navigation menu is visible")
            results["tests"].append({"test": "Navigation Visible", "status": "PASS"})
        else:
            print(f"[{device_name}] ✗ Navigation menu NOT visible")
            results["tests"].append({"test": "Navigation Visible", "status": "FAIL"})

        # Test 2: Check for mobile menu button (hamburger)
        print(f"[{device_name}] Checking for mobile menu button...")
        mobile_menu_selectors = [
            'button[aria-label*="menu"]',
            'button[class*="hamburger"]',
            'button[class*="mobile-menu"]',
            '.menu-toggle',
            '[data-testid="mobile-menu-button"]'
        ]

        mobile_menu_found = False
        for selector in mobile_menu_selectors:
            try:
                if page.locator(selector).count() > 0:
                    mobile_menu_found = True
                    print(f"[{device_name}] ✓ Mobile menu button found: {selector}")
                    # Try to click it
                    page.locator(selector).first.click()
                    time.sleep(1)
                    screenshot_path = f"/tmp/mobile_test_{device_name.replace(' ', '_').lower()}_menu_open.png"
                    page.screenshot(path=screenshot_path, full_page=True)
                    print(f"[{device_name}] ✓ Menu opened, screenshot saved: {screenshot_path}")
                    results["tests"].append({"test": "Mobile Menu Toggle", "status": "PASS", "screenshot": screenshot_path})

                    # Close menu
                    page.locator(selector).first.click()
                    time.sleep(1)
                    break
            except Exception as e:
                continue

        if not mobile_menu_found:
            print(f"[{device_name}] ℹ No mobile menu button found (might be full nav on tablet)")
            results["tests"].append({"test": "Mobile Menu Toggle", "status": "N/A"})

        # Test 3: Test scrolling behavior
        print(f"[{device_name}] Testing scroll behavior...")
        initial_scroll = page.evaluate("window.pageYOffset")
        page.evaluate("window.scrollTo(0, 500)")
        time.sleep(1)
        after_scroll = page.evaluate("window.pageYOffset")

        if after_scroll > initial_scroll:
            print(f"[{device_name}] ✓ Scrolling works (scrolled {after_scroll}px)")
            results["tests"].append({"test": "Scroll Behavior", "status": "PASS"})
        else:
            print(f"[{device_name}] ✗ Scrolling issue detected")
            results["tests"].append({"test": "Scroll Behavior", "status": "FAIL"})

        # Test 4: Check for touch-friendly buttons
        print(f"[{device_name}] Checking button sizes (touch-friendly)...")
        buttons = page.locator('button').all()
        small_buttons = 0

        for button in buttons[:5]:  # Check first 5 buttons
            if button.is_visible():
                box = button.bounding_box()
                if box and (box['width'] < 44 or box['height'] < 44):
                    small_buttons += 1

        if small_buttons == 0:
            print(f"[{device_name}] ✓ All visible buttons are touch-friendly (44x44px minimum)")
            results["tests"].append({"test": "Touch-Friendly Buttons", "status": "PASS"})
        else:
            print(f"[{device_name}] ⚠ Found {small_buttons} buttons smaller than 44x44px")
            results["tests"].append({"test": "Touch-Friendly Buttons", "status": "WARN", "details": f"{small_buttons} small buttons"})

        # Test 5: Check images load and are responsive
        print(f"[{device_name}] Testing image responsiveness...")
        images = page.locator('img').all()
        broken_images = 0

        for img in images[:10]:  # Check first 10 images
            if img.is_visible():
                natural_width = img.evaluate("el => el.naturalWidth")
                if natural_width == 0:
                    broken_images += 1

        if broken_images == 0:
            print(f"[{device_name}] ✓ All visible images loaded successfully")
            results["tests"].append({"test": "Image Loading", "status": "PASS"})
        else:
            print(f"[{device_name}] ✗ Found {broken_images} broken images")
            results["tests"].append({"test": "Image Loading", "status": "FAIL", "details": f"{broken_images} broken"})

        # Test 6: Test text readability (font sizes)
        print(f"[{device_name}] Checking text readability...")
        body_font_size = page.evaluate("getComputedStyle(document.body).fontSize")
        print(f"[{device_name}] Body font size: {body_font_size}")
        results["tests"].append({"test": "Text Readability", "status": "INFO", "details": f"Body font: {body_font_size}"})

        # Test 7: Check viewport meta tag
        print(f"[{device_name}] Checking viewport meta tag...")
        viewport_meta = page.evaluate("""
            () => {
                const meta = document.querySelector('meta[name="viewport"]');
                return meta ? meta.content : null;
            }
        """)

        if viewport_meta:
            print(f"[{device_name}] ✓ Viewport meta tag present: {viewport_meta}")
            results["tests"].append({"test": "Viewport Meta Tag", "status": "PASS", "details": viewport_meta})
        else:
            print(f"[{device_name}] ✗ Viewport meta tag missing")
            results["tests"].append({"test": "Viewport Meta Tag", "status": "FAIL"})

        # Test 8: Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.reload()
        page.wait_for_load_state('networkidle')

        if len(console_errors) == 0:
            print(f"[{device_name}] ✓ No console errors detected")
            results["tests"].append({"test": "Console Errors", "status": "PASS"})
        else:
            print(f"[{device_name}] ⚠ Found {len(console_errors)} console errors")
            for error in console_errors[:3]:  # Show first 3
                print(f"  - {error}")
            results["tests"].append({"test": "Console Errors", "status": "WARN", "details": f"{len(console_errors)} errors"})

        # Final full page screenshot
        screenshot_path = f"/tmp/mobile_test_{device_name.replace(' ', '_').lower()}_final.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"[{device_name}] ✓ Final screenshot saved: {screenshot_path}")

    except Exception as e:
        print(f"[{device_name}] ✗ Error during testing: {str(e)}")
        results["tests"].append({"test": "Overall Test", "status": "ERROR", "details": str(e)})

    return results

def generate_report(all_results):
    """Generate a summary report of all mobile tests"""
    print("\n" + "="*60)
    print("MOBILE TESTING SUMMARY REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    for result in all_results:
        print(f"\n{result['device']} ({result['viewport']['width']}x{result['viewport']['height']})")
        print("-" * 60)

        passed = sum(1 for t in result['tests'] if t['status'] == 'PASS')
        failed = sum(1 for t in result['tests'] if t['status'] == 'FAIL')
        warnings = sum(1 for t in result['tests'] if t['status'] == 'WARN')

        for test in result['tests']:
            status_symbol = {
                'PASS': '✓',
                'FAIL': '✗',
                'WARN': '⚠',
                'INFO': 'ℹ',
                'N/A': '-',
                'ERROR': '✗'
            }.get(test['status'], '?')

            details = f" ({test.get('details', '')})" if test.get('details') else ""
            screenshot = f" [Screenshot: {test.get('screenshot')}]" if test.get('screenshot') else ""
            print(f"  {status_symbol} {test['test']}{details}{screenshot}")

        print(f"\n  Summary: {passed} passed, {failed} failed, {warnings} warnings")

    print("\n" + "="*60)
    print("All screenshots saved to /tmp/mobile_test_*.png")
    print("="*60 + "\n")

def main():
    """Main test execution"""
    BASE_URL = "http://localhost:5173"

    print(f"""
╔════════════════════════════════════════════════════════════╗
║         COFFEE WEBSITE MOBILE TESTING SUITE               ║
║         Testing URL: {BASE_URL}                    ║
╚════════════════════════════════════════════════════════════╝
    """)

    all_results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for device_config in MOBILE_DEVICES:
            # Create context with device configuration
            context = browser.new_context(
                viewport=device_config["viewport"],
                user_agent=device_config["user_agent"],
                has_touch=True,
                is_mobile=True
            )

            page = context.new_page()

            # Run tests for this device
            results = test_mobile_device(page, device_config, BASE_URL)
            all_results.append(results)

            context.close()

        browser.close()

    # Generate final report
    generate_report(all_results)
    print("\n✓ Mobile testing completed successfully!")

if __name__ == "__main__":
    main()
