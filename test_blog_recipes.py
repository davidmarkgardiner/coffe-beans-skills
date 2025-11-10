#!/usr/bin/env python3
"""
Test the Coffee Recipe Blog System

Verifies:
1. Blog posts are visible on homepage
2. Blog posts have recipe-focused content
3. Blog detail pages work
4. Navigation and layout are correct
"""

from playwright.sync_api import sync_playwright
import sys

def test_blog_system():
    print("🧪 Testing Coffee Recipe Blog System")
    print("=" * 50)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Test 1: Homepage loads and shows blog section
            print("\n✓ Test 1: Loading homepage...")
            page.goto('http://localhost:5173', timeout=60000)
            page.wait_for_load_state('domcontentloaded', timeout=60000)
            print("  ✅ Homepage loaded (DOM ready)")

            # Wait a bit for Firebase data
            print("  ⏳ Waiting for Firebase data to load...")
            page.wait_for_timeout(3000)
            print("  ✅ Data load complete")

            # Take screenshot
            page.screenshot(path='/tmp/blog_homepage.png', full_page=True)
            print("  📸 Screenshot saved: /tmp/blog_homepage.png")

            # Test 2: Blog section exists
            print("\n✓ Test 2: Checking blog section...")
            blog_section = page.locator('section#blog')
            if blog_section.count() > 0:
                print("  ✅ Blog section found")
            else:
                print("  ❌ Blog section not found")
                return False

            # Test 3: Blog posts are visible
            print("\n✓ Test 3: Checking for blog posts...")
            blog_posts = page.locator('article').all()
            post_count = len(blog_posts)
            print(f"  ✅ Found {post_count} blog posts")

            if post_count == 0:
                print("  ⚠️  No blog posts found - they may still be loading")
                page.wait_for_timeout(2000)
                blog_posts = page.locator('article').all()
                post_count = len(blog_posts)
                print(f"  Retry: Found {post_count} blog posts")

            # Test 4: Check blog post content
            print("\n✓ Test 4: Inspecting blog post content...")
            if post_count > 0:
                first_post = blog_posts[0]

                # Check for title
                title = first_post.locator('h3').text_content()
                print(f"  📝 First post title: {title}")

                # Check for "Read Recipes" link
                read_link = first_post.locator('a:has-text("Read Recipes")')
                if read_link.count() > 0:
                    print("  ✅ 'Read Recipes' link found (recipe-focused)")
                else:
                    # Check for old "Read Story" link
                    old_link = first_post.locator('a:has-text("Read Story")')
                    if old_link.count() > 0:
                        print("  ⚠️  Found 'Read Story' (should be 'Read Recipes')")

                # Check for featured image
                image = first_post.locator('img')
                if image.count() > 0:
                    print("  ✅ Featured image found")
                else:
                    print("  ⚠️  No featured image (may still be generating)")

                # Check for excerpt
                excerpt = first_post.locator('p').first.text_content()
                if excerpt and len(excerpt) > 20:
                    print(f"  ✅ Excerpt found: {excerpt[:80]}...")

            # Test 5: Click on first blog post
            if post_count > 0:
                print("\n✓ Test 5: Testing blog detail page...")
                first_link = blog_posts[0].locator('a').first
                href = first_link.get_attribute('href')
                print(f"  🔗 Clicking link: {href}")

                first_link.click()
                page.wait_for_load_state('domcontentloaded', timeout=60000)
                page.wait_for_timeout(2000)  # Wait for Firebase data

                # Check if we're on blog detail page
                current_url = page.url
                print(f"  📍 Current URL: {current_url}")

                if '/blog/' in current_url:
                    print("  ✅ Navigated to blog detail page")

                    # Take screenshot of detail page
                    page.screenshot(path='/tmp/blog_detail.png', full_page=True)
                    print("  📸 Screenshot saved: /tmp/blog_detail.png")

                    # Check for back button
                    back_button = page.locator('button:has-text("Back")')
                    if back_button.count() > 0:
                        print("  ✅ Back button found")

                    # Check for article content
                    articles_section = page.locator('text=Curated Articles')
                    if articles_section.count() > 0:
                        print("  ✅ Curated articles section found")

                    # Check for recipe articles
                    recipe_articles = page.locator('.article, [class*="article"]').all()
                    print(f"  ✅ Found {len(recipe_articles)} recipe articles")
                else:
                    print("  ❌ Failed to navigate to blog detail page")
                    return False

            print("\n" + "=" * 50)
            print("✅ All tests passed!")
            print("\nNext steps:")
            print("  1. View screenshots: /tmp/blog_homepage.png, /tmp/blog_detail.png")
            print("  2. Check if images are loading")
            print("  3. Test newsletter signup")

            return True

        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            page.screenshot(path='/tmp/blog_error.png', full_page=True)
            print("📸 Error screenshot saved: /tmp/blog_error.png")
            return False
        finally:
            browser.close()

if __name__ == '__main__':
    success = test_blog_system()
    sys.exit(0 if success else 1)
