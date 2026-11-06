import React, { Suspense } from "react";
import ExploreEventsPageComponent from "../../features/events/ui/explore-page";

export const metadata = {
  title: "Cartelera Oficial de Eventos | queplaneshoy",
  description: "Descubre los mejores conciertos, obras de teatro, festivales y eventos deportivos en todo el Perú con acceso oficial garantizado.",
};

export default function EventsExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-surface-variant flex items-center justify-center mb-4 animate-pulse">
            <img
              src="/logo-qph.svg"
              alt="queplaneshoy logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-bold text-deep-slate">Cargando cartelera de eventos...</p>
        </div>
      }
    >
      <ExploreEventsPageComponent />
    </Suspense>
  );
}
