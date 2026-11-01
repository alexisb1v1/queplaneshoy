import React from 'react';
import type { Metadata } from 'next';
import CreateEventScreen from '@/app/features/events/ui/create-event-screen';

export const metadata: Metadata = {
  title: 'Registro de Evento - Organizador | queplaneshoy',
  description:
    'Panel de creación y registro de eventos para organizadores y promotores. Configura localidades, preventas, ticketing y multimedia.',
};

export default function CreateEventPage() {
  return <CreateEventScreen />;
}
