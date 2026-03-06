import { useEffect, useState } from "react";
import { fetch311Requests } from "../utils/api_311";

interface Property {
  address: string;
  district: string;
  latitude: number;
  longitude: number;
}

interface Request311 {
  Request_ID: number;
  Request_Type: string;
  Status: string;
  coordinates_missing: boolean;
}

interface Props {
  property: Property;
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  const [requests, setRequests] = useState<Request311[]>([]);
  const { latitude, longitude } = property;

  useEffect(() => {
    if (latitude && longitude) {
      fetch311Requests(latitude, longitude, 0.1).then(setRequests);
    }
  }, [latitude, longitude]);

  return (
    <div className="property-card">
      <h2>{property.address}</h2>
      <p>{property.district}</p>
      <h3>Nearby 311 Requests ({requests.length})</h3>
      <ul>
        {requests.map((req) => (
          <li key={req.Request_ID}>
            {req.Request_Type} — {req.Status}
            {req.coordinates_missing && " (coordinates missing)"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyCard;
