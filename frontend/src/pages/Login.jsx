import React, { useState } from "react";
import { api } from "../api";

const presets = [
  { label: "Student", email: "student1@uni.edu", pass: "123456" },
  { label: "Faculty", email: "faculty1@uni.edu", pass: "123456" },
  { label: "Staff", email: "staff1@uni.edu", pass: "123456" },
  { label: "Admin", email: "admin@uni.edu", pass: "123456" },
];

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState(presets[0].email);
  const [password, setPassword] = useState(presets[0].pass);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function doLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      // backend should return { token, user }
      onLoggedIn(res.token, res.user);
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setEmail(p.email);
              setPassword(p.pass);
            }}
          >
            Use {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={doLogin} style={{ display: "grid", gap: 10 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Password
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        {err ? <div style={{ color: "crimson" }}>{err}</div> : null}

        <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>

      <div style={{ marginTop: 14, opacity: 0.75 }}>
        API base: <code>{import.meta.env.VITE_API_BASE || "http://localhost:4000"}</code>
      </div>
    </div>
  );
}
