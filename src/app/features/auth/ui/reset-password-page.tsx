'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyResetTokenUseCase, resetPasswordUseCase } from '../index';

type VerificationState = 'checking' | 'valid' | 'invalid';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';

  // Estados de verificación y formulario
  const [tokenStatus, setTokenStatus] = useState<VerificationState>('checking');
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Verificar validez del token en Redis al montar
  useEffect(() => {
    if (!token.trim()) {
      setTokenStatus('invalid');
      return;
    }

    let isMounted = true;

    verifyResetTokenUseCase.execute(token).match(
      (data) => {
        if (!isMounted) return;
        if (data.valid) {
          setTokenStatus('valid');
          if (data.maskedEmail) setMaskedEmail(data.maskedEmail);
        } else {
          setTokenStatus('invalid');
        }
      },
      () => {
        if (!isMounted) return;
        setTokenStatus('invalid');
      }
    );

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Cálculo de fuerza de contraseña
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasCase = hasUpper && hasLower;
  const hasNumberOrSymbol = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  let strengthScore = 0;
  if (hasMinLength) strengthScore++;
  if (hasCase) strengthScore++;
  if (hasNumberOrSymbol) strengthScore++;
  if (newPassword.length >= 12 && hasCase && hasNumberOrSymbol) strengthScore++;

  const isPasswordMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isFormValid = hasMinLength && hasCase && hasNumberOrSymbol && isPasswordMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isFormValid) {
      setFormError('Por favor verifica que la contraseña cumpla todos los requisitos de seguridad y que ambas contraseñas coincidan.');
      return;
    }

    setIsLoading(true);

    const result = await resetPasswordUseCase.execute(token, newPassword);

    result.match(
      () => {
        setIsLoading(false);
        setIsSuccess(true);

        // Redirigir al login después de 2.2 segundos con confirmación
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 2200);
      },
      (error) => {
        setIsLoading(false);
        if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'TOO_MANY_REQUESTS') {
          setFormError('Has superado el número de intentos permitidos. Por seguridad, espera unos minutos antes de volver a intentar.');
        } else {
          setFormError(error.message || 'No se pudo restablecer la contraseña. Es posible que el enlace haya expirado.');
        }
      }
    );
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* ======================================================== */}
      {/* Lateral Visual Editorial (Idéntico a /login)              */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-deep-slate select-none">
        <div className="absolute inset-0 z-0">
          <img
            alt="Concierto queplaneshoy"
            className="w-full h-full object-cover scale-105 transition-transform duration-[20s] ease-out hover:scale-100"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3rZ6yKDKqCPTUTce3UT_5EUR2cYbMqYZCPtae38ukfPAhoUvEIfVv2v_cRuWSv6Jse0F8k4YH6nf2FSP_iD4TuuzSNxBd2RGnGn_nKkQMWbgGXx5R1qVLfBNDKPmsVrpS9eEqmysP05fNo_tzC0gf-I9gTI_cjTljXnk-L7RZlkrGcLOCXP1mm42HZa5d-hoVb1JuEVExX9t9yE_B3moZGWGfSX8ZKVS3H2cDzXpYxGgfhwzhWyosc4gQiwqrO9AW46PugAsG7_Pm"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep-slate/50 via-deep-slate/75 to-deep-slate/95 z-10" />
        <div className="relative z-20 flex flex-col justify-between p-16 w-full text-white">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-90 transition-opacity">
              <img src="/logo-qph.svg" className="w-10 h-10 rounded-md object-contain" alt="queplaneshoy logo" />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </Link>
            <h1 className="text-4xl font-extrabold leading-tight mb-6">Tu seguridad es nuestra prioridad.</h1>
            <p className="text-lg text-platinum-silver max-w-md leading-relaxed">
              Configura una nueva clave segura para continuar comprando tus tickets y gestionando tus eventos sin interrupciones.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                className="h-10 w-10 rounded-full border-2 border-deep-slate object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsB4QECnOqBB0luIRDp6Yr_fgydETOlm_ixTXNVwzA3AlYHcsc4brxDcI1octH5ErEw6SXvjndeKgdxy2NgOoJQeqn7KINoUXIS3ojXCJ7_mwJRy9L-Y5GkCVZSI5KLZmnhiA4R0vjYUK80Q64_gfu4K3B270_WVtRNrQCk023bCpSp9wgnB5mQh2epdvJJKJJjRESSUtNiQVPUcMdSOIXOQw2QjiHT8hKBSNxa05Z22hVam-ydMABH462nO9mjSGyBYHVkinbagNv"
                alt="Usuario 1"
              />
              <img
                className="h-10 w-10 rounded-full border-2 border-deep-slate object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbHUNJLUcAVyhvkQrx4WsUBAOwS68Wbp6rhnZ8c9gMU8oZI0Me0Wau0XQurAFOK8aSACfYbLj8_b5HcgRdOugouvtLRxK1ZNe5IHAX1YyXXo-BBe--mpI_QlQ-h1ELNKY86fF-nLDv8n3oHLxN-A0g7LQqCYXexZTmr5DHSTe5dUUA36uyXkqqU01FDem119IhOGROhUZ6LwZW9Yusrs7zWm042nQsrem1SVuYO8-WuPd0wu0AuSQs6j9dpVRPTteDDMjBdkYVib2Y"
                alt="Usuario 2"
              />
              <img
                className="h-10 w-10 rounded-full border-2 border-deep-slate object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfKcVonanyiTYDOv5qlp1_C94iKUoBnwMVYannlVsd-PDecAVsU92CuZqE3-UkrIQ-d6kWA0RhM4BZ2xDKspNqCGriew8C19rj8oxmTOzR0vNUX1ezQyMJUhTqV83RL5Oj6tF-3MoFH57ZGtYeHnvjbBHehaFpO2DAjUFjGCmEWAJmxgO4ddCWyPJyoXwoUDWW5lVtQiSXWbo-KD_gaCz1mHaB9SsU0lkNDU8BA7CcWkMX5pcDBgc7AFaadzhvxVVcpS-R68Mv1Ncj"
                alt="Usuario 3"
              />
            </div>
            <span className="text-sm font-semibold text-platinum-silver">
              +50k usuarios ya planean su hoy
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Lado Derecho: Formulario de Nueva Contraseña (Estilo /login) */}
      {/* ======================================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12 lg:p-16">
        <div className="max-w-md w-full">
          {/* Logo Móvil */}
          <div className="lg:hidden mb-8 flex justify-start">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
              <span className="font-extrabold text-xl tracking-tight text-deep-slate">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </Link>
          </div>

          {/* ==================================================== */}
          {/* CASO A: Verificando token (Carga)                     */}
          {/* ==================================================== */}
          {tokenStatus === 'checking' && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center text-electric-indigo mb-4 animate-pulse">
                <span className="material-symbols-outlined text-2xl animate-spin">refresh</span>
              </div>
              <h2 className="text-xl font-extrabold text-deep-slate mb-2">Validando enlace de seguridad...</h2>
              <p className="text-xs text-on-surface-variant max-w-xs">
                Verificando la autenticidad y el tiempo de vigencia de tu enlace.
              </p>
            </div>
          )}

          {/* ==================================================== */}
          {/* CASO B: Token inválido o expirado                    */}
          {/* ==================================================== */}
          {tokenStatus === 'invalid' && (
            <div className="py-8 text-center flex flex-col items-center justify-center animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
                <span className="material-symbols-outlined text-3xl">link_off</span>
              </div>
              <h1 className="text-2xl font-extrabold text-deep-slate mb-2 tracking-tight">
                Enlace expirado o no válido
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6 max-w-sm">
                Por razones de seguridad, los enlaces para restablecer contraseñas son válidos durante <strong>15 minutos</strong> y solo pueden ser utilizados una única vez.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href="/forgot-password"
                  className="flex-1 py-3.5 px-5 rounded-xl bg-electric-indigo hover:bg-primary text-white font-semibold text-sm shadow-lg shadow-electric-indigo/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  <span>Solicitar nuevo enlace</span>
                </Link>
                <Link
                  href="/login"
                  className="py-3.5 px-5 rounded-xl bg-surface-gray hover:bg-outline-variant/20 text-deep-slate font-semibold text-sm transition-all flex items-center justify-center cursor-pointer"
                >
                  Volver al login
                </Link>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* CASO C: Token válido -> Formulario de Restablecimiento */}
          {/* ==================================================== */}
          {tokenStatus === 'valid' && (
            <div>
              {/* Encabezado */}
              <div className="mb-8 text-left">
                <h2 className="text-3xl font-extrabold text-deep-slate mb-2">Nueva contraseña</h2>
                <p className="text-on-surface-variant text-sm">
                  {maskedEmail ? (
                    <>
                      Actualizando credenciales para <strong>{maskedEmail}</strong>. Crea una contraseña segura para tu cuenta.
                    </>
                  ) : (
                    'Crea una nueva contraseña segura para volver a entrar a tu cuenta.'
                  )}
                </p>
              </div>

              {/* Feedback de Éxito al finalizar */}
              {isSuccess ? (
                <div className="p-6 rounded-2xl bg-secondary-container text-on-secondary-container flex flex-col items-center text-center gap-3 shadow-xs border border-electric-indigo/20 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-electric-indigo text-white flex items-center justify-center mb-1">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      task_alt
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-deep-slate">¡Contraseña restablecida!</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs">
                    Tu contraseña ha sido actualizada con éxito. Te estamos redirigiendo a la pantalla de inicio de sesión...
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="py-2.5 px-5 rounded-xl bg-electric-indigo text-white text-xs font-semibold shadow-md hover:bg-primary transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Iniciar sesión ahora</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Campo 1: Nueva Contraseña */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="new-password">
                        Nueva contraseña
                      </label>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          newPassword.length === 0
                            ? 'text-platinum-silver'
                            : strengthScore <= 1
                            ? 'text-rose-500'
                            : strengthScore === 2
                            ? 'text-amber-500'
                            : strengthScore === 3
                            ? 'text-emerald-500'
                            : 'text-electric-indigo'
                        }`}
                      >
                        {newPassword.length === 0
                          ? 'Esperando clave'
                          : strengthScore <= 1
                          ? 'Débil'
                          : strengthScore === 2
                          ? 'Media'
                          : strengthScore === 3
                          ? 'Fuerte'
                          : 'Muy Segura'}
                      </span>
                    </div>

                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                        lock
                      </span>
                      <input
                        className="w-full pl-10 pr-12 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                        id="new-password"
                        name="new-password"
                        placeholder="Mínimo 8 caracteres"
                        required
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum-silver hover:text-on-surface-variant p-1 cursor-pointer"
                        aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        <span className="material-symbols-outlined select-none text-[20px]">
                          {showNewPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {/* 4 Barras de Fortaleza */}
                    <div className="pt-1.5">
                      <div className="grid grid-cols-4 gap-2">
                        <div
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            strengthScore >= 1
                              ? strengthScore === 1
                                ? 'bg-rose-500'
                                : strengthScore === 2
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                              : 'bg-surface-gray'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            strengthScore >= 2
                              ? strengthScore === 2
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                              : 'bg-surface-gray'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            strengthScore >= 3 ? 'bg-emerald-500' : 'bg-surface-gray'
                          }`}
                        />
                        <div
                          className={`h-1.5 rounded-full transition-colors duration-300 ${
                            strengthScore >= 4 ? 'bg-electric-indigo' : 'bg-surface-gray'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="pt-2 space-y-1 text-xs text-on-surface-variant">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {hasMinLength ? 'check_circle' : 'circle'}
                        </span>
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasCase ? 'text-emerald-600 font-semibold' : ''}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {hasCase ? 'check_circle' : 'circle'}
                        </span>
                        <span>Al menos una mayúscula y una minúscula</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? 'text-emerald-600 font-semibold' : ''}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {hasNumberOrSymbol ? 'check_circle' : 'circle'}
                        </span>
                        <span>Al menos un número o símbolo especial</span>
                      </div>
                    </div>
                  </div>

                  {/* Campo 2: Confirmar Contraseña */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="confirm-password">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                        lock
                      </span>
                      <input
                        className="w-full pl-10 pr-12 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                        id="confirm-password"
                        name="confirm-password"
                        placeholder="Repite tu nueva contraseña"
                        required
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum-silver hover:text-on-surface-variant p-1 cursor-pointer"
                        aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
                      >
                        <span className="material-symbols-outlined select-none text-[20px]">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {isPasswordMatch && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium mt-1">
                        <span className="material-symbols-outlined text-sm">check</span>
                        Las contraseñas coinciden
                      </p>
                    )}
                    {isPasswordMismatch && (
                      <p className="text-xs text-rose-500 flex items-center gap-1 font-medium mt-1">
                        <span className="material-symbols-outlined text-sm">close</span>
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>

                  {/* Error de Formulario */}
                  {formError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 shadow-xs">
                      <span className="material-symbols-outlined text-rose-600 text-lg flex-shrink-0 mt-0.5">error</span>
                      <p className="font-semibold leading-relaxed">{formError}</p>
                    </div>
                  )}

                  {/* Botón Restablecer */}
                  <div className="pt-2">
                    <button
                      className="w-full py-4 rounded-xl text-white font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg bg-electric-indigo shadow-electric-indigo/25 hover:bg-primary active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      type="submit"
                      disabled={!isFormValid || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                          <span>Actualizando contraseña...</span>
                        </>
                      ) : (
                        <>
                          <span>Restablecer contraseña</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Enlace Cancelar */}
                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors"
                    >
                      Cancelar y volver al inicio de sesión
                    </Link>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Legal */}
          <div className="mt-12 text-center text-[11px] text-platinum-silver font-semibold">
            © 2026 queplaneshoy. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}
