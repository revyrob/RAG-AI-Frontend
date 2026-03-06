import requests

# Coordonnées de la parcelle
lat_parcel = 32.4
lon_parcel = -86.3
radius = 0.2

url = f"http://127.0.0.1:8000/requests311?lat={lat_parcel}&lon={lon_parcel}&radius={radius}"
response = requests.get(url)
data = response.json()

print(f"{len(data['requests'])} requêtes 311 proches de la parcelle")
for req in data['requests'][:5]:
    print(req)
