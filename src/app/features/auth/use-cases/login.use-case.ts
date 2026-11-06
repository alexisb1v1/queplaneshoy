import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(email: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    if (!email || !password) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Email and password are required')),
        () => new DomainError('El correo y la contraseña son obligatorios', 'VALIDATION_ERROR')
      );
    }
    return this.authRepository.login(email, password);
  }
}
