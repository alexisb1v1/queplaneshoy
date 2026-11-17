"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface LandingHeaderProps {
  primaryColor?: string;
  ctaText?: string;
  hasTermsAndConditions?: boolean;
}

export function LandingHeader({
  primaryColor = "#f43f5e",
  ctaText = "Comprar Entradas",
  hasTermsAndConditions = false,
}: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url,
        });
        return;
      } catch {
        // Fallback al portapapeles si el usuario cancela o el navegador falla
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch {
      // noop
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 px-4 md:px-8 flex items-center justify-between border-b ${
        isScrolled
          ? "bg-black/90 backdrop-blur-md border-white/10 shadow-lg shadow-black/40"
          : "bg-black/60 backdrop-blur-sm border-white/5"
      }`}
    >
      {/* Lado Izquierdo: Logo Oficial de QPH que redirige al Home principal */}
      <Link
        href="/"
        className="flex items-center gap-2.5 group cursor-pointer transition-transform hover:scale-105"
        title="Volver a la portada de Qué Planes Hoy"
      >
        <img
          src="/logo-qph.svg"
          alt="queplaneshoy logo"
          className="w-8 h-8 rounded-md object-contain"
        />
        <span className="font-extrabold text-lg tracking-tight text-white">
          queplan<span className="text-electric-indigo">hoy</span>
        </span>
      </Link>

      {/* Lado Derecho: Navegación Estilo Teleticket + Botón de Compartir */}
      <div className="flex items-center gap-3 sm:gap-6">
        <nav className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/80">
          <button
            onClick={() => scrollToSection("landing-inicio")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToSection("zonas-entradas")}
            className="hover:text-white transition-colors cursor-pointer py-1"
          >
            Entradas
          </button>
          {hasTermsAndConditions && (
            <button
              onClick={() => scrollToSection("landing-legales")}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              Legales
            </button>
          )}
        </nav>

        {/* Botón de Compartir Oficial en el Header */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer text-xs font-bold border border-white/10 active:scale-95 shadow-sm"
          title="Compartir enlace oficial del evento"
        >
          <span className="material-symbols-outlined text-[17px]">
            {isCopied ? "check" : "share"}
          </span>
          <span className="hidden sm:inline">
            {isCopied ? "¡Copiado!" : "Compartir"}
          </span>
        </button>
      </div>
    </header>
  );
}

