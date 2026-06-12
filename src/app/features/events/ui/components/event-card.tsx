"use client";

import React, { useState } from "react";

export interface EventCardProps {
  id: string | number;
  title: string;
  category: string;
  imageUrl: string;
  altText: string;
  date: string;
  location: string;
  price: number;
  ticketType: string;
  ticketBadgeStyle?: "general" | "vip" | "platinum";
}

export function EventCard({
  title,
  category,
  imageUrl,
  altText,
  date,
  location,
  price,
  ticketType,
  ticketBadgeStyle = "general",
}: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const getBadgeClass = () => {
    switch (ticketBadgeStyle) {
      case "vip":
        return "bg-vip-gold text-white";
      case "platinum":
        return "bg-slate-400 text-white";
      case "general":
      default:
        return "bg-surface-gray text-electric-indigo";
    }
  };

  return (
    <div className="qph-event-card group">
      {/* Media Area */}
      <div className="aspect-video relative overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={imageUrl}
          alt={altText}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] qph-label-bold text-deep-slate shadow-sm">
            {category.toUpperCase()}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-white text-error"
              : "bg-white/20 text-white hover:bg-white hover:text-error"
          }`}
          aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1">
        <p className="qph-label-bold text-[12px] text-electric-indigo mb-1 uppercase">
          {date} • {location}
        </p>
        <h3 className="qph-headline-md mb-4 group-hover:text-electric-indigo transition-colors flex-1">
          {title}
        </h3>
        
        {/* Pricing / Tiers */}
        <div className="flex justify-between items-center pt-4 border-t border-surface-gray">
          <span className="qph-price-tag text-deep-slate">
            Desde {price}€
          </span>
          <span className={`px-3 py-1 rounded-lg qph-label-bold text-[12px] uppercase ${getBadgeClass()}`}>
            {ticketType}
          </span>
        </div>
      </div>
    </div>
  );
}
