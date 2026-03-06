# api_server.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
import math
from typing import Optional

# Création de l'app FastAPI
app = FastAPI(
    title="Montgomery 311 API",
    description="API pour récupérer les requêtes 311 avec filtre optionnel par proximité",
    version="1.0"
)

# Configuration CORS pour ton frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # changer si ton frontend est ailleurs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chemin vers le CSV
CSV_PATH = os.path.join(os.path.dirname(__file__), "montgomery_311_requests.csv")

# Fonction pour calculer la distance Euclidienne
def euclidean_distance(x1, y1, x2, y2):
    return math.sqrt((x1 - x2)**2 + (y1 - y2)**2)

@app.get("/requests311")
def get_311_requests(
    lat: Optional[float] = Query(None, description="Latitude du point"),
    lon: Optional[float] = Query(None, description="Longitude du point"),
    radius: float = Query(0.1, description="Rayon autour du point (en unités CSV)")
):
    """
    Retourne les requêtes 311.
    Si lat/lon sont fournis, filtre par distance.
    Nettoie les valeurs non JSON (NaN → None).
    Marque les lignes sans coordonnées comme 'coordinates_missing'.
    """
    try:
        df = pd.read_csv(CSV_PATH)
    except Exception as e:
        return {"error": f"Impossible de lire le fichier CSV: {str(e)}"}

    # Filtrage si lat/lon fournis (avant nettoyage pour éviter erreurs sur None)
    if lat is not None and lon is not None:
        def within_radius(row):
            lat_row, lon_row = row['Latitude'], row['Longitude']
            if pd.isna(lat_row) or pd.isna(lon_row):
                return False
            return euclidean_distance(lon_row, lat_row, lon, lat) <= radius

        df = df[df.apply(within_radius, axis=1)]

    # Nettoyage pour JSON
    df = df.replace([float('inf'), float('-inf')], None)
    df = df.replace({np.nan: None})

    # Crée un champ pour indiquer les coordonnées manquantes
    df['coordinates_missing'] = df.apply(lambda row: row['Latitude'] is None or row['Longitude'] is None, axis=1)

    return {"requests": df.to_dict(orient="records")}