"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PaymentSuccessScreen from "./payment-success-screen";
import CheckoutStepper from "./components/checkout-stepper";
import VenueZonesMap from "./components/venue-zones-map";
import { getEventDetailUseCase } from "../../events";
import { EventDetailModel } from "../../events/models/event-detail.model";
import { getCurrentUserUseCase } from "../../auth";
import { UserModel } from "../../auth/models/user.model";
import { apiClient } from "@/app/common/services/api-client";
import { simulateCheckoutUseCase, getMyOrdersUseCase, SimulateCheckoutResponseModel } from "../index";

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
  maxTicketsPerOrder?: number;
  maxTicketsPerUser?: number;
  remainingTickets?: number;
}

interface ShowFunction {
  id: string;
  dateStr: string;
  timeStr: string;
  statusText: string;
  statusType: "available" | "last_passes" | "sold_out";
}

const DEFAULT_SHOW_FUNCTIONS: ShowFunction[] = [
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
];

const DEFAULT_TICKET_TIERS: TicketTier[] = [
  {
    id: "platinum-vip",
    name: "Platinum VIP Experience",
    badge: "Últimas 12 uds",
    badgeColor: "bg-amber-100 text-amber-800",
    description:
      "Front Stage exclusivo junto al DJ, acceso prioritario sin colas, barra libre premium y acreditación conmemorativa.",
    price: 120,
    available: true,
    quantity: 1,
    colorHex: "#4F46E5",
  },
  {
    id: "general-pista",
    name: "General Pista",
    badge: "Disponible",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description:
      "Acceso general al recinto y pista central con visibilidad directa al espectáculo en vivo.",
    price: 65,
    available: true,
    quantity: 0,
    colorHex: "#7C3AED",
  },
];

