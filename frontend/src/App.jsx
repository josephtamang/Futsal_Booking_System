import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FutsalExplorer from "./pages/FutsalExplorer";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourts from "./pages/AdminCourts";
import AdminSlots from "./pages/AdminSlots";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import AdminSettings from "./pages/AdminSettings";
import Recommendations from "./pages/Recommendations";
import FutsalDetail from "./pages/FutsalDetail";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explore" element={<FutsalExplorer />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/futsal/:futsal_id" element={<FutsalDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courts" element={<AdminCourts />} />
        <Route path="/admin/slots" element={<AdminSlots />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/contact"
          element={<Contact />}
        />
      </Route>
    </Routes>
  );
}

export default App;
