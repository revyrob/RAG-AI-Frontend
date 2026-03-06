export interface Coords {
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