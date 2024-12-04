import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MapView from './pages/MapView';
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Layout from './layouts/Layout';
import OrderData from './pages/OrderData';
import PreviewData from './pages/PreviewData';
import Home from './pages/Home';
import About from './pages/About';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        
        <Route path="/sign-in" element={<Layout><SignIn /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />

        <Route path="/home" element={<Home />} />
        <Route path="/order" element={<OrderData />} />
        <Route path="/preview" element={<PreviewData />} />
        <Route path="/map" element={<MapView />} />

        <Route path="/about" element={<About />} />

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
