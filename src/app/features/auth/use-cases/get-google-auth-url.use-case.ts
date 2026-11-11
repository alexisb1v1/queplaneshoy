import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class GetGoogleAuthUrlUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Solicita al backend la URL oficial de Google OAuth con protección CSRF.
   */
  execute(redirectTo?: string): ResultAsync<{ url: string }, DomainError> {
    return this.authRepository.getGoogleAuthUrl(redirectTo);
  }
}
