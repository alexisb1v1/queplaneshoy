'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginWithGoogleCallbackUseCase } from '../index';

export default function GoogleCallbackPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executedRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const oauthError = searchParams.get('error');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (oauthError) {
      setStatus('error');
      setErrorMsg(
        oauthError === 'access_denied'
          ? 'Cancelaste el inicio de sesión con Google.'
          : 'Google no pudo completar el inicio de sesión. Intenta nuevamente.'
      );
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setErrorMsg('No se recibieron las credenciales temporales de Google. Intenta iniciar sesión nuevamente.');
      return;
    }

    loginWithGoogleCallbackUseCase.execute(code, state).then((result) => {
      result.match(
        (data) => {
          setStatus('success');
          setTimeout(() => {
            router.replace(data.redirectTo || '/');
            router.refresh();
          }, 500);
        },
        (error) => {
          setStatus('error');
          setErrorMsg(
            error.message || 'No pudimos validar tu cuenta con Google. Inténtalo de nuevo.'
          );
        }
      );
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-surface-variant text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo-qph.svg" className="w-9 h-9 rounded-lg object-contain" alt="Logo QPH" />
          <span className="font-extrabold text-xl tracking-tight text-deep-slate">
            queplanes<span className="text-electric-indigo">hoy</span>
          </span>
        </div>

        {status === 'loading' && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-deep-slate">
                Conectando con Google...
              </h1>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Estamos verificando tu cuenta de correo para iniciar tu sesión de forma segura.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-2 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-deep-slate">
                ¡Bienvenido a queplaneshoy!
              </h1>
              <p className="text-xs text-on-surface-variant mt-1.5">
                Tu sesión está lista. Redirigiendo...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 py-2 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">error</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-deep-slate">
                No pudimos iniciar sesión
              </h1>
              <p className="text-xs text-rose-700 mt-2 leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href="/login"
                className="w-full py-3 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold shadow-md shadow-electric-indigo/20 transition-all cursor-pointer"
              >
                Volver a Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 rounded-xl bg-surface-gray hover:bg-slate-200 text-deep-slate text-xs font-bold transition-all cursor-pointer"
              >
                Ir a la cartelera principal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
