"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeroCarousel } from "./components/hero-carousel";
import { SearchBar } from "./components/search-bar";
import { EventCard, EventCardProps } from "./components/event-card";
import {
  getUpcomingEventsUseCase,
  getWeeklyFeaturedEventsUseCase,
  getWeekendEventsUseCase,
  HomeEventCardItem,
} from "../index";
import { getCategoryById } from "../constants/eventConstants";

// =========================================================================
// CATEGORÍAS OFICIALES DE QUÉ PLANES HOY
// =========================================================================
interface CategoryChip {
  id: string;
  name: string;
  icon: string;
  bgClass: string;
  textClass: string;
}

const CATEGORY_CHIPS: CategoryChip[] = [
  {
    id: "CONCERTS",
    name: "Conciertos",
    icon: "music_note",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-600",
  },
  {
    id: "THEATER",
    name: "Teatro & Musicales",
    icon: "theater_comedy",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-600",
  },
  {
    id: "SPORTS",
    name: "Deportes",
    icon: "sports_soccer",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-600",
  },
  {
    id: "FESTIVALS",
    name: "Festivales",
    icon: "festival",
    bgClass: "bg-pink-500/10",
    textClass: "text-pink-600",
  },
  {
    id: "COMEDY",
    name: "Comedia & Stand Up",
    icon: "sentiment_very_satisfied",
    bgClass: "bg-yellow-500/10",
    textClass: "text-amber-600",
  },
  {
    id: "GASTRONOMY",
    name: "Gastronomía",
    icon: "restaurant",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600",
  },
];

// =========================================================================
// FORMATEO Y MAPEO DESDE ENTIDADES DE BACKEND
// =========================================================================
function formatEventDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.toLocaleDateString("es-PE", { day: "2-digit" });
  const month = d.toLocaleDateString("es-PE", { month: "short" }).toUpperCase().replace(".", "");
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

function homeCardToEventCardProps(item: HomeEventCardItem): EventCardProps {
  const cat = getCategoryById(item.category);
  return {
    id: item.id,
    publicUuid: item.publicUuid,
    slug: item.slug,
    hasLandingPage: item.hasLandingPage,
    title: item.title,
    category: cat?.label || item.category,
    imageUrl:
      item.imageUrl ||
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    altText: item.title,
    date: formatEventDate(item.date),
    location: item.city || item.venue || "PERÚ",
    price: item.minPrice,
    ticketType: item.ticketType || "General",
    ticketBadgeStyle: item.ticketBadgeStyle || "general",
    description: item.description || "Acceso oficial garantizado para esta función en directo.",
    urgencyText: item.urgencyBadge?.text || "Aforo limitado",
    urgencyIcon: item.urgencyBadge?.icon || "bolt",
    urgencyType: item.urgencyBadge?.type || "info",
  };
}

