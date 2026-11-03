import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import CreateEventScreen from '@/app/features/events/ui/create-event-screen';

export const metadata: Metadata = {
  title: 'Registro de Evento - Organizador | queplaneshoy',
  description:
    'Panel de creación y registro de eventos para organizadores y promotores. Configura localidades, preventas, ticketing y multimedia.',
};

export default function CreateEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-8 h-8 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold text-deep-slate">Cargando panel de evento...</p>
        </div>
      }
    >
      <CreateEventScreen />
    </Suspense>
  );
}
