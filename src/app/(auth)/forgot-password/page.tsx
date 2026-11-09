import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ForgotPasswordPage from '@/app/features/auth/ui/forgot-password-page';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña | queplaneshoy',
  description: 'Solicita un enlace seguro para restablecer la contraseña de tu cuenta en queplaneshoy.',
};

export default function ForgotPasswordRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}

