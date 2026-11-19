"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShareSocialPopover } from "@/app/common/components/share-social-popover";

interface LandingHeaderProps {
  primaryColor?: string;
  ctaText?: string;
  hasTermsAndConditions?: boolean;
  eventTitle?: string;
  slug?: string;
  publicUuid?: string;
}

export function LandingHeader({
  primaryColor = "#f43f5e",
  ctaText = "Comprar Entradas",
  hasTermsAndConditions = false,
  eventTitle = "Evento Oficial",
  slug,
  publicUuid,
}: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

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
        className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 shrink-0"
        title="Volver a la portada de Qué Planes Hoy"
      >
        <img
          src="/logo-qph.svg"
          alt="queplanhoy logo"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md object-contain shrink-0"
        />
        <span className="font-extrabold text-base sm:text-lg tracking-tight text-white hidden xs:inline">
          queplan<span className="text-electric-indigo">hoy</span>
        </span>
      </Link>

      {/* Lado Derecho: Navegación Estilo Teleticket + Botón de Compartir */}
      <div className="flex items-center gap-2.5 sm:gap-6">
        <nav className="flex items-center gap-2.5 sm:gap-6 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80">
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

        {/* Botón de Compartir con Modal Tooltip y UTMs */}
        <ShareSocialPopover
          title={eventTitle}
          slug={slug}
          publicUuid={publicUuid || ""}
          source="landing"
          theme="dark"
          align="right"
        />
      </div>
    </header>
  );
}
