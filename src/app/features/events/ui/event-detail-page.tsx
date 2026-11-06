"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getEventDetailUseCase } from "../index";
import { EventDetailModel, EventZoneModel } from "../models/event-detail.model";
import { formatAgeRestriction } from "../utils/age-restriction";

// Carga dinámica del mapa OpenStreetMap / Leaflet (desactivando SSR)
const EventLocationMap = dynamic(
  () =>
    import("./components/event-location-map").then(
      (mod) => mod.EventLocationMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 sm:h-96 rounded-2xl bg-surface-gray border border-surface-variant flex flex-col items-center justify-center gap-2 text-xs font-semibold text-on-surface-variant animate-pulse">
        <span className="material-symbols-outlined text-electric-indigo text-3xl">map</span>
        <span>Cargando mapa interactivo del recinto...</span>
      </div>
    ),
  }
);

const RECOMMENDATIONS = [
  {
    id: "rec-1",
    category: "CUMBIA / FUSIÓN",
    title: "Bareto en Concierto 2026",
    date: "14 JUN",
    location: "PUCALLPA",
    price: 65,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvDbqbGnlbfqUeC8z7aI3S9qHtQrEg0HBuv40tjwOWpwyto7jUUN4aK6zHkyjFpgrQuCmYbnML65LyCOmt4qfAeTI0iyr2BVCmLgaCJy5sBpz6YzL3uZFZIH-KYQuDSVFbpbW2Y6TUpo9uKWoJ2zKmlgzeVlfID8YoiQklT8co4xHrZ6sDZeLPqiY-dRNUsdzl8wQ2M9YvHfLR7G5WFio3W-SCX1AidCHyLkxiMeElBOJP2LgUnEYlNJevy2WQSrRm2T5c0o7zVSlx",
  },
  {
    id: "rec-2",
    category: "ROCK / INDIE",
    title: "Echoes of Lima Festival",
    date: "05 JUL",
    location: "LIMA",
    price: 89,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLV-vFt6Z3Q-_g_RCjM9g3p9FRMdW4TnoLTb2t_DGuHe1Bsjrd7vpYb-J8_gn-FA08Ovc7Xffqg7Su3kDeeigM8E-shO5j3HQerTWdJeRIak58m1ymICAC5dbB6na0lleW1NkOwk918T18gWTshTn0Zzl3ic7SdBx2Vzhs5heY5_umnw9T63JvIIiWvk63UsQKHL2DHezWpD-wjgw01UHRyiKCzTzGizacFSLDtCZyg-82AVyyzAVzhN6jdAaTMFIz5fOyGUmrZCro",
  },
  {
    id: "rec-3",
    category: "ELECTRÓNICA",
    title: "Midnight Sessions: Lima Underground",
    date: "12 JUL",
    location: "BARRANCO",
    price: 45,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOSUZv2M7uclQknZJmXWjOneUBNz-ggqZyktu_-IRwTtUB21KMNz-RpU5FtXl1gcbww2VH2uzJWcFtWoYlnOs7KgVd_v_rHztJTKEqhNEAY0C_W4-ADUGz7tDfqDxACVZAs2r8MKr9XVj5by6TKAwaft2nFhUXzd-3uwtr9BCWIctRcn7n5OXbyYdWN6e_JVAuCiWVPMd2q27xOcZyLmats6ygJ4-hf71qJ97KPTEKrNVxLqC2lfCzSpIJkzYxBA7bw-k5Y_FOk5v7",
  },
  {
    id: "rec-4",
    category: "SALSA / LATIN",
    title: "Noche de Gala Salsera",
    date: "20 AGO",
    location: "CALLAO",
    price: 75,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY0glueuyiQb7DkenK_iYrWWIrNbX1YaUqQ4s_r0nei9PpsCiVxMkvXskGW6sbk_CcpEyhlG1g5x3z8rxRXx-ZcRNo-h6-2mcrd_WVCxV4EcebWwiDmp0K9RVpVG-gcz_eUgfl5BbI_tv2oAGMf3jiixuB808BKzoDWX4MtKSnX4Bsoy1FPPEACjEO3OA_Rgr6Qnr3qORQGSWNXrK8OHutDXb9QZoM3cINg4AR8jEshAMiiXHUsuNK4g9xpaB5VJ9UaAB3X-qSYct4",
  },
];

