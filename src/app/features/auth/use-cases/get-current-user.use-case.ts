import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(): ResultAsync<UserModel, DomainError> {
    return this.authRepository.getCurrentUser();
  }
}
