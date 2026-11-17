import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class VerifyResetTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(token: string): ResultAsync<{ valid: boolean; maskedEmail?: string }, DomainError> {
    return this.authRepository.verifyResetToken(token);
  }
}

