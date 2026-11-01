import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class VerifyEmailUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Ejecuta la verificación de correo electrónico con el token recibido
   *
   * @param token Token criptográfico de verificación
   * @returns ResultAsync con mensaje y usuario verificado o DomainError
   */
  execute(token: string): ResultAsync<{ message: string; user?: UserModel }, DomainError> {
    if (!token || !token.trim()) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Token no proporcionado')),
        () => new DomainError('El token de verificación es obligatorio', 'VAL_001')
      );
    }
    return this.authRepository.verifyEmail(token);
  }
}

