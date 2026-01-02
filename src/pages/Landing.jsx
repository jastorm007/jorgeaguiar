import { useState } from "react";
import { requestOTP } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const res = await requestOTP(email, password, phone);

    if (res?.success) {
      navigate("/otp", { state: { email, phone } });
    } else {
      setError(res?.message || "Failed to request OTP");
    }
  }

  return (
    <div className="page center login">
      <div className="content">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">aguiar.org</h3>

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
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          <button className="btn btn-primary w-100">
            Continue
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}