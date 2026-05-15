import { PUBLIC_API_URL } from '$env/static/public';
const BASE = PUBLIC_API_URL;

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}