# Google Earth Engine (GEE) Integration Module

This directory contains standalone and server-side Google Earth Engine (GEE) Python processing scripts for **CycloneShield AI**.

## Documented Datasets & Identifiers

| Dataset Name | GEE Catalog ID | Resolution | Temporal Frequency | Primary Operational Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **NASA SRTM DEM v3** | `USGS/SRTMGL1_003` | 30 meters | Static Baseline | Screening elevation ASL, slope, coastal depression ponding |
| **ESA WorldCover v200** | `ESA/WorldCover/v200` | 10 meters | Annual | Impervious surface mapping & coastal mangrove buffer delineation |
| **Sentinel-1 SAR C-Band** | `COPERNICUS/S1_GRD` | 10 meters | 6-12 days | Cloud-penetrating radar for retrospective water/flood masking |
| **Sentinel-2 MSI Level-2A** | `COPERNICUS/S2_SR_HARMONIZED` | 10-20 meters | 5 days | Optical multispectral baseline & pre-cyclone vegetation index (NDVI) |
| **CHIRPS Daily Rainfall** | `UCSB-CHG/CHIRPS/DAILY` | 0.05° (~5.5 km) | Daily | Antecedent soil moisture & multi-day precipitation accumulation |

## Authentication Setup

1. Enable Google Earth Engine API in your Google Cloud Project.
2. In `.env`, configure:
   ```env
   EE_PROJECT_ID=your-google-cloud-project-id
   ```
3. Alternatively, initialize credentials using the Earth Engine CLI:
   ```bash
   earthengine authenticate
   ```

## Offline & Screening Fallback

If no GEE credentials or active network connections are present, **CycloneShield AI automatically activates its deterministic screening mode**. Pre-computed geometric zones with documented metadata ensure the dashboard remains 100% functional, responsive, and testable without external API barriers.
