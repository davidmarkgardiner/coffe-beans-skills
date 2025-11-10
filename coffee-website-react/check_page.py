from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Capture console messages
    console_messages = []
    page.on('console', lambda msg: console_messages.append(f'{msg.type}: {msg.text}'))
    
    # Go to blog detail page
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(4)  # Wait for Firebase and rendering
    
    # Print console messages
    print('=== Console Messages ===')
    for msg in console_messages:
        print(msg)
    
    # Check for images
    images = page.locator('img').all()
    print(f'\n=== Found {len(images)} images ===')
    for i, img in enumerate(images):
        src = img.get_attribute('src')
        alt = img.get_attribute('alt') or 'no alt'
        visible = img.is_visible()
        print(f'{i+1}. {alt}: {src} (visible: {visible})')
    
    # Check article elements
    articles = page.locator('article, [class*="article"], div[class*="rounded-2xl"]').all()
    print(f'\n=== Found {len(articles)} article-like elements ===')
    
    time.sleep(10)
    browser.close()
