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

  return (
    <>
      {/* =========================================================================
          VISTA MÓVIL (STITCH STYLE)
         ========================================================================= */}
      <div className="block md:hidden bg-background min-h-screen pb-24 text-on-background">
        
        {/* Barra de Búsqueda Móvil */}
        <section className="px-4 py-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-platinum-silver">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest rounded-xl border-none shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-electric-indigo font-body-md transition-all text-on-surface outline-none"
              placeholder="¿Qué planes hoy?"
              type="text"
            />
            <Link
              href="/events"
              className="absolute inset-y-2 right-2 px-4 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer flex items-center"
            >
              Explorar
            </Link>
          </div>
        </section>

        {/* Carrusel de Destacados Móvil */}
        <section className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Destacados</h2>
            <Link className="text-electric-indigo qph-label-bold text-xs" href="/events">
              Ver todos
            </Link>
          </div>

          {isLoadingWeekly && isLoadingUpcoming ? (
            <div className="flex overflow-x-auto qph-hide-scrollbar px-4 gap-4 pb-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="min-w-[85%] rounded-2xl aspect-[3/4] bg-surface-gray animate-pulse border border-surface-variant flex-none"
                />
              ))}
            </div>
          ) : mobileFeaturedList.length > 0 ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory qph-hide-scrollbar px-4 gap-4 pb-4">
              {mobileFeaturedList.slice(0, 5).map((event) => {
                const ctaHref = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${event.id}`;
                return (
                  <div
                    key={event.id}
                    className="min-w-[85%] snap-center rounded-2xl overflow-hidden relative aspect-[3/4] shadow-md border border-surface-variant group flex-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/20 to-transparent z-10" />
                    <img
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      src={event.imageUrl}
                      alt={event.altText || event.title}
                    />
                    <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                      <span className="inline-block px-3 py-1 bg-vip-gold text-white text-[10px] qph-label-bold rounded-full uppercase mb-2">
                        {event.category || "Destacado"}
                      </span>
                      <h3 className="text-white qph-headline-md text-[20px] mb-1 font-semibold line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-platinum-silver qph-body-md text-sm mb-4">
                        {event.location} {event.date ? `• ${event.date}` : ""}
                      </p>
                      <Link
                        href={ctaHref}
                        className="w-full py-3 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer block text-center shadow-md shadow-electric-indigo/30"
                      >
                        {event.hasLandingPage ? "Ver Experiencia" : "Comprar Entradas"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-on-surface-variant text-sm bg-surface-container-lowest mx-4 rounded-2xl border border-dashed border-surface-variant">
              Próximamente más eventos destacados.
            </div>
          )}
        </section>

        {/* Chips de Categorías Móvil */}
        <section className="mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Explora por Categoría</h2>
            <Link
              href="/events"
              className="text-electric-indigo text-xs font-semibold hover:underline flex items-center gap-0.5"
            >
              Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto qph-hide-scrollbar px-4 gap-2.5 pb-2 scroll-smooth">
            {CATEGORY_CHIPS.map((cat) => {
              const isSelected = activeMobileFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveMobileFilter(isSelected ? "Todo" : cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap qph-label-bold text-xs shadow-xs transition-all flex-none cursor-pointer ${
                    isSelected
                      ? "bg-electric-indigo text-white border border-electric-indigo"
                      : "bg-white text-on-surface border border-surface-variant hover:bg-surface-gray"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSelected ? "text-white" : cat.textClass}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Eventos Próximos Móvil */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Eventos Próximos</h2>
            <Link href="/events" className="text-electric-indigo text-xs font-semibold hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            {isLoadingUpcoming ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden border border-surface-variant p-4 animate-pulse flex flex-col gap-3"
                >
                  <div className="aspect-[16/9] w-full bg-surface-gray rounded-xl" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                </div>
              ))
            ) : filteredMobileEvents.length > 0 ? (
              filteredMobileEvents.map((event) => {
                const ctaHref = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${event.id}`;
                return (
                  <Link
                    key={event.id}
                    href={ctaHref}
                    className="bg-white rounded-2xl overflow-hidden shadow-xs border border-surface-variant flex flex-col group active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="aspect-[16/9] w-full relative">
                      <img className="w-full h-full object-cover" src={event.imageUrl} alt={event.altText} />
                      {event.date && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-center shadow-xs border border-surface-variant/50">
                          <span className="block text-electric-indigo qph-label-bold text-[16px] font-bold">
                            {event.date.split(" ")[0]}
                          </span>
                          <span className="block text-on-surface-variant text-[10px] uppercase qph-label-bold">
                            {event.date.split(" ")[1]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <h4 className="qph-headline-md text-[20px] text-on-surface leading-tight font-semibold group-hover:text-electric-indigo transition-colors line-clamp-2">
                          {event.title}
                        </h4>
                        <span className="text-electric-indigo qph-price-tag text-[20px] font-bold whitespace-nowrap ml-2">
                          Desde S/. {event.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span className="qph-body-md text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-surface-gray border border-surface-variant/40 text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">
                          {event.category}
                        </span>
                        <span className="px-2 py-0.5 bg-surface-gray border border-surface-variant/40 text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">
                          {event.ticketType}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-8 text-center text-on-surface-variant text-sm bg-surface-container-lowest rounded-2xl border border-dashed border-surface-variant">
                No se encontraron eventos disponibles en esta selección.
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Móvil */}
        <section className="px-4 py-8 bg-deep-slate rounded-3xl mx-4 mb-10 text-center text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="qph-headline-lg text-[20px] font-bold mb-2">No te pierdas de nada</h3>
            <p className="text-platinum-silver qph-body-md text-sm mb-6">
              Recibe alertas personalizadas para tus eventos favoritos directamente en tu móvil.
            </p>
            <div className="flex flex-col gap-3">
              <input
                className="w-full h-12 bg-white/10 rounded-xl px-4 border-none text-white placeholder-platinum-silver focus:ring-1 focus:ring-electric-indigo outline-none"
                placeholder="Tu correo electrónico"
                type="email"
              />
              <button className="w-full h-12 bg-electric-indigo text-white font-label-bold rounded-xl shadow-lg shadow-electric-indigo/20 active:scale-95 transition-transform cursor-pointer">
                Suscribirme
              </button>
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-electric-indigo/20 rounded-full blur-3xl" />
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
