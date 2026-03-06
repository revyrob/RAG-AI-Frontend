
import './App.css';
import Header from './components/Header';
import ParcelAnalyzeSection from './components/ParcelAnalyzeSection';
import PropertyCard from "./components/PropertyCard";

function App() {
  // Tableau de propriétés
  const properties = [
    {
      address: "1100 W Jeff Davis Ave, Montgomery AL 36104",
      district: "Downtown",
      latitude: 32.3668,
      longitude: -86.2999,
    },
    {
      address: "123 Main St, Example City",
      district: "Central",
      latitude: 32.37,
      longitude: -86.30,
    },
    {
      address: "456 Oak Rd, Sample Town",
      district: "Suburban",
      latitude: 32.35,
      longitude: -86.25,
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
            property={prop}
          />
        ))}
      </div>
    </>
  );
}

export default App;
