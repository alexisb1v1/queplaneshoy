'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FavoriteEvent {
  id: string;
  category: 'Conciertos' | 'Teatro' | 'Deportes' | 'Festivales';
  title: string;
  dateStr: string;
  location: string;
  price: number;
  imageUrl: string;
  badgeText?: string;
  badgeStyle?: string;
}

const INITIAL_FAVORITES: FavoriteEvent[] = [
  {
    id: '1',
    category: 'Conciertos',
    title: 'Echoes of Summer Tour',
    dateStr: '15 OCT',
    location: 'Wizink Center, Madrid',
    price: 45,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJiDET_y0w7I5zajg5pFTLjyRVXEaEasR-l7QNOnCRxMAHrdgAF5bXUuVsRTbZa9omlnzOKeoMBlFiICbknXsjEoHx8YybyiYawkSld9W42M1OPJteMmnE73Ti34LjnvoYAjV13e_alexDOYTY-zQEPpcO6TBJI1yDqb_pwulxJO2J19aKhIhbFlFKu81DVthNIVRQNXwdm1Wj19T9YTP4dNq0ytLNTqhjk-5Ynu4vKi6WR7nwkDfmaUZ_I3Gc43zFO2yTnDp81DD5',
    badgeText: 'VIP',
    badgeStyle: 'bg-vip-gold text-white',
  },
  {
    id: '2',
    category: 'Teatro',
    title: 'La Casa de Bernarda Alba',
    dateStr: '22 OCT',
    location: 'Teatro Nacional, Barcelona',
    price: 28.50,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq3HkpwBofU_heR_wh5DEHTjaLHTUyCreZCQYKa65Y-3wJ1LOhGQfBOHc_BdvWAcrKM3x5jEAkxSVRANjWebSccwC_cOBG7XJXg5FLSGKyqSZ7wtOcQbkBewipaXshUX7zuIP5njLcmbhboCZvrNHlEOYOGQfRLkuKQcSPlXozeM58aNzPc9B0wFZy4mx_JO1TfUQPTk7R4rbPKtVC8U1YxOy8Tq1vm2xBJlbIs3os5ta_VXX2lrqMHdvwYnIz0eAWpwnYMhygCPl6',
  },
  {
    id: '4',
    category: 'Deportes',
    title: 'Liga Endesa: Madrid vs Barça',
    dateStr: '12 NOV',
    location: 'WiZink Center, Madrid',
    price: 35,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD42TdCs8PMCBGkGypxSDgtcKAZPI1uQa_WH46S_WwkWpO72_wE5zaA-dvP0HiwNs_698ubG-B36z34f4rPid6ad93yGuUgZZ-dllcodYvZwv1Mc0jeRW22L-9TQgOVfzHGPLu1_qdVxfReDhdwgsoOhK_Lp-jGyGpEAM4e45ZavUmzyN_1FiMnALPGvbXUiEHuMr0tieCgb9B2BnJy7cjZvWXN7rn4PA6OpgRL09EFsq2oaUdrSIL6Ofh-JEGRKU9jlGfz8JPtP8iG',
    badgeText: 'PLATINUM',
    badgeStyle: 'bg-slate-400 text-white',
  },
];

export default function FavoritesTab() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>(INITIAL_FAVORITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});

  const handleToggleFavorite = (eventId: string) => {
    // Activar animación de encogimiento/desvanecimiento
    setRemovingIds((prev) => ({ ...prev, [eventId]: true }));

    setTimeout(() => {
      setFavorites((prev) => prev.filter((item) => item.id !== eventId));
      setRemovingIds((prev) => {
        const copy = { ...prev };
        delete copy[eventId];
        return copy;
      });
    }, 300);
  };

  // Filtrado
  const filteredEvents = favorites.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', 'Conciertos', 'Teatro', 'Deportes'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="border-b border-outline-variant/10 pb-4">
        <h1 className="text-3xl font-extrabold text-deep-slate tracking-tight">Mis Favoritos</h1>
        <p className="text-on-surface-variant text-sm mt-1">Guarda los eventos que no te quieres perder y encuéntralos aquí fácilmente.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-platinum-silver transition-colors group-focus-within:text-electric-indigo">
            search
          </span>
          <input
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-outline-variant/30 shadow-sm focus:ring-2 focus:ring-electric-indigo focus:border-electric-indigo transition-all font-semibold outline-none"
            placeholder="Buscar entre tus favoritos..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap active:scale-95 border border-transparent ${
                selectedCategory === cat
                  ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/20'
                  : 'bg-white text-on-surface-variant hover:bg-gray-100 hover:text-deep-slate shadow-sm border-outline-variant/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white border border-outline-variant/20 rounded-xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-surface-gray rounded-full flex items-center justify-center text-platinum-silver">
            <span className="material-symbols-outlined text-[40px]">heart_broken</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-deep-slate">No hay favoritos guardados</h3>
            <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto">
              Explora los mejores eventos de tu ciudad y guarda los que más te gusten pulsando en el corazón.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-electric-indigo text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-electric-indigo/10"
          >
            Explorar eventos
          </button>
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRemoving = removingIds[event.id] || false;
            return (
              <div
                key={event.id}
                style={{
                  opacity: isRemoving ? 0.3 : 1,
                  transform: isRemoving ? 'scale(0.95)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="bg-white rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-md group flex flex-col hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={event.imageUrl}
                    alt={event.title}
                  />
                  <button
                    onClick={() => handleToggleFavorite(event.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-error shadow-md hover:scale-110 active:scale-95 transition-all"
                    title="Quitar de favoritos"
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </button>
                  {event.badgeText && (
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${event.badgeStyle}`}>
                        {event.badgeText}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="text-electric-indigo">{event.category}</span>
                      <span>•</span>
                      <span>{event.dateStr}</span>
                    </div>
                    <h3 className="text-base font-bold text-deep-slate mt-1 group-hover:text-electric-indigo transition-colors leading-snug">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Desde</span>
                      <span className="text-base font-extrabold text-electric-indigo mt-0.5">€{event.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/events/indigo-nights` /* URL de prueba */)}
                      className="bg-electric-indigo text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary transition-all shadow-md shadow-electric-indigo/10 active:scale-95"
                    >
                      Comprar
                    </button>
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
