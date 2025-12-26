import { useState } from "react";
import { verifyOTP } from "../api/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const { email, phone } = location.state || {};

  async function handleVerify(e) {
    e.preventDefault();
    setError("");

    const res = await verifyOTP(email, phone, otp);

    if (res?.token) {
      loginWithToken(res.token);
      navigate("/home");
    } else {
      setError(res?.message || "Invalid OTP");
    }
  }

  return (
    <div className="page center">
      <div className="content">
      <div className="card shadow p-4" style={{ maxWidth: 400, width: "100%" }}>
        <h4 className="text-center mb-3">Enter OTP</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleVerify}>
          <input
            className="form-control mb-3"
            placeholder="One-time password"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="btn btn-success w-100">
            Verify
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
