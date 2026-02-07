// In development, Vite's proxy forwards /api/* to http://localhost:4000
// In production, the backend serves the frontend, so relative URLs work
export const API_BASE = import.meta.env.VITE_API_BASE || "";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}
