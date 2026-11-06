import { ResultAsync, ok, err } from 'neverthrow';
import { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';

/**
 * Claves de almacenamiento en localStorage para los tokens de sesión
 */
export const AUTH_TOKEN_KEY = 'qph_auth_token';
export const REFRESH_TOKEN_KEY = 'qph_refresh_token';

/**
 * Resuelve la URL base del API de manera dinámica e infalible:
 * - En navegador (cliente): Si el dominio no es localhost (ej. dev.queplanhoy.com o producción),
 *   utiliza siempre la ruta relativa '/api' gestionada por el proxy inverso (Caddy),
 *   evitando que variables inlined en build-time con localhost rompan las llamadas del cliente.
 * - En desarrollo local (localhost/127.0.0.1): apunta a 'http://localhost:3001/api'.
 * - En SSR (servidor Node): utiliza INTERNAL_API_URL o NEXT_PUBLIC_API_URL con fallback seguro.
 */
function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si estamos en un dominio real (despliegue dev/staging/producción en VPS con Caddy)
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api';
    }

    // Si estamos en desarrollo local en el navegador
    if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('undefined')) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    }

    return 'http://localhost:3001/api';
  }

  // Ejecución en Servidor (SSR)
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/+$/, '');
  }

  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('undefined')) {
    const configured = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    if (configured.startsWith('http://') || configured.startsWith('https://')) {
      return configured;
    }
  }

  return process.env.NODE_ENV === 'production'
    ? 'http://apiqueplaneshoy-dev:3001/api'
    : 'http://localhost:3001/api';
}

/**
 * Opciones avanzadas de petición para ApiClient
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /**
   * Tiempo límite en milisegundos antes de abortar la petición (por defecto 15000ms)
   */
  timeoutMs?: number;
  /**
   * Parámetros de consulta (query params) a serializar en la URL
   */
  params?: Record<string, string | number | boolean | undefined | null>;
  /**
   * Si es true, no inyecta el token Bearer en los encabezados
   */
  skipAuth?: boolean;
}

/**
 * Estructura estándar de error devuelta por NestJS
 */
interface NestErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
}

/**
 * Error tipado emitido por el cliente API
 */
export class ApiClientError extends Error {
  public readonly validationErrors?: string[];

  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    message?: string,
  ) {
    let resolvedMessage = message;
    let errors: string[] | undefined = undefined;

    if (!resolvedMessage && body && typeof body === 'object') {
      const nestError = body as NestErrorResponse;
      if (Array.isArray(nestError.message)) {
        errors = nestError.message;
        resolvedMessage = nestError.message.join('. ');
      } else if (typeof nestError.message === 'string') {
        resolvedMessage = nestError.message;
      }
    }

    super(resolvedMessage || `Error ${status}: ${statusText || 'Error en la petición'}`);
    this.name = 'ApiClientError';
    this.validationErrors = errors;
  }
}

/**
 * Mapea un error de ApiClient a un DomainError compatible con neverthrow
 */
export function mapApiErrorToDomainError(error: unknown): DomainError {
  if (error instanceof ApiClientError) {
    let code: string = ERROR_CODES.NETWORK_ERROR.code;
    if (error.status === 400) code = ERROR_CODES.VALIDATION_ERROR.code;
    else if (error.status === 401) code = ERROR_CODES.UNAUTHORIZED.code;
    else if (error.status === 403) code = ERROR_CODES.FORBIDDEN.code;
    else if (error.status === 404) code = ERROR_CODES.NOT_FOUND.code;
    else if (error.status === 409) code = ERROR_CODES.ALREADY_EXISTS.code;
    else if (error.status === 429) code = 'TOO_MANY_REQUESTS';
    else if (error.status >= 500) code = ERROR_CODES.INTERNAL_ERROR.code;

    return new DomainError(error.message, code, error);
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return new DomainError(
      ERROR_CODES.TIMEOUT_ERROR.message,
      ERROR_CODES.TIMEOUT_ERROR.code,
      error,
    );
  }

  return new DomainError(
    ERROR_CODES.NETWORK_ERROR.message,
    ERROR_CODES.NETWORK_ERROR.code,
    error,
  );
}

