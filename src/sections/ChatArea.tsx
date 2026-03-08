import type { Parcel } from '../types'
import Chat from '../components/Chat'

// interface ChatMessage {
//   role: "user" | "rise"
//   text: string
// }

interface Props {
  parcels: Parcel[]
  selectedParcel: Parcel | null
  onSelectParcel: (parcel: Parcel) => void
}
  const serverUrl = import.meta.env.VITE_SERVER_URL;

export default function ChatArea({ selectedParcel}: Props) {
  console.log(selectedParcel)
  return (
    <div className='flex flex-col h-full'>
      <h1 className='p-4 pl-10 text-black font-section'>ASK RISE</h1>
      <div className='flex-1 px-4 pb-4 min-h-0'>
        <Chat
  address={selectedParcel?.address}
   initialMessage={
    selectedParcel
      ? `I'm analyzing ${selectedParcel.address}. Ask me anything — about the recommendations, the data signals, the grant urgency, or what this neighborhood really needs.`
      : `No parcel selected. Please select a parcel to get started.`
  }
  onSendMessage={async (message: string) => {
    const res = await fetch(`${serverUrl}chat/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: message,
        parcel_filter: selectedParcel?.id ?? null,
      }),
    })
    const data = await res.json()
    return data.answer
  }}
/>
      </div>
    </div>
  )
}
