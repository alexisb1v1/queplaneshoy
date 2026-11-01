import React from 'react';
import type { Metadata } from 'next';
import CreateEventScreen from '@/app/features/events/ui/create-event-screen';

export const metadata: Metadata = {
  title: 'Nuevo Evento - Organizador | queplaneshoy',
  description:
    'Crea un nuevo evento desde el panel de organizador con control de aforos, fechas, preventa y cupones.',
};

export default function OrganizerNewEventPage() {
  return <CreateEventScreen />;
}
