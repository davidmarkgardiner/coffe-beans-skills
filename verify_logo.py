from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app
    page.goto('http://localhost:5176')
    page.wait_for_load_state('networkidle')

    # Find the logo in the navigation
    logo = page.locator('nav img[alt="Stockbridge Coffee"]')

    # Check if logo exists
    if logo.count() > 0:
        # Get the src attribute
        src = logo.get_attribute('src')
        print(f"✓ Logo found with src: {src}")

        # Verify it's using stockbridge-logo4.png
        if 'stockbridge-logo4.png' in src:
            print("✓ Logo is using the new stockbridge-logo4.png file")
        else:
            print(f"✗ Logo is NOT using stockbridge-logo4.png. Current src: {src}")

        # Take a screenshot of the navigation area
        nav = page.locator('nav').first
        nav.screenshot(path='/tmp/navigation_logo.png')
        print("✓ Navigation screenshot saved to /tmp/navigation_logo.png")
    else:
        print("✗ Logo not found in navigation")

    browser.close()
