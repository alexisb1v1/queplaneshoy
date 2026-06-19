import { ResultAsync } from 'neverthrow';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export abstract class AuthRepository {
  abstract login(email: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError>;
  abstract getCurrentUser(): ResultAsync<UserModel, DomainError>;
  abstract logout(): ResultAsync<void, DomainError>;
  abstract updateProfile(data: Partial<UserModel>): ResultAsync<UserModel, DomainError>;
  abstract changePassword(oldPassword: string, newPassword: string): ResultAsync<void, DomainError>;
}
