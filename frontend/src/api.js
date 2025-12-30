const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("lrts_token") || "";
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const t = token ?? getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // health
  health: () => request("/health"),

  // auth
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/api/auth/me"),

  // resources
  listResources: (q = "") => request(`/api/resources?q=${encodeURIComponent(q)}`),
  getResource: (id) => request(`/api/resources/${id}`),
  updateCopyStatus: (copyId, status) =>
    request(`/api/admin/copies/${copyId}/status`, {
      method: "PATCH",
      body: { status },
    }),

  // reservations (waitlist)
  reserve: (resourceId) =>
    request(`/api/reservations`, { method: "POST", body: { resourceId } }),
  myReservations: () => request(`/api/reservations/me`),

  // loans
  myLoans: () => request(`/api/loans/me`),

  // staff actions
  checkout: (userId, copyId) =>
    request(`/api/checkout`, { method: "POST", body: { userId, copyId } }),
  returns: (copyId) => request(`/api/returns/${copyId}`, { method: "POST" }),

  // admin analytics
  topBorrowed: () => request(`/api/admin/analytics/top-borrowed`),
  overdue: () => request(`/api/admin/analytics/overdue`),
  waitlistPressure: () => request(`/api/admin/analytics/waitlist-pressure`),
};
