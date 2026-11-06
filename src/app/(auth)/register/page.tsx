import React, { Suspense } from 'react';
import RegisterPageComponent from '../../features/auth/ui/register-page';

export const metadata = {
  title: 'Crear una cuenta | queplaneshoy',
  description: 'Regístrate en queplaneshoy para comprar entradas, ver tus eventos favoritos y gestionar tus reservas de forma rápida y sencilla.',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-[32px] text-electric-indigo">refresh</span>
      </div>
    }>
      <RegisterPageComponent />
    </Suspense>
  );
}
