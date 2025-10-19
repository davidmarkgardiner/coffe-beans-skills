"""API endpoints for social media publishing."""

import logging
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.publishing import (
    Platform,
    PublishStatus,
    PublishedVideoDB,
    PublishRequest,
    PublishResponse,
    PublishListResponse,
    MetadataGenerationRequest,
    MetadataGenerationResponse,
    AnalyticsSnapshot,
    BulkPublishRequest,
    YouTubeMetadata,
)
from ..models.idea import VideoIdeaDB
from ..services.metadata_service import MetadataGenerationService
from ..services.youtube_service import get_youtube_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/publish", tags=["publishing"])


# Dependency for metadata service
def get_metadata_service() -> MetadataGenerationService:
    """Get metadata generation service."""
    return MetadataGenerationService()


@router.post("/metadata", response_model=MetadataGenerationResponse)
async def generate_metadata(
    request: MetadataGenerationRequest,
    db: Session = Depends(get_db),
    metadata_service: MetadataGenerationService = Depends(get_metadata_service),
):
    """
    Generate AI-optimized metadata for a video.

    This endpoint uses Claude to generate platform-specific metadata including:
    - Engaging titles optimized for clicks
    - SEO-optimized descriptions
    - Relevant tags/hashtags for discoverability
    - Platform-specific settings
    """
    try:
        # Get video idea context if provided
        video_prompt = None
        article_context = None

        # Priority 1: Use direct prompt if provided
        if request.prompt:
            video_prompt = request.prompt
        # Priority 2: Fetch from idea if idea_id provided
        elif request.idea_id:
            idea = db.query(VideoIdeaDB).filter(VideoIdeaDB.id == request.idea_id).first()
            if idea:
                video_prompt = idea.video_prompt
                # You could also fetch the article here for more context

        # Generate metadata
        result = await metadata_service.generate_metadata(
            request=request,
            video_prompt=video_prompt,
            article_context=article_context,
        )

        return result

    except Exception as e:
        logger.error(f"Failed to generate metadata: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/youtube", response_model=PublishResponse)
async def publish_to_youtube(
    request: PublishRequest,
    db: Session = Depends(get_db),
):
    """
    Publish a video to YouTube.

    This endpoint:
    1. Retrieves the video file from local storage
    2. Uploads it to YouTube with the provided metadata
    3. Saves the publishing record to database
    4. Returns the YouTube video URL

    Requirements:
    - YouTube OAuth credentials must be configured
    - Video file must exist in local storage
    """
    if request.platform != Platform.YOUTUBE:
        raise HTTPException(status_code=400, detail="This endpoint is for YouTube only")

    # Verify video exists (try both naming conventions)
    video_path = Path(settings.video_storage_path) / f"{request.video_id}.mp4"
    if not video_path.exists():
        # Try alternate naming convention (video_id_video.mp4)
        video_path = Path(settings.video_storage_path) / f"{request.video_id}_video.mp4"
        if not video_path.exists():
            raise HTTPException(status_code=404, detail=f"Video {request.video_id} not found")

    # Convert metadata to YouTube format
    if not isinstance(request.metadata, YouTubeMetadata):
        youtube_metadata = YouTubeMetadata(**request.metadata.model_dump())
    else:
        youtube_metadata = request.metadata

    try:
        # Get YouTube service
        youtube_service = get_youtube_service()

        # Create database record
        publish_record = PublishedVideoDB(
            id=uuid4(),
            video_id=request.video_id,
            idea_id=request.idea_id,
            platform=Platform.YOUTUBE.value,
            status=PublishStatus.PUBLISHING.value,
            title=youtube_metadata.title,
            description=youtube_metadata.description,
            tags=youtube_metadata.tags,
            category=youtube_metadata.category,
            privacy=youtube_metadata.privacy.value,
            scheduled_at=request.scheduled_at,
        )
        db.add(publish_record)
        db.commit()
        db.refresh(publish_record)

        # Upload to YouTube
        logger.info(f"Publishing video {request.video_id} to YouTube")
        upload_result = await youtube_service.upload_video(
            video_path=str(video_path),
            metadata=youtube_metadata,
        )

        # Update record with YouTube info
        publish_record.platform_video_id = upload_result["video_id"]
        publish_record.platform_url = upload_result["url"]
        publish_record.status = PublishStatus.PUBLISHED.value
        publish_record.published_at = datetime.utcnow()
        db.commit()
        db.refresh(publish_record)

        logger.info(f"Video published to YouTube: {upload_result['url']}")

        return PublishResponse.model_validate(publish_record)

    except Exception as e:
        logger.error(f"Failed to publish to YouTube: {e}")

        # Update status to failed
        if publish_record:
            publish_record.status = PublishStatus.FAILED.value
            publish_record.error_message = str(e)
            publish_record.retry_count += 1
            db.commit()

        raise HTTPException(status_code=500, detail=f"Failed to publish: {e}")


