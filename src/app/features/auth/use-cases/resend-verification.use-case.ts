import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class ResendVerificationUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Solicita el reenvío de un correo de verificación para una cuenta existente
   *
   * @param email Correo electrónico del usuario
   * @returns ResultAsync con mensaje de confirmación o DomainError
   */
  execute(email: string): ResultAsync<{ message: string }, DomainError> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Email vacío')),
        () => new DomainError('El correo electrónico es obligatorio', 'VAL_001')
      );
    }
    return this.authRepository.resendVerification(trimmed);
  }
}

