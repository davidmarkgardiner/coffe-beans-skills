from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Capture console logs and errors
    console_logs = []
    def handle_console(msg):
        console_logs.append(f'[{msg.type}] {msg.text}')
    page.on('console', handle_console)
    
    print('Navigating to blog post...')
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(3)
    
    print('\nClicking button with force...')
    back_button = page.locator('text=Back to Blog')
    back_button.click(force=True)
    
    print('\nWaiting 2 seconds...')
    time.sleep(2)
    
    print(f'\nCurrent URL: {page.url}')
    
    print('\n=== Console Logs ===')
    for log in console_logs:
        print(log)
    
    time.sleep(3)
    browser.close()
