// src/api/apiFetch.js

let refreshPromise = null;

/**
 * Low-level fetch wrapper with:
 * - Authorization header
 * - Cookie support (refresh token)
 * - Automatic refresh + retry on 401
 * - Refresh lock to prevent stampede
 */
export async function apiFetch(url, options = {}, auth) {
  const doFetch = (token) =>
    fetch(url, {
      ...options,
      credentials: "include", // 🔥 REQUIRED for refresh cookie
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

  // 1️⃣ Attempt request with current access token
  let res = await doFetch(auth?.token);

  // 2️⃣ If not unauthorized or no refresh available, return immediately
  if (res.status !== 401 || !auth?.refreshAccessToken) {
    return res;
  }

  // 3️⃣ If a refresh is already in progress, wait for it
  if (!refreshPromise) {
    refreshPromise = auth
      .refreshAccessToken()
      .finally(() => {
        refreshPromise = null;
      });
  }

  const newToken = await refreshPromise;

  // 4️⃣ If refresh failed, propagate original 401
  if (!newToken) {
    return res;
  }

  // 5️⃣ Retry original request with new token
  return doFetch(newToken);
}

/**
 * Convenience helper for JSON APIs
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
