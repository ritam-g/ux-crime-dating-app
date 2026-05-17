/**
 * @file Login.jsx
 * @description Login page for cookie-based authentication.
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * @description Logs the user in through the backend cookie auth flow.
 * @returns A login form.
 * @route POST /api/auth/login
 * @access Public
 */
const Login = ({ onGoRegister }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <p className="eyebrow">Welcome back</p>
      <h1>Log in to continue the chaos.</h1>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="switch-text">
        New here?{" "}
        <button type="button" className="link-btn" onClick={onGoRegister}>
          Create an account
        </button>
      </p>
    </section>
  );
};

export default Login;
