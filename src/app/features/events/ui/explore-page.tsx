"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import {
  searchEventsUseCase,
  getPublishedCitiesUseCase,
  PublishedCity,
  SearchEventItem,
} from "../index";

// =========================================================================
// DEFINICIONES DE TIPOS PARA FILTROS
// =========================================================================
export type DateFilterType = "all" | "today" | "weekend" | "this_week" | "this_month" | "custom";
export type SortByType = "date_asc" | "price_asc" | "price_desc" | "title_asc";
export type PriceRangeType = "all" | "under_50" | "50_to_150" | "over_150" | "custom";

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "TODOS", name: "Todas las categorías", icon: "category" },
  { id: "CONCERTS", name: "Conciertos", icon: "music_note" },
  { id: "THEATER", name: "Teatro & Musicales", icon: "theater_comedy" },
  { id: "SPORTS", name: "Deportes", icon: "sports_soccer" },
  { id: "FESTIVALS", name: "Festivales", icon: "celebration" },
  { id: "COMEDY", name: "Comedia & Stand Up", icon: "sentiment_very_satisfied" },
  { id: "GASTRONOMY", name: "Gastronomía", icon: "restaurant" },
  { id: "PARTY", name: "Fiestas & Nightlife", icon: "nightlife" },
  { id: "FAMILY", name: "Familiar & Niños", icon: "family_restroom" },
];

