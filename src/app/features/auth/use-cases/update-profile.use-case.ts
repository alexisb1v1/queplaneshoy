import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class UpdateProfileUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(data: Partial<UserModel>): ResultAsync<UserModel, DomainError> {
    return this.authRepository.updateProfile(data);
  }
}
