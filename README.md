# CycloneShield AI
### AI-Powered Cyclone Impact & Infrastructure Vulnerability Command Platform
**Google Code for Communities | Track 5**

[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.2+-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg)](https://www.typescriptlang.org)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9+-199900.svg)](https://leafletjs.com)
[![Google Gen AI](https://img.shields.io/badge/Google%20Gen%20AI-Gemini%202.5-4285f4.svg)](https://ai.google.dev)
[![Google Earth Engine](https://img.shields.io/badge/Google%20Earth%20Engine-API-34a853.svg)](https://earthengine.google.com)

---

## 1. Project Overview & Problem Statement

### Problem Statement
Coastal communities along the Bay of Bengal—such as Coastal Andhra Pradesh, India—face severe, recurring tropical cyclones accompanied by destructive winds, heavy precipitation, and storm surges. Disaster authorities often struggle to rapidly synthesize satellite observations, terrain elevation data, land cover, weather forecasts, and critical infrastructure networks into pre-landfall operational risk screening.

### Solution: CycloneShield AI
**CycloneShield AI** is an operational disaster-preparedness and emergency-management decision support platform. It integrates Earth Engine satellite observation layers, meteorological data, terrain DEM, land-cover classifications, and OpenStreetMap infrastructure networks to compute transparent, auditable vulnerability screening scores before cyclone landfall occurs. It helps estimate potential local hazard exposure and infrastructure vulnerability before landfall.

---

## 2. Core Modules & Features Implemented

1. **Overview Command Dashboard:** Real-time situational awareness, active storm metrics (sustained winds, 24h rainfall volume), dominant threat indicator, designated shelter capacity, and pipeline health.
2. **Interactive Geospatial Risk Map:** High-performance Leaflet workspace rendering NASA SRTM 30m DEM flood zones, coastal surge susceptibility strips, gale wind swaths, flagged highway corridors (NH-16), cyclone forecast track cones, and interactive facility markers with granular formula breakdowns.
3. **Critical Infrastructure Explorer:** Filterable registry of apex trauma centers, APSDMA multipurpose cyclone shelters, power substations, ports, and bridges with calculated risk scores and OSM provenance.
4. **Impact Simulator:** Interactive "what-if" testing suite allowing emergency managers to adjust wind speed, 24h rainfall, peak surge height, and duration to recalculate exposed populations and blocked routes using unified deterministic equations.
5. **Gemini AI Geospatial Copilot:** Evidence-grounded AI decision support powered by the official Google Gen AI SDK (`google-genai`), providing structured findings, supporting evidence citations, explicit uncertainty disclosures, and deterministic fallback support.
6. **Community Advisories & Human-in-the-Loop Review:** Bilingual advisory generator (English & Telugu) tailored for the general public, marine fishermen, and district collectors, featuring strict safety checks and requiring official human authorization prior to publication.
7. **Data Sources & Regional Settings:** Auditable metadata catalog for Earth Engine layers, sensor frequencies, operational limitations, and regional multi-state extensibility (Andhra Pradesh, Odisha, Tamil Nadu).

---

## 3. Technology Stack & Architecture

### Google Technologies Integrated
- **Google Gen AI SDK (`google-genai`):** Model configuration using `gemini-2.5-flash` for structured evidence-grounded operational assessments.
- **Google Earth Engine API (`earthengine-api`):** Accessing NASA SRTM 30m DEM, ESA WorldCover 10m, and Sentinel-1/2 satellite layers.

### Backend Architecture
- **Framework:** FastAPI 0.115+, Uvicorn, Pydantic v2
- **Database:** SQLAlchemy 2.0 with SQLite (`cycloneshield.db`)
- **Geospatial Processing:** Earth Engine Python API & Shapely 2.0
- **Testing:** Pytest & HTTPX TestClient

### Frontend Architecture
- **Framework:** React 19, TypeScript 5.0+, Vite 8
- **Styling:** Tailwind CSS v4 (Dark command-center theme with high contrast)
- **Mapping:** Leaflet 1.9 & React Leaflet 5.0
- **Icons:** Lucide React & Recharts 3.0

---

## 4. Earth Engine Datasets & Provenance

| Dataset | Identifier | Resolution | Intended Use | Limitations |
|---|---|---|---|---|
| **NASA SRTM DEM v3** | `USGS/SRTMGL1_003` | 30 meters | Topographic elevation screening & slope calculation | Static baseline (2000); does not capture post-2000 coastal dykes |
| **ESA WorldCover v200** | `ESA/WorldCover/v200` | 10 meters | Land-cover classification & mangrove buffer screening | Annual static composite |
| **Sentinel-1 SAR C-Band** | `COPERNICUS/S1_GRD` | 10 meters | All-weather SAR flood footprint observation | Retrospective radar overpass; cannot forecast future flooding |
| **CHIRPS Daily Rainfall** | `UCSB-CHG/CHIRPS/DAILY` | 0.05° (~5km) | Precipitation accumulation screening | Gridded satellite estimate |

---

## 5. Gemini AI Integration & Grounding Safety

The Gemini Copilot service uses `google-genai` with `GEMINI_MODEL=gemini-2.5-flash`.
- **Evidence-Grounded Context:** Injects structured backend evidence (scenario metrics, exposed assets, flagged road segments, limitations).
- **Uncertainty & Data Gap Disclosures:** Explicitly identifies model limitations and missing data.
- **Human Review Safeguard:** All advisories generated are marked as `"AI-generated draft — requires validation and authorization by the appropriate disaster-management authority."` Public dispatch requires explicit human digital sign-off.

---

## 6. Risk Engine & Infrastructure Methodology

### Component Formulas
- **Flood Susceptibility Score:** \(S_{\text{flood}} = \min(100, (R_{24h} / 300 \times 60) + (E_{\text{inv}} \times 40))\)
- **Surge Exposure Score:** \(S_{\text{surge}} = \min(100, (\max(0, 5 - E) / 5 \times 60) + (\max(0, 10 - D) / 10 \times 40))\)
- **Wind Exposure Score:** \(S_{\text{wind}} = \min(100, (V_{\text{wind}} / 180 \times 100))\)
- **Composite Risk Index:** \(R_{\text{composite}} = (0.35 \times S_{\text{flood}}) + (0.35 \times S_{\text{surge}}) + (0.30 \times S_{\text{wind}})\)

---

## 7. Operational Modes: Demo vs Live

- **Demo Mode (Default):** Runs completely out-of-the-box with zero external API keys required. When credentials are missing, backend uses verified deterministic screening fallbacks.
- **Live Mode:** Connects live Google Earth Engine (`EE_PROJECT_ID`), Gemini API (`GEMINI_API_KEY`), and Open-Meteo feeds (`WEATHER_PROVIDER_MODE=open_meteo`).

---

## 8. Scientific and Operational Limitations

- **Screening Heuristics:** Inundation and surge susceptibility values are operational screening estimates based on topographic DEM and empirical vortex decay models, not full 3D hydrodynamic numerical models (such as SLOSH or ADCIRC).
- **Data Completeness:** Infrastructure data incorporates APSDMA NCRMP registries and OpenStreetMap; rural areas exhibit variable completeness flagged by built-in data quality indicators ("Data completeness varies by location").
- **No Automated Emergency Dispatch:** CycloneShield AI will never dispatch automated public alerts. All bulletins require explicit review, verification, and digital authorization by a human official.

---

## 9. Environment Variables & Setup Instructions

### Environment Variables (`.env`)
```env
PROJECT_NAME="CycloneShield AI"
VERSION="1.0.0"
ENVIRONMENT="development"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
DATABASE_URL="sqlite:///./cycloneshield.db"

# Optional External API Credentials
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
EE_PROJECT_ID=""
WEATHER_PROVIDER_MODE="synthetic_fallback"
```

### Installation Commands

#### Backend
```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 10. Automated Testing & Verification

- **Backend Pytest:** `py -m pytest -v` inside `backend/` -> **41 Passed, 0 Failed**.
- **Frontend Oxlint:** `npm run lint` inside `frontend/` -> **0 Errors**.
- **Frontend Production Build:** `npm run build` inside `frontend/` -> **0 Errors** (`tsc -b && vite build`).

---

## 11. Cloud Run & Production Deployment

### Backend Deployment (Google Cloud Run)
```bash
PROJECT_ID="your-gcp-project-id"
REGION="asia-south1"

gcloud config set project $PROJECT_ID
gcloud builds submit --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/cycloneshield/backend:latest ./backend
gcloud run deploy cycloneshield-backend \
  --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/cycloneshield/backend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars ENVIRONMENT=production,CORS_ORIGINS="https://your-frontend-domain.app"
```

---

## 12. Five-Minute Hackathon Judges Demonstration Sequence

1. **Overview Command Center (`/`):**
   - Show command UI, top safety banner, storm metrics (155 km/h winds, 285 mm rainfall for *Severe Cyclonic Storm Varun (SYNTHETIC DEMONSTRATION SCENARIO)*), shelter capacity (5,000+), and health status.
   - Switch scenario to *Cyclone Michaung (HISTORICAL BASELINE)*.

2. **Interactive Risk Map (`/risk-map`):**
   - Toggle geospatial layers: Flood Ponding (NASA SRTM DEM), Coastal Surge Susceptibility (<4m ASL), Gale Wind Swaths (>130 km/h), and NH-16 highway exposure.
   - Click facility marker (*Government General Hospital, Kakinada*) to inspect component scores and mathematical rationale in the **Asset Inspector**.

3. **Critical Infrastructure Explorer (`/infrastructure`):**
   - Filter by category (*Hospitals*, *Cyclone Shelters*) and risk level (*Critical*). Show data completeness notice and OSM/APSDMA attribution.

4. **Impact Simulator (`/simulator`):**
   - Adjust sliders (Wind: 190 km/h, Rainfall: 400 mm, Surge: 4.2m). Click **"Recalculate Impact Scenario"**. Demonstrate instantaneous backend recalculation, updated exposed population, and newly blocked road segments.

5. **Gemini AI Geospatial Copilot (`/copilot`):**
   - Prompt: *"Which healthcare facilities have the highest modeled surge exposure?"* Show evidence-grounded response with summary, findings, uncertainties, suggested actions, and source citations.

6. **Community Advisories & Official Review (`/advisories`):**
   - Select audience (*Marine Fishermen*) and language (*Telugu*). Click **"Generate New Draft"**. Show authentic Telugu bulletin content. Edit, click **"Review & Authorize"**, complete human digital sign-off, and show approval timestamping.

7. **Data Sources & Settings (`/data-sources`):**
   - Inspect Earth Engine dataset catalog (SRTM 30m, WorldCover 10m) and multi-region architecture (Andhra Pradesh, Odisha, Tamil Nadu).
