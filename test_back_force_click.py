from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    print('Step 1: Navigate to blog post')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(2)
    
    print('Step 2: Force click "Back to Blog" button (bypassing pointer interception)')
    back_button = page.locator('text=Back to Blog')
    back_button.click(force=True)
    
    print('Step 3: Wait for navigation')
    time.sleep(2)
    
    current_url = page.url
    print(f'Step 4: Current URL: {current_url}')
    
    if '/#blog' in current_url:
        print('✅ Navigation successful! URL contains /#blog')
        time.sleep(2)
        
        blog_section = page.locator('#blog')
        if blog_section.is_visible():
            print('✅ Blog section is visible!')
        else:
            print('⚠️  Blog section not in viewport')
    else:
        print(f'❌ Navigation failed. URL: {current_url}')
    
    print('\nBrowser open for 5 seconds...')
    time.sleep(5)
    browser.close()
