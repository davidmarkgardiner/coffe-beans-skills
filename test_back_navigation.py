from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    print('Step 1: Navigate to blog post page')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(2)
    
    print('Step 2: Click "Back to Blog" button')
    back_button = page.locator('text=Back to Blog')
    back_button.click()
    
    print('Step 3: Wait for navigation')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(2)
    
    current_url = page.url
    print(f'Step 4: Current URL: {current_url}')
    
    # Check if navigation worked
    if '/#blog' in current_url:
        print('✅ Navigation to /#blog successful!')
        
        # Check if blog section is in viewport
        blog_section = page.locator('#blog')
        if blog_section.is_visible():
            print('✅ Blog section is visible!')
            
            # Take screenshot
            page.screenshot(path='/tmp/blog_navigation_success.png')
            print('📸 Screenshot saved to /tmp/blog_navigation_success.png')
        else:
            print('⚠️  Blog section exists but not visible in viewport')
    else:
        print(f'❌ Unexpected URL: {current_url}')
        page.screenshot(path='/tmp/blog_navigation_fail.png')
    
    print('\nKeeping browser open for 5 seconds for manual inspection...')
    time.sleep(5)
    browser.close()
