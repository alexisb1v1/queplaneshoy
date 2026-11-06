'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUseCase } from '../index';

export default function RegisterPageComponent() {
  const router = useRouter();

  // Estados del Formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);

  // Estados de Interfaz
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validación en tiempo real / submit
  const validateForm = (): string | null => {
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return 'Por favor, introduce tu nombre completo (mínimo 2 caracteres).';
    }
    if (trimmedName.length > 100) {
      return 'El nombre completo no puede exceder los 100 caracteres.';
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return 'Por favor, introduce un correo electrónico válido.';
    }
    if (trimmedEmail.length > 150) {
      return 'El correo electrónico no puede exceder los 150 caracteres.';
    }

    if (phone.trim() && phone.trim().length > 30) {
      return 'El teléfono no puede exceder los 30 caracteres.';
    }

    if (!password || password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (password.length > 100) {
      return 'La contraseña no puede exceder los 100 caracteres.';
    }

    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden. Por favor, verifícalas.';
    }

    if (!terms) {
      return 'Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsEmailAlreadyRegistered(false);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);

    const result = await registerUseCase.execute(
      fullName.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      password
    );

    result.match(
      () => {
        setSuccess(true);
        setIsLoading(false);
        // Redirigir a la pantalla de verificación de correo
        setTimeout(() => {
          router.push('/verify-email');
        }, 1000);
      },
      (error) => {
        setIsLoading(false);
        const message = error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
        setErrorMsg(message);

        // Detectar si el error es de conflicto (correo duplicado)
        if (
          error.code === 'CONF_001' ||
          message.toLowerCase().includes('ya está registrado') ||
          message.toLowerCase().includes('already exists')
        ) {
          setIsEmailAlreadyRegistered(true);
        }
      }
    );
  };

  return (
    <main className="flex min-h-screen">
      {/* Lateral Visual Editorial (Solo Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-deep-slate overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-70 scale-105 transition-transform duration-[20s] ease-out hover:scale-100"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA7yBjmJhK3xu_77dzAhKpfvKSJOrjH1uxVWu4uMZyQy-55kdIC5sDbI_TxpHulqNXTf_Sz9u-ENMI-5OUb0DkjZuePM8uTDOwPdiuKXThxUB8Uz04-tSs0zTKQ7z1i4g0xM4fipsdvNNeFwGzpWgEPoHf_gbLf9Z5f0qdOWU6hupQNP9T44pvkSTxEzqvGwGUzV0jp-KqcbwYsn8_u1k05olhbbZ3VUrHBmJi_WHL2MBiyCcpVtoodDjZ-WAn9-EKLu9h1g6Sy9QuI')",
            }}
          />
        </div>
        {/* Contenido Visual */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-8 cursor-pointer hover:opacity-90 transition-opacity">
              <img src="/logo-qph.svg" className="w-10 h-10 rounded-md object-contain" alt="queplaneshoy logo" />
              <span className="font-extrabold text-2xl tracking-tight text-white">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </Link>
            <h1 className="text-white font-black text-5xl mb-4 leading-tight">
              Vive el momento. <br />
              <span className="text-electric-indigo">Crea recuerdos.</span>
            </h1>
            <p className="text-platinum-silver text-lg max-w-md">
              Únete a miles de personas que descubren y disfrutan de los mejores eventos culturales y de entretenimiento cada día.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="flex -space-x-3">
              <img
                className="w-10 h-10 rounded-full border-2 border-deep-slate object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt2QKEOfisWydPBnVVGnbPwkPC81KHoz7yl5C-ZLbwempHhsIscBqyiu6ggWhVvlOcOJd4j8v9ya7FsnOzGIF2Hh8Icb_jIONfpuFzqmvvMLOi5kBgysFTQbBKR-9O8a4lZSmsoZUJqMPsC6ZUaJcPyvW5XfDglcKZYRh4srkOlgSOHymHQBN35GdI0YpAd_N3FASKoHYsxYTC7WGwettvIMBKhmmxvnKPci9fEnKnCjEceaGcUTrqxx9yId_Hj5vSl1JLshnp8jdY"
                alt="Usuario 1"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-deep-slate object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCefgad7uBF0FXse6mLNwGegdq_actAPSIgfuPMEbGDTuBdvmZgXTnMFAJKJIFGj5tAEd7zePzAsh9tQqEfe1EYAH22icaz8FmHShBrNhOnX3tQUKtSZaoPxDaX2cbCDnBKT3ty2m_qmRFcZy6LxQ7dDcnr1NsAnURLP3-9uco4YW2XhyCh_p9klWv5jBzl5FmiWb_RXk1TD9mCQgpGuHOS2vNaI73qIuoJ_6lylA8qDmG-rEieg3LBYXkqcGnceu_-1d8owbqu6dYY"
                alt="Usuario 2"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-deep-slate object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCialp_JD1ue2fZQUVqFm9WD0qe4XnDxBftslFzg9-c5l5utiNptACntvek8FuxbdUkyxCC8AiNRFjcnR8pZ7Nq3Rh8OEJTy2Uc8P7gc7VfH0cYLAJxRAVHvTO0KpM0PPFDymQregwnHBeyU1DwTTXehWIoQK2hz1vjzUgt1KPQMI-8ltJXJcO-wxL3eTDCZqvuuW7Vj4x7Ewucp-3BMh5OEKbP8J08rF2tGohwZDI-HCASkgsPddYEF3lMgWYGrD5YWZgziJMG-m2k"
                alt="Usuario 3"
              />
            </div>
            <span className="font-semibold text-sm text-platinum-silver">+50k usuarios ya planean su hoy.</span>
          </div>
        </div>
      </div>

      {/* Lado del Formulario de Registro */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 bg-white relative">
        {/* Logo Móvil */}
        <div className="w-full max-w-md flex justify-start mb-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
            <span className="font-black text-xl text-deep-slate tracking-tight">
              queplanes<span className="text-electric-indigo">hoy</span>
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Header del Formulario */}
          <header className="space-y-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-deep-slate">Crear una cuenta</h2>
            <p className="text-on-surface-variant text-sm">Empieza a descubrir experiencias inolvidables hoy mismo.</p>
          </header>

          {/* Alerta de Error */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-start gap-3 shadow-xs">
              <span className="material-symbols-outlined text-rose-600 text-xl flex-shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                {isEmailAlreadyRegistered && (
                  <Link
                    href="/login"
                    className="inline-block mt-1 text-xs text-electric-indigo font-bold hover:underline"
                  >
                    ¿Ya tienes cuenta? Haz clic aquí para iniciar sesión.
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Botones de Registro Social */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => alert('Próximamente: Registro con Google en desarrollo')}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant/40 rounded-xl hover:bg-surface-gray transition-all active:scale-95 duration-200 bg-white shadow-xs cursor-pointer"
            >
              <img
                alt="Google"
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkPlXtlKfXALOwYmnR3qmXAa_bGYHgiytGc4DSwQyu0aOTmJheUSBuZc6UB-kpyx_GiLM6P22Rm8RKp0RnyW0ZF0sAJRl9wrx4lZvJOsIxo6q7BtbLxVX57aL3GGBC2WCUNax0PI2izv7cUxe-AgnVEcWkLiD28BH0ChJBCA5BurHpkrhnUM_4EfmwQ4iViG1afgNq-cGQ6hfBeUn83wzDSCpwABA4Q0s0VaguHSECIV9NtzKT-FIqD4OaCgQibDpoWQk074W_Gi8s"
              />
              <span className="font-semibold text-deep-slate text-sm">Google</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Próximamente: Registro con Apple en desarrollo')}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant/40 rounded-xl hover:bg-surface-gray transition-all active:scale-95 duration-200 bg-white shadow-xs cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current text-deep-slate" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-82.3-20.8-41.1 0-78.9 23-99.3 58.5-41.2 71.3-10.5 177.3 30.1 236 19.9 28.5 43.8 60.5 74.4 59.3 29.3-1.1 40.5-19 75.8-19 35.4 0 45.6 19 76.8 18.3 31.9-.7 52.7-28.5 72.3-56.9 22.6-32.9 32-64.8 32.4-66.5-1.4-.6-62.8-24.1-63-95.3zM289 110.4c17.5-21 28.9-50.1 25.7-79.3-25.2 1-55.9 16.9-73.9 38.1-16.2 18.7-30.3 48.6-26.5 76.9 28.3 2.2 57.2-14.7 74.7-35.7z"></path>
              </svg>
              <span className="font-semibold text-deep-slate text-sm">Apple</span>
            </button>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-platinum-silver font-semibold">O con tu correo electrónico</span>
            </div>
          </div>

          {/* Formulario Principal de Registro */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 1. Nombre Completo (BD: users.name - varchar(100) NOT NULL) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="full_name">
                Nombre completo <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  person
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="full_name"
                  placeholder="Ej: Alexis Bermúdez"
                  required
                  maxLength={100}
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isLoading || success}
                />
              </div>
            </div>

            {/* 2. Correo Electrónico (BD: users.email - varchar(150) NOT NULL, UNIQUE) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="email">
                Correo electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="email"
                  placeholder="nombre@ejemplo.com"
                  required
                  maxLength={150}
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

            {/* 3. Teléfono / WhatsApp (BD: users.organizer_phone - varchar(30) NULL) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="phone">
                  Teléfono / Celular
                </label>
                <span className="text-[11px] text-platinum-silver">Opcional</span>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  call
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="phone"
                  placeholder="+51 987 654 321"
                  maxLength={30}
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isLoading || success}
                />
              </div>
            </div>

            {/* 4. Contraseña (BD: users.password_hash - varchar(255) NOT NULL) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  maxLength={100}
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

            {/* 5. Confirmar Contraseña (Validación de Seguridad en Cliente) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="confirm_password">
                Confirmar contraseña <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
                  lock_reset
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface-gray border border-transparent rounded-xl text-on-surface placeholder:text-platinum-silver focus:ring-2 focus:ring-electric-indigo/20 outline-none transition-all text-sm"
                  id="confirm_password"
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                  maxLength={100}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isLoading || success}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-platinum-silver hover:text-on-surface-variant p-1 cursor-pointer"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading || success}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  <span className="material-symbols-outlined select-none text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* 6. Aceptación de Términos Legales */}
            <div className="flex items-start gap-3 py-1.5">
              <input
                className="mt-1 rounded text-electric-indigo focus:ring-electric-indigo cursor-pointer w-4 h-4"
                id="terms"
                required
                type="checkbox"
                checked={terms}
                onChange={(e) => {
                  setTerms(e.target.checked);
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isLoading || success}
              />
              <label className="text-xs text-on-surface-variant select-none cursor-pointer leading-relaxed" htmlFor="terms">
                He leído y acepto los{' '}
                <a className="text-electric-indigo hover:underline font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a className="text-electric-indigo hover:underline font-semibold" href="#" onClick={(e) => e.preventDefault()}>
                  Política de Privacidad
                </a>
                .
              </label>
            </div>

            {/* Botón de Enviar */}
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
              {success ? '¡Cuenta creada con éxito! Redirigiendo...' : isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Enlace para Iniciar Sesión */}
          <p className="text-center text-on-surface-variant text-sm font-semibold pt-2">
            ¿Ya tienes una cuenta?
            <Link
              href="/login"
              className="text-electric-indigo font-bold hover:underline transition-colors ml-1.5 cursor-pointer"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Footer pequeño */}
        <div className="mt-8 text-platinum-silver text-[11px] font-semibold text-center">
          © 2026 queplaneshoy. Todos los derechos reservados.
        </div>
      </div>
    </main>
  );
}