interface EventDetailPageProps {
  id: string;
}

export default function EventDetailPage({ id }: EventDetailPageProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventDetailModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesState, setFavoritesState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    getEventDetailUseCase.execute(id).match(
      (data) => {
        if (!isMounted) return;
        setEvent(data);
        setIsLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "No se pudo cargar la información del evento.");
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleRecommendationFavorite = (recId: string) => {
    setFavoritesState((prev) => ({
      ...prev,
      [recId]: !prev[recId],
    }));
  };

  const handleBuyTickets = (zoneId?: string) => {
    if (!event) return;
    const targetEventId = event.publicUuid || event.id;
    const url = zoneId
      ? `/checkout?eventId=${targetEventId}&zoneId=${zoneId}`
      : `/checkout?eventId=${targetEventId}`;
    router.push(url);
  };

  // --- ESTADO DE CARGA ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-surface-variant flex items-center justify-center mb-4 animate-pulse">
          <img
            src="/logo-qph.svg"
            alt="queplaneshoy logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <div className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-bold text-deep-slate">Cargando experiencia...</p>
        <p className="text-xs text-on-surface-variant mt-1">Obteniendo datos de taquilla oficial</p>
      </div>
    );
  }

  // --- ESTADO DE ERROR ---
  if (errorMessage || !event) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6 shadow-sm border border-red-200">
          <span className="material-symbols-outlined text-3xl text-red-600">error</span>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-electric-indigo mb-2">
          Evento no disponible
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-slate mb-3">
          No pudimos encontrar este evento
        </h1>
        <p className="text-sm text-on-surface-variant max-w-md mb-8 leading-relaxed">
          {errorMessage || "El evento no existe, no está publicado o el enlace es incorrecto."}
        </p>
        <Link
          href="/"
          className="px-6 py-3.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Volver a Cartelera Principal</span>
        </Link>
      </main>
    );
  }

  // Formateo de fechas de la primera función
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

  // Cálculo de precio mínimo en soles
  const minPrice =
    (event.zones || []).length > 0
      ? Math.min(...event.zones.map((z) => Number(z.currentPrice) || 0))
      : 0;

  const eventBanner =
    event.bannerUrl ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAvDbqbGnlbfqUeC8z7aI3S9qHtQrEg0HBuv40tjwOWpwyto7jUUN4aK6zHkyjFpgrQuCmYbnML65LyCOmt4qfAeTI0iyr2BVCmLgaCJy5sBpz6YzL3uZFZIH-KYQuDSVFbpbW2Y6TUpo9uKWoJ2zKmlgzeVlfID8YoiQklT8co4xHrZ6sDZeLPqiY-dRNUsdzl8wQ2M9YvHfLR7G5WFio3W-SCX1AidCHyLkxiMeElBOJP2LgUnEYlNJevy2WQSrRm2T5c0o7zVSlx";

  return (
    <div className="flex-1 w-full bg-background">
      {/* Ocultar header y bottom nav globales del layout en móvil para esta ruta */}
      <style>{`
        @media (max-width: 1023px) {
          .qph-mobile-header, .qph-mobile-nav {
            display: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* VISTA MÓVIL (Stitch Style) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden bg-background min-h-screen pb-32 text-on-surface">
        {/* Top Navigation Bar contextual móvil */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white px-4 h-16 flex items-center justify-between border-b border-surface-variant shadow-xs">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-gray transition-all cursor-pointer active:scale-95"
            onClick={() => window.history.back()}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">arrow_back</span>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <img
              alt="queplaneshoy logo"
              className="h-8 w-auto rounded-md object-contain"
              src="/logo-qph.svg"
            />
            <span className="font-extrabold text-xl tracking-tight text-deep-slate">
              queplanes<span className="text-electric-indigo">hoy</span>
            </span>
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: event.name,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-gray transition-all cursor-pointer active:scale-95"
            aria-label="Compartir evento"
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">share</span>
          </button>
        </nav>

        {/* Hero Section */}
        <div className="relative w-full h-[50vh] min-h-[400px] mt-16">
          <img
            className="w-full h-full object-cover"
            src={eventBanner}
            alt={event.name}
          />
          <div className="absolute inset-0 qph-hero-gradient flex flex-col justify-end p-6 pb-12">
            <div className="flex gap-2 mb-4">
              <span className="bg-electric-indigo text-white font-semibold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full qph-label-bold">
                {event.category || "Espectáculo Oficial"}
              </span>
              <span className="bg-vip-gold text-white font-semibold text-[10px] tracking-wider px-3 py-1 rounded-full uppercase qph-label-bold">
                Venta Oficial QPH
              </span>
            </div>
            <h1 className="text-white qph-headline-lg text-[24px] mb-2 font-bold">
              {event.name}
            </h1>
            <div className="flex items-center text-platinum-silver qph-label-bold text-sm">
              <span className="material-symbols-outlined mr-2 text-[18px]">calendar_today</span>
              <span className="capitalize">
                {formattedShowDate}
                {formattedShowTime ? ` • ${formattedShowTime} hrs` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Event Key Info */}
        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-xs p-6 flex flex-col gap-4 border border-surface-variant">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-gray border border-surface-variant/40 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-electric-indigo text-[24px]">location_on</span>
              </div>
              <div>
                <h3 className="qph-label-bold text-on-surface font-semibold text-sm">
                  {event.venue || "Recinto Principal"}
                </h3>
                <p className="text-on-surface-variant qph-body-md text-xs mt-0.5">
                  {event.address ? `${event.address}, ${event.city}` : event.city}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => {
                      const section = document.getElementById("entradas-seccion");
                      if (section) section.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-electric-indigo qph-label-bold text-xs hover:underline cursor-pointer"
                  >
                    Ver zonas y precios
                  </button>
                  <span className="text-surface-variant font-bold">•</span>
                  <button
                    onClick={() => {
                      const section = document.getElementById("ubicacion-seccion-movil");
                      if (section) section.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-electric-indigo qph-label-bold text-xs hover:underline cursor-pointer"
                  >
                    Ver mapa
                  </button>
                </div>
              </div>
            </div>
            <div className="h-px bg-surface-variant"></div>
            <div>
              <h3 className="qph-headline-md text-[18px] mb-2 font-semibold text-on-surface">Sobre el evento</h3>
              <p className="text-on-surface-variant qph-body-md text-xs leading-relaxed">
                {event.description || "Evento oficial disponible en la plataforma queplaneshoy."}
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Categories (Móvil) - Informativo + CTA de Compra */}
        <section className="mt-10 px-5" id="entradas-seccion">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="qph-headline-md text-[20px] font-bold text-deep-slate">
              Categorías y Precios
            </h2>
            <span className="text-[11px] font-label-bold text-on-surface-variant bg-white px-2.5 py-1 rounded-full border border-surface-variant">
              {(event.zones || []).length} zonas
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {(event.zones || []).map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-surface-variant rounded-2xl p-5 shadow-xs flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ticket.color || "#4F46E5" }}
                      />
                      <span className="text-electric-indigo qph-label-bold text-[10px] uppercase tracking-wider block font-semibold">
                        {ticket.activeTierName}
                      </span>
                    </div>
                    <h4 className="qph-headline-md text-[18px] font-bold text-deep-slate">
                      {ticket.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-on-surface-variant uppercase font-label-bold block">
                      Precio Oficial
                    </span>
                    <span className="text-electric-indigo qph-price-tag text-[22px] font-extrabold block">
                      S/. {Number(ticket.currentPrice).toFixed(2)}
                    </span>
                    {ticket.regularPrice > ticket.currentPrice && (
                      <span className="text-[11px] text-gray-400 line-through">
                        S/. {Number(ticket.regularPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {ticket.benefits && (
                  <p className="text-on-surface-variant qph-body-md text-xs leading-relaxed">
                    {ticket.benefits}
                  </p>
                )}
                <div className="pt-2.5 border-t border-surface-variant/60 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Acceso oficial garantizado
                  </span>
                  <button
                    onClick={() => handleBuyTickets(ticket.id)}
                    className="text-electric-indigo font-bold hover:underline cursor-pointer"
                  >
                    Elegir zona &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de Ubicación Móvil con Coordenadas Reales */}
        <section className="mt-10 px-5" id="ubicacion-seccion-movil">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="qph-headline-md text-[20px] font-bold text-deep-slate">
              Ubicación del Recinto
            </h2>
            <span className="text-[11px] font-label-bold text-on-surface-variant bg-white px-2.5 py-1 rounded-full border border-surface-variant">
              {event.city}
            </span>
          </div>

          <EventLocationMap
            coordinates={event.coordinates}
            venue={event.venue}
            address={event.address}
            addressReference={event.addressReference}
            city={event.city}
            googleMapsUrl={event.googleMapsUrl}
          />
        </section>

        {/* Terms & Conditions links */}
        <div className="mt-12 px-5 opacity-60">
          <div className="flex flex-col gap-2 qph-label-bold text-[11px] uppercase tracking-widest text-on-surface-variant text-center">
            {event.termsAndConditionsUrl ? (
              <a
                className="underline hover:text-black transition-colors"
                href={event.termsAndConditionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bases Legales y Términos Oficiales (PDF)
              </a>
            ) : (
              <span className="text-xs">Sujeto a los Términos y Condiciones Generales de QPH</span>
            )}
            <span className="mt-1">QuePlanesHoy © 2026</span>
          </div>
        </div>

        {/* Persistant Purchase Bar (Mobile bottom sticky) */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-surface-variant p-4 pb-8 flex items-center justify-between gap-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col">
            <span className="qph-label-bold text-on-surface-variant uppercase text-[10px]">Desde</span>
            <span className="qph-price-tag text-[20px] text-on-surface font-bold">
              S/. {Number(minPrice).toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => handleBuyTickets()}
            className="flex-grow bg-electric-indigo hover:bg-primary text-white h-14 rounded-xl qph-label-bold text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-electric-indigo/20 cursor-pointer"
          >
            <span>COMPRAR ENTRADAS</span>
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISTA ESCRITORIO (Original Adaptada a Datos Dinámicos) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block bg-background min-h-screen pb-20">
        {/* Hero Section Banner */}
        <section className="relative w-full h-[600px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={eventBanner}
            alt={event.name}
          />
          <div className="absolute inset-0 qph-hero-gradient flex flex-col justify-end pb-16 px-8">
            <div className="max-w-container-max mx-auto w-full">
              {/* Botón de retroceso */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors text-sm font-semibold w-fit bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Volver a Cartelera</span>
              </Link>

              <div className="flex flex-col gap-3 text-white">
                <span className="font-semibold text-[14px] uppercase tracking-widest text-electric-indigo bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full qph-label-bold">
                  {event.category || "Experiencia Oficial"}
                </span>
                <h1 className="qph-display-xl text-white max-w-3xl leading-tight">
                  {event.name}
                </h1>
                <div className="flex flex-wrap gap-8 items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                    <span className="qph-label-bold text-sm capitalize">
                      {formattedShowDate}
                      {formattedShowTime ? ` • ${formattedShowTime} hrs` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="qph-label-bold text-sm">
                      {(event.venue || "Recinto Oficial").toUpperCase()}, {event.city.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl transition-all border border-white/20 cursor-pointer active:scale-95"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    <span className="qph-label-bold text-sm">
                      {isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-container-max mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* About Section - Detalle del Evento en Card Enmarcada */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-surface-variant shadow-xs flex flex-col gap-6">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-variant">
                <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-center text-electric-indigo">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <div>
                  <span className="text-[10px] qph-label-bold uppercase tracking-widest text-electric-indigo block">
                    Información Oficial
                  </span>
                  <h2 className="qph-headline-lg text-deep-slate font-bold text-xl sm:text-2xl">
                    Sobre el Evento
                  </h2>
                </div>
              </div>

              <p className="qph-body-lg text-on-surface-variant leading-relaxed text-sm sm:text-base">
                {event.description || "Evento oficial en vivo disponible a través de queplaneshoy."}
              </p>

              {/* Sub-cards de Requisitos y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-surface-gray/60 p-4.5 rounded-xl flex gap-3.5 items-start border border-surface-variant">
                  <div className="w-9 h-9 rounded-lg bg-white border border-surface-variant/40 flex items-center justify-center flex-shrink-0 text-electric-indigo shadow-xs">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                  </div>
                  <div>
                    <h4 className="qph-label-bold text-deep-slate font-bold text-xs uppercase tracking-wider">
                      Requisitos de entrada
                    </h4>
                    <p className="qph-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {event.entryRequirements ||
                        `Restricción: ${formatAgeRestriction(event.ageRestriction).label}. DNI o documento oficial requerido para validación de entrada digital.`}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-gray/60 p-4.5 rounded-xl flex gap-3.5 items-start border border-surface-variant">
                  <div className="w-9 h-9 rounded-lg bg-white border border-surface-variant/40 flex items-center justify-center flex-shrink-0 text-electric-indigo shadow-xs">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                  </div>
                  <div>
                    <h4 className="qph-label-bold text-deep-slate font-bold text-xs uppercase tracking-wider">
                      Horarios y Accesos
                    </h4>
                    <p className="qph-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {event.openingHoursComment ||
                        `Apertura de puertas anticipada para control de aforo. Inicio de función: ${formattedShowTime || "Horario programado"}.`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ticket Categories Section - Informativo + Acción */}
            <section className="flex flex-col gap-4" id="entradas-seccion">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <span className="text-[10px] qph-label-bold uppercase tracking-widest text-electric-indigo block">
                    Zonas y Localidades
                  </span>
                  <h2 className="qph-headline-lg text-deep-slate font-bold text-xl sm:text-2xl">
                    Categorías de Entradas
                  </h2>
                </div>
                <span className="qph-label-bold text-xs text-on-surface-variant bg-white px-3 py-1 rounded-full border border-surface-variant shadow-xs">
                  {(event.zones || []).length} Zonas Habilitadas
                </span>
              </div>

              {/* Lista de Cards de Entradas Informativas */}
              <div className="flex flex-col gap-3.5">
                {(event.zones || []).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-variant shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-electric-indigo/40 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-label-bold uppercase tracking-wider shadow-xs text-white"
                          style={{ backgroundColor: ticket.color || "#4F46E5" }}
                        >
                          {ticket.name}
                        </span>
                        <h4 className="font-headline-md text-base sm:text-lg text-deep-slate font-bold">
                          {ticket.title || ticket.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-label-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="material-symbols-outlined text-[12px]">bolt</span>
                          {ticket.activeTierName}
                        </span>
                        {ticket.remainingTickets <= 30 && ticket.remainingTickets > 0 && (
                          <span className="text-[10px] font-label-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            Últimas {ticket.remainingTickets} entradas
                          </span>
                        )}
                      </div>
                      {ticket.benefits && (
                        <p className="qph-body-md text-xs text-on-surface-variant max-w-xl leading-relaxed">
                          {ticket.benefits}
                        </p>
                      )}
                    </div>

                    {/* Bloque Precio e Información */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-variant sm:min-w-[180px]">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-outline uppercase font-label-bold block">
                          Precio Oficial
                        </span>
                        <div className="flex items-baseline gap-2 justify-start sm:justify-end">
                          <span className="font-price-tag text-price-tag text-deep-slate font-extrabold text-2xl">
                            S/. {Number(ticket.currentPrice).toFixed(2)}
                          </span>
                          {ticket.regularPrice > ticket.currentPrice && (
                            <span className="text-xs text-outline line-through font-semibold text-gray-400">
                              S/. {Number(ticket.regularPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          Disponible
                        </span>
                      </div>

                      <button
                        onClick={() => handleBuyTickets(ticket.id)}
                        className="px-4 py-2.5 bg-electric-indigo hover:bg-electric-indigo/90 text-white rounded-xl font-label-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Location Map Section con Coordenadas Reales */}
            <section className="flex flex-col gap-4" id="ubicacion-seccion">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] qph-label-bold uppercase tracking-widest text-electric-indigo block">
                    Cómo llegar
                  </span>
                  <h2 className="qph-headline-lg text-deep-slate font-bold text-xl sm:text-2xl">
                    Ubicación del Recinto
                  </h2>
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-white px-3 py-1 rounded-full border border-surface-variant shadow-xs">
                  {event.city}
                </span>
              </div>

              <EventLocationMap
                coordinates={event.coordinates}
                venue={event.venue}
                address={event.address}
                addressReference={event.addressReference}
                city={event.city}
                googleMapsUrl={event.googleMapsUrl}
              />
            </section>
          </div>

          {/* Sidebar Sticky (Right) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 flex flex-col gap-6">
              {/* Card donde se muestra el Monto (Purchase Card) */}
              <div className="bg-white rounded-2xl shadow-xs border border-surface-variant overflow-hidden">
                {/* Mini Banner de la tarjeta */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    alt={event.name}
                    className="w-full h-full object-cover"
                    src={eventBanner}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white flex justify-between items-end">
                    <div>
                      <span className="inline-block bg-white/90 backdrop-blur-md text-deep-slate text-[9px] font-label-bold px-2 py-0.5 rounded-full uppercase mb-1 border border-surface-variant/40">
                        {event.category || "Oficial"}
                      </span>
                      <h3 className="font-headline-md text-xs font-bold leading-tight line-clamp-1 text-white">
                        {event.name}
                      </h3>
                    </div>
                    <span className="text-[10px] text-white/80 font-label-bold truncate max-w-[120px]">
                      {event.venue || event.city}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Encabezado de Precio */}
                  <div className="flex justify-between items-start mb-5 pb-4 border-b border-surface-variant">
                    <div>
                      <p className="text-on-surface-variant text-[10px] qph-label-bold uppercase tracking-wider">
                        Entradas Desde
                      </p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <p className="font-price-tag text-price-tag text-3xl text-deep-slate font-extrabold">
                          S/. {Number(minPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-xs">
                      En Venta
                    </span>
                  </div>

                  {/* Metadatos en cajas enmarcadas */}
                  <div className="flex flex-col gap-2.5 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-surface-gray rounded-xl border border-surface-variant">
                      <span className="material-symbols-outlined text-electric-indigo text-lg">calendar_month</span>
                      <div>
                        <p className="qph-body-md text-[10px] text-on-surface-variant font-medium">Fecha confirmada</p>
                        <p className="qph-label-bold text-xs text-deep-slate font-bold capitalize">{formattedShowDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-gray rounded-xl border border-surface-variant">
                      <span className="material-symbols-outlined text-electric-indigo text-lg">location_on</span>
                      <div>
                        <p className="qph-body-md text-[10px] text-on-surface-variant font-medium">Recinto oficial</p>
                        <p className="qph-label-bold text-xs text-deep-slate font-bold truncate">
                          {event.venue || "Lugar confirmado"}, {event.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón CTA Principal */}
                  <button
                    onClick={() => handleBuyTickets()}
                    className="w-full bg-electric-indigo hover:bg-primary text-white py-4 rounded-xl font-label-bold text-sm active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Comprar Entradas</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>

                  {/* Métodos de Pago aceptados en píldoras con borde */}
                  <div className="mt-5 pt-4 border-t border-surface-variant">
                    <div className="text-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Métodos oficiales aceptados:
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <span className="px-2 py-0.5 bg-surface-gray rounded text-[10px] font-bold text-purple-700 border border-surface-variant">
                        Yape / Plin
                      </span>
                      <span className="px-2 py-0.5 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        💳 Tarjetas
                      </span>
                      <span className="px-2 py-0.5 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        Apple Pay
                      </span>
                      <span className="px-2 py-0.5 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        Google Pay
                      </span>
                    </div>
                  </div>

                  {/* Sello de Seguridad */}
                  <div className="mt-4 p-3 border border-surface-variant border-dashed rounded-xl bg-surface-gray/50 flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-electric-indigo text-lg">verified_user</span>
                    <span className="text-[11px] font-medium leading-tight">
                      Garantía QPH: Entradas 100% verificadas y reserva protegida SSL.
                    </span>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-deep-slate p-6 rounded-2xl text-white border border-surface-variant shadow-xs">
                <h4 className="qph-label-bold text-white mb-2 font-bold">¿Necesitas ayuda?</h4>
                <p className="qph-body-md text-xs opacity-75 mb-4 leading-relaxed">
                  Nuestro equipo de soporte está disponible 24/7 para asistirte con tu compra y asignación de asientos.
                </p>
                <a className="text-electric-indigo hover:text-white transition-colors qph-label-bold text-xs flex items-center gap-1" href="#">
                  Contactar Soporte &rarr;
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Events Section */}
        <section className="bg-surface-container-low py-16 mt-16 border-t border-surface-variant">
          <div className="max-w-container-max mx-auto px-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="qph-headline-lg text-deep-slate font-bold">Eventos Similares</h2>
              <Link href="/" className="text-electric-indigo qph-label-bold hover:underline">
                Ver todos los eventos
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECOMMENDATIONS.map((rec) => {
                const recIsFavorite = favoritesState[rec.id] || false;
                return (
                  <div
                    key={rec.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between border border-surface-variant"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                        src={rec.imageUrl}
                        alt={rec.title}
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-label-bold text-deep-slate border border-surface-variant/40 shadow-xs uppercase">
                          {rec.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleRecommendationFavorite(rec.id);
                        }}
                        aria-label="Guardar en favoritos"
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-600 transition-all cursor-pointer"
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{
                            fontVariationSettings: recIsFavorite ? "'FILL' 1" : "'FILL' 0",
                            color: recIsFavorite ? "#e11d48" : "inherit",
                          }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <p className="font-label-bold text-[12px] text-electric-indigo mb-1 uppercase">
                          {rec.date} • {rec.location}
                        </p>
                        <h3 className="font-headline-md text-headline-md text-deep-slate group-hover:text-electric-indigo transition-colors font-bold line-clamp-1 mb-2">
                          {rec.title}
                        </h3>
                        <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-3">
                          Acceso oficial garantizado para esta función en directo.
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-outline uppercase font-label-bold">Precio</span>
                          <span className="font-price-tag text-price-tag text-deep-slate font-extrabold text-base">
                            Desde S/. {rec.price}.00
                          </span>
                        </div>
                        <Link
                          href={`/events/${rec.id}`}
                          className="px-3.5 py-2 bg-electric-indigo text-white rounded-xl font-label-bold text-[12px] hover:bg-primary transition-all shadow-sm"
                        >
                          Comprar Entradas
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
