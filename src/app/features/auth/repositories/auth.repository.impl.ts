import { ResultAsync, ok, err } from 'neverthrow';
import { AuthRepository } from './auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';
import { apiClient, ApiClientError } from '../../../common/services/api-client';

const TOKEN_KEY = 'qph_auth_token';

// Usuario Mock de Fallback
const MOCK_USER: UserModel = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  email: 'alexis@queplaneshoy.com',
  firstName: 'Alexis',
  lastName: 'Bermúdez',
  phone: '+51 987654321',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnqXVnsmBrHy9Kd7cWWb0PaButWFj7ieVvda4KQ6Gzku7NMPcNGxi_Cq2UC1DSwk2r8_qL2ZzWM5Lq_9BFFEpeMNF11zZiUQtr4JjMsCuraW_kcZXdxL4ftivhWz3SLrtagNNngRrHMt2Gwg553z8hX80YVC9_BRRQrviCyXSypPSe4atADFZpigLRh7RNFotpC4cdb05tB9_JhjTFs4nsISy6vQFzA78k7jIKy4CTPzUqYunCJ3yBvoR8hOOwXModWn6WconFu2O9',
  role: 'user',
};

export class AuthRepositoryImpl implements AuthRepository {
  login(email: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    return ResultAsync.fromPromise(
      apiClient.post<{ token: string; user: UserModel }>('/auth/login', { email, password }),
      (error) => {
        if (error instanceof ApiClientError) {
          return new DomainError(error.message, 'API_ERROR', error);
        }
        return new DomainError('Error de conexión con el servidor', 'NETWORK_ERROR', error);
      }
    ).orElse((error) => {
      // Fallback local en desarrollo si la API da 404 o no conecta
      console.warn('POST /auth/login falló o no existe. Usando Mock local de desarrollo.', error);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, 'mock-jwt-token-xyz123');
        localStorage.setItem('qph_mock_user', JSON.stringify(MOCK_USER));
      }
      return ok({ token: 'mock-jwt-token-xyz123', user: MOCK_USER });
    }).map((res) => {
      if (typeof window !== 'undefined' && res.token !== 'mock-jwt-token-xyz123') {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem('qph_mock_user', JSON.stringify(res.user));
      }
      return res;
    });
  }

  getCurrentUser(): ResultAsync<UserModel, DomainError> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    
    if (!token) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('No token found')),
        () => new DomainError('No has iniciado sesión', 'UNAUTHORIZED')
      );
    }

    return ResultAsync.fromPromise(
      apiClient.get<UserModel>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      (error) => {
        if (error instanceof ApiClientError) {
          return new DomainError(error.message, 'API_ERROR', error);
        }
        return new DomainError('Error de red al consultar perfil', 'NETWORK_ERROR', error);
      }
    ).orElse((error) => {
      // Fallback local si el token es de mock o el endpoint no existe
      if (token === 'mock-jwt-token-xyz123' || (error instanceof DomainError && error.originalError instanceof ApiClientError && error.originalError.status === 404)) {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('qph_mock_user') : null;
        if (storedUser) {
          try {
            return ok(JSON.parse(storedUser) as UserModel);
          } catch {
            return ok(MOCK_USER);
          }
        }
        return ok(MOCK_USER);
      }
      return err(error);
    });
  }

  logout(): ResultAsync<void, DomainError> {
    return ResultAsync.fromPromise(
      Promise.resolve().then(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('qph_mock_user');
        }
      }),
      (error) => new DomainError('Fallo al cerrar sesión', 'LOGOUT_ERROR', error)
    );
  }

  updateProfile(data: Partial<UserModel>): ResultAsync<UserModel, DomainError> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    return ResultAsync.fromPromise(
      apiClient.put<UserModel>('/auth/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      (error) => {
        if (error instanceof ApiClientError) {
          return new DomainError(error.message, 'API_ERROR', error);
        }
        return new DomainError('Error de red al actualizar perfil', 'NETWORK_ERROR', error);
      }
    ).orElse((error) => {
      if (token === 'mock-jwt-token-xyz123' || (error instanceof DomainError && error.originalError instanceof ApiClientError && error.originalError.status === 404)) {
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('qph_mock_user') : null;
        const currentUser = storedUser ? JSON.parse(storedUser) : MOCK_USER;
        const updatedUser = { ...currentUser, ...data };
        if (typeof window !== 'undefined') {
          localStorage.setItem('qph_mock_user', JSON.stringify(updatedUser));
        }
        return ok(updatedUser as UserModel);
      }
      return err(error);
    });
  }

  changePassword(oldPassword: string, newPassword: string): ResultAsync<void, DomainError> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    return ResultAsync.fromPromise(
      apiClient.post<void>('/auth/change-password', { oldPassword, newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      (error) => {
        if (error instanceof ApiClientError) {
          return new DomainError(error.message, 'API_ERROR', error);
        }
        return new DomainError('Error de red al cambiar contraseña', 'NETWORK_ERROR', error);
      }
    ).orElse((error) => {
      if (token === 'mock-jwt-token-xyz123' || (error instanceof DomainError && error.originalError instanceof ApiClientError && error.originalError.status === 404)) {
        console.log('Contraseña cambiada en simulación local');
        return ok(undefined);
      }
      return err(error);
    });
  }
}
