import React from "react";
import "./PropertyCard.css";

interface Props {
  address: string;
  details: string;
}

const PropertyCard: React.FC<Props> = ({ address, details }) => {
  return (
    <div className="property-card">
      <div className="address">{address}</div>
      <div className="details">{details}</div>
      <div className="flags">
        <div className="flag"></div>
        <div className="flag"></div>
        <div className="flag"></div>
      </div>
    </div>
  );
};

export default PropertyCard;
