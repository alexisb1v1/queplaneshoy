import React, { Suspense } from "react";
import PurchaseFlowPageComponent from "../features/orders/ui/purchase-flow-page";

export const metadata = {
  title: "Selección de Entradas y Pasarela de Pagos | queplaneshoy",
  description: "Selecciona tus entradas, zona en el mapa y completa tu pago seguro con tecnología certificada.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-surface-variant flex items-center justify-center mb-4 animate-pulse">
            <img
              src="/logo-qph.svg"
              alt="queplaneshoy logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-bold text-deep-slate">Cargando taquilla oficial...</p>
        </div>
      }
    >
      <PurchaseFlowPageComponent />
    </Suspense>
  );
}
