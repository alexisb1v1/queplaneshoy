"use client";

import React from "react";

interface BentoItemProps {
  title: string;
  description?: string;
  imageUrl: string;
  altText: string;
  className: string;
  isLarge?: boolean;
}

function BentoItem({ title, description, imageUrl, altText, className, isLarge = false }: BentoItemProps) {
  return (
    <div className={`relative rounded-3xl overflow-hidden group cursor-pointer shadow-md ${className}`}>
      {/* Background Image with Hover Zoom */}
      <img
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        src={imageUrl}
        alt={altText}
      />
      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8">
        <h3 className={`text-white mb-1 ${isLarge ? "qph-headline-lg" : "qph-headline-md"}`}>
          {title}
        </h3>
        {description && (
          <p className="text-white/70 qph-body-md">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function CategoryBento() {
  return (
    <section className="max-w-container-max mx-auto px-margin-x py-section-gap">
      <h2 className="qph-headline-lg text-deep-slate mb-10 text-center">
        Explora por Categoría
      </h2>
      
      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-gutter h-auto md:h-[600px]">
        {/* Música (Grande: 2 cols x 2 rows) */}
        <BentoItem
          title="Música"
          description="De festivales masivos a clubes íntimos."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCeqeGG1ivED_c8ADVg-GR2HxRTxaN0OfLCSvZUJmPR9sOLxiggNAM8HTR6sjopdnJ0jwRrCSgfmTkIFsRWguTRxV7qR_Ux7lNXwdUGagCqJ14rK3gcgI_B0L8Ls9sODYDzsFM0kJyOyaJb0OB-LwKPN1QZ5cpa-7LQtWTNwLRp979GCk8F3mDL8Ps_z-YllwBDSY7MmmS17J1fhyGAyE0w2lDhCjVk0fjaSkjP_xA_OZaZhUcnb_tqYPjRo6G1EpNqb8MHGzU7myJO"
          altText="Festival de musica masivo"
          className="md:col-span-2 md:row-span-2 h-[300px] md:h-full"
          isLarge={true}
        />

        {/* Deportes (Ancho: 2 cols x 1 row) */}
        <BentoItem
          title="Deportes"
          description="Vive la emoción del estadio."
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuABlww-UlQho4dnh_cvYTNyKXkTyDxehNVrtHLhU1Z_ge3DlPd43J98PLGEtxaUgVGG38p0POv9ODQmGUdZc-pT1MJXATFftbvvOc02PD4w3ZH-8AkuZItxYh2wdOBGfiF2zyQxU2yHdoADM_lRPT3lzgya6a0Rtv8TiU1FZZU3QYfnigz2nyIh2PPmFuqaTlHgVqLyaMEEpU60DKtSQ70ssEs-972RdR9yhh2sEQmwoDYbTK_gr3DpBt3UQ4uvOBenJG4w8P6SLlTJ"
          altText="Estadio deportivo profesional"
          className="md:col-span-2 h-[200px] md:h-full"
          isLarge={true}
        />

        {/* Teatro (Pequeño: 1 col x 1 row) */}
        <BentoItem
          title="Teatro"
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBifKJs2zCLJ21dWBYTNT1ATyvcDIaj7OA-duslvbS3C58Dc3sn4TODUamdiTgHbQ1hWJXAzxZOhbv7S77GwkZTPEV6brn_dNl7LDcahYhJdY5kmmuRaj-KWz19yNiZc84dFWs-gJnVf30oijXVpM-abXcFk294wbyqHRCQCJV7J4Zaf_K62_bSCqWfajU8PO1nRkOdmOurG39yqQaPgaLR45DYUmDGIsl-lWBdsuYjVMnUvX6SkC_DYGOQTcCcEX0lxyG-THTKtVc_"
          altText="Mascara teatral sobre fondo de terciopelo"
          className="h-[200px] md:h-full"
        />

        {/* Festivales (Pequeño: 1 col x 1 row) */}
        <BentoItem
          title="Festivales"
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBy-wUVgXEhItgD7xM7FmRd4wZkk3Daggm3B3DNGO4daZVlaQloOxBFcILLpSFZg_81ZvUtB-Ku7ifn0_O-fnqu6WascuRJcaQDLMK49-kwrhwD6PDXA8Bv5oUkW2UnFsu6znIwRhdSWC9T2RSRFfJnfDQ8-zZ2_SYIgphpzobyl293G5XpKHY8PxLMxuCKU5EPz6cjfQwTv6jQ16XXwKIrcr0nZlYwqoSMPXhyvqjUgab-EtHaryokqzykL1U0IW7zwiouG6GdI2hE"
          altText="Festival gastronomico al aire libre"
          className="h-[200px] md:h-full"
        />
      </div>
    </section>
  );
}
