import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.analyze import router as analyze_router
from .routes.history import router as history_router

app = FastAPI(
    title="FeedCheck AI Backend",
    description="Silage Quality Screening & FBSI Computer Vision Inference API",
    version="1.0.0"
)

# Enable CORS for React frontend (supports local dev and cloud production domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analyze_router)
app.include_router(history_router)

@app.get("/")
def root():
    return {
        "app": "FeedCheck AI Backend",
        "status": "online",
        "version": "1.0.0",
        "endpoints": ["/analyze", "/health", "/history", "/test/{id}", "/docs"]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "online",
            "model": "fbsi_mobilenetv2_ready",
            "risk_engine": "operational"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)

