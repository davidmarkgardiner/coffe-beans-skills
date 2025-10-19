"""Service for formatting videos for different social media platforms."""

import logging
import subprocess
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image

from ..config import settings
from ..models.publishing import Platform

logger = logging.getLogger(__name__)


class VideoFormatterService:
    """Service for converting videos to platform-specific formats."""

    # Platform requirements
    PLATFORM_SPECS = {
        Platform.YOUTUBE: {
            "aspect_ratios": ["16:9", "9:16", "1:1", "4:3"],
            "max_file_size_mb": 256 * 1024,  # 256 GB
            "max_duration_seconds": 12 * 3600,  # 12 hours
            "recommended_resolutions": ["1920x1080", "2560x1440", "3840x2160"],
            "formats": ["mp4", "mov", "avi", "flv", "wmv"],
            "codecs": ["h264", "h265"],
        },
        Platform.TIKTOK: {
            "aspect_ratios": ["9:16"],  # Vertical only
            "max_file_size_mb": 287,
            "max_duration_seconds": 10 * 60,  # 10 minutes
            "recommended_resolutions": ["1080x1920"],
            "formats": ["mp4", "mov"],
            "codecs": ["h264"],
            "min_resolution": "540x960",
        },
        Platform.INSTAGRAM: {
            "aspect_ratios": ["9:16", "1:1", "4:5"],  # Reels are 9:16
            "max_file_size_mb": 1024,  # 1 GB for reels
            "max_duration_seconds": 90,  # Reels are 90s max
            "recommended_resolutions": ["1080x1920", "1080x1080", "1080x1350"],
            "formats": ["mp4", "mov"],
            "codecs": ["h264"],
        },
    }

    def __init__(self):
        """Initialize the video formatter service."""
        self.output_dir = Path(settings.video_storage_path) / "formatted"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def format_for_platform(
        self,
        video_path: str,
        platform: Platform,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Format a video for a specific platform.

        Args:
            video_path: Path to input video
            platform: Target platform
            output_path: Optional output path (auto-generated if not provided)

        Returns:
            Path to formatted video
        """
        video_file = Path(video_path)
        if not video_file.exists():
            raise FileNotFoundError(f"Video not found: {video_path}")

        if output_path is None:
            output_path = self.output_dir / f"{video_file.stem}_{platform.value}{video_file.suffix}"
        else:
            output_path = Path(output_path)

        logger.info(f"Formatting video for {platform.value}: {video_path}")

        specs = self.PLATFORM_SPECS[platform]

        # Get current video info
        video_info = await self._get_video_info(video_path)

        # Check if conversion is needed
        needs_conversion = await self._needs_conversion(video_info, specs, platform)

        if not needs_conversion:
            logger.info(f"Video already meets {platform.value} specs, no conversion needed")
            return str(video_path)

        # Perform conversion
        await self._convert_video(
            input_path=video_path,
            output_path=str(output_path),
            specs=specs,
            platform=platform,
        )

        logger.info(f"Video formatted for {platform.value}: {output_path}")
        return str(output_path)

    async def _get_video_info(self, video_path: str) -> dict:
        """Get video metadata using ffprobe."""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                "-show_streams",
                video_path,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, check=True)

            import json
            info = json.loads(result.stdout)

            # Extract video stream info
            video_stream = next(
                (s for s in info["streams"] if s["codec_type"] == "video"),
                None
            )

            if not video_stream:
                raise ValueError("No video stream found")

            return {
                "width": int(video_stream["width"]),
                "height": int(video_stream["height"]),
                "duration": float(info["format"]["duration"]),
                "size_mb": int(info["format"]["size"]) / (1024 * 1024),
                "codec": video_stream["codec_name"],
                "format": info["format"]["format_name"],
                "bitrate": int(info["format"]["bit_rate"]),
            }

        except subprocess.CalledProcessError as e:
            logger.error(f"ffprobe failed: {e}")
            raise ValueError(f"Failed to get video info: {e}")

    async def _needs_conversion(self, video_info: dict, specs: dict, platform: Platform) -> bool:
        """Check if video needs conversion for the platform."""
        # Check duration
        if video_info["duration"] > specs["max_duration_seconds"]:
            logger.info(f"Video duration ({video_info['duration']}s) exceeds platform limit")
            return True

        # Check file size
        if video_info["size_mb"] > specs["max_file_size_mb"]:
            logger.info(f"Video size ({video_info['size_mb']}MB) exceeds platform limit")
            return True

        # Check codec
        if video_info["codec"] not in specs["codecs"]:
            logger.info(f"Video codec ({video_info['codec']}) not supported by platform")
            return True

        # Check aspect ratio for strict platforms (TikTok)
        if platform == Platform.TIKTOK:
            aspect_ratio = video_info["width"] / video_info["height"]
            # TikTok requires 9:16 (0.5625)
            if abs(aspect_ratio - 0.5625) > 0.01:
                logger.info(f"Video aspect ratio not suitable for TikTok (need 9:16)")
                return True

        # Check minimum resolution for TikTok
        if platform == Platform.TIKTOK and "min_resolution" in specs:
            min_width, min_height = map(int, specs["min_resolution"].split("x"))
            if video_info["width"] < min_width or video_info["height"] < min_height:
                logger.info(f"Video resolution too low for TikTok")
                return True

        return False

    async def _convert_video(
        self,
        input_path: str,
        output_path: str,
        specs: dict,
        platform: Platform,
    ) -> None:
        """Convert video to platform specifications using ffmpeg."""
        # Build ffmpeg command
        cmd = ["ffmpeg", "-i", input_path]

        # Video codec
        if specs["codecs"]:
            cmd.extend(["-c:v", "libx264"])

        # Audio codec
        cmd.extend(["-c:a", "aac"])

        # Platform-specific settings
        if platform == Platform.TIKTOK:
            # TikTok: 9:16 vertical, 1080x1920
            cmd.extend([
                "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
                "-r", "30",  # 30 fps
                "-b:v", "5000k",  # Bitrate
            ])
        elif platform == Platform.INSTAGRAM:
            # Instagram Reels: 9:16 vertical, 1080x1920
            cmd.extend([
                "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
                "-r", "30",
                "-b:v", "5000k",
            ])
        elif platform == Platform.YOUTUBE:
            # YouTube: Keep original, optimize quality
            cmd.extend([
                "-preset", "slow",
                "-crf", "18",  # High quality
            ])

        # Trim if exceeds duration
        max_duration = specs["max_duration_seconds"]
        cmd.extend(["-t", str(max_duration)])

        # Output
        cmd.extend(["-y", output_path])  # -y to overwrite

        logger.info(f"Running ffmpeg: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
            )
            logger.info("Video conversion completed successfully")

        except subprocess.CalledProcessError as e:
            logger.error(f"ffmpeg failed: {e.stderr}")
            raise ValueError(f"Video conversion failed: {e}")

    async def create_thumbnail(
        self,
        video_path: str,
        output_path: Optional[str] = None,
        timestamp: float = 0.0,
    ) -> str:
        """
        Extract a thumbnail from a video.

        Args:
            video_path: Path to video
            output_path: Output path for thumbnail
            timestamp: Time in seconds to extract frame

        Returns:
            Path to thumbnail image
        """
        video_file = Path(video_path)
        if not video_file.exists():
            raise FileNotFoundError(f"Video not found: {video_path}")

        if output_path is None:
            output_path = self.output_dir / f"{video_file.stem}_thumb.jpg"
        else:
            output_path = Path(output_path)

        cmd = [
            "ffmpeg",
            "-ss", str(timestamp),
            "-i", video_path,
            "-frames:v", "1",
            "-q:v", "2",  # High quality
            "-y",
            str(output_path),
        ]

        try:
            subprocess.run(cmd, capture_output=True, check=True)
            logger.info(f"Thumbnail created: {output_path}")
            return str(output_path)

        except subprocess.CalledProcessError as e:
            logger.error(f"Thumbnail creation failed: {e}")
            raise ValueError(f"Failed to create thumbnail: {e}")

    async def resize_thumbnail_for_youtube(
        self,
        image_path: str,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Resize thumbnail for YouTube requirements (1280x720).

        Args:
            image_path: Path to input image
            output_path: Output path

        Returns:
            Path to resized thumbnail
        """
        img_file = Path(image_path)
        if not img_file.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        if output_path is None:
            output_path = self.output_dir / f"{img_file.stem}_youtube{img_file.suffix}"
        else:
            output_path = Path(output_path)

        try:
            with Image.open(image_path) as img:
                # YouTube thumbnail: 1280x720
                img_resized = img.resize((1280, 720), Image.Resampling.LANCZOS)
                img_resized.save(output_path, quality=95)

            logger.info(f"YouTube thumbnail resized: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Thumbnail resize failed: {e}")
            raise ValueError(f"Failed to resize thumbnail: {e}")

    def check_platform_compatibility(self, video_path: str, platform: Platform) -> dict:
        """
        Check if a video is compatible with a platform.

        Returns:
            Dictionary with compatibility info
        """
        try:
            import asyncio
            video_info = asyncio.run(self._get_video_info(video_path))
            specs = self.PLATFORM_SPECS[platform]
            needs_conv = asyncio.run(self._needs_conversion(video_info, specs, platform))

            return {
                "compatible": not needs_conv,
                "video_info": video_info,
                "platform_specs": specs,
                "recommendations": self._get_recommendations(video_info, specs, platform),
            }

        except Exception as e:
            logger.error(f"Compatibility check failed: {e}")
            return {
                "compatible": False,
                "error": str(e),
            }

    def _get_recommendations(self, video_info: dict, specs: dict, platform: Platform) -> list[str]:
        """Generate recommendations for optimizing video for platform."""
        recommendations = []

        if video_info["duration"] > specs["max_duration_seconds"]:
            recommendations.append(
                f"Trim video to {specs['max_duration_seconds']}s or less"
            )

        if video_info["size_mb"] > specs["max_file_size_mb"]:
            recommendations.append(
                f"Reduce file size to under {specs['max_file_size_mb']}MB"
            )

        if platform == Platform.TIKTOK:
            if video_info["width"] / video_info["height"] != 9/16:
                recommendations.append("Convert to 9:16 vertical aspect ratio (1080x1920)")

        if platform == Platform.INSTAGRAM:
            if video_info["duration"] > 90:
                recommendations.append("Trim to 90 seconds for Instagram Reels")

        return recommendations


# Singleton instance
_formatter_service: Optional[VideoFormatterService] = None


def get_video_formatter() -> VideoFormatterService:
    """Get or create the video formatter singleton."""
    global _formatter_service
    if _formatter_service is None:
        _formatter_service = VideoFormatterService()
    return _formatter_service
