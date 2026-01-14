import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      navigate("/"); // back to login
    } else {
      alert("Registration failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Create Account</h2>

      <input name="username" placeholder="Username" required />
      <input name="firstName" placeholder="First Name" />
      <input name="lastName" placeholder="Last Name" />
      <input name="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone" />
      <input type="password" name="password" placeholder="Password" required />

      <button>Create Account</button>
    </form>
  );
}
