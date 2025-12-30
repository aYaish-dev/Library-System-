import React, { useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function Register({ onLoggedIn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { accessToken, user } = await api.register(email, password, name);
      onLoggedIn(accessToken, user);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚀</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Account</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Join the library to start borrowing.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@uni.edu"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {error && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', borderLeft: '4px solid #ef4444' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-xl"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}