"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { EVENT_CATEGORIES } from "../constants/eventConstants";
import { getPublishedCitiesUseCase, PublishedCity } from "../index";

interface ExploreEvent {
  id: string | number;
  title: string;
  category: "conciertos" | "teatro" | "deportes" | "festivales" | "comedia" | "gastronomia";
  categoryLabel: string;
  hasVip: boolean;
  imageUrl: string;
  dateStr: string;
  timeStr: string;
  location: string;
  city: string;
  price: number;
  popularity: number;
  description?: string;
  urgencyText?: string;
  urgencyIcon?: string;
}

const CATALOG_EVENTS: ExploreEvent[] = [
  {
    id: 1,
    title: "Neon Pulse: Tour Mundial 2024",
    category: "conciertos",
    categoryLabel: "Concierto",
    hasVip: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDx68N5ktAxUu8BdVvppGk25pxGBDX2GRzTYDQXUt9B5plHeZT-YF5wVep0TiuLBffWwClpulHSgPJFHeywpb9Nxby9I0S4AAnLmF9zBhqa5lBET5M7HE9PG5nFIeGuch9_hPPHZGc-qtYQB5iCjwgx0gBI_u_DtpNGTPkIY_H1RkWtVUZAVCSPUwSYqGRKW86dHrWgrKr-O1pdl8XZae-e_b1mM4Bf0kyyqwvHvg5p__Mathttrlwa0qC-LljgFZpnYeXzseLUIGxD",
    dateStr: "15 NOV, 2024",
    timeStr: "20:00 PM",
    location: "Estadio Nacional",
    city: "Lima",
    price: 120,
    popularity: 98,
    description: "La mayor producción audiovisual y pirotecnia del año en vivo con iluminación láser 360°.",
    urgencyText: "Últimas 15 entradas disponibles",
    urgencyIcon: "bolt",
  },
  {
    id: 2,
    title: "El Fantasma de la Ópera",
    category: "teatro",
    categoryLabel: "Teatro",
    hasVip: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvCijwtoBcFGGsOgH612WdgVhptsxK5VrMUfkXRHC8ZnImv6_QDVLolvJMo6UgucwhKUiNbLtQW0JpcWCqcX0JSMWDbpqFJyh2P8C04RL7AdeuNJ0Rw3eNp1YVjSSH_3LuBMUgV3VZG9u4ivC_1lbKV4un7is0odlvOjb1R_jDaC9i5RwJf6ew7tDd59qEpZe5uvdjweI-nMinLJNXmrnckigPdBuw6EQyGgNLXoSzxl4D-fWIfNMSgf_LDispYxhjsF9Hn7sMloo7",
    dateStr: "02 DIC, 2024",
    timeStr: "19:30 PM",
    location: "Teatro Segura",
    city: "Lima",
    price: 45,
    popularity: 88,
    description: "El aclamado clásico de Broadway interpretado por orquesta sinfónica completa y elenco estelar.",
    urgencyText: "Aforo al 92%",
    urgencyIcon: "local_fire_department",
  },
  {
    id: 3,
    title: "Final Liga de Basket: Playoffs",
    category: "deportes",
    categoryLabel: "Deportes",
    hasVip: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAWIXek-zpjIinj-PvT4Qj9FK42jK8dZgoQ6MfwnDzRy7R3LHETM4KFxsIvd8prlgWc_L81AUH5N1tgXWpFgSveF6mhCD7cQYDawz8WaXF6OKWTHc8j0QVPiTRatugn7pX2GRF04vWaj3iiu19w4Dke8hLonaSMV16WQGEmTnLntGieA8kqFlKYf2FOBB7KrG3u51FOb6AokVid21wb30DmPRsYoN3yoT8ugIT8_YNt8qWLiZoz5WhAjSAyevkoIMwVu6a3EYvxiGt",
    dateStr: "12 NOV, 2024",
    timeStr: "16:00 PM",
    location: "Coliseo Dibós",
    city: "Lima",
    price: 30,
    popularity: 76,
    description: "El duelo definitivo por el título nacional con emoción pura y asientos de tribuna preferencial.",
    urgencyText: "Entradas limitadas",
    urgencyIcon: "bolt",
  },
  {
    id: 4,
    title: "Festival Jardines de Lima",
    category: "festivales",
    categoryLabel: "Festival",
    hasVip: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVPT7-hwsVGFPnXOywAVi3nje9WncAVGjrmUvfcUFyU14KLYTsKTP1qU6EArKH3K8FGfyihbj9tzsXwNh7Xu2pbKTFLx9B07-VfH4FthxWkA1wQVkcPsJDCm4TzwIIvm92kYOE8G-cUhWzIdGmPPl8sZnrVGDmhCEoiuhMDIOj4cFGPaJeZSQaBEgPCuL8iH5_W0Gi51O0hnyFz5PQarjrEWlgWejwz9aF0hkB1V_79y1ESdXvO_HAY1XJIyCPs56wKP701zJN1i4p",
    dateStr: "18 DIC, 2024",
    timeStr: "12:00 PM",
    location: "Parque de la Exposición",
    city: "Lima",
    price: 85,
    popularity: 92,
    description: "Tres escenarios al aire libre, más de 20 agrupaciones independientes y feria gastronómica.",
    urgencyText: "Pases VIP agotándose",
    urgencyIcon: "star",
  },
  {
    id: 5,
    title: "Sinfonía de las Estrellas",
    category: "teatro",
    categoryLabel: "Clásica",
    hasVip: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7E0UFjzRDXfBB--rYurc0cGOw0-4yYkeLqvtDdHYkOcCZahMLGDuv2UAW-bxdIc8_xenxf44YA9WJFeQ-kryVlX0JFEfT7uPOwV764-9zvhRqXbMqIIQKmsD6nWmN43ejHwrf3j4qZ8SNIpjpMGoqePCdQWnLFfJRfBe_uCm8WYCqPraQ0NP5Zrdu4XT8HQJQ2QL0opuHJHZzFOBQp52NINZmj3z4k0ViWXAz3J6OcllZRuQzCy-QvWhvf6nwNPIkCKdKhW0fJPkT",
    dateStr: "16 NOV, 2024",
    timeStr: "20:30 PM",
    location: "Gran Teatro Nacional",
    city: "Lima",
    price: 38,
    popularity: 85,
    description: "Homenaje a las bandas sonoras cinematográficas más épicas con coro polifónico en vivo.",
    urgencyText: "Últimas 25 localidades",
    urgencyIcon: "bolt",
  },
  {
    id: 6,
    title: "Indie Sounds Winter Fest",
    category: "conciertos",
    categoryLabel: "Concierto",
    hasVip: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBr71UQlSs2FurLsTGl6gPOxEX9hPMWEvCnfbWa9DBE-cUs538DUDJOqNPrp58TlvmNywhioPq7t5zgFDtsHuWE1CaR7V00dAs7D9el7hAVDM4tkAzeIn0PsE5X6YDxY6_Bq4L6zeO0xj3VruNNUlS7xdsextrNrv0sZZibfkJdUzfS6VSn73BW3H1n_IxShci9L0Bdy-kTWkKaFQp4Fe8zsxvXK8SCd517vfmIyU2X_l2s0lNh_9KazuVBowqKJypvC64xoScIFOvS",
    dateStr: "07 DIC, 2024",
    timeStr: "18:00 PM",
    location: "Centro de Convenciones Barranco",
    city: "Lima",
    price: 35,
    popularity: 89,
    description: "Actuaciones exclusivas de bandas revelación nacionales e internacionales en cabina acústica.",
    urgencyText: "Entradas limitadas",
    urgencyIcon: "bolt",
  },
  {
    id: 7,
    title: "Noche de Stand-Up Comedy Top",
    category: "comedia",
    categoryLabel: "Comedia",
    hasVip: false,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBifKJs2zCLJ21dWBYTNT1ATyvcDIaj7OA-duslvbS3C58Dc3sn4TODUamdiTgHbQ1hWJXAzxZOhbv7S77GwkZTPEV6brn_dNl7LDcahYhJdY5kmmuRaj-KWz19yNiZc84dFWs-gJnVf30oijXVpM-abXcFk294wbyqHRCQCJV7J4Zaf_K62_bSCqWfajU8PO1nRkOdmOurG39yqQaPgaLR45DYUmDGIsl-lWBdsuYjVMnUvX6SkC_DYGOQTcCcEX0lxyG-THTKtVc_",
    dateStr: "28 NOV, 2024",
    timeStr: "21:00 PM",
    location: "La Estación de Barranco",
    city: "Lima",
    price: 25,
    popularity: 82,
    description: "Los mejores comediantes del circuito nacional reunidos en una velada de risas garantizadas.",
    urgencyText: "Casi agotado",
    urgencyIcon: "local_fire_department",
  },
  {
    id: 8,
    title: "Gourmet & Wine Masterclass",
    category: "gastronomia",
    categoryLabel: "Gastronomía",
    hasVip: true,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBy-wUVgXEhItgD7xM7FmRd4wZkk3Daggm3B3DNGO4daZVlaQloOxBFcILLpSFZg_81ZvUtB-Ku7ifn0_O-fnqu6WascuRJcaQDLMK49-kwrhwD6PDXA8Bv5oUkW2UnFsu6znIwRhdSWC9T2RSRFfJnfDQ8-zZ2_SYIgphpzobyl293G5XpKHY8PxLMxuCKU5EPz6cjfQwTv6jQ16XXwKIrcr0nZlYwqoSMPXhyvqjUgab-EtHaryokqzykL1U0IW7zwiouG6GdI2hE",
    dateStr: "14 DIC, 2024",
    timeStr: "13:00 PM",
    location: "Casa Prado Miraflores",
    city: "Lima",
    price: 65,
    popularity: 79,
    description: "Maridaje de vinos de alta gama y tapas de autor preparados en vivo por sommeliers galardonados.",
    urgencyText: "Cupos reducidos",
    urgencyIcon: "star",
  },
];

