import type { Parcel } from '../types'
import Chat from '../components/Chat'

interface ChatMessage {
  role: "user" | "rise"
  text: string
}

interface Props {
  parcels: Parcel[]
  selectedParcel: Parcel | null
  onSelectParcel: (parcel: Parcel) => void
}

export default function ChatArea({ selectedParcel}: Props) {
  return (
    <div className='flex flex-col h-full'>
      <h1 className='p-4 pl-10 text-black font-section'>ASK RISE</h1>
      <div className='flex-1 px-4 pb-4 min-h-0'>
        <Chat
          address={selectedParcel?.address}
          onSendMessage={async (message: string, history: ChatMessage[]) => {
            const res = await fetch("http://127.0.0.1:8000/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message,
                history: history.map((m) => ({
                  role: m.role === "rise" ? "assistant" : "user",
                  content: m.text,
                })),
                parcel_address: selectedParcel?.address ?? "",
                parcel_id: selectedParcel?.id ?? "",
              }),
            })
            const data = await res.json()
            return data.reply
          }}
        />
      </div>
    </div>
  )
}
