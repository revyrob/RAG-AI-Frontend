import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import BreakDown from './sections/BreakDown'
import ParcelAnalyzeSection from './sections/ParcelAnalyzeSection'
import ChatArea from './sections/ChatArea'

interface Coords {
  lat: number
  lon: number
}

export interface Parcel {
  id: string
  label: string
  story: string
  address: string
  parcel_id: string
  acres: number
  zone_context: string
  nearest_anchor: string
  min_dist_miles: number
  open_grants: number
  coords: Coords
}

function App() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    fetch(`${serverUrl}parcels`)
      .then(res => res.json())
      .then(data => {
        setParcels(data.parcels)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to connect to API')
        setLoading(false)
        
      })
  }, [])

  if (loading) return <div className='text-black text-3xl '>Loading parcels...</div>
  if (error) return <div className='text-black text-3xl '>{error}</div>

  return (
    <>
      <Header />
      <ParcelAnalyzeSection
        parcels={parcels}
        selectedParcel={selectedParcel}
        onSelectParcel={setSelectedParcel}
      />
      <BreakDown
        parcels={parcels}
        selectedParcel={selectedParcel}
      />
      <ChatArea
        parcels={parcels}
        selectedParcel={selectedParcel}
        onSelectParcel={setSelectedParcel}
      />
    </>
  )
}

export default App
