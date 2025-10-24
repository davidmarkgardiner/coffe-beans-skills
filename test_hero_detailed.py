#!/usr/bin/env python3
"""Detailed test to verify the current state of the hero section"""

from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    time.sleep(3)

    print("=== HERO SECTION ANALYSIS ===\n")

    # Check for hero section
    hero = page.locator('section#home').first
    if hero:
        print("✓ Hero section found")

        # Get hero HTML
        hero_html = hero.inner_html()

        # Check for specific elements
        print("\n--- Content Analysis ---")

        # Check for tagline
        tagline = page.locator('text="Est. 2005"').first
        if tagline.count() > 0:
            print("✓ Tagline 'Est. 2005 · Stockbridge · Edinburgh' FOUND")
        else:
            print("✗ Tagline NOT FOUND")

        # Check for h1 heading
        h1 = page.locator('h1:has-text("Stockbridge Coffee")').first
        if h1.count() > 0:
            print("✓ H1 heading 'Stockbridge Coffee' FOUND")
        else:
            print("✗ H1 heading NOT FOUND")

        # Check for description paragraph
        description = page.locator('text="Independent roastery"').first
        if description.count() > 0:
            print("✓ Description paragraph FOUND")
        else:
            print("✗ Description paragraph NOT FOUND")

        # Check for CTA buttons
        explore_btn = page.locator('text="Explore Roasts"').first
        story_btn = page.locator('text="Neighbourhood Story"').first
        if explore_btn.count() > 0 and story_btn.count() > 0:
            print("✓ Both CTA buttons FOUND")
        else:
            print("✗ CTA buttons NOT FOUND")

        # Check for scroll indicator
        scroll_text = page.locator('text="Scroll to explore"').first
        if scroll_text.count() > 0:
            print("✓ 'Scroll to explore' text FOUND")
        else:
            print("✗ 'Scroll to explore' text NOT FOUND")

        print("\n--- Logo Analysis ---")

        # Check logo
        logo_imgs = page.locator('section#home img').all()
        print(f"Number of images in hero: {len(logo_imgs)}")

        for i, img in enumerate(logo_imgs):
            src = img.get_attribute('src')
            alt = img.get_attribute('alt')
            classes = img.get_attribute('class')

            # Get computed size
            width = img.evaluate('el => el.getBoundingClientRect().width')
            height = img.evaluate('el => el.getBoundingClientRect().height')

            print(f"\nImage {i+1}:")
            print(f"  Src: {src}")
            print(f"  Alt: {alt}")
            print(f"  Size: {width:.0f}px x {height:.0f}px")
            print(f"  Classes: {classes[:100]}..." if len(classes) > 100 else f"  Classes: {classes}")

        # Check which logo variant is being used
        if 'bright' in hero_html:
            print("\n✓ Using BRIGHT logo variant")
        elif 'golden-correct' in hero_html:
            print("\n✓ Using GOLDEN-CORRECT logo variant")
        elif 'Logo' in hero_html and 'variant' in hero_html:
            print("\n✓ Using Logo COMPONENT")
        else:
            print("\n? Logo source unclear from HTML")

    # Take screenshot
    page.screenshot(path='/tmp/hero_detailed_test.png', full_page=False)
    print("\n✓ Screenshot saved to /tmp/hero_detailed_test.png")

    browser.close()
