"use client";

import React, { useEffect, useState, useRef } from "react";

interface IzipayEmbeddedFormProps {
  formToken: string | null;
  publicKey: string;
  clientEndpoint?: string;
  isLoadingToken: boolean;
  onPaymentSuccess: (clientAnswer?: any) => void;
  onPaymentError?: (errorMessage: string) => void;
}

export default function IzipayEmbeddedForm({
  formToken,
  publicKey,
  clientEndpoint = "https://api.micuentaweb.pe",
  isLoadingToken,
  onPaymentSuccess,
  onPaymentError,
}: IzipayEmbeddedFormProps) {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const initializedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Inyectar hoja de estilos de reseteo clásico de Krypton
    const cssId = "izipay-krypton-theme-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href =
        "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css";
      document.head.appendChild(link);
    }

    // 2. Inyectar script oficial del cliente Krypton
    const scriptId = "izipay-krypton-client-script";
    const themeJsId = "izipay-krypton-theme-js";

    const setupKrypton = () => {
      setIsScriptReady(true);
      if (typeof window !== "undefined" && (window as any).KR) {
        const KR = (window as any).KR;

        // Registrar manejador de respuesta de pago
        KR.onSubmit((response: any) => {
          if (response.clientAnswer?.orderStatus === "PAID") {
            onPaymentSuccess(response.clientAnswer);
          } else {
            const msg =
              response.clientAnswer?.errorMessage ||
              "La transacción no pudo ser autorizada por el banco emisor.";
            if (onPaymentError) onPaymentError(msg);
          }
          return false; // Prevenir redirección automática en Next.js SPA
        });

        KR.onError((err: any) => {
          const msg = err.errorMessage || "Error al procesar los datos de la tarjeta.";
          if (onPaymentError) onPaymentError(msg);
        });
      }
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
      script.setAttribute("kr-public-key", publicKey);
      script.setAttribute("kr-post-url-success", "");
      if (clientEndpoint) {
        script.setAttribute("kr-client-endpoint", clientEndpoint);
      }

      // Script del tema clásico
      if (!document.getElementById(themeJsId)) {
        const themeScript = document.createElement("script");
        themeScript.id = themeJsId;
        themeScript.src =
          "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.js";
        document.body.appendChild(themeScript);
      }

      script.onload = setupKrypton;
      document.body.appendChild(script);
    } else {
      setupKrypton();
    }
  }, [publicKey, clientEndpoint, onPaymentSuccess, onPaymentError]);

  // 3. Vincular formToken cuando esté disponible y listo en el DOM
  useEffect(() => {
    if (!formToken || !isScriptReady || typeof window === "undefined") return;

    if (initializedTokenRef.current === formToken) return;

    const KR = (window as any).KR;
    if (KR && typeof KR.setFormToken === "function") {
      KR.setFormToken(formToken);
      initializedTokenRef.current = formToken;
    }
  }, [formToken, isScriptReady]);

  return (
    <div className="bg-slate-50/70 border border-surface-variant/80 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-200">
      {/* Cabecera del formulario incrustado */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-variant/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-electric-indigo/10 text-electric-indigo flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">credit_card</span>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-deep-slate">
              Datos de Tarjeta Oficial Izipay
            </h4>
            <span className="text-[11px] text-on-surface-variant block">
              Procesamiento bancario seguro con cifrado TLS 256 bits
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-90">
          <span className="px-1.5 py-0.5 bg-white border border-surface-variant rounded text-[10px] font-bold text-deep-slate shadow-xs">
            VISA
          </span>
          <span className="px-1.5 py-0.5 bg-white border border-surface-variant rounded text-[10px] font-bold text-deep-slate shadow-xs">
            MC
          </span>
          <span className="px-1.5 py-0.5 bg-white border border-surface-variant rounded text-[10px] font-bold text-deep-slate shadow-xs">
            AMEX
          </span>
        </div>
      </div>

      {/* Contenedor Incrustado de Krypton */}
      {isLoadingToken ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-on-surface-variant">
          <div className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Generando sesión de pago segura con Izipay...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Formulario Incrustado (Embedded) de Izipay */}
          <div className="kr-embedded space-y-3">
            {/* Campo Número de Tarjeta */}
            <div>
              <label className="block text-[11px] font-bold text-deep-slate mb-1">
                Número de Tarjeta
              </label>
              <div className="kr-pan bg-white rounded-xl border border-surface-variant p-2 shadow-xs min-h-[46px] flex items-center"></div>
            </div>

            {/* Fila: Expiración y CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-deep-slate mb-1">
                  Expiración (MM/AA)
                </label>
                <div className="kr-expiry bg-white rounded-xl border border-surface-variant p-2 shadow-xs min-h-[46px] flex items-center"></div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-deep-slate mb-1">
                  Código CVV
                </label>
                <div className="kr-security-code bg-white rounded-xl border border-surface-variant p-2 shadow-xs min-h-[46px] flex items-center"></div>
              </div>
            </div>

            {/* Mensajes de error bancario de Krypton */}
            <div className="kr-form-error text-xs text-rose-600 font-semibold pt-1"></div>

            {/* Botón oculto que Krypton utiliza internamente */}
            <button type="button" className="kr-payment-button hidden"></button>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">
              verified_user
            </span>
            <span>
              Certificado PCI DSS Nivel 1. Los datos de tu tarjeta nunca se almacenan en nuestros servidores.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

