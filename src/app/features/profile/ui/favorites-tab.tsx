'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getUserFavoritesUseCase,
  removeFavoriteUseCase,
  FavoriteEventModel,
} from '../index';
import { ERROR_CODES } from '../../../common/errors/error-codes';

export default function FavoritesTab() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEventModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    const result = await getUserFavoritesUseCase.execute();
    result.match(
      (items) => {
        setFavorites(items);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        if (error.code === ERROR_CODES.UNAUTHORIZED.code && typeof window !== 'undefined') {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      }
    );
  }, [router]);

  useEffect(() => {
    loadFavorites();

    // Escuchar eventos globales de actualización de favoritos
    const handleSync = () => {
      loadFavorites();
    };
    window.addEventListener('qph:favorites-updated', handleSync);
    return () => {
      window.removeEventListener('qph:favorites-updated', handleSync);
    };
  }, [loadFavorites]);

  const handleRemoveFavorite = async (event: FavoriteEventModel, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Marcamos para animación de salida inmediata
    setRemovingIds((prev) => ({ ...prev, [event.id]: true }));

    // Llamada al caso de uso
    const result = await removeFavoriteUseCase.execute(event.id);

    result.match(
      () => {
        // Notificar a otros componentes
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('qph:favorites-updated', {
              detail: { eventId: event.id, publicUuid: event.publicUuid, isFavorite: false },
            })
          );
        }
        // Remover de la lista local
        setTimeout(() => {
          setFavorites((prev) => prev.filter((item) => item.id !== event.id));
          setRemovingIds((prev) => {
            const next = { ...prev };
            delete next[event.id];
            return next;
          });
        }, 250);
      },
      (error) => {
        // En caso de error, revertir animación
        setRemovingIds((prev) => {
          const next = { ...prev };
          delete next[event.id];
          return next;
        });
        if (error.code === ERROR_CODES.UNAUTHORIZED.code && typeof window !== 'undefined') {
          router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      }
    );
  };

  // Extraer categorías dinámicas disponibles
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((fav) => {
      if (fav.category) set.add(fav.category.toUpperCase());
    });
    return ['TODOS', ...Array.from(set)];
  }, [favorites]);

  // Filtrado de eventos en memoria
  const filteredEvents = useMemo(() => {
    return favorites.filter((event) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        event.name.toLowerCase().includes(q) ||
        (event.venue && event.venue.toLowerCase().includes(q)) ||
        (event.city && event.city.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'TODOS' ||
        (event.category && event.category.toUpperCase() === selectedCategory);

      return matchesSearch && matchesCat;
    });
  }, [favorites, searchQuery, selectedCategory]);

  const formatEventDate = (dateStr: string | null) => {
    if (!dateStr) return 'Fecha por confirmar';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const formatted = new Intl.DateTimeFormat('es-PE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(d);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateStr;
    }
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="border-b border-surface-variant/40 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold mb-1.5">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
            <span>Tu Colección Personal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-deep-slate tracking-tight">
            Mis Favoritos
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Los eventos que has guardado para no perderte ninguna experiencia.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <span className="text-xs font-bold text-on-surface-variant bg-surface-gray px-3.5 py-1.5 rounded-xl border border-surface-variant">
            {isLoading ? 'Cargando...' : `${favorites.length} guardados`}
          </span>
        </div>
      </div>

      {/* Buscador y Filtro de Categorías */}
      {favorites.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo text-[20px]">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-surface-variant shadow-xs focus:ring-1 focus:ring-electric-indigo focus:border-electric-indigo transition-all font-medium text-sm text-deep-slate outline-none"
              placeholder="Buscar entre tus favoritos por evento, recinto o ciudad..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {availableCategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap active:scale-95 border cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-electric-indigo text-white border-electric-indigo shadow-xs'
                      : 'bg-white text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate border-surface-variant/70 shadow-xs'
                  }`}
                >
                  {cat === 'TODOS' ? 'Todas las categorías' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estado: Cargando Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`fav-skel-${idx}`}
              className="bg-white rounded-2xl overflow-hidden border border-surface-variant p-4 space-y-3"
            >
              <div className="aspect-[16/9] rounded-xl bg-slate-200" />
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-5 w-4/5 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Estado Vacío */
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 bg-white border border-surface-variant rounded-2xl p-8 shadow-xs">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 shadow-inner">
            <span className="material-symbols-outlined text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite_border
            </span>
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-deep-slate">
              {favorites.length === 0 ? 'Aún no tienes favoritos guardados' : 'No se encontraron resultados'}
            </h3>
            <p className="text-on-surface-variant text-sm mt-2">
              {favorites.length === 0
                ? 'Explora la cartelera oficial y pulsa en el corazón de cualquier concierto, festival o evento que te interese para guardarlo aquí.'
                : 'Intenta con otro término de búsqueda o selecciona otra categoría.'}
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-electric-indigo text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary active:scale-95 transition-all shadow-md shadow-electric-indigo/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Explorar cartelera</span>
          </Link>
        </div>
      ) : (
        /* Grid de Eventos Favoritos */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRemoving = removingIds[event.id] || false;
            const targetId = event.slug || event.publicUuid || event.id;
            const eventUrl = `/events/${targetId}`;

            return (
              <div
                key={event.id}
                style={{
                  opacity: isRemoving ? 0.3 : 1,
                  transform: isRemoving ? 'scale(0.95)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="bg-white rounded-2xl overflow-hidden border border-surface-variant shadow-xs hover:shadow-md group flex flex-col hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-gray">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={event.imageUrl || fallbackImage}
                    alt={event.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />

                  {/* Botón de quitar de favoritos */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFavorite(event, e)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-rose-600 border border-surface-variant/40 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                    title="Quitar de mis favoritos"
                    aria-label="Quitar de mis favoritos"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>

                  {/* Badge de categoría */}
                  {event.category && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs bg-deep-slate/85 backdrop-blur-sm text-white">
                        {event.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                  <div>
                    {event.nextShowDate && (
                      <span className="text-[11px] font-bold text-electric-indigo uppercase tracking-wider block mb-1">
                        {formatEventDate(event.nextShowDate)}
                      </span>
                    )}

                    <Link href={eventUrl}>
                      <h3 className="text-base font-bold text-deep-slate group-hover:text-electric-indigo transition-colors leading-snug line-clamp-2">
                        {event.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium truncate">
                    <span className="material-symbols-outlined text-[16px] text-platinum-silver flex-shrink-0">
                      location_on
                    </span>
                    <span className="truncate">
                      {event.venue ? `${event.venue}, ` : ''}{event.city || 'Perú'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-surface-variant/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        Precio
                      </span>
                      <span className="text-sm font-extrabold text-electric-indigo mt-0.5">
                        {event.minPrice > 0 ? `Desde S/ ${event.minPrice.toFixed(2)}` : 'Entrada Libre'}
                      </span>
                    </div>

                    <Link
                      href={eventUrl}
                      className="bg-electric-indigo text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary transition-all shadow-xs active:scale-95 cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Ver Evento</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
