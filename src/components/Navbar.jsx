import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, logout } = useAuth();

  return (
    <nav style={{ padding: 10, background: "#eee", marginBottom: 20 }}>
      <Link to="/home">Home</Link> |{" "}
      <Link to="/videos">Videos</Link> |{" "}
      <Link to="/account">Account</Link>

      {token && (
        <button
          onClick={logout}
          style={{ marginLeft: 20 }}
        >
          Logout
        </button>
      )}
    </nav>
  );
}
