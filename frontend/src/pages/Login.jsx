import React, { useState } from "react";
import { api } from "../api";

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { accessToken, user } = await api.login(email, password);
      onLoggedIn(accessToken, user);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📚</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Welcome Back</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Enter your credentials to access the library.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
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
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account? <span style={{ color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>Contact Administration</span>
        </div>
      </div>
    </div>
  );
}