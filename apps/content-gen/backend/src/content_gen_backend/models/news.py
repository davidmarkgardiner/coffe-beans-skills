"""News article models for database and API."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import TypeDecorator, CHAR
import uuid

from ..database import Base


# UUID type that works with both SQLite and PostgreSQL
class GUID(TypeDecorator):
    """Platform-independent GUID type."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(value).int
            else:
                return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value


class NewsCategory(str, Enum):
    """News category enum."""

    GENERAL = "general"
    POLITICS = "politics"
    CELEBRITY = "celebrity"
    SPORTS = "sports"
    TECHNOLOGY = "technology"
    ENTERTAINMENT = "entertainment"
    BUSINESS = "business"
    HEALTH = "health"
    SCIENCE = "science"


# SQLAlchemy ORM Model
class NewsArticleDB(Base):
    """Database model for news articles."""

    __tablename__ = "news_articles"

    id = Column(GUID(), primary_key=True, default=uuid4)
    title = Column(String(500), nullable=False, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(1000), unique=True, nullable=False, index=True)
    source = Column(String(200), nullable=True, index=True)
    category = Column(String(50), nullable=True, index=True)
    published_at = Column(DateTime, nullable=True)
    image_url = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_processed = Column(Boolean, default=False, nullable=False, index=True)


# Pydantic Models for API
class NewsArticleBase(BaseModel):
    """Base model for news article."""

    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    content: Optional[str] = None
    url: str = Field(..., min_length=1, max_length=1000)
    source: Optional[str] = Field(None, max_length=200)
    category: Optional[NewsCategory] = NewsCategory.GENERAL
    published_at: Optional[datetime] = None
    image_url: Optional[str] = Field(None, max_length=1000)


class NewsArticleCreate(NewsArticleBase):
    """Model for creating a news article."""

    pass


class NewsArticleResponse(NewsArticleBase):
    """Model for news article response."""

    id: str
    created_at: datetime
    is_processed: bool

    class Config:
        from_attributes = True


class NewsArticleListResponse(BaseModel):
    """Model for paginated news article list."""

    articles: list[NewsArticleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class NewsFetchRequest(BaseModel):
    """Request model for fetching news."""

    category: Optional[NewsCategory] = NewsCategory.GENERAL
    country: str = Field(default="us", max_length=2)
    page_size: int = Field(default=20, ge=1, le=100)