@router.post("/bulk", response_model=list[PublishResponse])
async def bulk_publish(
    request: BulkPublishRequest,
    db: Session = Depends(get_db),
):
    """
    Publish a video to multiple platforms at once.

    Currently supports:
    - YouTube

    Coming soon:
    - TikTok
    - Instagram
    - Facebook
    """
    results = []
    errors = []

    for platform in request.platforms:
        try:
            # Get platform-specific metadata
            metadata = request.metadata
            if request.platform_overrides and platform.value in request.platform_overrides:
                # Apply platform-specific overrides
                override_data = request.platform_overrides[platform.value]
                metadata = type(metadata)(**{**metadata.model_dump(), **override_data})

            # Create publish request for this platform
            publish_request = PublishRequest(
                video_id=request.video_id,
                platform=platform,
                metadata=metadata,
                scheduled_at=request.scheduled_at,
            )

            # Publish based on platform
            if platform == Platform.YOUTUBE:
                result = await publish_to_youtube(publish_request, db)
                results.append(result)
            else:
                errors.append(f"{platform.value}: Not yet implemented")

        except Exception as e:
            logger.error(f"Failed to publish to {platform.value}: {e}")
            errors.append(f"{platform.value}: {str(e)}")

    if not results:
        raise HTTPException(
            status_code=500,
            detail=f"All platforms failed. Errors: {'; '.join(errors)}"
        )

    return results


