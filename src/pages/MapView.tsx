import { GeoDataProvider } from "../../contexts/GeoDataProvider"
import MapComponent from '../components/MapArea'

function MapView() {
  return (
    <div className='relative flex'>
      <GeoDataProvider>
        <MapComponent />
      </GeoDataProvider>
    </div>
  )
}

export default MapView