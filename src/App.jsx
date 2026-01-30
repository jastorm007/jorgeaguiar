import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import OTP from "./pages/OTP";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Media from "./pages/Media";
import AviationDashboard from "./pages/AviationDashboard";
import AviationEventReport from "./pages/AviationEventReport";
import Register from "./pages/Register";
import Broadcast from "./pages/Broadcast";
import Visitors from "./pages/Visitors";
import AI from "./pages/AI";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/otp" element={<OTP />} />

          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <Visitors />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AI />
              </ProtectedRoute>
            }
          />

          {/* ✅ FIXED */}
          <Route
            path="/media"
            element={
              <ProtectedRoute>
                <Media />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aviation"
            element={
              <ProtectedRoute>
                <AviationDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aviation/event/:id"
            element={
              <ProtectedRoute>
                <AviationEventReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/broadcast"
            element={
              <ProtectedRoute>
                <Broadcast />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={<Register />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
