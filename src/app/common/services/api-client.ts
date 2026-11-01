import { ResultAsync, ok, err } from 'neverthrow';
import { DomainError } from '../errors/domain-error';
import { ERROR_CODES } from '../errors/error-codes';

/**
 * Clave de almacenamiento en localStorage para el token JWT
 */
export const AUTH_TOKEN_KEY = 'qph_auth_token';

/**
 * URL base del API con fallback al puerto 3001 por defecto
 */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/+$/, '');

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
 * Resuelve la URL completa agregando query params
 */
function buildFullUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = new URL(`${API_BASE_URL}${cleanPath}`);

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
 * Helper Centralizado de Comunicación HTTP con el Backend NestJS
 */
export const apiClient = {
  /**
   * Obtiene el token de autenticación guardado
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Guarda el token de autenticación
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  /**
   * Elimina el token de autenticación
   */
  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  /**
   * Ejecuta una petición HTTP genérica con timeout, headers y token automático
   */
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
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
        headers: {
          ...requestHeaders,
          ...(headers as Record<string, string> || {}),
        },
        signal: controller.signal,
      });

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
