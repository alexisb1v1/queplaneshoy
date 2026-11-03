"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface EventCardProps {
  id: string | number;
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
  const [isFavorite, setIsFavorite] = useState(false);

  // Sincronizar estado inicial desde localStorage (persistencia del lado del cliente)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qph_favorites");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (ids.includes(String(id))) {
          setIsFavorite(true);
        }
      }
    } catch {
      // Ignorar errores de lectura en entornos restringidos
    }
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      const stored = localStorage.getItem("qph_favorites");
      let ids: string[] = stored ? JSON.parse(stored) : [];
      const eventIdStr = String(id);
      if (nextState) {
        if (!ids.includes(eventIdStr)) ids.push(eventIdStr);
      } else {
        ids = ids.filter((item) => item !== eventIdStr);
      }
      localStorage.setItem("qph_favorites", JSON.stringify(ids));
    } catch {
      // Ignorar errores de escritura en localStorage
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

  // Navegación inteligente: si tiene landing dedicada va a /e/[slug], si no a /events/[id]
  const ctaHref = hasLandingPage && slug ? `/e/${slug}` : `/events/${id}`;
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
            className="px-3.5 py-2 bg-electric-indigo text-white rounded-xl font-label-bold text-[12px] hover:bg-primary transition-all shadow-sm"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
}
