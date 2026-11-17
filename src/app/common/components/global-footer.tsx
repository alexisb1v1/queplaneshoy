"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function GlobalFooter() {
  const router = useRouter();
  const [isLocating, setIsLocating] = useState(false);

  const handleNearMeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;

    // 1. Revisar si ya existe una ciudad recordada en localStorage
    const savedCity = localStorage.getItem("qph_selected_city");
    if (savedCity && savedCity !== "Todas" && savedCity !== "Todos") {
      router.push(`/events?city=${encodeURIComponent(savedCity)}`);
      return;
    }

    // 2. Intentar geolocalización rápida en el navegador
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Detección aproximada en Perú (ej. Pucallpa / Ucayali o Lima)
            // Si está en la selva central (latitud aprox -8.3 y longitud -74.5)
            if (latitude >= -9.5 && latitude <= -7.0 && longitude >= -76.0 && longitude <= -73.0) {
              router.push("/events?city=Pucallpa");
            } else if (latitude >= -13.0 && latitude <= -11.0 && longitude >= -78.0 && longitude <= -76.5) {
              router.push("/events?city=Lima");
            } else if (latitude >= -14.0 && latitude <= -12.5 && longitude >= -73.0 && longitude <= -71.0) {
              router.push("/events?city=Cusco");
            } else {
              router.push("/events?near=true");
            }
          } catch {
            router.push("/events?near=true");
          } finally {
            setIsLocating(false);
          }
        },
        () => {
          setIsLocating(false);
          router.push("/events?near=true");
        },
        { timeout: 4000 }
      );
    } else {
      router.push("/events?near=true");
    }
  };

  return (
    <footer className="bg-deep-slate text-surface-container-lowest w-full border-t border-outline-variant/10 font-sans pb-20 md:pb-0">
      
      {/* Contenedor Principal: 4 Columnas Alineadas y Proporcionadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full px-6 sm:px-8 lg:px-12 py-12 md:py-16 max-w-container-max mx-auto">
        
        {/* Columna 1: Marca & Valor Oficial */}
        <div className="space-y-5">
          <Link href="/" className="flex items-center gap-2.5 inline-flex cursor-pointer hover:opacity-95 transition-opacity">
            <img src="/logo-qph.svg" className="w-9 h-9 rounded-md object-contain" alt="queplanhoy logo" />
            <span className="font-extrabold text-2xl tracking-tight text-white">
              queplan<span className="text-electric-indigo">hoy</span>
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-platinum-silver leading-relaxed max-w-sm">
            Tu boletería digital oficial con validación segura e instantánea por código QR único. Descubre y asegura tus entradas para los mejores conciertos, festivales, obras y experiencias en todo el Perú.
          </p>

          {/* Sello de Seguridad */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300">
            <span className="material-symbols-outlined text-electric-indigo text-base">verified_user</span>
            <span>Entradas 100% al Portador con Código QR Único</span>
          </div>

          {/* Redes Sociales Oficiales */}
          <div className="pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3">
              Síguenos en Redes
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/queplanhoy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Oficial"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-platinum-silver hover:bg-electric-indigo hover:text-white hover:border-electric-indigo transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </a>
              <a
                href="https://tiktok.com/@queplanhoy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Oficial"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-platinum-silver hover:bg-electric-indigo hover:text-white hover:border-electric-indigo transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">music_video</span>
              </a>
              <a
                href="https://facebook.com/queplanhoy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Oficial"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-platinum-silver hover:bg-electric-indigo hover:text-white hover:border-electric-indigo transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">public</span>
              </a>
            </div>
          </div>
        </div>

        {/* Columna 2: Explorar Cartelera (Filtros Reales a /events) */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
            Explorar Eventos
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link
                href="/events"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">explore</span>
                <span>Todas las Categorías</span>
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=CONCERTS"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">music_note</span>
                <span>Conciertos en Vivo</span>
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=FESTIVALS"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">festival</span>
                <span>Festivales &amp; Fiestas</span>
              </Link>
            </li>
            <li>
              <Link
                href="/events?category=THEATER"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">theater_comedy</span>
                <span>Teatro &amp; Comedia</span>
              </Link>
            </li>
            <li>
              <Link
                href="/events?date=today"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-emerald-400">today</span>
                <span>Eventos de Hoy</span>
              </Link>
            </li>
            <li>
              <Link
                href="/events?date=weekend"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">event_available</span>
                <span>Este Fin de Semana</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleNearMeClick}
                disabled={isLocating}
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-sm text-rose-400">near_me</span>
                <span>{isLocating ? "Localizando..." : "Cerca de ti"}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Columna 3: Soporte & Atención Oficial */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
            Soporte &amp; Contacto
          </h4>
          <ul className="space-y-3 text-xs sm:text-sm">
            <li>
              <Link
                href="/centro-de-ayuda"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">help_center</span>
                <span>Centro de Ayuda (Preguntas Frecuentes)</span>
              </Link>
            </li>
            <li>
              <a
                href="mailto:soporte@queplanhoy.com"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">mail</span>
                <span>soporte@queplanhoy.com</span>
              </a>
            </li>

            {/* Número de Teléfono con Ícono de WhatsApp */}
            <li className="pt-1">
              <a
                href="https://wa.me/51992884054"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all duration-200 font-bold"
                title="Atención oficial por WhatsApp"
              >
                <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp: 992884054</span>
              </a>
            </li>

            <li>
              <Link
                href="/organizer/events/new"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-electric-indigo">add_business</span>
                <span>Publicar como Promotor</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 4: Sección Legal (Términos, Privacidad, Cookies) */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
            Marco Legal &amp; Normativa
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link
                href="/terminos-y-condiciones"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-slate-400">gavel</span>
                <span>Términos y Condiciones</span>
              </Link>
            </li>
            <li>
              <Link
                href="/politicas-de-privacidad"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-slate-400">shield</span>
                <span>Políticas de Privacidad</span>
              </Link>
            </li>
            <li>
              <Link
                href="/politica-de-cookies"
                className="text-platinum-silver hover:text-white transition-colors duration-200 flex items-center gap-1.5 hover:translate-x-1 transition-transform"
              >
                <span className="material-symbols-outlined text-sm text-slate-400">cookie</span>
                <span>Políticas de Cookies</span>
              </Link>
            </li>
            <li>
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                    <span className="material-symbols-outlined text-amber-400 text-sm">menu_book</span>
                    <span>Libro de Reclamaciones</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Conforme al Código de Protección y Defensa del Consumidor del Perú.
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Franja Inferior: Copyright & Logos de Marcas de Pago Oficiales */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="max-w-container-max mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          
          <p className="text-xs text-slate-400">
            &copy; 2026 <strong>queplanhoy Ticketing</strong> &bull; Un servicio provisto por <strong>OmniCore S.A.C.</strong> &bull; Todos los derechos reservados.
          </p>

          {/* Logos Oficiales de Tarjetas y Billeteras Digitales */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Visa */}
            <div
              className="h-7 px-2.5 rounded bg-white flex items-center justify-center shadow-xs"
              title="Tarjeta Visa Crédito / Débito"
            >
              <svg className="h-3.5 w-auto" viewBox="0 0 48 16" fill="none">
                <path
                  d="M19.16 0.44L12.56 15.56H8.24L5.04 3.76C4.84 3 4.68 2.68 4.08 2.36C3.08 1.8 1.48 1.32 0.08 1L0.2 0.44H7.04C7.92 0.44 8.72 1.04 8.92 2.08L10.6 11.08L14.76 0.44H19.16ZM35.96 10.6C36 6.56 30.36 6.32 30.4 4.52C30.4 3.96 30.92 3.36 32.08 3.2C32.64 3.12 34.28 3.08 36.08 3.92L36.8 0.56C35.8 0.2 34.52 0 32.92 0C28.88 0 26.04 2.16 26 5.24C25.96 7.52 28 8.8 29.56 9.56C31.16 10.32 31.72 10.84 31.72 11.52C31.68 12.56 30.44 13.04 29.32 13.04C27.28 13.04 26.08 12.44 25.12 12L24.36 15.52C25.32 15.96 27.12 16.32 28.96 16.36C33.24 16.36 35.96 14.24 35.96 10.6ZM46.52 15.56H42.72L40.24 3.64C40.08 2.88 39.52 2.48 38.8 2.48C37.84 2.48 36.4 2.48 35.24 2.48L35.08 3.2C37.28 3.76 39.04 4.52 39.84 5.36L43.28 15.56H46.52ZM25.04 0.44L21.64 15.56H17.44L20.84 0.44H25.04Z"
                  fill="#1A1F71"
                />
              </svg>
            </div>

            {/* Mastercard */}
            <div
              className="h-7 px-2 rounded bg-white flex items-center justify-center gap-1 shadow-xs"
              title="Mastercard Débito / Crédito"
            >
              <div className="flex -space-x-1.5 items-center">
                <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block opacity-95"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block opacity-95"></span>
              </div>
              <span className="text-[9px] font-black tracking-tighter text-slate-800 uppercase font-sans">
                mastercard
              </span>
            </div>

            {/* American Express */}
            <div
              className="h-7 px-2 rounded bg-[#006FCF] flex items-center justify-center shadow-xs"
              title="American Express"
            >
              <span className="text-[9px] font-black tracking-tighter text-white uppercase font-sans">
                AMEX
              </span>
            </div>

            {/* Diners Club */}
            <div
              className="h-7 px-2 rounded bg-white flex items-center justify-center shadow-xs"
              title="Diners Club International"
            >
              <span className="text-[9px] font-black tracking-tighter text-[#004B87] uppercase font-sans">
                DINERS CLUB
              </span>
            </div>

            {/* Yape */}
            <div
              className="h-7 px-2 rounded bg-[#6A1B9A] flex items-center justify-center shadow-xs border border-white/20"
              title="Yape BCP"
            >
              <span className="text-[9px] font-black tracking-tight text-[#00E5FF] uppercase font-sans">
                YAPE
              </span>
            </div>

            {/* Plin */}
            <div
              className="h-7 px-2 rounded bg-[#00BCD4] flex items-center justify-center shadow-xs"
              title="Plin BBVA / Interbank / Scotiabank"
            >
              <span className="text-[9px] font-black tracking-tight text-white uppercase font-sans">
                PLIN
              </span>
            </div>

            {/* Certificación PCI DSS */}
            <div
              className="h-7 px-2 rounded bg-white/10 border border-white/10 flex items-center justify-center gap-1"
              title="Transacciones protegidas con estándar PCI-DSS y cifrado SSL 256 bits"
            >
              <span className="material-symbols-outlined text-[12px] text-emerald-400">lock</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">
                PCI-DSS
              </span>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}
export default GlobalFooter;
