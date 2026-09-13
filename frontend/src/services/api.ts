// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Base HTTP API Client & Interceptors
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'erics_access_token';

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error: unknown }).error;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
  }
  return `HTTP error ${status}`;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    throw new Error(`HTTP error ${response.status}`);
  }

  const envelope = data as { success?: boolean };
  if (!response.ok || envelope.success === false) {
    throw new Error(extractErrorMessage(data, response.status));
  }
  return data as T;
}
