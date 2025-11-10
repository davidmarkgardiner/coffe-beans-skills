#!/usr/bin/env python3
"""Comprehensive diagnostic for Coffee Copilot."""

from playwright.sync_api import sync_playwright
import time

def diagnose():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Capture console messages and errors
        console_messages = []
        errors = []

        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("=" * 80)
        print("COFFEE COPILOT DIAGNOSTIC")
        print("=" * 80)

        print("\n1️⃣ Loading page...")
        page.goto('http://localhost:5176', wait_until='domcontentloaded', timeout=15000)
        time.sleep(3)

        print("\n2️⃣ Checking for CoffeeCopilot component...")

        # Check if component is in DOM
        copilot_elements = [
            ('Coffee button (☕)', 'button:has-text("☕")'),
            ('Aria label', 'button[aria-label*="Copilot"]'),
            ('Fixed bottom-right', '.fixed.bottom-4.right-4'),
            ('Any z-50 element', '[class*="z-50"]'),
        ]

        found_any = False
        for name, selector in copilot_elements:
            try:
                element = page.locator(selector).first
                count = page.locator(selector).count()
                if count > 0:
                    is_visible = element.is_visible(timeout=1000)
                    print(f"   ✅ {name}: Found ({count}), Visible: {is_visible}")
                    if is_visible:
                        found_any = True
                else:
                    print(f"   ❌ {name}: Not found")
            except Exception as e:
                print(f"   ❌ {name}: Error - {str(e)[:50]}")

        print("\n3️⃣ Checking App.tsx includes CoffeeCopilot...")
        page_content = page.content()
        if 'CoffeeCopilot' in page_content or 'copilot' in page_content.lower():
            print("   ✅ Copilot-related content found in page")
        else:
            print("   ❌ No copilot-related content in page HTML")

        print("\n4️⃣ Console messages (last 10)...")
        for msg in console_messages[-10:]:
            print(f"   {msg}")

        print("\n5️⃣ Errors...")
        if errors:
            for err in errors:
                print(f"   ❌ {err}")
        else:
            print("   ✅ No JavaScript errors")

        print("\n6️⃣ All buttons on page...")
        all_buttons = page.locator('button').all()
        print(f"   Total buttons: {len(all_buttons)}")

        print("\n   Fixed/floating buttons (z-index >= 40):")
        for btn in all_buttons:
            try:
                style = btn.get_attribute('class') or ''
                if 'z-' in style and ('fixed' in style or 'absolute' in style):
                    text = btn.text_content()[:30] or '(no text)'
                    aria = btn.get_attribute('aria-label') or '(no aria)'
                    print(f"     - '{text}' | {aria} | {style[:60]}")
            except:
                pass

        print("\n7️⃣ Backend health check...")
        try:
            import requests
            response = requests.get('http://localhost:3001/health', timeout=2)
            print(f"   ✅ Backend: {response.json()}")
        except Exception as e:
            print(f"   ❌ Backend error: {e}")

        print("\n8️⃣ Taking screenshot...")
        page.screenshot(path='/tmp/copilot_diagnostic.png', full_page=True)
        print("   📸 Saved to /tmp/copilot_diagnostic.png")

        print("\n" + "=" * 80)
        if found_any:
            print("✅ COPILOT BUTTON FOUND - Should be working!")
            print("   Try clicking the ☕ button in bottom-right corner")
        else:
            print("❌ COPILOT BUTTON NOT FOUND")
            print("   Possible issues:")
            print("   1. Component not rendering (check React DevTools)")
            print("   2. CSS hiding the button (check z-index/visibility)")
            print("   3. JavaScript error preventing mount")
        print("=" * 80)

        time.sleep(3)
        browser.close()

if __name__ == '__main__':
    diagnose()
