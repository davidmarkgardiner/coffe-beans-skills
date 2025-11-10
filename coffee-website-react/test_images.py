from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # Go to blog detail page
    page.goto('http://localhost:5173/blog/brewtiful-creations-four-coffee-recipes-to-elevate-your-stockbridge-coffee-experience')
    page.wait_for_load_state('domcontentloaded')
    time.sleep(3)  # Wait for Firebase
    
    # Check for images
    images = page.locator('img').all()
    print(f"Found {len(images)} images on page")
    
    for i, img in enumerate(images):
        src = img.get_attribute('src')
        alt = img.get_attribute('alt')
        print(f"Image {i+1}: {alt} - {src}")
    
    # Take screenshot
    page.screenshot(path='/tmp/blog_with_images.png', full_page=True)
    print("Screenshot saved to /tmp/blog_with_images.png")
    
    # Keep browser open for 10 seconds so you can see it
    print("Browser will close in 10 seconds...")
    time.sleep(10)
    browser.close()
