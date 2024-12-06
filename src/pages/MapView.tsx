import TimeLineSlider from "@/components/TimeLineSlider"
import { GeoDataProvider } from "../../contexts/GeoDataProvider"
import MapComponent from '../components/MapArea'

function MapView() {
  return (
    <div className='relative flex'>
      <GeoDataProvider>
        <MapComponent />
      </GeoDataProvider>
      <TimeLineSlider/>
    </div>
  )
}

export default MapView