@router.get("", response_model=PublishListResponse)
async def list_published_videos(
    platform: Optional[Platform] = Query(None, description="Filter by platform"),
    status: Optional[PublishStatus] = Query(None, description="Filter by status"),
    video_id: Optional[str] = Query(None, description="Filter by video ID"),
    idea_id: Optional[str] = Query(None, description="Filter by idea ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    List all published videos with filtering and pagination.

    Supports filtering by:
    - Platform (YouTube, TikTok, Instagram)
    - Status (draft, scheduled, published, failed)
    - Video ID
    - Idea ID
    """
    query = db.query(PublishedVideoDB)

    # Apply filters
    if platform:
        query = query.filter(PublishedVideoDB.platform == platform.value)
    if status:
        query = query.filter(PublishedVideoDB.status == status.value)
    if video_id:
        query = query.filter(PublishedVideoDB.video_id == video_id)
    if idea_id:
        query = query.filter(PublishedVideoDB.idea_id == idea_id)

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    videos = query.order_by(PublishedVideoDB.created_at.desc()).offset(offset).limit(page_size).all()

    # Convert to response models
    video_responses = [PublishResponse.model_validate(v) for v in videos]

    return PublishListResponse(
        videos=video_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{publish_id}", response_model=PublishResponse)
async def get_published_video(
    publish_id: str,
    db: Session = Depends(get_db),
):
    """Get details of a specific published video."""
    video = db.query(PublishedVideoDB).filter(PublishedVideoDB.id == publish_id).first()

    if not video:
        raise HTTPException(status_code=404, detail="Published video not found")

    return PublishResponse.model_validate(video)


@router.delete("/{publish_id}")
async def delete_published_video(
    publish_id: str,
    delete_from_platform: bool = Query(False, description="Also delete from platform"),
    db: Session = Depends(get_db),
):
    """
    Delete a published video record.

    Optionally also removes the video from the platform (YouTube, etc).
    """
    video = db.query(PublishedVideoDB).filter(PublishedVideoDB.id == publish_id).first()

    if not video:
        raise HTTPException(status_code=404, detail="Published video not found")

    # Delete from platform if requested
    if delete_from_platform and video.platform_video_id:
        try:
            if video.platform == Platform.YOUTUBE.value:
                youtube_service = get_youtube_service()
                await youtube_service.delete_video(video.platform_video_id)
                logger.info(f"Deleted video {video.platform_video_id} from YouTube")
        except Exception as e:
            logger.error(f"Failed to delete from platform: {e}")
            # Continue with database deletion even if platform deletion fails

    # Delete from database
    db.delete(video)
    db.commit()

    return {"id": publish_id, "deleted": True}


@router.get("/{publish_id}/analytics", response_model=AnalyticsSnapshot)
async def get_video_analytics(
    publish_id: str,
    refresh: bool = Query(False, description="Fetch fresh data from platform"),
    db: Session = Depends(get_db),
):
    """
    Get analytics/statistics for a published video.

    Set refresh=true to fetch the latest data from the platform API.
    Otherwise returns cached data from database.
    """
    video = db.query(PublishedVideoDB).filter(PublishedVideoDB.id == publish_id).first()

    if not video:
        raise HTTPException(status_code=404, detail="Published video not found")

    if not video.platform_video_id:
        raise HTTPException(status_code=400, detail="Video not published to platform yet")

    # Fetch fresh data if requested
    if refresh:
        try:
            if video.platform == Platform.YOUTUBE.value:
                youtube_service = get_youtube_service()
                stats = await youtube_service.get_video_stats(video.platform_video_id)

                # Update database
                video.views = stats["views"]
                video.likes = stats["likes"]
                video.comments = stats["comments"]
                video.last_analytics_update = datetime.utcnow()
                db.commit()
                db.refresh(video)

        except Exception as e:
            logger.error(f"Failed to fetch analytics: {e}")
            # Return cached data if API call fails

    return AnalyticsSnapshot(
        publish_id=str(video.id),
        platform=Platform(video.platform),
        platform_video_id=video.platform_video_id,
        views=video.views,
        likes=video.likes,
        comments=video.comments,
        shares=video.shares,
        timestamp=video.last_analytics_update or video.updated_at,
    )


@router.post("/{publish_id}/retry", response_model=PublishResponse)
async def retry_failed_publish(
    publish_id: str,
    db: Session = Depends(get_db),
):
    """
    Retry publishing a failed video.

    Only works for videos in 'failed' status.
    """
    video = db.query(PublishedVideoDB).filter(PublishedVideoDB.id == publish_id).first()

    if not video:
        raise HTTPException(status_code=404, detail="Published video not found")

    if video.status != PublishStatus.FAILED.value:
        raise HTTPException(
            status_code=400,
            detail=f"Can only retry failed videos. Current status: {video.status}"
        )

    # Create a new publish request
    metadata = YouTubeMetadata(
        title=video.title,
        description=video.description,
        tags=video.tags,
        category=video.category,
        privacy=video.privacy,
    )

    request = PublishRequest(
        video_id=video.video_id,
        platform=Platform(video.platform),
        metadata=metadata,
        idea_id=str(video.idea_id) if video.idea_id else None,
    )

    # Delete the old failed record
    db.delete(video)
    db.commit()

    # Try publishing again
    if request.platform == Platform.YOUTUBE:
        return await publish_to_youtube(request, db)
    else:
        raise HTTPException(status_code=400, detail=f"Platform {request.platform} not supported")
