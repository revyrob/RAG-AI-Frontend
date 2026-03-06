import requests
import pandas as pd

url = "https://gis.montgomeryal.gov/server/rest/services/HostedDatasets/Received_311_Service_Request/MapServer/0/query"

params = {
    "where": "1=1",
    "outFields": "*",
    "returnGeometry": "true",
    "f": "json"
}

response = requests.get(url, params=params)
data = response.json()

features = data["features"]

rows = []
for f in features:
    attr = f["attributes"]
    geom = f.get("geometry", {})
    
    attr["x"] = geom.get("x")
    attr["y"] = geom.get("y")
    
    rows.append(attr)

df = pd.DataFrame(rows)

print(df.head())

df.to_csv("montgomery_311_requests.csv", index=False)
