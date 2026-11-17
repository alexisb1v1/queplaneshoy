import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class ResetPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(token: string, newPassword: string): ResultAsync<{ message: string }, DomainError> {
    return this.authRepository.resetPassword(token, newPassword);
  }
}

