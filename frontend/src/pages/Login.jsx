import React, { useState } from "react";
import { api } from "../api";

const presets = [
  { label: "Student", email: "student1@uni.edu", pass: "123456" },
  { label: "Staff", email: "staff1@uni.edu", pass: "123456" },
  { label: "Admin", email: "admin@uni.edu", pass: "123456" },
];

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function doLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      onLoggedIn(res.accessToken, res.user);
    } catch (e2) {
      setErr(e2.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2.5rem', background: 'rgba(255,255,255,0.95)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡️</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LibraryOS</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Next-Gen Resource Management</p>
        </div>

        <form onSubmit={doLogin} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Email</label>
            <input 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="user@university.edu"
              autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Password</label>
            <input 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          {err && (
            <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center' }}>
              {err}
            </div>
          )}

          <button className="btn-xl" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? "Authenticating..." : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Access (Demo)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {presets.map(p => (
              <button 
                key={p.label}
                onClick={() => { setEmail(p.email); setPassword(p.pass); }}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#475569', transition: 'all 0.2s' }}
                onMouseOver={e => e.target.style.borderColor = '#6366f1'}
                onMouseOut={e => e.target.style.borderColor = '#e2e8f0'}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}