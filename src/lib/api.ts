const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function api<T = any>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let accessToken = token;
  if (!accessToken && typeof window !== 'undefined') {
    // Public endpoints must remain usable even if the user has no session.
    try {
      const authResponse = await fetch('/api/token', { cache: 'no-store' });
      if (authResponse.ok) {
        const body = await authResponse.json();
        accessToken = body.token;
      }
    } catch { /* the protected API will return 401 if a token is required */ }
  }

  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!headers.has('Content-Type') && !isFormData) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, { ...options, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({ message: 'Unexpected server response' }));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}
