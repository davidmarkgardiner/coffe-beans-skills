#!/usr/bin/env python3
"""Test Coffee Copilot functionality on the website."""

from playwright.sync_api import sync_playwright
import time

def test_copilot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Use headless=False to see what's happening
        page = browser.new_page()

        print("🌐 Navigating to http://localhost:5176...")
        page.goto('http://localhost:5176')
        page.wait_for_load_state('networkidle')

        print("📸 Taking initial screenshot...")
        page.screenshot(path='/tmp/copilot_initial.png', full_page=True)

        # Look for the Coffee Copilot button (should be a floating button with coffee emoji)
        print("\n🔍 Looking for Coffee Copilot button...")

        # Try multiple selectors to find the copilot button
        selectors = [
            'button:has-text("☕")',
            'button[aria-label*="Coffee"]',
            'button[aria-label*="Copilot"]',
            'button[aria-label*="chat"]',
            '.fixed.bottom-4.right-4',
        ]

        button_found = False
        for selector in selectors:
            try:
                button = page.locator(selector).first
                if button.is_visible(timeout=1000):
                    print(f"✅ Found copilot button with selector: {selector}")
                    button_found = True

                    # Click the button
                    print("🖱️  Clicking copilot button...")
                    button.click()
                    time.sleep(1)

                    print("📸 Taking screenshot after clicking button...")
                    page.screenshot(path='/tmp/copilot_opened.png', full_page=True)

                    # Check if chat widget opened
                    chat_widget = page.locator('[role="dialog"]').first
                    if chat_widget.is_visible():
                        print("✅ Chat widget opened successfully!")

                        # Try to send a test message
                        print("\n💬 Testing chat functionality...")
                        message_input = page.locator('input[type="text"]').first
                        if message_input.is_visible():
                            message_input.fill("Hello, what beans do you recommend?")
                            print("✅ Typed test message")

                            # Find and click send button
                            send_button = page.locator('button:has-text("Send")').first
                            if send_button.is_visible():
                                send_button.click()
                                print("✅ Clicked send button")

                                # Wait for response
                                print("⏳ Waiting for AI response...")
                                time.sleep(3)

                                print("📸 Taking screenshot after sending message...")
                                page.screenshot(path='/tmp/copilot_chat.png', full_page=True)

                                # Check for response
                                messages = page.locator('[role="article"]').all()
                                print(f"📝 Found {len(messages)} message(s) in chat")

                            else:
                                print("❌ Send button not found")
                        else:
                            print("❌ Message input not found")
                    else:
                        print("❌ Chat widget did not open")

                    break
            except Exception as e:
                continue

        if not button_found:
            print("❌ Coffee Copilot button not found!")
            print("\n🔍 Inspecting page for all buttons...")
            all_buttons = page.locator('button').all()
            print(f"Found {len(all_buttons)} buttons on page:")
            for i, btn in enumerate(all_buttons[:10]):  # Show first 10
                try:
                    text = btn.text_content()
                    aria_label = btn.get_attribute('aria-label')
                    print(f"  {i+1}. Text: '{text}' | aria-label: '{aria_label}'")
                except:
                    pass

            print("\n📋 Page HTML structure:")
            print(page.content()[-2000:])  # Print last 2000 chars to see bottom of page

        print("\n✅ Test complete!")
        print("Screenshots saved to:")
        print("  - /tmp/copilot_initial.png")
        print("  - /tmp/copilot_opened.png")
        print("  - /tmp/copilot_chat.png")

        browser.close()

if __name__ == '__main__':
    test_copilot()
