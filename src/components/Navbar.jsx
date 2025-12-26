import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Brand */}
        <div className="nav-brand">
          <Link to="/home">aguiar.org</Link>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Links */}
        <div className={`nav-links ${open ? "open" : ""}`}>
          <Link to="/home" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/videos" onClick={() => setOpen(false)}>Videos</Link>
          <Link to="/account" onClick={() => setOpen(false)}>Account</Link>

          {token && (
            <button className="logout" onClick={logout}>
              Logout
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}
