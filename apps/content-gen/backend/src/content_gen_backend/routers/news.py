"""News API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.news import (
    NewsArticleResponse,
    NewsArticleListResponse,
    NewsFetchRequest,
    NewsCategory,
)
from ..services.news_service import NewsService
from ..utils.logging_setup import logger

router = APIRouter(prefix="/api/v1/news", tags=["news"])


@router.post("/fetch", response_model=NewsArticleListResponse)
async def fetch_news(
    request: NewsFetchRequest,
    db: Session = Depends(get_db),
):
    """
    Fetch news articles from NewsAPI and save to database.

    This endpoint triggers a fetch from NewsAPI for the specified category
    and saves new articles to the database (skipping duplicates).

    - **category**: News category (general, politics, celebrity, sports, etc.)
    - **country**: Country code (default: us)
    - **page_size**: Number of articles to fetch (1-100)
    """
    try:
        news_service = NewsService(db)
        articles = await news_service.fetch_and_save(
            category=request.category,
            country=request.country,
            page_size=request.page_size,
        )

        total_pages = (len(articles) + request.page_size - 1) // request.page_size

        return NewsArticleListResponse(
            articles=articles,
            total=len(articles),
            page=1,
            page_size=request.page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")


@router.get("", response_model=NewsArticleListResponse)
async def list_news(
    category: Optional[NewsCategory] = Query(None, description="Filter by category"),
    is_processed: Optional[bool] = Query(None, description="Filter by processing status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Articles per page"),
    db: Session = Depends(get_db),
):
    """
    List news articles from database with filtering and pagination.

    - **category**: Filter by news category
    - **is_processed**: Filter by whether ideas have been generated
    - **page**: Page number (starts at 1)
    - **page_size**: Number of articles per page (1-100)
    """
    try:
        news_service = NewsService(db)
        offset = (page - 1) * page_size

        articles, total = news_service.get_articles(
            category=category,
            is_processed=is_processed,
            limit=page_size,
            offset=offset,
        )

        total_pages = (total + page_size - 1) // page_size

        return NewsArticleListResponse(
            articles=articles,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error listing news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list news: {str(e)}")


@router.get("/{article_id}", response_model=NewsArticleResponse)
async def get_news_article(
    article_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a specific news article by ID.

    - **article_id**: UUID of the news article
    """
    try:
        news_service = NewsService(db)
        article = news_service.get_article_by_id(article_id)

        if not article:
            raise HTTPException(status_code=404, detail="Article not found")

        return article

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get article: {str(e)}")


@router.delete("/{article_id}")
async def delete_news_article(
    article_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a news article by ID.

    - **article_id**: UUID of the news article
    """
    try:
        news_service = NewsService(db)
        success = news_service.delete_article(article_id)

        if not success:
            raise HTTPException(status_code=404, detail="Article not found")

        return {"message": "Article deleted successfully", "id": article_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting article {article_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete article: {str(e)}")
