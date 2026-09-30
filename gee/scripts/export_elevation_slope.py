"""
Google Earth Engine Script: Coastal Andhra Pradesh SRTM Elevation & Slope Extraction
Dataset: USGS/SRTMGL1_003 (NASA SRTM DEM 30m Global)
Region: Coastal Andhra Pradesh (Bounding Box: 13.5°N - 19.3°N, 79.8°E - 85.1°E)
"""

import ee

def run_elevation_pipeline(project_id: str = None):
    # Initialize Earth Engine
    if project_id:
        ee.Initialize(project=project_id)
    else:
        ee.Initialize()

    # Region of Interest: Coastal AP bounding box
    ap_coastal_roi = ee.Geometry.Rectangle([79.8, 13.5, 85.1, 19.3])

    # Load NASA SRTM 30m DEM
    dem = ee.Image('USGS/SRTMGL1_003').clip(ap_coastal_roi)
    elevation = dem.select('elevation')

    # Calculate terrain slope in degrees
    slope = ee.Terrain.slope(elevation)

    # Low-elevation coastal depression screening mask (< 5 meters ASL)
    coastal_lowland_mask = elevation.lt(5.0)

    # Compute spatial statistics over Godavari Delta
    delta_area = ee.Geometry.Polygon([[81.5, 16.2], [82.5, 16.2], [82.5, 17.2], [81.5, 17.2]])
    mean_delta_elevation = elevation.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=delta_area,
        scale=30,
        maxPixels=1e9
    )

    print("Pipeline executed successfully.")
    print("Mean Delta Elevation (m):", mean_delta_elevation.getInfo())

    return {
        "dem": elevation,
        "slope": slope,
        "coastal_lowland_mask": coastal_lowland_mask
    }

if __name__ == '__main__':
    run_elevation_pipeline()
