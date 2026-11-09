import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPasswordPage from '@/app/features/auth/ui/reset-password-page';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña | queplaneshoy',
  description: 'Configura una nueva contraseña segura para tu cuenta en queplaneshoy.',
};

export default function ResetPasswordRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordPage />
    </Suspense>
  );
}

