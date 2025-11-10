from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Listen to console messages
    page.on('console', lambda msg: print(f'CONSOLE: {msg.text()}'))
    
    # Go to blog detail page
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    
    # Inject script to log the post data
    time.sleep(3)
    
    result = page.evaluate('''() => {
        const articles = document.querySelectorAll('[class*="article"], article, [class*="motion"]');
        return {
            articleCount: articles.length,
            html: document.body.innerHTML.substring(0, 500)
        };
    }''')
    
    print(f"Articles found in DOM: {result['articleCount']}")
    print(f"HTML preview: {result['html']}")
    
    time.sleep(5)
    browser.close()
