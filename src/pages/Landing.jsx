import { useState } from "react";
import { requestOTP } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const res = await requestOTP(email, password, phone);

    if (res?.success) {
      navigate("/otp", { state: { email, phone } });
    } else {
      alert(res?.message || "Error requesting OTP");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>aguiar.org Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button>Request OTP</button>
      </form>
    </div>
  );
}
