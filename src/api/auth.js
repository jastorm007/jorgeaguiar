const API_LOGIN = "https://sorpentor.com/login/otp";
const API_VERIFY = "https://sorpentor.com/login/verify-otp";

export async function requestOTP(email, password, phone) {
  const res = await fetch(API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, phone }),
  });

  return res.json();
}

export async function verifyOTP(email, phone, otp) {
  const res = await fetch(API_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, phone, otp }),
  });

  return res.json();
}
