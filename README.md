# FeedCheck AI

> Farmer-Oriented Feed & Silage Quality Screening System

FeedCheck AI enables dairy and livestock farmers to screen whole-crop corn silage, grass forage, and TMR quality in seconds using smartphone photos and on-farm sensor probe measurements (moisture %, pH, core temperature).

---

## 📁 Repository Structure

```
feedcheck-ai/
├── frontend/             # React 18 + Vite + Tailwind CSS mobile/web frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/       # Branding SVGs and icons
│   │   ├── components/   # Reusable UI components (Navbar, BottomNav, ResultCard, etc.)
│   │   ├── context/      # TestContext state provider
│   │   ├── hooks/        # Custom hooks (useTest, useFeedTest)
│   │   ├── pages/        # Home, NewTest, Result, History, Summary, HowItWorks
│   │   ├── services/     # api.js client service layer
│   │   ├── utils/        # Constants and formatters
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/              # FastAPI Python backend orchestration service
│   ├── app/
│   │   ├── main.py       # FastAPI application entry point
│   │   ├── routes/       # /api/analyze and /api/history routes
│   │   ├── services/     # Predictor, Risk Engine, Advisory Engine
│   │   ├── models/       # Model weights storage (.gitkeep)
│   │   └── utils/        # Image normalization & validation
│   ├── requirements.txt
│   └── README.md
│
├── ml/                   # PyTorch MobileNetV2 training & evaluation pipeline
│   ├── dataset/          # train/, validation/, test/ (good, moderate, poor)
│   ├── notebooks/        # feedcheck_training.ipynb
│   ├── src/              # config.py, train.py, evaluate.py, predict.py
│   ├── outputs/          # models/ (.pth) and graphs/
│   └── README.md
│
├── docs/
│   └── architecture.md   # Multi-tier system architecture documentation
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at **`http://localhost:8000/docs`**.

---

## 📖 Architecture & Design
Refer to [`docs/architecture.md`](docs/architecture.md) for full component responsibilities and data flow.
