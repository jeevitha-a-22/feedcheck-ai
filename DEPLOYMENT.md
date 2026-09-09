# FeedCheck AI - Production Cloud Deployment Guide

This guide details how to deploy the **FeedCheck AI** full-stack application (React/Vite Frontend + FastAPI/Uvicorn Backend + MobileNetV2 FBSI Machine Learning Model) so that anyone (judges, farmers, team members) can access it publicly from any mobile phone, tablet, or laptop on any network without needing local Wi-Fi or local setup.

---

## 1. System Architecture

```
[ Judge / Farmer Smartphone / Laptop ]
                 │
                 ▼ HTTPS
   ┌───────────────────────────────┐
   │    Vercel Public Frontend     │
   │  https://<frontend-app>.vercel.app
   └──────────────┬────────────────┘
                  │
                  ▼ HTTPS API (VITE_API_URL)
   ┌───────────────────────────────┐
   │    Render FastAPI Backend     │
   │  https://<backend-app>.onrender.com
   │    - POST /analyze            │
   │    - GET  /health             │
   │    - GET  /test/{id}          │
   │    - GET  /docs               │
   └──────────────┬────────────────┘
                  │
                  ▼
   ┌───────────────────────────────┐
   │  MobileNetV2 FBSI ML Model    │
   │   (fbsi_mobilenetv2.keras)    │
   │   + Rule-Based Risk Engine    │
   └───────────────────────────────┘
```

---

## 2. Pre-Deployment Configuration Files Included

The repository has been pre-configured with all necessary cloud deployment descriptors:

- **`render.yaml`**: Render Blueprint specification for the FastAPI backend (Python 3.11, automatic requirements installation, 0.0.0.0 binding on `$PORT`).
- **`Dockerfile` & `backend/Dockerfile`**: Production container builds packaging Python, TensorFlow, Pillow, FastAPI, and model weights.
- **`backend/Procfile` & `backend/runtime.txt`**: Cloud platform process and runtime definitions.
- **`vercel.json` & `frontend/vercel.json`**: SPA routing rewrites ensuring deep links (`/verify/:id`, `/result/:id`, `/new-test`) resolve cleanly on Vercel without 404s.
- **`backend/app/models/`**: Packaged `fbsi_mobilenetv2.keras` (25.8MB) and `class_indices.json`.

---

## 3. Step-by-Step Deployment Instructions

### Step 3.1: Push Project to GitHub

1. Create a repository on GitHub (e.g. `feedcheck-ai`).
2. Add files and push:
   ```bash
   git add .
   git commit -m "Configure production cloud deployment for FeedCheck AI"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/feedcheck-ai.git
   git push -u origin main
   ```

---

### Step 3.2: Deploy FastAPI Backend on Render (Free Tier)

1. Go to [Render Dashboard](https://dashboard.render.com/) and log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`feedcheck-ai`).
4. Configure the Web Service settings:
   - **Name**: `feedcheck-ai-backend` (or your preferred name)
   - **Language / Runtime**: `Python 3`
   - **Root Directory**: `.` (or leave blank)
   - **Region**: Oregon (US West) or closest region
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: Free

5. **Environment Variables** (Under *Environment* tab):
   - `PYTHON_VERSION` = `3.11.9`
   - `HOST` = `0.0.0.0`
   - `MODEL_PATH` = `backend/app/models/fbsi_mobilenetv2.keras`
   - `CLASS_INDICES_PATH` = `backend/app/models/class_indices.json`

6. Click **Create Web Service**.
7. Once deployed, copy your public backend URL:
   - Example: `https://feedcheck-ai-backend.onrender.com`

---

### Step 3.3: Deploy React Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and log in.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`feedcheck-ai`).
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click *Edit* next to Root Directory and select `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: `https://<YOUR-RENDER-BACKEND-URL>` (e.g. `https://feedcheck-ai-backend.onrender.com`)
6. Click **Deploy**.
7. Once deployed, copy your public frontend URL:
   - Example: `https://feedcheck-ai.vercel.app`

---

## 4. Immediate Live Testing via Public Tunnels (Hackathon Instant Demo)

If you need an immediate live public HTTPS URL on cellular data without waiting for cloud builds:

### Option A: Cloudflare Tunnel (Recommended - Zero Auth, Ultra Fast)
```bash
# In terminal 1 (start FastAPI):
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000

# In terminal 2 (start Cloudflare tunnel for backend):
npx -y cloudflared tunnel --url http://localhost:8000
# Output gives: https://<random-subdomain>.trycloudflare.com

# In frontend/.env:
VITE_API_URL=https://<random-subdomain>.trycloudflare.com

# In terminal 3 (build & serve frontend):
cd frontend && npm run build && npx -y vite preview --port 3000 --host 0.0.0.0

# In terminal 4 (tunnel frontend):
npx -y cloudflared tunnel --url http://localhost:3000
# Gives public frontend URL: https://<frontend-subdomain>.trycloudflare.com
```

### Option B: Localtunnel
```bash
# Backend tunnel:
npx localtunnel --port 8000

# Frontend tunnel:
npx localtunnel --port 3000
```

---

## 5. End-to-End Production Smoke Test Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Health Check** | `GET https://<backend-domain>/health` | Returns `{"status":"healthy","services":{"api":"online","model":"fbsi_mobilenetv2_ready","risk_engine":"operational"}}` |
| **2. API Docs** | Open `https://<backend-domain>/docs` | Interactive Swagger UI displays `/analyze`, `/health`, `/history`, `/test/{id}` |
| **3. Mobile Access** | Open `https://<frontend-domain>` on smartphone using cellular data | Home page renders immediately without CORS or connection errors |
| **4. AI Screening** | Go to New Test → Select Whole-Crop Corn Silage → Click Analyze | Live MobileNetV2 model inference executes and returns FBSI classification |
| **5. Result Display** | Review Result page | FBSI score, model confidence, metrics, and advisory appear with verified visual sample |
| **6. QR Verification** | Scan the generated QR code with another mobile phone | Opens `https://<frontend-domain>/verify/<testId>` and displays batch traceability record |
| **7. Multilingual** | Switch language to Kannada (ಕನ್ನಡ) or Hindi (हिंदी) | Farmer-facing UI seamlessly translates |

---

## 6. Security and Operational Notes

1. **No Secrets Exposed**: Frontend code does not embed credentials or sensitive keys.
2. **CORS Policy**: Configured to accept requests from deployed frontend origins.
3. **Cross-Device QR Traceability**: The backend stores completed test records in-memory so any external device scanning the QR code retrieves the exact screening record via `GET /test/{test_id}`.
4. **Offline Fallback**: In the event of temporary network blips, the frontend gracefully falls back to local cached storage without crashing.
