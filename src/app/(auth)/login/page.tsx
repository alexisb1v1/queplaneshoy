import React, { Suspense } from 'react';
import LoginPageComponent from '../../features/auth/ui/login-page';

export const metadata = {
  title: 'Iniciar Sesión | queplaneshoy',
  description: 'Inicia sesión en tu cuenta para comprar entradas, ver tus favoritos y gestionar tu perfil.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-[32px] text-electric-indigo">refresh</span>
      </div>
    }>
      <LoginPageComponent />
    </Suspense>
  );
}
