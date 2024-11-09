import './App.css'
import MapComponent from './components/MapArea'
import { GeoDataProvider } from '../contexts/GeoDataProvider';
import MenuArea from './components/MenuArea';

function App() {

  return (
    <div className='relative flex'>
      <GeoDataProvider>
        <MapComponent />

      </GeoDataProvider>
    </div>
  )
}

export default App
