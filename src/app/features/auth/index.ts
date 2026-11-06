import { AuthRepositoryImpl } from './repositories/auth.repository.impl';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { GetCurrentUserUseCase } from './use-cases/get-current-user.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { ResendVerificationUseCase } from './use-cases/resend-verification.use-case';
import { BecomeOrganizerUseCase } from './use-cases/become-organizer.use-case';

// Instanciamos la infraestructura
const authRepository = new AuthRepositoryImpl();

// Exportamos las instancias de casos de uso para que la UI las consuma
export const loginUseCase = new LoginUseCase(authRepository);
export const registerUseCase = new RegisterUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const updateProfileUseCase = new UpdateProfileUseCase(authRepository);
export const changePasswordUseCase = new ChangePasswordUseCase(authRepository);
export const verifyEmailUseCase = new VerifyEmailUseCase(authRepository);
export const resendVerificationUseCase = new ResendVerificationUseCase(authRepository);
export const becomeOrganizerUseCase = new BecomeOrganizerUseCase(authRepository);
