import { ResultAsync } from 'neverthrow';
import { AuthRepository, BecomeOrganizerParams } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class BecomeOrganizerUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(params: BecomeOrganizerParams): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    return this.authRepository.becomeOrganizer(params);
  }
}

