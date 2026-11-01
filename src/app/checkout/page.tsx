import React from "react";
import PurchaseFlowPageComponent from "../features/orders/ui/purchase-flow-page";

export const metadata = {
  title: "Selección de Entradas y Pasarela de Pagos | queplaneshoy",
  description: "Selecciona tus entradas, zona en el mapa y completa tu pago seguro con tecnología certificada.",
};

export default function CheckoutPage() {
  return <PurchaseFlowPageComponent />;
}
