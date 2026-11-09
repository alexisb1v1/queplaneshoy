import { ResultAsync, ok, err } from 'neverthrow';
import { AuthRepository, BecomeOrganizerParams } from './auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';
import { apiClient } from '../../../common/services/api-client';

const USER_STORAGE_KEY = 'qph_user';

interface AuthResponseDto {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    role: string;
    avatarUrl?: string;
    isOrganizer?: boolean;
    organizerName?: string | null;
    organizerDocumentType?: string | null;
    organizerDocumentNumber?: string | null;
    organizerLogoUrl?: string | null;
    emailVerifiedAt?: string | Date | null;
    createdAt?: string | Date;
  };
  message?: string;
}

/**
 * Normaliza los datos del usuario devueltos por la API hacia el modelo de dominio
 */
function mapAuthUserToModel(rawUser: AuthResponseDto['user']): UserModel {
  const firstName = rawUser.firstName || (rawUser.name ? rawUser.name.split(' ')[0] : 'Usuario');
  const lastName = rawUser.lastName || (rawUser.name ? rawUser.name.split(' ').slice(1).join(' ') : '');

  return {
    id: rawUser.id,
    email: rawUser.email,
    firstName,
    lastName,
    phone: rawUser.phone,
    avatarUrl: rawUser.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnqXVnsmBrHy9Kd7cWWb0PaButWFj7ieVvda4KQ6Gzku7NMPcNGxi_Cq2UC1DSwk2r8_qL2ZzWM5Lq_9BFFEpeMNF11zZiUQtr4JjMsCuraW_kcZXdxL4ftivhWz3SLrtagNNngRrHMt2Gwg553z8hX80YVC9_BRRQrviCyXSypPSe4atADFZpigLRh7RNFotpC4cdb05tB9_JhjTFs4nsISy6vQFzA78k7jIKy4CTPzUqYunCJ3yBvoR8hOOwXModWn6WconFu2O9',
    role: rawUser.role || 'customer',
    isOrganizer: rawUser.isOrganizer,
    organizerName: rawUser.organizerName,
    organizerDocumentType: rawUser.organizerDocumentType,
    organizerDocumentNumber: rawUser.organizerDocumentNumber,
    organizerLogoUrl: rawUser.organizerLogoUrl,
    emailVerifiedAt: rawUser.emailVerifiedAt,
    createdAt: rawUser.createdAt,
  };
}

