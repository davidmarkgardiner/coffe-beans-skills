from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import videos, news, ideas, publishing
from .utils.logging_setup import logger
from .database import init_db

app = FastAPI(
    title="Content Gen Backend",
    description="AI-powered content generation with Sora video API, news aggregation, and creative ideation",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3333", "http://localhost:3334", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(videos.router)
app.include_router(news.router)
app.include_router(ideas.router)
app.include_router(publishing.router)

logger.info("FastAPI application initialized")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.debug("Health check requested")
    return {"status": "healthy", "service": "content-gen-backend", "version": "1.0.0"}


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info("Application starting up...")

    # Initialize database (create tables if they don't exist)
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")

    logger.info("Video API endpoints available at /api/v1/videos")
    logger.info("News API endpoints available at /api/v1/news")
    logger.info("Ideas API endpoints available at /api/v1/ideas")
    logger.info("Publishing API endpoints available at /api/v1/publish")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Application shutting down...")
