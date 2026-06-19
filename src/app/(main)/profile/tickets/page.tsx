import React from 'react';
import TicketsTab from '../../../features/profile/ui/tickets-tab';

export const metadata = {
  title: 'Mis Entradas | queplaneshoy',
  description: 'Revisa y descarga tus entradas para tus próximos eventos.',
};

export default function ProfileTicketsPage() {
  return (
    <div>
      <TicketsTab />
    </div>
  );
}
