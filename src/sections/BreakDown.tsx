import AiRecommendations from "../components/AiRecommendations"
import CommunityHealth from "../components/CommunityHealth"
import FootTraffic from "../components/FootTraffic"
import GrantsLiveStatus from "../components/Grants"

type Props = {}

export default function BreakDown(props: Props) {
  return (
    <div className='flex flex-col h-screen overflow-y-auto'>
      <h1 className='p-4 pl-10 text-black font-section'>AI ANALYSIS</h1>
      <div className='flex flex-row flex-1'>
        <div className='flex-1'>
          <AiRecommendations />
        </div>
        <div className='flex-1'>
          <FootTraffic />
          <GrantsLiveStatus />
          <CommunityHealth />
        </div>
      </div>
    </div>
  )
}