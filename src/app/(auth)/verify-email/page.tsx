import React, { Suspense } from 'react';
import VerifyEmailPageComponent from '../../features/auth/ui/verify-email-page';

export const metadata = {
  title: 'Verificar Correo Electrónico | queplaneshoy',
  description: 'Confirma tu dirección de correo electrónico para activar tu cuenta en queplaneshoy y empezar a disfrutar de los mejores eventos.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-4xl text-electric-indigo">
              refresh
            </span>
            <p className="text-sm font-semibold text-on-surface-variant">Cargando verificación...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailPageComponent />
    </Suspense>
  );
}

