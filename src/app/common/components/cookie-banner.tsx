"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "qph_cookies_consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Pequeño retardo para no interferir con la carga inicial del DOM
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // noop
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // noop
    }
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    } catch {
      // noop
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Aviso de Cookies"
      role="region"
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-[90] max-w-lg bg-deep-slate/95 backdrop-blur-md text-white border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-electric-indigo/20 text-electric-indigo flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-2xl">cookie</span>
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Valoramos tu privacidad y seguridad digital
            </h3>
            <button
              type="button"
              onClick={handleAcceptEssential}
              aria-label="Cerrar aviso de cookies"
              className="text-slate-400 hover:text-white transition-colors cursor-pointer -mr-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-platinum-silver leading-relaxed">
            En <strong>queplanhoy</strong> utilizamos cookies técnicas esenciales para mantener tu sesión segura y procesar tus reservas, además de cookies analíticas para mejorar la plataforma. Conoce más en nuestra{" "}
            <Link
              href="/politica-de-cookies"
              className="text-electric-indigo underline hover:text-indigo-300 font-semibold"
            >
              Política de Cookies
            </Link>.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white font-bold text-xs transition-all shadow-md shadow-electric-indigo/25 active:scale-95 cursor-pointer"
            >
              Aceptar todas
            </button>
            <button
              type="button"
              onClick={handleAcceptEssential}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              Solo necesarias
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CookieBanner;
