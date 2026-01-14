import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Brand */}
        <div className="nav-brand">
          <Link to={token ? "/home" : "/"}>aguiar.org</Link>
        </div>

        {/* Hamburger */}
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`nav-links ${open ? "open" : ""}`}>

          {/* 🔓 PUBLIC */}
          {!token && (
            <>
              <Link to="/" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}

          {/* 🔒 PROTECTED */}
          {token && (
            <>
              <Link to="/home" onClick={() => setOpen(false)}>Home</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/media" onClick={() => setOpen(false)}>Media</Link>
              <Link to="/aviation" onClick={() => setOpen(false)}>Aviation</Link>
              <Link to="/broadcast" onClick={() => setOpen(false)}>Broadcast</Link>
              <Link to="/account" onClick={() => setOpen(false)}>Account</Link>

              <button className="logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}
