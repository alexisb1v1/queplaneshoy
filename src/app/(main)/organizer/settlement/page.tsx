import React from 'react';
import type { Metadata } from 'next';
import OrganizerSettlementScreen from '@/app/features/events/ui/organizer-settlement-screen';

export const metadata: Metadata = {
  title: 'Liquidación y Adelanto - Panel Promotor | queplaneshoy',
  description:
    'Gestión de tesorería, liquidaciones finales y adelanto inmediato de fondos para organizadores de eventos.',
};

export default function OrganizerSettlementPage() {
  return <OrganizerSettlementScreen />;
}
