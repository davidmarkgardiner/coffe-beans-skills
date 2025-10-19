"""Kie.ai Wan 2.5 API service wrapper for video generation."""

import asyncio
import requests
from typing import Optional
from ..config import settings
from ..models.video_response import VideoJob, ErrorDetail
from ..utils.logging_setup import logger
from .abstract_video_service import AbstractVideoService


class KieWanService(AbstractVideoService):
    """Service class for interacting with Kie.ai's Wan 2.5 API."""

    def __init__(self):
        """Initialize the Kie Wan service."""
        self.api_key = settings.kie_api_key
        self.base_url = "https://api.kie.ai"
        logger.info("KieWanService initialized")

    async def create_video(
        self,
        prompt: str,
        model: str = "wan-2.5",
        seconds: int = 5,
        resolution: str = "1080p",
        image_url: Optional[str] = None,
        enable_prompt_expansion: bool = True,
        **kwargs
    ) -> VideoJob:
        """
        Create a new video generation job using Kie.ai Wan 2.5.

        Args:
            prompt: Text description of the video
            model: Model to use (wan-2.5)
            seconds: Duration in seconds (5 or 10)
            resolution: Video resolution (720p or 1080p)
            image_url: Optional image URL for image-to-video
            enable_prompt_expansion: Enable AI prompt enhancement
            **kwargs: Additional parameters

        Returns:
            VideoJob with initial status

        Raises:
            Exception: If API call fails
        """
        if not self.api_key:
            raise ValueError("Kie.ai API key not configured. Please set KIE_API_KEY in .env")

        try:
            logger.info(f"Creating video with Kie Wan 2.5: '{prompt[:50]}...', duration: {seconds}s, resolution: {resolution}")

            # Kie.ai Wan 2.5 API endpoint
            url = f"{self.base_url}/api/v1/jobs/createTask"

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            # Build request payload according to Kie.ai Wan 2.5 API
            input_data = {
                "prompt": prompt,
                "duration": str(seconds),
                "resolution": resolution,
                "enable_prompt_expansion": enable_prompt_expansion,
            }

            # Add image URL if provided (for image-to-video)
            if image_url:
                input_data["image_url"] = image_url

            payload = {
                "model": "wan/2-5-image-to-video",
                "input": input_data,
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

            logger.info(f"Kie Wan 2.5 video creation started: {task_id}")

            # Convert to VideoJob format
            return self._convert_to_video_job_from_create(task_id, prompt, model, seconds, resolution)

        except requests.exceptions.RequestException as e:
            logger.error(f"Kie.ai API error during video creation: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during Kie Wan video creation: {str(e)}")
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
            logger.debug(f"Fetching status for Kie Wan video: {video_id}")

            # Kie.ai generic task status endpoint
            url = f"{self.base_url}/api/v1/jobs/getTask/{video_id}"

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
            logger.debug(f"Kie Wan video {video_id} status: {data.get('status')}")

            return self._convert_to_video_job_from_status(data, video_id)

        except requests.exceptions.RequestException as e:
            logger.error(f"Kie.ai API error fetching video status for {video_id}: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching Kie Wan video status for {video_id}: {str(e)}")
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
        logger.info(f"Starting polling for Kie Wan video {video_id}, timeout: {timeout}s")

        start_time = asyncio.get_event_loop().time()

        while True:
            elapsed = asyncio.get_event_loop().time() - start_time

            if elapsed > timeout:
                logger.warning(f"Polling timeout reached for Kie Wan video {video_id} after {elapsed:.1f}s")
                raise TimeoutError(f"Polling timeout after {timeout} seconds")

            video = await self.get_video_status(video_id)

            if video.status in ["completed", "succeeded", "failed", "error"]:
                logger.info(f"Kie Wan video {video_id} finished with status: {video.status}")
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
            logger.info(f"Downloading video from Kie Wan: {video_id}")

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

            logger.info(f"Downloaded {len(data)} bytes from Kie Wan for video {video_id}")
            return data

        except Exception as e:
            logger.error(f"Error downloading Kie Wan video {video_id}: {str(e)}")
            raise

    def get_supported_models(self) -> list[str]:
        """Get list of models supported by Kie.ai Wan."""
        return ["wan-2.5"]

    def get_service_name(self) -> str:
        """Get the name of this video generation service."""
        return "kie-wan"

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
        # Kie.ai Wan status response format:
        # status: "pending", "processing", "succeeded", "failed"
        # output: {video_url: "..."}

        status_raw = data.get("status", "pending").lower()

        # Map Kie.ai status to our status
        status_map = {
            "pending": "queued",
            "processing": "in_progress",
            "succeeded": "completed",
            "completed": "completed",
            "failed": "failed",
            "error": "failed"
        }
        status = status_map.get(status_raw, status_raw)

        # Extract video URL from output
        video_url = None
        output = data.get("output", {})
        if isinstance(output, dict):
            video_url = output.get("video_url") or output.get("videoUrl")

        error_detail = None
        if status == "failed":
            error_detail = ErrorDetail(
                message=data.get("error", "Video generation failed"),
                type="kie_api_error"
            )

        # Calculate progress
        progress = 0
        if status == "completed":
            progress = 100
        elif status == "in_progress":
            progress = 50

        return VideoJob(
            id=task_id,
            object="video",
            status=status,
            model="kie-wan-2.5",
            progress=progress,
            created_at=data.get("createTime", 0),
            completed_at=data.get("updateTime") if status == "completed" else None,
            expires_at=None,
            size=data.get("resolution", "1080p"),
            seconds="5",  # Default for Wan 2.5
            video_url=video_url,
            error=error_detail,
        )
