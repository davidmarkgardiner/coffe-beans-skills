from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Capture console logs
    console_logs = []
    page.on('console', lambda msg: console_logs.append(f'[{msg.type}] {msg.text}'))
    
    # Go to blog page
    print('📍 Navigating to blog page...')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience', wait_until='domcontentloaded')
    print('✅ Page loaded (DOM ready)')
    
    # Wait a bit for Firebase
    time.sleep(5)
    
    # Print console logs
    print('\n=== Console Logs (looking for Blog Post Data) ===')
    for log in console_logs:
        if 'Blog Post Data' in log or 'Image' in log or 'imageUrl' in log:
            print(log)
    
    # Check images
    images = page.locator('img').all()
    print(f'\n=== Found {len(images)} images ===')
    for i, img in enumerate(images):
        src = img.get_attribute('src')
        alt = img.get_attribute('alt') or 'no alt'
        print(f'{i+1}. [{alt}] {src}')
    
    # Take screenshot
    page.screenshot(path='/tmp/blog_final.png', full_page=True)
    print('\n📸 Screenshot saved to /tmp/blog_final.png')
    
    print('\nBrowser will close in 10 seconds...')
    time.sleep(10)
    browser.close()
