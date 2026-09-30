# CycloneShield AI — Hackathon Judges Demonstration Script
**Google Code for Communities | Track 5**

Welcome to **CycloneShield AI** — an AI-powered cyclone impact and infrastructure vulnerability command platform built for disaster management authorities and coastal communities along the Bay of Bengal, initially configured for **Coastal Andhra Pradesh, India**.

---

### Demonstration Flow (3-5 Minutes)

#### 1. Overview Command Center (Dashboard & Situational Intelligence)
- **Action:** Open `http://localhost:5173/` in your browser.
- **What to show:**
  - Notice the **dark navy command center interface** with high contrast and zero visual clutter.
  - Check the mandatory top safety banner indicating **Operational Demo Mode** and requiring human review.
  - Review the active operational demonstration storm: **Severe Cyclonic Storm 'Varun'** approaching the Kakinada-Godavari corridor.
  - Inspect the four primary KPI cards:
    - **Max Sustained Wind:** 155 km/h (Very Severe Cyclonic Storm)
    - **24h Rainfall Forecast:** 285 mm (240% above normal)
    - **Critical Risk Facilities:** Filtered facilities needing immediate staging
    - **Verified Shelter Readiness:** 5,000+ evacuee capacity across APSDMA NCRMP shelters
  - Switch the scenario dropdown from *Varun 2026* to *Cyclone Michaung (Dec 2023 Historical Baseline)* to show that the system supports multiple historical and simulated events.

#### 2. Live Risk Map (Interactive Geospatial Intelligence)
- **Action:** Click **"Live Risk Map"** in the top navigation.
- **What to show:**
  - The responsive Leaflet map centered over Coastal Andhra Pradesh.
  - Toggle layers using the floating overlay panel on the left:
    - **Flood Ponding (DEM/SAR):** Low-lying riverine and delta convergence zones.
    - **Coastal Surge Strip:** High-susceptibility marine front (<4m elevation ASL).
    - **Gale Wind Swaths:** Core (>130 km/h) and peripheral wind swaths.
    - **Flagged Highways:** Dashed amber lines marking potentially disrupted segments on NH-16.
    - **Cyclone Forecast Track & Cone:** Projected track with uncertainty cone.
  - **Asset Inspector:** Click any facility marker (e.g. *Government General Hospital, Kakinada* or *APSDMA Multipurpose Cyclone Shelter*).
  - Show the right-hand **Asset Inspector Panel** displaying:
    - Elevation ASL and distance to shoreline
    - Component scores (Flood: 35%, Surge: 35%, Wind: 30%)
    - Transparent heuristic rationale explaining why that facility received its score.

#### 3. Critical Infrastructure & Facility Exposure
- **Action:** Click **"Infrastructure"** in the top navigation.
- **What to show:**
  - Filterable inventory of hospitals, shelters, power sub-stations, and bridges.
  - Filter by category (e.g. *Hospitals*) or risk level (e.g. *Critical*).
  - Click any row to expand the verified spatial node details and OSM attribution.

#### 4. Impact Simulator ("What-If" Planning)
- **Action:** Click **"Impact Simulator"** in the top navigation.
- **What to show:**
  - Drag the sliders:
    - Increase **Wind Speed** to 190 km/h
    - Increase **Rainfall** to 400 mm
    - Increase **Peak Surge** to 4.2 meters
  - Click **"Recalculate Impact Scenario"**.
  - Notice the instantaneous recalculation using the exact same deterministic `RiskEngine` formulas.
  - Point out the updated estimated exposed population and newly flagged road segments.

#### 5. Gemini AI Geospatial Copilot
- **Action:** Click **"Gemini Copilot"** in the top navigation.
- **What to show:**
  - The AI Copilot is grounded strictly on verified backend data to eliminate hallucinations.
  - Click the prompt chip: *"Which healthcare facilities have the highest modeled surge exposure?"*
  - Review the response:
    - Executive summary citing the 155 km/h winds and 285 mm rainfall
    - Structured findings with severity badges and supporting facts
    - Explicit model uncertainties and data gaps
    - Suggested operational actions
    - Cited internal data sources (NASA SRTM, ESA WorldCover, APSDMA)
    - Visible badge showing whether Google Gen AI or deterministic fallback was active.

#### 6. Community Advisories & Human-in-the-Loop Review
- **Action:** Click **"Advisories & Review"** in the top navigation.
- **What to show:**
  - Select audience: **"Marine Fishermen & Boats"** and Language: **"తెలుగు (Telugu)"**.
  - Click **"Generate New Grounded Draft"**.
  - Point out that the advisory renders in authentic, grammatically correct Telugu (మత్స్యకారులకు అత్యవసర సముద్ర హెచ్చరిక).
  - Edit the bulletin text or review notes.
  - Click **"Review & Authorize"**.
  - Fill in the reviewing officer details, check the certification box, and click **"Authorize & Sign Bulletin"**.
  - Notice the official status updates to **APPROVED** with an auditable officer timestamp.
  - Click **"Print Bulletin"** to show official printer-ready output.

#### 7. Data Sources & Calibration
- **Action:** Click **"Data Sources & Settings"**.
- **What to show:**
  - Complete catalog of Earth Engine datasets (SRTM DEM 30m, WorldCover 10m, Sentinel-1/2, CHIRPS) with documented spatial resolutions and limitations.
  - Multi-region architecture showing extensibility to Odisha and Tamil Nadu.
