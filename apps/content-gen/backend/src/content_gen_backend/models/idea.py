"""Video idea models for database and API."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base
from .news import GUID


class VideoStyle(str, Enum):
    """Video style/tone enum."""

    COMEDIC = "comedic"
    DRAMATIC = "dramatic"
    SATIRICAL = "satirical"
    EDUCATIONAL = "educational"
    ACTION = "action"
    SLOW_MOTION = "slow_motion"
    DOCUMENTARY = "documentary"
    MEME = "meme"


# SQLAlchemy ORM Model
class VideoIdeaDB(Base):
    """Database model for video ideas."""

    __tablename__ = "video_ideas"

    id = Column(GUID(), primary_key=True, default=uuid4)
    article_id = Column(GUID(), ForeignKey("news_articles.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    concept = Column(Text, nullable=False)
    video_prompt = Column(Text, nullable=False)
    style = Column(String(50), nullable=True, index=True)
    estimated_duration = Column(Integer, default=45, nullable=False)  # seconds
    is_approved = Column(Boolean, default=False, nullable=False, index=True)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# Pydantic Models for API
class VideoIdeaBase(BaseModel):
    """Base model for video idea."""

    article_id: str
    title: str = Field(..., min_length=1, max_length=200)
    concept: str = Field(..., min_length=1)
    video_prompt: str = Field(..., min_length=1)
    style: Optional[VideoStyle] = None
    estimated_duration: int = Field(default=45, ge=10, le=120)


class VideoIdeaCreate(VideoIdeaBase):
    """Model for creating a video idea."""

    pass


class VideoIdeaResponse(VideoIdeaBase):
    """Model for video idea response."""

    id: str
    is_approved: bool
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VideoIdeaApproval(BaseModel):
    """Model for approving/rejecting an idea."""

    is_approved: bool
    approved_by: Optional[str] = Field(None, max_length=100)


class VideoIdeaListResponse(BaseModel):
    """Model for paginated video idea list."""

    ideas: list[VideoIdeaResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class IdeaGenerationRequest(BaseModel):
    """Request model for generating ideas from an article."""

    article_id: str
    num_ideas: int = Field(default=5, ge=1, le=10)
    styles: Optional[list[VideoStyle]] = None  # If None, generates diverse styles


class IdeaGenerationResponse(BaseModel):
    """Response model for idea generation."""

    article_id: str
    ideas_generated: int
    ideas: list[VideoIdeaResponse]
