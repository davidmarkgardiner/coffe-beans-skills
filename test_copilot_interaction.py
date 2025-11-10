#!/usr/bin/env python3
"""Test copilot chat and bug report on localhost."""

from playwright.sync_api import sync_playwright
import time

def test_copilot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        print("🌐 Opening localhost...")
        page.goto('http://localhost:5176', wait_until='domcontentloaded')
        time.sleep(2)

        print("\n🖱️  Opening copilot...")
        page.locator('button:has-text("☕")').first.click()
        time.sleep(1)

        print("\n💬 Testing Chat Mode...")
        message_input = page.locator('input#chat-input').first
        message_input.fill("What beans do you recommend?")
        page.locator('button:has-text("Send")').first.click()

        print("⏳ Waiting for response...")
        time.sleep(5)

        # Check messages
        messages = page.locator('[role="article"]').all()
        print(f"\n📝 Messages: {len(messages)}")
        for i, msg in enumerate(messages[-3:]):
            content = msg.text_content()
            print(f"  {i+1}. {content[:80]}...")

        print("\n🐛 Testing Bug Report Mode...")
        page.locator('button:has-text("🐛 Report Issue")').first.click()
        time.sleep(1)

        message_input.fill("Test bug report")
        page.locator('button:has-text("Submit")').first.click()

        print("⏳ Waiting for bug report response...")
        time.sleep(5)

        messages = page.locator('[role="article"]').all()
        print(f"\n📝 Messages: {len(messages)}")
        for i, msg in enumerate(messages[-3:]):
            content = msg.text_content()
            print(f"  {i+1}. {content[:100]}...")

        print("\n📋 Console messages (errors only):")
        for msg in console_messages:
            if 'error' in msg.lower() or 'failed' in msg.lower():
                print(f"  {msg}")

        time.sleep(2)
        browser.close()

if __name__ == '__main__':
    test_copilot()
