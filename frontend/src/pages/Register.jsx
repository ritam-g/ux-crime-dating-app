/**
 * @file Register.jsx
 * @description Registration page for creating a new account.
 */
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * @description Registers a new user and stores the auth cookie.
 * @returns A registration form.
 * @route POST /api/auth/register
 * @access Public
 */
const Register = ({ onGoLogin }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    bio: "",
    interests: "music,coffee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        interests: form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <p className="eyebrow">Join the app</p>
      <h1>Create your profile.</h1>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          <span>Name</span>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label>
          <span>Age</span>
          <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        </label>
        <label>
          <span>Gender</span>
          <input type="text" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
        </label>
        <label className="full">
          <span>Bio</span>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows="3" />
        </label>
        <label className="full">
          <span>Interests, comma separated</span>
          <input type="text" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p className="switch-text">
        Already have an account?{" "}
        <button type="button" className="link-btn" onClick={onGoLogin}>
          Login
        </button>
      </p>
    </section>
  );
};

export default Register;
