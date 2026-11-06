import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class ChangePasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(oldPassword: string, newPassword: string): ResultAsync<void, DomainError> {
    if (!oldPassword || !newPassword) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Passwords are required')),
        () => new DomainError('Ambas contraseñas son obligatorias', 'VALIDATION_ERROR')
      );
    }
    return this.authRepository.changePassword(oldPassword, newPassword);
  }
}
