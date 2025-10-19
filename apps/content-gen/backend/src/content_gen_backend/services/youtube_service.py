"""Service for publishing videos to YouTube using Google API."""

import logging
import os
from pathlib import Path
from typing import Optional

import httpx
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

from ..config import settings
from ..models.publishing import YouTubeMetadata, VideoPrivacy

logger = logging.getLogger(__name__)

# YouTube API scopes
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
]


class YouTubeService:
    """Service for YouTube video uploads and management."""

    def __init__(self):
        """Initialize the YouTube service."""
        self.credentials: Optional[Credentials] = None
        self.youtube = None

    def _sanitize_tags(self, tags: list[str]) -> list[str]:
        """
        Sanitize tags for YouTube API compliance.

        YouTube Requirements:
        - Max 500 characters total for all tags
        - Each tag max 30 characters
        - No angle brackets (< >)
        - Tags are case-insensitive

        Args:
            tags: List of raw tags from metadata generation

        Returns:
            List of sanitized, valid YouTube tags
        """
        sanitized = []
        total_chars = 0

        for tag in tags:
            if not tag or not isinstance(tag, str):
                continue

            # Remove leading/trailing whitespace
            tag = tag.strip()

            # Remove invalid characters (angle brackets)
            tag = tag.replace('<', '').replace('>', '')

            # Remove commas (often cause issues)
            tag = tag.replace(',', '')

            # Truncate to 30 characters max
            if len(tag) > 30:
                tag = tag[:30].strip()

            # Skip empty tags after sanitization
            if not tag:
                continue

            # Check if adding this tag would exceed 500 char limit
            tag_length = len(tag) + 1  # +1 for separator
            if total_chars + tag_length > 500:
                logger.warning(f"Reached YouTube tag character limit (500), stopping at {len(sanitized)} tags")
                break

            sanitized.append(tag)
            total_chars += tag_length

            # YouTube recommends max 15-20 tags for best performance
            if len(sanitized) >= 20:
                logger.info(f"Reached recommended tag limit (20), skipping remaining tags")
                break

        logger.info(f"Sanitized {len(tags)} tags to {len(sanitized)} valid YouTube tags")
        return sanitized

    async def authenticate(self, force_refresh: bool = False) -> bool:
        """
        Authenticate with YouTube API using OAuth2.

        Args:
            force_refresh: Force a new authentication flow

        Returns:
            True if authentication successful
        """
        creds_file = Path(settings.youtube_credentials_file)
        token_file = creds_file.parent / "youtube_token.json"

        # Load existing credentials
        if token_file.exists() and not force_refresh:
            self.credentials = Credentials.from_authorized_user_file(str(token_file), SCOPES)

        # Refresh expired credentials
        if self.credentials and self.credentials.expired and self.credentials.refresh_token:
            try:
                self.credentials.refresh(Request())
                logger.info("YouTube credentials refreshed successfully")
            except Exception as e:
                logger.warning(f"Failed to refresh credentials: {e}")
                self.credentials = None

        # Run OAuth flow if needed
        if not self.credentials or not self.credentials.valid:
            if not creds_file.exists():
                raise FileNotFoundError(
                    f"YouTube credentials file not found at {creds_file}. "
                    "Please download OAuth client credentials from Google Cloud Console."
                )

            flow = InstalledAppFlow.from_client_secrets_file(str(creds_file), SCOPES)
            self.credentials = flow.run_local_server(port=8080)

            # Save credentials for future use
            token_file.parent.mkdir(parents=True, exist_ok=True)
            token_file.write_text(self.credentials.to_json())
            logger.info("YouTube credentials saved successfully")

        # Build YouTube API client
        self.youtube = build("youtube", "v3", credentials=self.credentials)
        logger.info("YouTube API client initialized")
        return True

    async def upload_video(
        self,
        video_path: str,
        metadata: YouTubeMetadata,
        notify_subscribers: bool = False,
    ) -> dict:
        """
        Upload a video to YouTube.

        Args:
            video_path: Path to the video file
            metadata: Video metadata
            notify_subscribers: Whether to notify subscribers

        Returns:
            Dictionary with video ID and URL
        """
        if not self.youtube:
            await self.authenticate()

        if not Path(video_path).exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        # Sanitize and validate tags for YouTube
        sanitized_tags = self._sanitize_tags(metadata.tags or [])

        # Prepare video metadata
        body = {
            "snippet": {
                "title": metadata.title,
                "description": metadata.description or "",
                "tags": sanitized_tags,
                "categoryId": metadata.category_id,
            },
            "status": {
                "privacyStatus": metadata.privacy.value,
                "selfDeclaredMadeForKids": metadata.made_for_kids,
                "notifySubscribers": notify_subscribers,
            },
        }

        # Create media upload
        media = MediaFileUpload(
            video_path,
            mimetype="video/*",
            resumable=True,
            chunksize=1024 * 1024,  # 1MB chunks
        )

        logger.info(f"Uploading video to YouTube: {metadata.title}")

        try:
            # Execute upload
            request = self.youtube.videos().insert(
                part=",".join(body.keys()),
                body=body,
                media_body=media,
            )

            response = None
            while response is None:
                status, response = request.next_chunk()
                if status:
                    progress = int(status.progress() * 100)
                    logger.info(f"Upload progress: {progress}%")

            video_id = response["id"]
            video_url = f"https://www.youtube.com/watch?v={video_id}"

            logger.info(f"Video uploaded successfully: {video_url}")

            # Add to playlists if specified
            if metadata.playlist_ids:
                await self._add_to_playlists(video_id, metadata.playlist_ids)

            return {
                "video_id": video_id,
                "url": video_url,
                "title": metadata.title,
                "privacy": metadata.privacy.value,
            }

        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            raise Exception(f"Failed to upload video: {e}")
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            raise

    async def update_video(
        self,
        video_id: str,
        metadata: YouTubeMetadata,
    ) -> dict:
        """
        Update metadata for an existing YouTube video.

        Args:
            video_id: YouTube video ID
            metadata: New metadata

        Returns:
            Updated video info
        """
        if not self.youtube:
            await self.authenticate()

        body = {
            "id": video_id,
            "snippet": {
                "title": metadata.title,
                "description": metadata.description or "",
                "tags": metadata.tags or [],
                "categoryId": metadata.category_id,
            },
            "status": {
                "privacyStatus": metadata.privacy.value,
                "selfDeclaredMadeForKids": metadata.made_for_kids,
            },
        }

        try:
            response = self.youtube.videos().update(
                part="snippet,status",
                body=body,
            ).execute()

            logger.info(f"Video {video_id} updated successfully")
            return response

        except HttpError as e:
            logger.error(f"Failed to update video: {e}")
            raise

    async def delete_video(self, video_id: str) -> bool:
        """
        Delete a video from YouTube.

        Args:
            video_id: YouTube video ID

        Returns:
            True if deleted successfully
        """
        if not self.youtube:
            await self.authenticate()

        try:
            self.youtube.videos().delete(id=video_id).execute()
            logger.info(f"Video {video_id} deleted successfully")
            return True

        except HttpError as e:
            logger.error(f"Failed to delete video: {e}")
            return False

    async def get_video_stats(self, video_id: str) -> dict:
        """
        Get statistics for a YouTube video.

        Args:
            video_id: YouTube video ID

        Returns:
            Dictionary with video statistics
        """
        if not self.youtube:
            await self.authenticate()

        try:
            response = self.youtube.videos().list(
                part="statistics,snippet,status",
                id=video_id,
            ).execute()

            if not response.get("items"):
                raise ValueError(f"Video {video_id} not found")

            video = response["items"][0]
            stats = video.get("statistics", {})

            return {
                "video_id": video_id,
                "views": int(stats.get("viewCount", 0)),
                "likes": int(stats.get("likeCount", 0)),
                "comments": int(stats.get("commentCount", 0)),
                "title": video["snippet"]["title"],
                "published_at": video["snippet"]["publishedAt"],
            }

        except HttpError as e:
            logger.error(f"Failed to get video stats: {e}")
            raise

    async def _add_to_playlists(self, video_id: str, playlist_ids: list[str]) -> None:
        """Add video to specified playlists."""
        for playlist_id in playlist_ids:
            try:
                self.youtube.playlistItems().insert(
                    part="snippet",
                    body={
                        "snippet": {
                            "playlistId": playlist_id,
                            "resourceId": {
                                "kind": "youtube#video",
                                "videoId": video_id,
                            },
                        }
                    },
                ).execute()
                logger.info(f"Video {video_id} added to playlist {playlist_id}")
            except HttpError as e:
                logger.error(f"Failed to add video to playlist {playlist_id}: {e}")

    async def list_channels(self) -> list[dict]:
        """
        List YouTube channels for the authenticated user.

        Returns:
            List of channel information
        """
        if not self.youtube:
            await self.authenticate()

        try:
            response = self.youtube.channels().list(
                part="snippet,contentDetails,statistics",
                mine=True,
            ).execute()

            channels = []
            for item in response.get("items", []):
                channels.append({
                    "id": item["id"],
                    "title": item["snippet"]["title"],
                    "description": item["snippet"]["description"],
                    "subscriber_count": item["statistics"].get("subscriberCount", 0),
                    "video_count": item["statistics"].get("videoCount", 0),
                })

            return channels

        except HttpError as e:
            logger.error(f"Failed to list channels: {e}")
            raise

    async def create_thumbnail(
        self,
        video_id: str,
        thumbnail_path: str,
    ) -> bool:
        """
        Upload a custom thumbnail for a video.

        Args:
            video_id: YouTube video ID
            thumbnail_path: Path to thumbnail image

        Returns:
            True if successful
        """
        if not self.youtube:
            await self.authenticate()

        if not Path(thumbnail_path).exists():
            raise FileNotFoundError(f"Thumbnail not found: {thumbnail_path}")

        try:
            media = MediaFileUpload(thumbnail_path, mimetype="image/jpeg", resumable=False)

            self.youtube.thumbnails().set(
                videoId=video_id,
                media_body=media,
            ).execute()

            logger.info(f"Thumbnail uploaded for video {video_id}")
            return True

        except HttpError as e:
            logger.error(f"Failed to upload thumbnail: {e}")
            return False


# Singleton instance
_youtube_service: Optional[YouTubeService] = None


def get_youtube_service() -> YouTubeService:
    """Get or create the YouTube service singleton."""
    global _youtube_service
    if _youtube_service is None:
        _youtube_service = YouTubeService()
    return _youtube_service
