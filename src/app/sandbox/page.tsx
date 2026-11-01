"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";

// --- TIPOS Y MODELOS DEL FLUJO DE COMPRA ---
type CheckoutStep = 1 | 2 | 3 | 4; // 1: Entradas, 2: Asistentes, 3: Pago, 4: Confirmación

interface ZoneOption {
  id: string;
  name: string;
  badge: string;
  color: string;
  priceRegular: number;
  priceDiscount: number;
  tierName: string;
  availableTickets: number;
  description: string;
  gate: string;
}

interface Attendee {
  fullName: string;
  docType: "DNI" | "CE" | "PASAPORTE";
  docNumber: string;
  email: string;
}

const AVAILABLE_ZONES: ZoneOption[] = [
  {
    id: "vip",
    name: "Zona VIP Gold",
    badge: "Preventa 1 • 25% OFF",
    color: "#f59e0b",
    priceRegular: 240,
    priceDiscount: 180,
    tierName: "Preventa Fase 1",
    availableTickets: 34,
    description: "Acceso preferencial frente al escenario, barra exclusiva y sin colas en puerta.",
    gate: "Puerta 01 - Acceso Preferencial",
  },
  {
    id: "general",
    name: "Sector General A",
    badge: "Preventa 2 • 20% OFF",
    color: "#6366f1",
    priceRegular: 110,
    priceDiscount: 85,
    tierName: "Preventa Fase 2",
    availableTickets: 120,
    description: "Pista central, excelente sonido surround y amplia zona de bebidas y comidas.",
    gate: "Puerta 02 - Acceso Sur",
  },
  {
    id: "box",
    name: "Box Platino (8 personas)",
    badge: "Exclusivo",
    color: "#8b5cf6",
    priceRegular: 1650,
    priceDiscount: 1450,
    tierName: "Venta Exclusiva",
    availableTickets: 4,
    description: "Lounge privado elevado con atención personalizada, catering y 2 botellas de cortesía.",
    gate: "Puerta 04 - Acceso Exclusivo Boxes",
  },
];

// Cupones de prueba válidos
const VALID_COUPONS: Record<string, { discountPercent?: number; discountFixed?: number; label: string }> = {
  FESTIVAL10: { discountPercent: 10, label: "10% de Descuento de Temporada" },
  QPH25: { discountFixed: 25, label: "S/ 25.00 de Descuento de Bienvenida" },
  CORAZON2026: { discountPercent: 15, label: "15% Fans de Corazón Serrano" },
};

