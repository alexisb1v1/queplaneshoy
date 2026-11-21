"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavorites } from "../../../../common/hooks/use-favorites";

export interface EventCardProps {
  id: string | number;
  publicUuid?: string;
  slug?: string;
  hasLandingPage?: boolean;
  title: string;
  category: string;
  imageUrl: string;
  bannerUrl?: string;
  hasBannerText?: boolean;
  altText?: string;
  date: string;
  location: string;
  price: number;
  ticketType?: string;
  ticketBadgeStyle?: "general" | "vip" | "platinum" | "error";
  description?: string;
  urgencyText?: string;
  urgencyIcon?: string;
  urgencyType?: "critical" | "high_demand" | "warning" | "info";
}

export function EventCard({
  id,
  publicUuid,
  slug,
  hasLandingPage = false,
  title,
  category,
  imageUrl,
  altText = title,
  date,
  location,
  price,
}: EventCardProps) {
  const router = useRouter();
  const { isFavorite: checkFavorite, toggle } = useFavorites();
  const isFavorite =
    checkFavorite(String(id)) ||
    (publicUuid ? checkFavorite(publicUuid) : false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggle(String(id), publicUuid);
    if (res.requiresAuth && typeof window !== "undefined") {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  };

  // Navegación inteligente y segura: si tiene landing va a /e/[slug], si no a /events/[publicUuid] (previniendo BOLA/IDOR)
  const secureIdentifier = publicUuid || slug || id;
  const ctaHref =
    hasLandingPage && slug ? `/e/${slug}` : `/events/${secureIdentifier}`;

  return (
    <Link
      href={ctaHref}
      className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between border border-surface-variant cursor-pointer"
    >
      {/* Media Area - Formato cuadrado óptimo para flyers oficiales (Estilo Spotify/Teleticket) */}
      <div className="aspect-square relative overflow-hidden bg-surface-gray">
        <img
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          src={imageUrl}
          alt={altText}
        />

        {/* 1 Badge sutil de categoría (Máximo 1 para evitar saturación visual) */}
        {category && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-deep-slate border border-black/5 shadow-xs uppercase tracking-wider">
              {category}
            </span>
          </div>
        )}

        {/* Botón Favorito discreto con stopPropagation para no activar navegación */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={
            isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"
          }
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-600 transition-all shadow-xs cursor-pointer active:scale-90"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{
              fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
              color: isFavorite ? "#e11d48" : "inherit",
            }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Contenido limpio: Fecha/Ciudad -> Título -> Precio */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Fecha y Ciudad */}
          <p className="font-semibold text-[11px] sm:text-[12px] text-electric-indigo uppercase tracking-wider mb-1.5 truncate">
            {date}
            {location ? ` • ${location}` : ""}
          </p>

          {/* Título del Evento */}
          <h3 className="font-bold text-[15px] sm:text-[16px] text-deep-slate group-hover:text-electric-indigo transition-colors leading-snug line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Bloque de Precio destacado en negrita, sin botón invasivo */}
        <div className="pt-3 mt-3 border-t border-surface-variant/70 flex items-baseline justify-between">
          <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-medium">
            Precio
          </span>
          <span className="text-[15px] sm:text-base font-extrabold text-deep-slate tracking-tight">
            {price > 0 ? `Desde S/ ${price}` : "Entrada Libre"}
          </span>
        </div>
      </div>
    </Link>
  );
}
