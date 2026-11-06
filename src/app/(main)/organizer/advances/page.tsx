import React from 'react';
import type { Metadata } from 'next';
import OrganizerSettlementScreen from '@/app/features/events/ui/organizer-settlement-screen';

export const metadata: Metadata = {
  title: 'Adelanto de Fondos - Panel Promotor | queplaneshoy',
  description:
    'Solicitud y gestión de adelantos inmediatos de fondos de taquilla para organizadores de eventos.',
};

export default function OrganizerAdvancesPage() {
  return <OrganizerSettlementScreen />;
}
