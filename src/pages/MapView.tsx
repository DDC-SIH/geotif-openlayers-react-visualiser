import { GeoDataProvider } from "../../contexts/GeoDataProvider";
import MapComponent from "../components/MapArea";
import MenuArea from "../components/MenuArea";


function MapView() {
  return (
    <div className="relative flex">
    <GeoDataProvider>
      <MapComponent />
      <div className="top-0 absolute left-0 min-h-screen flex">
        <MenuArea />
      </div>
    </GeoDataProvider>
  </div>
  )
}

export default MapView