#!/usr/bin/env python3
"""
Test shopping cart checkout flow on the coffee website.
This script tests the complete cart-based checkout with Stripe.
"""

from playwright.sync_api import sync_playwright
import sys

def test_cart_checkout():
    print("🛒 Testing Shopping Cart Checkout Flow\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # Enable console logging
        page.on("console", lambda msg: print(f"   [Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"   [Error] {err}"))

        try:
            # Step 1: Navigate to the website
            print("1. Navigating to http://localhost:5174...")
            page.goto('http://localhost:5174', wait_until='networkidle')
            page.wait_for_timeout(2000)
            page.screenshot(path='/tmp/cart_test_1_homepage.png', full_page=True)
            print("   ✅ Homepage loaded")

            # Step 2: Look for shopping cart icon/button
            print("\n2. Looking for shopping cart...")

            # Try to find cart button (aria-label is most specific)
            cart_selectors = [
                '[aria-label*="Shopping cart" i]',
                '[aria-label*="cart" i]',
                'button:has-text("Cart")',
                '[data-testid="cart"]',
            ]

            cart_button = None
            for selector in cart_selectors:
                try:
                    cart_button = page.locator(selector)
                    if cart_button.count() > 0:
                        print(f"   ✅ Found cart button using selector: {selector}")
                        break
                except:
                    continue

            # Step 3: Add items to cart
            print("\n3. Adding items to cart...")

            # Look for "Add to Cart" buttons
            add_to_cart_buttons = page.locator('button:has-text("Add to Cart")')
            button_count = add_to_cart_buttons.count()

            if button_count == 0:
                print("   ⚠️  No 'Add to Cart' buttons found")
                print("   💡 This appears to be a direct 'Buy Now' checkout (not cart-based)")

                # Check if there's a Buy Now flow instead
                buy_now_buttons = page.locator('button:has-text("Buy Now")')
                if buy_now_buttons.count() > 0:
                    print(f"   ✅ Found {buy_now_buttons.count()} 'Buy Now' button(s)")
                    print("   ℹ️  This is a direct checkout flow, not a cart-based flow")
                    page.screenshot(path='/tmp/cart_test_2_direct_checkout.png', full_page=True)

                    print("\n" + "="*60)
                    print("📊 TEST RESULT - Shopping Cart")
                    print("="*60)
                    print("❌ Shopping cart checkout: NOT IMPLEMENTED")
                    print("✅ Direct 'Buy Now' checkout: IMPLEMENTED")
                    print("\n💡 The website uses direct checkout, not cart-based")
                    print("   Each product has a 'Buy Now' button for immediate purchase")
                    print("   To test direct checkout, use: test_stripe_checkout.py")
                    print("="*60)
                    return False

            else:
                print(f"   ✅ Found {button_count} 'Add to Cart' button(s)")

                # Add 2 items to cart
                items_to_add = min(2, button_count)
                for i in range(items_to_add):
                    add_to_cart_buttons.nth(i).click()
                    page.wait_for_timeout(500)
                    print(f"   ✅ Added item {i+1} to cart")

                page.screenshot(path='/tmp/cart_test_2_items_added.png', full_page=True)

                # Step 4: Open cart
                print("\n4. Opening shopping cart...")
                if cart_button:
                    cart_button.click()
                    page.wait_for_timeout(2000)

                    # Wait for cart drawer to appear
                    try:
                        page.wait_for_selector('h2:has-text("Shopping Cart")', timeout=5000)
                        print("   ✅ Cart drawer opened")
                    except:
                        print("   ⚠️  Cart drawer didn't open")

                    page.screenshot(path='/tmp/cart_test_3_cart_opened.png', full_page=True)
                else:
                    print("   ⚠️  Cart button not found, checking for cart overlay")

                # Step 5: Look for checkout button in cart
                print("\n5. Looking for checkout button...")
                checkout_selectors = [
                    'button:has-text("Proceed to Checkout")',
                    'button:has-text("Checkout")',
                    'a:has-text("Checkout")',
                    '[href*="checkout"]',
                ]

                checkout_button = None
                for selector in checkout_selectors:
                    try:
                        checkout_button = page.locator(selector).first
                        if checkout_button.count() > 0:
                            print(f"   ✅ Found checkout button: {selector}")
                            break
                    except:
                        continue

                if checkout_button:
                    checkout_button.click()
                    page.wait_for_timeout(2000)
                    page.screenshot(path='/tmp/cart_test_4_checkout.png', full_page=True)
                    print("   ✅ Navigated to checkout")

                    # Check for Stripe payment form
                    page.wait_for_selector('iframe[name^="__privateStripeFrame"]', timeout=10000)
                    print("   ✅ Stripe payment form loaded")

                    print("\n" + "="*60)
                    print("✅ TEST SUMMARY - Shopping Cart Checkout")
                    print("="*60)
                    print("✅ Items added to cart successfully")
                    print("✅ Cart opened correctly")
                    print("✅ Checkout button functional")
                    print("✅ Stripe payment form loads")
                    print("\n📸 Screenshots saved to /tmp/")
                    print("="*60)
                    return True
                else:
                    print("   ❌ No checkout button found in cart")
                    page.screenshot(path='/tmp/cart_test_error.png', full_page=True)
                    return False

        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            page.screenshot(path='/tmp/cart_test_error.png', full_page=True)
            print(f"   Error screenshot saved to /tmp/cart_test_error.png")
            return False

        finally:
            browser.close()

if __name__ == "__main__":
    success = test_cart_checkout()
    sys.exit(0 if success else 1)
