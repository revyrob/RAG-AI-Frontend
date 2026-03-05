
import React from "react";
import './App.css';
import Header from './components/Header';
import ParcelAnalyzeSection from './components/ParcelAnalyzeSection';
import PropertyCard from "./components/PropertyCard";

function App() {
  // Tableau de propriétés
  const properties = [
    {
      address: "1100 W Jeff Davis Ave, Montgomery AL 36104",
      details: "2.6 acres | Vacant 12 yrs | Zoned C",
    },
    {
      address: "123 Main St, Example City",
      details: "1.2 acres | Occupied | Zoned R",
    },
    {
      address: "456 Oak Rd, Sample Town",
      details: "3.5 acres | Vacant 5 yrs | Zoned I",
    },
  ];

  return (
    <>
      <Header />
      <ParcelAnalyzeSection />
      <div className="App">
        <h1>Liste des propriétés</h1>
        {properties.map((prop, index) => (
          <PropertyCard
            key={index}
            address={prop.address}
            details={prop.details}
          />
        ))}
      </div>
    </>
  );
}

export default App;
