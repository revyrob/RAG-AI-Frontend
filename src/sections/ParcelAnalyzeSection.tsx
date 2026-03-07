import ParcelCard from '../components/ParcelCard'
import type { Parcel } from '../types'

interface Props {
  parcels: Parcel[]
  selectedParcel: Parcel | null
  onSelectParcel: (parcel: Parcel) => void
}
 
export default function ParcelAnalyzeSection({ parcels, selectedParcel, onSelectParcel }: Props) {
  return (
    <div className='flex flex-col border-b border-[#C4911A] pb-4'>
      <h1 className='p-4 pl-10 text-black font-section'>SELECT A PARCEL TO ANALYZE</h1>
      <div className='flex justify-around flex-row py-4'>
        {parcels.map((parcel) => (
          <ParcelCard
            key={parcel.id}
            address={parcel.address}
            
            city="Montgomery AL"
            facts={`${parcel.acres.toFixed(1)} acres · Zoned ${parcel.zone_context}`}
            signals={[
              { label: "Nearest anchor", value: parcel.nearest_anchor },
              { label: "Distance", value: `${parcel.min_dist_miles} mi` },
              { label: "Open grants", value: `${parcel.open_grants} available`, urgent: parcel.open_grants > 0 },
            ]}
            onClick={() => onSelectParcel(parcel)}
           
            active={selectedParcel?.id === parcel.id}
          />
        ))}
      </div>
    </div>
  )
}