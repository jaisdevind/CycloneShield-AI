"""
Google Earth Engine Script: Sentinel-1 SAR Dual-Polarization Surface Water Detection
Dataset: COPERNICUS/S1_GRD (C-band Synthetic Aperture Radar)
Application: Cloud-penetrating post-cyclone inundation mapping across Coastal Andhra Pradesh
"""

import ee

def run_sar_flood_mapping(project_id: str = None, before_start: str = "2023-11-01", before_end: str = "2023-11-20", after_start: str = "2023-12-05", after_end: str = "2023-12-15"):
    if project_id:
        ee.Initialize(project=project_id)
    else:
        ee.Initialize()

    ap_roi = ee.Geometry.Rectangle([79.8, 13.5, 85.1, 19.3])

    # Sentinel-1 GRD Collection filter
    s1 = ee.ImageCollection('COPERNICUS/S1_GRD') \
        .filter(ee.Filter.eq('instrumentMode', 'IW')) \
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH')) \
        .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING')) \
        .filterBounds(ap_roi)

    # Baseline dry/pre-storm reference composite
    before = s1.filterDate(before_start, before_end).select('VH').mosaic().clip(ap_roi)

    # Active / post-storm SAR composite
    after = s1.filterDate(after_start, after_end).select('VH').mosaic().clip(ap_roi)

    # Apply 50m focal median smoothing to reduce SAR speckle noise
    before_smooth = before.focal_median(50, 'circle', 'meters')
    after_smooth = after.focal_median(50, 'circle', 'meters')

    # Compute difference (Water surfaces reflect radar away, dropping VH backscatter by > 3 dB)
    difference = after_smooth.subtract(before_smooth)
    flood_threshold = -3.0
    inundation = difference.lt(flood_threshold)

    # Mask out permanent water bodies using JRC Global Surface Water
    permanent_water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').gt(80)
    potential_flooding = inundation.updateMask(permanent_water.Not())

    print("SAR Water detection processing graph constructed.")
    return potential_flooding

if __name__ == '__main__':
    run_sar_flood_mapping()
