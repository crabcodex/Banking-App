export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ code: string; message: string }>;
  requestId?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiResponse<null>,
  ) {
    super(body.message);
    this.name = 'ApiError';
  }
}

const BASE_URL = '/api';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getDevToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const res = await fetch(`${BASE_URL}/dev/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  const json = await res.json();
  cachedToken = json.data.token;
  tokenExpiresAt = now + 23 * 60 * 60 * 1000; // 23h (margen sobre las 24h del token)
  return cachedToken!;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Inyectar token de desarrollo si no se proporcionó Authorization
  if (!reqHeaders['Authorization'] && (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOKEN === 'true')) {
    const token = await getDevToken();
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Generar Idempotency-Key para mutaciones si no se proporcionó
  if (!reqHeaders['Idempotency-Key'] && method !== 'GET') {
    reqHeaders['Idempotency-Key'] = crypto.randomUUID();
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, json as ApiResponse<null>);
  }

  return json as ApiResponse<T>;
}

export const httpClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('GET', path, undefined, headers),

  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>('POST', path, body, headers),
};
