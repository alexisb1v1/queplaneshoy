"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PaymentSuccessScreen from "./payment-success-screen";
import CheckoutStepper from "./components/checkout-stepper";

interface TicketTier {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  price: number;
  available: boolean;
  quantity: number;
  colorHex: string;
}

interface ShowFunction {
  id: string;
  dateStr: string;
  timeStr: string;
  statusText: string;
  statusType: "available" | "last_passes" | "sold_out";
}

const SHOW_FUNCTIONS: ShowFunction[] = [
  {
    id: "f1",
    dateStr: "Viernes 14 Junio",
    timeStr: "20:00h",
    statusText: "Entradas disp.",
    statusType: "available",
  },
  {
    id: "f2",
    dateStr: "Sábado 15 Junio",
    timeStr: "21:00h",
    statusText: "¡Últimos pases!",
    statusType: "last_passes",
  },
  {
    id: "f3",
    dateStr: "Domingo 16 Junio",
    timeStr: "18:00h",
    statusText: "Entradas disp.",
    statusType: "available",
  },
];

export default function PurchaseFlowPageComponent() {
  // --- NAVEGACIÓN ENTRE PASOS (1: Selección de Entradas, 2: Pasarela de Pagos, 3: Confirmación) ---
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("f2");

  // Temporizador de Reserva regresivo (14:59 min)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(899);

  // Lista de Zonas / Entradas
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      id: "platinum-vip",
      name: "Platinum VIP Experience",
      badge: "Últimas 12 uds",
      badgeColor: "bg-amber-100 text-amber-800",
      description:
        "Front Stage exclusivo junto al DJ, acceso prioritario sin colas, barra libre premium y acreditación conmemorativa.",
      price: 120,
      available: true,
      quantity: 2, // 2 seleccionadas por defecto como en Stitch
      colorHex: "#4F46E5",
    },
    {
      id: "general-pista",
      name: "General Pista",
      badge: "Disponible",
      badgeColor: "bg-emerald-100 text-emerald-800",
      description:
        "Acceso general al recinto y pista central con visibilidad directa al espectáculo audiovisual Afterlife.",
      price: 65,
      available: true,
      quantity: 0,
      colorHex: "#7C3AED",
    },
    {
      id: "grada-baja",
      name: "Grada Baja Numerada",
      badge: "Disponible",
      badgeColor: "bg-emerald-100 text-emerald-800",
      description:
        "Asiento asignado con excelente ángulo panorámico de la escenografía y sonido envolvente.",
      price: 45,
      available: true,
      quantity: 0,
      colorHex: "#059669",
    },
    {
      id: "grada-alta",
      name: "Grada Alta Promocional",
      badge: "Agotado",
      badgeColor: "bg-red-100 text-red-800",
      description: "Entrada económica con vista cenital completa al espectáculo.",
      price: 30,
      available: false,
      quantity: 0,
      colorHex: "#F59E0B",
    },
  ]);

  // Método de pago en Paso 2
  const [paymentMethod, setPaymentMethod] = useState<"card" | "yape" | "transfer" | "apple_pay" | "google_pay">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Cuenta regresiva del temporizador
  useEffect(() => {
    if (currentStep === 3) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} min`;
  };

  // Manejo de cantidades (+ / -)
  const handleQuantityChange = (tierId: string, delta: number) => {
    setTicketTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== tierId || !tier.available) return tier;
        const newQty = Math.max(0, Math.min(8, tier.quantity + delta));
        return { ...tier, quantity: newQty };
      })
    );
  };

  // Cálculos de Totales
  const totalTickets = ticketTiers.reduce((acc, t) => acc + t.quantity, 0);
  const subtotal = ticketTiers.reduce((acc, t) => acc + t.price * t.quantity, 0);
  const distributionFee = totalTickets > 0 ? 6 * totalTickets : 0; // 6€ por entrada
  const vatTax = Math.round((subtotal + distributionFee) * 0.1 * 100) / 100; // 10% IVA
  const grandTotal = subtotal + distributionFee + vatTax;

  const selectedFunction = SHOW_FUNCTIONS.find((f) => f.id === selectedFunctionId) || SHOW_FUNCTIONS[1];

  // Simulación de Envío de Pago
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTickets === 0) {
      alert("Por favor selecciona al menos una entrada.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
    }, 1600);
  };

  const paymentMethodLabel = {
    card: "Tarjeta de crédito (•••• 4829)",
    yape: "Yape / Plin Móvil",
    transfer: "PagoEfectivo / Transferencia CIP",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
  }[paymentMethod];

  const primarySelectedTier = ticketTiers.find((t) => t.quantity > 0) || ticketTiers[0];

  if (currentStep === 3) {
    return (
      <PaymentSuccessScreen
        orderCode="#QPH-849204"
        userEmail="usuario@ejemplo.com"
        eventTitle="Afterlife Madrid: Global Tour 2024"
        categoryTag="Música Electrónica • World Tour"
        dateStr={selectedFunction.dateStr}
        timeStr={selectedFunction.timeStr}
        venueName="Caja Mágica, Madrid"
        venueAccess="Puerta C • Front Stage VIP"
        venueAddress="Cmo. de Perales, 23, 28041 Madrid"
        zoneName={primarySelectedTier.name}
        tierBadge={primarySelectedTier.name.includes("VIP") ? "Platinum VIP" : "Acceso General"}
        ticketCount={totalTickets > 0 ? totalTickets : 2}
        unitPrice={primarySelectedTier.price}
        distributionFee={distributionFee > 0 ? distributionFee : 12}
        vatAmount={vatTax > 0 ? vatTax : 25.2}
        totalAmount={grandTotal > 0 ? grandTotal : 277.2}
        paymentMethodText={paymentMethodLabel}
        txCode="TX-910403"
      />
    );
  }

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
      {/* =========================================================================
          CABECERA CONTEXTUAL DEL CHECKOUT (STITCH STYLE)
         ========================================================================= */}
      <header className="bg-surface/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-4 sm:px-8 h-20 max-w-container-max mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-qph.svg"
                alt="Logo QPH"
                className="w-9 h-9 rounded-lg shadow-sm group-hover:scale-105 transition-all"
              />
              <span className="text-xl sm:text-2xl font-black text-deep-slate tracking-tighter">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </Link>

            <Link
              href="/events"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors pl-4 border-l border-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Volver al evento</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/events"
              className="text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors hidden md:inline-block"
            >
              Eventos
            </Link>
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-electric-indigo transition-colors font-semibold text-xs cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="hidden sm:inline">Centro de Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTENIDO PRINCIPAL
         ========================================================================= */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-container-max mx-auto">
          
          {/* STEPPER DE PROGRESO DE 3 PASOS (ESTILO EXACTO Y UNIFORME) */}
          <CheckoutStepper
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step === 1) setCurrentStep(1);
              if (step === 2 && totalTickets > 0) setCurrentStep(2);
            }}
            canNavigateToStep2={totalTickets > 0}
          />

          {/* TIMER ALERT (URGENCIA POSITIVA) */}
          <div className="mb-8 p-3.5 bg-electric-indigo/10 border border-electric-indigo/20 rounded-xl flex items-center justify-between max-w-4xl mx-auto shadow-sm">
              <div className="flex items-center gap-2.5 text-deep-slate text-xs sm:text-sm font-semibold">
                <span className="material-symbols-outlined text-electric-indigo text-xl">timer</span>
                <span>Tus entradas seleccionadas se reservan temporalmente:</span>
              </div>
              <div className="bg-white px-3 py-1 rounded-lg border border-electric-indigo/30 font-bold text-electric-indigo text-xs sm:text-sm flex items-center gap-1.5 shadow-sm font-mono">
                <span className="w-2 h-2 rounded-full bg-vip-gold animate-pulse" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

          {/* =====================================================================
              LAYOUT DE DOS COLUMNAS (FORMULARIO PRINCIPAL + SUMMARY STICKY)
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* -------------------------------------------------------------------
                COLUMNA IZQUIERDA (PASO 1 O PASO 2 O PASO 3)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* =================================================================
                  PASO 1: SELECCIÓN DE ENTRADAS Y ZONAS
                 ================================================================= */}
              {currentStep === 1 && (
                <>
                  {/* Selector de Fechas / Funciones */}
                  <div className="bg-white p-6 rounded-2xl border border-surface-variant shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-deep-slate">
                        Selecciona tu Función
                      </h2>
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                        Caja Mágica, Madrid
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SHOW_FUNCTIONS.map((fn) => {
                        const isSelected = selectedFunctionId === fn.id;
                        return (
                          <button
                            key={fn.id}
                            type="button"
                            onClick={() => setSelectedFunctionId(fn.id)}
                            className={`p-3.5 rounded-xl text-left transition-all relative cursor-pointer ${
                              isSelected
                                ? "border-2 border-electric-indigo bg-electric-indigo/5 shadow-md shadow-electric-indigo/10"
                                : "border border-surface-variant hover:border-electric-indigo bg-surface-container-low/50 hover:bg-surface-gray"
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute -top-2.5 right-3 bg-electric-indigo text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Seleccionado
                              </span>
                            )}
                            <div
                              className={`text-xs font-bold ${
                                isSelected ? "text-electric-indigo" : "text-on-surface-variant"
                              }`}
                            >
                              {fn.dateStr}
                            </div>
                            <div className="font-extrabold text-deep-slate text-base mt-0.5">
                              {fn.timeStr}
                            </div>
                            <div className="text-[11px] mt-1 flex items-center gap-1 font-medium">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  fn.statusType === "last_passes" ? "bg-vip-gold" : "bg-emerald-500"
                                }`}
                              />
                              <span
                                className={
                                  fn.statusType === "last_passes" ? "text-vip-gold" : "text-platinum-silver"
                                }
                              >
                                {fn.statusText}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mapa Esquemático del Recinto (Caja Mágica / Estadio) */}
                  <div className="bg-white p-6 rounded-2xl border border-surface-variant shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-deep-slate">
                          Mapa de Zonas y Localidades
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Haz referencia al croquis para ubicar tu área ideal en Caja Mágica.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-electric-indigo" />
                          <span>Platinum VIP</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
                          <span>General Pista</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                          <span>Grada Baja</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                          <span>Grada Alta</span>
                        </span>
                      </div>
                    </div>

                    {/* Diagrama SVG Interactivo del Estadio */}
                    <div className="w-full bg-surface-gray rounded-xl p-4 border border-surface-variant flex flex-col items-center justify-center">
                      <div className="w-full max-w-lg aspect-[16/9] relative flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 500 280">
                          {/* Grada Alta (Ámbar) */}
                          <rect
                            fill="#FEF3C7"
                            height="250"
                            rx="24"
                            stroke="#F59E0B"
                            strokeDasharray="4 3"
                            strokeWidth="2"
                            width="450"
                            x="25"
                            y="15"
                          />
                          <text
                            fill="#B45309"
                            fontFamily="Inter"
                            fontSize="10"
                            fontWeight="700"
                            textAnchor="middle"
                            x="250"
                            y="32"
                          >
                            GRADA ALTA (30,00€ - AGOTADO)
                          </text>

                          {/* Grada Baja (Verde Esmeralda) */}
                          <rect
                            fill="#D1FAE5"
                            height="195"
                            rx="16"
                            stroke="#059669"
                            strokeWidth="2"
                            width="370"
                            x="65"
                            y="45"
                          />
                          <text
                            fill="#047857"
                            fontFamily="Inter"
                            fontSize="11"
                            fontWeight="700"
                            textAnchor="middle"
                            x="250"
                            y="62"
                          >
                            GRADA BAJA NUMERADA (45,00€)
                          </text>

                          {/* General Pista (Violeta) */}
                          <rect
                            fill="#EDE9FE"
                            height="135"
                            rx="12"
                            stroke="#7C3AED"
                            strokeWidth="2"
                            width="280"
                            x="110"
                            y="80"
                          />
                          <text
                            fill="#6D28D9"
                            fontFamily="Inter"
                            fontSize="11"
                            fontWeight="700"
                            textAnchor="middle"
                            x="250"
                            y="102"
                          >
                            GENERAL PISTA (65,00€)
                          </text>

                          {/* Platinum VIP Front Stage (Índigo) */}
                          <rect
                            fill="#E0E7FF"
                            height="65"
                            rx="8"
                            stroke="#4F46E5"
                            strokeWidth="2.5"
                            width="190"
                            x="155"
                            y="120"
                          />
                          <text
                            fill="#4338CA"
                            fontFamily="Inter"
                            fontSize="11"
                            fontWeight="800"
                            textAnchor="middle"
                            x="250"
                            y="145"
                          >
                            ★ PLATINUM VIP FRONT STAGE ★
                          </text>
                          <text
                            fill="#4338CA"
                            fontFamily="Inter"
                            fontSize="10"
                            fontWeight="600"
                            textAnchor="middle"
                            x="250"
                            y="162"
                          >
                            Barra Libre + Acceso Preferente (120,00€)
                          </text>

                          {/* Stage / Escenario Principal */}
                          <rect
                            fill="#0F172A"
                            height="24"
                            rx="4"
                            width="140"
                            x="180"
                            y="195"
                          />
                          <text
                            fill="#FFFFFF"
                            fontFamily="Inter"
                            fontSize="11"
                            fontWeight="800"
                            letterSpacing="1.5"
                            textAnchor="middle"
                            x="250"
                            y="211"
                          >
                            ESCENARIO / STAGE
                          </text>
                        </svg>
                      </div>

                      <div className="mt-2 flex items-center justify-between w-full text-xs text-on-surface-variant px-2">
                        <span>⚡ Zona Acústica Optimizada</span>
                        <span className="text-electric-indigo font-bold">Aforo en Vivo: 88% completo</span>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Tipos de Entradas y Cantidades */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-deep-slate">
                      Selecciona tus Entradas
                    </h3>

                    {ticketTiers.map((tier) => {
                      const isSelected = tier.quantity > 0;
                      return (
                        <div
                          key={tier.id}
                          className={`p-5 rounded-2xl border-2 transition-all relative ${
                            !tier.available
                              ? "bg-white/60 border-surface-variant/70 opacity-70"
                              : isSelected
                              ? "bg-white border-electric-indigo shadow-md shadow-electric-indigo/10"
                              : "bg-white border-surface-variant hover:border-outline-variant"
                          }`}
                        >
                          {isSelected && tier.available && (
                            <span className="absolute -top-3 right-4 bg-electric-indigo text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                              Seleccionado
                            </span>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: tier.colorHex }}
                                />
                                <h4 className="text-base sm:text-lg text-deep-slate font-bold">
                                  {tier.name}
                                </h4>
                                <span
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${tier.badgeColor}`}
                                >
                                  {tier.badge}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant max-w-md">
                                {tier.description}
                              </p>
                              <div className="text-sm text-electric-indigo font-bold">
                                {tier.price.toFixed(2)}€{" "}
                                <span className="text-xs text-platinum-silver font-normal">
                                  / entrada
                                </span>
                              </div>
                            </div>

                            {/* Controles de Cantidad */}
                            <div className="flex items-center gap-3 self-end sm:self-center">
                              {tier.available ? (
                                <>
                                  <div className="flex items-center border border-surface-variant rounded-xl bg-surface-container-low p-1">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(tier.id, -1)}
                                      disabled={tier.quantity === 0}
                                      className="w-9 h-9 rounded-lg bg-white text-deep-slate hover:bg-surface-gray font-bold flex items-center justify-center border border-surface-variant shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      −
                                    </button>
                                    <span className="w-10 text-center font-bold text-base text-deep-slate">
                                      {tier.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(tier.id, 1)}
                                      className="w-9 h-9 rounded-lg bg-electric-indigo text-white hover:bg-primary font-bold flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="text-right min-w-[70px]">
                                    <span className="block font-bold text-base text-deep-slate">
                                      {(tier.price * tier.quantity).toFixed(2)}€
                                    </span>
                                    <span className="text-[11px] text-platinum-silver">
                                      {tier.quantity} entradas
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                                  Sold Out
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* =================================================================
                  PASO 2: PASARELA DE PAGOS Y MÉTODOS SEGUROS (STITCH MATCH)
                 ================================================================= */}
              {currentStep === 2 && (
                <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-surface-variant shadow-sm">
                  <div>
                    <h1 className="text-2xl font-black text-deep-slate mb-2">
                      Método de Pago
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                      Selecciona tu forma de pago preferida para completar la reserva.
                    </p>
                  </div>

                  {/* Opciones de Métodos de Pago */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tarjeta */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-electric-indigo bg-electric-indigo/10 shadow-sm"
                          : "border-surface-variant bg-white hover:bg-surface-gray"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-electric-indigo/20 flex items-center justify-center text-electric-indigo">
                          <span className="material-symbols-outlined text-2xl">credit_card</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">
                            Tarjeta de Crédito / Débito
                          </span>
                          <span className="text-xs text-on-surface-variant">Visa, Mastercard, Amex</span>
                        </div>
                      </div>
                      {paymentMethod === "card" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>

                    {/* Yape / Plin */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("yape")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === "yape"
                          ? "border-electric-indigo bg-electric-indigo/10 shadow-sm"
                          : "border-surface-variant bg-white hover:bg-surface-gray"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                          <span className="material-symbols-outlined text-2xl">phone_iphone</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">Yape / Plin</span>
                          <span className="text-xs text-on-surface-variant">Billeteras móviles instantáneas QR</span>
                        </div>
                      </div>
                      {paymentMethod === "yape" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>

                    {/* PagoEfectivo */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === "transfer"
                          ? "border-electric-indigo bg-electric-indigo/10 shadow-sm"
                          : "border-surface-variant bg-white hover:bg-surface-gray"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-gray flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-2xl">account_balance</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">
                            PagoEfectivo / Transferencia
                          </span>
                          <span className="text-xs text-on-surface-variant">Banca online y puntos autorizados</span>
                        </div>
                      </div>
                      {paymentMethod === "transfer" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>

                    {/* Apple Pay */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("apple_pay")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === "apple_pay"
                          ? "border-electric-indigo bg-electric-indigo/10 shadow-sm"
                          : "border-surface-variant bg-white hover:bg-surface-gray"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-gray flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-2xl">contactless</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">Apple Pay</span>
                          <span className="text-xs text-on-surface-variant">Pago con Touch ID o Face ID</span>
                        </div>
                      </div>
                      {paymentMethod === "apple_pay" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>

                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("google_pay")}
                      className={`sm:col-span-2 flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === "google_pay"
                          ? "border-electric-indigo bg-electric-indigo/10 shadow-sm"
                          : "border-surface-variant bg-white hover:bg-surface-gray"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-gray flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-2xl">wallet</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">Google Pay</span>
                          <span className="text-xs text-on-surface-variant">Pago seguro con tu cuenta Google</span>
                        </div>
                      </div>
                      {paymentMethod === "google_pay" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>
                  </div>

                  {/* Formulario y Caja de Protección */}
                  <form onSubmit={handleSubmitPayment} className="space-y-6 pt-4">
                    <div className="p-6 bg-surface-container-low rounded-xl border border-surface-variant space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-electric-indigo/10 flex items-center justify-center text-electric-indigo flex-shrink-0">
                          <span className="material-symbols-outlined text-[24px]">verified_user</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-deep-slate text-sm font-bold">
                            Pasarela de pago protegida y cifrada
                          </h3>
                          <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                            Serás redirigido a la pasarela segura o se abrirá el modal oficial de pago para completar la transacción de forma 100% protegida.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-3 text-xs text-on-surface-variant border-t border-surface-variant">
                        <span className="material-symbols-outlined text-sm text-electric-indigo">lock</span>
                        <span>Conexión cifrada de 256 bits con autenticación en dos pasos 3D Secure</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing || totalTickets === 0}
                      className="w-full py-4 bg-electric-indigo hover:bg-primary text-white rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg shadow-electric-indigo/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Procesando pago seguro...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">lock</span>
                          <span>Pagar Ahora • {grandTotal.toFixed(2)}€</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Sellos de Confianza */}
                  <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-surface-variant opacity-75">
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base">lock</span>
                      <span>Pago Seguro SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      <span>Garantía de entradas</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      <span className="material-symbols-outlined text-base">shield</span>
                      <span>PCI Compliance</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------------
                COLUMNA DERECHA: STICKY ORDER SUMMARY (STITCH EXACT MATCH)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-surface-variant">
                  {/* Mini Banner del Evento */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      alt="Afterlife Madrid"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnd8-6_1mxS3dZFtHk9XFlFw3P0KN3s3jBI7R0CsQGAd5qSojJImmoWKoQAequo_GBLwop9XD2E7G5q3GK-5CoO6-NBQ_QRd9sZuxPW5LA82L-X5_Wvmq0B4H_dbbi19Zt7skdIljIs-uTI2zIboIarNOLbbQmLhUk1ZO5UWbuwr5maC8WfWwH_lYm3OaAxPNBn8SvnH-lbOXUaXsTsWxTqBxNYhtCtb0NZV8H1tajvL8hMzjePt5C_qhvS19rf5BN3oRIFjdDXiU8"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-slate to-transparent opacity-70" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="inline-block bg-electric-indigo text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mb-1">
                        Concierto Exclusivo
                      </span>
                      <h3 className="text-base text-white font-bold leading-tight line-clamp-1">
                        Afterlife Madrid: Global Tour 2024
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Info del Show Seleccionado */}
                    <div className="space-y-2 pb-5 border-b border-surface-variant text-xs">
                      <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                        <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                          calendar_month
                        </span>
                        <span>
                          {selectedFunction.dateStr} • {selectedFunction.timeStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                        <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                          location_on
                        </span>
                        <span>Caja Mágica, Madrid</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                        <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                          airline_seat_recline_extra
                        </span>
                        <span>
                          Zona:{" "}
                          {ticketTiers.find((t) => t.quantity > 0)?.name || "Ninguna zona elegida"}
                        </span>
                      </div>
                    </div>

                    {/* Desglose de Precios */}
                    <div className="py-5 border-b border-surface-variant space-y-3">
                      {ticketTiers
                        .filter((t) => t.quantity > 0)
                        .map((t) => (
                          <div key={t.id} className="flex justify-between items-start text-sm">
                            <div className="flex flex-col">
                              <span className="font-bold text-deep-slate">
                                {t.quantity}x {t.name}
                              </span>
                              <span className="text-xs text-on-surface-variant">
                                {t.price.toFixed(2)}€ por entrada
                              </span>
                            </div>
                            <span className="font-bold text-deep-slate">
                              {(t.price * t.quantity).toFixed(2)}€
                            </span>
                          </div>
                        ))}

                      {totalTickets === 0 && (
                        <p className="text-xs text-platinum-silver italic">
                          Aún no has añadido entradas a tu reserva.
                        </p>
                      )}

                      <div className="flex justify-between items-center text-sm text-on-surface-variant">
                        <span>Gastos de distribución</span>
                        <span>{distributionFee.toFixed(2)}€</span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-on-surface-variant">
                        <span>IVA (10% incluido)</span>
                        <span>{vatTax.toFixed(2)}€</span>
                      </div>
                    </div>

                    {/* Total Final */}
                    <div className="py-5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-deep-slate text-xl font-bold">Total</span>
                        <span className="text-[11px] text-platinum-silver">
                          Impuestos y tasas incluidos
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-electric-indigo">
                          {grandTotal.toFixed(2)}€
                        </span>
                      </div>
                    </div>

                    {/* Botón CTA al Paso de Pago (En Paso 1) */}
                    {currentStep === 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (totalTickets === 0) {
                            alert("Por favor selecciona al menos una entrada para continuar.");
                            return;
                          }
                          setCurrentStep(2);
                        }}
                        disabled={totalTickets === 0}
                        className="w-full py-4 bg-electric-indigo hover:bg-primary disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/25 active:scale-95 group cursor-pointer"
                      >
                        <span>Continuar al Paso de Pago</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    )}

                    {/* Botón CTA de Pago (En Paso 2) */}
                    {currentStep === 2 && (
                      <button
                        type="button"
                        onClick={handleSubmitPayment}
                        disabled={isProcessing || totalTickets === 0}
                        className="w-full py-4 bg-electric-indigo hover:bg-primary text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/25 active:scale-95 group cursor-pointer"
                      >
                        <span className="material-symbols-outlined">lock</span>
                        <span>Confirmar y Pagar {grandTotal.toFixed(2)}€</span>
                      </button>
                    )}

                    {/* Métodos Aceptados */}
                    <div className="mt-5 pt-4 border-t border-surface-variant">
                      <div className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">
                        Métodos de pago aceptados:
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                          💳 VISA / Mastercard
                        </span>
                        <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                          Apple Pay
                        </span>
                        <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                          Google Pay
                        </span>
                        <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-purple-700 border border-surface-variant">
                          Yape / Plin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sellos de Seguridad */}
                <div className="p-4 border border-surface-variant rounded-xl border-dashed bg-surface-container-low/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined text-electric-indigo text-lg">
                      verified_user
                    </span>
                    <span>Garantía de entradas 100% auténticas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined text-electric-indigo text-lg">
                      lock
                    </span>
                    <span>Reserva segura cifrada SSL de extremo a extremo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          FOOTER DEL PROCESO DE COMPRA
         ========================================================================= */}
      <footer className="bg-deep-slate text-surface-container-lowest mt-16 border-t border-white/10">
        <div className="w-full py-12 px-4 sm:px-8 max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo-qph.svg" alt="Logo QPH" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="text-xl font-black text-surface-container-lowest tracking-tighter">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
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
              <li><Link href="/events" className="hover:text-white transition-colors">Festivales</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Teatro y Musicales</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Deportes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Soporte
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto y Dudas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Cancelación</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Legales
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Condiciones de Venta</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 w-full px-4 sm:px-8 py-6 text-center text-platinum-silver text-xs">
          © 2024 queplaneshoy. Todos los derechos reservados. Compra segura con tecnología certificada.
        </div>
      </footer>
    </div>
  );
}
