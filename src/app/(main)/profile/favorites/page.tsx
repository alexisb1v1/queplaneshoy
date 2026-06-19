import React from 'react';
import FavoritesTab from '../../../features/profile/ui/favorites-tab';

export const metadata = {
  title: 'Mis Favoritos | queplaneshoy',
  description: 'Revisa y compra entradas para los eventos que has guardado.',
};

export default function ProfileFavoritesPage() {
  return (
    <div>
      <FavoritesTab />
    </div>
  );
}
