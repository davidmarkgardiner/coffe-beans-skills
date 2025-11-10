#!/usr/bin/env python3
"""Simple test to check Coffee Copilot visibility."""

from playwright.sync_api import sync_playwright
import time

def test_copilot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()

        # Listen to console messages
        console_messages = []

        page = context.new_page()
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_messages.append(f"[ERROR] {err}"))

        print("🌐 Navigating to http://localhost:5176...")
        page.goto('http://localhost:5176', wait_until='domcontentloaded', timeout=10000)

        print("⏳ Waiting 3 seconds for page to load...")
        time.sleep(3)

        print("\n📸 Taking screenshot...")
        page.screenshot(path='/tmp/copilot_page.png', full_page=True)

        print("\n📋 Console messages:")
        for msg in console_messages[-20:]:  # Show last 20 messages
            print(f"  {msg}")

        print("\n🔍 Looking for Coffee Copilot button...")

        # Check if copilot button exists
        try:
            button = page.locator('button:has-text("☕")').first
            is_visible = button.is_visible(timeout=2000)
            print(f"✅ Copilot button found: {is_visible}")

            if is_visible:
                # Get button properties
                aria_label = button.get_attribute('aria-label')
                print(f"   Button aria-label: {aria_label}")

                # Try clicking
                print("🖱️  Clicking button...")
                button.click()
                time.sleep(2)

                page.screenshot(path='/tmp/copilot_clicked.png', full_page=True)
                print("📸 Screenshot after click saved")

        except Exception as e:
            print(f"❌ Button not found: {e}")

        print("\n🔍 All buttons on page:")
        buttons = page.locator('button').all()
        print(f"Total buttons: {len(buttons)}")
        for i, btn in enumerate(buttons[-5:]):  # Show last 5 buttons (likely fixed position ones)
            try:
                text = btn.text_content() or "(no text)"
                classes = btn.get_attribute('class') or ""
                aria = btn.get_attribute('aria-label') or ""
                print(f"  Button {i+1}: '{text[:30]}' | class: '{classes[:50]}' | aria: '{aria}'")
            except:
                pass

        print("\n✅ Screenshots saved:")
        print("  - /tmp/copilot_page.png")
        print("  - /tmp/copilot_clicked.png")

        time.sleep(2)  # Keep browser open for a moment
        browser.close()

if __name__ == '__main__':
    test_copilot()
