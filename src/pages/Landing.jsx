import { useEffect, useState } from "react";
import { requestOTP } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { token } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =====================================================
     REDIRECT IF ALREADY AUTHENTICATED
  ===================================================== */
  useEffect(() => {
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [token, navigate]);

  /* =====================================================
     REQUEST OTP
  ===================================================== */
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await requestOTP(email, password);

      if (res?.success) {
        navigate("/otp", { state: { email } });
      } else {
        setError(res?.message || "Failed to request OTP");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page center login">
      <div className="content">
        <div className="card shadow p-4">
          <h3 className="text-center mb-4">JORGE AGUIAR</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Sending OTP…" : "Continue"}
            </button>
          </form>

          <div className="text-center mt-3">
            <small>
              Don’t have an account?{" "}
              <Link to="/register">Create one</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
