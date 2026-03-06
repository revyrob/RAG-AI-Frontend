"""Simple Python client for the FastAPI 311 endpoint."""
import requests

BASE_URL = "http://localhost:8001"  # adjust port if needed


def fetch_311_requests(lat=None, lon=None, radius=0.01):
    params = {}
    if lat is not None:
        params['lat'] = lat
    if lon is not None:
        params['lon'] = lon
    params['radius'] = radius
    resp = requests.get(f"{BASE_URL}/requests311", params=params)
    resp.raise_for_status()
    data = resp.json()
    return data.get("requests", [])


if __name__ == "__main__":
    # Example: fetch requests near a parcel at lat=32.3668, lon=-86.2999 (Montgomery, AL approx)
    lat = 32.3668
    lon = -86.2999
    requests_list = fetch_311_requests(lat=lat, lon=lon)
    print(f"retrieved {len(requests_list)} requests near ({lat}, {lon})")
    for r in requests_list[:5]:
        print(r)
