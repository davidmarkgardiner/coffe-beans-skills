from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    print('1️⃣ Navigating to blog post page...')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    print('2️⃣ Clicking "Back to Blog" button...')
    back_button = page.locator('text=Back to Blog')
    back_button.click()
    
    print('3️⃣ Waiting for navigation...')
    time.sleep(3)
    
    print(f'4️⃣ Current URL: {page.url}')
    
    # Check if we're on home page with blog hash
    if '/#blog' in page.url or page.url.endswith('/'):
        print('✅ Navigation successful!')
        
        # Wait a bit for scroll
        time.sleep(2)
        
        # Check if blog section is visible
        blog_section = page.locator('#blog')
        if blog_section.is_visible():
            print('✅ Blog section is visible!')
        else:
            print('❌ Blog section not visible')
    else:
        print(f'❌ Unexpected URL: {page.url}')
    
    print('\nBrowser will stay open for 10 seconds...')
    time.sleep(10)
    browser.close()
