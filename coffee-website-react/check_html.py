from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('networkidle', timeout=10000)
    
    # Get the HTML and look for image tags
    html = page.content()
    
    # Count img tags
    img_count = html.count('<img')
    print(f'Total <img> tags in HTML: {img_count}')
    
    # Look for unsplash URLs
    unsplash_count = html.count('unsplash.com')
    print(f'Unsplash URLs in HTML: {unsplash_count}')
    
    # Search for the specific imageUrl pattern
    if 'photo-1511920170033' in html:
        print('✅ Found pumpkin spice latte image URL in HTML')
    else:
        print('❌ Pumpkin spice latte image URL NOT in HTML')
    
    # Check if articles are in the HTML
    if 'Pumpkin Spice Latte' in html:
        print('✅ Article title found in HTML')
    
    # Look for the article image div
    if 'h-64' in html:
        print('✅ Image container div (h-64) found')
    else:
        print('❌ Image container div NOT found')
    
    time.sleep(5)
    browser.close()
