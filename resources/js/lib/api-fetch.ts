import axios from 'axios';

/**
 * A fetch-like wrapper around axios that provides a consistent interface
 * for making API calls with CSRF token support and credential handling.
 * 
 * Returns an object mimicking the Fetch API's Response shape for backwards
 * compatibility with existing code that uses `response.ok` and `response.json()`.
 */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const headers = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : Array.isArray(options.headers)
      ? Object.fromEntries(options.headers)
      : options.headers;
  let data = undefined;
  if (options.body) {
    try {
      if (typeof options.body === 'string') data = JSON.parse(options.body);
      else data = options.body;
    } catch {
      data = options.body;
    }
  }

  try {
    const res = await axios({
      url,
      method,
      data,
      headers,
      withCredentials: true,
      withXSRFToken: true,
      validateStatus: () => true,
    });

    return {
      ok: res.status >= 200 && res.status < 300,
      json: async () => res.data,
      status: res.status,
    } as any;
  } catch (err: any) {
    if (err.response) {
      return { ok: false, json: async () => err.response.data, status: err.response.status } as any;
    }

    return {
      ok: false,
      json: async () => ({ error: err?.message || 'Unable to reach the server' }),
      status: 0,
    } as any;
  }
};

/**
 * Extract a user-friendly error message from an API error response payload.
 * Checks multiple common Laravel/API response shapes.
 */
export const getApiErrorMessage = (payload: any, fallback: string) => {
  if (!payload) return fallback
  if (typeof payload === "string") return payload
  if (typeof payload?.error === "string" && payload.error.trim()) return payload.error
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message

  if (payload?.errors && typeof payload.errors === "object") {
    const firstError = Object.values(payload.errors).flat().find((value) => typeof value === "string")
    if (typeof firstError === "string" && firstError.trim()) return firstError
  }

  return fallback
};
