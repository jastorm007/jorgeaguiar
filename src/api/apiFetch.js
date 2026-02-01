// src/api/apiFetch.js

const API_BASE = "https://sorpentor.com";

/**
 * Low-level fetch wrapper
 * - Injects access token
 * - Sends refresh cookie
 * - Auto-refreshes on 401
 * - Retries original request once
 */
export async function apiFetch(url, options = {}, auth) {
  if (!auth) {
    throw new Error("Auth context required for apiFetch");
  }

  // Helper to perform fetch with token
  const doFetch = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: "include" // 🔑 REQUIRED for refresh cookie
    });

  // 1️⃣ First attempt with current access token
  let res = await doFetch(auth.token);

  // 2️⃣ Access token expired → try refresh
  if (res.status === 401 && auth.token) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });

    // Refresh failed → session expired
    if (!refreshRes.ok) {
      auth.logout();
      throw new Error("Session expired");
    }

    const { token: newToken } = await refreshRes.json();

    // Update auth context
    auth.setToken(newToken);

    // 3️⃣ Retry original request with new token
    res = await doFetch(newToken);
  }

  return res;
}

/**
 * High-level helper
 * - Parses JSON or text
 * - Normalizes API errors
 */
export async function apiGetJson(url, options = {}, auth) {
  const res = await apiFetch(url, options, auth);

  // No content
  if (res.status === 204) return null;

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(
      (data && (data.error || data.message)) ||
      `Request failed (${res.status})`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
