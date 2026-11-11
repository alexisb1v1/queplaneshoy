'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginUseCase } from '../index';
import { GoogleAuthButton } from './components/google-auth-button';

const REMEMBER_EMAIL_KEY = 'qph_remembered_email';

export default function LoginPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar correo recordado al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRemember(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor, ingresa tu contraseña.');
      return;
    }

    setIsLoading(true);

    const result = await loginUseCase.execute(trimmedEmail, password);

    result.match(
      () => {
        setSuccess(true);
        setIsLoading(false);

        // Guardar o borrar email según el checkbox
        if (typeof window !== 'undefined') {
          if (remember) {
            localStorage.setItem(REMEMBER_EMAIL_KEY, trimmedEmail);
          } else {
            localStorage.removeItem(REMEMBER_EMAIL_KEY);
          }
        }

        // Redirigir suavemente al destino solicitado o al inicio
        setTimeout(() => {
          const redirectTo = searchParams.get('redirect') || '/';
          router.push(redirectTo);
          router.refresh();
        }, 900);
      },
      (error) => {
        setIsLoading(false);
        setErrorMsg(error.message || 'Credenciales de acceso incorrectas. Verifica tu correo y contraseña.');
      }
    );
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Lateral Visual Editorial (Solo Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-deep-slate">
        <div className="absolute inset-0 z-0">
          <img
            alt="Concierto queplaneshoy"
            className="w-full h-full object-cover scale-105 transition-transform duration-[20s] ease-out hover:scale-100"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3rZ6yKDKqCPTUTce3UT_5EUR2cYbMqYZCPtae38ukfPAhoUvEIfVv2v_cRuWSv6Jse0F8k4YH6nf2FSP_iD4TuuzSNxBd2RGnGn_nKkQMWbgGXx5R1qVLfBNDKPmsVrpS9eEqmysP05fNo_tzC0gf-I9gTI_cjTljXnk-L7RZlkrGcLOCXP1mm42HZa5d-hoVb1JuEVExX9t9yE_B3moZGWGfSX8ZKVS3H2cDzXpYxGgfhwzhWyosc4gQiwqrO9AW46PugAsG7_Pm"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep-slate/50 via-deep-slate/75 to-deep-slate/95 z-10"></div>
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

      {/* Lado Derecho: Formulario de Login */}
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

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-extrabold text-deep-slate mb-2">Bienvenido de nuevo</h2>
            <p className="text-on-surface-variant text-sm">Inicia sesión para continuar disfrutando de tus eventos.</p>
          </div>

          {/* Alerta de Error */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-start gap-3 shadow-xs animate-in fade-in">
              <span className="material-symbols-outlined text-rose-600 text-xl flex-shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                {errorMsg.toLowerCase().includes('inválidas') && (
                  <p className="text-xs text-rose-600 mt-1">
                    Verifica que hayas escrito correctamente tu correo y contraseña.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Formulario Principal */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Campo Correo Electrónico */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="email"
                  name="email"
                  placeholder="nombre@ejemplo.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isLoading || success}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-electric-indigo hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isLoading || success}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum-silver hover:text-on-surface-variant p-1 cursor-pointer"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || success}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <span className="material-symbols-outlined select-none text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Recordar mi sesión */}
            <div className="flex items-center pt-1">
              <input
                className="w-4 h-4 text-electric-indigo border-outline-variant rounded focus:ring-electric-indigo cursor-pointer"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isLoading || success}
              />
              <label className="ml-2 text-xs font-medium text-on-surface-variant select-none cursor-pointer" htmlFor="remember">
                Recordar mi correo en este dispositivo
              </label>
            </div>

            {/* Botón Iniciar Sesión */}
            <button
              className={`w-full py-4 rounded-xl text-white font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                success
                  ? 'bg-emerald-600 shadow-emerald-600/20'
                  : 'bg-electric-indigo shadow-electric-indigo/25 hover:bg-primary active:scale-[0.98] disabled:opacity-50'
              }`}
              type="submit"
              disabled={isLoading || success}
            >
              {isLoading && (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  refresh
                </span>
              )}
              {success && (
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>
              )}
              {success ? '¡Inicio de sesión exitoso!' : isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-xs font-semibold">
              <span className="px-4 bg-white text-platinum-silver">O continúa con</span>
            </div>
          </div>

          {/* Inicio de Sesión Social (Únicamente Google) */}
          <div>
            <GoogleAuthButton
              redirectTo={searchParams.get('redirect') || undefined}
              disabled={isLoading || success}
              label="Continuar con Google"
              onError={(msg) => setErrorMsg(msg)}
            />
          </div>

          {/* Enlace a Registro */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant font-medium">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="font-bold text-electric-indigo hover:underline ml-1 cursor-pointer"
              >
                Regístrate gratis
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