export default function SandboxPrototipoPage() {
  // --- MODO ACTIVO EN EL SANDBOX ---
  // Permite alternar entre el Flujo de Compra y el Validador QR de Puerta
  const [activeModule, setActiveModule] = useState<"checkout" | "scanner">("checkout");

  // =========================================================================
  // ESTADOS DEL FLUJO DE COMPRA (CHECKOUT EXPERIENCE)
  // =========================================================================
  const [step, setStep] = useState<CheckoutStep>(1);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("vip");
  const [ticketQuantity, setTicketQuantity] = useState<number>(2);

  // Temporizador de Reserva Temporal (10:00 min = 600 segundos)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);

  // Lista de Asistentes
  const [attendees, setAttendees] = useState<Attendee[]>([
    { fullName: "Alexis Baldeón", docType: "DNI", docNumber: "73849102", email: "alexis@ejemplo.com" },
    { fullName: "Camila Navarro Rios", docType: "DNI", docNumber: "47129845", email: "camila@ejemplo.com" },
  ]);

  // Cupones
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; amount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Métodos de Pago
  const [paymentMethod, setPaymentMethod] = useState<"card" | "yape" | "pagoefectivo">("card");
  const [cardNumber, setCardNumber] = useState<string>("4557 •••• •••• 9012");
  const [cardHolder, setCardHolder] = useState<string>("ALEXIS BALDEON");
  const [cardExpiry, setCardExpiry] = useState<string>("12/28");
  const [cardCvc, setCardCvc] = useState<string>("342");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // =========================================================================
  // ESTADOS DEL VALIDADOR QR DE PUERTA (SCANNER PRO)
  // =========================================================================
  const [scannerStatus, setScannerStatus] = useState<"idle" | "scanning" | "success" | "already_used" | "invalid" | "wrong_gate">("idle");
  const [scannedTicket, setScannedTicket] = useState<{
    code: string;
    attendee: string;
    dni: string;
    zone: string;
    color: string;
    gate: string;
    firstScannedAt?: string;
  } | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [autoResetDelay, setAutoResetDelay] = useState<number>(3);
  const [countdown, setCountdown] = useState<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = useTransition();

  // Actualizar cantidad de asistentes cuando cambia ticketQuantity
  useEffect(() => {
    setAttendees((prev) => {
      const next = [...prev];
      while (next.length < ticketQuantity) {
        next.push({
          fullName: "",
          docType: "DNI",
          docNumber: "",
          email: "",
        });
      }
      return next.slice(0, ticketQuantity);
    });
  }, [ticketQuantity]);

  // Temporizador de reserva de compra regresivo
  useEffect(() => {
    if (step === 4) return; // Detener en confirmación
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Formato mm:ss
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cálculos Financieros
  const currentZone = AVAILABLE_ZONES.find((z) => z.id === selectedZoneId) || AVAILABLE_ZONES[0];
  const unitPrice = currentZone.priceDiscount;
  const subtotal = unitPrice * ticketQuantity;
  const ticketingFee = Math.round(subtotal * 0.08 * 10) / 10; // 8% fee
  const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const totalToPay = Math.max(0, subtotal + ticketingFee - discountAmount);

  // Aplicar cupón
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const found = VALID_COUPONS[code];
    if (found) {
      let calculated = 0;
      if (found.discountPercent) {
        calculated = (subtotal * found.discountPercent) / 100;
      } else if (found.discountFixed) {
        calculated = Math.min(found.discountFixed, subtotal);
      }
      setAppliedCoupon({
        code,
        label: found.label,
        amount: Math.round(calculated * 10) / 10,
      });
      setCouponInput("");
    } else {
      setCouponError("Código inválido o expirado. Prueba con FESTIVAL10 o QPH25.");
    }
  };

  // Procesar Pago Simulado
  const handleProcessPayment = () => {
    if (!acceptTerms) {
      alert("Debes aceptar los Términos y Condiciones para continuar.");
      return;
    }
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setStep(4);
    }, 1800);
  };

  // Sonidos sintéticos para el validador QR
  const playFeedbackSound = (type: "success" | "error" | "warning") => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(160, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === "warning") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(650, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // Ignorar restricciones de audio del navegador
    }
  };

  const handleSimulateScan = (scenario: "vip" | "general" | "used" | "invalid" | "wrongGate") => {
    setScannerStatus("scanning");
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setTimeout(() => {
      startTransition(() => {
        if (scenario === "vip") {
          setScannedTicket({
            code: "QPH-2026-VIP-9821",
            attendee: attendees[0]?.fullName || "Alexis Baldeón",
            dni: attendees[0]?.docNumber || "73849102",
            zone: "Zona VIP Gold",
            color: "#f59e0b",
            gate: "Puerta 01 - Acceso Preferencial",
          });
          setScannerStatus("success");
          playFeedbackSound("success");
        } else if (scenario === "general") {
          setScannedTicket({
            code: "QPH-2026-GEN-4310",
            attendee: attendees[1]?.fullName || "Camila Navarro",
            dni: attendees[1]?.docNumber || "47129845",
            zone: "Sector General A",
            color: "#6366f1",
            gate: "Puerta 02 - Acceso Sur",
          });
          setScannerStatus("success");
          playFeedbackSound("success");
        } else if (scenario === "used") {
          setScannedTicket({
            code: "QPH-2026-GEN-1109",
            attendee: "Renzo Morales Castro",
            dni: "71245678",
            zone: "Sector General B",
            color: "#6366f1",
            gate: "Puerta 02",
            firstScannedAt: "Hoy a las 20:18:22 (Hace 28 min)",
          });
          setScannerStatus("already_used");
          playFeedbackSound("error");
        } else if (scenario === "invalid") {
          setScannedTicket(null);
          setScannerStatus("invalid");
          playFeedbackSound("error");
        } else if (scenario === "wrongGate") {
          setScannedTicket({
            code: "QPH-2026-BOX-0042",
            attendee: "Fiorella Vega Mendoza",
            dni: "74019283",
            zone: "Box Platino Norte",
            color: "#8b5cf6",
            gate: "Puerta 04 - Acceso Exclusivo Boxes",
          });
          setScannerStatus("wrong_gate");
          playFeedbackSound("warning");
        }

        if (autoResetDelay > 0) {
          setCountdown(autoResetDelay);
          countdownIntervalRef.current = setInterval(() => {
            setCountdown((c) => (c <= 1 ? 0 : c - 1));
          }, 1000);
          timerRef.current = setTimeout(() => {
            setScannerStatus("idle");
            setScannedTicket(null);
            setCountdown(0);
          }, autoResetDelay * 1000);
        }
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* =========================================================================
          CABECERA GLOBAL DEL SANDBOX: SWITCHER DE MÓDULOS UX
         ========================================================================= */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo y Marca */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <span className="material-symbols-outlined text-xl">confirmation_number</span>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                queplanes<span className="text-indigo-400">hoy</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  UX Sandbox
                </span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Prototipado interactivo de Flujo de Compra y Control de Acceso
              </span>
            </div>
          </div>

          {/* Navegación Switcher de Módulos */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveModule("checkout")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeModule === "checkout"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
              <span>1. Flujo de Compra</span>
            </button>

            <button
              onClick={() => setActiveModule("scanner")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeModule === "scanner"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">qr_code_scanner</span>
              <span>2. Validador QR (Puerta)</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MÓDULO A: PANTALLA DE FLUJO DE COMPRA (CHECKOUT EXPERIENCE PRO)
         ========================================================================= */}
      {activeModule === "checkout" && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          
          {/* BANNER TEMPORIZADOR DE RESERVA GARANTIZADA (URGENCIA POSITIVA) */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <span className="material-symbols-outlined text-2xl animate-pulse">timer</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tus entradas están reservadas temporalmente</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                    Aforo Bloqueado
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Completa tu compra antes de que expire el tiempo para no perder tus ubicaciones seleccionadas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Tiempo restante:</span>
              <span className="font-mono text-base font-extrabold text-amber-400 tracking-wider">
                {formatTimer(secondsRemaining)} min
              </span>
            </div>
          </div>

          {/* STEPPER VISUAL DE PROGRESO */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 pb-2">
            {[
              { num: 1, title: "1. Entradas", icon: "confirmation_number" },
              { num: 2, title: "2. Asistentes", icon: "badge" },
              { num: 3, title: "3. Pago y Cupón", icon: "credit_card" },
              { num: 4, title: "4. Confirmación", icon: "verified" },
            ].map((s) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div
                  key={s.num}
                  onClick={() => s.num < step && setStep(s.num as CheckoutStep)}
                  className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-all ${
                    s.num < step ? "cursor-pointer hover:bg-slate-800" : ""
                  } ${
                    isCurrent
                      ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                      : isPassed
                      ? "bg-slate-900 border-slate-700 text-emerald-400"
                      : "bg-slate-900/40 border-slate-800/60 text-slate-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : isPassed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isPassed ? <span className="material-symbols-outlined text-sm">check</span> : s.num}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline truncate">{s.title}</span>
                </div>
              );
            })}
          </div>

          {/* CONTENEDOR PRINCIPAL: FORMULARIO Y RESUMEN LATERAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* -------------------------------------------------------------------
                COLUMNA IZQUIERDA (PASOS 1, 2, 3 O CONFIRMACIÓN)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* =================================================================
                  PASO 1: SELECCIÓN DE ENTRADAS Y ZONAS
                 ================================================================= */}
              {step === 1 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400">place</span>
                      <span>Selecciona tu Zona y Entradas</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Elige la localidad deseada y la cantidad de boletos que deseas reservar (máximo 4 por compra).
                    </p>
                  </div>

                  {/* Selector de Zonas */}
                  <div className="space-y-3">
                    {AVAILABLE_ZONES.map((zone) => {
                      const isSelected = selectedZoneId === zone.id;
                      return (
                        <div
                          key={zone.id}
                          onClick={() => setSelectedZoneId(zone.id)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? "bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-4 h-4 rounded-full mt-1 shrink-0 ring-4 ring-slate-800"
                              style={{ backgroundColor: zone.color }}
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white">{zone.name}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800">
                                  {zone.badge}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{zone.description}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-medium">
                                <span className="material-symbols-outlined text-xs text-indigo-400">door_front</span>
                                <span>{zone.gate}</span>
                                <span>•</span>
                                <span className="text-emerald-400">🔥 Solo {zone.availableTickets} disponibles</span>
                              </div>
                            </div>
                          </div>

                          {/* Precios */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                            <span className="text-xs text-slate-500 line-through">
                              S/ {zone.priceRegular.toFixed(2)}
                            </span>
                            <span className="text-lg font-black text-white">
                              S/ {zone.priceDiscount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400">por entrada</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selector de Cantidad */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Cantidad de Entradas:</span>
                      <span className="text-[11px] text-slate-500">Máximo 4 boletos por usuario</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTicketQuantity((q) => Math.max(1, q - 1))}
                        disabled={ticketQuantity <= 1}
                        className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center font-bold text-base cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-base font-bold text-white w-6 text-center">
                        {ticketQuantity}
                      </span>
                      <button
                        onClick={() => setTicketQuantity((q) => Math.min(4, q + 1))}
                        disabled={ticketQuantity >= 4}
                        className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center font-bold text-base cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
                  >
                    <span>Continuar con Datos de Asistentes</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* =================================================================
                  PASO 2: NOMINACIÓN DE ASISTENTES (REQUISITO LEGAL DNI)
                 ================================================================= */}
              {step === 2 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400">badge</span>
                        <span>Nominación Obligatoria de Entradas</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Por normativa de seguridad en espectáculos masivos, cada boleto se vincula al DNI del asistente.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setAttendees((prev) =>
                          prev.map((a, i) =>
                            i === 0
                              ? { fullName: "Alexis Baldeón", docType: "DNI", docNumber: "73849102", email: "alexis@ejemplo.com" }
                              : a
                          )
                        );
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800/80 cursor-pointer shrink-0"
                    >
                      ⚡ Copiar mis datos al Boleto 1
                    </button>
                  </div>

                  {/* Formulario por cada Entrada */}
                  <div className="space-y-4">
                    {attendees.map((attendee, index) => (
                      <div
                        key={index}
                        className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[10px] font-extrabold">
                              {index + 1}
                            </span>
                            <span>Entrada {index + 1} — {currentZone.name}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {index === 0 ? "Titular de Compra" : "Acompañante"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          {/* Nombres */}
                          <div className="sm:col-span-6">
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Nombres y Apellidos Completos:
                            </label>
                            <input
                              type="text"
                              value={attendee.fullName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAttendees((arr) =>
                                  arr.map((item, idx) => (idx === index ? { ...item, fullName: val } : item))
                                );
                              }}
                              placeholder="Ej: Alexis Baldeón"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Tipo Doc */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Doc:
                            </label>
                            <select
                              value={attendee.docType}
                              onChange={(e) => {
                                const val = e.target.value as Attendee["docType"];
                                setAttendees((arr) =>
                                  arr.map((item, idx) => (idx === index ? { ...item, docType: val } : item))
                                );
                              }}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value="DNI">DNI</option>
                              <option value="CE">C.E.</option>
                              <option value="PASAPORTE">Pasaporte</option>
                            </select>
                          </div>

                          {/* Número Doc */}
                          <div className="sm:col-span-4">
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Número de Documento:
                            </label>
                            <input
                              type="text"
                              value={attendee.docNumber}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAttendees((arr) =>
                                  arr.map((item, idx) => (idx === index ? { ...item, docNumber: val } : item))
                                );
                              }}
                              placeholder="73849102"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botones de Navegación */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      <span>Volver a Entradas</span>
                    </button>

                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition active:scale-98"
                    >
                      <span>Continuar al Pago</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================
                  PASO 3: CUPONES, MÉTODO DE PAGO Y CONFIRMACIÓN LEGAL
                 ================================================================= */}
              {step === 3 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
                  
                  {/* SECCIÓN CUPÓN DE DESCUENTO */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-amber-400 text-lg">local_activity</span>
                      <span className="text-xs font-bold text-white">¿Tienes un cupón de descuento?</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <div>
                            <strong className="font-mono">{appliedCoupon.code}</strong>: {appliedCoupon.label}
                          </div>
                        </div>
                        <button
                          onClick={() => setAppliedCoupon(null)}
                          className="text-emerald-400 hover:text-white font-semibold underline text-[11px] cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Ingresa código (ej: FESTIVAL10 o QPH25)"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Aplicar
                        </button>
                      </form>
                    )}

                    {couponError && <p className="text-[11px] text-rose-400 mt-1.5">{couponError}</p>}
                  </div>

                  {/* SECCIÓN MÉTODOS DE PAGO */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400">payments</span>
                      <span>Selecciona tu Medio de Pago Seguro</span>
                    </h3>

                    {/* Tabs de Medio de Pago */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      {[
                        { id: "card", title: "Tarjeta Crédito/Débito", icon: "credit_card" },
                        { id: "yape", title: "Yape / Plin (QR)", icon: "qr_code_2" },
                        { id: "pagoefectivo", title: "PagoEfectivo / CIP", icon: "account_balance" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition cursor-pointer ${
                            paymentMethod === m.id
                              ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                          <span className="text-xs font-semibold">{m.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Contenido según método de pago */}
                    {paymentMethod === "card" && (
                      <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                        {/* Previsualización visual de Tarjeta */}
                        <div className="w-full max-w-sm mx-auto h-40 rounded-2xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-slate-900 p-4 flex flex-col justify-between text-white shadow-xl relative overflow-hidden border border-indigo-400/30">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-xs tracking-wider uppercase text-indigo-200">
                              Boleto Seguro QPH
                            </span>
                            <span className="material-symbols-outlined text-2xl">contactless</span>
                          </div>
                          <div className="font-mono text-base tracking-widest font-bold drop-shadow">
                            {cardNumber}
                          </div>
                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <span className="text-[9px] text-indigo-300 block">Titular:</span>
                              <span className="font-bold">{cardHolder}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-indigo-300 block">Vence:</span>
                              <span className="font-mono font-bold">{cardExpiry}</span>
                            </div>
                          </div>
                        </div>

                        {/* Campos de Tarjeta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Número de Tarjeta (Visa / Mastercard / Amex):
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-400 mb-1">
                              Nombre en la Tarjeta:
                            </label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                                Expiración:
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                                CVC / CVV:
                              </label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "yape" && (
                      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 text-center flex flex-col items-center">
                        <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center mb-3">
                          <span className="material-symbols-outlined text-slate-900 text-7xl">
                            qr_code_2
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-purple-400">Escanea desde tu app Yape o Plin</h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">
                          Abre tu billetera móvil, selecciona escanear y confirma el monto exacto de{" "}
                          <strong className="text-white">S/ {totalToPay.toFixed(2)}</strong>.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "pagoefectivo" && (
                      <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Código de Pago CIP:</span>
                          <strong className="font-mono text-amber-400 text-sm">4910-2814-99</strong>
                        </div>
                        <p className="text-xs text-slate-400">
                          Puedes pagar desde la app de tu banco (BCP, BBVA, Interbank, Scotiabank) en la sección
                          &quot;Pago de Servicios &gt; PagoEfectivo&quot;.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Términos y Condiciones Legales */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-300">
                        Acepto los Términos y Condiciones del Concierto, la Política de Privacidad de Qué Planes Hoy y
                        certifico que todos los asistentes son mayores de 18 años (+18).
                      </span>
                    </label>
                  </div>

                  {/* Botones */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      <span>Volver a Asistentes</span>
                    </button>

                    <button
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment || !acceptTerms}
                      className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition active:scale-98"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Procesando Pago Seguro...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">lock</span>
                          <span>Pagar S/ {totalToPay.toFixed(2)} y Emitir Entradas</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================
                  PASO 4: CONFIRMACIÓN Y EMISIÓN DIGITAL DE ENTRADAS (TICKET QR)
                 ================================================================= */}
              {step === 4 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-center animate-in fade-in zoom-in-95">
                  {/* Header de Éxito */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 mb-3">
                      <span className="material-symbols-outlined text-4xl font-black">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black text-white">¡Compra Exitosa! 🎉</h2>
                    <p className="text-xs text-slate-300 max-w-md mt-1">
                      Tus entradas han sido emitidas y firmadas digitalmente con criptografía Ed25519. Te hemos
                      enviado un respaldo a <strong className="text-white">alexis@ejemplo.com</strong>.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                        Orden: ORD-2026-94812
                      </span>
                    </div>
                  </div>

                  {/* PREVISUALIZACIÓN DE BOLETO DIGITAL NOMINATIVO */}
                  <div className="w-full max-w-lg mx-auto bg-slate-950 rounded-3xl border-2 border-slate-800 p-6 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden">
                    <div
                      className="absolute top-0 inset-x-0 h-2"
                      style={{ backgroundColor: currentZone.color }}
                    />

                    <div className="flex justify-between items-start pt-2">
                      <div>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 inline-block mb-1.5"
                          style={{ backgroundColor: currentZone.color }}
                        >
                          {currentZone.name}
                        </span>
                        <h4 className="text-base font-extrabold text-white">
                          Corazón Serrano en Concierto - Gira 2026
                        </h4>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Sábado 24 de Octubre, 20:00 hrs • Estadio Nacional
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-dashed border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Titular:</span>
                        <strong className="text-white font-bold">{attendees[0]?.fullName || "Alexis Baldeón"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Documento:</span>
                        <span className="font-mono text-slate-200">
                          {attendees[0]?.docType} {attendees[0]?.docNumber || "73849102"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Acceso / Puerta:</span>
                        <span className="text-amber-300 font-semibold">{currentZone.gate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Código Boleto:</span>
                        <span className="font-mono text-indigo-300 font-bold">QPH-2026-VIP-9821</span>
                      </div>
                    </div>

                    {/* Simulación del Código QR Criptográfico */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                      <div className="w-28 h-28 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                        <span className="material-symbols-outlined text-slate-950 text-7xl">
                          qr_code_2
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                          <span className="material-symbols-outlined text-base">verified</span>
                          <span>Firma Digital Ed25519 Válida</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Presenta este código QR desde tu celular al llegar a la puerta. No necesitas imprimirlo.
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4
                        </span>
                      </div>
                    </div>

                    {/* Acciones de Boleto */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => alert("Descargando PDF oficial de entradas nominadas...")}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        <span>Descargar PDF</span>
                      </button>

                      <button
                        onClick={() => alert("Entrada sincronizada con Apple / Google Wallet.")}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">wallet</span>
                        <span>Añadir a Wallet</span>
                      </button>
                    </div>
                  </div>

                  {/* Botón para Probar Escaneo en Puerta */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveModule("scanner");
                        handleSimulateScan("vip");
                      }}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                      <span>Simular Escaneo de este Boleto en Puerta</span>
                    </button>

                    <button
                      onClick={() => {
                        setStep(1);
                        setSecondsRemaining(600);
                        setAppliedCoupon(null);
                      }}
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Reiniciar Flujo de Compra
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------------
                COLUMNA DERECHA (RESUMEN DE COMPRA STICKY / LATERAL)
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-4 flex flex-col gap-5 sticky top-20">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                
                {/* Resumen del Evento */}
                <div className="pb-3 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-1">
                    Evento Seleccionado
                  </span>
                  <h4 className="text-sm font-black text-white leading-snug">
                    Corazón Serrano en Concierto - Gira 2026
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                    <span className="material-symbols-outlined text-sm text-indigo-400">calendar_month</span>
                    <span>Sáb 24 Oct, 20:00 hrs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <span className="material-symbols-outlined text-sm text-indigo-400">stadium</span>
                    <span>Estadio Nacional de Lima</span>
                  </div>
                </div>

                {/* Desglose Financiero */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>
                      {currentZone.name} (x{ticketQuantity})
                    </span>
                    <span className="font-mono font-semibold">S/ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Comisión de Servicio (8%)</span>
                    <span className="font-mono">S/ {ticketingFee.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-400 font-semibold">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span className="font-mono">- S/ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      <span className="text-xs text-slate-400 block">Total a Pagar:</span>
                      <span className="text-[10px] text-slate-500">Impuestos y comisión incluidos</span>
                    </div>
                    <span className="text-2xl font-black text-white font-mono">
                      S/ {totalToPay.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Garantías de Seguridad */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-base">lock</span>
                    <span>Pago Encriptado TLS 256-Bit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400 text-base">verified_user</span>
                    <span>Entradas oficiales antifraude nominadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MÓDULO B: PANTALLA DE CONTROL DE ACCESOS Y VALIDACIÓN QR (PUERTA)
         ========================================================================= */}
      {activeModule === "scanner" && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* VISOR DE ESCANEO */}
          <section className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col aspect-[9/14] sm:aspect-[3/4] md:aspect-[9/14]">
              
              {/* Barra de Cámara */}
              <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold tracking-wider uppercase text-white/90 drop-shadow">
                    Puerta 01 • En Vivo
                  </span>
                </div>

                <button
                  onClick={() => setIsTorchOn(!isTorchOn)}
                  className={`p-2.5 rounded-full transition-all backdrop-blur-md cursor-pointer flex items-center justify-center ${
                    isTorchOn
                      ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/50 scale-105"
                      : "bg-black/40 text-white/80 hover:bg-black/60 border border-white/20"
                  }`}
                  title="Activar Linterna"
                >
                  <span className="material-symbols-outlined text-xl">
                    {isTorchOn ? "flashlight_on" : "flashlight_off"}
                  </span>
                </button>
              </div>

              {/* Fondo del visor */}
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                <div className="relative w-64 h-64 border-2 border-dashed border-indigo-400/40 rounded-3xl flex items-center justify-center">
                  <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                  <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
                  <div className="absolute inset-x-2 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse top-1/2 -translate-y-1/2" />

                  {scannerStatus === "idle" && (
                    <div className="text-center px-4">
                      <span className="material-symbols-outlined text-4xl text-indigo-400 mb-1">
                        qr_code_scanner
                      </span>
                      <p className="text-xs font-semibold text-slate-300">Apunta al código QR</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal de Feedback */}
              {scannerStatus !== "idle" && scannerStatus !== "scanning" && (
                <div className="absolute inset-0 z-30 flex flex-col justify-end p-4 bg-black/60 backdrop-blur-md">
                  <div
                    className={`w-full rounded-2xl p-5 shadow-2xl border-2 flex flex-col gap-3 ${
                      scannerStatus === "success"
                        ? "bg-slate-900 border-emerald-500 text-white"
                        : scannerStatus === "already_used"
                        ? "bg-slate-900 border-red-500 text-white"
                        : scannerStatus === "wrong_gate"
                        ? "bg-slate-900 border-amber-500 text-white"
                        : "bg-slate-900 border-rose-600 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3 className="font-extrabold text-lg uppercase">
                        {scannerStatus === "success" && "¡Acceso Autorizado!"}
                        {scannerStatus === "already_used" && "¡Boleto Ya Canjeado!"}
                        {scannerStatus === "wrong_gate" && "¡Puerta Incorrecta!"}
                        {scannerStatus === "invalid" && "Boleto Inválido"}
                      </h3>
                      {scannedTicket && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-black text-slate-950 uppercase"
                          style={{ backgroundColor: scannedTicket.color }}
                        >
                          {scannedTicket.zone}
                        </span>
                      )}
                    </div>

                    {scannedTicket && (
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Asistente:</span>
                          <strong>{scannedTicket.attendee}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">DNI:</span>
                          <span className="font-mono">{scannedTicket.dni}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Código:</span>
                          <span className="font-mono text-indigo-300 font-bold">{scannedTicket.code}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Puerta:</span>
                          <span>{scannedTicket.gate}</span>
                        </div>
                        {scannedTicket.firstScannedAt && (
                          <div className="col-span-2 text-red-300 font-bold text-[11px] mt-1">
                            ⚠️ Primer escaneo registrado: {scannedTicket.firstScannedAt}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setScannerStatus("idle")}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Siguiente Boleto {countdown > 0 && `(${countdown}s)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* PANEL DE PRUEBAS SANDBOX */}
          <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400">tune</span>
              <span>Disparador de Escaneos de Prueba</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSimulateScan("vip")}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-amber-400 cursor-pointer text-xs"
              >
                <strong className="text-amber-400 block">Pase VIP Válido</strong>
                <span className="text-[10px] text-slate-400">Puerta 01 • Autorizado</span>
              </button>

              <button
                onClick={() => handleSimulateScan("general")}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-emerald-400 cursor-pointer text-xs"
              >
                <strong className="text-emerald-400 block">Pase General Válido</strong>
                <span className="text-[10px] text-slate-400">Sector General A</span>
              </button>

              <button
                onClick={() => handleSimulateScan("used")}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-red-400 cursor-pointer text-xs"
              >
                <strong className="text-red-400 block">Boleto Duplicado</strong>
                <span className="text-[10px] text-slate-400">Ya canjeado hace 28 min</span>
              </button>

              <button
                onClick={() => handleSimulateScan("wrongGate")}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 hover:border-amber-400 cursor-pointer text-xs"
              >
                <strong className="text-amber-300 block">Puerta Incorrecta</strong>
                <span className="text-[10px] text-slate-400">Redirigir a Puerta 04 Boxes</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
