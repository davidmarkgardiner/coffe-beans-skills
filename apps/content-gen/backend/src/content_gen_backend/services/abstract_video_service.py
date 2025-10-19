"""Abstract base class for video generation services."""

from abc import ABC, abstractmethod
from typing import Optional
from ..models.video_response import VideoJob


class AbstractVideoService(ABC):
    """
    Abstract base class defining the interface for video generation services.

    All video generation services (Sora, Veo, Wan, etc.) should implement this interface
    to ensure consistency and enable the model router to work with any service.
    """

    @abstractmethod
    async def create_video(
        self,
        prompt: str,
        **kwargs
    ) -> VideoJob:
        """
        Create a new video generation job.

        Args:
            prompt: Text description of the video
            **kwargs: Service-specific parameters (model, seconds, size, etc.)

        Returns:
            VideoJob with initial status

        Raises:
            Exception: If video creation fails
        """
        pass

    @abstractmethod
    async def get_video_status(self, video_id: str) -> VideoJob:
        """
        Retrieve the current status of a video generation job.

        Args:
            video_id: The video job identifier

        Returns:
            VideoJob with current status

        Raises:
            Exception: If status retrieval fails
        """
        pass

    @abstractmethod
    async def poll_until_complete(
        self, video_id: str, timeout: int = 300, poll_interval: int = 2
    ) -> VideoJob:
        """
        Poll video status until completion or failure.

        Args:
            video_id: The video job identifier
            timeout: Maximum seconds to wait
            poll_interval: Initial polling interval in seconds

        Returns:
            Final VideoJob status

        Raises:
            TimeoutError: If timeout is reached
            Exception: If polling fails
        """
        pass

    @abstractmethod
    async def download_video_content(self, video_id: str) -> bytes:
        """
        Download video content.

        Args:
            video_id: The video job identifier

        Returns:
            Binary content of the video

        Raises:
            Exception: If download fails
        """
        pass

    @abstractmethod
    def get_supported_models(self) -> list[str]:
        """
        Get list of models supported by this service.

        Returns:
            List of model identifiers
        """
        pass

    @abstractmethod
    def get_service_name(self) -> str:
        """
        Get the name of this video generation service.

        Returns:
            Service name (e.g., 'sora', 'veo', 'wan')
        """
        pass
