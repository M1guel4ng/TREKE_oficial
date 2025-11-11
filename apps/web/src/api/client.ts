// Pequeño wrapper para fetch con manejo de errores
const API_BASE = '' as const; // con proxy, base = "" y siempre empiezas con /api

type Options = RequestInit & { json?: any };

async function request<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { json, headers, ...rest } = opts;
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });

  // Intentamos parsear JSON aunque haya error
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get:   <T = any>(path: string)           => request<T>(path),
  post:  <T = any>(path: string, json?: any) => request<T>(path, { method: 'POST',  json }),
  put:   <T = any>(path: string, json?: any) => request<T>(path, { method: 'PUT',   json }),
  patch: <T = any>(path: string, json?: any) => request<T>(path, { method: 'PATCH', json }),
  del:   <T = any>(path: string)             => request<T>(path, { method: 'DELETE' }),
};
