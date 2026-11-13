import React from 'react';
import type { Metadata } from 'next';
import OrganizerEventsScreen from '@/app/features/events/ui/organizer-events-screen';

export const metadata: Metadata = {
  title: 'Mis Eventos - Panel Promotor | queplaneshoy',
  description:
    'Administra tus eventos creados, monitorea la venta de entradas por zona en tiempo real y gestiona publicaciones y liquidaciones.',
};

export default function OrganizerEventsPage() {
  return <OrganizerEventsScreen />;
}
