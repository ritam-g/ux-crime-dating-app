/**
 * @file Profile.jsx
 * @description Profile view for reading and updating the current user.
 */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile } from "../services/api.js";

/**
 * @description Loads and updates the current user's profile.
 * @returns A profile form.
 * @route GET /api/user/profile
 * @route PUT /api/user/profile
 * @access Private
 */
const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    bio: "",
    interests: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "",
        bio: user.bio || "",
        interests: Array.isArray(user.interests) ? user.interests.join(", ") : "",
      });
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    await updateProfile({
      name: form.name,
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender,
      bio: form.bio,
      interests: form.interests
        .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    });

    await refreshUser();
    setMessage("Profile updated successfully");
  };

  return (
    <section className="panel">
      <p className="eyebrow">Your profile</p>
      <h1>Update the details that make you swipe-worthy.</h1>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          <span>Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          <span>Age</span>
          <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        </label>
        <label>
          <span>Gender</span>
          <input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
        </label>
        <label className="full">
          <span>Bio</span>
          <textarea rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
        <label className="full">
          <span>Interests</span>
          <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
        </label>

        {message ? <p className="success-text full">{message}</p> : null}

        <button className="btn primary full" type="submit">
          Save Profile
        </button>
      </form>
    </section>
  );
};

export default Profile;
