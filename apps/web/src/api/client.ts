const API_BASE = '' as const;

type Options = RequestInit & { json?: any };

async function request<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { json, headers, method, ...rest } = opts;
  const token = localStorage.getItem('treke_token');

  const res = await fetch(API_BASE + path, {
    method: method || (json ? 'POST' : 'GET'),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...rest,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

interface ApiClient {
  get<T = any>(path: string): Promise<T>;
  get<T = any>(path: string, init: RequestInit): Promise<T>;
  post<T = any>(path: string, json?: any): Promise<T>;
  post<T = any>(path: string, json: any, init: RequestInit): Promise<T>;
  put<T = any>(path: string, json?: any): Promise<T>;
  put<T = any>(path: string, json: any, init: RequestInit): Promise<T>;
  patch<T = any>(path: string, json?: any): Promise<T>;
  patch<T = any>(path: string, json: any, init: RequestInit): Promise<T>;
  del<T = any>(path: string): Promise<T>;
  del<T = any>(path: string, init: RequestInit): Promise<T>;
}

export const api: ApiClient = {
  get(path, init?)  { return request(path, { method: 'GET', ...(init || {}) }); },
  post(path, json?, init?) { return request(path, { method: 'POST', json, ...(init || {}) }); },
  put(path, json?, init?)  { return request(path, { method: 'PUT', json, ...(init || {}) }); },
  patch(path, json?, init?) { return request(path, { method: 'PATCH', json, ...(init || {}) }); },
  del(path, init?) { return request(path, { method: 'DELETE', ...(init || {}) }); },
};
