import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'
import BreakDown from './sections/BreakDown'
import ParcelAnalyzeSection from './sections/ParcelAnalyzeSection'

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

  useEffect(() => {
    fetch('http://127.0.0.1:8000/parcels')
      .then(res => res.json())
      .then(data => {
        setParcels(data.parcels)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to connect to API')
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading parcels...</div>
  if (error) return <div>{error}</div>

  return (
    <>
      <Header />
      <ParcelAnalyzeSection parcels={parcels} />
      <BreakDown parcels={parcels} />
    </>
  )
}

export default App

