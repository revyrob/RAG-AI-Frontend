import requests
import json

# URL de ton endpoint
BASE_URL = "http://127.0.0.1:8000/requests311"

# Exemple de paramètres lat/lon/radius
params = {
    "lat": 32.3668,
    "lon": -86.2999,
    "radius": 1.0
}

try:
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()  # vérifie que le serveur a répondu 200 OK
    data = response.json()       # convertit la réponse en JSON

    # Test basique de validité
    if "requests" in data:
        print(f"✅ JSON valide, {len(data['requests'])} requêtes récupérées")
        for r in data['requests'][:5]:  # affiche juste les 5 premières
            print(r)
    else:
        print("⚠️ JSON reçu mais ne contient pas la clé 'requests'")

except requests.exceptions.RequestException as e:
    print(f"❌ Erreur HTTP : {e}")

except json.JSONDecodeError as e:
    print(f"❌ JSON invalide : {e}")