export default function ExploreEventsPageComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados de Filtros sincronizados con la URL
  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get("search") || searchParams.get("q") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (searchParams.get("category") || "TODOS").toUpperCase()
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    searchParams.get("city") || "Todas"
  );
  const [pricePreset, setPricePreset] = useState<PriceRangeType>("all");
  const [minPrice, setMinPrice] = useState<number>(
    searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 500
  );
  const [dateFilter, setDateFilter] = useState<DateFilterType>(
    (searchParams.get("date") as DateFilterType) || "all"
  );
  const [customStartDate, setCustomStartDate] = useState<string>(
    searchParams.get("startDate") || ""
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    searchParams.get("endDate") || ""
  );
  const [sortBy, setSortBy] = useState<SortByType>(
    (searchParams.get("sort") as SortByType) || "date_asc"
  );

  // Estados de los Dropdowns Horizontales (Top Filter Bar)
  const [activeDropdown, setActiveDropdown] = useState<
    "date" | "category" | "city" | "price" | null
  >(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Estados de Datos
  const [events, setEvents] = useState<SearchEventItem[]>([]);
  const [publishedCities, setPublishedCities] = useState<PublishedCity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // 1. Cargar favoritos persistidos en localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qph_favorites");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const favMap: Record<string, boolean> = {};
        ids.forEach((id) => {
          favMap[id] = true;
        });
        setFavorites(favMap);
      }
    } catch {
      // Fallback silencioso
    }
  }, []);

  const toggleFavorite = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [eventId]: !prev[eventId] };
      try {
        const activeIds = Object.keys(next).filter((k) => next[k]);
        localStorage.setItem("qph_favorites", JSON.stringify(activeIds));
      } catch {
        // Fallback silencioso
      }
      return next;
    });
  };

  // 2. Cargar ciudades con eventos publicados
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

  // 3. Sincronizar reactivamente si cambia la búsqueda en el Navbar superior
  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    setSearchTerm(q);
    const cat = (searchParams.get("category") || "TODOS").toUpperCase();
    setSelectedCategory(cat);
    const c = searchParams.get("city") || "Todas";
    setSelectedCity(c);
  }, [searchParams]);

  // 4. Cerrar dropdowns al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input");
        if (input) input.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 5. Sincronizar parámetros en URL (sin recargar la página)
  const syncUrlParams = useCallback(
    (params: {
      search?: string;
      category?: string;
      city?: string;
      minPrice?: number;
      maxPrice?: number;
      date?: string;
      startDate?: string;
      endDate?: string;
      sort?: string;
    }) => {
      const current = new URLSearchParams(window.location.search);

      if (params.search) current.set("search", params.search);
      else current.delete("search");

      if (params.category && params.category !== "TODOS") {
        current.set("category", params.category.toLowerCase());
      } else {
        current.delete("category");
      }

      if (params.city && params.city !== "Todas" && params.city !== "Todos") {
        current.set("city", params.city);
      } else {
        current.delete("city");
      }

      if (params.minPrice && params.minPrice > 0) {
        current.set("minPrice", String(params.minPrice));
      } else {
        current.delete("minPrice");
      }

      if (params.maxPrice && params.maxPrice < 500) {
        current.set("maxPrice", String(params.maxPrice));
      } else {
        current.delete("maxPrice");
      }

      if (params.date && params.date !== "all") {
        current.set("date", params.date);
      } else {
        current.delete("date");
      }

      if (params.startDate) current.set("startDate", params.startDate);
      else current.delete("startDate");

      if (params.endDate) current.set("endDate", params.endDate);
      else current.delete("endDate");

      if (params.sort && params.sort !== "date_asc") {
        current.set("sort", params.sort);
      } else {
        current.delete("sort");
      }

      const queryString = current.toString();
      const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  // 6. Cargar eventos desde el caso de uso
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);

    const categoryParam =
      selectedCategory && selectedCategory !== "TODOS" ? selectedCategory : undefined;
    const cityParam =
      selectedCity && selectedCity !== "Todas" && selectedCity !== "Todos"
        ? selectedCity
        : undefined;

    const res = await searchEventsUseCase.execute({
      q: searchTerm.trim() || undefined,
      category: categoryParam,
      city: cityParam,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 500 ? maxPrice : undefined,
      limit: 60,
      status: "published",
    });

    res.match(
      (data) => {
        setEvents(data.hits || []);
        setIsLoading(false);
      },
      () => {
        setEvents([]);
        setIsLoading(false);
      }
    );
  }, [searchTerm, selectedCategory, selectedCity, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
      syncUrlParams({
        search: searchTerm.trim(),
        category: selectedCategory,
        city: selectedCity,
        minPrice,
        maxPrice,
        date: dateFilter,
        startDate: customStartDate,
        endDate: customEndDate,
        sort: sortBy,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    selectedCategory,
    selectedCity,
    minPrice,
    maxPrice,
    dateFilter,
    customStartDate,
    customEndDate,
    sortBy,
    fetchEvents,
    syncUrlParams,
  ]);

  // 7. Filtrado y ordenamiento en cliente para filtros de fecha específicos
  const filteredAndSortedEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Filtro de fecha
        if (dateFilter === "all" && !customStartDate && !customEndDate) {
          return true;
        }

        if (!ev.date) return false;
        const evDate = new Date(ev.date);
        if (isNaN(evDate.getTime())) return true;

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        if (dateFilter === "today") {
          return evDate >= todayStart && evDate <= todayEnd;
        }

        if (dateFilter === "weekend") {
          const day = now.getDay();
          const daysUntilFriday = (5 - day + 7) % 7;
          const friday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + (daysUntilFriday === 0 && now.getHours() > 22 ? 7 : daysUntilFriday),
            0,
            0,
            0
          );
          const sunday = new Date(
            friday.getFullYear(),
            friday.getMonth(),
            friday.getDate() + 2,
            23,
            59,
            59,
            999
          );
          return evDate >= friday && evDate <= sunday;
        }

        if (dateFilter === "this_week") {
          const in7Days = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          return evDate >= todayStart && evDate <= in7Days;
        }

        if (dateFilter === "this_month") {
          const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          return evDate >= todayStart && evDate <= endOfMonth;
        }

        if (dateFilter === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (evDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (evDate > end) return false;
          }
          return true;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") {
          return a.minPrice - b.minPrice;
        }
        if (sortBy === "price_desc") {
          return b.minPrice - a.minPrice;
        }
        if (sortBy === "title_asc") {
          return a.title.localeCompare(b.title);
        }
        // date_asc por defecto
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
  }, [events, dateFilter, customStartDate, customEndDate, sortBy]);

  // Manejador de rangos de precio con presets amigables
  const handleSelectPricePreset = (preset: PriceRangeType) => {
    setPricePreset(preset);
    if (preset === "all") {
      setMinPrice(0);
      setMaxPrice(500);
    } else if (preset === "under_50") {
      setMinPrice(0);
      setMaxPrice(50);
    } else if (preset === "50_to_150") {
      setMinPrice(50);
      setMaxPrice(150);
    } else if (preset === "over_150") {
      setMinPrice(150);
      setMaxPrice(500);
    }
    setActiveDropdown(null);
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("TODOS");
    setSelectedCity("Todas");
    setPricePreset("all");
    setMinPrice(0);
    setMaxPrice(500);
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("date_asc");
    setActiveDropdown(null);
    syncUrlParams({});
  };

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedCategory !== "TODOS") count++;
    if (selectedCity !== "Todas" && selectedCity !== "Todos") count++;
    if (minPrice > 0 || maxPrice < 500) count++;
    if (dateFilter !== "all") count++;
    return count;
  }, [searchTerm, selectedCategory, selectedCity, minPrice, maxPrice, dateFilter]);

  // Etiquetas para los botones de la barra superior
  const dateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case "today":
        return "Hoy";
      case "weekend":
        return "Este fin de semana";
      case "this_week":
        return "Esta semana";
      case "this_month":
        return "Este mes";
      case "custom":
        return "Fechas elegidas";
      case "all":
      default:
        return "Cualquier fecha";
    }
  }, [dateFilter]);

  const categoryFilterLabel = useMemo(() => {
    const found = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory);
    return found && found.id !== "TODOS" ? found.name : "Categorías";
  }, [selectedCategory]);

  const priceFilterLabel = useMemo(() => {
    if (minPrice === 0 && maxPrice === 50) return "Menos de S/. 50";
    if (minPrice === 50 && maxPrice === 150) return "S/. 50 - 150";
    if (minPrice === 150 && maxPrice >= 500) return "Más de S/. 150";
    if (minPrice > 0 || maxPrice < 500) return `S/. ${minPrice} - ${maxPrice}`;
    return "Presupuesto";
  }, [minPrice, maxPrice]);

  // Formateador de fecha para eventos (Día, Mes, Año)
  const formatEventDate = (dateStr?: string | null) => {
    if (!dateStr) return "Fecha por confirmar";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const formatted = new Intl.DateTimeFormat("es-PE", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(d);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-on-background font-body-md">
      
      {/* =========================================================================
          1. HEADER COMPACTO: TÍTULO INSTITUCIONAL + CONTEXTO DE ENTRETENIMIENTO
         ========================================================================= */}
      <div className="bg-white border-b border-surface-variant/80 pt-6 pb-5 shadow-2xs">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-electric-indigo/10 text-electric-indigo text-[11px] font-label-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse" />
                <span>Cartelera Oficial en Vivo</span>
              </div>
              <h1 className="font-headline-md text-2xl sm:text-3xl font-black text-deep-slate tracking-tight">
                Explora experiencias y planes
              </h1>
              <p className="text-on-surface-variant text-xs sm:text-sm">
                Conciertos, festivales, teatro y vida nocturna garantizada en todo el Perú.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-label-bold text-on-surface-variant bg-surface-gray px-3.5 py-1.5 rounded-xl border border-surface-variant">
                {isLoading ? "Consultando eventos..." : `${filteredAndSortedEvents.length} eventos disponibles`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BARRA HORIZONTAL DE FILTROS (TOP FILTER BAR - PATRÓN FEVER / DICE)
         ========================================================================= */}
      <div
        ref={filterBarRef}
        className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-surface-variant/80 py-2.5 sm:py-3 shadow-xs"
      >
        <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 overflow-x-auto sm:overflow-visible qph-hide-scrollbar">
          
          {/* Grupo de Filtros Desplegables (Pills en 1 fila horizontal deslizable en móvil) */}
          <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap flex-shrink-0">
            
            {/* PILL 1: CUÁNDO (FECHAS) */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "date" ? null : "date")
                }
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-label-bold border transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ${
                  dateFilter !== "all"
                    ? "bg-electric-indigo text-white border-electric-indigo shadow-sm shadow-electric-indigo/25"
                    : "bg-surface-gray hover:bg-surface-container text-deep-slate border-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  calendar_month
                </span>
                <span>{dateFilterLabel}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {activeDropdown === "date" ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Popover Desplegable de Fechas */}
              {activeDropdown === "date" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-surface-variant p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2 pb-2 mb-1 border-b border-surface-variant/60">
                    Selecciona una fecha
                  </span>
                  
                  <div className="space-y-1">
                    {[
                      { id: "all", label: "Cualquier fecha", icon: "all_inclusive" },
                      { id: "today", label: "Hoy", icon: "today" },
                      { id: "weekend", label: "Este fin de semana", icon: "weekend" },
                      { id: "this_week", label: "Esta semana", icon: "date_range" },
                      { id: "this_month", label: "Este mes", icon: "calendar_month" },
                      { id: "custom", label: "Rango personalizado", icon: "edit_calendar" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setDateFilter(d.id as DateFilterType);
                          if (d.id !== "custom") setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          dateFilter === d.id
                            ? "bg-electric-indigo/10 text-electric-indigo font-bold"
                            : "hover:bg-surface-gray text-deep-slate"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">
                            {d.icon}
                          </span>
                          <span>{d.label}</span>
                        </div>
                        {dateFilter === d.id && (
                          <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Rango Personalizado */}
                  {dateFilter === "custom" && (
                    <div className="mt-2 pt-2 border-t border-surface-variant/60 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                          Desde:
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full bg-surface-gray border border-surface-variant rounded-lg p-1.5 text-xs text-deep-slate outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                          Hasta:
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full bg-surface-gray border border-surface-variant rounded-lg p-1.5 text-xs text-deep-slate outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(null)}
                        className="w-full py-1.5 bg-electric-indigo text-white text-xs font-bold rounded-lg shadow-xs hover:bg-primary transition-colors cursor-pointer"
                      >
                        Aplicar fechas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PILL 2: CATEGORÍA (DESPLEGABLE) */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "category" ? null : "category")
                }
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-label-bold border transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ${
                  selectedCategory !== "TODOS"
                    ? "bg-electric-indigo text-white border-electric-indigo shadow-sm shadow-electric-indigo/25"
                    : "bg-surface-gray hover:bg-surface-container text-deep-slate border-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  theater_comedy
                </span>
                <span>{categoryFilterLabel}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {activeDropdown === "category" ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Popover Desplegable de Categorías */}
              {activeDropdown === "category" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-variant p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-3 py-1.5 mb-1 border-b border-surface-variant/60">
                    Filtrar por categoría
                  </span>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-electric-indigo/10 text-electric-indigo font-bold"
                          : "hover:bg-surface-gray text-deep-slate"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px]">
                          {cat.icon}
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      {selectedCategory === cat.id && (
                        <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PILL 3: UBICACIÓN (CIUDADES DE PERÚ) */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "city" ? null : "city")
                }
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-label-bold border transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ${
                  selectedCity !== "Todas" && selectedCity !== "Todos"
                    ? "bg-electric-indigo text-white border-electric-indigo shadow-sm shadow-electric-indigo/25"
                    : "bg-surface-gray hover:bg-surface-container text-deep-slate border-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  location_on
                </span>
                <span>
                  {selectedCity !== "Todas" && selectedCity !== "Todos"
                    ? selectedCity
                    : "Ubicación"}
                </span>
                <span className="material-symbols-outlined text-[14px]">
                  {activeDropdown === "city" ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Popover Desplegable de Ciudades */}
              {activeDropdown === "city" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-variant p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-3 py-1.5 mb-1 border-b border-surface-variant/60">
                    Ciudades con cartelera
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity("Todas");
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCity === "Todas" || selectedCity === "Todos"
                        ? "bg-electric-indigo/10 text-electric-indigo font-bold"
                        : "hover:bg-surface-gray text-deep-slate"
                    }`}
                  >
                    <span>Todas las ciudades (Perú)</span>
                    {(selectedCity === "Todas" || selectedCity === "Todos") && (
                      <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                        check
                      </span>
                    )}
                  </button>

                  {publishedCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city.name);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        selectedCity === city.name
                          ? "bg-electric-indigo/10 text-electric-indigo font-bold"
                          : "hover:bg-surface-gray text-deep-slate"
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-[11px] font-normal text-on-surface-variant bg-surface-gray px-1.5 py-0.5 rounded">
                        {city.eventCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PILL 4: PRESUPUESTO / PRECIO */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown(activeDropdown === "price" ? null : "price")
                }
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-label-bold border transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ${
                  minPrice > 0 || maxPrice < 500
                    ? "bg-electric-indigo text-white border-electric-indigo shadow-sm shadow-electric-indigo/25"
                    : "bg-surface-gray hover:bg-surface-container text-deep-slate border-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  payments
                </span>
                <span>{priceFilterLabel}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {activeDropdown === "price" ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Popover Desplegable de Precios */}
              {activeDropdown === "price" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-surface-variant p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-1 pb-2 mb-2 border-b border-surface-variant/60">
                    Rango de entradas
                  </span>

                  <div className="space-y-1 mb-3">
                    {[
                      { id: "all", label: "Cualquier precio" },
                      { id: "under_50", label: "Menos de S/. 50 (Económicas)" },
                      { id: "50_to_150", label: "S/. 50 a S/. 150 (Intermedias)" },
                      { id: "over_150", label: "Más de S/. 150 (VIP / Especiales)" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPricePreset(p.id as PriceRangeType)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          pricePreset === p.id
                            ? "bg-electric-indigo/10 text-electric-indigo font-bold"
                            : "hover:bg-surface-gray text-deep-slate"
                        }`}
                      >
                        <span>{p.label}</span>
                        {pricePreset === p.id && (
                          <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                            check
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Slider de ajuste fino */}
                  <div className="pt-2 border-t border-surface-variant/60">
                    <div className="flex justify-between text-[11px] font-bold text-on-surface-variant mb-1">
                      <span>Límite máximo:</span>
                      <span className="text-electric-indigo">
                        {maxPrice >= 500 ? "Sin límite" : `Hasta S/. ${maxPrice}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Number(e.target.value));
                        setPricePreset("custom");
                      }}
                      className="w-full h-1.5 bg-surface-gray rounded-lg appearance-none cursor-pointer accent-electric-indigo"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN LIMPIAR FILTROS (Visible solo cuando hay filtros activos) */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-label-bold text-electric-indigo hover:bg-electric-indigo/10 border border-electric-indigo/20 transition-colors cursor-pointer flex-shrink-0 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
                <span>Limpiar filtros ({activeFiltersCount})</span>
              </button>
            )}

          </div>

          {/* Lado Derecho: Ordenamiento */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-label-bold text-on-surface-variant uppercase hidden sm:inline">
              Ordenar por:
            </span>
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortByType)}
                className="bg-surface-gray hover:bg-surface-container border border-surface-variant rounded-xl py-2 pl-3 pr-7 text-xs font-bold text-deep-slate focus:outline-none cursor-pointer appearance-none shadow-2xs whitespace-nowrap"
              >
                <option value="date_asc">Más próximos</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="title_asc">Nombre: A - Z</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          3. CATÁLOGO A PANTALLA COMPLETA (FULL-WIDTH GRID - 3 A 4 COLUMNAS)
         ========================================================================= */}
      <main className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-32 sm:py-10">
        
        {/* Chip de búsqueda por texto activa si viene desde el Navbar */}
        {searchTerm && (
          <div className="mb-6 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-surface-variant text-xs text-deep-slate shadow-2xs">
              <span className="material-symbols-outlined text-[16px] text-electric-indigo">search</span>
              <span>Resultados para: <strong className="font-bold text-electric-indigo">&ldquo;{searchTerm}&rdquo;</strong></span>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  syncUrlParams({ search: "" });
                }}
                className="hover:bg-surface-gray rounded-full p-0.5 text-on-surface-variant transition-colors cursor-pointer"
                title="Quitar término de búsqueda"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* ESTADO: CARGANDO (SKELETONS RESPONSIVOS) */}
        {isLoading ? (
          <>
            {/* Skeletons en Grid de 2 Columnas para Móvil */}
            <div className="grid grid-cols-2 gap-3.5 sm:hidden mb-8 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`mob-skel-${idx}`}>
                  <div className="aspect-[4/5] rounded-2xl bg-slate-200 mb-2" />
                  <div className="h-3 w-16 bg-slate-200 rounded mb-1" />
                  <div className="h-4 w-full bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded" />
                </div>
              ))}
            </div>

            {/* Skeletons en Grid para Tablet y Escritorio */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`skel-${idx}`}
                  className="bg-white rounded-2xl overflow-hidden border border-surface-variant shadow-xs flex flex-col justify-between animate-pulse"
                >
                  <div className="aspect-16/10 bg-surface-variant/50 relative" />
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-3.5 bg-surface-variant/40 rounded w-1/3" />
                      <div className="h-5 bg-surface-variant/60 rounded w-4/5" />
                      <div className="h-3 bg-surface-variant/30 rounded w-full" />
                    </div>
                    <div className="pt-3 border-t border-surface-variant flex justify-between items-center">
                      <div className="h-4 bg-surface-variant/50 rounded w-1/4" />
                      <div className="h-8 bg-surface-variant/60 rounded-xl w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filteredAndSortedEvents.length > 0 ? (
          <>
            {/* VISTA MÓVIL: GRID DE 2 COLUMNAS (ESTILO EVENTOS PRÓXIMOS DE STITCH) */}
            <div className="grid grid-cols-2 gap-3.5 sm:hidden mb-8">
              {filteredAndSortedEvents.map((ev) => {
                const isFav = !!favorites[ev.id];
                const secureId = ev.publicUuid || ev.slug || ev.id;
                const ctaHref = ev.hasLandingPage && ev.slug ? `/e/${ev.slug}` : `/events/${secureId}`;
                const fallbackImage =
                  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80";

                return (
                  <article
                    key={`mob-grid-${ev.id}`}
                    className="group cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <Link href={ctaHref} className="block">
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-gray shadow-sm mb-2">
                        <img
                          src={ev.bannerUrl || fallbackImage}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                        {/* Badge de Categoría */}
                        <span className="absolute top-2 left-2 bg-deep-slate/85 backdrop-blur-sm text-white text-[9px] qph-label-bold uppercase px-2 py-0.5 rounded-full shadow-xs">
                          {ev.category || "EVENTO"}
                        </span>

                        {/* Botón Favorito Flotante */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(ev.id, e)}
                          aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-deep-slate/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-600 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span
                            className="material-symbols-outlined text-[15px]"
                            style={{
                              fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                              color: isFav ? "#e11d48" : "white",
                            }}
                          >
                            favorite
                          </span>
                        </button>

                        {/* Chip de Precio inferior */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                          <span className="bg-deep-slate/80 backdrop-blur-sm px-1.5 py-0.5 rounded qph-label-bold text-electric-indigo">
                            {ev.minPrice > 0 ? `Desde S/ ${ev.minPrice.toFixed(2)}` : "Entrada Libre"}
                          </span>
                        </div>
                      </div>

                      {/* Fecha del Evento */}
                      {ev.date && (
                        <span className="text-[10px] qph-label-bold text-electric-indigo uppercase tracking-wider block mb-0.5">
                          {formatEventDate(ev.date)}
                        </span>
                      )}

                      {/* Título en hasta 2 líneas */}
                      <h4 className="text-xs font-bold text-on-surface leading-tight line-clamp-2 group-hover:text-electric-indigo transition-colors">
                        {ev.title}
                      </h4>

                      {/* Ubicación con pin */}
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                        <span className="material-symbols-outlined text-[13px] text-platinum-silver">location_on</span>
                        <span className="truncate">{ev.venue || "Recinto Oficial"}</span>
                      </p>
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* VISTA ESCRITORIO Y TABLET: GRID MULTI-COLUMNAS (sm:grid) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedEvents.map((ev) => {
                const isFav = !!favorites[ev.id];
                const secureId = ev.publicUuid || ev.slug || ev.id;
                const ctaHref = ev.hasLandingPage && ev.slug ? `/e/${ev.slug}` : `/events/${secureId}`;
                const ctaText = ev.hasLandingPage && ev.slug ? "Ver Experiencia" : "Comprar";
                const fallbackImage =
                  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80";

                return (
                  <article
                    key={ev.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-surface-variant"
                  >
                    {/* Media Area / Póster del Evento */}
                    <div className="aspect-16/10 relative overflow-hidden bg-slate-900">
                      <Link href={ctaHref} className="block w-full h-full">
                        <img
                          src={ev.bannerUrl || fallbackImage}
                          alt={ev.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-108 duration-500 cursor-pointer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                      </Link>

                      {/* Badge de Categoría y Destacado */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                        <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-label-bold text-deep-slate border border-surface-variant/40 shadow-xs uppercase">
                          {ev.category}
                        </span>
                        {ev.isFeatured && (
                          <span className="px-2 py-0.5 bg-vip-gold text-white rounded-full text-[10px] font-label-bold uppercase shadow-xs">
                            Destacado
                          </span>
                        )}
                      </div>

                      {/* Botón Favorito Flotante */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(ev.id, e)}
                        aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-600 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{
                            fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                            color: isFav ? "#e11d48" : "inherit",
                          }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Fecha y Lugar */}
                        <p className="font-label-bold text-[11px] text-electric-indigo mb-1 uppercase tracking-wide flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                          <span>{formatEventDate(ev.date)}</span>
                          <span>•</span>
                          <span className="truncate">{ev.venue || "Recinto Oficial"}</span>
                        </p>

                        <Link href={ctaHref} className="block">
                          <h3 className="font-headline-md text-base sm:text-lg font-bold text-deep-slate group-hover:text-electric-indigo transition-colors leading-tight mb-2 line-clamp-1 cursor-pointer">
                            {ev.title}
                          </h3>
                        </Link>

                        <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
                          {ev.description || "Acceso digital garantizado con control de seguridad oficial."}
                        </p>
                      </div>

                      {/* Footer de Tarjeta con Precio y CTA */}
                      <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-on-surface-variant uppercase font-label-bold">
                            Precio
                          </span>
                          <span className="font-headline-md font-black text-sm sm:text-base text-deep-slate">
                            {ev.minPrice > 0 ? `Desde S/. ${ev.minPrice.toFixed(2)}` : "Entrada Libre"}
                          </span>
                        </div>

                        <Link
                          href={ctaHref}
                          className="px-3.5 py-2 bg-electric-indigo hover:bg-primary text-white rounded-xl font-label-bold text-xs shadow-xs hover:shadow-md hover:shadow-electric-indigo/20 active:scale-95 transition-all"
                        >
                          {ctaText}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          /* ESTADO VACÍO (EMPTY STATE) */
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-surface-variant p-8 shadow-xs max-w-xl mx-auto">
            <div className="w-16 h-16 bg-surface-gray rounded-full flex items-center justify-center mb-4 text-on-surface-variant border border-surface-variant">
              <span className="material-symbols-outlined text-3xl text-electric-indigo">
                event_busy
              </span>
            </div>
            <h3 className="font-headline-md text-xl font-bold text-deep-slate mb-2">
              No encontramos eventos con estos filtros
            </h3>
            <p className="text-on-surface-variant text-xs sm:text-sm mb-6 leading-relaxed">
              Prueba cambiando la fecha, seleccionando otra ciudad o explorando todas las categorías disponibles.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-electric-indigo text-white rounded-xl font-label-bold text-xs hover:bg-primary transition-all cursor-pointer shadow-md shadow-electric-indigo/20 active:scale-95"
            >
              Restablecer todos los filtros
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
