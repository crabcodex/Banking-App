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
