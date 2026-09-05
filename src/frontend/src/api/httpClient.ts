import { API_BASE_URL } from './config';
import { ApiError } from './errors';
import { getToken } from './tokenStorage';

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function buildError(status: number, body: unknown): ApiError {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : null;

  if (status === 401) {
    const message =
      typeof record?.message === 'string'
        ? record.message
        : 'Tu sesión expiró o no iniciaste sesión. Volvé a loguearte.';
    return new ApiError({ status, kind: 'unauthorized', message });
  }

  if (status === 403) {
    return new ApiError({
      status,
      kind: 'forbidden',
      message: 'No tenés permiso para realizar esta acción.',
    });
  }

  if (status === 404) {
    return new ApiError({ status, kind: 'notFound', message: 'No se encontró el recurso solicitado.' });
  }

  if (status === 400) {
    if (typeof record?.message === 'string') {
      return new ApiError({ status, kind: 'business', message: record.message });
    }

    if (record?.errors && typeof record.errors === 'object') {
      const fieldErrors = record.errors as Record<string, string[]>;
      const firstMessage = Object.values(fieldErrors)[0]?.[0];
      return new ApiError({
        status,
        kind: 'validation',
        message: firstMessage ?? 'Hay errores en el formulario.',
        fieldErrors,
      });
    }
  }

  return new ApiError({ status, kind: 'unknown', message: 'Ocurrió un error inesperado. Probá de nuevo.' });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await parseJsonSafe(response);

  if (!response.ok) {
    throw buildError(response.status, body);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
