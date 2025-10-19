"""Kie.ai Veo 3.1 API service wrapper for video generation."""

import asyncio
import requests
from typing import Optional
from ..config import settings
from ..models.video_response import VideoJob, ErrorDetail
from ..utils.logging_setup import logger
from .abstract_video_service import AbstractVideoService


class KieVeoService(AbstractVideoService):
    """Service class for interacting with Kie.ai's Veo 3.1 API."""

    def __init__(self):
        """Initialize the Kie Veo service."""
        self.api_key = settings.kie_api_key
        self.base_url = "https://api.kie.ai"
        logger.info("KieVeoService initialized")

    async def create_video(
        self,
        prompt: str,
        model: str = "veo-3.1",
        seconds: int = 5,
        resolution: str = "1080p",
        **kwargs
    ) -> VideoJob:
        """
        Create a new video generation job using Kie.ai Veo 3.1.

        Args:
            prompt: Text description of the video
            model: Model to use (veo-3.1)
            seconds: Duration in seconds (5 or 10)
            resolution: Video resolution (720p or 1080p)
            **kwargs: Additional parameters

        Returns:
            VideoJob with initial status

        Raises:
            Exception: If API call fails
        """
        if not self.api_key:
            raise ValueError("Kie.ai API key not configured. Please set KIE_API_KEY in .env")

        try:
            logger.info(f"Creating video with Kie Veo: '{prompt[:50]}...', duration: {seconds}s, resolution: {resolution}")

            # Kie.ai Veo 3.1 API endpoint (correct endpoint from docs)
            url = f"{self.base_url}/api/v1/veo/generate"

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            # Convert resolution to aspect ratio (Kie.ai uses aspect ratios, not resolution names)
            aspect_ratio = "16:9" if resolution == "1080p" or resolution == "720p" else "16:9"

            # Build request payload according to Kie.ai API docs
            payload = {
                "prompt": prompt,
                "model": "veo3",  # or "veo3_fast" for faster generation
                "aspectRatio": aspect_ratio,
                # Note: Kie.ai doesn't support custom duration - videos are generated at their default length
            }

            # Make synchronous request (we'll wrap in asyncio)
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(url, json=payload, headers=headers, timeout=30)
            )

            response.raise_for_status()
            result = response.json()

            # Kie.ai response format: {"code": 200, "msg": "success", "data": {"taskId": "..."}}
            if result.get('code') != 200:
                raise Exception(f"Kie.ai API error: {result.get('msg', 'Unknown error')}")

            data = result.get('data', {})
            task_id = data.get('taskId')

            logger.info(f"Kie Veo video creation started: {task_id}")

            # Convert to VideoJob format
            return self._convert_to_video_job_from_create(task_id, prompt, model, seconds, resolution)

        except requests.exceptions.RequestException as e:
            logger.error(f"Kie.ai API error during video creation: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during Kie Veo video creation: {str(e)}")
            raise

    async def get_video_status(self, video_id: str) -> VideoJob:
        """
        Retrieve the current status of a Kie.ai video generation job.

        Args:
            video_id: The video task identifier

        Returns:
            VideoJob with current status

        Raises:
            Exception: If API call fails
        """
        if not self.api_key:
            raise ValueError("Kie.ai API key not configured")

        try:
            logger.debug(f"Fetching status for Kie Veo video: {video_id}")

            # Kie.ai task status endpoint (correct endpoint from docs)
            url = f"{self.base_url}/api/v1/veo/record-info?taskId={video_id}"

            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.get(url, headers=headers, timeout=10)
            )

            response.raise_for_status()
            result = response.json()

            # Kie.ai response format: {"code": 200, "msg": "success", "data": {...}}
            if result.get('code') != 200:
                raise Exception(f"Kie.ai API error: {result.get('msg', 'Unknown error')}")

            data = result.get('data', {})
            logger.debug(f"Kie Veo video {video_id} status: {data.get('successFlag')}")

            return self._convert_to_video_job_from_status(data, video_id)

        except requests.exceptions.RequestException as e:
            logger.error(f"Kie.ai API error fetching video status for {video_id}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching Kie Veo video status for {video_id}: {str(e)}")
            raise

    async def poll_until_complete(
        self, video_id: str, timeout: int = 300, poll_interval: int = 5
    ) -> VideoJob:
        """
        Poll Kie.ai video status until completion or failure.

        Args:
            video_id: The video task identifier
            timeout: Maximum seconds to wait
            poll_interval: Polling interval in seconds

        Returns:
            Final VideoJob status

        Raises:
            TimeoutError: If timeout is reached
        """
        logger.info(f"Starting polling for Kie Veo video {video_id}, timeout: {timeout}s")

        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time

            if elapsed > timeout:
                logger.warning(f"Polling timeout reached for Kie Veo video {video_id} after {elapsed:.1f}s")
                raise TimeoutError(f"Polling timeout after {timeout} seconds")

            video = await self.get_video_status(video_id)

            if video.status in ["completed", "succeeded", "failed", "error"]:
                logger.info(f"Kie Veo video {video_id} finished with status: {video.status}")
                return video

            await asyncio.sleep(poll_interval)

    async def download_video_content(self, video_id: str) -> bytes:
        """
        Download video content from Kie.ai.

        Args:
            video_id: The video task identifier

        Returns:
            Binary content of the video

        Raises:
            Exception: If download fails
        """
        try:
            logger.info(f"Downloading video from Kie Veo: {video_id}")

            # Get video status to get download URL
            video = await self.get_video_status(video_id)

            if not video.video_url:
                raise ValueError(f"No video URL available for {video_id}")

            # Download from URL
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.get(video.video_url, timeout=60)
            )

            response.raise_for_status()
            data = response.content

            logger.info(f"Downloaded {len(data)} bytes from Kie Veo for video {video_id}")
            return data

        except Exception as e:
            logger.error(f"Error downloading Kie Veo video {video_id}: {str(e)}")
            raise

    def get_supported_models(self) -> list[str]:
        """Get list of models supported by Kie.ai."""
        return ["veo-3.1"]

    def get_service_name(self) -> str:
        """Get the name of this video generation service."""
        return "kie-veo"

    def _convert_to_video_job_from_create(
        self, task_id: str, prompt: str, model: str, seconds: int, resolution: str
    ) -> VideoJob:
        """
        Convert Kie.ai create response to VideoJob model.

        Args:
            task_id: Task ID from Kie.ai
            prompt: Original prompt
            model: Model used
            seconds: Duration
            resolution: Resolution

        Returns:
            VideoJob instance
        """
        import time

        return VideoJob(
            id=task_id,
            object="video",
            status="queued",
            model=f"kie-{model}",
            progress=0,
            created_at=int(time.time()),
            completed_at=None,
            expires_at=None,
            size=resolution,
            seconds=str(seconds),
            video_url=None,
            error=None,
        )

    def _convert_to_video_job_from_status(
        self, data: dict, task_id: str
    ) -> VideoJob:
        """
        Convert Kie.ai status response to VideoJob model.

        Args:
            data: Kie.ai status API response
            task_id: Task ID

        Returns:
            VideoJob instance
        """
        # Kie.ai status response format:
        # successFlag: 0 (pending), 1 (success), 2 (failed), 3 (processing)
        # resultUrls: JSON string array of video URLs

        success_flag = data.get("successFlag", 0)

        # Map successFlag to our status
        status_map = {
            0: "queued",        # pending
            1: "completed",     # success
            2: "failed",        # failed
            3: "in_progress",   # processing
        }
        status = status_map.get(success_flag, "queued")

        # Parse video URLs if available
        video_url = None
        if success_flag == 1 and data.get("resultUrls"):
            try:
                import json
                urls = json.loads(data.get("resultUrls", "[]"))
                if urls and len(urls) > 0:
                    video_url = urls[0]
            except:
                pass

        error_detail = None
        if success_flag == 2:
            error_detail = ErrorDetail(
                message=data.get("errorMessage", "Video generation failed"),
                type="kie_api_error"
            )

        return VideoJob(
            id=task_id,
            object="video",
            status=status,
            model="kie-veo-3.1",
            progress=100 if success_flag == 1 else (50 if success_flag == 3 else 0),
            created_at=data.get("createTime", 0),
            completed_at=data.get("updateTime") if success_flag == 1 else None,
            expires_at=None,
            size=data.get("resolution", "1080p"),
            seconds="5",  # Default for Veo 3.1
            video_url=video_url,
            error=error_detail,
        )
