import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    const form = new FormData(e.target);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("https://sorpentor.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      navigate("/");
    } else {
      alert("Registration failed");
    }
  }

  return (
    <div className="page center login">
      <div className="content">
        <div className="card shadow p-4">
          <h3 className="text-center mb-4">Create Account</h3>

          <form onSubmit={submit}>
            <input className="form-control mb-3" name="username" placeholder="Username" required />
            <input className="form-control mb-3" name="firstName" placeholder="First Name" />
            <input className="form-control mb-3" name="lastName" placeholder="Last Name" />
            <input className="form-control mb-3" name="email" placeholder="Email" required />
            <input className="form-control mb-3" name="phone" placeholder="Phone" />
            <input className="form-control mb-3" type="password" name="password" placeholder="Password" required />

            <button className="btn btn-primary w-100">
              Create Account
            </button>
          </form>

          <div className="text-center mt-3">
            <small>
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
