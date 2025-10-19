"""Model router service for multi-model video generation."""

from typing import Literal, Optional
from ..models.video_response import VideoJob
from ..utils.logging_setup import logger
from .sora_service import SoraService
from .kie_veo_service import KieVeoService
from .kie_wan_service import KieWanService


class ModelRouterService:
    """
    Routes video generation requests to appropriate model service.

    Supports:
    - OpenAI Sora 2 (sora-2, sora-2-pro)
    - Kie.ai Veo 3.1 (veo-3.1)
    - Kie.ai Wan 2.5 (wan-2.5)
    """

    def __init__(self):
        """Initialize all available video services."""
        self.sora = SoraService()
        self.kie_veo = KieVeoService()
        self.kie_wan = KieWanService()
        logger.info("ModelRouterService initialized")

    async def generate_video(
        self,
        prompt: str,
        model: Literal["sora-2", "sora-2-pro", "veo-3.1", "wan-2.5", "auto"] = "auto",
        **kwargs
    ) -> VideoJob:
        """
        Generate video using specified or auto-selected model.

        Args:
            prompt: Text description of the video
            model: Model to use:
                - "sora-2": OpenAI Sora 2 (fast)
                - "sora-2-pro": OpenAI Sora 2 Pro (high quality)
                - "veo-3.1": Kie.ai Veo 3.1 (Google's cinematic model)
                - "wan-2.5": Kie.ai Wan 2.5 (Alibaba's image-to-video with lip-sync)
                - "auto": Auto-select based on prompt characteristics
            **kwargs: Model-specific parameters

        Returns:
            VideoJob with initial status

        Raises:
            ValueError: If model is not supported
            Exception: If video generation fails
        """
        if model == "auto":
            model = self._select_best_model(prompt, kwargs)

        logger.info(f"Routing video generation to model: {model}")

        try:
            if model in ["sora-2", "sora-2-pro"]:
                return await self._generate_with_sora(prompt, model, **kwargs)
            elif model == "veo-3.1":
                return await self._generate_with_veo(prompt, **kwargs)
            elif model == "wan-2.5":
                return await self._generate_with_wan(prompt, **kwargs)
            else:
                raise ValueError(f"Unsupported model: {model}")

        except Exception as e:
            logger.error(f"Error with {model}, trying fallback")
            # Fallback to Sora 2 if available
            if model != "sora-2":
                logger.info("Attempting fallback to sora-2")
                return await self._generate_with_sora(prompt, "sora-2", **kwargs)
            raise

    async def _generate_with_sora(
        self, prompt: str, model: str, **kwargs
    ) -> VideoJob:
        """Generate video using OpenAI Sora."""
        seconds = kwargs.get("seconds", 4)
        size = kwargs.get("size", "1280x720")
        input_reference = kwargs.get("input_reference")

        return await self.sora.create_video(
            prompt=prompt,
            model=model,
            seconds=seconds,
            size=size,
            input_reference=input_reference
        )

    async def _generate_with_veo(
        self, prompt: str, **kwargs
    ) -> VideoJob:
        """Generate video using Kie.ai Veo 3.1."""
        seconds = kwargs.get("seconds", 5)
        resolution = self._convert_size_to_resolution(kwargs.get("size", "1280x720"))

        return await self.kie_veo.create_video(
            prompt=prompt,
            model="veo-3.1",
            seconds=seconds,
            resolution=resolution
        )

    async def _generate_with_wan(
        self, prompt: str, **kwargs
    ) -> VideoJob:
        """Generate video using Kie.ai Wan 2.5."""
        seconds = kwargs.get("seconds", 5)
        resolution = self._convert_size_to_resolution(kwargs.get("size", "1280x720"))
        image_url = kwargs.get("image_url")  # Optional for image-to-video

        return await self.kie_wan.create_video(
            prompt=prompt,
            model="wan-2.5",
            seconds=seconds,
            resolution=resolution,
            image_url=image_url,
            enable_prompt_expansion=True
        )

    def _select_best_model(self, prompt: str, kwargs: dict) -> str:
        """
        Auto-select best model based on prompt characteristics and parameters.

        Selection heuristics:
        - Wan 2.5: Best for human subjects with dialogue/speech (requires image_url for best results)
        - Veo 3.1: Better for realistic, cinematic content (requires 5 or 10 second duration)
        - Sora 2 Pro: Better for artistic, creative content (requires 4, 8, or 12 seconds)
        - Sora 2: Fast, general purpose (requires 4, 8, or 12 seconds)
        """
        prompt_lower = prompt.lower()
        seconds = kwargs.get("seconds", 4)
        has_image = kwargs.get("image_url") is not None or kwargs.get("input_reference") is not None

        # Check for human speech/dialogue keywords (Wan 2.5)
        # Wan 2.5 excels at lip-sync and human subjects
        if any(keyword in prompt_lower for keyword in [
            "speak", "speaks", "speaking", "talk", "talking", "says", "dialogue",
            "lip-sync", "lip sync", "mouth", "voice", "announce", "presenter"
        ]):
            if seconds in [5, 10]:
                logger.info("Auto-selected wan-2.5 for human speech/dialogue content")
                return "wan-2.5"

        # Check for cinematic/realistic keywords (Veo 3.1)
        # But only if duration is compatible (5 or 10 seconds) and not speech-focused
        if any(keyword in prompt_lower for keyword in [
            "realistic", "cinematic", "documentary", "photorealistic",
            "professional", "commercial", "news", "interview"
        ]):
            if seconds in [5, 10]:
                logger.info("Auto-selected veo-3.1 for realistic/cinematic content")
                return "veo-3.1"
            else:
                logger.info(f"Veo 3.1 preferred but duration {seconds}s incompatible, using sora-2-pro")
                return "sora-2-pro"

        # Check for artistic/creative keywords (Sora 2 Pro)
        if any(keyword in prompt_lower for keyword in [
            "artistic", "abstract", "surreal", "dreamlike", "fantasy",
            "painting", "watercolor", "anime", "stylized"
        ]):
            logger.info("Auto-selected sora-2-pro for artistic content")
            return "sora-2-pro"

        # Default to Sora 2 (fast, general purpose)
        logger.info("Auto-selected sora-2 as default")
        return "sora-2"

    def _convert_size_to_resolution(self, size: str) -> str:
        """
        Convert Sora-style size (WxH) to resolution (720p/1080p).

        Args:
            size: Size string like "1280x720"

        Returns:
            Resolution string like "720p" or "1080p"
        """
        if "1080" in size or "1920" in size:
            return "1080p"
        else:
            return "720p"

    def get_available_models(self) -> dict[str, list[str]]:
        """Get all available models grouped by service."""
        return {
            "sora": self.sora.get_supported_models() if hasattr(self.sora, 'get_supported_models') else ["sora-2", "sora-2-pro"],
            "kie-veo": self.kie_veo.get_supported_models(),
            "kie-wan": self.kie_wan.get_supported_models(),
        }

    def get_model_info(self, model: str) -> dict:
        """
        Get information about a specific model.

        Args:
            model: Model identifier

        Returns:
            Dictionary with model information
        """
        model_info = {
            "sora-2": {
                "name": "Sora 2",
                "provider": "OpenAI",
                "description": "Fast, general-purpose video generation",
                "cost_per_10s": 0.15,
                "max_duration": 12,
                "resolutions": ["1280x720", "720x1280", "1024x1792", "1792x1024"]
            },
            "sora-2-pro": {
                "name": "Sora 2 Pro",
                "provider": "OpenAI",
                "description": "High-quality, creative video generation",
                "cost_per_10s": 0.30,
                "max_duration": 12,
                "resolutions": ["1280x720", "720x1280", "1024x1792", "1792x1024"]
            },
            "veo-3.1": {
                "name": "Veo 3.1",
                "provider": "Google (via Kie.ai)",
                "description": "Cinematic, realistic video generation",
                "cost_per_10s": 0.10,
                "max_duration": 10,
                "resolutions": ["720p", "1080p"]
            },
            "wan-2.5": {
                "name": "Wan 2.5",
                "provider": "Alibaba (via Kie.ai)",
                "description": "Image-to-video with lip-sync and human subjects",
                "cost_per_10s": 0.08,
                "max_duration": 10,
                "resolutions": ["720p", "1080p"],
                "features": ["lip-sync", "image-to-video", "prompt-expansion"]
            }
        }

        return model_info.get(model, {
            "name": model,
            "provider": "Unknown",
            "description": "No information available"
        })
