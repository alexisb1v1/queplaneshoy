import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Políticas de Cookies | queplanhoy",
  description:
    "Información sobre el uso de cookies y tecnologías de almacenamiento local en queplanhoy, servicio operado por OmniCore S.A.C.",
};

export default function PoliticaDeCookiesPage() {
  return (
    <div className="bg-[#0B0F19] text-slate-200 min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Cabecera Principal */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-electric-indigo">
            <span className="material-symbols-outlined text-base">cookie</span>
            <span>Uso de Cookies &bull; Transparencia Digital</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Política de Cookies
          </h1>
          <p className="text-sm text-slate-400">
            En <strong>queplanhoy</strong> (servicio operado por{" "}
            <strong>OmniCore S.A.C.</strong>) utilizamos cookies y
            almacenamiento local para garantizar la operatividad de la boletería
            digital, recordar tus preferencias y optimizar tu experiencia.
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              ¿Qué son las Cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que los sitios web
              almacenan temporalmente en tu navegador. Nos permiten reconocer tu
              sesión de usuario, mantener seguras tus operaciones y recordar
              preferencias como tu departamento o ciudad seleccionada.
            </p>
          </section>

          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              Tipos de Cookies que Utilizamos
            </h2>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <span className="font-bold text-white text-sm block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-electric-indigo text-base">
                    lock
                  </span>
                  Cookies Técnicas y de Sesión (Esenciales)
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permiten la navegación segura, el inicio de sesión protegido y
                  la reserva temporal de entradas durante el proceso de compra.
                  Son estrictamente necesarias para el funcionamiento del
                  servicio.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <span className="font-bold text-white text-sm block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-electric-indigo text-base">
                    tune
                  </span>
                  Cookies de Preferencias y Funcionalidad
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recuerdan opciones que personalizan tu experiencia, como tu
                  ciudad preferida en la cartelera o tu lista de eventos
                  favoritos.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <span className="font-bold text-white text-sm block flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-electric-indigo text-base">
                    analytics
                  </span>
                  Cookies de Analítica y Rendimiento
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recopilan información estadística anónima sobre el uso de la
                  plataforma para mejorar la velocidad y la calidad de la
                  cartelera.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              Control y Gestión de Cookies
            </h2>
            <p>
              Puedes permitir, consultar, bloquear o eliminar las cookies
              instaladas en tu dispositivo en cualquier momento desde las{" "}
              <strong>
                opciones de privacidad y seguridad de tu navegador web habitual
              </strong>
              .
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ten en cuenta que si deshabilitas las cookies técnicas esenciales,
              es posible que algunas funciones indispensables (como iniciar
              sesión o completar una compra de entradas) no se encuentren
              disponibles.
            </p>
          </section>
        </div>

        {/* Footer de navegación interna */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <Link
            href="/"
            className="text-electric-indigo hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            <span>Volver a la Cartelera Principal</span>
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link
              href="/terminos-y-condiciones"
              className="hover:text-white transition-colors"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/politicas-de-privacidad"
              className="hover:text-white transition-colors"
            >
              Políticas de Privacidad
            </Link>
            <Link
              href="/centro-de-ayuda"
              className="hover:text-white transition-colors"
            >
              Centro de Ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