export default function ExploreEventsPageComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedCity, setSelectedCity] = useState<string>("Todos");
  const [publishedCities, setPublishedCities] = useState<PublishedCity[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [dateFilter, setDateFilter] = useState<"all" | "weekend" | "next_week">("all");
  const [sortBy, setSortBy] = useState<"relevant" | "price_asc" | "date">("relevant");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string | number, boolean>>({});
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  // Cargar ciudades con eventos en estado 'published'
  useEffect(() => {
    let isMounted = true;
    getPublishedCitiesUseCase.execute().then((res) => {
      res.match(
        (cities) => {
          if (isMounted) setPublishedCities(cities);
        },
        () => {}
      );
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Atajo de teclado ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("event-search-input");
        if (input) input.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrado reactivo en tiempo real
  const filteredEvents = useMemo(() => {
    return CATALOG_EVENTS.filter((ev) => {
      // Búsqueda por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchLoc = ev.location.toLowerCase().includes(q);
        const matchCat = ev.categoryLabel.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchCat) return false;
      }

      // Categoría
      if (selectedCategory !== "todos" && ev.category !== selectedCategory) {
        return false;
      }

      // Ciudad
      if (selectedCity !== "Todos" && ev.city !== selectedCity) {
        return false;
      }

      // Precio máximo
      if (ev.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "relevant") return b.popularity - a.popularity;
      return 0;
    });
  }, [searchTerm, selectedCategory, selectedCity, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("todos");
    setSelectedCity("Todos");
    setMaxPrice(500);
    setDateFilter("all");
    setSortBy("relevant");
  };

  return (
    <div className="w-full bg-background min-h-screen text-on-background">
      {/* =========================================================================
          CONTENEDOR PRINCIPAL
         ========================================================================= */}
      <main className="max-w-container-max mx-auto px-4 sm:px-8 py-8 sm:py-12">
        
        {/* Cabecera y Buscador Hero */}
        <header className="mb-10">
          <h1 className="qph-headline-lg text-deep-slate mb-6">
            Explora experiencias únicas
          </h1>

          {/* Input de Búsqueda con Atajo ⌘K */}
          <div className="relative group max-w-4xl">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-2xl">search</span>
            </div>

            <input
              id="event-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsAutocompleteOpen(true)}
              onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 200)}
              placeholder="Buscar por artista, evento o ciudad..."
              className="w-full pl-13 pr-16 py-4 sm:py-5 bg-white border border-surface-variant rounded-2xl shadow-xs focus:ring-2 focus:ring-electric-indigo qph-body-lg text-on-surface placeholder:text-platinum-silver transition-all outline-none"
            />

            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <kbd className="hidden md:inline-flex items-center gap-1 bg-surface-gray px-2.5 py-1 rounded-lg text-xs font-semibold text-deep-slate border border-surface-variant">
                <span>⌘</span>K
              </kbd>
            </div>

            {/* Dropdown de Autocomplete Sugerencias */}
            {isAutocompleteOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-surface-variant z-40 overflow-hidden animate-in fade-in">
                <div className="p-3 border-b border-surface-variant qph-label-bold text-xs text-platinum-silver">
                  Sugerencias Rápidas
                </div>
                <div
                  onMouseDown={() => setSearchTerm("Rock")}
                  className="hover:bg-surface-gray p-3.5 flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-electric-indigo">music_note</span>
                  <div>
                    <p className="qph-label-bold text-xs text-deep-slate">Conciertos de Rock &amp; Metal</p>
                    <p className="text-[11px] text-platinum-silver">Estadio Nacional, Lima</p>
                  </div>
                </div>
                <div
                  onMouseDown={() => setSearchTerm("Teatro")}
                  className="hover:bg-surface-gray p-3.5 flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-electric-indigo">theater_comedy</span>
                  <div>
                    <p className="qph-label-bold text-xs text-deep-slate">Romeo y Julieta - Temporada 2024</p>
                    <p className="text-[11px] text-platinum-silver">Teatro Municipal, Lima</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* =======================================================================
            LAYOUT: SIDEBAR FILTERS (DESKTOP) + RESULTADOS GRID
           ======================================================================= */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          
          {/* SIDEBAR DE FILTROS (DESKTOP) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-7 bg-white p-6 rounded-2xl border border-surface-variant shadow-xs sticky top-28">
            
            {/* Categorías */}
            <div>
              <h3 className="qph-label-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                Categorías
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "todos", name: "Todos" },
                  ...EVENT_CATEGORIES.map((c) => ({ id: c.id.toLowerCase(), name: c.label })),
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs qph-label-bold transition-all cursor-pointer border ${
                      selectedCategory === cat.id
                        ? "bg-electric-indigo text-white border-electric-indigo shadow-xs"
                        : "bg-transparent text-on-surface-variant border-transparent hover:bg-surface-gray hover:border-surface-variant/40"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ubicación */}
            <div className="pt-6 border-t border-surface-variant">
              <h3 className="qph-label-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                Ubicación
              </h3>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-white border border-surface-variant rounded-xl p-3 text-xs qph-body-md focus:ring-2 focus:ring-electric-indigo outline-none cursor-pointer text-deep-slate shadow-xs"
              >
                <option value="Todos">Todas las ciudades</option>
                {publishedCities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.eventCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de Precio */}
            <div className="pt-6 border-t border-surface-variant">
              <div className="flex justify-between items-center mb-3">
                <h3 className="qph-label-bold text-xs uppercase tracking-widest text-on-surface-variant">
                  Precio Máximo
                </h3>
                <span className="text-xs font-bold text-electric-indigo">
                  Hasta S/. {maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-gray rounded-lg appearance-none cursor-pointer accent-electric-indigo"
              />
              <div className="flex justify-between mt-2 text-[11px] text-platinum-silver qph-label-bold">
                <span>20€</span>
                <span>500€+</span>
              </div>
            </div>

            {/* Fecha */}
            <div className="pt-6 border-t border-surface-variant">
              <h3 className="qph-label-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                Fecha
              </h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { id: "all", label: "Cualquier fecha" },
                  { id: "weekend", label: "Este fin de semana" },
                  { id: "next_week", label: "Próxima semana" },
                ].map((d) => (
                  <label key={d.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="date_filter"
                      checked={dateFilter === d.id}
                      onChange={() => setDateFilter(d.id as typeof dateFilter)}
                      className="w-4 h-4 text-electric-indigo focus:ring-electric-indigo border-surface-variant"
                    />
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">
                      {d.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botón Limpiar */}
            <button
              onClick={clearFilters}
              className="w-full py-2.5 bg-white border border-surface-variant hover:bg-surface-gray rounded-xl qph-label-bold text-xs text-on-surface transition-all cursor-pointer shadow-xs"
            >
              Limpiar Filtros
            </button>
          </aside>

          {/* =====================================================================
              ÁREA PRINCIPAL DE RESULTADOS
             ===================================================================== */}
          <section className="flex-1 w-full">
            
            {/* Barra de Filtros Móvil y Ordenamiento */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-variant">
              <div>
                <p className="text-on-surface-variant qph-body-md text-sm">
                  Mostrando <strong className="text-on-surface font-bold">{filteredEvents.length} eventos</strong> encontrados
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Botón trigger para abrir filtros en móvil */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-surface-variant text-xs font-semibold text-deep-slate shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">tune</span>
                  <span>Filtros</span>
                </button>

                {/* Ordenamiento */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] qph-label-bold text-platinum-silver hidden sm:inline">
                    ORDENAR POR:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="bg-white border border-surface-variant rounded-xl px-3 py-1.5 text-xs qph-label-bold text-on-surface focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="relevant">Más relevantes</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="date">Próximos eventos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GRID DE TARJETAS DE EVENTOS */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
                {filteredEvents.map((ev) => {
                  const isFav = !!favorites[ev.id];
                  return (
                    <article
                      key={ev.id}
                      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between border border-surface-variant"
                    >
                      {/* Media Area / Imagen y Badges */}
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                        />

                        {/* Badges superiores sobre la imagen */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-label-bold text-deep-slate border border-surface-variant/40 shadow-xs uppercase">
                            {ev.categoryLabel}
                          </span>
                          {ev.hasVip && (
                            <span className="bg-vip-gold text-white px-2.5 py-1 rounded-full text-[10px] uppercase font-label-bold shadow-xs">
                              VIP DISPONIBLE
                            </span>
                          )}
                        </div>

                        {/* Botón Favorito Flotante */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(ev.id);
                          }}
                          aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{
                              fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                              color: isFav ? "#e11d48" : "inherit",
                            }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>

                      {/* Contenido / Cuerpo de la Tarjeta */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-label-bold text-[12px] text-electric-indigo mb-1 uppercase">
                            {ev.dateStr} • {ev.location}, {ev.city}
                          </p>

                          <h3 className="font-headline-md text-headline-md group-hover:text-electric-indigo transition-colors leading-tight mb-2 font-bold line-clamp-1">
                            {ev.title}
                          </h3>

                          <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-3">
                            {ev.description || "Acceso oficial garantizado para esta función en directo."}
                          </p>

                          <div className="flex items-center gap-1.5 text-rose-500 mb-2">
                            <span className="material-symbols-outlined text-sm">{ev.urgencyIcon || "bolt"}</span>
                            <span className="font-label-bold text-[11px]">{ev.urgencyText || "Últimas entradas disponibles"}</span>
                          </div>
                        </div>

                        {/* Footer de Tarjeta Homogéneo al Home */}
                        <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-outline uppercase font-label-bold">
                              Precio
                            </span>
                            <span className="font-price-tag text-price-tag text-deep-slate font-extrabold text-base sm:text-lg">
                              Desde {ev.price}€
                            </span>
                          </div>

                          <Link
                            href={`/events/${ev.id}`}
                            className="px-3.5 py-2 bg-electric-indigo text-white rounded-xl font-label-bold text-[12px] hover:bg-primary transition-all shadow-sm"
                          >
                            Comprar Entradas
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* ESTADO VACÍO (EMPTY STATE) */
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-surface-variant p-8 shadow-xs">
                <div className="w-24 h-24 bg-surface-gray rounded-full flex items-center justify-center mb-5 text-platinum-silver border border-surface-variant/40">
                  <span className="material-symbols-outlined text-5xl">search_off</span>
                </div>
                <h3 className="qph-headline-lg text-xl text-deep-slate mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-on-surface-variant max-w-md mx-auto mb-6 qph-body-md text-xs sm:text-sm">
                  Prueba ajustando tus filtros de precio, cambiando la categoría o buscando una palabra diferente.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-electric-indigo text-white rounded-xl qph-label-bold text-xs hover:bg-primary transition-all cursor-pointer shadow-sm"
                >
                  Ver todos los eventos
                </button>
              </div>
            )}

            {/* Paginación */}
            {filteredEvents.length > 0 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  aria-label="Página anterior"
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-surface-variant hover:bg-surface-gray text-on-surface-variant transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button className="w-10 h-10 rounded-xl bg-electric-indigo text-white flex items-center justify-center font-bold text-xs shadow-xs border border-electric-indigo">
                  1
                </button>
                <button className="w-10 h-10 rounded-xl bg-white border border-surface-variant flex items-center justify-center hover:bg-surface-gray text-on-surface-variant font-semibold text-xs transition-all cursor-pointer shadow-xs">
                  2
                </button>
                <button className="w-10 h-10 rounded-xl bg-white border border-surface-variant flex items-center justify-center hover:bg-surface-gray text-on-surface-variant font-semibold text-xs transition-all cursor-pointer shadow-xs">
                  3
                </button>
                <span className="px-2 text-platinum-silver text-xs">...</span>
                <button className="w-10 h-10 rounded-xl bg-white border border-surface-variant flex items-center justify-center hover:bg-surface-gray text-on-surface-variant font-semibold text-xs transition-all cursor-pointer shadow-xs">
                  12
                </button>
                <button
                  aria-label="Página siguiente"
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-surface-variant hover:bg-surface-gray text-on-surface-variant transition-all cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* =========================================================================
          DRAWER / MODAL DE FILTROS PARA MÓVIL (BOTTOM SHEET)
         ========================================================================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-deep-slate/60 backdrop-blur-sm animate-in fade-in"
          />

          {/* Panel Deslizable */}
          <div className="relative bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-bottom duration-300 border-t border-surface-variant">
            <div className="w-12 h-1 bg-surface-variant rounded-full mx-auto mb-4" />

            <div className="flex justify-between items-center mb-6 pb-3 border-b border-surface-variant">
              <h2 className="qph-headline-lg text-lg font-bold text-deep-slate">
                Filtros de Búsqueda
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-gray border border-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Categorías */}
              <div>
                <h4 className="qph-label-bold text-xs uppercase text-on-surface-variant mb-3">
                  Categoría
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "todos", name: "Todos" },
                    ...EVENT_CATEGORIES.map((c) => ({ id: c.id.toLowerCase(), name: c.label })),
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs qph-label-bold transition-all border cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-electric-indigo text-white border-electric-indigo shadow-xs"
                          : "bg-white text-on-surface-variant border-surface-variant hover:bg-surface-gray"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ubicación (Móvil) */}
              <div className="pt-4 border-t border-surface-variant">
                <h4 className="qph-label-bold text-xs uppercase text-on-surface-variant mb-3">
                  Ciudad
                </h4>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white border border-surface-variant rounded-xl p-3 text-xs qph-body-md focus:ring-2 focus:ring-electric-indigo outline-none cursor-pointer text-deep-slate shadow-xs"
                >
                  <option value="Todos">Todas las ciudades</option>
                  {publishedCities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.eventCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de Precio */}
              <div className="pt-4 border-t border-surface-variant">
                <div className="flex justify-between text-xs mb-2">
                  <span className="qph-label-bold text-on-surface-variant">Precio Máximo:</span>
                  <span className="font-bold text-electric-indigo">Hasta S/. {maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-2 bg-surface-gray rounded-lg appearance-none accent-electric-indigo cursor-pointer"
                />
              </div>

              {/* Botón Aplicar */}
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3.5 bg-electric-indigo text-white rounded-xl qph-label-bold text-sm shadow-md hover:bg-primary active:scale-95 transition-all cursor-pointer"
              >
                Aplicar Filtros ({filteredEvents.length} resultados)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
