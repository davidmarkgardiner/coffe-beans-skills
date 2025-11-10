from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Capture ALL console logs
    console_logs = []
    def handle_console(msg):
        text = msg.text
        console_logs.append(text)
        print(f'CONSOLE: {text}')
    
    page.on('console', handle_console)
    
    print('📍 Navigating to blog page...')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience', wait_until='domcontentloaded')
    print('✅ Page loaded, waiting 8 seconds for React and Firebase...')
    time.sleep(8)
    
    print('\n=== Checking for Debug Logs ===')
    debug_found = False
    for log in console_logs:
        if 'BLOG POST DATA DEBUG' in log or 'imageUrl' in log.lower():
            print(f'  ✅ {log}')
            debug_found = True
    
    if not debug_found:
        print('  ❌ No debug logs found!')
        print(f'  Total console messages: {len(console_logs)}')
    
    # Check images
    images = page.locator('img').all()
    print(f'\n=== Found {len(images)} images ===')
    
    print('\nBrowser will stay open for 15 seconds for manual inspection...')
    time.sleep(15)
    browser.close()
