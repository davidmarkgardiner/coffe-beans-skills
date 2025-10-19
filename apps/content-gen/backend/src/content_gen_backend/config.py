"""Configuration settings for the Content Generation Backend."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenAI Configuration
    openai_api_key: str
    video_storage_path: str = "./videos"
    max_poll_timeout: int = 600
    default_model: str = "sora-2"
    default_size: str = "1280x720"
    default_seconds: int = 4
    max_file_size: int = 10485760  # 10MB

    # Database Configuration
    database_url: str = "sqlite:///./content_gen.db"

    # News API Configuration
    newsapi_key: str = ""
    gnews_api_key: str = ""
    guardian_api_key: str = ""

    # Anthropic API (for creative ideation)
    anthropic_api_key: str = ""

    # Kie.ai API (for Veo 3.1 video generation)
    kie_api_key: str = ""

    # Social Media Publishing Configuration
    youtube_client_id: str = ""
    youtube_client_secret: str = ""
    youtube_credentials_file: str = "./credentials/youtube_credentials.json"
    tiktok_client_key: str = ""
    tiktok_client_secret: str = ""
    instagram_app_id: str = ""
    instagram_app_secret: str = ""

    # Redis Configuration (for job queue)
    redis_url: str = "redis://localhost:6379/0"
    enable_scheduled_publishing: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra environment variables
    )


# Global settings instance
settings = Settings()
