import React from 'react'
import ParcelCard from './ParcelCard'


export default function ParcelAnalyzeSection (){
  return (
    <div className='flex flex-col'>
     <h1 className='pt-4 pb-4 text-black font-section'>SELECT A PARCEL TO ANALYZE</h1>
    <div className='flex justify-between flex-row overflow-auto'>
       
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
    </div>
    </div>
    
  )
}