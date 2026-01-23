const API_BASE = "https://sorpentor.com";

/* ============================
   AUTH ENDPOINTS
============================ */
const API_LOGIN = `${API_BASE}/login/otp`;
const API_VERIFY = `${API_BASE}/login/verify-otp`;
const API_REGISTER = `${API_BASE}/register`;
const API_REFRESH = `${API_BASE}/auth/refresh`;
const API_LOGOUT = `${API_BASE}/auth/logout`;

/* ============================
   STEP 1: REQUEST OTP
============================ */
export async function requestOTP(email, password) {
  const res = await fetch(API_LOGIN, {
    method: "POST",
    credentials: "include", // ✅ safe to include
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

/* ============================
   STEP 2: VERIFY OTP
   (SETS REFRESH COOKIE)
============================ */
export async function verifyOTP(email, otp) {
  const res = await fetch(API_VERIFY, {
    method: "POST",
    credentials: "include", // 🔥 REQUIRED
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  return res.json();
}

/* ============================
   REFRESH ACCESS TOKEN
============================ */
export async function refreshAccessToken() {
  const res = await fetch(API_REFRESH, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.token; // ✅ return token string only
}

/* ============================
   LOGOUT
============================ */
export async function logout() {
  const res = await fetch(API_LOGOUT, {
    method: "POST",
    credentials: "include", // 🔥 REQUIRED
  });

  return res.json();
}

/* ============================
   REGISTER USER
============================ */
export async function registerUser(data) {
  const res = await fetch(API_REGISTER, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
