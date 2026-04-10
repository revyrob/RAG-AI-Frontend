import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import CityMap from './pages/CityMap/CityMap'
import ParcelScore from './pages/ParcelScore/ParcelScore'
import Signals311 from './pages/311Signals/311Signals'
import ConfigPage from './pages/ConfigPage/ConfigPage'
import LoginPage from './pages/Login/LoginPage'

function App() {
  // TODO: replace with Supabase session check
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to="/city-map" replace />
            : <LoginPage onLogin={() => setIsLoggedIn(true)} />
        }
      />

      {/* Protected — redirect to /login if not authenticated */}
      <Route
        path="/*"
        element={
          isLoggedIn ? (
            <>
              <Header onLogout={() => setIsLoggedIn(false)} />
              <Routes>
                <Route path="/" element={<Navigate to="/city-map" replace />} />
                <Route path="/city-map" element={<CityMap />} />
                <Route path="/parcel-score" element={<ParcelScore />} />
                <Route path="/311-signals" element={<Signals311 />} />
                <Route path="/config" element={<ConfigPage />} />
              </Routes>
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
