"use client";

import React, { useState, useRef, useEffect } from "react";
import { trackUmamiEvent } from "@/app/common/utils/analytics";

export interface ShareSocialPopoverProps {
  /**
   * Título o nombre del evento para compartir
   */
  title: string;
  /**
   * Slug del evento (usado preferentemente para URL amigable de landing o detalle)
   */
  slug?: string;
  /**
   * UUID público del evento para unificar en analítica y UTM content
   */
  publicUuid: string;
  /**
   * Si es llamado desde una landing page o el detalle tradicional
   */
  source?: "landing" | "event_detail";
  /**
   * Alineación del tooltip/popover
   */
  align?: "left" | "right" | "center";
  /**
   * Render custom trigger si se desea, o por defecto un botón con icono
   */
  children?: React.ReactNode;
  /**
   * Estilo de tema (dark para landing, light para páginas estándar)
   */
  theme?: "dark" | "light";
}

type SocialChannel = "whatsapp" | "facebook" | "instagram" | "tiktok" | "copy";

export function ShareSocialPopover({
  title,
  slug,
  publicUuid,
  source = "landing",
  align = "right",
  children,
  theme = "dark",
}: ShareSocialPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Generación de URL con parámetros UTM canónicos
  const getShareUrl = (channel: SocialChannel): string => {
    if (typeof window === "undefined") return "";

    const baseUrl = window.location.origin;
    // Si viene de landing o tiene slug, usamos la ruta canónica
    const path = source === "landing" && slug ? `/e/${slug}` : `/events/${slug || publicUuid}`;

    const params = new URLSearchParams();
    params.set("utm_source", channel);
    params.set("utm_medium", "social");
    params.set("utm_campaign", "share_event");
    if (publicUuid) {
      params.set("utm_content", publicUuid);
    }

    return `${baseUrl}${path}?${params.toString()}`;
  };

  const handleShare = async (channel: SocialChannel) => {
    const shareUrl = getShareUrl(channel);
    const shareText = `¡No te pierdas ${title}! Consigue tus entradas oficiales en Qué Planes Hoy:`;

    // Registrar en Umami Analytics con el UID universal
    trackUmamiEvent("event_share_click", {
      channel,
      event_uuid: publicUuid,
      event_slug: slug || "",
      source,
    });

    switch (channel) {
      case "whatsapp": {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText} ${shareUrl}`
        )}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        setIsOpen(false);
        break;
      }

      case "facebook": {
        // Facebook sharer estándar compatible con URLs web
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(
          fbUrl,
          "_blank",
          "noopener,noreferrer,toolbar=0,status=0,width=626,height=436"
        );
        setIsOpen(false);
        break;
      }

      case "instagram":
      case "tiktok":
      case "copy": {
        // Instagram y TikTok no ofrecen web share URL directo para enlaces web externos,
        // por lo que copiamos al portapapeles con el UTM de la red social correspondiente.
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopiedChannel(channel);
          setTimeout(() => {
            setCopiedChannel(null);
            setIsOpen(false);
          }, 1800);
        } catch {
          // Fallback silencioso
        }
        break;
      }
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Botón Disparador */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {children ? (
          children
        ) : (
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full transition-all cursor-pointer text-xs font-bold border active:scale-95 shadow-sm ${
              isDark
                ? "bg-white/10 hover:bg-white/20 text-white border-white/10"
                : "bg-surface-variant/40 hover:bg-surface-variant/80 text-deep-slate border-surface-variant"
            }`}
            title="Compartir evento en redes sociales"
          >
            <span className="material-symbols-outlined text-[17px]">share</span>
            <span className="hidden sm:inline">Compartir</span>
          </button>
        )}
      </div>

      {/* Popover / Tooltip Desplegable */}
      {isOpen && (
        <div
          className={`absolute mt-2.5 z-[100] w-72 rounded-2xl p-3 shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            align === "right"
              ? "right-0"
              : align === "left"
              ? "left-0"
              : "left-1/2 -translate-x-1/2"
          } ${
            isDark
              ? "bg-zinc-950/95 border-white/15 text-white shadow-black/80"
              : "bg-white/95 border-gray-200 text-deep-slate shadow-xl"
          }`}
        >
          {/* Cabecera del Tooltip */}
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-75">
              Compartir este evento
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
              title="Cerrar"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Opciones de Redes Sociales */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleShare("whatsapp")}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                isDark ? "hover:bg-white/10 text-emerald-400" : "hover:bg-emerald-50 text-emerald-700"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-emerald-500" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.174.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                </svg>
              </div>
              <span className="truncate">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleShare("facebook")}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                isDark ? "hover:bg-white/10 text-blue-400" : "hover:bg-blue-50 text-blue-700"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-blue-500" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                </svg>
              </div>
              <span className="truncate">Facebook</span>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={() => handleShare("instagram")}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                isDark ? "hover:bg-white/10 text-pink-400" : "hover:bg-pink-50 text-pink-700"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-pink-500" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <span className="truncate">
                {copiedChannel === "instagram" ? "¡Copiado!" : "Instagram"}
              </span>
            </button>

            {/* TikTok */}
            <button
              type="button"
              onClick={() => handleShare("tiktok")}
              className={`flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                isDark ? "hover:bg-white/10 text-cyan-300" : "hover:bg-cyan-50 text-cyan-700"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 fill-cyan-400" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </div>
              <span className="truncate">
                {copiedChannel === "tiktok" ? "¡Copiado!" : "TikTok"}
              </span>
            </button>
          </div>

          {/* Botón General de Copiar Enlace */}
          <div className="pt-2 mt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleShare("copy")}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copiedChannel === "copy"
                  ? "bg-emerald-500 text-white"
                : isDark
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-surface-variant/40 hover:bg-surface-variant/80 text-deep-slate"
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {copiedChannel === "copy" ? "check" : "link"}
              </span>
              <span>{copiedChannel === "copy" ? "¡Enlace copiado con éxito!" : "Copiar enlace directo"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
