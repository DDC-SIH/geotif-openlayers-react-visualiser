import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MapView from "./pages/MapView";
import SatelliteDataSearch from "./pages/SatelliteDataSearch";
import { colorMaps } from "../constants/consts";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Layout from "./layouts/Layout";

function App() {
  const handleSearch = (
    satellite: string,
    captureType: string,
    startDate: string,
    endDate: string
  ) => {
    console.log(
      `Searching for ${satellite} with ${captureType} from ${startDate} to ${endDate}`
    );
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><MapView /></Layout>} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/search"
          element={
            <SatelliteDataSearch
              satellites={["INSAT-3D", "INSAT-3DR", "INSAT-3A"]}
              captureTypes={["Imagery", "Radio"]}
              onSearch={handleSearch}
              bands={colorMaps}
            />
          }
        />
        <Route path="/test" element={<h1>Test</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
