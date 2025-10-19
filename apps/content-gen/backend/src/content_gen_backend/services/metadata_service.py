"""Service for generating video metadata using Claude AI."""

import json
import logging
from typing import Optional

from anthropic import AsyncAnthropic

from ..config import settings
from ..models.publishing import (
    Platform,
    MetadataGenerationRequest,
    MetadataGenerationResponse,
    YouTubeMetadata,
    TikTokMetadata,
    InstagramMetadata,
    VideoPrivacy,
)

logger = logging.getLogger(__name__)


class MetadataGenerationService:
    """Service for AI-powered metadata generation."""

    def __init__(self):
        """Initialize the metadata generation service."""
        self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def generate_metadata(
        self,
        request: MetadataGenerationRequest,
        video_prompt: Optional[str] = None,
        article_context: Optional[str] = None,
    ) -> MetadataGenerationResponse:
        """
        Generate optimized metadata for a video using Claude.

        Args:
            request: Metadata generation request
            video_prompt: Original video generation prompt for context
            article_context: News article context if available

        Returns:
            Generated metadata optimized for the target platform
        """
        platform_guidelines = self._get_platform_guidelines(request.platform)

        system_prompt = self._build_system_prompt(request.platform, platform_guidelines)
        user_prompt = self._build_user_prompt(
            request, video_prompt, article_context, platform_guidelines
        )

        logger.info(f"Generating metadata for {request.platform.value} video {request.video_id}")

        try:
            response = await self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )

            # Parse the JSON response
            content = response.content[0].text
            metadata_json = self._extract_json(content)

            # Build the response
            result = MetadataGenerationResponse(
                video_id=request.video_id,
                platform=request.platform,
                title=metadata_json["title"],
                description=metadata_json["description"],
                tags=metadata_json["tags"],
                category=metadata_json.get("category"),
            )

            # Add platform-specific metadata
            if request.platform == Platform.YOUTUBE:
                result.youtube_metadata = YouTubeMetadata(
                    title=metadata_json["title"],
                    description=metadata_json["description"],
                    tags=metadata_json["tags"],
                    category=metadata_json.get("category"),
                    category_id=metadata_json.get("category_id", "22"),
                    made_for_kids=metadata_json.get("made_for_kids", False),
                    privacy=VideoPrivacy(metadata_json.get("privacy", "public")),
                )
            elif request.platform == Platform.TIKTOK:
                result.tiktok_metadata = TikTokMetadata(
                    title=metadata_json["title"],
                    description=metadata_json["description"],
                    tags=metadata_json["tags"],
                    privacy=VideoPrivacy(metadata_json.get("privacy", "public")),
                    allow_duet=metadata_json.get("allow_duet", True),
                    allow_stitch=metadata_json.get("allow_stitch", True),
                    allow_comments=metadata_json.get("allow_comments", True),
                )
            elif request.platform == Platform.INSTAGRAM:
                result.instagram_metadata = InstagramMetadata(
                    title=metadata_json["title"],
                    description=metadata_json["description"],
                    tags=metadata_json["tags"],
                    privacy=VideoPrivacy(metadata_json.get("privacy", "public")),
                    share_to_feed=metadata_json.get("share_to_feed", True),
                    allow_comments=metadata_json.get("allow_comments", True),
                )

            logger.info(f"Successfully generated metadata for {request.platform.value}")
            return result

        except Exception as e:
            logger.error(f"Failed to generate metadata: {e}")
            raise

    def _get_platform_guidelines(self, platform: Platform) -> dict:
        """Get platform-specific content guidelines."""
        guidelines = {
            Platform.YOUTUBE: {
                "title_max_length": 100,
                "description_max_length": 5000,
                "max_tags": 20,
                "tag_max_length": 30,
                "tag_rules": [
                    "Each tag MUST be 30 characters or less",
                    "NO commas, angle brackets, or special characters",
                    "Use single words or short phrases",
                    "15-20 tags is optimal",
                    "Tags are case-insensitive",
                ],
                "best_practices": [
                    "Front-load keywords in title",
                    "Use timestamps in description",
                    "Include relevant hashtags (3-5)",
                    "Add call-to-action (CTA)",
                    "Optimize for search (SEO)",
                ],
                "categories": {
                    "1": "Film & Animation",
                    "2": "Autos & Vehicles",
                    "10": "Music",
                    "15": "Pets & Animals",
                    "17": "Sports",
                    "19": "Travel & Events",
                    "20": "Gaming",
                    "22": "People & Blogs",
                    "23": "Comedy",
                    "24": "Entertainment",
                    "25": "News & Politics",
                    "26": "Howto & Style",
                    "27": "Education",
                    "28": "Science & Technology",
                },
            },
            Platform.TIKTOK: {
                "title_max_length": 150,
                "description_max_length": 2200,
                "max_hashtags": 5,
                "best_practices": [
                    "Hook viewers in first 3 seconds",
                    "Use trending sounds/hashtags",
                    "Keep it short and engaging",
                    "Add captions for accessibility",
                    "Use 3-5 relevant hashtags",
                ],
            },
            Platform.INSTAGRAM: {
                "title_max_length": 30,
                "description_max_length": 2200,
                "max_hashtags": 30,
                "best_practices": [
                    "First line is critical (preview)",
                    "Use line breaks for readability",
                    "Place hashtags at end",
                    "Include call-to-action",
                    "Use 8-15 hashtags optimally",
                ],
            },
        }
        return guidelines.get(platform, {})

    def _build_system_prompt(self, platform: Platform, guidelines: dict) -> str:
        """Build the system prompt for Claude."""
        return f"""You are an expert social media content strategist specializing in {platform.value} optimization.

Your task is to generate highly engaging, SEO-optimized metadata for video content that maximizes views, engagement, and discoverability on {platform.value}.

Platform Guidelines:
{json.dumps(guidelines, indent=2)}

Key Principles:
1. Create attention-grabbing titles that drive clicks
2. Write descriptions that provide value and context
3. Use tags/hashtags strategically for discoverability
4. Follow platform best practices
5. Optimize for search and recommendations
6. Match the tone to the target audience
7. Include relevant CTAs

CRITICAL Tag Requirements for YouTube:
- Each tag MUST be 30 characters or less
- NO commas, angle brackets, or special characters in tags
- Use simple words or short phrases only
- Generate 15-20 tags maximum
- Example valid tags: ["AI video", "technology", "robotics", "future tech", "innovation"]
- Example INVALID tags: ["AI video, technology", "this is a very long tag that exceeds thirty character limit", "tech<>"]

Output Format:
You MUST respond with a valid JSON object containing:
{{
    "title": "Engaging title here",
    "description": "Detailed description here",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "category name",
    "category_id": "22",
    "privacy": "public",
    "made_for_kids": false,
    "allow_duet": true,
    "allow_stitch": true,
    "allow_comments": true,
    "share_to_feed": true
}}

Include all relevant fields for {platform.value} based on the guidelines above."""

    def _build_user_prompt(
        self,
        request: MetadataGenerationRequest,
        video_prompt: Optional[str],
        article_context: Optional[str],
        guidelines: dict,
    ) -> str:
        """Build the user prompt with video context."""
        prompt_parts = [
            f"Generate optimized metadata for a video that will be published on {request.platform.value}.",
            "",
        ]

        if video_prompt:
            prompt_parts.extend([
                "Video Content Description:",
                f"{video_prompt}",
                "",
            ])

        if article_context:
            prompt_parts.extend([
                "Source Article Context:",
                f"{article_context}",
                "",
            ])

        if request.target_audience:
            prompt_parts.extend([
                "Target Audience:",
                f"{request.target_audience}",
                "",
            ])

        if request.tone:
            prompt_parts.extend([
                "Desired Tone:",
                f"{request.tone}",
                "",
            ])

        prompt_parts.extend([
            "Requirements:",
            f"- Title: Max {guidelines.get('title_max_length', 100)} characters, attention-grabbing",
            f"- Description: Max {guidelines.get('description_max_length', 5000)} characters, informative and engaging",
            f"- Tags: Generate {guidelines.get('max_tags', guidelines.get('max_hashtags', 20))} tags maximum",
            f"- Each tag MUST be {guidelines.get('tag_max_length', 30)} characters or less",
            "- Tags must NOT contain commas, special characters, or be overly long",
            "- Use simple, searchable keywords and phrases",
            "",
            "Generate the metadata in the exact JSON format specified in the system prompt.",
        ])

        return "\n".join(prompt_parts)

    def _extract_json(self, content: str) -> dict:
        """Extract JSON from Claude's response."""
        # Try to find JSON in the response
        content = content.strip()

        # Remove markdown code blocks if present
        if content.startswith("```"):
            lines = content.split("\n")
            # Remove first and last lines (```json and ```)
            content = "\n".join(lines[1:-1]) if len(lines) > 2 else content

        # Remove any remaining markdown
        content = content.replace("```json", "").replace("```", "").strip()

        try:
            # First attempt: standard JSON parsing
            return json.loads(content)
        except json.JSONDecodeError as e:
            # Second attempt: Try to fix common issues with control characters
            logger.warning(f"JSON parse failed, attempting to clean content: {e}")

            # Remove control characters except for tab, newline, carriage return
            import re
            # Replace problematic control characters
            cleaned = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', content)

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError as e2:
                # Third attempt: Use json.loads with strict=False
                try:
                    return json.loads(content, strict=False)
                except json.JSONDecodeError as e3:
                    logger.error(f"Failed to parse JSON after cleaning. Original content: {content[:500]}")
                    raise ValueError(f"Invalid JSON response from Claude: {e3}")

    async def generate_bulk_metadata(
        self,
        video_id: str,
        platforms: list[Platform],
        video_prompt: Optional[str] = None,
        article_context: Optional[str] = None,
        target_audience: Optional[str] = None,
        tone: Optional[str] = None,
    ) -> dict[Platform, MetadataGenerationResponse]:
        """
        Generate metadata for multiple platforms at once.

        Args:
            video_id: Video ID
            platforms: List of platforms to generate for
            video_prompt: Original video prompt
            article_context: News article context
            target_audience: Target audience description
            tone: Desired tone

        Returns:
            Dictionary mapping platforms to their generated metadata
        """
        results = {}

        for platform in platforms:
            request = MetadataGenerationRequest(
                video_id=video_id,
                platform=platform,
                target_audience=target_audience,
                tone=tone,
            )

            try:
                metadata = await self.generate_metadata(request, video_prompt, article_context)
                results[platform] = metadata
            except Exception as e:
                logger.error(f"Failed to generate metadata for {platform.value}: {e}")
                # Continue with other platforms even if one fails

        return results
