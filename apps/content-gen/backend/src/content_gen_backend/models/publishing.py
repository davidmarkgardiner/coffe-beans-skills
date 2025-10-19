"""Social media publishing models for database and API."""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import uuid4

from pydantic import BaseModel, Field, HttpUrl, model_validator
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from ..database import Base
from .news import GUID


class Platform(str, Enum):
    """Social media platform enum."""

    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"


class PublishStatus(str, Enum):
    """Publishing status enum."""

    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"
    DELETED = "deleted"


class VideoPrivacy(str, Enum):
    """Video privacy settings."""

    PUBLIC = "public"
    UNLISTED = "unlisted"
    PRIVATE = "private"


# SQLAlchemy ORM Models
class PublishedVideoDB(Base):
    """Database model for published videos across platforms."""

    __tablename__ = "published_videos"

    id = Column(GUID(), primary_key=True, default=uuid4)
    video_id = Column(String(100), nullable=False, index=True)  # Internal video ID
    idea_id = Column(GUID(), ForeignKey("video_ideas.id"), nullable=True, index=True)
    platform = Column(String(20), nullable=False, index=True)
    platform_video_id = Column(String(200), nullable=True, index=True)  # YouTube ID, TikTok ID, etc
    status = Column(String(20), nullable=False, default=PublishStatus.DRAFT.value, index=True)

    # Metadata
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)  # List of tags
    category = Column(String(50), nullable=True)
    privacy = Column(String(20), default=VideoPrivacy.PUBLIC.value, nullable=False)

    # Platform-specific metadata
    platform_metadata = Column(JSON, nullable=True)  # Flexible field for platform-specific data

    # URLs
    platform_url = Column(String(500), nullable=True)  # Public URL on the platform
    thumbnail_url = Column(String(500), nullable=True)

    # Scheduling
    scheduled_at = Column(DateTime, nullable=True, index=True)
    published_at = Column(DateTime, nullable=True, index=True)

    # Analytics
    views = Column(Integer, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False)
    shares = Column(Integer, default=0, nullable=False)
    last_analytics_update = Column(DateTime, nullable=True)

    # Error tracking
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class PlatformCredentialDB(Base):
    """Database model for storing platform credentials."""

    __tablename__ = "platform_credentials"

    id = Column(GUID(), primary_key=True, default=uuid4)
    platform = Column(String(20), nullable=False, unique=True, index=True)

    # OAuth credentials
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)

    # Additional config
    channel_id = Column(String(200), nullable=True)  # YouTube channel ID, etc
    credentials_json = Column(JSON, nullable=True)  # Flexible encrypted storage

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


# Pydantic Models for API
class VideoMetadataBase(BaseModel):
    """Base model for video metadata."""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    tags: Optional[List[str]] = Field(None, max_items=30)
    category: Optional[str] = None
    privacy: VideoPrivacy = VideoPrivacy.PUBLIC


class YouTubeMetadata(VideoMetadataBase):
    """YouTube-specific metadata."""

    category_id: str = Field(default="22", description="YouTube category ID (22=People & Blogs)")
    made_for_kids: bool = Field(default=False)
    thumbnail_file: Optional[str] = None
    playlist_ids: Optional[List[str]] = None


class TikTokMetadata(VideoMetadataBase):
    """TikTok-specific metadata."""

    allow_duet: bool = Field(default=True)
    allow_stitch: bool = Field(default=True)
    allow_comments: bool = Field(default=True)
    branded_content: bool = Field(default=False)
    disclosure: bool = Field(default=False)


class InstagramMetadata(VideoMetadataBase):
    """Instagram-specific metadata (Reels)."""

    share_to_feed: bool = Field(default=True)
    allow_comments: bool = Field(default=True)
    cover_frame_time: Optional[float] = Field(None, description="Time in seconds for cover frame")


class PublishRequest(BaseModel):
    """Request model for publishing a video."""

    video_id: str = Field(..., description="Internal video ID to publish")
    platform: Platform
    metadata: VideoMetadataBase
    scheduled_at: Optional[datetime] = Field(None, description="Schedule for future publish")
    idea_id: Optional[str] = Field(None, description="Link to video idea if applicable")


class PublishResponse(BaseModel):
    """Response model for published video."""

    id: str
    video_id: str
    idea_id: Optional[str] = None
    platform: Platform
    status: PublishStatus
    platform_video_id: Optional[str] = None
    platform_url: Optional[str] = None

    # Metadata
    title: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    privacy: VideoPrivacy

    # Timestamps
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Analytics
    views: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    last_analytics_update: Optional[datetime] = None

    # Error info
    error_message: Optional[str] = None
    retry_count: int = 0

    @model_validator(mode='before')
    @classmethod
    def convert_uuids(cls, data):
        """Convert UUID fields to strings."""
        if hasattr(data, 'id') and data.id:
            data_dict = {}
            for key in dir(data):
                if not key.startswith('_'):
                    val = getattr(data, key, None)
                    if key in ['id', 'idea_id'] and val:
                        data_dict[key] = str(val)
                    else:
                        data_dict[key] = val
            return data_dict
        return data

    class Config:
        from_attributes = True


class PublishListResponse(BaseModel):
    """Model for paginated published videos list."""

    videos: List[PublishResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MetadataGenerationRequest(BaseModel):
    """Request model for generating video metadata using AI."""

    video_id: str = Field(..., description="Video ID to generate metadata for")
    idea_id: Optional[str] = Field(None, description="Video idea ID for context")
    prompt: Optional[str] = Field(None, description="Video prompt/description for context")
    platform: Platform
    target_audience: Optional[str] = Field(None, description="Target audience description")
    tone: Optional[str] = Field(None, description="Desired tone (e.g., professional, casual, humorous)")


class MetadataGenerationResponse(BaseModel):
    """Response model for AI-generated metadata."""

    video_id: str
    platform: Platform
    title: str
    description: str
    tags: List[str]
    category: Optional[str] = None

    # Platform-specific
    youtube_metadata: Optional[YouTubeMetadata] = None
    tiktok_metadata: Optional[TikTokMetadata] = None
    instagram_metadata: Optional[InstagramMetadata] = None


class AnalyticsSnapshot(BaseModel):
    """Analytics data for a published video."""

    publish_id: str
    platform: Platform
    platform_video_id: str
    views: int
    likes: int
    comments: int
    shares: int
    watch_time_hours: Optional[float] = None
    engagement_rate: Optional[float] = None
    timestamp: datetime


class BulkPublishRequest(BaseModel):
    """Request model for publishing to multiple platforms."""

    video_id: str
    platforms: List[Platform]
    metadata: VideoMetadataBase
    platform_overrides: Optional[dict] = Field(
        None,
        description="Platform-specific metadata overrides keyed by platform name"
    )
    scheduled_at: Optional[datetime] = None