// =========================================================================
// COMPONENTES AUXILIARES: SKELETONS Y EMPTY STATES
// =========================================================================
function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-surface-variant flex flex-col justify-between animate-pulse">
      <div className="aspect-video bg-surface-gray w-full relative">
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-12 bg-slate-200 rounded-full" />
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-full bg-slate-100 rounded mb-1" />
          <div className="h-3 w-4/5 bg-slate-100 rounded mb-3" />
          <div className="h-3 w-28 bg-slate-200 rounded mb-2" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function MobileRowSkeleton() {
  return (
    <div className="p-3 flex items-center gap-3.5 animate-pulse">
      <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-slate-200" />
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div className="h-3 w-28 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-1/2 bg-slate-100 rounded mb-3" />
        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
          <div className="h-3 w-16 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function EmptySectionMessage({ message }: { message: string }) {
  return (
    <div className="col-span-full py-12 px-6 rounded-2xl bg-surface-container-lowest border border-dashed border-surface-variant text-center flex flex-col items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-outline mb-2">calendar_today</span>
      <p className="font-body-md text-sm text-on-surface-variant">{message}</p>
      <Link
        href="/events"
        className="mt-3 text-electric-indigo font-label-bold text-xs hover:underline inline-flex items-center gap-1"
      >
        Explorar toda la cartelera <span className="material-symbols-outlined text-xs">arrow_forward</span>
      </Link>
    </div>
  );
}

// =========================================================================
// PÁGINA PRINCIPAL (HOME PAGE)
// =========================================================================
export default function HomePage() {
  const [activeMobileFilter, setActiveMobileFilter] = useState("Todo");
  const [upcomingEvents, setUpcomingEvents] = useState<EventCardProps[]>([]);
  const [weeklyFeaturedEvents, setWeeklyFeaturedEvents] = useState<EventCardProps[]>([]);
  const [weekendPlans, setWeekendPlans] = useState<EventCardProps[]>([]);

  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(true);
  const [isLoadingWeekend, setIsLoadingWeekend] = useState(true);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Cargar Próximos Eventos desde Redis / Backend
    getUpcomingEventsUseCase.execute().then((res) => {
      if (!isMounted) return;
      res.match(
        (items) => {
          setUpcomingEvents(items ? items.map(homeCardToEventCardProps) : []);
        },
        () => {
          setUpcomingEvents([]);
        }
      );
      setIsLoadingUpcoming(false);
    });

    // 2. Cargar Destacados Semanales desde Redis / Backend
    getWeeklyFeaturedEventsUseCase.execute().then((res) => {
      if (!isMounted) return;
      res.match(
        (items) => {
          setWeeklyFeaturedEvents(items ? items.map(homeCardToEventCardProps) : []);
        },
        () => {
          setWeeklyFeaturedEvents([]);
        }
      );
      setIsLoadingWeekly(false);
    });

    // 3. Cargar Planes de Fin de Semana desde Redis / Backend
    getWeekendEventsUseCase.execute().then((res) => {
      if (!isMounted) return;
      res.match(
        (items) => {
          setWeekendPlans(items ? items.map(homeCardToEventCardProps) : []);
        },
        () => {
          setWeekendPlans([]);
        }
      );
      setIsLoadingWeekend(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 380;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Filtrado reactivo en vista móvil
  const filteredMobileEvents = upcomingEvents.filter((event) => {
    if (activeMobileFilter === "Todo") return true;
    const catMap: Record<string, string> = {
      CONCERTS: "concierto",
      THEATER: "teatro",
      SPORTS: "deportes",
      FESTIVALS: "festivales",
      COMEDY: "comedia",
      GASTRONOMY: "gastronomia",
    };
    const target = (catMap[activeMobileFilter] || activeMobileFilter).toLowerCase();
    return event.category.toLowerCase().includes(target) || target.includes(event.category.toLowerCase());
  });

  // Eventos para carrusel móvil (destacados o fallback a próximos)
  const mobileFeaturedList =
    weeklyFeaturedEvents.length > 0
      ? weeklyFeaturedEvents
      : upcomingEvents.slice(0, 5);

  const mobileHeroRef = useRef<HTMLDivElement>(null);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);

  const scrollToMobileSlide = (index: number) => {
    setCurrentMobileSlide(index);
    if (mobileHeroRef.current) {
      const width = mobileHeroRef.current.offsetWidth;
      mobileHeroRef.current.scrollTo({
        left: index * width,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (mobileFeaturedList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentMobileSlide((prev) => {
        const next = (prev + 1) % mobileFeaturedList.length;
        if (mobileHeroRef.current) {
          const width = mobileHeroRef.current.offsetWidth;
          mobileHeroRef.current.scrollTo({
            left: next * width,
            behavior: "smooth",
          });
        }
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [mobileFeaturedList.length]);

  return (
    <>
      {/* =========================================================================
          VISTA MÓVIL (STITCH STYLE - OPTIMIZADA)
         ========================================================================= */}
      <div className="block md:hidden bg-background min-h-screen pb-32 text-on-background">
        
        {/* 1. Hero Banner Cinematográfico Móvil (Full-Width 380px Stitch Style) */}
        {isLoadingWeekly && isLoadingUpcoming ? (
          <section className="relative w-full h-[380px] bg-slate-900 animate-pulse mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/60 to-transparent" />
            <div className="absolute bottom-5 inset-x-0 p-5 z-20 flex flex-col justify-end">
              <div className="h-5 w-44 bg-white/20 rounded-full mb-3" />
              <div className="h-8 w-3/4 bg-white/20 rounded-lg mb-2" />
              <div className="h-4 w-1/2 bg-white/10 rounded mb-4" />
              <div className="h-11 w-full bg-electric-indigo/40 rounded-xl" />
            </div>
          </section>
        ) : mobileFeaturedList.length > 0 ? (
          <section className="relative w-full h-[380px] overflow-hidden mb-6 group">
            {/* Contenedor de slides de ancho completo */}
            <div
              ref={mobileHeroRef}
              onScroll={(e) => {
                const target = e.currentTarget;
                const index = Math.round(target.scrollLeft / target.offsetWidth);
                if (index !== currentMobileSlide && index >= 0 && index < mobileFeaturedList.length) {
                  setCurrentMobileSlide(index);
                }
              }}
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory qph-hide-scrollbar"
            >
              {mobileFeaturedList.map((event) => {
                const secureId = event.publicUuid || event.slug || event.id;
                const ctaHref = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${secureId}`;
                return (
                  <div key={event.id} className="relative w-full h-full flex-none snap-center">
                    {/* Imagen de fondo de ancho completo */}
                    <img
                      src={event.imageUrl}
                      alt={event.altText || event.title}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Gradiente cinematográfico oscuro */}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/60 to-transparent" />

                    {/* Badge superior izquierdo */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-2.5 py-1 bg-electric-indigo/90 backdrop-blur-md text-white text-[11px] qph-label-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        EN VIVO ESTE FIN DE SEMANA
                      </span>
                    </div>

                    {/* Contenido inferior integrado */}
                    <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex flex-col justify-end">
                      {event.date && (
                        <div className="flex items-center gap-2 mb-1.5 text-platinum-silver text-xs qph-label-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[15px] text-electric-indigo">calendar_today</span>
                          <span>{event.date}</span>
                        </div>
                      )}
                      <h2 className="text-white qph-headline-lg-mobile text-[22px] leading-tight font-bold tracking-tight mb-1.5 line-clamp-2">
                        {event.title}
                      </h2>
                      <p className="text-platinum-silver text-xs flex items-center gap-1 mb-4">
                        <span className="material-symbols-outlined text-[15px] text-platinum-silver">location_on</span>
                        <span>{event.location}</span>
                      </p>
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={ctaHref}
                          className="flex-1 h-11 bg-electric-indigo hover:bg-primary text-white text-sm qph-label-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/30 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <span>{event.hasLandingPage ? "Ver Experiencia" : `Comprar Entradas • Desde S/ ${event.price}`}</span>
                        </Link>
                        <button
                          type="button"
                          aria-label="Guardar en favoritos"
                          className="h-11 w-11 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Puntos de navegación horizontales (Dots de Stitch) */}
            {mobileFeaturedList.length > 1 && (
              <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-30 pointer-events-none">
                {mobileFeaturedList.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => scrollToMobileSlide(dotIdx)}
                    aria-label={`Ir al slide ${dotIdx + 1}`}
                    className={`transition-all duration-300 pointer-events-auto rounded-full ${
                      currentMobileSlide === dotIdx
                        ? "w-5 h-1.5 bg-electric-indigo shadow-xs"
                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* 2. Chips de Categorías Móvil (Horizontal Chips) */}
        <section className="mb-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="qph-headline-md text-[18px] text-on-surface font-bold tracking-tight">Explora por Categoría</h3>
            <Link
              href="/events"
              className="text-xs text-electric-indigo qph-label-bold hover:underline flex items-center gap-0.5"
            >
              Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto qph-hide-scrollbar gap-2 pb-1 -mx-4 px-4 scroll-smooth">
            <button
              onClick={() => setActiveMobileFilter("Todo")}
              className={`whitespace-nowrap px-4 py-2 rounded-full qph-label-bold text-xs shadow-xs transition-colors flex-none cursor-pointer ${
                activeMobileFilter === "Todo"
                  ? "bg-deep-slate text-white"
                  : "bg-surface-container-lowest text-on-surface-variant border border-surface-variant hover:bg-surface-gray"
              }`}
            >
              Todos
            </button>
            {CATEGORY_CHIPS.map((cat) => {
              const isSelected = activeMobileFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveMobileFilter(isSelected ? "Todo" : cat.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full qph-label-bold text-xs shadow-xs transition-colors flex-none cursor-pointer ${
                    isSelected
                      ? "bg-electric-indigo text-white border border-electric-indigo"
                      : "bg-surface-container-lowest text-on-surface-variant border border-surface-variant hover:bg-surface-gray"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[15px] ${isSelected ? "text-white" : cat.textClass}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. SECCIÓN: DESTACADOS DE LA SEMANA */}
        {weeklyFeaturedEvents.length > 0 && (
          <section className="px-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="qph-headline-md text-[18px] text-on-surface font-bold tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-vip-gold text-[20px]">star</span>
                  Destacados de la Semana
                </h3>
                <p className="text-xs text-on-surface-variant">Los eventos más solicitados por el público</p>
              </div>
              <Link href="/events?sort=date_asc" className="text-xs text-electric-indigo qph-label-bold hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-surface-variant bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant overflow-hidden">
              {weeklyFeaturedEvents.slice(0, 4).map((event) => {
                const secureId = event.publicUuid || event.slug || event.id;
                const ctaHref = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${secureId}`;
                return (
                  <article
                    key={`weekly-${event.id}`}
                    className="p-3 flex items-center gap-3.5 hover:bg-surface-gray/50 transition-colors active:scale-[0.99]"
                  >
                    <Link
                      href={ctaHref}
                      className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface-gray group cursor-pointer"
                    >
                      <img
                        src={event.imageUrl}
                        alt={event.altText || event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-vip-gold text-white text-[9px] qph-label-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                        DESTACADO
                      </span>
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <Link href={ctaHref} className="block group cursor-pointer">
                        {event.date && (
                          <span className="text-[11px] qph-label-bold text-electric-indigo uppercase tracking-wider block mb-0.5">
                            {event.date}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-electric-indigo transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                          <span className="material-symbols-outlined text-[13px] text-platinum-silver">location_on</span>
                          <span className="truncate">{event.location}</span>
                        </p>
                      </Link>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-variant/60">
                        <span className="text-xs font-bold text-on-surface">
                          Desde <span className="text-electric-indigo qph-price-tag text-sm">S/ {event.price}</span>
                        </span>
                        <Link
                          href={ctaHref}
                          className="px-3.5 py-1.5 bg-electric-indigo hover:bg-primary text-white qph-label-bold text-xs rounded-xl shadow-xs shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer font-bold"
                        >
                          {event.hasLandingPage ? "Ver" : "Comprar"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. SECCIÓN: EVENTOS PRÓXIMOS (Con filtrado reactivo de categorías) */}
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="qph-headline-md text-[18px] text-on-surface font-bold tracking-tight">
                Eventos Próximos
              </h3>
              <p className="text-xs text-on-surface-variant">Cartelera ordenada por fecha de presentación</p>
            </div>
            <Link href="/events" className="text-xs text-electric-indigo qph-label-bold hover:underline">
              Ver todos ({filteredMobileEvents.length})
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-surface-variant bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant overflow-hidden">
            {isLoadingUpcoming ? (
              [1, 2, 3, 4].map((i) => <MobileRowSkeleton key={i} />)
            ) : filteredMobileEvents.length > 0 ? (
              filteredMobileEvents.slice(0, 6).map((event) => {
                const secureId = event.publicUuid || event.slug || event.id;
                const ctaHref = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${secureId}`;
                return (
                  <article
                    key={`upcoming-${event.id}`}
                    className="p-3 flex items-center gap-3.5 hover:bg-surface-gray/50 transition-colors active:scale-[0.99]"
                  >
                    <Link
                      href={ctaHref}
                      className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface-gray group cursor-pointer"
                    >
                      <img
                        src={event.imageUrl}
                        alt={event.altText || event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-deep-slate/85 backdrop-blur-sm text-white text-[9px] qph-label-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                        {event.category || "EVENTO"}
                      </span>
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <Link href={ctaHref} className="block group cursor-pointer">
                        {event.date && (
                          <span className="text-[11px] qph-label-bold text-electric-indigo uppercase tracking-wider block mb-0.5">
                            {event.date}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-electric-indigo transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                          <span className="material-symbols-outlined text-[13px] text-platinum-silver">location_on</span>
                          <span className="truncate">{event.location}</span>
                        </p>
                      </Link>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-variant/60">
                        <span className="text-xs font-bold text-on-surface">
                          Desde <span className="text-electric-indigo qph-price-tag text-sm">S/ {event.price}</span>
                        </span>
                        <Link
                          href={ctaHref}
                          className="px-3.5 py-1.5 bg-electric-indigo hover:bg-primary text-white qph-label-bold text-xs rounded-xl shadow-xs shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer font-bold"
                        >
                          {event.hasLandingPage ? "Ver" : "Comprar"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="py-8 text-center text-on-surface-variant text-sm p-4">
                No se encontraron eventos próximos en esta categoría.
              </div>
            )}
          </div>
        </section>

        {/* 5. SECCIÓN: PLANES PARA EL FIN DE SEMANA */}
        {weekendPlans.length > 0 && (
          <section className="px-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="qph-headline-md text-[18px] text-on-surface font-bold tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-500 text-[20px]">weekend</span>
                  Planes de Fin de Semana
                </h3>
                <p className="text-xs text-on-surface-variant">Disfruta este sábado y domingo sin complicaciones</p>
              </div>
              <Link href="/events?date=weekend" className="text-xs text-electric-indigo qph-label-bold hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="flex flex-col divide-y divide-surface-variant bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant overflow-hidden">
              {weekendPlans.slice(0, 4).map((event) => {
                const secureId = event.publicUuid || event.slug || event.id;
                const ctaHref = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${secureId}`;
                return (
                  <article
                    key={`weekend-${event.id}`}
                    className="p-3 flex items-center gap-3.5 hover:bg-surface-gray/50 transition-colors active:scale-[0.99]"
                  >
                    <Link
                      href={ctaHref}
                      className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-surface-gray group cursor-pointer"
                    >
                      <img
                        src={event.imageUrl}
                        alt={event.altText || event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] qph-label-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                        FIN DE SEMANA
                      </span>
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <Link href={ctaHref} className="block group cursor-pointer">
                        {event.date && (
                          <span className="text-[11px] qph-label-bold text-electric-indigo uppercase tracking-wider block mb-0.5">
                            {event.date}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-electric-indigo transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                          <span className="material-symbols-outlined text-[13px] text-platinum-silver">location_on</span>
                          <span className="truncate">{event.location}</span>
                        </p>
                      </Link>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-variant/60">
                        <span className="text-xs font-bold text-on-surface">
                          Desde <span className="text-electric-indigo qph-price-tag text-sm">S/ {event.price}</span>
                        </span>
                        <Link
                          href={ctaHref}
                          className="px-3.5 py-1.5 bg-electric-indigo hover:bg-primary text-white qph-label-bold text-xs rounded-xl shadow-xs shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer font-bold"
                        >
                          {event.hasLandingPage ? "Ver" : "Comprar"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. Newsletter Móvil (Stitch Style) */}
        <section className="px-5 py-8 bg-deep-slate rounded-2xl mx-4 mb-8 text-center text-white overflow-hidden relative">
          <div className="relative z-10">
            <span className="inline-block px-2.5 py-0.5 bg-electric-indigo/30 text-electric-indigo text-[10px] qph-label-bold rounded-full uppercase tracking-wider mb-2">
              Newsletter QPH
            </span>
            <h3 className="qph-headline-md text-[20px] font-bold mb-1.5">No te pierdas de nada</h3>
            <p className="text-platinum-silver font-body-md text-xs mb-5 max-w-xs mx-auto">
              Alertas de preventa y descuentos exclusivos directamente a tu correo.
            </p>
            <div className="flex flex-col gap-2.5">
              <input
                className="w-full h-11 bg-white/10 rounded-xl px-4 border-none text-white text-sm placeholder-platinum-silver focus:ring-1 focus:ring-electric-indigo outline-none"
                placeholder="Tu correo electrónico"
                type="email"
              />
              <button className="w-full h-11 bg-electric-indigo hover:bg-primary text-white qph-label-bold text-sm rounded-xl shadow-lg shadow-electric-indigo/20 active:scale-[0.98] transition-all cursor-pointer">
                Suscribirme gratis
              </button>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-electric-indigo/20 rounded-full blur-3xl pointer-events-none" />
        </section>
      </div>

      {/* =========================================================================
          VISTA ESCRITORIO (JERARQUÍA OPTIMIZADA DE STITCH)
         ========================================================================= */}
      <div className="hidden md:block flex-1 w-full bg-background">
        
        {/* 1. Hero Section con Carrusel & Search Overlay */}
        <div className="relative w-full">
          <HeroCarousel />
          <SearchBar />
        </div>

        {/* 2. Explora por Categoría (HORIZONTAL ENRICHED CHIPS DE STITCH) */}
        <section className="max-w-container-max mx-auto px-margin-x pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="qph-headline-lg text-deep-slate">Explora por Categoría</h2>
              <p className="qph-body-md text-on-surface-variant">
                Encuentra planes según tus gustos e intereses.
              </p>
            </div>

            {/* Controles de Navegación Horizontal */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories("left")}
                aria-label="Desplazar categorías hacia la izquierda"
                className="w-10 h-10 rounded-full border border-surface-variant bg-white hover:bg-surface-gray text-deep-slate shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:border-electric-indigo"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                aria-label="Desplazar categorías hacia la derecha"
                className="w-10 h-10 rounded-full border border-surface-variant bg-white hover:bg-surface-gray text-deep-slate shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:border-electric-indigo"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            onWheel={handleCategoryWheel}
            className="flex items-center gap-3.5 overflow-x-auto qph-hide-scrollbar pb-3 scroll-smooth select-none"
          >
            {CATEGORY_CHIPS.map((chip) => (
              <Link
                key={chip.id}
                href={`/events?category=${chip.id.toLowerCase()}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-surface-variant hover:border-electric-indigo shadow-xs hover:shadow-sm transition-all group flex-none cursor-pointer active:scale-[0.98]"
              >
                <span
                  className={`w-9 h-9 rounded-xl ${chip.bgClass} ${chip.textClass} flex items-center justify-center group-hover:bg-electric-indigo group-hover:text-white transition-colors`}
                >
                  <span className="material-symbols-outlined text-lg">{chip.icon}</span>
                </span>
                <span className="font-label-bold text-label-bold text-on-surface group-hover:text-electric-indigo transition-colors whitespace-nowrap">
                  {chip.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Eventos Próximos */}
        <section className="max-w-container-max mx-auto px-margin-x pt-4 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="qph-headline-lg text-deep-slate mb-1">Eventos Próximos</h2>
              <p className="qph-body-md text-on-surface-variant">
                Los espectáculos más esperados que están a punto de comenzar.
              </p>
            </div>
            <Link
              href="/events"
              className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {isLoadingUpcoming ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => <EventCard key={event.id} {...event} />)
            ) : (
              <EmptySectionMessage message="No hay eventos próximos registrados en este momento." />
            )}
          </div>
        </section>

        {/* 4. Eventos Destacados de la Semana (SELECCIÓN EDITORIAL) */}
        <section className="max-w-container-max mx-auto px-margin-x pt-4 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-electric-indigo text-lg">bolt</span>
                <span className="font-label-bold text-[12px] text-electric-indigo uppercase tracking-wider">
                  Selección Editorial
                </span>
              </div>
              <h2 className="qph-headline-lg text-deep-slate">Eventos Destacados de la Semana</h2>
              <p className="qph-body-md text-on-surface-variant">
                Las citas culturales y de entretenimiento imprescindibles en tu ciudad.
              </p>
            </div>
            <Link
              href="/events"
              className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              Ver cartelera completa <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {isLoadingWeekly ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : weeklyFeaturedEvents.length > 0 ? (
              weeklyFeaturedEvents.map((ev) => <EventCard key={ev.id} {...ev} />)
            ) : (
              <EmptySectionMessage message="Próximamente publicaremos nuevos eventos destacados de la semana." />
            )}
          </div>
        </section>

        {/* 5. Planes para Este Fin de Semana (TENDENCIAS Y MÁS POPULARES) */}
        <section className="max-w-container-max mx-auto px-margin-x pt-4 pb-12 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-vip-gold text-lg">trending_up</span>
                <span className="font-label-bold text-[12px] text-vip-gold uppercase tracking-wider">
                  Tendencias &amp; Más Populares
                </span>
              </div>
              <h2 className="qph-headline-lg text-deep-slate">Planes para Este Fin de Semana</h2>
              <p className="qph-body-md text-on-surface-variant">
                Las experiencias con mayor demanda y valoraciones más altas de la comunidad.
              </p>
            </div>
            <Link
              href="/events"
              className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              Ver ranking completo <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {isLoadingWeekend ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : weekendPlans.length > 0 ? (
              weekendPlans.map((plan) => <EventCard key={plan.id} {...plan} />)
            ) : (
              <EmptySectionMessage message="Aún no hay planes específicos programados para este fin de semana." />
            )}
          </div>
        </section>

      </div>
    </>
  );
}
