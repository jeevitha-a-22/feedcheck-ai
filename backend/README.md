# FeedCheck AI - Backend Service

FastAPI-powered backend service for feed and silage quality screening.

## Structure
- `app/main.py`: FastAPI entry point and CORS configuration
- `app/routes/analyze.py`: `POST /analyze` endpoint receiving image and field measurements
- `app/routes/history.py`: History and summary management endpoints
- `app/services/predictor.py`: MobileNetV2 inference engine for visual quality screening
- `app/services/risk_engine.py`: Agronomic multi-parameter risk evaluation
- `app/services/advisory.py`: Practical feeding and silo management guidelines
- `app/utils/preprocessing.py`: Image normalization and sensor validation utilities

## Getting Started
```bash
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
