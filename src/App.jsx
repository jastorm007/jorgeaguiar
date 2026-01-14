import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import OTP from "./pages/OTP";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Media from "./pages/Media";
import Dashboard from "./pages/Dashboard";
import AviationDashboard from "./pages/AviationDashboard";
import AviationEventReport from "./pages/AviationEventReport";
import Register from "./pages/Register";

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
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
            path="/register"
            element={<Register />
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
