'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUseCase } from '../index';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const result = await loginUseCase.execute(email, password);

    result.match(
      (data) => {
        setSuccess(true);
        setIsLoading(false);
        // Redirigir después de 1 segundo de mostrar el check verde
        setTimeout(() => {
          const redirectTo = searchParams.get('redirect') || '/';
          router.push(redirectTo);
          router.refresh();
        }, 1000);
      },
      (error) => {
        setIsLoading(false);
        setErrorMsg(error.message || 'Credenciales incorrectas');
      }
    );
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Side: Visual Anchor (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-deep-slate">
        <div className="absolute inset-0 z-0">
          <img
            alt="Concierto queplaneshoy"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3rZ6yKDKqCPTUTce3UT_5EUR2cYbMqYZCPtae38ukfPAhoUvEIfVv2v_cRuWSv6Jse0F8k4YH6nf2FSP_iD4TuuzSNxBd2RGnGn_nKkQMWbgGXx5R1qVLfBNDKPmsVrpS9eEqmysP05fNo_tzC0gf-I9gTI_cjTljXnk-L7RZlkrGcLOCXP1mm42HZa5d-hoVb1JuEVExX9t9yE_B3moZGWGfSX8ZKVS3H2cDzXpYxGgfhwzhWyosc4gQiwqrO9AW46PugAsG7_Pm"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep-slate/40 to-deep-slate/80 z-10"></div>
        <div className="relative z-20 flex flex-col justify-between p-16 w-full text-white">
          <div>
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => router.push('/')}>
              <img src="/logo-qph.svg" className="w-10 h-10 rounded-md object-contain" alt="queplaneshoy logo" />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight mb-6">Tus mejores planes, a un clic.</h1>
            <p className="text-lg text-platinum-silver max-w-md">
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
              +10k usuarios ya están planeando su semana
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Interaction Canvas */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 md:p-16">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex justify-center cursor-pointer" onClick={() => router.push('/')}>
            <div className="flex items-center gap-2">
              <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
              <span className="font-extrabold text-xl tracking-tight text-deep-slate">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-deep-slate mb-2">Bienvenido de nuevo</h2>
            <p className="text-on-surface-variant">Inicia sesión para continuar con tus planes.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-deep-slate" htmlFor="email">
                Correo electrónico
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-electric-indigo focus:border-electric-indigo transition-all duration-200 outline-none"
                id="email"
                name="email"
                placeholder="nombre@ejemplo.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-deep-slate" htmlFor="password">
                  Contraseña
                </label>
                <a className="text-sm font-semibold text-electric-indigo hover:underline" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-electric-indigo focus:border-electric-indigo transition-all duration-200 outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined select-none text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                className="w-4 h-4 text-electric-indigo border-outline-variant rounded focus:ring-electric-indigo cursor-pointer"
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="ml-2 text-sm text-on-surface-variant select-none cursor-pointer" htmlFor="remember">
                Recordar mi sesión
              </label>
            </div>
            <button
              className={`w-full text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                success
                  ? 'bg-green-600 shadow-green-600/20'
                  : 'bg-electric-indigo shadow-electric-indigo/20 hover:bg-primary-container active:scale-[0.98]'
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
              {success ? '¡Éxito!' : isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-sm font-semibold">
              <span className="px-4 bg-background text-on-surface-variant">O continúa con</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-95 transition-all duration-200 bg-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-semibold text-deep-slate">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-outline-variant rounded-xl hover:bg-surface-container-low active:scale-95 transition-all duration-200 bg-white">
              <svg className="w-5 h-5 fill-current text-deep-slate" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05 1.72-3.2 1.72-1.15 0-1.5-.7-3.05-.7-1.56 0-1.97.68-3.04.7-1.16.02-2.33-.87-3.41-2-2.18-2.3-3.66-6.52-1.42-10.4 1.12-1.92 3.08-3.13 5.22-3.13 1.62 0 3.16 1.12 4.14 1.12.98 0 2.84-1.33 4.77-1.14 2.1.2 3.65 1.25 4.54 2.53-1.85 1.12-2.18 3.55-1.57 5.06 1.13 2.84 3.75 4.13 3.75 4.13-.08.23-.58 1.95-1.93 3.31zM13.63 4.26c-.95 1.15-2.52 1.92-3.83 1.83.18-1.5.9-2.98 2.04-4.08C12.98.86 14.62 0 15.93.09c.14 1.54-.7 3.02-1.63 4.17z"></path>
              </svg>
              <span className="font-semibold text-deep-slate">Apple</span>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-on-surface-variant">
              ¿No tienes una cuenta?{' '}
              <a className="font-semibold text-electric-indigo hover:underline ml-1" href="#">
                Regístrate gratis
              </a>
            </p>
          </div>

          {/* Footer Links (Mini) */}
          <div className="mt-20 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a className="text-sm font-semibold text-platinum-silver hover:text-deep-slate transition-colors" href="#">
              Términos
            </a>
            <a className="text-sm font-semibold text-platinum-silver hover:text-deep-slate transition-colors" href="#">
              Privacidad
            </a>
            <a className="text-sm font-semibold text-platinum-silver hover:text-deep-slate transition-colors" href="#">
              Ayuda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
