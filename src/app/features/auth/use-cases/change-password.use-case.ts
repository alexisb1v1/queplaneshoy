import { errAsync, ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class ChangePasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Valida reglas básicas de negocio y solicita al repositorio el cambio de contraseña.
   */
  execute(oldPassword: string, newPassword: string): ResultAsync<void, DomainError> {
    if (!oldPassword || !newPassword) {
      return errAsync(new DomainError('Ambas contraseñas son obligatorias', 'VALIDATION_ERROR'));
    }
    if (newPassword.length < 6) {
      return errAsync(
        new DomainError('La nueva contraseña debe tener al menos 6 caracteres', 'VALIDATION_ERROR')
      );
    }
    if (oldPassword === newPassword) {
      return errAsync(
        new DomainError('La nueva contraseña debe ser diferente a la actual', 'VALIDATION_ERROR')
      );
    }
    return this.authRepository.changePassword(oldPassword, newPassword);
  }
}
