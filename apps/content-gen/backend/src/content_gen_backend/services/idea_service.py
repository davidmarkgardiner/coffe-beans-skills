"""Idea generation service using Claude API."""

import json
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from anthropic import Anthropic
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..config import settings
from ..models.idea import (
    VideoIdeaDB,
    VideoIdeaResponse,
    VideoIdeaCreate,
    VideoStyle,
)
from ..models.news import NewsArticleDB
from ..utils.logging_setup import logger


class IdeaService:
    """Service for generating and managing video ideas using Claude."""

    def __init__(self, db: Session):
        self.db = db
        if settings.anthropic_api_key:
            self.client = Anthropic(api_key=settings.anthropic_api_key)
        else:
            self.client = None
            logger.warning("Anthropic API key not configured")

    async def generate_ideas(
        self,
        article_id: str,
        num_ideas: int = 5,
        styles: Optional[List[VideoStyle]] = None,
    ) -> List[VideoIdeaResponse]:
        """
        Generate creative video ideas from a news article using Claude.

        Args:
            article_id: UUID of the news article
            num_ideas: Number of ideas to generate (1-10)
            styles: Specific styles to generate (if None, generates diverse styles)

        Returns:
            List of generated video ideas
        """
        if not self.client:
            raise ValueError("Anthropic API key not configured. Please set ANTHROPIC_API_KEY in .env")

        # Get the article
        article = self.db.query(NewsArticleDB).filter(NewsArticleDB.id == article_id).first()
        if not article:
            raise ValueError(f"Article {article_id} not found")

        # Build prompt
        prompt = self._build_prompt(article, num_ideas, styles)

        try:
            # Call Claude API
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                temperature=0.9,  # Higher creativity
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse response
            ideas_data = self._parse_claude_response(response.content[0].text)

            # Save to database
            saved_ideas = []
            for idea_data in ideas_data[:num_ideas]:
                db_idea = VideoIdeaDB(
                    id=uuid4(),
                    article_id=article_id,
                    title=idea_data["title"],
                    concept=idea_data["concept"],
                    video_prompt=idea_data["video_prompt"],
                    style=idea_data.get("style"),
                    estimated_duration=idea_data.get("estimated_duration", 45),
                    is_approved=False,
                )

                self.db.add(db_idea)
                self.db.commit()
                self.db.refresh(db_idea)

                saved_ideas.append(self._to_response(db_idea))

            # Mark article as processed
            article.is_processed = True
            self.db.commit()

            logger.info(f"Generated {len(saved_ideas)} ideas for article {article_id}")
            return saved_ideas

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error generating ideas: {str(e)}")
            raise

    def _build_prompt(
        self,
        article: NewsArticleDB,
        num_ideas: int,
        styles: Optional[List[VideoStyle]],
    ) -> str:
        """Build the prompt for Claude."""

        style_guidance = ""
        if styles:
            style_list = ", ".join([s.value for s in styles])
            style_guidance = f"\nFocus on these styles: {style_list}"
        else:
            style_guidance = "\nCreate a diverse mix of styles: comedic, dramatic, satirical, educational, action, slow_motion, documentary, meme"

        prompt = f"""You are a creative content strategist for a viral video channel. Your goal is to generate engaging, creative video concepts that will capture attention on social media.

News Article:
Title: {article.title}
Description: {article.description or "N/A"}
Content: {article.content[:800] if article.content else "N/A"}
Source: {article.source}
Category: {article.category}

Task: Generate {num_ideas} creative, engaging video concepts (30-60 seconds each) based on this news article.{style_guidance}

Requirements:
1. Each concept should be unique and creative
2. Focus on viral potential and entertainment value
3. Consider different angles: humor, drama, education, action, etc.
4. Generate specific, detailed video prompts suitable for AI video generation (Sora/Veo format)
5. Include visual descriptions, camera angles, mood, and style

Output Format (JSON array):
[
  {{
    "title": "Catchy, clickbait-worthy title (max 60 chars)",
    "concept": "One-sentence description of the video concept",
    "video_prompt": "Detailed prompt for AI video generation with specific visual details, camera work, lighting, mood, style, and action",
    "style": "one of: comedic, dramatic, satirical, educational, action, slow_motion, documentary, meme",
    "estimated_duration": 45
  }}
]

Example:
[
  {{
    "title": "The Fall Heard Round the World",
    "concept": "Dramatic slow-motion recreation of a politician's stage fall with epic music",
    "video_prompt": "A politician in a dark suit dramatically falling in ultra slow motion on a grand stage with dramatic spotlights and moody cinematic lighting, epic orchestral music swelling, shot from multiple cinematic angles (low angle hero shot, overhead tracking shot), 4K cinematic quality, film grain texture, dramatic color grading with deep shadows and warm highlights",
    "style": "dramatic",
    "estimated_duration": 45
  }}
]

Generate {num_ideas} unique ideas now. Return ONLY the JSON array, no additional text."""

        return prompt

    def _parse_claude_response(self, response_text: str) -> List[dict]:
        """Parse Claude's response into structured data."""
        try:
            # Extract JSON from response (Claude might wrap it in markdown)
            text = response_text.strip()

            # Remove markdown code blocks if present
            if text.startswith("```"):
                # Find the first newline after ```json or ```
                start = text.find("\n") + 1
                # Find the closing ```
                end = text.rfind("```")
                if end > start:
                    text = text[start:end].strip()

            # Parse JSON
            ideas = json.loads(text)

            if not isinstance(ideas, list):
                raise ValueError("Response is not a JSON array")

            return ideas

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Claude response as JSON: {e}")
            logger.error(f"Response text: {response_text[:500]}")
            raise ValueError("Invalid JSON response from Claude")
        except Exception as e:
            logger.error(f"Error parsing Claude response: {e}")
            raise

    def get_ideas(
        self,
        article_id: Optional[str] = None,
        is_approved: Optional[bool] = None,
        style: Optional[VideoStyle] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[VideoIdeaResponse], int]:
        """
        Get video ideas with filtering and pagination.

        Args:
            article_id: Filter by article ID
            is_approved: Filter by approval status
            style: Filter by video style
            limit: Maximum number of ideas to return
            offset: Number of ideas to skip

        Returns:
            Tuple of (ideas, total_count)
        """
        query = self.db.query(VideoIdeaDB)

        # Apply filters
        if article_id:
            query = query.filter(VideoIdeaDB.article_id == article_id)
        if is_approved is not None:
            query = query.filter(VideoIdeaDB.is_approved == is_approved)
        if style:
            query = query.filter(VideoIdeaDB.style == style.value)

        # Get total count
        total = query.count()

        # Apply pagination and ordering
        ideas = (
            query.order_by(desc(VideoIdeaDB.created_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

        return [self._to_response(idea) for idea in ideas], total

    def get_idea_by_id(self, idea_id: str) -> Optional[VideoIdeaResponse]:
        """Get a single idea by ID."""
        idea = self.db.query(VideoIdeaDB).filter(VideoIdeaDB.id == idea_id).first()
        return self._to_response(idea) if idea else None

    def approve_idea(
        self,
        idea_id: str,
        is_approved: bool,
        approved_by: Optional[str] = None,
    ) -> Optional[VideoIdeaResponse]:
        """Approve or reject an idea."""
        idea = self.db.query(VideoIdeaDB).filter(VideoIdeaDB.id == idea_id).first()

        if not idea:
            return None

        idea.is_approved = is_approved
        idea.approved_by = approved_by
        idea.approved_at = datetime.utcnow() if is_approved else None

        self.db.commit()
        self.db.refresh(idea)

        logger.info(f"Idea {idea_id} {'approved' if is_approved else 'rejected'} by {approved_by or 'system'}")
        return self._to_response(idea)

    def delete_idea(self, idea_id: str) -> bool:
        """Delete an idea by ID."""
        idea = self.db.query(VideoIdeaDB).filter(VideoIdeaDB.id == idea_id).first()

        if not idea:
            return False

        self.db.delete(idea)
        self.db.commit()
        return True

    def _to_response(self, idea: VideoIdeaDB) -> VideoIdeaResponse:
        """Convert database model to response model."""
        return VideoIdeaResponse(
            id=str(idea.id),
            article_id=str(idea.article_id),
            title=idea.title,
            concept=idea.concept,
            video_prompt=idea.video_prompt,
            style=VideoStyle(idea.style) if idea.style else None,
            estimated_duration=idea.estimated_duration,
            is_approved=idea.is_approved,
            approved_by=idea.approved_by,
            approved_at=idea.approved_at,
            created_at=idea.created_at,
        )
