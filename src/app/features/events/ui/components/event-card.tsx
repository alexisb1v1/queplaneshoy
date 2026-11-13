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
  altText?: string;
  date: string;
  location: string;
  price: number;
  ticketType: string;
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
  ticketType,
  ticketBadgeStyle = "general",
  description = "Acceso oficial garantizado para esta función en directo.",
  urgencyText = "Aforo limitado",
  urgencyIcon = "bolt",
  urgencyType = "info",
}: EventCardProps) {
  const router = useRouter();
  const { isFavorite: checkFavorite, toggle } = useFavorites();
  const isFavorite = checkFavorite(String(id)) || (publicUuid ? checkFavorite(publicUuid) : false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggle(String(id), publicUuid);
    if (res.requiresAuth && typeof window !== "undefined") {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  const getBadgeClass = () => {
    switch (ticketBadgeStyle) {
      case "vip":
        return "bg-vip-gold text-white";
      case "platinum":
        return "bg-slate-700 text-white";
      case "error":
        return "bg-rose-600 text-white";
      case "general":
      default:
        return "bg-surface-gray text-electric-indigo border border-surface-variant/40";
    }
  };

  const getUrgencyColorClass = () => {
    switch (urgencyType) {
      case "critical":
        return "text-rose-600";
      case "high_demand":
        return "text-amber-500";
      case "warning":
        return "text-yellow-600";
      case "info":
      default:
        return "text-rose-500";
    }
  };

  // Navegación inteligente y segura: si tiene landing va a /e/[slug], si no a /events/[publicUuid] (previniendo BOLA/IDOR)
  const secureIdentifier = publicUuid || slug || id;
  const ctaHref = hasLandingPage && slug ? `/e/${slug}` : `/events/${secureIdentifier}`;
  const ctaText = hasLandingPage && slug ? "Ver Experiencia" : "Comprar Entradas";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between border border-surface-variant">
      {/* Media Area */}
      <div className="aspect-video relative overflow-hidden">
        <Link href={ctaHref} className="block w-full h-full">
          <img
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500 cursor-pointer"
            src={imageUrl}
            alt={altText}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-label-bold text-deep-slate border border-surface-variant/40 shadow-xs uppercase">
            {category}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-label-bold uppercase ${getBadgeClass()}`}
          >
            {ticketType}
          </span>
        </div>

        {/* Botón Favorito */}
        <button
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-600 transition-all cursor-pointer"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{
              fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0",
              color: isFavorite ? "#e11d48" : "inherit",
            }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="font-label-bold text-[12px] text-electric-indigo mb-1 uppercase">
            {date} • {location}
          </p>
          <Link href={ctaHref} className="block">
            <h3 className="font-headline-md text-headline-md group-hover:text-electric-indigo transition-colors leading-tight mb-2 cursor-pointer">
              {title}
            </h3>
          </Link>
          <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mb-3">
            {description}
          </p>
          <div className={`flex items-center gap-1.5 ${getUrgencyColorClass()} mb-2`}>
            <span className="material-symbols-outlined text-sm">{urgencyIcon}</span>
            <span className="font-label-bold text-[11px]">{urgencyText}</span>
          </div>
        </div>

        {/* Footer de Card con borde uniforme y botón de compra inteligente */}
        <div className="flex justify-between items-center pt-3 border-t border-surface-variant">
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase font-label-bold">Precio</span>
            <span className="font-price-tag text-price-tag text-deep-slate">
              Desde S/. {price}
            </span>
          </div>
          <Link
            href={ctaHref}
            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl font-label-bold text-[12px] transition-all shadow-sm shadow-rose-500/25 cursor-pointer"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
}
