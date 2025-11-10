from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Capture console logs
    console_logs = []
    def handle_console(msg):
        console_logs.append(f'[{msg.type}] {msg.text}')
    
    page.on('console', handle_console)
    
    # Go to blog page
    print('📍 Navigating to blog page...')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # Print console logs
    print('\n=== Console Logs ===')
    for log in console_logs:
        print(log)
    
    # Check images
    images = page.locator('img').all()
    print(f'\n=== Found {len(images)} images ===')
    for i, img in enumerate(images):
        src = img.get_attribute('src')
        print(f'{i+1}. {src}')
    
    # Take screenshot
    page.screenshot(path='/tmp/blog_debug.png', full_page=True)
    print('\n📸 Screenshot saved to /tmp/blog_debug.png')
    
    print('\nKeeping browser open for 15 seconds...')
    time.sleep(15)
    browser.close()
