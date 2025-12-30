import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { api } from "./api";
import { clearAuth, getUser, isLoggedIn, setAuth } from "./authStore";

import Login from "./pages/Login.jsx";
import Search from "./pages/Search.jsx";
import MyLoans from "./pages/MyLoans.jsx";
import MyReservations from "./pages/MyReservations.jsx";
import Staff from "./pages/Staff.jsx";
import Admin from "./pages/Admin.jsx";

function Layout({ children, user, onLogout }) {
  return (
    <div style={{ fontFamily: "system-ui", padding: 18 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 800 }}>Library Resource Tracking System</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ opacity: 0.8 }}>
                {user.name} ({user.role})
              </span>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <span style={{ opacity: 0.7 }}>Not logged in</span>
          )}
        </div>
      </div>

      {user && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <Link to="/search">Search</Link>
          <Link to="/loans">My Loans</Link>
          <Link to="/reservations">My Reservations</Link>
          {(user.role === "staff" || user.role === "admin") && <Link to="/staff">Staff</Link>}
          {user.role === "admin" && <Link to="/admin">Admin</Link>}
        </div>
      )}

      <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>{children}</div>
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
  const [bootError, setBootError] = useState("");

  useEffect(() => {
    // optional: verify token by calling /me if you have it
    // If your backend has /api/auth/me, keep this. Otherwise comment out.
    (async () => {
      if (!isLoggedIn()) return;
      try {
        const me = await api.me();
        if (me?.user) {
          setAuth(getTokenSafe(), me.user);
          setUser(me.user);
        }
      } catch (e) {
        // token invalid -> logout
        clearAuth();
        setUser(null);
      }
    })();
  }, []);

  function getTokenSafe() {
    return localStorage.getItem("lrts_token") || "";
  }

  const onLogout = () => {
    clearAuth();
    setUser(null);
    nav("/login");
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {bootError ? <div style={{ color: "crimson" }}>{bootError}</div> : null}

      <Routes>
        <Route
          path="/"
          element={isLoggedIn() ? <Navigate to="/search" replace /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={
            <Login
              onLoggedIn={(token, userObj) => {
                setAuth(token, userObj);
                setUser(userObj);
                nav("/search");
              }}
            />
          }
        />

        <Route
          path="/search"
          element={
            <Protected>
              <Search user={user} />
            </Protected>
          }
        />

        <Route
          path="/loans"
          element={
            <Protected>
              <MyLoans />
            </Protected>
          }
        />

        <Route
          path="/reservations"
          element={
            <Protected>
              <MyReservations />
            </Protected>
          }
        />

        <Route
          path="/staff"
          element={
            <Protected>
              <RoleOnly roles={["staff", "admin"]}>
                <Staff />
              </RoleOnly>
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected>
              <RoleOnly roles={["admin"]}>
                <Admin />
              </RoleOnly>
            </Protected>
          }
        />

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
