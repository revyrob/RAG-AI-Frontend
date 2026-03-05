
import './App.css'
import Header from './components/Header'
import ParcelCard from './components/ParcelCard'

function App() {

  return (
    <>
      <Header/>
      <ParcelCard
  address="1100 W Jeff Davis Ave"
  city="Montgomery AL, 36104"
  facts="2.6 acres · Vacant 12 yrs · Zoned C-1"
  badges={[
    { label: "Symbolic", variant: "heritage" },
    
  ]}
  signals={[
    { label: "Food desert — nearest grocery", value: "2.8 mi" },
    { label: "Median income", value: "$22,400" },
    { label: "HUD CDBG OPEN —", value: "47 days left", urgent: true },
  ]}
  onClick={() => console.log("parcel selected")}
  active={false}
/>
</>
  )
}

export default App
