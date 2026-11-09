import { ResultAsync } from 'neverthrow';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export interface BecomeOrganizerParams {
  organizerName: string;
  organizerDocumentType: string;
  organizerDocumentNumber: string;
  organizerPhone: string;
  organizerLogoUrl?: string;
}

export abstract class AuthRepository {
  abstract login(email: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError>;
  abstract register(fullName: string, email: string, phone: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError>;
  abstract getCurrentUser(): ResultAsync<UserModel, DomainError>;
  abstract logout(): ResultAsync<void, DomainError>;
  abstract updateProfile(data: Partial<UserModel>): ResultAsync<UserModel, DomainError>;
  abstract changePassword(oldPassword: string, newPassword: string): ResultAsync<void, DomainError>;
  abstract verifyEmail(token: string): ResultAsync<{ message: string; user?: UserModel }, DomainError>;
  abstract resendVerification(email: string): ResultAsync<{ message: string }, DomainError>;
  abstract requestPasswordReset(email: string): ResultAsync<{ message: string }, DomainError>;
  abstract verifyResetToken(token: string): ResultAsync<{ valid: boolean; maskedEmail?: string }, DomainError>;
  abstract resetPassword(token: string, newPassword: string): ResultAsync<{ message: string }, DomainError>;
  abstract becomeOrganizer(params: BecomeOrganizerParams): ResultAsync<{ token: string; user: UserModel }, DomainError>;
}
