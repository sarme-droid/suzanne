const TOKEN_KEY = 'printshop_token';
// Empty in local dev (Vite proxies /api). Set VITE_API_URL in production.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Request failed (status ${res.status})`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}