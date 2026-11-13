import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import CreateEventScreen from '@/app/features/events/ui/create-event-screen';

export const metadata: Metadata = {
  title: 'Editar Borrador - Organizador | queplaneshoy',
  description: 'Modifica y actualiza los detalles de tu evento en borrador.',
};

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizerEditEventPage({ params }: EditEventPageProps) {
  const resolvedParams = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-surface text-sm font-semibold text-on-surface-variant">
          Cargando asistente de edición del evento...
        </div>
      }
    >
      <CreateEventScreen initialEventId={resolvedParams.id} />
    </Suspense>
  );
}

