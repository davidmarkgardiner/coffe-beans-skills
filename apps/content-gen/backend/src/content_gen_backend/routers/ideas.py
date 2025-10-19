"""Video idea API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.idea import (
    VideoIdeaResponse,
    VideoIdeaListResponse,
    IdeaGenerationRequest,
    IdeaGenerationResponse,
    VideoIdeaApproval,
    VideoStyle,
)
from ..services.idea_service import IdeaService
from ..utils.logging_setup import logger

router = APIRouter(prefix="/api/v1/ideas", tags=["ideas"])


@router.post("/generate", response_model=IdeaGenerationResponse)
async def generate_ideas(
    request: IdeaGenerationRequest,
    db: Session = Depends(get_db),
):
    """
    Generate creative video ideas from a news article using Claude AI.

    This endpoint uses Claude's API to generate creative, engaging video concepts
    based on a news article. Each idea includes a title, concept description,
    and detailed video generation prompt.

    - **article_id**: UUID of the news article to generate ideas from
    - **num_ideas**: Number of ideas to generate (1-10, default: 5)
    - **styles**: Optional list of specific styles to focus on
    """
    try:
        idea_service = IdeaService(db)
        ideas = await idea_service.generate_ideas(
            article_id=request.article_id,
            num_ideas=request.num_ideas,
            styles=request.styles,
        )

        return IdeaGenerationResponse(
            article_id=request.article_id,
            ideas_generated=len(ideas),
            ideas=ideas,
        )

    except ValueError as e:
        logger.error(f"Validation error generating ideas: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating ideas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate ideas: {str(e)}")


@router.get("", response_model=VideoIdeaListResponse)
async def list_ideas(
    article_id: Optional[str] = Query(None, description="Filter by article ID"),
    is_approved: Optional[bool] = Query(None, description="Filter by approval status"),
    style: Optional[VideoStyle] = Query(None, description="Filter by video style"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Ideas per page"),
    db: Session = Depends(get_db),
):
    """
    List video ideas with filtering and pagination.

    - **article_id**: Filter by news article
    - **is_approved**: Filter by approval status
    - **style**: Filter by video style (comedic, dramatic, etc.)
    - **page**: Page number (starts at 1)
    - **page_size**: Number of ideas per page (1-100)
    """
    try:
        idea_service = IdeaService(db)
        offset = (page - 1) * page_size

        ideas, total = idea_service.get_ideas(
            article_id=article_id,
            is_approved=is_approved,
            style=style,
            limit=page_size,
            offset=offset,
        )

        total_pages = (total + page_size - 1) // page_size

        return VideoIdeaListResponse(
            ideas=ideas,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"Error listing ideas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list ideas: {str(e)}")


@router.get("/{idea_id}", response_model=VideoIdeaResponse)
async def get_idea(
    idea_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a specific video idea by ID.

    - **idea_id**: UUID of the video idea
    """
    try:
        idea_service = IdeaService(db)
        idea = idea_service.get_idea_by_id(idea_id)

        if not idea:
            raise HTTPException(status_code=404, detail="Idea not found")

        return idea

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting idea {idea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get idea: {str(e)}")


@router.put("/{idea_id}/approve", response_model=VideoIdeaResponse)
async def approve_idea(
    idea_id: str,
    approval: VideoIdeaApproval,
    db: Session = Depends(get_db),
):
    """
    Approve or reject a video idea.

    - **idea_id**: UUID of the video idea
    - **is_approved**: True to approve, False to reject
    - **approved_by**: Optional username of approver
    """
    try:
        idea_service = IdeaService(db)
        idea = idea_service.approve_idea(
            idea_id=idea_id,
            is_approved=approval.is_approved,
            approved_by=approval.approved_by,
        )

        if not idea:
            raise HTTPException(status_code=404, detail="Idea not found")

        return idea

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving idea {idea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to approve idea: {str(e)}")


@router.delete("/{idea_id}")
async def delete_idea(
    idea_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a video idea by ID.

    - **idea_id**: UUID of the video idea
    """
    try:
        idea_service = IdeaService(db)
        success = idea_service.delete_idea(idea_id)

        if not success:
            raise HTTPException(status_code=404, detail="Idea not found")

        return {"message": "Idea deleted successfully", "id": idea_id}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting idea {idea_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete idea: {str(e)}")
