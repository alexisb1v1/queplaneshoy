import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import CreateEventScreen from '@/app/features/events/ui/create-event-screen';

export const metadata: Metadata = {
  title: 'Nuevo Evento - Organizador | queplaneshoy',
  description:
    'Asistente paso a paso para crear un nuevo evento con control de aforos, fechas, preventa, landing page y cupones.',
};

export default function OrganizerNewEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-surface text-sm font-semibold text-on-surface-variant">
          Cargando asistente de creación de evento...
        </div>
      }
    >
      <CreateEventScreen />
    </Suspense>
  );
}

