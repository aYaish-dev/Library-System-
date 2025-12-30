import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { api } from "./api";
import { clearAuth, getUser, isLoggedIn, setAuth } from "./authStore";
import "./style.css";

// Pages
import Login from "./pages/Login.jsx";
import Search from "./pages/Search.jsx";
import MyLoans from "./pages/MyLoans.jsx";
import MyReservations from "./pages/MyReservations.jsx";
import Staff from "./pages/Staff.jsx";
import Admin from "./pages/Admin.jsx";
import Register from "./pages/Register.jsx";

// Icons
const Icons = {
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  Book: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Clock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Shield: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Chart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  Exit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
};

function Layout({ children, user, onLogout }) {
  if (!user) return children;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ padding: '0 0.5rem 2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10 }}></div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>LibraryOS</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0 1rem', margin: '0 0 8px', textTransform: 'uppercase' }}>Menu</div>
          <NavLink to="/search" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Icons.Search /> Catalog
          </NavLink>
          <NavLink to="/loans" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Icons.Book /> My Loans
          </NavLink>
          <NavLink to="/reservations" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Icons.Clock /> Reservations
          </NavLink>

          {(user.role === 'staff' || user.role === 'admin') && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0 1rem', margin: '24px 0 8px', textTransform: 'uppercase' }}>Management</div>
              <NavLink to="/staff" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                <Icons.Shield /> Staff Desk
              </NavLink>
            </>
          )}

          {user.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <Icons.Chart /> Analytics
            </NavLink>
          )}
        </nav>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 8px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b' }}>
              {user.email[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{user.role}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email.split('@')[0]}</div>
            </div>
          </div>
          <button onClick={onLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
            <Icons.Exit /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-area">
        {children}
      </main>
    </div>
  );
}

function Protected({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function RoleOnly({ roles, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/search" replace />;
  return children;
}

function AppInner() {
  const nav = useNavigate();
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) return;
      try {
        const me = await api.me();
        if (me?.user) {
          setAuth(localStorage.getItem("lrts_token") || "", me.user);
          setUser(me.user);
        }
      } catch (e) {
        clearAuth();
        setUser(null);
      }
    })();
  }, []);

  const onLogout = () => {
    clearAuth();
    setUser(null);
    nav("/login");
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={isLoggedIn() ? <Navigate to="/search" replace /> : <Navigate to="/login" replace />} />
        
        <Route path="/login" element={
          <Login onLoggedIn={(token, userObj) => {
            setAuth(token, userObj);
            setUser(userObj);
            nav("/search");
          }} />
        } />

        <Route path="/register" element={
          <Register onLoggedIn={(token, userObj) => {
            setAuth(token, userObj);
            setUser(userObj);
            nav("/search");
          }} />
        } />

        <Route path="/search" element={<Protected><Search user={user} /></Protected>} />
        <Route path="/loans" element={<Protected><MyLoans /></Protected>} />
        <Route path="/reservations" element={<Protected><MyReservations /></Protected>} />
        
        <Route path="/staff" element={
          <Protected>
            <RoleOnly roles={["staff", "admin"]}><Staff /></RoleOnly>
          </Protected>
        } />

        <Route path="/admin" element={
          <Protected>
            <RoleOnly roles={["admin"]}><Admin /></RoleOnly>
          </Protected>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}