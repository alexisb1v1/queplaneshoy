"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getEventLandingUseCase } from "../../index";
import { EventLandingModel } from "../../models/event-landing.model";
import { EventLandingView } from "./event-landing-view";
import { LandingPreloader } from "./components/landing-preloader";

interface LandingPageContainerProps {
  slug: string;
}

export function LandingPageContainer({ slug }: LandingPageContainerProps) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventLandingModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    getEventLandingUseCase.execute(slug).match(
      (data) => {
        if (!isMounted) return;
        setEvent(data);
        setLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "No se pudo cargar la experiencia.");
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <LandingPreloader isLoading={true} />;
  }

  if (errorMessage || !event) {
    return (
      <main className="min-h-screen bg-deep-slate flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-xl border border-white/10">
          <img
            src="/logo-qph.svg"
            alt="queplaneshoy logo"
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

  return <EventLandingView event={event} />;
}

