#!/usr/bin/env python3
"""Quick test script for Phase 1 implementation."""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")
    try:
        from content_gen_backend.config import settings
        print("✅ Config imported successfully")

        from content_gen_backend.database import Base, engine, init_db
        print("✅ Database module imported successfully")

        from content_gen_backend.models.news import NewsArticleDB, NewsCategory
        print("✅ News models imported successfully")

        from content_gen_backend.services.news_service import NewsService
        print("✅ News service imported successfully")

        from content_gen_backend.routers.news import router
        print("✅ News router imported successfully")

        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database():
    """Test database initialization."""
    print("\nTesting database initialization...")
    try:
        from content_gen_backend.database import init_db, engine
        from content_gen_backend.models.news import NewsArticleDB

        # Initialize database
        init_db()
        print("✅ Database tables created successfully")

        # Check if table exists
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        if 'news_articles' in tables:
            print(f"✅ news_articles table exists")
        else:
            print(f"❌ news_articles table not found. Available tables: {tables}")
            return False

        return True
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_config():
    """Test configuration."""
    print("\nTesting configuration...")
    try:
        from content_gen_backend.config import settings

        print(f"  Database URL: {settings.database_url}")
        print(f"  NewsAPI Key configured: {'✅ Yes' if settings.newsapi_key else '❌ No'}")
        print(f"  Anthropic API Key configured: {'✅ Yes' if settings.anthropic_api_key else '❌ No'}")

        return True
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Phase 1 Implementation Tests")
    print("=" * 60)

    results = []

    results.append(("Imports", test_imports()))
    results.append(("Configuration", test_config()))
    results.append(("Database", test_database()))

    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name}: {status}")

    all_passed = all(result[1] for result in results)

    if all_passed:
        print("\n🎉 All tests passed! Phase 1 backend is ready.")
        print("\nNext steps:")
        print("1. Get a free NewsAPI key from https://newsapi.org/register")
        print("2. Add it to backend/.env as NEWSAPI_KEY=your_key_here")
        print("3. Start the server with: ./start.sh")
        print("4. Test the API at http://localhost:4444/api/v1/news")
        return 0
    else:
        print("\n❌ Some tests failed. Please fix the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
