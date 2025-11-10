from playwright.sync_api import sync_playwright
import time
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(5)  # Wait longer for Firebase
    
    # Extract the actual React data from the page
    result = page.evaluate('''() => {
        // Find all img tags
        const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt,
            visible: img.offsetParent !== null
        }));
        
        // Check if article.imageUrl exists in the component
        const articleDivs = Array.from(document.querySelectorAll('[class*="rounded-2xl"]'));
        
        return {
            images: imgs,
            articleDivCount: articleDivs.length,
            bodyText: document.body.textContent.substring(0, 500)
        };
    }''')
    
    print('Images found:', json.dumps(result['images'], indent=2))
    print(f'\nArticle divs: {result["articleDivCount"]}')
    print(f'\nBody text preview: {result["bodyText"][:200]}...')
    
    time.sleep(10)
    browser.close()
