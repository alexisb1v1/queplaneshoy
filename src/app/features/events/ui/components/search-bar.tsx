'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchEventsUseCase, getPublishedCitiesUseCase, PublishedCity } from '../../index';
import { SearchEventItem } from '../../models/search-event.model';
import { EVENT_CATEGORIES } from '../../constants/eventConstants';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [city, setCity] = useState('Todas');
  const [publishedCities, setPublishedCities] = useState<PublishedCity[]>([]);
  const [results, setResults] = useState<SearchEventItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar ciudades que tienen eventos en estado 'published'
  useEffect(() => {
    let isMounted = true;
    getPublishedCitiesUseCase.execute().then((res) => {
      res.match(
        (cities) => {
          if (isMounted) setPublishedCities(cities);
        },
        () => { }
      );
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const categoryParam =
        category && category !== 'Todos' && category !== 'Todas' ? category : undefined;
      const cityParam =
        city && city !== 'Todas' && city !== 'Todos' ? city : undefined;

      const res = await searchEventsUseCase.execute({
        q: trimmed,
        category: categoryParam,
        city: cityParam,
        limit: 5,
        status: 'published',
      });

      res.match(
        (data) => {
          setResults(data.hits || []);
          setIsOpen(true);
          setIsLoading(false);
        },
        () => {
          setResults([]);
          setIsOpen(false);
          setIsLoading(false);
        }
      );
    }, 220);

    return () => clearTimeout(timer);
  }, [query, category, city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (category && category !== 'Todos' && category !== 'Todas') {
      params.set('category', category.toLowerCase());
    }
    if (city && city !== 'Todas') {
      params.set('city', city.toLowerCase());
    }
    const queryStr = params.toString();
    router.push(`/events${queryStr ? `?${queryStr}` : ''}`);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Próximamente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={containerRef}
      id="hero-search-container"
      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-30"
    >
      <form
        onSubmit={handleSearch}
        className="bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl border border-surface-variant flex flex-col md:flex-row gap-4 items-center relative"
      >
        {/* Campo de búsqueda libre */}
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-electric-indigo text-xl">
            search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2 && results.length > 0) setIsOpen(true);
            }}
            className="w-full pl-12 pr-10 py-3.5 bg-transparent border-none text-sm font-semibold text-deep-slate placeholder:text-platinum-silver focus:outline-none"
            placeholder="¿Qué quieres vivir hoy? (artista, concierto, festival...)"
            type="text"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-electric-indigo/30 border-t-electric-indigo rounded-full animate-spin" />
          )}
        </div>

        {/* Separador */}
        <div className="h-10 w-px bg-surface-variant hidden md:block"></div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Categoría */}
          <div className="flex-1 md:w-40 px-3 py-1.5 flex flex-col bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Categoría
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-bold text-deep-slate cursor-pointer focus:outline-none"
            >
              <option value="Todos">Todas las categorías</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ubicación / Ciudad */}
          <div className="flex-1 md:w-40 px-3 py-1.5 flex flex-col bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ciudad
            </span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-bold text-deep-slate cursor-pointer focus:outline-none"
            >
              <option value="Todas">Todas las ciudades</option>
              {publishedCities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.eventCount})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Buscar */}
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-3.5 bg-electric-indigo text-white rounded-xl font-bold text-sm hover:bg-electric-indigo/90 shadow-md shadow-electric-indigo/20 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
        >
          Explorar
        </button>

        {/* DROPDOWN FLOTANTE INSTANTÁNEO EN EL HERO */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-surface-variant overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
            <div className="px-5 py-2.5 bg-slate-50 border-b border-surface-variant/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-electric-indigo text-[16px]">bolt</span>
                Resultados de la busqueda
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {results.length} sugerencias
              </span>
            </div>

            {results.length > 0 ? (
              <div className="divide-y divide-surface-variant/40 max-h-80 overflow-y-auto">
                {results.map((item) => {
                  const secureId = item.publicUuid || item.slug || item.id;
                  const targetUrl =
                    item.hasLandingPage && item.slug ? `/e/${item.slug}` : `/events/${secureId}`;

                  return (
                    <Link
                      key={item.id}
                      href={targetUrl}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-3.5 hover:bg-indigo-50/60 transition-colors group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-surface-variant/60">
                        {item.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.bannerUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                            <span className="material-symbols-outlined text-[20px]">
                              confirmation_number
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-electric-indigo">
                            {item.category}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            {item.venue || 'Recinto Principal'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-deep-slate group-hover:text-electric-indigo transition-colors truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{formatDate(item.date)}</span>
                          {item.minPrice !== undefined && item.minPrice > 0 ? (
                            <span className="font-bold text-emerald-600">
                              Desde S/. {item.minPrice.toFixed(2)}
                            </span>
                          ) : (
                            <span className="font-bold text-slate-400">Entrada Libre</span>
                          )}
                        </div>
                      </div>

                      <span className="material-symbols-outlined text-slate-300 group-hover:text-electric-indigo group-hover:translate-x-1 transition-all">
                        arrow_forward
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                <span className="material-symbols-outlined text-[28px] text-slate-300 mb-1">
                  search_off
                </span>
                <p className="text-xs font-semibold">
                  No hay resultados para &quot;{query}&quot;
                </p>
              </div>
            )}

            <div className="p-3 bg-slate-50 border-t border-surface-variant/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                Cartelera oficial actualizada al instante
              </span>
              <button
                type="submit"
                className="text-xs font-bold text-electric-indigo hover:text-primary transition-colors flex items-center gap-1"
              >
                Ver todos los resultados
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
