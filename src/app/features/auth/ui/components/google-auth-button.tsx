'use client';

import React, { useState } from 'react';
import { getGoogleAuthUrlUseCase } from '../../index';

interface GoogleAuthButtonProps {
  redirectTo?: string;
  disabled?: boolean;
  label?: string;
  onError?: (message: string) => void;
}

/**
 * Botón único de autenticación con Google usando SVG oficial de marca y flujo OAuth 2.0 seguro.
 */
export function GoogleAuthButton({
  redirectTo,
  disabled = false,
  label = 'Continuar con Google',
  onError,
}: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleLogin = async () => {
    if (disabled || isRedirecting) return;
    setIsRedirecting(true);

    const result = await getGoogleAuthUrlUseCase.execute(redirectTo);

    result.match(
      ({ url }) => {
        if (typeof window !== 'undefined' && url) {
          window.location.href = url;
        } else {
          setIsRedirecting(false);
        }
      },
      (error) => {
        setIsRedirecting(false);
        const msg =
          error.message || 'No se pudo iniciar la autenticación con Google en este momento.';
        if (onError) {
          onError(msg);
        } else {
          alert(msg);
        }
      }
    );
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled || isRedirecting}
      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-outline-variant/40 rounded-xl hover:bg-surface-gray active:scale-[0.98] transition-all duration-200 bg-white shadow-xs cursor-pointer text-sm font-semibold text-deep-slate disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRedirecting ? (
        <>
          <span className="material-symbols-outlined animate-spin text-[20px] text-electric-indigo">
            refresh
          </span>
          <span>Conectando con Google...</span>
        </>
      ) : (
        <>
          <svg
            aria-hidden="true"
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.08.72-2.46 1.15-4.22 1.15-3.24 0-5.99-2.19-6.97-5.14H1.02v3.14C3.03 21.14 7.19 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.03 14c-.25-.72-.39-1.49-.39-2.29s.14-1.57.39-2.29V6.28H1.02A11.98 11.98 0 0 0 0 11.71c0 1.93.46 3.75 1.02 5.43L5.03 14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.58c1.79 0 3.4.62 4.67 1.83l3.5-3.5C18.07 1.09 15.29 0 12 0 7.19 0 3.03 2.86 1.02 6.86L5.03 10C6.01 7.05 8.76 4.58 12 4.58Z"
            />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
