'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchEventsUseCase } from '../../index';
import { SearchEventItem } from '../../models/search-event.model';
import { EVENT_CATEGORIES } from '../../constants/eventConstants';

interface SearchInstantDropdownProps {
  initialQuery?: string;
  initialCategory?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export function SearchInstantDropdown({
  initialQuery = '',
  initialCategory = 'Todas',
  placeholder = 'Buscar eventos, artistas o locales...',
  className = '',
  compact = false,
}: SearchInstantDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [results, setResults] = useState<SearchEventItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Búsqueda con debounce en tiempo real
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
        category && category !== 'Todas' && category !== 'Todos' ? category : undefined;

      const res = await searchEventsUseCase.execute({
        q: trimmed,
        category: categoryParam,
        limit: 6,
        status: 'published',
      });

      res.match(
        (data) => {
          setResults(data.hits || []);
          setTotalHits(data.totalHits || (data.hits ? data.hits.length : 0));
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
  }, [query, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (category && category !== 'Todas' && category !== 'Todos') {
      params.set('category', category.toLowerCase());
    }
    const queryStr = params.toString();
    router.push(`/events${queryStr ? `?${queryStr}` : ''}`);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Próximamente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryBadge = (catId?: string) => {
    const found = EVENT_CATEGORIES.find((c) => c.id === catId);
    return found ? found.label : (catId || 'Evento');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* FORMULARIO DE ENTRADA */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center bg-white border border-surface-variant hover:border-electric-indigo focus-within:border-electric-indigo focus-within:ring-2 focus-within:ring-electric-indigo/20 rounded-full shadow-md px-3.5 py-1.5 gap-2 transition-all duration-200"
      >
        <span className="material-symbols-outlined text-electric-indigo text-xl pl-1 shrink-0">
          search
        </span>

        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-on-surface placeholder:text-platinum-silver focus:outline-none font-medium"
        />

        {isLoading && (
          <div className="w-4 h-4 border-2 border-electric-indigo/30 border-t-electric-indigo rounded-full animate-spin shrink-0" />
        )}

        {query && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors shrink-0"
            title="Borrar texto"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}

        <div className="h-5 w-px bg-surface-variant/80 hidden sm:block shrink-0" />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-transparent text-xs font-semibold text-on-surface-variant border-none focus:outline-none cursor-pointer hidden sm:block pr-1 hover:text-electric-indigo transition-colors shrink-0"
        >
          <option value="Todas">Todas</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          aria-label="Buscar eventos"
          className="w-8 h-8 rounded-full bg-electric-indigo hover:bg-electric-indigo/90 text-white flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
        </button>
      </form>

      {/* DROPDOWN FLOTANTE DE RESULTADOS INSTANTÁNEOS */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-surface-variant overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
          {/* Header del Dropdown */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-surface-variant/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-electric-indigo text-[16px]">bolt</span>
              Sugerencias en tiempo real
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {results.length} sugerencias
            </span>
          </div>

          {/* Lista de Resultados */}
          {results.length > 0 ? (
            <div className="divide-y divide-surface-variant/40 max-h-80 overflow-y-auto">
              {results.map((item) => {
                const secureId = item.publicUuid || item.slug || item.id;
                const targetUrl = item.hasLandingPage && item.slug
                  ? `/e/${item.slug}`
                  : `/events/${secureId}`;

                return (
                  <Link
                    key={item.id}
                    href={targetUrl}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-3.5 hover:bg-indigo-50/60 transition-colors group"
                  >
                    {/* Thumbnail */}
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
                          <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                        </div>
                      )}
                    </div>

                    {/* Información Principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-electric-indigo">
                          {getCategoryBadge(item.category)}
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

                    {/* Flecha indicador */}
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
              <p className="text-[11px] text-slate-400 mt-0.5">
                Intenta con otra palabra, artista o categoría general.
              </p>
            </div>
          )}

          {/* Footer del Dropdown con botón de ver todo */}
          <div className="p-3 bg-slate-50 border-t border-surface-variant/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              Cartelera oficial actualizada al instante
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-bold text-electric-indigo hover:text-primary transition-colors flex items-center gap-1"
            >
              Ver todos los resultados
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

