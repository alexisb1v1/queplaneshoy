"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface TicketPrintScreenProps {
  orderNumber?: string;
  orderRef?: string;
  eventName?: string;
  eventSubtitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventAddress?: string;
  tierName?: string;
  tierZone?: string;
  ticketCount?: number;
  unitPrice?: number;
  totalAmount?: number;
  holderName?: string;
  holderDni?: string;
  onBack?: () => void;
  backLabel?: string;
  backHref?: string;
}

export default function TicketPrintScreen({
  orderNumber = "QPH-849204",
  orderRef = "B-89214022",
  eventName = "Afterlife Madrid: Global Tour 2024",
  eventSubtitle = "Tale of Us presents Afterlife · Visual Live Immersive Experience",
  eventDate = "Sábado, 15 Junio 2024",
  eventTime = "21:00h",
  eventVenue = "Caja Mágica, Madrid",
  eventAddress = "Cmo. de Perales, 23, 28041 Madrid",
  tierName = "PLATINUM VIP",
  tierZone = "FRONT STAGE VIP",
  ticketCount = 2,
  unitPrice = 120,
  totalAmount = 277.2,
  holderName = "CARLOS MENDOZA SILVA",
  holderDni = "***4921X",
  onBack,
  backLabel,
  backHref,
}: TicketPrintScreenProps) {
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [walletSaved, setWalletSaved] = useState<boolean>(false);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.1, 1.25));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.1, 0.75));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWalletSave = () => {
    setWalletSaved(true);
    alert("Enviando pases compatibles con Apple Wallet / Google Wallet a tu dispositivo móvil.");
  };

  // Desglose de precios
  const gastosGestion = 6.0;
  const iva = 12.6;
  const precioUnitarioTotal = unitPrice + gastosGestion + iva;

  return (
    <div className="bg-[#f7f9fb] font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* =========================================================================
          ESTILOS DE IMPRESIÓN COMPACTOS Y ARMONIOSOS (1 TICKET POR HOJA A4)
         ========================================================================= */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          header, aside, .qph-no-print {
            display: none !important;
          }
          body, main {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          /* Cada ticket es una hoja física A4 independiente, compacta y sin espacios gigantes */
          .qph-ticket-sheet {
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            border: none !important;
            padding: 4mm 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            gap: 14px !important;
          }
          .qph-ticket-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          /* Forzar disposición apaisada horizontal para el ticket en impresión */
          .qph-ticket-card {
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .qph-ticket-stub {
            width: 210px !important;
            flex-shrink: 0 !important;
            border-left: 1px solid #e0e3e5 !important;
            border-top: none !important;
            padding: 10px !important;
          }
          .qph-ticket-cut-divider {
            display: flex !important;
            flex-direction: column !important;
            padding: 10px 0 !important;
            margin: 0 !important;
          }
          .qph-ticket-cut-line {
            width: 2px !important;
            height: 100% !important;
            border-left: 2px dashed #c7c4d7 !important;
            border-top: none !important;
          }
        }
      `}</style>

      {/* =========================================================================
          1. HEADER FIJO SUPERIOR (PANTALLA)
         ========================================================================= */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-surface-variant shadow-xs print:hidden">
        <div className="h-16 max-w-container-max mx-auto px-4 sm:px-8 flex items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-deep-slate font-label-bold text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span>{backLabel || "Volver"}</span>
            </button>
          ) : (
            <Link
              href={backHref || "/checkout/success"}
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-deep-slate font-label-bold text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span>{backLabel || "Volver"}</span>
            </Link>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-gray hover:bg-surface-container text-deep-slate font-label-bold text-xs border border-surface-variant transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Imprimir</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-indigo hover:bg-primary text-white font-label-bold text-xs shadow-md shadow-electric-indigo/25 transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. ASIDE SUB-HEADER: CONTROLES DEL DOCUMENTO Y VISOR (PANTALLA)
         ========================================================================= */}
      <aside
        aria-label="Controles del documento"
        className="print:hidden sticky top-16 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3 border-b border-surface-variant shadow-xs transition-all"
      >
        <div className="max-w-container-max mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Título y Metadatos de la Orden */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-center shrink-0 text-electric-indigo">
              <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline-md font-bold text-sm sm:text-base text-deep-slate truncate">
                  Comprobante &amp; Entradas Oficiales #{orderNumber}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-label-bold uppercase bg-vip-gold/15 text-vip-gold border border-vip-gold/30">
                  {ticketCount}x {tierName}
                </span>
              </div>
              <p className="font-body-md text-xs text-on-surface-variant truncate">
                {eventName} • Total: €{totalAmount.toFixed(2)} • 1 ticket por hoja
              </p>
            </div>
          </div>

          {/* Herramientas de Lienzo y Acciones Rápidas */}
          <div className="flex items-center gap-3">
            {/* Controles de Zoom */}
            <div className="hidden md:flex items-center bg-surface-gray rounded-xl p-1 gap-1 text-deep-slate border border-surface-variant">
              <button
                onClick={handleZoomOut}
                aria-label="Reducir zoom"
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="font-label-bold text-xs px-2 select-none min-w-[50px] text-center font-bold">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                aria-label="Aumentar zoom"
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <div className="w-[1px] h-4 bg-surface-variant mx-1" />
              <span className="font-label-bold text-xs px-2 text-on-surface-variant select-none">
                {ticketCount} {ticketCount === 1 ? "Hoja" : "Hojas"} (1x hoja)
              </span>
            </div>

            {/* Guardar en Wallet */}
            <button
              onClick={handleWalletSave}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-gray hover:bg-surface-container text-deep-slate font-label-bold text-xs border border-surface-variant transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                account_balance_wallet
              </span>
              <span>{walletSaved ? "✓ Guardado en Wallet" : "Guardar en Wallet"}</span>
            </button>

            {/* Imprimir Primario */}
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-indigo text-white hover:bg-primary font-label-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Imprimir ({ticketCount} {ticketCount === 1 ? "hoja" : "hojas"})</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          3. LIENZO A4 VIRTUAL: COMPACTO, EQUILIBRADO Y SIN ESPACIOS ENORMES
         ========================================================================= */}
      <main className="w-full pt-6 pb-20 bg-[#f7f9fb] min-h-screen flex flex-col items-center gap-8 overflow-x-auto print:p-0 print:m-0 print:bg-white print:gap-0">
        {Array.from({ length: Math.max(ticketCount, 1) }).map((_, index) => {
          const ticketNum = index + 1;
          const isHolder = index === 0;
          const ticketAttendee = isHolder ? holderName : "INVITADO / ACOMPAÑANTE";
          const ticketDni = isHolder ? `DNI/NIE: ${holderDni}` : "DNI/Identificación solicitada en acceso";
          const ticketId = `QPH-AL-${ticketNum.toString().padStart(2, "0")}-9824${index}`;
          const shaHash = index === 0 ? "8f9a2e61...c421e90b" : "3d7c9a44...f822a101";

          return (
            <div
              key={ticketNum}
              style={{ transform: `scale(${zoomScale})` }}
              className="qph-ticket-sheet w-full max-w-[850px] bg-white text-on-surface rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] p-6 sm:p-8 flex flex-col gap-4 sm:gap-5 transition-transform origin-top border border-surface-variant print:shadow-none print:p-0 print:border-none print:rounded-none"
            >
              {/* Etiqueta visual de número de hoja solo en pantalla */}
              <div className="print:hidden flex items-center justify-between pb-1 border-b border-surface-variant/40 text-xs text-on-surface-variant">
                <span className="font-bold text-deep-slate flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-electric-indigo" />
                  Hoja {ticketNum} de {ticketCount} • Entrada Individual
                </span>
                <span className="font-mono text-[11px] bg-surface-gray px-2 py-0.5 rounded border border-surface-variant">
                  {ticketId}
                </span>
              </div>

              {/* -------------------------------------------------------------
                  A. HEADER INSTITUCIONAL DEL DOCUMENTO A4
                 ------------------------------------------------------------- */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-surface-variant">
                <div className="flex items-center gap-3">
                  <img
                    alt="queplaneshoy logo"
                    className="w-11 h-11 rounded-xl shadow-xs object-contain border border-surface-variant/40 p-1 bg-white"
                    src="/logo-qph.svg"
                  />
                  <div className="flex flex-col">
                    <span className="font-headline-md text-xl font-black tracking-tight text-deep-slate leading-tight">
                      queplanes<span className="text-electric-indigo">hoy</span>
                    </span>
                    <span className="font-label-bold text-[10px] uppercase tracking-wider text-electric-indigo font-bold">
                      Ticketing Oficial · Pase de Acceso Válido
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-left sm:text-right text-xs text-on-surface-variant">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-gray text-deep-slate font-label-bold text-[10px] mb-1 border border-surface-variant">
                    <span
                      className="material-symbols-outlined text-electric-indigo text-[13px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified_user
                    </span>
                    <span className="font-bold">VERIFICADO · QPH PASS v4.8</span>
                  </div>
                  <p className="text-[11px]">
                    <strong className="font-label-bold text-deep-slate">Pedido:</strong> #{orderNumber} · Ref: {orderRef}
                  </p>
                  <p className="text-[11px]">
                    <strong className="font-label-bold text-deep-slate">Emisión:</strong> 15 de Junio de 2024 · 14:22 CET
                  </p>
                </div>
              </div>

              {/* -------------------------------------------------------------
                  B. BANNER DE SEGURIDAD
                 ------------------------------------------------------------- */}
              <div className="bg-surface-gray rounded-xl p-2.5 sm:px-4 flex items-center justify-between gap-3 border border-surface-variant">
                <div className="flex items-center gap-2 text-deep-slate">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                    qr_code_scanner
                  </span>
                  <span className="font-label-bold text-[11px] sm:text-xs font-semibold">
                    Pase digital oficial nominal. Muestre el código QR directamente en los tornos de acceso.
                  </span>
                </div>
                <span className="hidden md:inline-block font-label-bold text-[9px] uppercase tracking-widest text-on-surface-variant bg-white px-2 py-0.5 rounded border border-surface-variant font-bold">
                  ENTRADA {ticketNum}/{ticketCount}
                </span>
              </div>

              {/* -------------------------------------------------------------
                  C. TARJETA DE ENTRADA (COMPACTA Y PROPORCIONADA)
                 ------------------------------------------------------------- */}
              <section
                aria-label={`Entrada ${ticketNum}`}
                className="qph-ticket-card relative bg-white rounded-2xl shadow-xs border border-surface-variant overflow-hidden flex flex-col sm:flex-row hover:shadow-sm transition-all"
              >
                {/* Franja Lateral Dorada VIP */}
                <div className="w-full sm:w-3.5 bg-vip-gold h-2 sm:h-auto shrink-0" />

                {/* Área de Datos de la Entrada */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3.5">
                  {/* Fila Superior: Categoría y Puerta */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-vip-gold text-white font-label-bold text-[10px] tracking-wide uppercase shadow-xs font-bold">
                          {tierName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-gray text-deep-slate font-label-bold text-[10px] border border-surface-variant font-bold">
                          ENTRADA {ticketNum} DE {ticketCount}
                        </span>
                      </div>
                      <span className="font-label-bold text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Puerta C · Acceso Preferente
                      </span>
                    </div>

                    <h2 className="font-headline-md text-lg sm:text-xl text-deep-slate font-bold tracking-tight leading-tight">
                      {eventName}
                    </h2>
                    <p className="font-body-md text-on-surface-variant text-xs mt-0.5 line-clamp-1">
                      {eventSubtitle}
                    </p>
                  </div>

                  {/* Bento Grid con 4 celdas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-surface-gray/70 p-3 rounded-xl border border-surface-variant">
                    {/* Asistente */}
                    <div>
                      <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                        {isHolder ? "Asistente Nominal" : "Asistente"}
                      </span>
                      <span className="font-headline-md text-xs sm:text-sm font-bold text-deep-slate uppercase block truncate">
                        {ticketAttendee}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant truncate">
                        {ticketDni}
                      </span>
                    </div>

                    {/* Zona & Beneficios */}
                    <div>
                      <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                        Zona &amp; Beneficios
                      </span>
                      <span className="font-headline-md text-xs sm:text-sm font-bold text-vip-gold block truncate">
                        {tierZone}
                      </span>
                      <span className="block text-[11px] text-on-surface-variant leading-tight truncate">
                        Barra Libre · Pulsera VIP
                      </span>
                    </div>

                    {/* Fecha y Horarios */}
                    <div>
                      <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                        Fecha y Horarios
                      </span>
                      <div className="flex items-center gap-1.5 text-deep-slate font-label-bold text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px] text-electric-indigo">calendar_today</span>
                        <span>{eventDate}</span>
                      </div>
                      <span className="block text-[11px] text-on-surface-variant">
                        Apertura: 19:30h · Inicio: {eventTime}
                      </span>
                    </div>

                    {/* Recinto & Dirección */}
                    <div>
                      <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                        Recinto &amp; Dirección
                      </span>
                      <div className="flex items-center gap-1.5 text-deep-slate font-label-bold text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px] text-electric-indigo">location_on</span>
                        <span>{eventVenue}</span>
                      </div>
                      <span className="block text-[11px] text-on-surface-variant truncate">
                        {eventAddress}
                      </span>
                    </div>
                  </div>

                  {/* Desglose de Precio */}
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-surface-variant">
                    <span>
                      Base: €{unitPrice.toFixed(2)} + Gastos: €{gastosGestion.toFixed(2)} + IVA: €{iva.toFixed(2)}
                    </span>
                    <span className="font-headline-md text-xs text-deep-slate font-bold">
                      Total: <strong className="text-electric-indigo font-extrabold text-sm">€{precioUnitarioTotal.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {/* Divisor Perforado con Muescas */}
                <div className="qph-ticket-cut-divider relative flex sm:flex-col items-center justify-between px-3 sm:px-0 sm:py-3">
                  <div className="w-5 h-5 rounded-full bg-[#f7f9fb] border border-surface-variant -mt-2.5 sm:mt-0 sm:-mr-3 z-10 print:hidden" />
                  <div className="qph-ticket-cut-line w-full sm:w-[2px] h-[2px] sm:h-full border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-surface-variant/80 my-1.5 sm:my-0" />
                  <div className="w-5 h-5 rounded-full bg-[#f7f9fb] border border-surface-variant -mb-2.5 sm:mb-0 sm:-mr-3 z-10 print:hidden" />
                </div>

                {/* Talonario QR / Stub */}
                <div className="qph-ticket-stub w-full sm:w-56 bg-surface-gray/50 p-4 flex flex-col items-center justify-center text-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-surface-variant">
                  <span className="font-label-bold text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
                    E-Ticket Seguro
                  </span>

                  {/* QR Vectorial Nítido */}
                  <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-xs border border-surface-variant flex items-center justify-center">
                    <svg className="w-full h-full text-deep-slate" fill="currentColor" viewBox="0 0 100 100">
                      <rect height="26" rx="3" width="26" x="5" y="5" />
                      <rect fill="white" height="18" width="18" x="9" y="9" />
                      <rect height="10" width="10" x="13" y="13" />

                      <rect height="26" rx="3" width="26" x="69" y="5" />
                      <rect fill="white" height="18" width="18" x="73" y="9" />
                      <rect height="10" width="10" x="77" y="13" />

                      <rect height="26" rx="3" width="26" x="5" y="69" />
                      <rect fill="white" height="18" width="18" x="9" y="73" />
                      <rect height="10" width="10" x="13" y="77" />

                      {index === 0 ? (
                        <>
                          <rect height="8" width="8" x="36" y="8" />
                          <rect height="6" width="6" x="48" y="14" />
                          <rect height="6" width="6" x="38" y="24" />
                          <rect height="8" width="8" x="56" y="22" />
                          <rect height="6" width="6" x="14" y="38" />
                          <rect height="8" width="8" x="24" y="44" />
                          <rect height="10" width="10" x="36" y="36" />
                          <rect height="12" width="6" x="52" y="36" />
                          <rect height="6" width="10" x="64" y="42" />
                          <rect height="6" width="12" x="80" y="36" />
                          <rect height="6" width="12" x="40" y="52" />
                          <rect height="8" width="8" x="58" y="54" />
                          <rect height="14" width="6" x="72" y="56" />
                          <rect height="14" width="6" x="86" y="48" />
                          <rect height="6" width="10" x="36" y="66" />
                          <rect height="12" width="6" x="50" y="68" />
                          <rect height="8" width="10" x="62" y="76" />
                          <rect height="12" width="12" x="80" y="76" />
                          <rect height="8" width="8" x="42" y="82" />
                        </>
                      ) : (
                        <>
                          <rect height="6" width="12" x="38" y="10" />
                          <rect height="8" width="8" x="54" y="10" />
                          <rect height="10" width="6" x="36" y="20" />
                          <rect height="6" width="14" x="46" y="24" />
                          <rect height="6" width="8" x="10" y="38" />
                          <rect height="12" width="6" x="22" y="40" />
                          <rect height="8" width="8" x="38" y="38" />
                          <rect height="6" width="14" x="50" y="42" />
                          <rect height="8" width="6" x="70" y="38" />
                          <rect height="10" width="10" x="82" y="40" />
                          <rect height="8" width="10" x="36" y="52" />
                          <rect height="6" width="12" x="52" y="54" />
                          <rect height="8" width="8" x="68" y="52" />
                          <rect height="6" width="12" x="80" y="56" />
                          <rect height="10" width="8" x="40" y="68" />
                          <rect height="6" width="10" x="54" y="66" />
                          <rect height="8" width="14" x="68" y="68" />
                          <rect height="6" width="12" x="38" y="82" />
                          <rect height="10" width="6" x="54" y="80" />
                          <rect height="8" width="10" x="66" y="82" />
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-mono font-bold text-[10px] text-deep-slate tracking-tight">
                      TICKET-ID: {ticketId}
                    </span>
                    <span className="font-mono text-[8px] text-on-surface-variant truncate max-w-[150px]">
                      SHA256: {shaHash}
                    </span>
                  </div>

                  {/* Código de barras */}
                  <div className="w-full flex justify-center items-center gap-[2px] h-4 px-2 opacity-80 overflow-hidden">
                    <span className="w-[3px] h-full bg-deep-slate" />
                    <span className="w-[1px] h-full bg-deep-slate" />
                    <span className="w-[4px] h-full bg-deep-slate" />
                    <span className="w-[2px] h-full bg-deep-slate" />
                    <span className="w-[1px] h-full bg-deep-slate" />
                    <span className="w-[3px] h-full bg-deep-slate" />
                    <span className="w-[5px] h-full bg-deep-slate" />
                    <span className="w-[1px] h-full bg-deep-slate" />
                    <span className="w-[2px] h-full bg-deep-slate" />
                    <span className="w-[4px] h-full bg-deep-slate" />
                    <span className="w-[2px] h-full bg-deep-slate" />
                    <span className="w-[1px] h-full bg-deep-slate" />
                    <span className="w-[3px] h-full bg-deep-slate" />
                    <span className="w-[5px] h-full bg-deep-slate" />
                    <span className="w-[2px] h-full bg-deep-slate" />
                  </div>

                  <p className="text-[8px] text-on-surface-variant text-center leading-tight">
                    Acceso nominal 1 persona
                  </p>
                </div>
              </section>

              {/* -------------------------------------------------------------
                  D. INSTRUCCIONES DE ACCESO RÁPIDO (EQUILIBRIO VISUAL)
                 ------------------------------------------------------------- */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">schedule</span>
                  <div className="min-w-0">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Horario</span>
                    <span className="text-[10px] font-bold text-deep-slate truncate block">Puertas: 19:30h</span>
                  </div>
                </div>

                <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">badge</span>
                  <div className="min-w-0">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Identidad</span>
                    <span className="text-[10px] font-bold text-deep-slate truncate block">DNI requerido</span>
                  </div>
                </div>

                <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">directions_subway</span>
                  <div className="min-w-0">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Transporte</span>
                    <span className="text-[10px] font-bold text-deep-slate truncate block">Metro L3 / Bus C1</span>
                  </div>
                </div>

                <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">verified</span>
                  <div className="min-w-0">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">Tornos QR</span>
                    <span className="text-[10px] font-bold text-deep-slate truncate block">Pase directo</span>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------
                  E. CONDICIONES Y NORMATIVA OFICIAL DE ACCESO AL PIE DE LA HOJA
                 ------------------------------------------------------------- */}
              <footer className="bg-surface-gray/60 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 text-xs text-on-surface-variant border border-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[15px]">gavel</span>
                  <span className="font-label-bold text-deep-slate uppercase tracking-wider text-[10px] font-bold">
                    Condiciones de Uso y Normativa Oficial de Acceso
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 font-body-md text-[9.5px] leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-label-bold text-deep-slate shrink-0 font-bold">1.</span>
                    <p>
                      <strong className="font-label-bold text-deep-slate">Control de Identidad:</strong> Presentar
                      DNI, NIE o Pasaporte original en vigor coincidente con los datos nominales de la entrada.
                    </p>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <span className="font-label-bold text-deep-slate shrink-0 font-bold">2.</span>
                    <p>
                      <strong className="font-label-bold text-deep-slate">Validez del Código:</strong> Cada
                      QR permite un único acceso. Prohibida su duplicación o reventa no autorizada.
                    </p>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <span className="font-label-bold text-deep-slate shrink-0 font-bold">3.</span>
                    <p>
                      <strong className="font-label-bold text-deep-slate">Experiencia VIP &amp; Pulsera:</strong>{" "}
                      Entrega exclusiva en el stand de bienvenida VIP (Puerta C) presentando este comprobante.
                    </p>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <span className="font-label-bold text-deep-slate shrink-0 font-bold">4.</span>
                    <p>
                      <strong className="font-label-bold text-deep-slate">Soporte y Asistencia:</strong> En
                      caso de incidencia técnica, contacte a soporte@queplaneshoy.com o taquilla oficial con ref #{orderNumber}.
                    </p>
                  </div>
                </div>

                {/* Sello de Seguridad Criptográfico */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-variant px-2.5 py-1 bg-white rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-electric-indigo text-[14px]">verified</span>
                    <span className="font-label-bold text-[9.5px] text-deep-slate font-bold">
                      Documento Digital Firmado Criptográficamente · QPH PASS ENGINE 2024
                    </span>
                  </div>
                  <div className="font-mono text-[8.5px] text-on-surface-variant font-semibold">
                    DOC-HASH: 9948-2810-MAD-AL-LIVE · HOJA {ticketNum}/{ticketCount}
                  </div>
                </div>
              </footer>
            </div>
          );
        })}
      </main>
    </div>
  );
}
