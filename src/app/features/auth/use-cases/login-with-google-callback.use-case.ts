import { errAsync, ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class LoginWithGoogleCallbackUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Procesa los parámetros devueltos por Google en /auth/google/callback para autenticar al usuario.
   */
  execute(
    code: string,
    state: string
  ): ResultAsync<{ token: string; user: UserModel; redirectTo: string }, DomainError> {
    if (!code?.trim() || !state?.trim()) {
      return errAsync(
        new DomainError(
          'Faltan parámetros de verificación de Google. Intenta iniciar sesión nuevamente.',
          'VALIDATION_ERROR'
        )
      );
    }

    return this.authRepository.loginWithGoogleCallback(code, state);
  }
}
