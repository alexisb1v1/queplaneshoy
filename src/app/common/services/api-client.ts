/**
 * ApiClient
 * 
 * Helper centralizado para manejar todas las conexiones HTTP con el backend de NestJS.
 * Se encarga de inyectar las cabeceras estándar, gestionar la URL base y
 * capturar errores de red comunes.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: any,
    message?: string
  ) {
    super(message || `HTTP Error ${status}: ${statusText}`);
    this.name = 'ApiClientError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: any = null;
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

  // Si la respuesta no tiene contenido (204 No Content), retornar vacío
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  /**
   * Realiza una petición GET
   */
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    return handleResponse<T>(response);
  },

  /**
   * Realiza una petición POST
   */
  async post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse<T>(response);
  },

  /**
   * Realiza una petición PUT
   */
  async put<T>(path: string, body: any, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse<T>(response);
  },

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    return handleResponse<T>(response);
  },
};
