"use client";

import React, { useEffect, useState, useRef } from "react";

interface IzipayPopinModalProps {
  isOpen: boolean;
  onClose: () => void;
  formToken: string;
  publicKey: string;
  clientEndpoint?: string;
  orderCode: string;
  totalAmount: number;
  paymentMethodText?: string;
  onPaymentSuccess: (krAnswer?: any) => void;
}

export default function IzipayPopinModal({
  isOpen,
  onClose,
  formToken,
  publicKey,
  clientEndpoint = "https://api.micuentaweb.pe",
  orderCode,
  totalAmount,
  paymentMethodText = "Tarjeta de Crédito / Débito",
  onPaymentSuccess,
}: IzipayPopinModalProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isDemoToken = formToken.startsWith("DEMO-TOKEN-") || publicKey.includes("placeholder");

  useEffect(() => {
    if (!isOpen || !formToken) return;

    // Si es un token simulado de desarrollo (placeholder), no inyectamos el script externo de Izipay para evitar errores de red 401
    if (isDemoToken) {
      setIsScriptLoaded(true);
      return;
    }

    // Inyección dinámica del script y estilos de Krypton de Izipay
    const scriptId = "izipay-krypton-client-script";
    const themeCssId = "izipay-krypton-theme-css";
    const themeJsId = "izipay-krypton-theme-js";

    // 1. Estilos del tema de Krypton
    if (!document.getElementById(themeCssId)) {
      const link = document.createElement("link");
      link.id = themeCssId;
      link.rel = "stylesheet";
      link.href = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css";
      document.head.appendChild(link);
    }

    const setupKrypton = () => {
      setIsScriptLoaded(true);
      if (typeof window !== "undefined" && (window as any).KR) {
        const KR = (window as any).KR;
        KR.setFormToken(formToken);
        KR.onSubmit((response: any) => {
          if (response.clientAnswer?.orderStatus === "PAID") {
            onPaymentSuccess(response.clientAnswer);
          }
          return false; // Prevenir redirección automática
        });
      }
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
      script.setAttribute("kr-public-key", publicKey);
      script.setAttribute("kr-post-url-success", "");
      if (clientEndpoint) {
        script.setAttribute("kr-client-endpoint", clientEndpoint);
      }

      // Cargar script del tema
      if (!document.getElementById(themeJsId)) {
        const themeScript = document.createElement("script");
        themeScript.id = themeJsId;
        themeScript.src = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js";
        document.body.appendChild(themeScript);
      }

      script.onload = setupKrypton;
      document.body.appendChild(script);
    } else {
      setupKrypton();
    }
  }, [isOpen, formToken, publicKey, clientEndpoint, isDemoToken, onPaymentSuccess]);

  if (!isOpen) return null;

  const handleSimulateSuccessfulPayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onPaymentSuccess({
        orderStatus: "PAID",
        orderId: orderCode,
        simulated: true,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-surface-variant space-y-6 relative overflow-hidden">
        
        {/* Cabecera del Pop-in */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">lock</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-electric-indigo uppercase tracking-wider">
                  Pasarela Segura
                </span>
                <span className="inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Izipay Oficial
                </span>
              </div>
              <h3 className="text-base font-bold text-deep-slate">
                Pago de Entradas {orderCode}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-gray text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar ventana de pago"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Resumen del Monto a Pagar */}
        <div className="p-4 bg-surface-container-low rounded-2xl border border-surface-variant flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-on-surface-variant block">
              Método seleccionado
            </span>
            <span className="text-sm font-bold text-deep-slate">
              {paymentMethodText}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-on-surface-variant block">
              Total a Pagar
            </span>
            <span className="text-xl font-black text-electric-indigo">
              S/. {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Contenedor Izipay Pop-in (Real o Dev Mode) */}
        {isDemoToken ? (
          <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5">
                info
              </span>
              <div className="space-y-1 text-xs text-amber-900">
                <p className="font-bold">
                  Modo de Pruebas (Credenciales Placeholder)
                </p>
                <p className="leading-relaxed">
                  Has iniciado el popup de Izipay con las credenciales de prueba por defecto. Para ver el formulario bancario en vivo de Izipay, ingresa tu <span className="font-mono font-bold">IZIPAY_PUBLIC_KEY</span> e <span className="font-mono font-bold">IZIPAY_PRIVATE_KEY</span> en el archivo <span className="font-mono font-bold">.env</span>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateSuccessfulPayment}
              disabled={isSimulating}
              className="w-full py-3.5 px-4 bg-electric-indigo hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-electric-indigo/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando pago con Izipay...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Simular Pago Aprobado en Izipay</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div ref={containerRef} className="space-y-3 min-h-[220px] flex flex-col justify-center">
            {/* Contenedor de formulario de Krypton Izipay incrustado en el modal */}
            <div className="kr-embedded">
              <div className="kr-pan"></div>
              <div className="kr-expiry"></div>
              <div className="kr-security-code"></div>
              <button className="kr-payment-button"></button>
              <div className="kr-form-error"></div>
            </div>

            {!isScriptLoaded && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-on-surface-variant text-xs">
                <div className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
                <span>Cargando pasarela oficial de Izipay...</span>
              </div>
            )}
          </div>
        )}

        {/* Sellos de Seguridad en el Pie */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-on-surface-variant border-t border-surface-variant">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
            <span>Certificado PCI DSS</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-electric-indigo">lock</span>
            <span>Cifrado TLS 256 bits</span>
          </div>
        </div>

      </div>
    </div>
  );
}

