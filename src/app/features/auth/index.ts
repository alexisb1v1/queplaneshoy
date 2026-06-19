import { AuthRepositoryImpl } from './repositories/auth.repository.impl';
import { LoginUseCase } from './use-cases/login.use-case';
import { GetCurrentUserUseCase } from './use-cases/get-current-user.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case';

// Instanciamos la infraestructura
const authRepository = new AuthRepositoryImpl();

// Exportamos las instancias de casos de uso para que la UI las consuma
export const loginUseCase = new LoginUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const updateProfileUseCase = new UpdateProfileUseCase(authRepository);
export const changePasswordUseCase = new ChangePasswordUseCase(authRepository);
