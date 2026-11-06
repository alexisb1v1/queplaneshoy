"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

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
  isDrawer?: boolean; // Modo modal / slide-over que ocupa todo el alto desde la derecha
  tickets?: Array<{
    ticketId: string;
    ticketUuid: string;
    ticketNumber: number;
    zoneName: string;
    tierName: string;
    unitPrice: number;
    qrPayload: string;
  }>;
}

export default function TicketPrintScreen({
  orderNumber = "QPH-849204",
  orderRef = "TX-OFICIAL",
  eventName = "Evento Oficial",
  eventSubtitle = "Entrada Oficial Garantizada · Qué Planes Hoy",
  eventDate = "Fecha Confirmada",
  eventTime = "Horario Oficial",
  eventVenue = "Recinto Oficial",
  eventAddress = "Ubicación Confirmada, Perú",
  tierName = "General",
  tierZone = "Zona General",
  ticketCount = 1,
  unitPrice = 50,
  totalAmount = 50,
  holderName = "Comprador Registrado",
  holderDni,
  onBack,
  backLabel,
  backHref,
  isDrawer = false,
  tickets = [],
}: TicketPrintScreenProps) {
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear el scroll del body, marcar clase en body y escuchar tecla Escape
  useEffect(() => {
    if (!isDrawer) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("qph-ticket-drawer-open");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onBack) {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("qph-ticket-drawer-open");
      document.body.classList.remove("qph-printing-ticket-active");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawer, onBack]);

  // Listener para restaurar estado tras terminar o cancelar el diálogo de impresión
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove("qph-printing-ticket-active");
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.1, 1.25));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.1, 0.75));
  };

  const handlePrint = () => {
    document.body.classList.add("qph-printing-ticket-active");
    // Pequeño timeout para permitir que el motor aplique las clases de aislamiento antes de imprimir
    setTimeout(() => {
      window.print();
    }, 20);
  };

  // Fecha de emisión dinámica en tiempo real
  const emissionDateStr = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  // Resolver lista de tickets reales
  const resolvedTickets =
    tickets && tickets.length > 0
      ? tickets
      : Array.from({ length: Math.max(ticketCount, 1) }).map((_, idx) => ({
          ticketId: String(idx + 1),
          ticketUuid: `tck-${orderNumber}-${idx + 1}`,
          ticketNumber: idx + 1,
          zoneName: tierZone,
          tierName: tierName,
          unitPrice: unitPrice,
          qrPayload: `QPH|ORD:${orderNumber}|TKT:${idx + 1}|TIME:${Date.now()}`,
        }));

  const totalSheets = resolvedTickets.length;

  // Estilos CSS de impresión A4 de alta precisión con aislamiento absoluto
  const printStyles = (
    <style>{`
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }

        /* 1. AISLAMIENTO ABSOLUTO: Ocultar todo el árbol de la aplicación fuera del visor cuando el Drawer está activo */
        body.qph-ticket-drawer-open > *:not(#qph-ticket-drawer-portal) {
          display: none !important;
        }

        /* 2. Ocultar elementos de UI no imprimibles */
        header, nav, footer, aside, .qph-no-print, .print\\:hidden, .qph-drawer-backdrop {
          display: none !important;
        }

        /* 3. Limpiar el canvas global de impresión */
        body, html {
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* 4. Convertir el contenedor del drawer en flujo estático */
        #qph-ticket-drawer-portal {
          display: block !important;
          position: static !important;
          inset: auto !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .qph-drawer-root,
        .qph-drawer-panel,
        .qph-drawer-body {
          display: block !important;
          position: static !important;
          inset: auto !important;
          transform: none !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          box-shadow: none !important;
          border: none !important;
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* 5. Configuración exacta de cada hoja A4 de ticket */
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
        }

        .qph-ticket-sheet:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }

        .qph-ticket-card {
          border: 1.5px solid #dcdbe5 !important;
          box-shadow: none !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          margin: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: row !important;
        }

        .qph-ticket-stub {
          width: 44mm !important;
          flex-shrink: 0 !important;
          border-left: 2px dashed #b9b7c8 !important;
          border-top: none !important;
          background: #fbfbfe !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 6px 3px !important;
        }

        .qph-ticket-cut-divider {
          display: flex !important;
          flex-direction: column !important;
          width: 0 !important;
          height: 100% !important;
          border-left: 2px dashed #c7c4d7 !important;
          border-top: none !important;
        }
      }
    `}</style>
  );

  // Renderizado individual de cada hoja de ticket oficial A4
  const renderTicketSheet = (
    ticket: {
      ticketId: string;
      ticketUuid: string;
      ticketNumber: number;
      zoneName: string;
      tierName: string;
      unitPrice: number;
      qrPayload: string;
    },
    index: number
  ) => {
    const ticketNum = ticket.ticketNumber || index + 1;
    const isHolder = index === 0;
    const ticketAttendee = isHolder
      ? holderName || "TITULAR REGISTRADO"
      : `INVITADO DE ${holderName || "COMPRADOR"}`;
    const ticketDniDisplay = isHolder
      ? holderDni
        ? `Identificación: ${holderDni}`
        : "Titular Registrado QPH"
      : "Presentar DNI del acompañante en acceso";
    const ticketDisplayId = ticket.ticketUuid
      ? `QPH-TCK-${ticket.ticketUuid.substring(0, 8).toUpperCase()}`
      : `QPH-TKT-${ticket.ticketId.padStart(6, "0")}`;
    const currentUnitPrice = ticket.unitPrice || unitPrice;

    return (
      <div
        key={ticket.ticketId || ticketNum}
        style={{ transform: `scale(${zoomScale})` }}
        className="qph-ticket-sheet w-full max-w-[850px] bg-white text-on-surface rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] p-6 sm:p-8 flex flex-col gap-4 sm:gap-5 transition-transform origin-top border border-surface-variant print:shadow-none print:p-0 print:border-none print:rounded-none"
      >
        {/* Etiqueta visual de número de hoja solo en pantalla */}
        <div className="print:hidden flex items-center justify-between pb-1 border-b border-surface-variant/40 text-xs text-on-surface-variant">
          <span className="font-bold text-deep-slate flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-electric-indigo" />
            Hoja {ticketNum} de {totalSheets} • Entrada Oficial
          </span>
          <span className="font-mono text-[11px] bg-surface-gray px-2 py-0.5 rounded border border-surface-variant">
            {ticketDisplayId}
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
                Boletería Oficial · Acceso Digital Garantizado
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
              <span className="font-bold">VERIFICADO · QPH PASS ED25519</span>
            </div>
            <p className="text-[11px]">
              <strong className="font-label-bold text-deep-slate">Pedido:</strong> #{orderNumber}{" "}
              {orderRef ? `· Ref: ${orderRef}` : ""}
            </p>
            <p className="text-[11px]">
              <strong className="font-label-bold text-deep-slate">Emisión:</strong> {emissionDateStr}
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
              Pase digital oficial e intransferible. Muestre el código QR directamente en los tornos o puertas de acceso.
            </span>
          </div>
          <span className="hidden md:inline-block font-label-bold text-[9px] uppercase tracking-widest text-on-surface-variant bg-white px-2 py-0.5 rounded border border-surface-variant font-bold">
            ENTRADA {ticketNum}/{totalSheets}
          </span>
        </div>

        {/* -------------------------------------------------------------
            C. TARJETA DE ENTRADA (CUPÓN RECORTABLE)
           ------------------------------------------------------------- */}
        <section
          aria-label={`Entrada ${ticketNum}`}
          className="qph-ticket-card relative bg-white rounded-2xl shadow-xs border border-surface-variant overflow-hidden flex flex-col sm:flex-row hover:shadow-sm transition-all"
        >
          {/* Franja Lateral */}
          <div className="w-full sm:w-3.5 bg-electric-indigo h-2 sm:h-auto shrink-0" />

          {/* Área de Datos de la Entrada */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4 min-w-0">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-electric-indigo text-white font-label-bold text-[10px] tracking-wide uppercase shadow-xs font-bold">
                    {(ticket.zoneName || ticket.tierName || tierName)
                      .toUpperCase()
                      .replace("DIVERCION", "DIVERSIÓN")}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-gray text-deep-slate font-label-bold text-[10px] border border-surface-variant font-bold">
                    ENTRADA {ticketNum} DE {totalSheets}
                  </span>
                </div>
                <span className="font-label-bold text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Control QR • Acceso Oficial
                </span>
              </div>

              <h2 className="font-headline-md text-xl sm:text-2xl text-deep-slate font-bold tracking-tight leading-tight">
                {eventName}
              </h2>
              <p className="font-body-md text-on-surface-variant text-xs mt-0.5 line-clamp-1">
                {eventSubtitle}
              </p>
            </div>

            {/* Bento Grid con 4 celdas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-surface-gray/70 p-4 rounded-xl border border-surface-variant">
              {/* Asistente */}
              <div>
                <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                  {isHolder ? "Titular Nominal" : "Acompañante"}
                </span>
                <span className="font-headline-md text-xs sm:text-sm font-bold text-deep-slate uppercase block leading-snug">
                  {ticketAttendee}
                </span>
                <span className="block text-[11px] text-on-surface-variant mt-0.5">
                  {ticketDniDisplay}
                </span>
              </div>

              {/* Zona & Beneficios */}
              <div>
                <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                  Zona &amp; Localidad
                </span>
                <span className="font-headline-md text-xs sm:text-sm font-bold text-electric-indigo block truncate">
                  {ticket.zoneName || tierZone}
                </span>
                <span className="block text-[11px] text-on-surface-variant leading-tight mt-0.5">
                  Acceso garantizado • Control digital
                </span>
              </div>

              {/* Fecha y Horarios */}
              <div>
                <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                  Fecha y Horario
                </span>
                <div className="flex items-center gap-1.5 text-deep-slate font-label-bold text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-electric-indigo">
                    calendar_today
                  </span>
                  <span>{eventDate}</span>
                </div>
                <span className="block text-[11px] text-on-surface-variant mt-0.5">
                  Función programada: {eventTime}
                </span>
              </div>

              {/* Recinto & Dirección */}
              <div>
                <span className="block font-label-bold text-[9px] uppercase text-on-surface-variant tracking-wider font-bold">
                  Recinto &amp; Dirección
                </span>
                <div className="flex items-center gap-1.5 text-deep-slate font-label-bold text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-electric-indigo">
                    location_on
                  </span>
                  <span className="truncate">{eventVenue}</span>
                </div>
                <span className="block text-[11px] text-on-surface-variant leading-snug mt-0.5">
                  {eventAddress}
                </span>
              </div>
            </div>

            {/* Desglose de Precio Oficial en Soles */}
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1 border-t border-surface-variant">
              <span>
                Precio Oficial: <strong>S/. {currentUnitPrice.toFixed(2)}</strong> (Servicio e impuestos incluidos)
              </span>
              <span className="font-headline-md text-xs text-deep-slate font-bold">
                Total Orden:{" "}
                <strong className="text-electric-indigo font-extrabold text-sm">
                  S/. {totalAmount.toFixed(2)}
                </strong>
              </span>
            </div>
          </div>

          {/* Divisor Perforado con Muescas */}
          <div className="qph-ticket-cut-divider relative flex sm:flex-col items-center justify-between px-3 sm:px-0 sm:py-3">
            <div className="w-5 h-5 rounded-full bg-[#f7f9fb] border border-surface-variant -mt-2.5 sm:mt-0 sm:-mr-3 z-10 print:hidden" />
            <div className="qph-ticket-cut-line w-full sm:w-[2px] h-[2px] sm:h-full border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-surface-variant/80 my-1.5 sm:my-0" />
            <div className="w-5 h-5 rounded-full bg-[#f7f9fb] border border-surface-variant -mb-2.5 sm:mb-0 sm:-mr-3 z-10 print:hidden" />
          </div>

          {/* Talonario QR / Stub Compacto */}
          <div className="qph-ticket-stub w-full sm:w-44 bg-surface-gray/50 py-3.5 px-2 flex flex-col items-center justify-center text-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-surface-variant">
            <span className="font-label-bold text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
              E-Ticket Seguro
            </span>

            {/* QR Vectorial Nítido con Logo QPH Central */}
            <div className="bg-white p-1 rounded-xl shadow-xs border border-surface-variant flex items-center justify-center">
              <QRCodeSVG
                value={
                  ticket.qrPayload ||
                  `QPH|ORD:${orderNumber}|TKT:${ticketDisplayId}|TIME:${Date.now()}`
                }
                size={128}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo-qph.svg",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <div className="flex flex-col items-center w-full px-1">
              <span className="font-mono font-bold text-[10px] text-deep-slate tracking-tight">
                {ticketDisplayId}
              </span>
              <span className="font-mono text-[8px] text-on-surface-variant truncate w-full">
                REF: #{orderNumber}
              </span>
            </div>

            {/* Código de barras decorativo */}
            <div className="w-full max-w-[130px] flex justify-center items-center gap-[2px] h-3.5 px-1 opacity-80 overflow-hidden">
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
            D. INSTRUCCIONES DE ACCESO RÁPIDO
           ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">
              schedule
            </span>
            <div className="min-w-0">
              <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">
                Horario
              </span>
              <span className="text-[10px] font-bold text-deep-slate truncate block">
                {eventTime}
              </span>
            </div>
          </div>

          <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">
              badge
            </span>
            <div className="min-w-0">
              <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">
                Identidad
              </span>
              <span className="text-[10px] font-bold text-deep-slate truncate block">
                DNI requerido
              </span>
            </div>
          </div>

          <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">
              pin_drop
            </span>
            <div className="min-w-0">
              <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">
                Recinto
              </span>
              <span className="text-[10px] font-bold text-deep-slate truncate block">
                {eventVenue}
              </span>
            </div>
          </div>

          <div className="bg-surface-gray/60 p-2 sm:p-2.5 rounded-xl border border-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">
              verified
            </span>
            <div className="min-w-0">
              <span className="block text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">
                Tornos QR
              </span>
              <span className="text-[10px] font-bold text-deep-slate truncate block">
                Pase directo
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            E. CONDICIONES Y NORMATIVA OFICIAL DE ACCESO AL PIE DE LA HOJA
           ------------------------------------------------------------- */}
        <footer className="bg-surface-gray/60 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 text-xs text-on-surface-variant border border-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[15px]">
              gavel
            </span>
            <span className="font-label-bold text-deep-slate uppercase tracking-wider text-[10px] font-bold">
              Condiciones de Uso y Normativa Oficial de Acceso
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 font-body-md text-[9.5px] leading-relaxed">
            <div className="flex items-start gap-1.5">
              <span className="font-label-bold text-deep-slate shrink-0 font-bold">1.</span>
              <p>
                <strong className="font-label-bold text-deep-slate">Control de Identidad:</strong> Presentar
                DNI, Carné de Extranjería o Pasaporte original en vigor coincidente con los datos del comprador.
              </p>
            </div>

            <div className="flex items-start gap-1.5">
              <span className="font-label-bold text-deep-slate shrink-0 font-bold">2.</span>
              <p>
                <strong className="font-label-bold text-deep-slate">Validez del Código:</strong> Cada
                código QR permite un único acceso en puerta. Prohibida su duplicación o reventa no autorizada.
              </p>
            </div>

            <div className="flex items-start gap-1.5">
              <span className="font-label-bold text-deep-slate shrink-0 font-bold">3.</span>
              <p>
                <strong className="font-label-bold text-deep-slate">Apertura y Puntualidad:</strong> Se
                recomienda llegar con antelación al inicio de la función para el control de seguridad.
              </p>
            </div>

            <div className="flex items-start gap-1.5">
              <span className="font-label-bold text-deep-slate shrink-0 font-bold">4.</span>
              <p>
                <strong className="font-label-bold text-deep-slate">Soporte y Reclamaciones:</strong> En
                caso de incidencias en torno de acceso, acuda a la boletería oficial del evento con su DNI.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  // Cabecera compartida (Barra de herramientas con Zoom, Cerrar e Imprimir)
  const renderHeader = (drawerMode: boolean) => (
    <header
      className={`${
        drawerMode
          ? "h-16 w-full shrink-0 bg-white/95 backdrop-blur-xl border-b border-surface-variant px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs print:hidden z-20"
          : "sticky top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-surface-variant shadow-xs print:hidden"
      }`}
    >
      <div
        className={`${
          drawerMode
            ? "w-full flex items-center justify-between gap-3"
            : "h-16 max-w-container-max mx-auto px-4 sm:px-6 flex items-center justify-between gap-4"
        }`}
      >
        {/* Lado Izquierdo: Volver / Cerrar + Metadatos de la Orden */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-on-surface-variant hover:text-deep-slate hover:bg-surface-gray font-label-bold text-xs transition-colors cursor-pointer shrink-0"
              title="Cerrar visor (Esc)"
            >
              <span className="material-symbols-outlined text-[18px]">
                {drawerMode ? "close" : "arrow_back"}
              </span>
              <span className="hidden sm:inline">
                {backLabel || (drawerMode ? "Cerrar visor" : "Volver")}
              </span>
            </button>
          ) : (
            <Link
              href={backHref || "/profile/tickets"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-on-surface-variant hover:text-deep-slate hover:bg-surface-gray font-label-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">{backLabel || "Volver"}</span>
            </Link>
          )}

          <div className="w-[1px] h-6 bg-surface-variant shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-md font-bold text-xs sm:text-sm text-deep-slate truncate">
                Comprobante &amp; Entradas #{orderNumber}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label-bold uppercase bg-vip-gold/15 text-vip-gold border border-vip-gold/30 shrink-0">
                {totalSheets}x {tierName}
              </span>
            </div>
            <p className="font-body-md text-[11px] text-on-surface-variant truncate hidden md:block">
              {eventName} • Total: S/. {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Centro: Controles de Zoom */}
        <div className="hidden sm:flex items-center bg-surface-gray rounded-xl p-1 gap-1 text-deep-slate border border-surface-variant shrink-0">
          <button
            onClick={handleZoomOut}
            aria-label="Reducir zoom"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="font-label-bold text-xs px-2 select-none min-w-[48px] text-center font-bold">
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
            {totalSheets} {totalSheets === 1 ? "Hoja" : "Hojas"}
          </span>
        </div>

        {/* Lado Derecho: Acción Principal (Descargar / Imprimir) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-indigo hover:bg-primary text-white font-label-bold text-xs shadow-md shadow-electric-indigo/25 transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Descargar PDF / Imprimir</span>
          </button>
        </div>
      </div>
    </header>
  );

  // =========================================================================
  // MODO 1: MODAL SLIDE-OVER DRAWER (MEDIANTE REACT PORTAL DIRECTO EN BODY)
  // =========================================================================
  if (isDrawer) {
    if (!mounted || typeof document === "undefined") return null;

    const drawerContent = (
      <div
        id="qph-ticket-drawer-portal"
        className="qph-drawer-root fixed inset-0 z-[9999] overflow-hidden print:static print:z-auto print:overflow-visible font-body-md text-on-surface antialiased"
      >
        {printStyles}

        {/* Backdrop desenfocado con bloqueo de scroll */}
        <div
          className="qph-drawer-backdrop fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 print:hidden cursor-pointer z-[9999]"
          onClick={onBack}
          aria-hidden="true"
        />

        {/* Contenedor del Drawer deslizándose desde el lateral derecho */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-8 lg:pl-16 z-[10000] print:static print:inset-auto print:p-0 pointer-events-none">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Comprobante y entradas oficiales #${orderNumber}`}
            className="qph-drawer-panel pointer-events-auto w-screen max-w-4xl lg:max-w-5xl xl:max-w-6xl h-full bg-[#f8fafc] shadow-2xl flex flex-col border-l border-surface-variant animate-in slide-in-from-right duration-300 ease-out print:w-full print:max-w-full print:shadow-none print:border-none print:bg-white print:h-auto"
          >
            {/* Header del Drawer */}
            {renderHeader(true)}

            {/* Cuerpo del Drawer con Scroll Aislado e Independiente */}
            <main className="qph-drawer-body flex-1 w-full overflow-y-auto p-4 sm:p-8 bg-[#eef2f6] flex flex-col items-center gap-8 print:p-0 print:m-0 print:bg-white print:gap-0 print:overflow-visible">
              {resolvedTickets.map((ticket, index) => renderTicketSheet(ticket, index))}
            </main>
          </div>
        </div>
      </div>
    );

    return createPortal(drawerContent, document.body);
  }

  // =========================================================================
  // MODO 2: PÁGINA COMPLETA TRADICIONAL (STANDALONE)
  // =========================================================================
  return (
    <div className="bg-[#f7f9fb] font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {printStyles}
      {renderHeader(false)}

      <main className="w-full pt-6 pb-20 bg-[#f7f9fb] min-h-screen flex flex-col items-center gap-8 overflow-x-auto print:p-0 print:m-0 print:bg-white print:gap-0">
        {resolvedTickets.map((ticket, index) => renderTicketSheet(ticket, index))}
      </main>
    </div>
  );
}
