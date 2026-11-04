"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { searchEventsUseCase } from "../../features/events";
import { SearchEventItem } from "../../features/events/models/search-event.model";

const QUICK_CATEGORIES = [
  { id: "TODOS", label: "Todos", icon: "category" },
  { id: "CONCERTS", label: "Conciertos", icon: "music_note" },
  { id: "FESTIVALS", label: "Festivales", icon: "celebration" },
  { id: "THEATER", label: "Teatro", icon: "theater_comedy" },
  { id: "SPORTS", label: "Deportes", icon: "sports_soccer" },
  { id: "COMEDY", label: "Comedia", icon: "sentiment_very_satisfied" },
  { id: "GASTRONOMY", label: "Gastronomía", icon: "restaurant" },
];

const TRENDING_SEARCHES = [
  "Grupo 5",
  "Selva Viva",
  "Festival",
  "Cumbia",
  "Stand Up",
  "Rock",
  "Pucallpa",
];

function formatEventDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.toLocaleDateString("es-PE", { day: "2-digit" });
  const month = d.toLocaleDateString("es-PE", { month: "short" }).toUpperCase().replace(".", "");
  return `${day} ${month}`;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODOS");
  const [results, setResults] = useState<SearchEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enfocar input al abrir la búsqueda
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSearchOpen]);

  // Cerrar búsqueda con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed && selectedCategory === "TODOS") {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const categoryParam = selectedCategory !== "TODOS" ? selectedCategory : undefined;
      const res = await searchEventsUseCase.execute({
        q: trimmed,
        category: categoryParam,
        limit: 10,
        status: "published",
      });

      res.match(
        (data) => {
          setResults(data.hits || []);
          setIsLoading(false);
        },
        () => {
          setResults([]);
          setIsLoading(false);
        }
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSelectEvent = (event: SearchEventItem) => {
    setIsSearchOpen(false);
    const secureId = event.publicUuid || event.slug || event.id;
    const targetUrl = event.hasLandingPage && event.slug ? `/e/${event.slug}` : `/events/${secureId}`;
    router.push(targetUrl);
  };

  const handleFullSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory !== "TODOS") params.set("category", selectedCategory);
    router.push(`/events?${params.toString()}`);
  };

  const isHome = pathname === "/";
  const isExplore = pathname.startsWith("/events");
  const isTickets = pathname.startsWith("/profile/tickets");
  const isProfile = pathname.startsWith("/profile") && !isTickets;

  return (
    <>
      {/* =========================================================================
          BOTTOM NAVIGATION BAR - MOBILE
         ========================================================================= */}
      <nav className="qph-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-xl h-20 flex items-center justify-around px-2 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-outline-variant/10">
        {/* 1. Inicio */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            isHome ? "text-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isHome ? "'FILL' 1" : "'FILL' 0" }}
          >
            home
          </span>
          <span className="font-bold text-[10px] uppercase">Inicio</span>
        </Link>

        {/* 2. Explorar */}
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            isExplore ? "text-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isExplore ? "'FILL' 1" : "'FILL' 0" }}
          >
            explore
          </span>
          <span className="font-semibold text-[10px] uppercase">Explorar</span>
        </Link>

        {/* 3. BOTÓN CENTRAL AZUL: BÚSQUEDA A PANTALLA COMPLETA */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Abrir buscador"
          className="-mt-10 w-14 h-14 bg-electric-indigo text-white rounded-full shadow-lg shadow-electric-indigo/35 active:scale-95 transition-transform flex items-center justify-center cursor-pointer hover:bg-primary"
        >
          <span className="material-symbols-outlined text-[30px]">search</span>
        </button>

        {/* 4. Tickets */}
        <Link
          href="/profile/tickets"
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            isTickets ? "text-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isTickets ? "'FILL' 1" : "'FILL' 0" }}
          >
            confirmation_number
          </span>
          <span className="font-semibold text-[10px] uppercase">Tickets</span>
        </Link>

        {/* 5. Perfil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            isProfile ? "text-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}
          >
            person
          </span>
          <span className="font-semibold text-[10px] uppercase">Perfil</span>
        </Link>
      </nav>

      {/* =========================================================================
          PANTALLA COMPLETA DE BÚSQUEDA MÓVIL (FULL-SCREEN SEARCH OVERLAY)
         ========================================================================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header de Búsqueda */}
          <div className="p-4 border-b border-surface-variant flex items-center gap-3 bg-white sticky top-0 z-10 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-gray active:scale-90 transition-all cursor-pointer"
              aria-label="Cerrar búsqueda"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>

            <form onSubmit={handleFullSearchSubmit} className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-platinum-silver">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué buscas? Evento, artista o ciudad..."
                className="w-full h-12 pl-10 pr-10 bg-surface-gray rounded-xl text-sm font-body-md text-on-surface placeholder-platinum-silver border-none focus:ring-2 focus:ring-electric-indigo outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-2 px-2 flex items-center text-platinum-silver hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </form>
          </div>

          {/* Chips Horizontales de Categoría */}
          <div className="px-4 py-3 border-b border-surface-variant/60 flex items-center gap-2 overflow-x-auto qph-hide-scrollbar bg-surface-container-lowest">
            {QUICK_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-none cursor-pointer ${
                    isSelected
                      ? "bg-electric-indigo text-white shadow-2xs"
                      : "bg-surface-gray text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Área de Resultados y Tendencias (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
            {/* Estado: Buscando */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 flex items-center gap-3 animate-pulse bg-white rounded-xl border border-surface-variant">
                    <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Estado: Resultados en tiempo real */}
            {!isLoading && results.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Resultados ({results.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleFullSearchSubmit}
                    className="text-xs text-electric-indigo font-bold hover:underline"
                  >
                    Ver todos en catálogo
                  </button>
                </div>

                <div className="flex flex-col divide-y divide-surface-variant bg-white rounded-2xl border border-surface-variant overflow-hidden shadow-xs">
                  {results.map((ev) => (
                    <article
                      key={ev.id}
                      onClick={() => handleSelectEvent(ev)}
                      className="p-3 flex items-center gap-3.5 hover:bg-surface-gray/50 active:bg-surface-gray transition-colors cursor-pointer"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={ev.bannerUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-deep-slate/85 backdrop-blur-xs text-white text-[8px] font-bold uppercase px-1 py-0.5 rounded">
                          {ev.category}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {ev.date && (
                            <span className="text-[10px] font-bold text-electric-indigo uppercase tracking-wider block mb-0.5">
                              {formatEventDate(ev.date)}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-on-surface leading-tight line-clamp-1">
                            {ev.title}
                          </h4>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                            <span className="material-symbols-outlined text-[13px] text-platinum-silver">location_on</span>
                            <span className="truncate">{ev.venue || ev.address || "Perú"}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-variant/60">
                          <span className="text-xs font-bold text-on-surface">
                            Desde <span className="text-electric-indigo font-bold">S/ {ev.minPrice || 0}</span>
                          </span>
                          <span className="px-3 py-1 bg-electric-indigo text-white font-bold text-xs rounded-xl shadow-xs shadow-electric-indigo/25 flex items-center gap-1">
                            <span>Ver</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Estado: Sin resultados tras buscar */}
            {!isLoading && results.length === 0 && (searchQuery.trim().length > 0 || selectedCategory !== "TODOS") && (
              <div className="py-16 text-center px-4">
                <span className="material-symbols-outlined text-5xl text-platinum-silver mb-2">search_off</span>
                <h4 className="font-bold text-base text-deep-slate mb-1">
                  No se encontraron eventos
                </h4>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto mb-6">
                  Prueba buscando por nombre de artista, ciudad o cambia la categoría seleccionada.
                </p>
                <Link
                  href="/events"
                  onClick={() => setIsSearchOpen(false)}
                  className="px-5 py-2.5 bg-electric-indigo text-white text-xs font-bold rounded-xl shadow-md shadow-electric-indigo/25 inline-block"
                >
                  Ver toda la cartelera
                </Link>
              </div>
            )}

            {/* Estado inicial: Sugerencias y búsquedas populares */}
            {!isLoading && results.length === 0 && !searchQuery.trim() && selectedCategory === "TODOS" && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-electric-indigo">trending_up</span>
                  Búsquedas populares
                </h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {TRENDING_SEARCHES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSearchQuery(item)}
                      className="px-3 py-1.5 bg-surface-gray hover:bg-surface-container text-xs font-semibold text-deep-slate rounded-lg transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-electric-indigo">explore</span>
                  Explorar cartelera oficial
                </h4>
                <Link
                  href="/events"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-full p-4 rounded-2xl bg-surface-container-lowest border border-surface-variant flex items-center justify-between shadow-2xs hover:border-electric-indigo transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center">
                      <span className="material-symbols-outlined">confirmation_number</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-deep-slate">Todos los eventos disponibles</h5>
                      <p className="text-xs text-on-surface-variant">Conciertos, teatro, deportes y más</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-electric-indigo">chevron_right</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
