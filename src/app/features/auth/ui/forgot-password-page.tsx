'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { requestPasswordResetUseCase } from '../index';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setErrorMessage('Por favor, ingresa una dirección de correo electrónico válida.');
      return;
    }

    setIsLoading(true);

    const result = await requestPasswordResetUseCase.execute(trimmedEmail);

    result.match(
      () => {
        setIsLoading(false);
        setIsSuccess(true);
      },
      (error) => {
        setIsLoading(false);
        if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'TOO_MANY_REQUESTS') {
          setErrorMessage('Has realizado demasiadas solicitudes en poco tiempo. Por favor espera unos minutos antes de volver a intentar.');
        } else {
          setErrorMessage(error.message || 'No se pudo enviar el enlace en este momento. Inténtalo de nuevo en unos minutos.');
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
            <h1 className="text-4xl font-extrabold leading-tight mb-6">Tus mejores planes, a un clic.</h1>
            <p className="text-lg text-platinum-silver max-w-md leading-relaxed">
              Descubre y reserva las mejores experiencias en tu ciudad. Desde conciertos épicos hasta el teatro más íntimo.
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
      {/* Lado Derecho: Formulario de Recuperación (Estilo /login) */}
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

          {/* Encabezado */}
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-extrabold text-deep-slate mb-2">Recuperar contraseña</h2>
            <p className="text-on-surface-variant text-sm">
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace seguro para restablecerla.
            </p>
          </div>

          {/* Alerta de Error */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-start gap-3 shadow-xs animate-in fade-in">
              <span className="material-symbols-outlined text-rose-600 text-xl flex-shrink-0 mt-0.5">
                error
              </span>
              <p className="font-semibold text-xs leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Feedback de Éxito */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-secondary-container text-on-secondary-container flex flex-col gap-3 shadow-xs border border-electric-indigo/20 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-electric-indigo flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mark_email_read
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-deep-slate text-base">¡Enlace enviado con éxito!</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Revisa tu bandeja de entrada o spam</p>
                </div>
              </div>
              <p className="text-xs text-deep-slate leading-relaxed pt-1">
                Si <strong>{email}</strong> está registrado en queplaneshoy, recibirás un correo con el botón seguro para crear tu nueva contraseña. El enlace es válido durante 15 minutos.
              </p>
              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="text-xs font-semibold text-electric-indigo hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Enviar a otro correo
                </button>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-on-surface-variant hover:text-deep-slate flex items-center gap-1 sm:ml-auto cursor-pointer"
                >
                  Ir al inicio de sesión
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Formulario Principal */
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Campo Correo Electrónico */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="recovery-email">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                    mail
                  </span>
                  <input
                    className="w-full pl-10 pr-10 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                    id="recovery-email"
                    name="email"
                    placeholder="nombre@ejemplo.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    disabled={isLoading}
                  />
                  {email.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEmail('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum-silver hover:text-deep-slate transition-colors cursor-pointer"
                      aria-label="Limpiar campo"
                    >
                      <span className="material-symbols-outlined text-lg">cancel</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-platinum-silver pt-1">
                  Te enviaremos un enlace seguro válido durante 15 minutos.
                </p>
              </div>

              {/* Botón Enviar Enlace */}
              <button
                className="w-full py-4 rounded-xl text-white font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg bg-electric-indigo shadow-electric-indigo/25 hover:bg-primary active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                    <span>Enviando enlace seguro...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar enlace de recuperación</span>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tarjeta de Asistencia */}
          <div className="mt-8 p-4 rounded-xl bg-surface-gray border border-outline-variant/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-electric-indigo text-xl flex-shrink-0 mt-0.5">
              help
            </span>
            <div className="text-xs leading-relaxed text-on-surface-variant">
              <span className="font-semibold text-deep-slate block mb-0.5">¿Necesitas ayuda adicional?</span>
              ¿No recuerdas con qué correo te registraste? Escríbenos a{' '}
              <a href="mailto:soporte@queplaneshoy.com" className="text-electric-indigo font-semibold hover:underline">
                soporte@queplaneshoy.com
              </a>
            </div>
          </div>

          {/* Enlace Volver a Login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant font-medium">
              ¿Te acordaste de tu contraseña?{' '}
              <Link
                href="/login"
                className="font-bold text-electric-indigo hover:underline ml-1 cursor-pointer"
              >
                Inicia sesión
              </Link>
            </p>
          </div>

          {/* Footer Legal */}
          <div className="mt-12 text-center text-[11px] text-platinum-silver font-semibold">
            © 2026 queplaneshoy. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </div>
  );
}
