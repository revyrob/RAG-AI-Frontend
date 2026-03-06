
import './App.css'
import Header from './components/Header'
import PropertyCard from './components/PropertyCard';
import BreakDown from './sections/BreakDown'
import ParcelAnalyzeSection from './sections/ParcelAnalyzeSection'

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
      <Header/>
     <ParcelAnalyzeSection/>
     <PropertyCard address={properties[1].address} details={properties[1].details}/>
     <BreakDown/>
</>
  )
}

export default App;
