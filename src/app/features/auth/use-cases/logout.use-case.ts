import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): ResultAsync<void, DomainError> {
    return this.authRepository.logout();
  }
}
