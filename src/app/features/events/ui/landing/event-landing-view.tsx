"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EventLandingModel } from "../../models/event-landing.model";
import { LandingPreloader } from "./components/landing-preloader";
import { LandingHeader } from "./components/landing-header";
import { VideoTeaserModal } from "./components/video-teaser-modal";

interface EventLandingViewProps {
  event: EventLandingModel;
}

export function EventLandingView({ event }: EventLandingViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Simular precarga suave de la experiencia (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const config = event.landingConfig || {};
  const theme = config.theme || {
    primaryColor: "#6366F1",
    backgroundType: "color",
    backgroundColor: "#0F172A",
  };
  const header = config.header || {};
  const body = config.body || {};
  const footer = config.footer || {};

  // Extraer highlights presentes (filtrando vacíos)
  const highlights = [
    body.highlight1,
    body.highlight2,
    body.highlight3,
    body.highlight4,
  ].filter((h): h is string => Boolean(h && h.trim().length > 0));

  // Comprobar si existe contenido para redes en Footer
  const hasSocials = Boolean(
    (footer.instagramUrl && footer.instagramUrl.trim().length > 0) ||
    (footer.tiktokUrl && footer.tiktokUrl.trim().length > 0) ||
    (footer.facebookUrl && footer.facebookUrl.trim().length > 0)
  );

  const hasFooterImage = Boolean(
    footer.footerImageUrl && footer.footerImageUrl.trim().length > 0
  );

  // Estilo de fondo personalizado del promotor
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor || "#0F172A",
    ...(theme.backgroundType === "pattern" && theme.backgroundPatternUrl
      ? {
          backgroundImage: `url(${theme.backgroundPatternUrl})`,
          backgroundRepeat: "repeat",
        }
      : {}),
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Cálculo de precio mínimo en soles
  const minPrice =
    (event.zones || []).length > 0
      ? Math.min(...event.zones.map((z) => Number(z.currentPrice) || 0))
      : 0;

  // Formatear primera fecha de función si existe
  const firstShow = event.shows?.[0];
  const formattedShowDate = firstShow
    ? new Date(firstShow.startTime).toLocaleDateString("es-PE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Fecha por confirmar";

  const formattedShowTime = firstShow
    ? new Date(firstShow.startTime).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Copiar enlace oficial
  const handleCopyLink = () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://queplaneshoy.com/e/${event.slug}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  return (
    <>
      {/* 1. Pantalla de Precarga con Logo Oficial de QPH */}
      <LandingPreloader isLoading={isLoading} />

      {/* 2. Header Superior Fijo estilo Teleticket con Logo QPH */}
      <LandingHeader
        primaryColor={theme.primaryColor}
        ctaText={header.ctaText || "Comprar Entradas"}
      />

      {/* 3. Modal de Video Teaser (YouTube Lightbox) */}
      <VideoTeaserModal
        isOpen={isVideoOpen}
        videoUrl={header.videoTeaserUrl}
        onClose={() => setIsVideoOpen(false)}
      />

      {/* 4. Lienzo Panorámico Híbrido (Conversión Directa + Full-Width) */}
      <div
        style={backgroundStyle}
        className="min-h-screen text-white pt-16 flex flex-col font-sans transition-colors duration-500"
      >
        {/* ==============================================================
            SECCIÓN 1: HERO CINEMÁTICO FULL-WIDTH (Edge-to-Edge)
           ============================================================== */}
        <section
          id="landing-inicio"
          className="relative w-full overflow-hidden bg-deep-slate text-white"
        >
          {/* Fondo panorámico con la imagen oficial o afiche */}
          {header.headerImageUrl && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 scale-105 opacity-35 blur-[1px]"
              style={{ backgroundImage: `url("${header.headerImageUrl}")` }}
            />
          )}

          {/* Gradientes multicapa cinemáticos para legibilidad superior */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/85 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-slate via-deep-slate/80 to-transparent" />

          {/* Contenedor del Hero */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-16 lg:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Afiche Oficial Nítido (Columna Izquierda en Desktop) */}
              {header.headerImageUrl && (
                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-full max-w-[280px] sm:max-w-xs lg:max-w-none relative rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border border-white/20 aspect-[3/4] bg-black/60 group">
                    <img
                      src={header.headerImageUrl}
                      alt={header.title || event.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Botón flotante para ver Teaser Oficial */}
                    {header.videoTeaserUrl && (
                      <button
                        onClick={() => setIsVideoOpen(true)}
                        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/80 hover:bg-black text-white border-2 border-white/80 flex items-center justify-center transition-all hover:scale-110 shadow-2xl cursor-pointer group/btn"
                        title="Reproducir Teaser Oficial"
                      >
                        <span
                          style={{ color: theme.primaryColor }}
                          className="material-symbols-outlined text-4xl ml-1 transition-transform group-hover/btn:scale-110"
                        >
                          play_arrow
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Título, Badges y Botón de Compra Rápida (Columna Derecha) */}
              <div
                className={`${
                  header.headerImageUrl ? "lg:col-span-8" : "lg:col-span-12 text-center"
                } flex flex-col items-center lg:items-start`}
              >
                {/* Badges superiores de urgencia */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-4">
                  <span
                    style={{ backgroundColor: `${theme.primaryColor}30`, color: theme.primaryColor }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/10 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">stars</span>
                    <span>{header.subtitle || "EXPERIENCIA EXCLUSIVA"}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Venta Oficial en Vivo</span>
                  </span>
                </div>

                {/* Título Principal */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none mb-4 drop-shadow-md">
                  {header.title || event.name}
                </h1>

                {/* Resumen conciso (máximo 2 líneas, sin párrafos pesados) */}
                {body.aboutText && (
                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-6 line-clamp-2 leading-relaxed">
                    {body.aboutText}
                  </p>
                )}

                {/* Botones de Acción Inmediata */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full sm:w-auto">
                  <button
                    onClick={() => scrollToSection("zonas-entradas")}
                    style={{ backgroundColor: theme.primaryColor }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-extrabold text-sm uppercase tracking-wider hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">confirmation_number</span>
                    <span>{header.ctaText || "Comprar Entradas Ahora"}</span>
                  </button>

                  {header.videoTeaserUrl && (
                    <button
                      onClick={() => setIsVideoOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg text-vip-gold">play_circle</span>
                      <span>Ver Teaser</span>
                    </button>
                  )}

                  {minPrice > 0 && (
                    <div className="flex items-center gap-2 text-slate-300 py-2 ml-0 sm:ml-2">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        Desde
                      </span>
                      <span className="text-sm font-extrabold text-white bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                        S/. {Number(minPrice).toFixed(2)} PEN
                      </span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ==============================================================
            SECCIÓN 2: FRANJA FLOTANTE DE 4 MÉTRICAS (-mt-10)
            Resumen visual instantáneo de los 4 datos clave para escaneo rápido
           ============================================================== */}
        <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 lg:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Métrica 1: Fecha & Hora */}
            <div className="flex items-center gap-3.5">
              <div
                style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
              >
                <span className="material-symbols-outlined text-2xl">calendar_today</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Fecha & Horario
                </span>
                <p className="font-extrabold text-sm sm:text-base text-white mt-0.5 capitalize">
                  {formattedShowDate}
                </p>
                {formattedShowTime && (
                  <p className="text-xs text-slate-400">Apertura: {formattedShowTime} hrs</p>
                )}
              </div>
            </div>

            {/* Métrica 2: Lugar del Recinto */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-white/5">
                <span className="material-symbols-outlined text-2xl">location_on</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Lugar del Evento
                </span>
                <p className="font-extrabold text-sm sm:text-base text-white mt-0.5">
                  {event.venue || "Recinto Oficial"}
                </p>
                <p className="text-xs text-slate-400 truncate max-w-[180px]">
                  {event.city}
                </p>
              </div>
            </div>

            {/* Métrica 3: Entradas Desde */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-white/5">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Entradas Desde
                </span>
                <p
                  style={{ color: theme.primaryColor }}
                  className="font-extrabold text-base sm:text-lg mt-0.5"
                >
                  S/. {Number(minPrice).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">Venta Oficial QPH</p>
              </div>
            </div>

            {/* Métrica 4: Control de Ingreso Digital */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-white/5">
                <span className="material-symbols-outlined text-2xl">qr_code_2</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Control de Ingreso
                </span>
                <p className="font-extrabold text-sm sm:text-base text-white mt-0.5">
                  DNI + E-Ticket QR
                </p>
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Acceso Criptográfico Ed25519
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ==============================================================
            SECCIÓN 3: EL NÚCLEO TRANSACCIONAL (#zonas-entradas)
            Zonas de compra directa + Croquis oficial lado a lado
           ============================================================== */}
        <section
          id="zonas-entradas"
          className="w-full py-14 lg:py-16 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Encabezado Transaccional */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span
                style={{ color: theme.primaryColor }}
                className="text-xs font-black uppercase tracking-widest block mb-1"
              >
                Tarifas y Localidades Oficiales
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Selecciona tu Zona
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Elige tu sector y asegura tu acceso directo sin intermediarios.
              </p>
            </div>

            {/* Layout de Zonas y Croquis lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Columna Izquierda: Listado de Localidades con Compra Directa */}
              <div className={body.bodyImageUrl ? "lg:col-span-7 space-y-3.5" : "lg:col-span-12 max-w-4xl mx-auto w-full space-y-3.5"}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Sectores Habilitados</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Emisión Inmediata
                  </span>
                </div>

                {(event.zones || []).map((zone) => (
                  <div
                    key={zone.id}
                    className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
                  >
                    {/* Info de la Zona */}
                    <div className="flex items-center gap-4">
                      <div
                        style={{ backgroundColor: zone.color || "#3B82F6" }}
                        className="w-3.5 h-12 rounded-full shrink-0 shadow-sm"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">
                            {zone.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/90 border border-white/10">
                            {zone.activeTierName}
                          </span>
                          {zone.remainingTickets <= 30 && zone.remainingTickets > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                              Últimos {zone.remainingTickets} cupos
                            </span>
                          )}
                        </div>
                        {zone.benefits && (
                          <p className="text-xs text-slate-400 line-clamp-1">{zone.benefits}</p>
                        )}
                      </div>
                    </div>

                    {/* Precio y Botón de Compra Directa */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Precio Oficial
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white">
                          S/. {Number(zone.currentPrice).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/checkout?eventId=${event.id}&zoneId=${zone.id}`}
                        style={{ backgroundColor: theme.primaryColor }}
                        className="px-5 py-3 rounded-xl text-white font-extrabold text-xs uppercase tracking-wide hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                      >
                        <span>Comprar</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Columna Derecha: Croquis Oficial del Escenario */}
              {body.bodyImageUrl && (
                <div className="lg:col-span-5 bg-zinc-900/80 p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col items-center shadow-lg">
                  <div className="w-full py-2 px-3 rounded-lg bg-black/60 text-white text-center font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-4 border border-white/10">
                    <span
                      style={{ color: theme.primaryColor }}
                      className="material-symbols-outlined text-[16px]"
                    >
                      stadium
                    </span>
                    <span>Distribución del Escenario</span>
                  </div>

                  {/* Imagen del Croquis (plano de zonas) */}
                  <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/50 p-2">
                    <img
                      src={body.bodyImageUrl}
                      alt="Croquis oficial de zonas"
                      className="w-full h-auto object-contain max-h-[380px] mx-auto rounded-lg"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-3">
                    Plano referencial sujeto a aforo oficial autorizado por las autoridades locales.
                  </p>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ==============================================================
            SECCIÓN 4: HIGHLIGHTS COMPACTOS & COMPARTIR ENLACE
            Viñetas rápidas de 1 línea (cero texto basura)
           ============================================================== */}
        <section className="w-full py-10 bg-black/40 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Highlights en 3 columnas compactas */}
            {highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center gap-3"
                  >
                    <span
                      style={{ color: theme.primaryColor }}
                      className="material-symbols-outlined text-xl shrink-0"
                    >
                      check_circle
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white/95 truncate">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de 1 Clic para Copiar Enlace Oficial */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Enlace Oficial del Espectáculo
                </span>
                <p className="font-mono text-xs text-white/90 truncate max-w-md sm:max-w-lg">
                  queplaneshoy.com/e/{event.slug}
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border border-white/10 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">
                  {isCopied ? "done" : "content_copy"}
                </span>
                <span>{isCopied ? "¡Enlace Copiado!" : "Copiar Enlace"}</span>
              </button>
            </div>

          </div>
        </section>

        {/* ==============================================================
            SECCIÓN 5: LEGALES Y RESTRICCIONES (#landing-legales)
           ============================================================== */}
        <section
          id="landing-legales"
          className="w-full py-6 bg-black/60 border-t border-white/10 text-xs text-slate-400"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-electric-indigo">info</span>
              Restricción: <strong className="text-white/90">{event.ageRestriction || "Toda edad"}</strong>
            </span>

            {event.termsAndConditionsUrl && (
              <a
                href={event.termsAndConditionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-indigo hover:underline flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-sm">description</span>
                Términos y Bases Legales (PDF)
              </a>
            )}
          </div>
        </section>

        {/* ==============================================================
            SECCIÓN 6: FOOTER DEL SHOW
            Auspiciadores, Redes y Garantía Oficial
           ============================================================== */}
        <footer className="w-full py-12 bg-black/90 text-center flex flex-col items-center gap-6 border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-6">
            
            {/* Imagen de Auspiciadores si existe */}
            {hasFooterImage && (
              <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/40 p-2">
                <img
                  src={footer.footerImageUrl!}
                  alt="Auspiciadores y Aliados Oficiales"
                  className="w-full h-auto object-contain max-h-[220px] mx-auto rounded-xl"
                />
              </div>
            )}

            {/* Redes Sociales Oficiales del Evento */}
            {hasSocials && (
              <div className="flex items-center gap-3.5">
                {footer.instagramUrl && (
                  <a
                    href={footer.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
                    title="Instagram Oficial"
                  >
                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                  </a>
                )}
                {footer.tiktokUrl && (
                  <a
                    href={footer.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
                    title="TikTok Oficial"
                  >
                    <span className="material-symbols-outlined text-lg">music_video</span>
                  </a>
                )}
                {footer.facebookUrl && (
                  <a
                    href={footer.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
                    title="Facebook Oficial"
                  >
                    <span className="material-symbols-outlined text-lg">thumb_up</span>
                  </a>
                )}
              </div>
            )}

            {/* Sello de Plataforma Oficial */}
            <div className="text-[11px] text-slate-500 flex flex-col items-center gap-1 pt-3 border-t border-white/10 w-full">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-qph.svg"
                  alt="queplaneshoy logo"
                  className="w-4 h-4 object-contain"
                />
                <span className="font-extrabold text-slate-400 tracking-wider">
                  queplanes<span className="text-electric-indigo">hoy</span>
                </span>
              </div>
              <span>Boletería digital oficial con garantía de acceso criptográfico Ed25519</span>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}
