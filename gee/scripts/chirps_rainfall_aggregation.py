"""
Google Earth Engine Script: CHIRPS Daily Rainfall Accumulation
Dataset: UCSB-CHG/CHIRPS/DAILY (0.05° spatial resolution)
Application: Multi-day rainfall accumulation calculation for cyclone antecedent conditioning
"""

import ee

def run_rainfall_accumulation(project_id: str = None, start_date: str = "2023-12-01", end_date: str = "2023-12-06"):
    if project_id:
        ee.Initialize(project=project_id)
    else:
        ee.Initialize()

    ap_roi = ee.Geometry.Rectangle([79.8, 13.5, 85.1, 19.3])

    chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY') \
        .filterDate(start_date, end_date) \
        .filterBounds(ap_roi) \
        .select('precipitation')

    total_accumulation = chirps.sum().clip(ap_roi)

    # Calculate max point precipitation in Coastal Andhra
    max_precip = total_accumulation.reduceRegion(
        reducer=ee.Reducer.max(),
        geometry=ap_roi,
        scale=5500,
        maxPixels=1e9
    )

    print("Total storm rainfall computed successfully.")
    print("Peak Accumulation (mm):", max_precip.getInfo())

    return total_accumulation

if __name__ == '__main__':
    run_rainfall_accumulation()