export class AuthRepositoryImpl implements AuthRepository {
  /**
   * Inicia sesión con correo y contraseña
   */
  login(email: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    return apiClient
      .requestResult<AuthResponseDto>(
        apiClient.post('/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        })
      )
      .map((res) => {
        const userModel = mapAuthUserToModel(res.user);
        apiClient.setToken(res.token);

        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userModel));
        }

        return { token: res.token, user: userModel };
      });
  }

  /**
   * Registra un nuevo usuario en la plataforma validando todos los campos requeridos
   */
  register(
    fullName: string,
    email: string,
    phone: string,
    password: string
  ): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    const payload = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim() ? phone.trim() : undefined,
    };

    return apiClient
      .requestResult<AuthResponseDto>(
        apiClient.post('/auth/register', payload)
      )
      .map((res) => {
        const userModel = mapAuthUserToModel(res.user);
        apiClient.setToken(res.token);

        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userModel));
        }

        return { token: res.token, user: userModel };
      });
  }

  /**
   * Obtiene el perfil del usuario autenticado actual desde el backend
   */
  getCurrentUser(): ResultAsync<UserModel, DomainError> {
    const token = apiClient.getToken();

    if (!token) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('No token found')),
        () => new DomainError('No has iniciado sesión', 'AUTH_001')
      );
    }

    return apiClient
      .requestResult<AuthResponseDto['user']>(apiClient.get('/auth/me'))
      .map((userDto) => {
        const userModel = mapAuthUserToModel(userDto);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userModel));
        }
        return userModel;
      })
      .orElse((error) => {
        // Si la sesión no es válida, limpiamos el token local
        if (error.code === 'AUTH_001') {
          apiClient.clearToken();
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
        return err(error);
      });
  }

  /**
   * Cierra la sesión activa
   */
  logout(): ResultAsync<void, DomainError> {
    return ResultAsync.fromPromise(
      Promise.resolve().then(() => {
        apiClient.clearTokens();
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }),
      (error) => new DomainError('Fallo al cerrar sesión', 'LOGOUT_ERROR', error)
    );
  }

  /**
   * Actualiza los datos de perfil del usuario
   */
  updateProfile(data: Partial<UserModel>): ResultAsync<UserModel, DomainError> {
    return apiClient
      .requestResult<AuthResponseDto['user']>(apiClient.put('/auth/profile', data))
      .map((userDto) => {
        const userModel = mapAuthUserToModel(userDto);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userModel));
        }
        return userModel;
      });
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(oldPassword: string, newPassword: string): ResultAsync<void, DomainError> {
    return apiClient.requestResult<void>(
      apiClient.post('/auth/change-password', { oldPassword, newPassword })
    );
  }

  /**
   * Verifica la dirección de correo electrónico utilizando el token firmado
   */
  verifyEmail(token: string): ResultAsync<{ message: string; user?: UserModel }, DomainError> {
    return apiClient
      .requestResult<{ message: string; token?: string; user?: AuthResponseDto['user'] }>(
        apiClient.post('/auth/verify-email', { token: token.trim() })
      )
      .map((res) => {
        let userModel: UserModel | undefined;
        if (res.user) {
          userModel = mapAuthUserToModel(res.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userModel));
          }
        }
        if (res.token) {
          apiClient.setToken(res.token);
        }
        return {
          message: res.message || 'Correo verificado exitosamente',
          user: userModel,
        };
      });
  }

  /**
   * Solicita el reenvío del correo de verificación
   */
  resendVerification(email: string): ResultAsync<{ message: string }, DomainError> {
    return apiClient
      .requestResult<{ message: string }>(
        apiClient.post('/auth/resend-verification', {
          email: email.trim().toLowerCase(),
        })
      )
      .map((res) => ({
        message: res.message || 'Correo de verificación reenviado exitosamente',
      }));
  }

  /**
   * Solicita el enlace de recuperación de contraseña
   */
  requestPasswordReset(email: string): ResultAsync<{ message: string }, DomainError> {
    return apiClient
      .requestResult<{ message: string }>(
        apiClient.post('/auth/forgot-password', {
          email: email.trim().toLowerCase(),
        })
      )
      .map((res) => ({
        message:
          res.message ||
          'Si el correo electrónico está registrado, recibirás un enlace para restablecer tu contraseña.',
      }));
  }

  /**
   * Verifica si un token efímero de recuperación sigue vigente
   */
  verifyResetToken(token: string): ResultAsync<{ valid: boolean; maskedEmail?: string }, DomainError> {
    return apiClient.requestResult<{ valid: boolean; maskedEmail?: string }>(
      apiClient.get(`/auth/verify-reset-token?token=${encodeURIComponent(token.trim())}`)
    );
  }

  /**
   * Restablece la contraseña definitiva con el token efímero
   */
  resetPassword(token: string, newPassword: string): ResultAsync<{ message: string }, DomainError> {
    return apiClient
      .requestResult<{ message: string }>(
        apiClient.post('/auth/reset-password', {
          token: token.trim(),
          newPassword,
        })
      )
      .map((res) => ({
        message:
          res.message ||
          'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.',
      }));
  }

  /**
   * Activa el perfil de organizador para el usuario autenticado
   */
  becomeOrganizer(params: BecomeOrganizerParams): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    return apiClient
      .requestResult<AuthResponseDto>(
        apiClient.post('/auth/become-organizer', params)
      )
      .map((res) => {
        const userModel = mapAuthUserToModel(res.user);
        apiClient.setToken(res.token);

        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userModel));
        }

        return { token: res.token, user: userModel };
      });
  }
}
