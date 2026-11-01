/**
 * Diccionario de Códigos de Error Centralizado del Sistema Frontend
 * Siguiendo el estándar Clean Architecture Frontend (neverthrow)
 */
export const ERROR_CODES = {
  NETWORK_ERROR: {
    code: 'NET_001',
    message: 'Error de conexión con el servidor. Verifica tu conexión a internet.',
  },
  TIMEOUT_ERROR: {
    code: 'NET_002',
    message: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
  },
  NOT_FOUND: {
    code: 'RES_001',
    message: 'El recurso solicitado no fue encontrado.',
  },
  UNAUTHORIZED: {
    code: 'AUTH_001',
    message: 'No has iniciado sesión o tu sesión ha expirado.',
  },
  FORBIDDEN: {
    code: 'AUTH_003',
    message: 'No tienes permisos suficientes para realizar esta acción.',
  },
  VALIDATION_ERROR: {
    code: 'VAL_001',
    message: 'Los datos proporcionados son inválidos.',
  },
  ALREADY_EXISTS: {
    code: 'CONF_001',
    message: 'El registro ya existe en el sistema.',
  },
  INTERNAL_ERROR: {
    code: 'INT_001',
    message: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde.',
  },
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;

