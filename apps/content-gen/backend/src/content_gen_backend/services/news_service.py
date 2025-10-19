"""News aggregation service for fetching articles from multiple sources."""

import requests
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from ..config import settings
from ..models.news import (
    NewsArticleDB,
    NewsArticleResponse,
    NewsArticleCreate,
    NewsCategory,
)
from ..utils.logging_setup import logger


class NewsService:
    """Service for fetching and managing news articles."""

    def __init__(self, db: Session):
        self.db = db
        self.newsapi_key = settings.newsapi_key
        self.gnews_key = settings.gnews_api_key
        self.guardian_key = settings.guardian_api_key

    async def fetch_from_newsapi(
        self,
        category: NewsCategory = NewsCategory.GENERAL,
        country: str = "us",
        page_size: int = 20,
    ) -> List[NewsArticleCreate]:
        """
        Fetch top headlines from NewsAPI.org.

        Args:
            category: News category to fetch
            country: Country code (e.g., 'us', 'gb')
            page_size: Number of articles to fetch (max 100)

        Returns:
            List of NewsArticleCreate objects
        """
        if not self.newsapi_key:
            logger.warning("NewsAPI key not configured")
            return []

        try:
            url = "https://newsapi.org/v2/top-headlines"
            params = {
                "apiKey": self.newsapi_key,
                "category": category.value if category != NewsCategory.CELEBRITY else "entertainment",
                "country": country,
                "pageSize": min(page_size, 100),
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if data.get("status") != "ok":
                logger.error(f"NewsAPI error: {data.get('message', 'Unknown error')}")
                return []

            articles = []
            for article_data in data.get("articles", []):
                # Skip articles without URL (invalid)
                if not article_data.get("url"):
                    continue

                # Parse published date
                published_at = None
                if article_data.get("publishedAt"):
                    try:
                        published_at = datetime.fromisoformat(
                            article_data["publishedAt"].replace("Z", "+00:00")
                        )
                    except Exception as e:
                        logger.warning(f"Failed to parse date: {e}")

                article = NewsArticleCreate(
                    title=article_data["title"] or "Untitled",
                    description=article_data.get("description"),
                    content=article_data.get("content"),
                    url=article_data["url"],
                    source=article_data.get("source", {}).get("name"),
                    category=category,
                    published_at=published_at,
                    image_url=article_data.get("urlToImage"),
                )
                articles.append(article)

            logger.info(f"Fetched {len(articles)} articles from NewsAPI ({category.value})")
            return articles

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching from NewsAPI: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in fetch_from_newsapi: {str(e)}")
            return []

    async def save_articles(
        self, articles: List[NewsArticleCreate], skip_duplicates: bool = True
    ) -> List[NewsArticleResponse]:
        """
        Save articles to database.

        Args:
            articles: List of articles to save
            skip_duplicates: If True, skip articles with duplicate URLs

        Returns:
            List of saved articles
        """
        saved_articles = []

        for article_data in articles:
            try:
                # Check for duplicate URL
                if skip_duplicates:
                    existing = (
                        self.db.query(NewsArticleDB)
                        .filter(NewsArticleDB.url == article_data.url)
                        .first()
                    )
                    if existing:
                        logger.debug(f"Skipping duplicate article: {article_data.url}")
                        continue

                # Create database record
                db_article = NewsArticleDB(
                    id=uuid4(),
                    title=article_data.title,
                    description=article_data.description,
                    content=article_data.content,
                    url=article_data.url,
                    source=article_data.source,
                    category=article_data.category.value if article_data.category else None,
                    published_at=article_data.published_at,
                    image_url=article_data.image_url,
                    is_processed=False,
                )

                self.db.add(db_article)
                self.db.commit()
                self.db.refresh(db_article)

                saved_articles.append(
                    NewsArticleResponse(
                        id=str(db_article.id),
                        title=db_article.title,
                        description=db_article.description,
                        content=db_article.content,
                        url=db_article.url,
                        source=db_article.source,
                        category=NewsCategory(db_article.category) if db_article.category else None,
                        published_at=db_article.published_at,
                        image_url=db_article.image_url,
                        created_at=db_article.created_at,
                        is_processed=db_article.is_processed,
                    )
                )

            except Exception as e:
                self.db.rollback()
                logger.error(f"Error saving article {article_data.url}: {str(e)}")
                continue

        logger.info(f"Saved {len(saved_articles)} new articles to database")
        return saved_articles

    async def fetch_and_save(
        self,
        category: NewsCategory = NewsCategory.GENERAL,
        country: str = "us",
        page_size: int = 20,
    ) -> List[NewsArticleResponse]:
        """
        Fetch articles from NewsAPI and save to database.

        Args:
            category: News category to fetch
            country: Country code
            page_size: Number of articles to fetch

        Returns:
            List of saved articles
        """
        articles = await self.fetch_from_newsapi(category, country, page_size)
        return await self.save_articles(articles)

    def get_articles(
        self,
        category: Optional[NewsCategory] = None,
        is_processed: Optional[bool] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[NewsArticleResponse], int]:
        """
        Get articles from database with filtering and pagination.

        Args:
            category: Filter by category
            is_processed: Filter by processing status
            limit: Maximum number of articles to return
            offset: Number of articles to skip

        Returns:
            Tuple of (articles, total_count)
        """
        query = self.db.query(NewsArticleDB)

        # Apply filters
        if category:
            query = query.filter(NewsArticleDB.category == category.value)
        if is_processed is not None:
            query = query.filter(NewsArticleDB.is_processed == is_processed)

        # Get total count
        total = query.count()

        # Apply pagination and ordering
        articles = (
            query.order_by(desc(NewsArticleDB.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

        # Convert to response models
        article_responses = [
            NewsArticleResponse(
                id=str(article.id),
                title=article.title,
                description=article.description,
                content=article.content,
                url=article.url,
                source=article.source,
                category=NewsCategory(article.category) if article.category else None,
                published_at=article.published_at,
                image_url=article.image_url,
                created_at=article.created_at,
                is_processed=article.is_processed,
            )
            for article in articles
        ]

        return article_responses, total

    def get_article_by_id(self, article_id: str) -> Optional[NewsArticleResponse]:
        """Get a single article by ID."""
        article = self.db.query(NewsArticleDB).filter(NewsArticleDB.id == article_id).first()

        if not article:
            return None

        return NewsArticleResponse(
            id=str(article.id),
            title=article.title,
            description=article.description,
            content=article.content,
            url=article.url,
            source=article.source,
            category=NewsCategory(article.category) if article.category else None,
            published_at=article.published_at,
            image_url=article.image_url,
            created_at=article.created_at,
            is_processed=article.is_processed,
        )

    def delete_article(self, article_id: str) -> bool:
        """Delete an article by ID."""
        article = self.db.query(NewsArticleDB).filter(NewsArticleDB.id == article_id).first()

        if not article:
            return False

        self.db.delete(article)
        self.db.commit()
        return True
