"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EventLandingModel } from "../../models/event-landing.model";
import { formatAgeRestriction } from "../../utils/age-restriction";
import { LandingPreloader } from "./components/landing-preloader";
import { LandingHeader } from "./components/landing-header";
import { VideoTeaserModal } from "./components/video-teaser-modal";
import { trackUmamiEvent } from "@/app/common/utils/analytics";

interface EventLandingViewProps {
  event: EventLandingModel;
}

export function EventLandingView({ event }: EventLandingViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Registro de vista de Landing en Umami Analytics con el UID universal
  useEffect(() => {
    trackUmamiEvent("event_landing_view", {
      event_uuid: event.publicUuid || event.id,
      event_slug: event.slug,
      eventName: event.name,
      category: event.category,
      venue: event.venue || "",
      city: event.city,
    });
  }, [
    event.publicUuid,
    event.id,
    event.slug,
    event.name,
    event.category,
    event.venue,
    event.city,
  ]);

  // Simular precarga suave de la experiencia (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const config = event.landingConfig || {};
  const theme = {
    primaryColor: config.theme?.primaryColor || "#f43f5e",
    backgroundType: config.theme?.backgroundType || "color",
    backgroundColor: config.theme?.backgroundColor || "#0F172A",
    backgroundPatternUrl: config.theme?.backgroundPatternUrl,
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
    (footer.facebookUrl && footer.facebookUrl.trim().length > 0),
  );

  const hasFooterImage = Boolean(
    footer.footerImageUrl && footer.footerImageUrl.trim().length > 0,
  );

  // Estilo de fondo personalizado del promotor (color sólido, patrón repetido o imagen fija full-width/height)
  const isFixedBg =
    theme.backgroundType === "fixed" && Boolean(theme.backgroundPatternUrl);
  const isPatternBg =
    theme.backgroundType === "pattern" && Boolean(theme.backgroundPatternUrl);

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: theme.backgroundColor || "#0F172A",
    ...(isFixedBg
      ? {
          backgroundImage: `url("${theme.backgroundPatternUrl}")`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }
      : isPatternBg
        ? {
            backgroundImage: `url("${theme.backgroundPatternUrl}")`,
            backgroundRepeat: "repeat",
          }
        : {}),
  };

  const zoneMapImage = event.zoneMapUrl || null;
  const bodyPromoImage =
    body.bodyImageUrl ||
    ((event.landingConfig?.body as Record<string, unknown>)
      ?.bodyImageUrl as string) ||
    null;

  const heroImage = header.headerImageUrl || event.bannerUrl || null;

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

  // Badge humanizado de restricción de edad
  const ageBadge = formatAgeRestriction(event.ageRestriction);

  // Copiar enlace oficial
  const handleCopyLink = () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://queplanhoy.com/e/${event.slug}`;
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
        hasTermsAndConditions={true}
        eventTitle={event.name}
        slug={event.slug}
        publicUuid={event.publicUuid}
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
            SECCIÓN 1: HERO CINEMÁTICO FULL-WIDTH LIMPIO (Sin fondo negro forzado)
            Permite transparencias PNG para resaltar el fondo personalizado
           ============================================================== */}
        <section
          id="landing-inicio"
          className="relative w-full overflow-hidden bg-transparent flex flex-col justify-end min-h-[50vh] sm:min-h-[65vh] lg:min-h-[75vh]"
        >
          {heroImage ? (
            <div className="relative w-full h-full min-h-[50vh] sm:min-h-[65vh] lg:min-h-[75vh] flex items-center justify-center">
              {/* Imagen Oficial (Soporta transparencias PNG sobre el background) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={event.name}
                className="w-full h-full object-contain object-center max-h-[85vh]"
              />

              {/* Botón Flotante para Teaser / Video si existe */}
              {header.videoTeaserUrl && (
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="absolute bottom-16 right-6 sm:right-10 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/75 hover:bg-black text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 transition-all hover:scale-105 shadow-xl cursor-pointer"
                  title="Reproducir Video Promocional"
                >
                  <span className="material-symbols-outlined text-lg text-vip-gold">
                    play_circle
                  </span>
                  <span>Ver Video Teaser</span>
                </button>
              )}
            </div>
          ) : (
            <div className="w-full py-28 text-center bg-transparent flex flex-col items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Cartelera Oficial
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                {event.name}
              </h1>
            </div>
          )}
        </section>

        {/* ==============================================================
            SECCIÓN 2: FRANJA FLOTANTE DE 4 MÉTRICAS (-mt-10)
            Resumen visual instantáneo de los 4 datos clave para escaneo rápido
           ============================================================== */}
        <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/10">
            {/* Fila 1: Resumen de las 4 Métricas Clave */}
            <div className="p-5 sm:p-6 lg:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Métrica 1: Fecha & Hora */}
              <div className="flex items-center gap-3.5">
                <div
                  style={{
                    backgroundColor: `${theme.primaryColor}20`,
                    color: theme.primaryColor,
                  }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
                >
                  <span className="material-symbols-outlined text-2xl">
                    calendar_today
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Fecha & Horario
                  </span>
                  <p className="font-extrabold text-sm sm:text-base text-white mt-0.5 capitalize">
                    {formattedShowDate}
                  </p>
                  {formattedShowTime && (
                    <p className="text-xs text-slate-400">
                      Apertura: {formattedShowTime} hrs
                    </p>
                  )}
                </div>
              </div>

              {/* Métrica 2: Lugar del Recinto */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-white/5">
                  <span className="material-symbols-outlined text-2xl">
                    location_on
                  </span>
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

              {/* Métrica 3: Restricción de Acceso / Edad */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                    ageBadge.variant === "green"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                      : ageBadge.variant === "amber"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                        : ageBadge.variant === "indigo"
                          ? "bg-electric-indigo/20 text-electric-indigo border-electric-indigo/30"
                          : "bg-white/10 text-white border-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {ageBadge.icon || "verified_user"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Restricción de Acceso
                  </span>
                  <p className="font-extrabold text-sm sm:text-base text-white mt-0.5">
                    {ageBadge.label}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-[180px]">
                    {ageBadge.description || "Ingreso con código QR oficial"}
                  </p>
                </div>
              </div>

              {/* Métrica 4: Entradas Desde */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-white/5">
                  <span className="material-symbols-outlined text-2xl">
                    payments
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Entradas Desde
                  </span>
                  <p
                    style={{ color: theme.primaryColor }}
                    className="font-extrabold text-base sm:text-lg mt-0.5"
                  >
                    {minPrice > 0
                      ? `S/. ${Number(minPrice).toFixed(2)}`
                      : "Entrada Oficial"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Emisión Inmediata QPH
                  </p>
                </div>
              </div>
            </div>

            {/* Fila 2: Descripción / Detalles del Show (Pegado abajo de la barra, mismo ancho, mismo color) */}
            {body.aboutText && (
              <div className="p-6 sm:p-8 space-y-2 text-white">
                <span
                  style={{ color: theme.primaryColor }}
                  className="text-xs font-black uppercase tracking-widest block"
                >
                  Detalles del Show
                </span>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                  {body.aboutText}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ==============================================================
            SECCIÓN: ATRACTIVOS Y BANNER PUBLICITARIO DEL BODY
           ============================================================== */}
        {(highlights.length > 0 || bodyPromoImage) && (
          <section className="w-full pt-4 pb-8 space-y-6">
            {/* 1. Atractivos del Show en HORIZONTAL (Solo visibles si tienen valor) */}
            {highlights.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`grid gap-3.5 ${
                    highlights.length === 1
                      ? "grid-cols-1"
                      : highlights.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-3"
                  }`}
                >
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-lg"
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
              </div>
            )}

            {/* 2. Banner Publicitario Full-Width */}
            {bodyPromoImage && (
              <div className="w-full overflow-hidden shadow-2xl flex justify-center pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bodyPromoImage}
                  alt={event.name}
                  className="w-full h-auto object-cover max-h-[85vh]"
                />
              </div>
            )}
          </section>
        )}

        {/* ==============================================================
            SECCIÓN 3: MAPA / CROQUIS OFICIAL DEL ESCENARIO
            Contenido dentro de tarjeta negra con letras blancas nítidas
           ============================================================== */}
        {zoneMapImage && (
          <section
            id="mapa-zonas"
            className="w-full py-10 lg:py-14 scroll-mt-20"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="w-full rounded-3xl bg-zinc-950/95 backdrop-blur-xl border border-white/15 shadow-2xl p-6 sm:p-10 flex flex-col items-center text-white">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <span
                    style={{ color: theme.primaryColor }}
                    className="text-xs font-black uppercase tracking-widest block mb-1"
                  >
                    Distribución Oficial
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2">
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ color: theme.primaryColor }}
                    >
                      stadium
                    </span>
                    <span>Plano del Escenario y Zonas</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Revisa la ubicación de cada sector frente al escenario antes
                    de elegir tu entrada.
                  </p>
                </div>

                {/* Contenedor Completo del Plano */}
                <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 p-2 sm:p-4 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={zoneMapImage}
                    alt="Plano oficial de zonas y escenario"
                    className="w-full h-auto object-contain max-h-[550px] rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-3">
                    Plano referencial sujeto a aforo oficial autorizado por las
                    autoridades locales.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==============================================================
            SECCIÓN 4: TARIFAS Y LOCALIDADES OFICIALES (#zonas-entradas)
            Contenido dentro de tarjeta negra con letras blancas nítidas
           ============================================================== */}
        <section
          id="zonas-entradas"
          className="w-full py-10 lg:py-14 scroll-mt-20"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full rounded-3xl bg-zinc-950/95 backdrop-blur-xl border border-white/15 shadow-2xl p-6 sm:p-10 text-white">
              {/* Encabezado Transaccional */}
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span
                  style={{ color: theme.primaryColor }}
                  className="text-xs font-black uppercase tracking-widest block mb-1"
                >
                  Venta Oficial en Línea
                </span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                  Selecciona tu Entrada
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Elige tu sector y asegura tu acceso directo con emisión
                  digital inmediata.
                </p>
              </div>

              {/* Listado de Localidades */}
              <div className="w-full space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/15 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <span>Sectores Habilitados</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                    Emisión Inmediata
                  </span>
                </div>

                {(event.zones || []).map((zone) => (
                  <div
                    key={zone.id}
                    className="p-5 sm:p-6 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
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
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/15">
                            {zone.activeTierName}
                          </span>
                          {zone.remainingTickets <= 30 &&
                            zone.remainingTickets > 0 && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                Últimos {zone.remainingTickets} cupos
                              </span>
                            )}
                          {zone.isSoldOut && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-700 text-zinc-300 border border-zinc-600">
                              Agotado
                            </span>
                          )}
                        </div>
                        {zone.benefits && (
                          <p className="text-xs text-slate-300 line-clamp-1">
                            {zone.benefits}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Precio y Botón de Compra Directa */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Precio Oficial
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-white">
                          S/. {Number(zone.currentPrice).toFixed(2)}
                        </span>
                      </div>

                      {zone.isSoldOut ? (
                        <button
                          disabled
                          className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-500 font-extrabold text-xs uppercase tracking-wide cursor-not-allowed border border-white/5"
                        >
                          Agotado
                        </button>
                      ) : (
                        <Link
                          href={`/checkout?eventId=${event.publicUuid || event.slug || event.id}&zoneId=${zone.publicUuid || zone.id}`}
                          onClick={() => {
                            trackUmamiEvent("landing_buy_click", {
                              event_uuid: event.publicUuid || event.id,
                              eventSlug: event.slug,
                              eventName: event.name,
                              zoneName: zone.name,
                              price: zone.currentPrice || zone.regularPrice,
                            });
                          }}
                          style={{ backgroundColor: theme.primaryColor }}
                          className="px-6 py-3 rounded-xl text-white font-extrabold text-xs uppercase tracking-wide hover:opacity-95 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Comprar</span>
                          <span className="material-symbols-outlined text-sm">
                            arrow_forward
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            SECCIÓN 5: TÉRMINOS, POLÍTICAS Y BASES LEGALES (#landing-legales)
            Tarjeta destacada de alto contraste y legibilidad
           ============================================================== */}
        <section
          id="landing-legales"
          className="w-full py-8 lg:py-12 bg-transparent scroll-mt-20"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/95 backdrop-blur-xl border border-white/15 shadow-2xl space-y-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span
                    style={{ color: theme.primaryColor }}
                    className="text-[11px] font-black uppercase tracking-widest block mb-1"
                  >
                    Normativa y Seguridad
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-electric-indigo text-2xl">
                      gavel
                    </span>
                    <span>Términos y Condiciones del Espectáculo</span>
                  </h3>
                </div>

                {event.termsAndConditionsUrl && (
                  <a
                    href={event.termsAndConditionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-indigo/20 hover:bg-electric-indigo/30 border border-electric-indigo/40 text-white font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-base text-electric-indigo">
                      description
                    </span>
                    <span>Ver Bases Legales Oficiales (PDF)</span>
                    <span className="material-symbols-outlined text-xs">
                      open_in_new
                    </span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-emerald-400 text-base">
                      verified_user
                    </span>
                    Entradas Digitales con Código QR Único
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cada boleto cuenta con código QR digital único de alta
                    seguridad. El acceso es al portador y se valida directamente
                    escaneando el código en puerta.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-amber-400 text-base">
                      info
                    </span>
                    Restricción de Acceso: {ageBadge.label}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ageBadge.description ||
                      "Ingreso con código QR oficial según disposición del recinto y normativa del espectáculo."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-electric-indigo text-base">
                      credit_card
                    </span>
                    Compras y Emisión Garantizada
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Procesamiento seguro mediante pasarela certificada PCI-DSS
                    con emisión inmediata de comprobante electrónico a tu correo
                    registrado.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-slate-400 text-base">
                      policy
                    </span>
                    Política de Cambios y Devoluciones
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    No se admiten cancelaciones voluntarias. En caso de
                    postergación o cancelación oficial del espectáculo, el
                    promotor informará el cronograma de devolución.
                  </p>
                </div>
              </div>

              {/* Bloque de Preguntas Frecuentes (FAQs) */}
              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-electric-indigo text-xl">
                      help
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      Preguntas Frecuentes (FAQs)
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    Dudas Rápidas
                  </span>
                </div>

                <div className="space-y-2">
                  {(event.faqs && event.faqs.length > 0
                    ? event.faqs
                    : [
                        {
                          question:
                            "¿Cómo y cuándo recibo mis entradas digitales?",
                          answer:
                            "Inmediatamente tras confirmar tu pago, tus boletos electrónicos con código QR único de alta seguridad se envían a tu correo y quedan disponibles en tu cuenta de queplanhoy.",
                        },
                        {
                          question:
                            "¿Es necesario imprimir mi entrada para el ingreso?",
                          answer:
                            "No. Puedes presentar tu código QR directamente desde la pantalla de tu teléfono móvil. Asegúrate de tener buen nivel de brillo al momento del escaneo.",
                        },
                        {
                          question:
                            "¿Puedo ingresar con alimentos, bebidas o mochilas grandes?",
                          answer:
                            "Por disposición de seguridad del recinto, no se permite el ingreso con bebidas alcohólicas, envases de vidrio, alimentos externos ni objetos punzocortantes.",
                        },
                        {
                          question: "¿Cómo presento mi entrada en la puerta?",
                          answer: `Solo debes presentar tu entrada con código QR digital desde tu teléfono móvil o impreso. El escáner de puerta validará la autenticidad del boleto en tiempo real (${ageBadge.label}).`,
                        },
                      ]
                  ).map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-electric-indigo transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-electric-indigo/20 text-electric-indigo text-xs flex items-center justify-center shrink-0 font-bold">
                              Q
                            </span>
                            <span>{faq.question}</span>
                          </span>
                          <span
                            className={`material-symbols-outlined text-lg text-slate-400 transition-transform duration-200 shrink-0 ${
                              isOpen ? "rotate-180 text-electric-indigo" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5 pl-11">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
                    <span className="material-symbols-outlined text-lg">
                      photo_camera
                    </span>
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
                    <span className="material-symbols-outlined text-lg">
                      music_video
                    </span>
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
                    <span className="material-symbols-outlined text-lg">
                      thumb_up
                    </span>
                  </a>
                )}
              </div>
            )}

            {/* Sello de Plataforma Oficial */}
            <div className="text-[11px] text-slate-500 flex flex-col items-center gap-1 pt-3 border-t border-white/10 w-full">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-qph.svg"
                  alt="queplanhoy logo"
                  className="w-4 h-4 object-contain"
                />
                <span className="font-extrabold text-slate-400 tracking-wider">
                  queplan<span className="text-electric-indigo">hoy</span>
                </span>
              </div>
              <span>
                Boletería digital oficial con código QR único de alta seguridad
              </span>
            </div>
          </div>
        </footer>

        {/* ==============================================================
            STICKY MOBILE BAR (Botón Flotante en Móvil para Compra Inmediata)
           ============================================================== */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-3.5 flex items-center justify-between gap-3 shadow-2xl">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
              {event.name}
            </span>
            <span className="text-sm font-black text-white">
              {minPrice > 0
                ? `Desde S/ ${Number(minPrice).toFixed(2)}`
                : "Entrada Oficial"}
            </span>
          </div>

          <button
            onClick={() => scrollToSection("zonas-entradas")}
            style={{ backgroundColor: theme.primaryColor }}
            className="px-5 py-2.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider shrink-0 shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Comprar</span>
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