/**
 * Resuelve la URL completa agregando query params, con soporte para rutas relativas y absolutas
 */
function buildFullUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const baseUrl = resolveApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const combined = `${baseUrl}${cleanPath}`;

  let fullUrl: URL;
  if (/^https?:\/\//i.test(combined)) {
    fullUrl = new URL(combined);
  } else {
    // Si la URL es relativa (ej. /api/events/featured), usamos el origen del navegador
    const base = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost:3000';
    fullUrl = new URL(combined, base);
  }

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        fullUrl.searchParams.append(key, String(val));
      }
    });
  }

  return fullUrl.toString();
}

/**
 * Helper de respuesta HTTP
 */
async function processResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      try {
        errorBody = await response.text();
      } catch {
        errorBody = null;
      }
    }
    throw new ApiClientError(response.status, response.statusText, errorBody);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Promesa en vuelo para evitar múltiples solicitudes simultáneas de renovación de tokens
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Renueva el token de acceso usando la cookie HttpOnly administrada por el navegador
 */
async function performRefreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const url = buildFullUrl('/auth/refresh-token');
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        apiClient.clearTokens();
        return null;
      }

      const data = await response.json();
      if (data?.token) {
        apiClient.setToken(data.token);
        return data.token;
      }

      apiClient.clearTokens();
      return null;
    } catch {
      apiClient.clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Helper Centralizado de Comunicación HTTP con el Backend NestJS
 */
export const apiClient = {
  /**
   * Obtiene el token de autenticación (Access Token) guardado
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Guarda el token de autenticación (Access Token)
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  /**
   * Obtiene el Refresh Token (en modo Cookie HttpOnly es administrado por el navegador)
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Guarda el Refresh Token (mantenido por retrocompatibilidad)
   */
  setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /**
   * Elimina todos los tokens de autenticación de la sesión e invalida la cookie HttpOnly en el servidor
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('qph_user');
      try {
        fetch(buildFullUrl('/auth/logout'), {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
      } catch {}
    }
  },

  /**
   * Alias retrocompatible para eliminar sesión
   */
  clearToken(): void {
    this.clearTokens();
  },

  /**
   * Ejecuta una petición HTTP genérica con timeout, headers, token automático y reintento con refresh token
   */
  async request<T>(path: string, options: ApiRequestOptions = {}, isRetry = false): Promise<T> {
    const { timeoutMs = 15000, params, skipAuth, headers, ...fetchOptions } = options;
    const url = buildFullUrl(path, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        credentials: fetchOptions.credentials || 'include',
        headers: {
          ...requestHeaders,
          ...((headers as Record<string, string>) || {}),
        },
        signal: controller.signal,
      });

      // Si recibimos 401 y no es un reintento ni una ruta de login/register/refresh
      if (
        response.status === 401 &&
        !isRetry &&
        !skipAuth &&
        !path.includes('/auth/login') &&
        !path.includes('/auth/register') &&
        !path.includes('/auth/refresh-token')
      ) {
        const refreshedToken = await performRefreshToken();
        if (refreshedToken) {
          clearTimeout(timeoutId);
          // Reintentamos la petición original una única vez con el nuevo token
          return this.request<T>(path, options, true);
        }
      }

      return await processResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Petición GET
   */
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  /**
   * Petición POST
   */
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    } as ApiRequestOptions & { body?: string });
  },

  /**
   * Petición PUT
   */
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    } as ApiRequestOptions & { body?: string });
  },

  /**
   * Petición PATCH
   */
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    } as ApiRequestOptions & { body?: string });
  },

  /**
   * Petición DELETE
   */
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },

  /**
   * Ejecuta una petición y la encapsula directamente en un ResultAsync de neverthrow
   */
  requestResult<T>(requestPromise: Promise<T>): ResultAsync<T, DomainError> {
    return ResultAsync.fromPromise(requestPromise, mapApiErrorToDomainError);
  },
};
