import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MapView from './pages/MapView';
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Layout from './layouts/Layout';
import PreviewData from './pages/PreviewData';
import Home from './pages/Home';
import About from './pages/About';
import ProfileOrders from './pages/ProfileOrders';
import { useAppContext } from '../contexts/AppContext';
import AuthorizeYourself from './pages/AuthorizeYourself';
import ViewAuthRequests from './pages/ViewAuthRequests';
import AdminDashboard from './pages/AdminDashboard';



function App() {
  const {isAdmin, isAuthorized, isLoggedIn} = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapView />} />

      {!isLoggedIn && <>
        <Route path="/sign-in" element={<Layout><SignIn /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
      </>
      }


        <Route path="/home" element={<Layout><Home /></Layout>} />

        {isLoggedIn && isAuthorized && <>
        <Route path="/preview" element={<Layout><PreviewData /></Layout>} />
        <Route path="/map" element={<MapView />} />
        <Route path="/orders" element={<Layout><ProfileOrders /></Layout>} />
        </>}
        
      {isLoggedIn && !isAuthorized && <>
      <Route path="/authorize-yourself" element={<Layout>< AuthorizeYourself/></Layout>} />
      </>}


        {isAdmin && <> 

        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/authorization-requests" element={<Layout><ViewAuthRequests /></Layout>} />
        </>}


        <Route path="/about" element={<About />} />

        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  )
}

export default App
