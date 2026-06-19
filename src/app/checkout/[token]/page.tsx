import React from 'react';
import CheckoutPageComponent from '../../features/orders/ui/checkout-page';

export const metadata = {
  title: 'Completar Compra | queplaneshoy',
  description: 'Revisa tu orden de compra y realiza tu pago de forma segura.',
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <CheckoutPageComponent orderToken={token} />;
}
