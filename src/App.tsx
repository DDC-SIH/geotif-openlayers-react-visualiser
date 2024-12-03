import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MapView from './pages/MapView';
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Layout from './layouts/Layout';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/sign-in" element={<Layout><SignIn /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/test" element={<h1>Test</h1>} />
      </Routes>
    </Router>
  )
}

export default App
