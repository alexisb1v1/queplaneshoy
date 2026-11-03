"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { QRCodeSVG } from "qrcode.react";
import CheckoutStepper from "./components/checkout-stepper";
import TicketPrintScreen from "./ticket-print-screen";

// Carga dinámica del mapa OpenStreetMap / Leaflet (desactivando SSR)
const EventLocationMap = dynamic(
  () =>
    import("../../events/ui/components/event-location-map").then(
      (mod) => mod.EventLocationMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-xl bg-surface-gray border border-surface-variant flex flex-col items-center justify-center gap-2 text-xs font-semibold text-on-surface-variant animate-pulse">
        <span className="material-symbols-outlined text-electric-indigo text-2xl">map</span>
        <span>Cargando ubicación oficial del recinto...</span>
      </div>
    ),
  }
);

export interface PaymentSuccessProps {
  orderCode?: string;
  userEmail?: string;
  customerName?: string;
  eventTitle?: string;
  categoryTag?: string;
  bannerImageUrl?: string;
  dateStr?: string;
  timeStr?: string;
  doorsOpenStr?: string;
  venueName?: string;
  venueAccess?: string;
  venueAddress?: string;
  coordinates?: string | null;
  addressReference?: string | null;
  city?: string;
  googleMapsUrl?: string | null;
  zoneName?: string;
  tierBadge?: string;
  ticketCount?: number;
  unitPrice?: number;
  distributionFee?: number;
  vatAmount?: number;
  totalAmount?: number;
  paymentMethodText?: string;
  txCode?: string;
  qrPayload?: string;
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

export default function PaymentSuccessScreen({
  orderCode = "#QPH-849204",
  userEmail = "usuario@queplaneshoy.com",
  customerName = "Comprador Oficial QPH",
  eventTitle = "Evento Oficial",
  categoryTag = "Venta Oficial QPH",
  bannerImageUrl = "",
  dateStr = "Fecha Confirmada",
  timeStr = "Horario Oficial",
  doorsOpenStr = "Apertura 2 hrs antes",
  venueName = "Recinto Oficial",
  venueAccess = "Puerta Principal • Control QR Ed25519",
  venueAddress = "Recinto Oficial, Perú",
  coordinates = null,
  addressReference = null,
  city = "LIMA",
  googleMapsUrl = null,
  zoneName = "Zona General",
  tierBadge = "General",
  ticketCount = 1,
  unitPrice = 50,
  distributionFee = 0,
  vatAmount = 0,
  totalAmount = 50,
  paymentMethodText = "Tarjeta de crédito",
  txCode = "TX-910403",
  qrPayload,
  tickets = [],
}: PaymentSuccessProps) {
  const [showPrintView, setShowPrintView] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadPdf = () => {
    setShowPrintView(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      alert("Enlace copiado al portapapeles");
    }
  };

  const subtotalEntradas = ticketCount * unitPrice;

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      {/* =========================================================================
          TOP NAVIGATION BAR (STITCH EXACT MATCH)
         ========================================================================= */}
      <header className="bg-surface/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-4 sm:px-8 h-20 max-w-container-max mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                alt="Logo QPH"
                className="w-8 h-8 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-all"
                src="/logo-qph.svg"
              />
              <span className="text-xl sm:text-2xl font-black text-deep-slate tracking-tighter">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/checkout"
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden sm:inline">Volver a selección de entradas</span>
            </Link>
            <button
              onClick={() => alert("Centro de Ayuda disponible las 24 horas en soporte@queplaneshoy.com")}
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span className="hidden sm:inline">Centro de Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTENT CONTAINER
         ========================================================================= */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="flex flex-col w-full">

          {/* =====================================================================
              STEPPER SECTION (ESTILO EXACTO Y UNIFORME CON CHECKOUT)
             ===================================================================== */}
          <CheckoutStepper currentStep={3} />

          {/* =====================================================================
              HERO SUCCESS HEADER (STITCH EXACT MATCH)
             ===================================================================== */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 md:p-12 shadow-sm mb-12 text-center border border-surface-variant">
            {/* Subtle Ambient Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
              {/* Animated Check Circle */}
              <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-6 shadow-md transition-transform duration-500 hover:scale-105">
                <span
                  className="material-symbols-outlined text-[44px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-gray text-primary mb-4 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">celebration</span>
                <span>¡Transacción Aprobada!</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-deep-slate mb-3 tracking-tight">
                ¡Pago realizado con éxito!
              </h1>

              <p className="text-sm sm:text-base text-on-surface-variant max-w-xl mb-6">
                Hemos enviado tus entradas y el comprobante detallado de compra a tu correo electrónico:{" "}
                <strong className="text-deep-slate font-semibold">{userEmail}</strong>
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 bg-surface-gray rounded-xl px-5 py-3 text-on-surface-variant text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    receipt_long
                  </span>
                  <span>Código de pedido:</span>
                  <span className="text-deep-slate font-mono font-extrabold">{orderCode}</span>
                </div>
                <span className="text-platinum-silver hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[18px] text-platinum-silver">
                    calendar_today
                  </span>
                  <span>Fecha:</span>
                  <span className="text-deep-slate font-medium">
                    {dateStr} • {timeStr}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              MAIN GRID: DIGITAL PASS VOUCHER & ORDER SUMMARY (7 COLS / 5 COLS)
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
            
            {/* -------------------------------------------------------------------
                LEFT COLUMN: DIGITAL TICKET PASS (7 COLS)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Ticket Card Container */}
              <div className="relative bg-white rounded-2xl shadow-md overflow-hidden border border-surface-variant">
                
                {/* Ticket Header Banner with Event Context */}
                <div className="relative h-52 bg-deep-slate text-white p-6 flex flex-col justify-between overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
                    style={{ backgroundImage: `url('${bannerImageUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/60 to-transparent" />

                  {/* Top tags */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        alt="Logo QPH"
                        className="w-7 h-7 rounded-md object-contain shadow-sm"
                        src="/logo-qph.svg"
                      />
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        Pass Digital Oficial
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-vip-gold text-white font-bold text-xs uppercase tracking-widest shadow-sm">
                      {tierBadge}
                    </span>
                  </div>

                  {/* Event Headline inside Ticket Banner */}
                  <div className="relative z-10">
                    <span className="text-platinum-silver font-semibold text-xs uppercase tracking-wider block mb-1">
                      {categoryTag}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {eventTitle}
                    </h2>
                  </div>
                </div>

                {/* Ticket Body Details */}
                <div className="p-6 md:p-8 flex flex-col gap-6">
                  
                  {/* Info Pillars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-surface-variant/40">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-on-surface-variant uppercase text-[11px]">
                          Fecha y Hora
                        </span>
                        <span className="block font-bold text-deep-slate text-sm sm:text-base">
                          {dateStr}
                        </span>
                        <span className="block text-xs text-on-surface-variant">
                          {timeStr} ({doorsOpenStr})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-surface-variant/40">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[22px]">location_on</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-on-surface-variant uppercase text-[11px]">
                          Recinto y Acceso
                        </span>
                        <span className="block font-bold text-deep-slate text-sm sm:text-base truncate">
                          {venueName}
                        </span>
                        <span className="block text-xs text-on-surface-variant">
                          {venueAccess}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendee Tier Specs */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant/40 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-deep-slate text-white flex items-center justify-center font-bold text-xs">
                        {ticketCount}x
                      </div>
                      <div>
                        <span className="block font-bold text-sm sm:text-base text-deep-slate">
                          {ticketCount}x {zoneName}
                        </span>
                        <span className="block text-xs text-on-surface-variant">
                          Acceso Front Stage VIP prioritario + Barra Libre de cortesía
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-gray text-deep-slate font-bold text-xs">
                      <span className="material-symbols-outlined text-[16px] text-vip-gold">stars</span>
                      <span>Zona Exclusiva</span>
                    </div>
                  </div>

                  {/* Perforated Cutout Separator Effect (Efecto Entrada de Concierto) */}
                  <div className="relative -mx-8 my-1 flex items-center justify-between">
                    <div className="w-6 h-12 bg-background rounded-r-full shadow-inner border-y border-r border-surface-variant/40" />
                    <div className="flex-grow border-b-2 border-dashed border-surface-container-highest mx-3" />
                    <div className="w-6 h-12 bg-background rounded-l-full shadow-inner border-y border-l border-surface-variant/40" />
                  </div>

                  {/* QR Code Access Area con QR Real y Logo QPH Central */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-surface-gray border border-surface-variant/50">
                    <div className="p-3.5 bg-white rounded-2xl shadow-sm shrink-0 flex flex-col items-center">
                      <QRCodeSVG
                        value={qrPayload || (tickets && tickets[0]?.qrPayload) || `QPH|ORD:${orderCode}|TX:${txCode}`}
                        size={160}
                        level="H"
                        includeMargin={false}
                        imageSettings={{
                          src: "/logo-qph.svg",
                          x: undefined,
                          y: undefined,
                          height: 48,
                          width: 48,
                          excavate: true,
                        }}
                      />
                      <span className="mt-2.5 font-bold text-xs text-on-surface-variant font-mono">
                        {orderCode}
                      </span>
                    </div>

                    {/* QR Helper Instruction */}
                    <div className="flex flex-col gap-1.5 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-deep-slate font-bold text-sm sm:text-base">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          qr_code_scanner
                        </span>
                        <span>Acceso directo móvil</span>
                      </div>
                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        Presenta este código QR directamente desde tu dispositivo o tu pase guardado en el acceso del recinto. No es obligatorio imprimirlo.
                      </p>
                      <div className="mt-1 flex items-center justify-center sm:justify-start gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-slate bg-white px-2.5 py-1 rounded-full border border-surface-variant shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Válido para {ticketCount} personas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action on the Pass: Descargar Entradas centrado */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="w-full sm:w-auto min-w-[280px] max-w-md flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-xl bg-electric-indigo text-white font-bold text-sm hover:bg-primary transition-all shadow-md shadow-electric-indigo/25 active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span>
                      <span>Descargar Entradas (PDF)</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <Link
                      href="/profile/tickets"
                      className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-primary hover:underline"
                    >
                      <span>Ver y gestionar en Mis Entradas</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------------
                RIGHT COLUMN: ORDER SUMMARY & LOGISTICS (5 COLS)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Order Summary Breakdown Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5 border border-surface-variant">
                <div className="flex items-center justify-between pb-2 border-b border-surface-variant/40">
                  <h3 className="font-bold text-deep-slate text-base sm:text-lg">
                    Resumen de la Compra
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-gray text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                    Facturado
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-deep-slate">
                    <div>
                      <span className="font-bold block">
                        {ticketCount}x {zoneName}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        S/. {unitPrice.toFixed(2)} por entrada
                      </span>
                    </div>
                    <span className="font-bold">S/. {subtotalEntradas.toFixed(2)}</span>
                  </div>

                  {distributionFee > 0 && (
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Gastos de gestión y distribución</span>
                      <span>S/. {distributionFee.toFixed(2)}</span>
                    </div>
                  )}

                  {vatAmount > 0 && (
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>IGV aplicado</span>
                      <span>S/. {vatAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total Box */}
                <div className="pt-4 p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-surface-variant/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                        Total Pagado
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-0.5">
                        <span className="material-symbols-outlined text-[15px]">verified_user</span>
                        <span>Pago Seguro • Aprobado</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                        S/. {totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-on-surface-variant pt-2 flex items-center justify-between border-t border-surface-variant/30">
                    <span>Método: {paymentMethodText}</span>
                    <span className="font-mono text-platinum-silver">{txCode}</span>
                  </div>
                </div>
              </div>

              {/* Venue & Location Snapshot Card con Mapa Interactivo Oficial */}
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-surface-variant">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-deep-slate text-base sm:text-lg">
                    Ubicación del Recinto
                  </h3>
                  <span className="text-xs font-bold text-electric-indigo uppercase tracking-wider">
                    {city || "Ubicación Confirmada"}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-surface-variant shadow-xs">
                  <EventLocationMap
                    coordinates={coordinates}
                    venue={venueName}
                    address={venueAddress}
                    addressReference={addressReference}
                    city={city}
                    googleMapsUrl={googleMapsUrl}
                  />
                </div>
              </div>

              {/* Assistance & Customer Support Card */}
              <div className="bg-surface-container-low rounded-2xl p-5 flex items-center justify-between gap-4 border border-surface-variant/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-deep-slate">
                      ¿Tienes alguna duda con tu pedido?
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Soporte prioritario 24/7 para titulares VIP.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Asistente en vivo activado. Un agente te responderá en menos de 2 minutos.")}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-deep-slate font-bold text-xs hover:bg-surface-container-high transition-colors shadow-sm border border-surface-variant cursor-pointer"
                >
                  Contactar
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================================
              BOTTOM BENTO GRID: PREPARA TU EXPERIENCIA (3 CARDS)
             ===================================================================== */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <span className="font-bold text-xs text-primary uppercase tracking-widest block mb-1">
                  Prepara tu Experiencia
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-deep-slate">
                  Información útil y siguientes pasos
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-gray text-deep-slate font-bold text-xs hover:bg-surface-container transition-colors border border-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span>{copiedLink ? "¡Enlace copiado!" : "Compartir con amigos"}</span>
                </button>
              </div>
            </div>

            {/* Bento 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Como llegar */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 border border-surface-variant">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">directions_subway</span>
                  </div>
                  <h4 className="font-bold text-deep-slate text-base sm:text-lg mb-2">
                    ¿Cómo llegar al recinto?
                  </h4>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {addressReference
                      ? `${addressReference}. Te recomendamos acudir con anticipación al inicio del show.`
                      : venueAddress
                      ? `Ubicado en ${venueAddress}. Te sugerimos planificar tu transporte y llegar con anticipación.`
                      : "Te sugerimos planificar tu ruta de llegada con anticipación para un ingreso fluido."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-variant/40">
                  <a
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                    href={
                      googleMapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        venueAddress
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Abrir en Google Maps</span>
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Horarios y Normativa */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 border border-surface-variant">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-surface-gray flex items-center justify-center text-deep-slate mb-4 border border-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">schedule</span>
                  </div>
                  <h4 className="font-bold text-deep-slate text-base sm:text-lg mb-2">
                    Horarios y Control de Acceso
                  </h4>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {doorsOpenStr ? `Apertura de puertas: ${doorsOpenStr}. ` : ""}
                    Acceso con código QR oficial firmado criptográficamente. Es obligatorio portar documento de identidad (DNI físico o digital).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-variant/40">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Control QR Offline Activo</span>
                  </span>
                </div>
              </div>

              {/* Card 3: Pulsera Cashless y Barra */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 border border-surface-variant">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">local_bar</span>
                  </div>
                  <h4 className="font-bold text-deep-slate text-base sm:text-lg mb-2">
                    Pulsera Cashless y Barra
                  </h4>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Tu entrada Platinum incluye barra libre y acreditación de tela conmemorativa que podrás recoger directamente en la carpa de bienvenida VIP.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-surface-variant/40">
                  <a
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Tu pulsera NFC se vinculará en el mostrador VIP para accesos y consumiciones.");
                    }}
                  >
                    <span>Beneficios de tu entrada</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              FINAL GLOBAL CALL TO ACTIONS
             ===================================================================== */}
          <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 mb-4 flex flex-col sm:flex-row items-center justify-between gap-6 border border-surface-variant/40">
            <div className="flex items-center gap-4">
              <img
                alt="Logo QPH"
                className="w-12 h-12 rounded-xl object-contain shadow-sm shrink-0"
                src="/logo-qph.svg"
              />
              <div>
                <h4 className="font-bold text-deep-slate text-lg sm:text-xl">
                  ¿Buscas más experiencias para este mes?
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Descubre los festivales, conciertos y obras más exclusivos en Madrid.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                className="flex-1 sm:flex-none text-center px-6 py-3.5 rounded-xl bg-white text-deep-slate font-bold text-xs sm:text-sm hover:bg-surface-gray transition-colors shadow-sm border border-surface-variant"
                href="/"
              >
                Volver al Inicio
              </Link>
              <Link
                className="flex-1 sm:flex-none text-center px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm hover:bg-primary-container transition-colors shadow-sm"
                href="/events"
              >
                Explorar más eventos
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          FOOTER (STITCH EXACT MATCH)
         ========================================================================= */}
      <footer className="bg-deep-slate text-surface-container-lowest mt-16 border-t border-white/10">
        <div className="w-full py-12 px-4 sm:px-8 max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img alt="Logo QPH" className="w-8 h-8 rounded-lg object-contain shadow-sm" src="/logo-qph.svg" />
              <div className="text-xl font-black text-white tracking-tighter">
                queplanes<span className="text-electric-indigo">hoy</span>
              </div>
            </div>
            <p className="text-platinum-silver text-xs">
              Tu puerta de entrada a los mejores eventos, conciertos y experiencias en directo.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Eventos
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><Link href="/events" className="hover:text-white transition-colors">Conciertos</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Teatro</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Deportes</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Festivales</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Soporte
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Legales
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 w-full px-4 sm:px-8 py-6 text-center text-platinum-silver text-xs">
          © 2024 queplaneshoy. Todos los derechos reservados. Compra segura con tecnología certificada.
        </div>
      </footer>

      {/* =========================================================================
          MODAL DRAWER DESLIZANTE DESDE LA DERECHA (TICKET PRINT SCREEN)
         ========================================================================= */}
      {showPrintView && (
        <TicketPrintScreen
          isDrawer={true}
          orderNumber={orderCode.replace("#", "")}
          orderRef={txCode}
          eventName={eventTitle}
          eventSubtitle={categoryTag}
          eventDate={dateStr}
          eventTime={timeStr}
          eventVenue={venueName}
          eventAddress={venueAddress}
          tierName={tierBadge}
          tierZone={zoneName}
          ticketCount={ticketCount}
          unitPrice={unitPrice}
          totalAmount={totalAmount}
          holderName={customerName}
          holderDni={userEmail}
          tickets={tickets}
          backLabel="Cerrar visor"
          onBack={() => setShowPrintView(false)}
        />
      )}

    </div>
  );
}
