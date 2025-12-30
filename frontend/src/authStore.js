const KEY_TOKEN = "lrts_token";
const KEY_USER = "lrts_user";

export function setAuth(token, user) {
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
}

export function getToken() {
  return localStorage.getItem(KEY_TOKEN) || "";
}

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken() && !!getUser();
}
