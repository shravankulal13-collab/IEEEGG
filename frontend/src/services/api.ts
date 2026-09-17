// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Base HTTP API Client & Interceptors
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  environment: string;
  uptimeSeconds: number;
  database: {
    connected: boolean;
    provider: string;
    details?: string;
  };
  services: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Normalize endpoint to prevent double /api/api
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  } else if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  const primaryUrl = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${cleanEndpoint}`;
  
  const token = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(primaryUrl, {
      ...options,
      headers,
    });
  } catch (initialErr: any) {
    // If relative /api URL failed (e.g. proxy inactive or cross-origin dev server), retry with direct 127.0.0.1:5000
    if (!endpoint.startsWith('http') && BASE_URL === '/api') {
      try {
        const fallbackUrl = `http://127.0.0.1:5000/api${cleanEndpoint}`;
        response = await fetch(fallbackUrl, {
          ...options,
          headers,
        });
      } catch {
        try {
          const fallbackLocalhost = `http://localhost:5000/api${cleanEndpoint}`;
          response = await fetch(fallbackLocalhost, {
            ...options,
            headers,
          });
        } catch {
          throw new Error('Unable to connect to ResQGrid API server. Please ensure the backend is running.');
        }
      }
    } else {
      throw new Error(initialErr.message || 'Unable to connect to ResQGrid API server.');
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || (data && data.success === false)) {
    if (response.status === 401 && typeof window !== 'undefined' && window.localStorage) {
      if (data?.error?.code === 'INVALID_TOKEN' || String(data?.error?.message).includes('invalid') || String(data?.message).includes('invalid')) {
        localStorage.removeItem('token');
        localStorage.removeItem('resqgrid_user');
      }
    }
    const errorMsg =
      (typeof data?.error === 'string'
        ? data.error
        : (data?.error?.details?.[0]?.message || data?.error?.message)) ||
      data?.message ||
      `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => null);
    if (data && typeof data === 'object' && data.database) {
      return data;
    }
    return {
      status: 'down',
      timestamp: new Date().toISOString(),
      environment: 'development',
      uptimeSeconds: 0,
      database: { connected: false, provider: 'postgresql', details: `HTTP ${res.status}` },
      services: {},
    };
  } catch (err: any) {
    return {
      status: 'down',
      timestamp: new Date().toISOString(),
      environment: 'development',
      uptimeSeconds: 0,
      database: { connected: false, provider: 'postgresql', details: err.message || 'Connection failed' },
      services: {},
    };
  }
}
