import { useState, useEffect } from "react"

export interface TopLocation {
  name: string
  address: string
  visits: number
  lat: number
  lng: number
  dist_miles: number
  proximity_weight: number
}

export interface FootTrafficData {
  score: number
  location_count: number
  total_visits: number
  top_locations: TopLocation[]
  nearest_name: string
  nearest_dist_mi: number | null
  source: "arcgis" | "fallback"
  queried_at: string
}

export interface Scores {
  final: number
  heritage: number
  industrial: number
  activity: number
  proximity: number
  economic: number
  vacancy: number
  flood: number
  flood_zone: string
  flood_label: string
  distress: number
  heritage_boost: string
  heritage_anchor: string
  industrial_anchor: string
  destress_density: number
  destress_label: string
  destress_top_complaints: { type: string; count: number }[]
  destress_calls_90days: number
  zone_context: string
}

export interface GrantFlag {
  name: string
  status: "open" | "closed"
  days_remaining: number | null
  eligibility_pct?: number
  match?: string
  note?: string
}

export interface HealthFlags {
  food_insecurity_pct?: number
  asthma_rate_multiplier?: number
  nearest_clinic_mi?: number
  nearest_grocery_mi?: number
  median_income?: number
  unemployment_rate?: number
  workforce_in_tech_pct?: number
  veterans_in_workforce?: number
}

export interface AiRecommendation {
  rank: number
  name: string
  fit_score: number
  explanation: string
  cost_tier: string
  grant_flag: string
}

export interface AiAnalysis {
  recommendations: AiRecommendation[]
  one_line_summary: string
  urgency_flag: "low" | "medium" | "high"
}

export interface ParcelScore {
  story: string
  label: string
  parcel_id: string
  address: string
  coords: [number, number]
  acres: number
  nearest_anchor: string
  min_dist: number
  owner: string
  scores: Scores
  foot_traffic: FootTrafficData
  grant_flags: GrantFlag[]
  health_flags: HealthFlags
  ai_analysis: AiAnalysis
}

type ParcelId = "A" | "B" | "C"

interface UseParcelScoreResult {
  data: ParcelScore | null
  loading: boolean
  error: string | null
  refetch: () => void
}
  const serverUrl = import.meta.env.VITE_SERVER_URL;

export function useParcelScore(parcelId: ParcelId | null): UseParcelScoreResult {
  const [data, setData] = useState<ParcelScore | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!parcelId) return

    setLoading(true)
    setError(null)

    fetch(`${serverUrl}parcels/${parcelId}/score`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message ?? "Failed to fetch")
        setLoading(false)
      })
  }, [parcelId, tick])

  const refetch = () => setTick((t) => t + 1)

  return { data, loading, error, refetch }
}