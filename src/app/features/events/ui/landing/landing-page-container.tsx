"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getEventLandingUseCase } from "../../index";
import { EventLandingModel } from "../../models/event-landing.model";
import { EventLandingView } from "./event-landing-view";
import { LandingPreloader } from "./components/landing-preloader";

interface LandingPageContainerProps {
  slug: string;
  previewTemp?: string;
}

export function LandingPageContainer({
  slug,
  previewTemp,
}: LandingPageContainerProps) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventLandingModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    // 1. Si estamos en modo previewTemp, intentar leer primero desde localStorage
    // Esto permite previsualizar eventos que aún están en borrador en el formulario sin haberse guardado en la BD
    if (typeof window !== "undefined" && previewTemp) {
      try {
        const stored =
          localStorage.getItem(`qph_preview_${slug}`) ||
          localStorage.getItem("qph_preview_temp");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            if (isMounted) {
              setEvent(parsed);
              setLoading(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn(
          "No se pudo leer preview desde localStorage, recurriendo a API...",
          err,
        );
      }
    }

    // 2. Si no está en memoria local, consultar la API del backend
    getEventLandingUseCase.execute(slug, previewTemp).match(
      (data) => {
        if (!isMounted) return;
        setEvent(data);
        setLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        setErrorMessage(
          previewTemp
            ? `No se encontró el borrador para '${slug}'. Asegúrate de tener abierta la pestaña de edición del evento en este mismo navegador para cargar la previsualización en vivo.`
            : error.message || "No se pudo cargar la experiencia.",
        );
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [slug, previewTemp]);

  if (loading) {
    return <LandingPreloader isLoading={true} />;
  }

  if (errorMessage || !event) {
    return (
      <main className="min-h-screen bg-deep-slate flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-xl border border-white/10">
          <img
            src="/logo-qph.svg"
            alt="queplanhoy logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-electric-indigo mb-2">
          Experiencia no disponible
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">
          Evento no encontrado
        </h1>
        <p className="text-sm text-platinum-silver max-w-md mb-8 leading-relaxed">
          {errorMessage ||
            "El evento solicitado no cuenta con una landing page dedicada activa o ha finalizado."}
        </p>
        <Link
          href="/"
          className="px-6 py-3.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Explorar Cartelera Principal</span>
        </Link>
      </main>
    );
  }

  return (
    <>
      {(previewTemp || event.isPreview) && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black px-4 py-1.5 text-center text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm">visibility</span>
          <span>Modo Vista Previa Temporal — Evento no publicado aún</span>
        </div>
      )}
      <EventLandingView event={event} />
    </>
  );
}
