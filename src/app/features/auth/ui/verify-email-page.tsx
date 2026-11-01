'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailUseCase, resendVerificationUseCase } from '../index';

type VerificationState = 'loading' | 'success' | 'error' | 'no_token';

export default function VerifyEmailPageComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'no_token');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState<string>('');
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState('no_token');
      return;
    }

    let isMounted = true;

    verifyEmailUseCase.execute(token).match(
      (data) => {
        if (!isMounted) return;
        setState('success');
        setFeedbackMessage(data.message || 'Tu correo electrónico ha sido verificado con éxito.');
      },
      (error) => {
        if (!isMounted) return;
        setState('error');
        setFeedbackMessage(error.message || 'El enlace de verificación es inválido o ha caducado.');
      }
    );

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendSuccess(false);

    if (!resendEmail.trim()) {
      setResendError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setIsResending(true);

    const result = await resendVerificationUseCase.execute(resendEmail.trim().toLowerCase());

    result.match(
      (data) => {
        setIsResending(false);
        setResendSuccess(true);
        setFeedbackMessage(data.message || 'Nuevo correo de verificación enviado.');
      },
      (error) => {
        setIsResending(false);
        setResendError(error.message || 'No se pudo reenviar el correo. Inténtalo de nuevo.');
      }
    );
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Logo Header */}
      <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
        <img src="/logo-qph.svg" className="w-10 h-10 rounded-md object-contain" alt="queplaneshoy logo" />
        <span className="font-extrabold text-2xl tracking-tight text-deep-slate">
          queplanes<span className="text-electric-indigo">hoy</span>
        </span>
      </div>

      {/* Card Central */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-surface-variant shadow-xl text-center relative overflow-hidden">
        
        {/* =========================================================================
            ESTADO 1: CARGANDO / VERIFICANDO
           ========================================================================= */}
        {state === 'loading' && (
          <div className="py-8 space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-electric-indigo/10 text-electric-indigo mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl animate-spin">
                sync
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-deep-slate">Verificando tu cuenta</h2>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto">
                Estamos validando tu enlace de seguridad. Esto solo tomará un momento...
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            ESTADO 2: ÉXITO
           ========================================================================= */}
        {state === 'success' && (
          <div className="py-6 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <span className="material-symbols-outlined text-5xl font-bold">
                verified
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-slate">
                ¡Correo verificado con éxito!
              </h2>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                {feedbackMessage ||
                  'Tu cuenta ha sido activada correctamente. Ya puedes acceder a todas las funciones y reservar tus eventos.'}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/events"
                className="w-full sm:w-auto px-8 py-3.5 bg-electric-indigo hover:bg-primary text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Explorar Eventos
              </Link>
              <Link
                href="/profile"
                className="w-full sm:w-auto px-6 py-3.5 bg-surface-gray hover:bg-surface-container-high text-deep-slate rounded-xl font-semibold text-sm transition-all cursor-pointer"
              >
                Ir a Mi Perfil
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            ESTADO 3: ERROR / TOKEN EXPIRADO
           ========================================================================= */}
        {state === 'error' && (
          <div className="py-6 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
              <span className="material-symbols-outlined text-5xl">
                error
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-slate">
                Enlace expirado o inválido
              </h2>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                {feedbackMessage ||
                  'El enlace de verificación que utilizaste ya no es válido o ha expirado. Por seguridad, solicita uno nuevo.'}
              </p>
            </div>

            {/* Formulario de Reenvío de Token */}
            <div className="pt-4 border-t border-surface-variant">
              <h3 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">
                Solicitar un nuevo enlace
              </h3>

              {resendSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>¡Nuevo enlace enviado! Revisa tu bandeja de entrada.</span>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  {resendError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium text-left">
                      {resendError}
                    </div>
                  )}

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Ingresa tu correo registrado"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={isResending}
                      className="w-full pl-10 pr-4 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResending}
                    className="w-full py-3.5 bg-electric-indigo hover:bg-primary text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                        <span>Enviando enlace...</span>
                      </>
                    ) : (
                      <span>Reenviar correo de verificación</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2">
              <Link href="/login" className="text-xs text-electric-indigo font-bold hover:underline">
                Volver a Iniciar Sesión
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            ESTADO 4: NO HAY TOKEN (PÁGINA INFORMATIVA TRAS REGISTRO)
           ========================================================================= */}
        {state === 'no_token' && (
          <div className="py-6 space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-electric-indigo/10 text-electric-indigo mx-auto flex items-center justify-center shadow-lg shadow-electric-indigo/10">
              <span className="material-symbols-outlined text-5xl">
                mark_email_read
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-slate">
                Verifica tu Correo Electrónico
              </h2>
              <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                Hemos enviado un enlace de confirmación a tu dirección de correo electrónico.
                Por favor, abre tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
            </div>

            {/* Sección de Reenvío */}
            <div className="pt-4 border-t border-surface-variant">
              <p className="text-xs text-on-surface-variant mb-4">
                ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo enlace abajo:
              </p>

              {resendSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>¡Enlace reenviado con éxito! Revisa tu correo.</span>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  {resendError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium text-left">
                      {resendError}
                    </div>
                  )}

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="nombre@ejemplo.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={isResending}
                      className="w-full pl-10 pr-4 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResending}
                    className="w-full py-3.5 bg-electric-indigo hover:bg-primary text-white rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                        <span>Enviando enlace...</span>
                      </>
                    ) : (
                      <span>Reenviar correo de confirmación</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-platinum-silver">
              <Link href="/" className="hover:text-deep-slate transition-colors">
                Ir al Inicio
              </Link>
              <Link href="/login" className="text-electric-indigo font-bold hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

