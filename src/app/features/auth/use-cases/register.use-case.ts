import { ResultAsync } from 'neverthrow';
import { AuthRepository } from '../repositories/auth.repository';
import { UserModel } from '../models/user.model';
import { DomainError } from '../../../common/errors/domain-error';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(fullName: string, email: string, phone: string, password: string): ResultAsync<{ token: string; user: UserModel }, DomainError> {
    if (!fullName || !email || !phone || !password) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('All fields are required')),
        () => new DomainError('Todos los campos son obligatorios', 'VALIDATION_ERROR')
      );
    }
    if (password.length < 8) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Password must be at least 8 characters')),
        () => new DomainError('La contraseña debe tener al menos 8 caracteres', 'VALIDATION_ERROR')
      );
    }
    return this.authRepository.register(fullName, email, phone, password);
  }
}
