"use client";

import React from "react";
import Link from "next/link";
import { EVENT_CATEGORIES } from "../../constants/eventConstants";

interface BentoItemProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  altText: string;
  className: string;
  isLarge?: boolean;
}

function BentoItem({ id, title, description, imageUrl, altText, className, isLarge = false }: BentoItemProps) {
  return (
    <Link
      href={`/events?category=${id.toLowerCase()}`}
      className={`relative rounded-3xl overflow-hidden group cursor-pointer shadow-md block ${className}`}
    >
      {/* Background Image with Hover Zoom */}
      <img
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        src={imageUrl}
        alt={altText}
      />
      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
        <h3 className={`text-white mb-1 font-bold ${isLarge ? "qph-headline-lg" : "qph-headline-md"}`}>
          {title}
        </h3>
        {description && (
          <p className="text-white/80 qph-body-md text-xs md:text-sm">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}

export function CategoryBento() {
  return (
    <section className="max-w-container-max mx-auto px-margin-x py-section-gap">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="qph-headline-lg text-deep-slate mb-1">
            Explora por Categoría
          </h2>
          <p className="qph-body-md text-on-surface-variant">
            Descubre los mejores espectáculos organizados por lo que más te apasiona.
          </p>
        </div>
        <Link
          href="/events"
          className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer text-sm"
        >
          Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
      
      {/* Bento Grid layout con las 6 categorías oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
        {/* Conciertos (Grande: 4 cols) */}
        <BentoItem
          id="CONCERTS"
          title="Conciertos"
          description="De festivales masivos a noches íntimas en vivo."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCeqeGG1ivED_c8ADVg-GR2HxRTxaN0OfLCSvZUJmPR9sOLxiggNAM8HTR6sjopdnJ0jwRrCSgfmTkIFsRWguTRxV7qR_Ux7lNXwdUGagCqJ14rK3gcgI_B0L8Ls9sODYDzsFM0kJyOyaJb0OB-LwKPN1QZ5cpa-7LQtWTNwLRp979GCk8F3mDL8Ps_z-YllwBDSY7MmmS17J1fhyGAyE0w2lDhCjVk0fjaSkjP_xA_OZaZhUcnb_tqYPjRo6G1EpNqb8MHGzU7myJO"
          altText="Conciertos en vivo"
          className="md:col-span-4 h-[280px] md:h-[320px]"
          isLarge={true}
        />

        {/* Deportes (2 cols) */}
        <BentoItem
          id="SPORTS"
          title="Deportes"
          description="Vive la emoción en el estadio."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuABlww-UlQho4dnh_cvYTNyKXkTyDxehNVrtHLhU1Z_ge3DlPd43J98PLGEtxaUgVGG38p0POv9ODQmGUdZc-pT1MJXATFftbvvOc02PD4w3ZH-8AkuZItxYh2wdOBGfiF2zyQxU2yHdoADM_lRPT3lzgya6a0Rtv8TiU1FZZU3QYfnigz2nyIh2PPmFuqaTlHgVqLyaMEEpU60DKtSQ70ssEs-972RdR9yhh2sEQmwoDYbTK_gr3DpBt3UQ4uvOBenJG4w8P6SLlTJ"
          altText="Eventos deportivos"
          className="md:col-span-2 h-[280px] md:h-[320px]"
        />

        {/* Teatro & Musicales (2 cols) */}
        <BentoItem
          id="THEATER"
          title="Teatro & Musicales"
          description="Dramaturgia y arte escénico."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBifKJs2zCLJ21dWBYTNT1ATyvcDIaj7OA-duslvbS3C58Dc3sn4TODUamdiTgHbQ1hWJXAzxZOhbv7S77GwkZTPEV6brn_dNl7LDcahYhJdY5kmmuRaj-KWz19yNiZc84dFWs-gJnVf30oijXVpM-abXcFk294wbyqHRCQCJV7J4Zaf_K62_bSCqWfajU8PO1nRkOdmOurG39yqQaPgaLR45DYUmDGIsl-lWBdsuYjVMnUvX6SkC_DYGOQTcCcEX0lxyG-THTKtVc_"
          altText="Obras de teatro y musicales"
          className="md:col-span-2 h-[220px]"
        />

        {/* Festivales (2 cols) */}
        <BentoItem
          id="FESTIVALS"
          title="Festivales"
          description="Música, fiesta y cultura al aire libre."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBy-wUVgXEhItgD7xM7FmRd4wZkk3Daggm3B3DNGO4daZVlaQloOxBFcILLpSFZg_81ZvUtB-Ku7ifn0_O-fnqu6WascuRJcaQDLMK49-kwrhwD6PDXA8Bv5oUkW2UnFsu6znIwRhdSWC9T2RSRFfJnfDQ8-zZ2_SYIgphpzobyl293G5XpKHY8PxLMxuCKU5EPz6cjfQwTv6jQ16XXwKIrcr0nZlYwqoSMPXhyvqjUgab-EtHaryokqzykL1U0IW7zwiouG6GdI2hE"
          altText="Festivales masivos"
          className="md:col-span-2 h-[220px]"
        />

        {/* Comedia & Stand Up (1 col) */}
        <BentoItem
          id="COMEDY"
          title="Comedia"
          description="Risas y monólogos."
          imageUrl="https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop"
          altText="Comedia y stand up"
          className="md:col-span-1 h-[220px]"
        />

        {/* Gastronomía (1 col) */}
        <BentoItem
          id="GASTRONOMY"
          title="Gastronomía"
          description="Ferias y catas."
          imageUrl="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop"
          altText="Experiencias gastronomicas"
          className="md:col-span-1 h-[220px]"
        />
      </div>
    </section>
  );
}
