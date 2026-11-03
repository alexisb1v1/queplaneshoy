"use client";

import React, { useEffect, useState } from "react";

interface LandingPreloaderProps {
  isLoading: boolean;
}

export function LandingPreloader({ isLoading }: LandingPreloaderProps) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Dejar que termine la transición de opacidad antes de desmontar
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden={!isLoading}
      className={`fixed inset-0 z-[100] bg-[#0A0D14] flex flex-col items-center justify-center transition-opacity duration-700 ease-out select-none ${
        isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Halo Glow animado en el fondo */}
        <div className="absolute w-36 h-36 bg-electric-indigo/25 rounded-full blur-2xl animate-pulse -top-6" />

        {/* Isotipo de QPH con respiración / pulso */}
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/15 p-3 flex items-center justify-center shadow-2xl backdrop-blur-xl animate-pulse">
          <img
            src="/logo-qph.svg"
            alt="queplaneshoy logo"
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]"
          />
        </div>

        {/* Marca Tipográfica */}
        <div className="text-center">
          <span className="font-extrabold text-2xl tracking-tight text-white block">
            queplanes<span className="text-electric-indigo">hoy</span>
          </span>
          <p className="text-xs text-white/50 uppercase tracking-widest mt-1 font-semibold">
            Cargando experiencia...
          </p>
        </div>

        {/* Barra de progreso indeterminada */}
        <div className="w-44 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-electric-indigo to-transparent rounded-full animate-[shimmer_1.4s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
}

