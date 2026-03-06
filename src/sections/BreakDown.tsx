import AiRecommendations from "../components/AiRecommendations"
import CommunityHealth from "../components/CommunityHealth"
import FootTraffic from "../components/FootTraffic"
import GrantsLiveStatus from "../components/Grants"
import PropertyHeader from "../components/PropertyHeader"

type Props = {}
// ─── Pulsing dot ─────────────────────────────────────────────────────────────

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: "#3DDC84" }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: "#3DDC84" }}
      />
    </span>
  );
}
export default function BreakDown(props: Props) {
  return (
   <div className='flex flex-col h-screen mt-12 bordertop-1-[#C4911A]'>
   
  <h1 className='p-4 pl-10 text-black font-section'>AI ANALYSIS</h1>
   <PropertyHeader/>
  <div className='flex flex-row flex-1 overflow-hidden'>
    <div className='w-[50%]  flex flex-col border-r border-yellow-500'>
      <div className="mb-8">
            
            <h1
              className="leading-tight pl-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
            >
              AI Recommendations — Math scored · AI explained
            </h1>
            <div
              className="mt-2 h-px w-16"
              style={{ backgroundColor: "#C4911A" }}
            />
          </div>
      <AiRecommendations />
    </div>
    <div className='w-[30%] flex flex-col   border-r border-yellow-500'>
      <div className="mb-8">
            
            <h1
              className="leading-tight pl-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
            >
              Live Signals 
              <span
              className="text-sm"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "#737171",
              }}
            >
             
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-widest"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                backgroundColor: "#e6fdf2",
                color: "#1a7a45",
                border: "1px solid #3DDC84",
              }}
            >
              <PulseDot />
              REAL - TIME
            </span>
            </h1>
            <div
              className="mt-2 h-px w-16"
              style={{ backgroundColor: "#C4911A" }}
            />
          </div>
      <FootTraffic />
      <GrantsLiveStatus />
    </div>
    <div className='w-[20%] '>
       <div className="mb-8">
            
            <h1
              className="leading-tight pl-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
            >
              Community Health
            </h1>
            <div
              className="mt-2 h-px w-16"
              style={{ backgroundColor: "#C4911A" }}
            />
          </div>
      <CommunityHealth />
    </div>
  </div>
</div>
  )
}