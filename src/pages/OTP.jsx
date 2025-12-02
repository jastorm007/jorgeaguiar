import { useState } from "react";
import { verifyOTP } from "../api/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const { email, phone } = location.state || {};

  async function handleVerify(e) {
    e.preventDefault();
    const res = await verifyOTP(email, phone, otp);

    if (res?.token) {
      loginWithToken(res.token);
      navigate("/home");
    } else {
      alert(res?.message || "Invalid OTP");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Enter OTP</h1>
      <form onSubmit={handleVerify}>
        <input
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button>Verify</button>
      </form>
    </div>
  );
}
