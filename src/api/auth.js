const API_LOGIN = "https://sorpentor.com/login/otp";
const API_VERIFY = "https://sorpentor.com/login/verify-otp";
const API_REGISTER = "https://sorpentor.com/register";

/**
 * Step 1: Request OTP
 */
export async function requestOTP(email, password) {
  const res = await fetch(API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

/**
 * Step 2: Verify OTP
 */
export async function verifyOTP(email, otp) {
  const res = await fetch(API_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return res.json();
}

//Register user
export async function registerUser(data) {
  const res = await fetch(API_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}
