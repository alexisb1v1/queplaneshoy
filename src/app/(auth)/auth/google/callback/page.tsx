import React, { Suspense } from 'react';
import GoogleCallbackPageComponent from '../../../../features/auth/ui/google-callback-page';

export const metadata = {
  title: 'Autenticación con Google | queplaneshoy',
  description: 'Completando el inicio de sesión seguro con tu cuenta de Google.',
};

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <span className="material-symbols-outlined animate-spin text-[32px] text-electric-indigo">
            refresh
          </span>
        </div>
      }
    >
      <GoogleCallbackPageComponent />
    </Suspense>
  );
}
