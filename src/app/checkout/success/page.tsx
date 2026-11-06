import React from "react";
import PaymentSuccessScreen from "../../features/orders/ui/payment-success-screen";

export const metadata = {
  title: "¡Pago Realizado con Éxito! | queplaneshoy",
  description: "Confirmación de compra oficial y pase digital con código QR para Afterlife Madrid.",
};

export default function CheckoutSuccessPage() {
  return <PaymentSuccessScreen />;
}