export default function PurchaseFlowPageComponent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const zoneId = searchParams.get("zoneId");

  // --- NAVEGACIÓN ENTRE PASOS (1: Selección de Entradas, 2: Pasarela de Pagos, 3: Confirmación) ---
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>("f1");

  // Estado dinámico del evento
  const [event, setEvent] = useState<EventDetailModel | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<boolean>(Boolean(eventId));

  // Temporizador de Reserva regresivo (14:59 min)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(899);

  // Lista de Funciones y Zonas Dinámicas
  const [showFunctions, setShowFunctions] = useState<ShowFunction[]>(DEFAULT_SHOW_FUNCTIONS);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(DEFAULT_TICKET_TIERS);

  // Método de pago en Paso 2
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "yape" | "transfer" | "apple_pay" | "google_pay"
  >("yape");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [forceFailureTest, setForceFailureTest] = useState<boolean>(false);
  const [checkoutResult, setCheckoutResult] = useState<SimulateCheckoutResponseModel | null>(null);

  // Usuario autenticado en sesión y entradas ya compradas para este evento
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [alreadyPurchasedTicketsCount, setAlreadyPurchasedTicketsCount] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Sincronizar sesión activa del comprador
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qph_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch { }

    getCurrentUserUseCase.execute().match(
      (user) => {
        setCurrentUser(user);
      },
      () => { }
    );
  }, []);

  // Consultar historial de entradas ya compradas por el usuario para este evento
  useEffect(() => {
    getMyOrdersUseCase.execute().then((res) => {
      res.match(
        (orders) => {
          let count = 0;
          (orders || []).forEach((o) => {
            const matchesEvent =
              (event && o.eventTitle && o.eventTitle.trim().toLowerCase() === event.name.trim().toLowerCase()) ||
              (eventId && String(o.orderId).includes(eventId));
            if (matchesEvent) {
              count += o.ticketCount || o.tickets?.length || 0;
            }
          });
          setAlreadyPurchasedTicketsCount(count);
        },
        () => { }
      );
    });
  }, [event, eventId]);

  // Carga de información del evento si viene eventId en la URL
  useEffect(() => {
    if (!eventId) {
      setLoadingEvent(false);
      return;
    }

    let isMounted = true;
    setLoadingEvent(true);

    getEventDetailUseCase.execute(eventId).match(
      (data) => {
        if (!isMounted) return;
        setEvent(data);

        // 1. Mapear funciones si existen
        if (data.shows && data.shows.length > 0) {
          const mappedShows: ShowFunction[] = data.shows.map((show) => {
            const d = new Date(show.startTime);
            const dateStr = d.toLocaleDateString("es-PE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            const timeStr =
              d.toLocaleTimeString("es-PE", {
                hour: "2-digit",
                minute: "2-digit",
              }) + "h";
            return {
              id: show.publicUuid || show.id,
              dateStr: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
              timeStr,
              statusText: "Entradas disp.",
              statusType: "available",
            };
          });
          setShowFunctions(mappedShows);
          setSelectedFunctionId(mappedShows[0].id);
        }

        // 2. Mapear zonas con preselección inteligente de zoneId (soporta publicUuid o ID)
        if (data.zones && data.zones.length > 0) {
          const mappedTiers: TicketTier[] = data.zones.map((zone) => {
            const isTarget = zoneId ? (zone.id === zoneId || zone.publicUuid === zoneId) : false;
            return {
              id: zone.publicUuid || zone.id,
              name: zone.name,
              badge: zone.activeTierName || "Disponible",
              badgeColor: zone.isSoldOut
                ? "bg-red-100 text-red-800"
                : "bg-emerald-100 text-emerald-800",
              description:
                zone.benefits || `Acceso oficial garantizado para la localidad ${zone.name}`,
              price: Number(zone.currentPrice),
              available: !zone.isSoldOut,
              quantity: isTarget && !zone.isSoldOut ? 1 : 0,
              colorHex: zone.color || "#4F46E5",
              maxTicketsPerOrder: zone.maxTicketsPerOrder || 6,
              maxTicketsPerUser: zone.maxTicketsPerUser || 10,
              remainingTickets: zone.remainingTickets,
            };
          });

          // Si vino zoneId pero no coincidió o ninguna tiene cantidad, seleccionar 1 de la primera disponible
          const hasSelected = mappedTiers.some((t) => t.quantity > 0);
          if (!hasSelected) {
            const firstAvail = mappedTiers.find((t) => t.available);
            if (firstAvail) {
              firstAvail.quantity = 1;
            }
          }

          setTicketTiers(mappedTiers);
        }

        setLoadingEvent(false);
      },
      () => {
        if (!isMounted) return;
        setLoadingEvent(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [eventId, zoneId]);

  // Límites oficiales de entradas por persona
  const eventUserTicketLimit = event?.userTicketLimit ?? 4;
  const remainingUserQuotaForEvent = Math.max(0, eventUserTicketLimit - alreadyPurchasedTicketsCount);

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

  // Manejo de cantidades (+ / -) con validación estricta de límites por compra y por evento
  const handleQuantityChange = (tierId: string, delta: number) => {
    setTicketTiers((prev) => {
      const target = prev.find((t) => t.id === tierId);
      if (!target || !target.available) return prev;

      const currentTotalExcludingTarget = prev
        .filter((t) => t.id !== tierId)
        .reduce((sum, t) => sum + t.quantity, 0);

      const zoneMaxPerOrder = target.maxTicketsPerOrder ?? 6;
      const effectiveMaxForThisTier = Math.min(
        zoneMaxPerOrder,
        target.remainingTickets ?? 999,
        Math.max(0, remainingUserQuotaForEvent - currentTotalExcludingTarget)
      );

      const newQty = Math.max(0, Math.min(effectiveMaxForThisTier, target.quantity + delta));
      return prev.map((tier) => (tier.id === tierId ? { ...tier, quantity: newQty } : tier));
    });
  };

  // Cálculos de Totales en Soles (PEN)
  const totalTickets = ticketTiers.reduce((acc, t) => acc + t.quantity, 0);
  const subtotal = ticketTiers.reduce((acc, t) => acc + t.price * t.quantity, 0);
  // El precio de la entrada ya incluye el servicio definido al crear el evento (sin cobro duplicado)
  const grandTotal = subtotal;

  const selectedFunction =
    showFunctions.find((f) => f.id === selectedFunctionId) || showFunctions[0];

  const primarySelectedTier = ticketTiers.find((t) => t.quantity > 0) || ticketTiers[0];

  // Referencia al contenedor del botón de acción del resumen para detectar visibilidad en móvil (Paso 1 y Paso 2)
  const summaryCtaContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSummaryCtaVisible, setIsSummaryCtaVisible] = useState<boolean>(false);

  useEffect(() => {
    if (currentStep === 3) {
      setIsSummaryCtaVisible(false);
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const target = summaryCtaContainerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSummaryCtaVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [currentStep, ticketTiers, loadingEvent]);

  // Mostrar el footer flotante en móvil en pasos 1 y 2 mientras no sea visible el botón oficial del resumen
  const showMobileOrderFooter = (currentStep === 1 || currentStep === 2) && !isSummaryCtaVisible;

  // Auto-scroll hacia la sección de método de pago al ingresar al Paso 2
  useEffect(() => {
    if (currentStep === 2) {
      const timer = setTimeout(() => {
        const paymentSection = document.getElementById("payment-methods-section");
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Lógica para avanzar al Paso 2 desde el botón nativo o desde el footer flotante móvil
  const handleProceedToStep2 = () => {
    if (totalTickets === 0) {
      alert("Por favor selecciona al menos una entrada para continuar.");
      return;
    }
    if (totalTickets > remainingUserQuotaForEvent) {
      alert(
        `Has superado el límite de ${eventUserTicketLimit} entradas para este evento. Te quedan ${remainingUserQuotaForEvent} disponible(s).`
      );
      return;
    }
    const activeToken = apiClient.getToken();
    if (!activeToken || !currentUser) {
      setShowAuthModal(true);
      return;
    }
    setCurrentStep(2);
    setTimeout(() => {
      const paymentSection = document.getElementById("payment-methods-section");
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Simulación de Envío de Pago mediante la Pasarela Oficial
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTickets === 0) {
      alert("Por favor selecciona al menos una entrada para continuar.");
      return;
    }

    // Exigir autenticación activa antes de proceder al pago
    const activeToken = apiClient.getToken();
    if (!activeToken || !currentUser) {
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const selectedItems = ticketTiers
      .filter((t) => t.quantity > 0)
      .map((t) => ({ zoneId: t.id, quantity: t.quantity }));

    const resolvedCustomerEmail = currentUser.email;
    const resolvedCustomerName = `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email;

    simulateCheckoutUseCase
      .execute({
        eventId: event ? (event.publicUuid || event.id) : eventId || "1",
        showId: selectedFunctionId,
        items: selectedItems,
        paymentMethod,
        customerEmail: resolvedCustomerEmail,
        customerName: resolvedCustomerName,
        forceFailure: forceFailureTest,
      })
      .match(
        (response) => {
          setIsProcessing(false);
          setCheckoutResult(response);
          setCurrentStep(3);
        },
        (error) => {
          setIsProcessing(false);
          if (error.code === 'UNAUTHORIZED' || error.message?.toLowerCase().includes('sesión')) {
            setShowAuthModal(true);
            return;
          }
          setPaymentError(
            error.message ||
            "La transacción ha sido rechazada por la pasarela de pagos. Por favor verifica tu saldo o prueba con otro medio de pago."
          );
        }
      );
  };

  const paymentMethodLabel = {
    card: "Tarjeta de crédito / débito (•••• 4829)",
    yape: "Yape / Plin Móvil Oficial",
    transfer: "PagoEfectivo / CIP Transferencia",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
  }[paymentMethod];

  // Pantalla de carga si se está cargando el evento
  if (loadingEvent) {
    return (
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
        <p className="text-xs text-on-surface-variant mt-1">Configurando zonas y accesos del evento</p>
      </div>
    );
  }

  // --- PASO 3: CONFIRMACIÓN EXITOSA ---
  if (currentStep === 3) {
    return (
      <PaymentSuccessScreen
        orderCode={checkoutResult ? checkoutResult.orderCode : `#QPH-${Math.floor(100000 + Math.random() * 900000)}`}
        userEmail={currentUser?.email || "comprador@queplaneshoy.com"}
        customerName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "Comprador Oficial QPH"}
        eventTitle={event ? event.name : "Evento Oficial"}
        categoryTag={event ? `${event.category} • Venta Oficial` : "Música en Vivo • Oficial"}
        bannerImageUrl={
          event?.bannerUrl ||
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB6zlOV5Dky2moZZwBSETqhUT5lhvjwGPa9jJGDrr1krL9Lx8Y4cFqyEjtp_ep-p-XDjKBTdINqn32bKAXlcfVJ0iTnh5Z2nin5LAEEHCum75H9xWBMzSYey9B_8rQxRHEOWCqOizX5JHNzZXbyPQiWaR2DBYAmA7kEL4btLbIxCzLN-_52Xuuk4dYbl8qvh89DpQmSEwN_SYN2pKZSOIl0T-8Ry-WFWoBS8y9Y0uW5XlDwgdnoI0SnVQ"
        }
        dateStr={selectedFunction ? selectedFunction.dateStr : "Fecha Confirmada"}
        timeStr={selectedFunction ? selectedFunction.timeStr : "Horario Oficial"}
        doorsOpenStr={event?.openingHoursComment || "Apertura 2 hrs antes"}
        venueName={event ? event.venue || "Recinto Oficial" : "Campo Ferial"}
        venueAccess={event?.entryRequirements || "Puerta Principal • Control QR Ed25519"}
        venueAddress={event ? `${event.address || ""}, ${event.city}` : "Ucayali, Perú"}
        coordinates={event?.coordinates || null}
        addressReference={event?.addressReference || null}
        city={event?.city || "Ucayali"}
        googleMapsUrl={event?.googleMapsUrl || null}
        zoneName={primarySelectedTier ? primarySelectedTier.name : "Zona General"}
        tierBadge={primarySelectedTier ? primarySelectedTier.name : "General"}
        ticketCount={checkoutResult ? checkoutResult.tickets.length : (totalTickets > 0 ? totalTickets : 1)}
        unitPrice={primarySelectedTier ? primarySelectedTier.price : 65}
        distributionFee={0}
        vatAmount={0}
        totalAmount={checkoutResult ? checkoutResult.totalAmount : (grandTotal > 0 ? grandTotal : (primarySelectedTier ? primarySelectedTier.price : 65))}
        paymentMethodText={paymentMethodLabel}
        txCode={checkoutResult ? checkoutResult.txCode : `TX-${Math.floor(100000 + Math.random() * 900000)}`}
        qrPayload={checkoutResult && checkoutResult.tickets.length > 0 ? checkoutResult.tickets[0].qrPayload : undefined}
        tickets={checkoutResult ? checkoutResult.tickets : []}
      />
    );
  }

  const eventTitle = event ? event.name : "Bareto en Concierto";
  const eventVenue = event ? `${event.venue || "Recinto Oficial"}, ${event.city}` : "Campo Ferial, Pucallpa";
  const eventBanner =
    event?.bannerUrl ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAvDbqbGnlbfqUeC8z7aI3S9qHtQrEg0HBuv40tjwOWpwyto7jUUN4aK6zHkyjFpgrQuCmYbnML65LyCOmt4qfAeTI0iyr2BVCmLgaCJy5sBpz6YzL3uZFZIH-KYQuDSVFbpbW2Y6TUpo9uKWoJ2zKmlgzeVlfID8YoiQklT8co4xHrZ6sDZeLPqiY-dRNUsdzl8wQ2M9YvHfLR7G5WFio3W-SCX1AidCHyLkxiMeElBOJP2LgUnEYlNJevy2WQSrRm2T5c0o7zVSlx";

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
              href={event ? `/events/${event.publicUuid || event.slug || event.id}` : "/"}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors pl-4 border-l border-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Volver al evento</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs font-semibold text-on-surface-variant hover:text-electric-indigo transition-colors hidden md:inline-block"
            >
              Cartelera
            </Link>
            <button
              onClick={() => alert("Soporte disponible en soporte@queplaneshoy.com")}
              className="flex items-center gap-2 text-on-surface-variant hover:text-electric-indigo transition-colors font-semibold text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="hidden sm:inline">Centro de Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTENIDO PRINCIPAL
         ========================================================================= */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-28 lg:pb-12">
        <div className="max-w-container-max mx-auto">
          {/* STEPPER DE PROGRESO DE 3 PASOS */}
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
                COLUMNA IZQUIERDA (PASO 1 O PASO 2)
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
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider truncate max-w-xs">
                        {eventVenue}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {showFunctions.map((fn) => {
                        const isSelected = selectedFunctionId === fn.id;
                        return (
                          <button
                            key={fn.id}
                            type="button"
                            onClick={() => setSelectedFunctionId(fn.id)}
                            className={`p-3.5 rounded-xl text-left transition-all relative cursor-pointer ${isSelected
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
                              className={`text-xs font-bold ${isSelected ? "text-electric-indigo" : "text-on-surface-variant"
                                }`}
                            >
                              {fn.dateStr}
                            </div>
                            <div className="font-extrabold text-deep-slate text-base mt-0.5">
                              {fn.timeStr}
                            </div>
                            <div className="text-[11px] mt-1 flex items-center gap-1 font-medium">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${fn.statusType === "last_passes" ? "bg-vip-gold" : "bg-emerald-500"
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

                  {/* Mapa Esquemático del Recinto / Zonas y Localidades (Alineado con Stitch) */}
                  <VenueZonesMap
                    venueName={event?.venue || "Recinto Oficial"}
                    zones={ticketTiers.map((tier) => ({
                      id: tier.id,
                      name: tier.name,
                      price: tier.price,
                      available: tier.available,
                      colorHex: tier.colorHex,
                      badge: tier.badge,
                    }))}
                    zoneMapImageUrl={event?.zoneMapUrl}
                    selectedZoneId={primarySelectedTier?.id}
                    onSelectZone={(selectedId) => {
                      setTicketTiers((prev) =>
                        prev.map((t) => {
                          if (t.id === selectedId && t.available) {
                            return { ...t, quantity: t.quantity > 0 ? t.quantity : 1 };
                          }
                          return t;
                        })
                      );
                    }}
                    occupancyPercentage={
                      event?.zones && event.zones.length > 0
                        ? Math.min(
                          98,
                          Math.max(
                            52,
                            Math.round(
                              ((event.zones.reduce(
                                (acc, z) => acc + (z.capacity - z.remainingTickets),
                                0
                              )) /
                                (event.zones.reduce((acc, z) => acc + z.capacity, 0) || 1)) *
                              100
                            )
                          )
                        )
                        : 88
                    }
                  />

                  {/* Banner Oficial de Límites por Persona / Antirreventa */}
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${remainingUserQuotaForEvent <= 0
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-electric-indigo/5 border-electric-indigo/20 text-deep-slate"
                    }`}>
                    <span className={`material-symbols-outlined text-lg shrink-0 mt-0.5 ${remainingUserQuotaForEvent <= 0 ? "text-rose-600" : "text-electric-indigo"
                      }`}>
                      {remainingUserQuotaForEvent <= 0 ? "block" : "verified_user"}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold">
                          {remainingUserQuotaForEvent <= 0
                            ? "Límite Oficial de Entradas Alcanzado"
                            : "Política Oficial de Venta Antirreventa QPH"}
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${remainingUserQuotaForEvent <= 0
                            ? "bg-rose-100 text-rose-700"
                            : "bg-electric-indigo/10 text-electric-indigo"
                          }`}>
                          Tope: {eventUserTicketLimit} entradas por persona
                        </span>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        {remainingUserQuotaForEvent <= 0 ? (
                          <strong className="text-rose-700 font-semibold block">
                            Ya cuentas con {alreadyPurchasedTicketsCount} entrada(s) registrada(s) para este evento. Se ha alcanzado el tope máximo permitido por persona ({eventUserTicketLimit}).
                          </strong>
                        ) : alreadyPurchasedTicketsCount > 0 ? (
                          <span>
                            Ya cuentas con <strong>{alreadyPurchasedTicketsCount} entrada(s)</strong> registrada(s). En esta orden puedes adquirir hasta un máximo de <strong>{remainingUserQuotaForEvent} entrada(s) más</strong>.
                          </span>
                        ) : (
                          <span>
                            Para garantizar un acceso equitativo y evitar la reventa, cada cliente puede adquirir hasta un máximo de <strong>{eventUserTicketLimit} entradas oficiales</strong> para este evento.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Selector de Tipos de Entradas y Cantidades */}
                  <div id="tickets-selector-section" className="space-y-4">
                    <h3 className="text-lg font-bold text-deep-slate">
                      Selecciona tus Entradas
                    </h3>

                    {ticketTiers.map((tier) => {
                      const isSelected = tier.quantity > 0;
                      const isPlusDisabled =
                        totalTickets >= remainingUserQuotaForEvent ||
                        tier.quantity >= (tier.maxTicketsPerOrder ?? 6) ||
                        tier.quantity >= (tier.remainingTickets ?? 999) ||
                        remainingUserQuotaForEvent <= 0;

                      return (
                        <div
                          key={tier.id}
                          className={`p-5 rounded-2xl border-2 transition-all relative ${!tier.available
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
                                S/. {tier.price.toFixed(2)}{" "}
                                <span className="text-xs text-platinum-silver font-normal">
                                  / entrada oficial
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
                                      disabled={isPlusDisabled}
                                      className="w-9 h-9 rounded-lg bg-electric-indigo text-white hover:bg-primary font-bold flex items-center justify-center shadow-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                      title={isPlusDisabled ? "Límite de entradas alcanzado" : "Añadir entrada"}
                                    >
                                      +
                                    </button>
                                  </div>

                                  <div className="text-right min-w-[90px]">
                                    <span className="block font-bold text-base text-deep-slate">
                                      S/. {(tier.price * tier.quantity).toFixed(2)}
                                    </span>
                                    <span className="text-[11px] text-platinum-silver">
                                      {tier.quantity} entradas
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                                  Agotado
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
                  PASO 2: PASARELA DE PAGOS Y MÉTODOS SEGUROS
                 ================================================================= */}
              {currentStep === 2 && (
                <div
                  id="payment-methods-section"
                  className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-surface-variant shadow-sm scroll-mt-24 md:scroll-mt-28"
                >
                  <div>
                    <h1 className="text-2xl font-black text-deep-slate mb-2">
                      Método de Pago
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                      Selecciona tu forma de pago preferida para emitir tus entradas oficiales.
                    </p>
                  </div>

                  {/* Alerta de Transacción Rechazada (Simulación de Fallo) */}
                  {paymentError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">
                        error
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">Transacción Rechazada por la Pasarela</h4>
                        <p className="text-xs text-red-700 mt-1">{paymentError}</p>
                        <p className="text-xs text-slate-600 mt-2">
                          💡 <strong>Tus entradas continúan reservadas:</strong> Puedes cambiar de método de pago (por ejemplo, seleccionar <strong>Yape</strong> o <strong>Tarjeta</strong>) y volver a pulsar &quot;Pagar Ahora&quot;.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentError(null)}
                        className="text-red-500 hover:text-red-800 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Toggle para pruebas de QA / Demostración */}
                  <div className="p-3 bg-surface-container-low rounded-xl border border-surface-variant/60 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                        science
                      </span>
                      <span className="font-semibold text-deep-slate">
                        Simulación de Pasarela
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        (80% Éxito / 20% Fallo aleatorio)
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-deep-slate">
                      <input
                        type="checkbox"
                        checked={forceFailureTest}
                        onChange={(e) => setForceFailureTest(e.target.checked)}
                        className="rounded text-electric-indigo focus:ring-electric-indigo cursor-pointer"
                      />
                      <span className={`text-[11px] ${forceFailureTest ? "text-red-600 font-extrabold" : "text-slate-600"}`}>
                        {forceFailureTest ? "Forzar fallo bancario" : "Forzar fallo para prueba"}
                      </span>
                    </label>
                  </div>

                  {/* Opciones de Métodos de Pago */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Yape / Plin */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("yape")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${paymentMethod === "yape"
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
                          <span className="text-xs text-on-surface-variant">Billetera móvil QR instantánea</span>
                        </div>
                      </div>
                      {paymentMethod === "yape" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>

                    {/* Tarjeta */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${paymentMethod === "card"
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
                            Tarjeta de Débito / Crédito
                          </span>
                          <span className="text-xs text-on-surface-variant">Visa, Mastercard, Diners, Amex</span>
                        </div>
                      </div>
                      {paymentMethod === "card" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>

                    {/* PagoEfectivo */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${paymentMethod === "transfer"
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
                            PagoEfectivo / Agentes
                          </span>
                          <span className="text-xs text-on-surface-variant">Código CIP para banca móvil y agentes</span>
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
                      className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${paymentMethod === "apple_pay"
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
                          <span className="text-xs text-on-surface-variant">Pago exprés con Face ID / Touch ID</span>
                        </div>
                      </div>
                      {paymentMethod === "apple_pay" && (
                        <span className="material-symbols-outlined text-electric-indigo">check_circle</span>
                      )}
                    </button>
                  </div>

                  {/* Datos del Titular de la Orden (Usuario en Sesión) */}
                  <div className="p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-bold text-electric-indigo uppercase tracking-wider">
                            Titular de las entradas
                          </p>
                          {currentUser && (
                            <span className="inline-block px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              Sesión Activa
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-deep-slate">
                          {currentUser
                            ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
                            : "Usuario Invitado"}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {currentUser?.email || "Las entradas se emitirán a tu cuenta"}
                        </p>
                      </div>
                    </div>
                    {!currentUser && (
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="text-xs font-bold text-electric-indigo hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Iniciar sesión <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    )}
                </div>

                  {/* Caja Informativa de Protección y Cifrado */}
                  <div className="p-6 bg-surface-container-low rounded-xl border border-surface-variant space-y-4 pt-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-electric-indigo/10 flex items-center justify-center text-electric-indigo shrink-0">
                        <span className="material-symbols-outlined text-[24px]">verified_user</span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-deep-slate text-sm font-bold">
                          Pasarela de pago oficial protegida y cifrada
                        </h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed">
                          Al confirmar, tus entradas se reservarán y se emitirán con garantía de acceso criptográfico Ed25519 intransferible.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 text-xs text-on-surface-variant border-t border-surface-variant">
                      <span className="material-symbols-outlined text-sm text-electric-indigo">lock</span>
                      <span>Cifrado TLS de 256 bits y certificación PCI DSS de máxima seguridad</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* -------------------------------------------------------------------
                COLUMNA DERECHA: STICKY ORDER SUMMARY
               ------------------------------------------------------------------- */}
            <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-surface-variant">
                {/* Mini Banner del Evento */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    alt={eventTitle}
                    className="w-full h-full object-cover"
                    src={eventBanner}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-slate to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="inline-block bg-electric-indigo text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mb-1">
                      {event?.category || "Venta Oficial"}
                    </span>
                    <h3 className="text-base text-white font-bold leading-tight line-clamp-1">
                      {eventTitle}
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
                      <span className="capitalize">
                        {selectedFunction.dateStr} • {selectedFunction.timeStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                      <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                        location_on
                      </span>
                      <span className="truncate">{eventVenue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                      <span className="material-symbols-outlined text-electric-indigo text-[18px]">
                        airline_seat_recline_extra
                      </span>
                      <span>
                        Zona:{" "}
                        {ticketTiers.find((t) => t.quantity > 0)?.name || "Ninguna zona seleccionada"}
                      </span>
                    </div>
                  </div>

                  {/* Desglose de Precios en Soles */}
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
                              S/. {t.price.toFixed(2)} por entrada
                            </span>
                          </div>
                          <span className="font-bold text-deep-slate">
                            S/. {(t.price * t.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}

                    {totalTickets === 0 && (
                      <p className="text-xs text-platinum-silver italic">
                        Aún no has añadido entradas a tu reserva.
                      </p>
                    )}
                  </div>

                  {/* Total Final */}
                  <div className="py-5 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-deep-slate text-xl font-bold">Total</span>
                      <span className="text-[11px] text-platinum-silver">
                        IGV y emisión digital incluidos
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-electric-indigo">
                        S/. {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Contenedor Observable del Botón de Acción del Resumen (Paso 1 y Paso 2) */}
                  <div ref={summaryCtaContainerRef} className="w-full">
                    {/* Botón CTA al Paso de Pago (En Paso 1) */}
                    {currentStep === 1 && (
                      <button
                        type="button"
                        onClick={handleProceedToStep2}
                        disabled={totalTickets === 0 || remainingUserQuotaForEvent <= 0}
                        className="w-full py-4 bg-electric-indigo hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/25 active:scale-95 group cursor-pointer"
                      >
                        <span>
                          {remainingUserQuotaForEvent <= 0
                            ? "Límite Oficial Alcanzado"
                            : "Continuar al Paso de Pago"}
                        </span>
                        {remainingUserQuotaForEvent > 0 && (
                          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        )}
                      </button>
                    )}

                    {/* Botón CTA de Pago (En Paso 2 - Lado Derecho en Web) */}
                    {currentStep === 2 && (
                      <button
                        type="button"
                        onClick={handleSubmitPayment}
                        disabled={isProcessing || totalTickets === 0}
                        className="w-full py-4 bg-electric-indigo hover:bg-primary disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/25 active:scale-95 group cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Emitiendo entradas oficiales...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">lock</span>
                            <span>Confirmar y Pagar S/. {grandTotal.toFixed(2)}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Métodos Aceptados */}
                  <div className="mt-5 pt-4 border-t border-surface-variant">
                    <div className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2.5">
                      Métodos oficiales aceptados:
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-purple-700 border border-surface-variant">
                        Yape / Plin
                      </span>
                      <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        💳 VISA / Mastercard
                      </span>
                      <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        Apple Pay
                      </span>
                      <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        Google Pay
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
                  <span>Garantía de entradas 100% auténticas QPH</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                  <span className="material-symbols-outlined text-electric-indigo text-lg">
                    lock
                  </span>
                  <span>Reserva segura cifrada de extremo a extremo</span>
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
              Tu puerta de entrada a los mejores eventos, conciertos y experiencias en directo en todo el Perú.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Eventos
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><Link href="/" className="hover:text-white transition-colors">Conciertos</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Festivales</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Teatro y Shows</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Deportes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Soporte
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto y Dudas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Devolución</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-widest">
              Legales
            </h4>
            <ul className="space-y-2 text-xs text-platinum-silver">
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Libro de Reclamaciones</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 w-full px-4 sm:px-8 py-6 text-center text-platinum-silver text-xs">
          © 2026 queplaneshoy. Todos los derechos reservados. Boletería oficial con tecnología criptográfica.
        </div>
      </footer>

      {/* MODAL: IDENTIFICACIÓN OBLIGATORIA PARA COMPRA Y EMISIÓN DE TICKETS */}
      {showAuthModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant space-y-5 text-center">
          <div className="w-16 h-16 bg-electric-indigo/10 text-electric-indigo rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">badge</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-deep-slate tracking-tight mb-2">
              Inicia sesión para emitir tus entradas 🎟️
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Por seguridad y para garantizar la validez legal de tus boletos con código QR único e intransferible, tus entradas deben asociarse directamente a tu cuenta oficial.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
              )}`}
              className="w-full qph-btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Iniciar Sesión</span>
            </Link>
            <Link
              href={`/register?redirect=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
              )}`}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-gray hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Crear Cuenta Nueva</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-deep-slate transition-colors cursor-pointer"
            >
              Volver a la selección de entradas
            </button>
          </div>
        </div>
      </div>
    )
  }

      {/* =========================================================================
          FOOTER FLOTANTE MÓVIL: TOTAL DE COMPRA SEGÚN SELECCIÓN (SOLO MÓVIL)
          Muestra el total en tiempo real y desaparece automáticamente cuando el
          botón "Continuar al Paso de Pago" entra en pantalla (IntersectionObserver).
         ========================================================================= */}
      <aside
        aria-label="Total de la compra en versión móvil"
        className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-surface-variant shadow-[0_-4px_25px_rgba(0,0,0,0.12)] px-4 py-3 transition-all duration-300 ease-in-out ${
          showMobileOrderFooter
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Total de la orden
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-electric-indigo tracking-tight">
                S/. {grandTotal.toFixed(2)}
              </span>
              <span className="text-[11px] text-platinum-silver font-medium">
                ({totalTickets} {totalTickets === 1 ? "entrada" : "entradas"})
              </span>
            </div>
          </div>

          {/* Botón CTA en Móvil según el Paso Actual */}
          {currentStep === 1 ? (
            <button
              type="button"
              onClick={() => {
                if (totalTickets === 0) {
                  const selector = document.getElementById("tickets-selector-section");
                  if (selector) {
                    selector.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                  return;
                }
                summaryCtaContainerRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>{totalTickets === 0 ? "Elegir entradas" : "Continuar"}</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitPayment}
              disabled={isProcessing || totalTickets === 0}
              className="px-4 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Confirmar y Pagar</span>
                </>
              )}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
