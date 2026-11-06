import React from 'react';
import type { Metadata } from 'next';
import OrganizerEventDetailScreen from '@/app/features/events/ui/organizer-event-detail-screen';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Administrador del Evento (${id}) - Panel Promotor | queplaneshoy`,
    description:
      'Control de taquilla en tiempo real, desglose por zonas, gestión de tesorería, adelanto de fondos y analítica de ventas para organizadores.',
  };
}

export default async function OrganizerEventDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrganizerEventDetailScreen eventId={id} />;
}
