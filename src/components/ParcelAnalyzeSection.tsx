import { useState } from 'react'
import ParcelCard from './ParcelCard'


export default function ParcelAnalyzeSection (){
  const [selected, setSelected] = useState<number | null>(null)

  const parcels = [
    {
      id: 1,
      address: "1100 W Jeff Davis Ave",
      city: "Montgomery AL, 36104",
      facts: "2.6 acres · Vacant 12 yrs · Zoned C-1",
      badges: [
        { label: "Symbolic", variant: "heritage" },
      ],
      signals: [
        { label: "Food desert — nearest grocery", value: "2.8 mi" },
        { label: "Median income", value: "$22,400" },
        { label: "HUD CDBG OPEN —", value: "47 days left", urgent: true },
      ],
    },
    {
      id: 2,
      address: "1100 W Jeff Davis Ave",
      city: "Montgomery AL, 36104",
      facts: "2.6 acres · Vacant 12 yrs · Zoned C-1",
      badges: [
        { label: "Symbolic", variant: "heritage" },
      ],
      signals: [
        { label: "Food desert — nearest grocery", value: "2.8 mi" },
        { label: "Median income", value: "$22,400" },
        { label: "HUD CDBG OPEN —", value: "47 days left", urgent: true },
      ],
    },
    {
      id: 3,
      address: "1100 W Jeff Davis Ave",
      city: "Montgomery AL, 36104",
      facts: "2.6 acres · Vacant 12 yrs · Zoned C-1",
      badges: [
        { label: "Symbolic", variant: "heritage" },
      ],
      signals: [
        { label: "Food desert — nearest grocery", value: "2.8 mi" },
        { label: "Median income", value: "$22,400" },
        { label: "HUD CDBG OPEN —", value: "47 days left", urgent: true },
      ],
    },
  ]

  return (
    <div className='flex flex-col'>
     <h1 className='pt-4 pb-4 text-black font-section'>SELECT A PARCEL TO ANALYZE</h1>
    <div className='parcel-grid'>
      {parcels.map((parcel) => (
        <div
          key={parcel.id}
          className={`parcel-card ${selected === parcel.id ? "active" : ""}`}
          onClick={() => setSelected(parcel.id)}
        >
          <ParcelCard
            address={parcel.address}
            city={parcel.city}
            facts={parcel.facts}
            badges={parcel.badges}
            signals={parcel.signals}
            onClick={() => setSelected(parcel.id)}
            active={selected === parcel.id}
          />
        </div>
      ))}
    </div>
    </div>
    
  )
}