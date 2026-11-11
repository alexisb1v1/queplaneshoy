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
import {
  prepareCulqiCheckoutUseCase,
  confirmCulqiChargeUseCase,
  getCulqiOrderStatusUseCase,
  cancelPendingCulqiOrderUseCase,
  getMyOrdersUseCase,
  validateCouponUseCase,
  SimulateCheckoutResponseModel,
  ValidateCouponResponseModel,
} from "../index";
import {
  authenticateWithCulqi3DS,
  generateCulqiDeviceFingerprint,
  openCulqiCheckoutModal,
  resolveCulqiClientConfig,
} from "../services/culqi-checkout-script.service";

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

// Duración estándar de reserva temporal en pasarela (14:59 min) y clave en sessionStorage
const CHECKOUT_RESERVATION_DURATION_SECONDS = 899;
const CHECKOUT_TIMER_STORAGE_PREFIX = "qph_checkout_expires_at:";

function getCheckoutTimerKey(eventId: string | null): string {
  return `${CHECKOUT_TIMER_STORAGE_PREFIX}${eventId || "default"}`;
}

function removePersistedCheckoutTimer(timerKey: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(timerKey);
  } catch {
    // Ignorar restricciones de almacenamiento del navegador
  }
}

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

  // Temporizador de Reserva regresivo persistente ante recargas (14:59 min)
  const checkoutTimerKey = getCheckoutTimerKey(eventId);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(CHECKOUT_RESERVATION_DURATION_SECONDS);
  const [isTimerSynced, setIsTimerSynced] = useState<boolean>(false);
  const expiresAtRef = useRef<number | null>(null);

  // Lista de Funciones y Zonas Dinámicas
  const [showFunctions, setShowFunctions] = useState<ShowFunction[]>(DEFAULT_SHOW_FUNCTIONS);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(DEFAULT_TICKET_TIERS);

  // Método de pago en Paso 2 (Estándar Multipago Perú / Culqi)
  const [paymentMethod, setPaymentMethod] = useState<
    "yape" | "card" | "transfer" | "cuotealo"
  >("yape");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [processingLabel, setProcessingLabel] = useState<string>("Conectando con Culqi...");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<SimulateCheckoutResponseModel | null>(null);
  const [pendingAsyncOrder, setPendingAsyncOrder] = useState<{
    orderPublicUuid: string;
    orderCode: string;
    culqiOrderId: string;
    paymentCode?: string | null;
    method: "yape" | "card" | "transfer" | "cuotealo";
  } | null>(null);
  const [isCheckingAsyncStatus, setIsCheckingAsyncStatus] = useState<boolean>(false);
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

  // Cupón de descuento (6 casos de uso + doble check atómico)
  const [couponCodeInput, setCouponCodeInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponseModel | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMessage, setCouponSuccessMessage] = useState<string | null>(null);

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
              (event && o.eventId && String(o.eventId) === String(event.id)) ||
              (event && o.eventTitle && o.eventTitle.trim().toLowerCase() === event.name.trim().toLowerCase());
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
              maxTicketsPerOrder: zone.maxTicketsPerOrder || 4,
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

  // Límites oficiales de entradas por persona (Regla 1: Por Evento)
  const eventUserTicketLimit = event?.userTicketLimit ?? 6;
  const remainingUserQuotaForEvent = Math.max(0, eventUserTicketLimit - alreadyPurchasedTicketsCount);

  // Estado derivado cuando vence la ventana de reserva (solo tras sincronizar con sessionStorage)
  const isReservationExpired = isTimerSynced && currentStep !== 3 && secondsRemaining <= 0;

  // Hidratación inicial del temporizador desde sessionStorage para mantener el tiempo al refrescar
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentStep === 3) {
      expiresAtRef.current = null;
      removePersistedCheckoutTimer(checkoutTimerKey);
      setIsTimerSynced(true);
      return;
    }

    let resolvedExpiresAt = Date.now() + CHECKOUT_RESERVATION_DURATION_SECONDS * 1000;
    try {
      const storedValue = sessionStorage.getItem(checkoutTimerKey);
      const parsedExpiresAt = storedValue ? Number(storedValue) : NaN;
      if (Number.isFinite(parsedExpiresAt) && parsedExpiresAt > 0) {
        resolvedExpiresAt = parsedExpiresAt;
      } else {
        sessionStorage.setItem(checkoutTimerKey, String(resolvedExpiresAt));
      }
    } catch {
      // Respaldo en memoria si sessionStorage está restringido
    }

    expiresAtRef.current = resolvedExpiresAt;
    const syncedRemaining = Math.max(0, Math.ceil((resolvedExpiresAt - Date.now()) / 1000));
    setSecondsRemaining(syncedRemaining);
    setIsTimerSynced(true);
  }, [checkoutTimerKey, currentStep]);

  // Cuenta regresiva basada en reloj real + resincronización al volver a enfocar la pestaña
  useEffect(() => {
    if (!isTimerSynced || currentStep === 3 || isReservationExpired) return;

    const syncRemainingTime = () => {
      if (!expiresAtRef.current) return;
      const nextRemaining = Math.max(0, Math.ceil((expiresAtRef.current - Date.now()) / 1000));
      setSecondsRemaining(nextRemaining);
    };

    syncRemainingTime();
    const interval = setInterval(syncRemainingTime, 1000);
    window.addEventListener("focus", syncRemainingTime);
    document.addEventListener("visibilitychange", syncRemainingTime);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", syncRemainingTime);
      document.removeEventListener("visibilitychange", syncRemainingTime);
    };
  }, [isTimerSynced, currentStep, isReservationExpired]);

  // Cierra modales secundarios y bloquea scroll cuando el tiempo de reserva expira
  useEffect(() => {
    if (!isReservationExpired || typeof document === "undefined") return;
    setShowAuthModal(false);
    setIsMobileSummaryExpanded(false);
    setIsGatewayModalOpen(false);
    setIsProcessing(false);
    setPendingAsyncOrder(null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReservationExpired]);

  // Bloquea interacción secundaria y scroll del fondo mientras se procesa el pago
  useEffect(() => {
    if (!isProcessing || typeof document === "undefined") return;
    setShowAuthModal(false);
    setIsMobileSummaryExpanded(false);
    if (isGatewayModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isProcessing, isGatewayModalOpen]);

  // Posicionar la vista en la parte superior al llegar al Paso 3 (Pantalla de Confirmación)
  useEffect(() => {
    if (currentStep === 3 && typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const rafId = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [currentStep]);

  const formatTimer = (secs: number) => {
    if (!isTimerSynced) return "--:-- min";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} min`;
  };

  // Manejo de cantidades (+ / -) con validación estricta de límites por compra y por evento
  const handleQuantityChange = (tierId: string, delta: number) => {
    if (isReservationExpired) return;
    setTicketTiers((prev) => {
      const target = prev.find((t) => t.id === tierId);
      if (!target || !target.available) return prev;

      const currentTotalExcludingTarget = prev
        .filter((t) => t.id !== tierId)
        .reduce((sum, t) => sum + t.quantity, 0);

      const zoneMaxPerOrder = target.maxTicketsPerOrder ?? 4;
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

  // Recálculo dinámico de descuento si cambia el subtotal
  const effectiveDiscountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.round(subtotal * (appliedCoupon.discountValue / 100) * 100) / 100
      : Math.min(subtotal, appliedCoupon.discountValue)
    : 0;

  // El precio de la entrada ya incluye el servicio definido al crear el evento (sin cobro duplicado)
  const grandTotal = Math.max(0, Math.round((subtotal - effectiveDiscountAmount) * 100) / 100);

  const handleApplyCoupon = () => {
    const trimmedCode = couponCodeInput.trim().toUpperCase();
    if (!trimmedCode) {
      setCouponError("Por favor ingresa un código de cupón.");
      return;
    }
    if (subtotal <= 0) {
      setCouponError("Selecciona al menos una entrada antes de aplicar un cupón.");
      return;
    }

    setIsCouponLoading(true);
    setCouponError(null);
    setCouponSuccessMessage(null);

    const targetEventId = event ? (event.publicUuid || event.id) : eventId || "1";

    validateCouponUseCase
      .execute({
        eventId: targetEventId,
        code: trimmedCode,
        subtotal: subtotal,
      })
      .match(
        (res) => {
          setIsCouponLoading(false);
          setAppliedCoupon(res);
          setCouponSuccessMessage(res.message || "¡Cupón aplicado exitosamente!");
          setCouponCodeInput("");
        },
        (err) => {
          setIsCouponLoading(false);
          setCouponError(
            err.message ||
            "El cupón ingresado no es válido, ha expirado o no cumple con las condiciones."
          );
        }
      );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccessMessage(null);
    setCouponCodeInput("");
  };

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

    const checkVisibility = () => {
      const el = summaryCtaContainerRef.current;
      if (!el) {
        setIsSummaryCtaVisible(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      setIsSummaryCtaVisible(inView);
    };

    // Comprobación inicial inmediata y garantizada tras render de imágenes
    checkVisibility();
    const rafId = requestAnimationFrame(checkVisibility);

    let observer: IntersectionObserver | null = null;
    const target = summaryCtaContainerRef.current;
    if (typeof window !== "undefined" && "IntersectionObserver" in window && target) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsSummaryCtaVisible(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: "0px",
        }
      );
      observer.observe(target);
    }

    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [currentStep, ticketTiers, loadingEvent]);

  // Mostrar el footer flotante en móvil en pasos 1 y 2 mientras no sea visible el botón oficial del resumen
  const showMobileOrderFooter = (currentStep === 1 || currentStep === 2) && !isSummaryCtaVisible;

  useEffect(() => {
    if (!showMobileOrderFooter) {
      setIsMobileSummaryExpanded(false);
    }
  }, [showMobileOrderFooter]);

  // Auto-scroll hacia la sección de método de pago al ingresar al Paso 2
  useEffect(() => {
    setIsMobileSummaryExpanded(false);
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
    if (isReservationExpired) return;
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

  const completeSuccessfulCheckout = (response: SimulateCheckoutResponseModel) => {
    setIsGatewayModalOpen(false);
    setIsProcessing(false);
    setPendingAsyncOrder(null);
    setCheckoutResult(response);
    expiresAtRef.current = null;
    removePersistedCheckoutTimer(checkoutTimerKey);
    setCurrentStep(3);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  const handleCheckoutDomainError = (error: { code: string; message?: string }) => {
    setIsGatewayModalOpen(false);
    setIsProcessing(false);
    if (error.code === "AUTH_001" || error.code === "UNAUTHORIZED" || error.message?.toLowerCase().includes("sesión")) {
      setShowAuthModal(true);
      return;
    }
    if (error.code === "COUPON_INVALID_OR_EXPIRED" || error.message?.toLowerCase().includes("cupón")) {
      setAppliedCoupon(null);
      setCouponError(
        "El cupón de descuento ya no se encuentra disponible o ha expirado. Por favor retíralo o prueba con otro cupón.",
      );
      setPaymentError(
        "El cupón de descuento ha dejado de ser válido o alcanzó su límite de canjes. Se ha desvinculado de la orden para que puedas reintentar.",
      );
      return;
    }
    setPaymentError(
      error.message ||
        "La transacción no pudo completarse en Culqi. Por favor verifica tus datos o prueba con otro medio de pago.",
    );
  };

  // Respaldo de polling cada 3s mientras espera confirmación asíncrona (QR Billeteras, CIP PagoEfectivo, Cuotéalo)
  useEffect(() => {
    if (!pendingAsyncOrder || currentStep === 3 || isReservationExpired) return;

    let isCancelled = false;
    const pollStatus = async () => {
      const statusRes = await getCulqiOrderStatusUseCase.execute(pendingAsyncOrder.orderPublicUuid);
      if (isCancelled) return;

      statusRes.match(
        (data) => {
          if (data.paymentCode && data.paymentCode !== pendingAsyncOrder.paymentCode) {
            setPendingAsyncOrder((prev) =>
              prev ? { ...prev, paymentCode: data.paymentCode } : null,
            );
          }
          if (data.status === "paid" && data.checkoutResult) {
            completeSuccessfulCheckout(data.checkoutResult);
            return;
          }
          if (data.status === "expired" || data.status === "cancelled") {
            setPendingAsyncOrder(null);
            setPaymentError("La orden de pago expiró o fue cancelada. Puedes generar una nueva orden.");
          }
        },
        () => {
          // Continuar verificando en el siguiente intervalo sin interrumpir al usuario
        },
      );
    };

    const intervalId = setInterval(pollStatus, 3000);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [pendingAsyncOrder?.orderPublicUuid, currentStep, isReservationExpired]);

  const handleManualVerifyAsyncOrder = async () => {
    if (!pendingAsyncOrder || isCheckingAsyncStatus) return;
    setIsCheckingAsyncStatus(true);
    setPaymentError(null);

    const statusRes = await getCulqiOrderStatusUseCase.execute(pendingAsyncOrder.orderPublicUuid);
    setIsCheckingAsyncStatus(false);

    statusRes.match(
      (data) => {
        if (data.paymentCode) {
          setPendingAsyncOrder((prev) =>
            prev ? { ...prev, paymentCode: data.paymentCode } : null,
          );
        }
        if (data.status === "paid" && data.checkoutResult) {
          completeSuccessfulCheckout(data.checkoutResult);
          return;
        }
        if (data.status === "expired" || data.status === "cancelled") {
          setPendingAsyncOrder(null);
          setPaymentError("Tu orden expiró o fue cancelada. Inicia nuevamente tu pago.");
          return;
        }
        setPaymentError(
          "Aún no recibimos confirmación de pago desde Culqi. Si acabas de abonar, vuelve a verificar en unos segundos.",
        );
      },
      (err) => {
        setPaymentError(err.message || "No se pudo consultar el estado en Culqi en este momento.");
      },
    );
  };

  const handleCancelPendingAsyncOrder = async () => {
    if (!pendingAsyncOrder) return;
    const orderUuid = pendingAsyncOrder.orderPublicUuid;
    setPendingAsyncOrder(null);
    setPaymentError(null);
    await cancelPendingCulqiOrderUseCase.execute(orderUuid);
  };

  // Procesamiento real de pago mediante Culqi Checkout Custom + API v2 + 3DS
  const handleSubmitPayment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isReservationExpired || isProcessing) return;
    if (!event) {
      setPaymentError(
        "No se pudo cargar la taquilla oficial del evento seleccionado. Vuelve a la cartelera e ingresa nuevamente al evento.",
      );
      return;
    }
    if (totalTickets === 0) {
      alert("Por favor selecciona al menos una entrada para continuar.");
      return;
    }

    const activeToken = apiClient.getToken();
    if (!activeToken || !currentUser) {
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);
    setIsGatewayModalOpen(false);
    setProcessingLabel("Preparando orden en Culqi...");
    setPaymentError(null);
    setPendingAsyncOrder(null);

    const selectedItems = ticketTiers
      .filter((t) => t.quantity > 0)
      .map((t) => ({ zoneId: t.id, quantity: t.quantity }));

    const prepareRes = await prepareCulqiCheckoutUseCase.execute({
      eventId: event ? event.publicUuid || event.id : eventId || "1",
      showId: selectedFunctionId,
      items: selectedItems,
      paymentMethod,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    });

    if (prepareRes.isErr()) {
      handleCheckoutDomainError(prepareRes.error);
      return;
    }

    const prepared = prepareRes.value;
    const clientConfig = resolveCulqiClientConfig({
      publicKey: prepared.publicKey,
      checkoutScriptUrl: prepared.checkoutScriptUrl,
      threeDsScriptUrl: prepared.threeDsScriptUrl,
      rsaId: prepared.rsaId,
      rsaPublicKey: prepared.rsaPublicKey,
    });

    const deviceFingerPrintId = await generateCulqiDeviceFingerprint(
      clientConfig.publicKey,
      clientConfig.threeDsScriptUrl,
    );

    setProcessingLabel("Completa tu pago en la ventana segura de Culqi...");
    setIsGatewayModalOpen(true);

    const modalOutcome = await openCulqiCheckoutModal({
      publicKey: clientConfig.publicKey,
      checkoutScriptUrl: clientConfig.checkoutScriptUrl,
      rsaId: clientConfig.rsaId,
      rsaPublicKey: clientConfig.rsaPublicKey,
      logoUrl: clientConfig.logoUrl,
      title: prepared.title,
      currency: prepared.currency,
      amountInCents: prepared.amountInCents,
      culqiOrderId: prepared.culqiOrderId,
      customerEmail: prepared.customer.email,
      preferredMethod: paymentMethod,
    });

    setIsGatewayModalOpen(false);

    if (modalOutcome.type === "CANCELLED") {
      setProcessingLabel("Liberando reserva temporal...");
      const cancelRes = await cancelPendingCulqiOrderUseCase.execute(prepared.orderPublicUuid);
      if (cancelRes.isOk() && cancelRes.value.status === "paid") {
        const paidCheck = await getCulqiOrderStatusUseCase.execute(prepared.orderPublicUuid);
        if (paidCheck.isOk() && paidCheck.value.checkoutResult) {
          completeSuccessfulCheckout(paidCheck.value.checkoutResult);
          return;
        }
      }
      setIsProcessing(false);
      return;
    }

    if (modalOutcome.type === "ERROR") {
      setProcessingLabel("Liberando reserva temporal...");
      await cancelPendingCulqiOrderUseCase.execute(prepared.orderPublicUuid);
      setIsProcessing(false);
      setPaymentError(modalOutcome.message);
      return;
    }

    if (modalOutcome.type === "ORDER") {
      setIsProcessing(false);
      setPendingAsyncOrder({
        orderPublicUuid: prepared.orderPublicUuid,
        orderCode: prepared.orderCode,
        culqiOrderId: modalOutcome.culqiOrderId,
        paymentCode: modalOutcome.paymentCode ?? null,
        method: paymentMethod,
      });
      return;
    }

    // Token recibido (Tarjeta de Crédito/Débito o Yape con código de aprobación)
    const resolvedMethodForCharge = modalOutcome.isYapeToken ? "yape" : paymentMethod;
    setProcessingLabel("Confirmando transacción con Culqi...");

    const chargeRes = await confirmCulqiChargeUseCase.execute({
      orderPublicUuid: prepared.orderPublicUuid,
      tokenId: modalOutcome.tokenId,
      paymentMethod: resolvedMethodForCharge,
      deviceFingerPrintId,
    });

    if (chargeRes.isErr()) {
      handleCheckoutDomainError(chargeRes.error);
      return;
    }

    const chargeData = chargeRes.value;
    if (chargeData.status === "PAID" && chargeData.checkoutResult) {
      completeSuccessfulCheckout(chargeData.checkoutResult);
      return;
    }

    if (chargeData.requires3DS) {
      setProcessingLabel("Verificando seguridad bancaria 3D Secure...");
      setIsGatewayModalOpen(true);
      const threeDsOutcome = await authenticateWithCulqi3DS({
        publicKey: clientConfig.publicKey,
        threeDsScriptUrl: clientConfig.threeDsScriptUrl,
        tokenId: modalOutcome.tokenId,
        email: prepared.customer.email,
        amountInCents: prepared.amountInCents,
      });
      setIsGatewayModalOpen(false);

      if (!threeDsOutcome.ok) {
        setIsProcessing(false);
        setPaymentError(threeDsOutcome.message);
        return;
      }

      setProcessingLabel("Confirmando cargo autenticado con Culqi...");
      const retryChargeRes = await confirmCulqiChargeUseCase.execute({
        orderPublicUuid: prepared.orderPublicUuid,
        tokenId: modalOutcome.tokenId,
        paymentMethod: resolvedMethodForCharge,
        deviceFingerPrintId,
        authentication3DS: threeDsOutcome.data,
      });

      retryChargeRes.match(
        (retryData) => {
          if (retryData.status === "PAID" && retryData.checkoutResult) {
            completeSuccessfulCheckout(retryData.checkoutResult);
            return;
          }
          setIsProcessing(false);
          setPaymentError("No se pudo confirmar la autenticación 3D Secure con el emisor.");
        },
        (retryErr) => handleCheckoutDomainError(retryErr),
      );
      return;
    }

    setIsProcessing(false);
    setPaymentError("No se recibió confirmación definitiva de Culqi. Intenta nuevamente.");
  };

  const paymentMethodLabel = {
    yape: "Yape / Plin (Billetera Digital)",
    card: "Tarjeta de Crédito / Débito",
    transfer: "PagoEfectivo (Código CIP)",
    cuotealo: "Cuotéalo BCP",
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
        discountAmount={checkoutResult?.discountAmount ?? effectiveDiscountAmount}
        couponCode={checkoutResult?.couponCode ?? (appliedCoupon ? appliedCoupon.code : null)}
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
      <header
        className={`bg-surface/80 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-outline-variant/10 ${
          isProcessing ? "pointer-events-none select-none" : ""
        }`}
      >
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
      <main
        className={`flex-grow w-full max-w-container-max mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-28 lg:pb-12 ${
          isProcessing ? "pointer-events-none select-none" : ""
        }`}
      >
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

          {/* TIMER ALERT (URGENCIA DINÁMICA SEGÚN TIEMPO RESTANTE) */}
          <div
            className={`mb-8 p-3.5 rounded-xl flex items-center justify-between gap-3 max-w-4xl mx-auto shadow-sm border transition-colors ${
              isReservationExpired
                ? "bg-red-50 border-red-200"
                : secondsRemaining <= 120
                  ? "bg-amber-50 border-amber-300"
                  : "bg-electric-indigo/10 border-electric-indigo/20"
            }`}
          >
            <div className="flex items-center gap-2.5 text-deep-slate text-xs sm:text-sm font-semibold">
              <span
                className={`material-symbols-outlined text-xl ${
                  isReservationExpired
                    ? "text-red-600"
                    : secondsRemaining <= 120
                      ? "text-amber-600"
                      : "text-electric-indigo"
                }`}
              >
                {isReservationExpired ? "timer_off" : "timer"}
              </span>
              <span>
                {isReservationExpired
                  ? "Tu tiempo de reserva temporal ha expirado:"
                  : "Tus entradas seleccionadas se reservan temporalmente:"}
              </span>
            </div>
            <div
              className={`bg-white px-3 py-1 rounded-lg border font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm font-mono shrink-0 ${
                isReservationExpired
                  ? "border-red-300 text-red-600"
                  : secondsRemaining <= 120
                    ? "border-amber-300 text-amber-700"
                    : "border-electric-indigo/30 text-electric-indigo"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isReservationExpired
                    ? "bg-red-500"
                    : secondsRemaining <= 120
                      ? "bg-red-500 animate-ping"
                      : "bg-vip-gold animate-pulse"
                }`}
              />
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
                    selectedZoneNote={primarySelectedTier?.description}
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
                            100,
                            Math.max(
                              0,
                              Math.round(
                                (event.zones.reduce(
                                  (acc, z) => acc + Math.max(0, z.capacity - z.remainingTickets),
                                  0
                                ) /
                                  (event.zones.reduce((acc, z) => acc + z.capacity, 0) || 1)) *
                                  100
                              )
                            )
                          )
                        : 0
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
                        tier.quantity >= (tier.maxTicketsPerOrder ?? 4) ||
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
                              <div className="flex items-center gap-2.5 flex-wrap text-sm text-electric-indigo font-bold">
                                <span>
                                  S/. {tier.price.toFixed(2)}{" "}
                                  <span className="text-xs text-platinum-silver font-normal">
                                    / entrada oficial
                                  </span>
                                </span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-gray text-on-surface-variant border border-surface-variant">
                                  Máx. {tier.maxTicketsPerOrder ?? 4} por orden
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
                  PASO 2: PASARELA DE PAGOS Y MÉTODOS SEGUROS (PERÚ / CULQI READY)
                 ================================================================= */}
              {currentStep === 2 && (
                <div
                  id="payment-methods-section"
                  className="space-y-6 bg-white p-5 sm:p-8 rounded-2xl border border-surface-variant shadow-sm scroll-mt-24 md:scroll-mt-28 animate-in fade-in duration-200"
                >
                  {/* Cabecera del Paso 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-variant/60 pb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-electric-indigo/10 text-electric-indigo text-[11px] font-bold mb-1.5">
                        <span className="material-symbols-outlined text-[14px]">verified_user</span>
                        <span>Pasarela Segura • Pagos en Soles (PEN)</span>
                      </div>
                      <h1 className="text-2xl font-black text-deep-slate tracking-tight">
                        Elige cómo quieres pagar
                      </h1>
                      <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                        Al confirmar se abrirá la pasarela protegida para completar tu pago sin salir de la plataforma.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingAsyncOrder) {
                          void handleCancelPendingAsyncOrder();
                        }
                        setCurrentStep(1);
                      }}
                      className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-on-surface-variant hover:text-electric-indigo hover:bg-surface-gray border border-surface-variant/70 transition-colors cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                      <span>Editar entradas</span>
                    </button>
                  </div>

                  {/* Panel de Seguimiento para Pagos Asíncronos (QR Billeteras / PagoEfectivo CIP / Cuotéalo) */}
                  {pendingAsyncOrder && (
                    <div className="p-5 rounded-2xl bg-electric-indigo/5 border-2 border-electric-indigo/30 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-electric-indigo/15 text-electric-indigo flex items-center justify-center shrink-0">
                          <div className="w-5 h-5 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-extrabold text-sm text-deep-slate">
                              Esperando confirmación de Culqi ({pendingAsyncOrder.orderCode})
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                              En proceso
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            Tus entradas permanecen reservadas mientras completas la operación. Verificamos automáticamente cada pocos segundos para emitir tus códigos QR al instante.
                          </p>
                          {pendingAsyncOrder.paymentCode && (
                            <div className="mt-3 p-3 rounded-xl bg-white border border-surface-variant flex items-center justify-between gap-3">
                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                  Código de Pago (CIP / Referencia Culqi)
                                </span>
                                <span className="font-mono font-black text-base text-deep-slate tracking-wider">
                                  {pendingAsyncOrder.paymentCode}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof navigator !== "undefined" && pendingAsyncOrder.paymentCode) {
                                    void navigator.clipboard.writeText(pendingAsyncOrder.paymentCode);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-surface-gray hover:bg-slate-200 text-deep-slate text-xs font-bold cursor-pointer shrink-0"
                              >
                                Copiar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={handleManualVerifyAsyncOrder}
                          disabled={isCheckingAsyncStatus}
                          className="px-4 py-2 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isCheckingAsyncStatus ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Verificando...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">refresh</span>
                              <span>Ya pagué, verificar ahora</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPendingAsyncOrder}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-surface-gray border border-surface-variant text-deep-slate text-xs font-semibold cursor-pointer"
                        >
                          Cambiar método o cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alerta de Transacción Rechazada */}
                  {paymentError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in duration-150">
                      <span className="material-symbols-outlined text-red-600 text-xl shrink-0 mt-0.5">
                        error
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">Transacción no completada</h4>
                        <p className="text-xs text-red-700 mt-1">{paymentError}</p>
                        <p className="text-xs text-slate-600 mt-2">
                          💡 <strong>Tus entradas continúan reservadas:</strong> Puedes reintentar o elegir otro medio de pago (por ejemplo, Tarjeta o PagoEfectivo).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentError(null)}
                        aria-label="Cerrar alerta"
                        className="text-red-500 hover:text-red-800 text-xs font-bold cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Grid 2x2 de Métodos de Pago Oficiales Perú */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* 1. Yape / Plin */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("yape")}
                      className={`relative flex items-center justify-between p-4 border-2 rounded-2xl text-left transition-all cursor-pointer ${
                        paymentMethod === "yape"
                          ? "border-electric-indigo bg-electric-indigo/5 shadow-sm ring-2 ring-electric-indigo/15"
                          : "border-surface-variant bg-white hover:bg-surface-gray/70 hover:border-slate-300"
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs">
                        Más usado
                      </span>
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 border border-purple-200/70">
                          <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">Yape / Plin</span>
                          <span className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                            Escanea el QR o usa código de aprobación
                          </span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined shrink-0 ${
                          paymentMethod === "yape" ? "text-electric-indigo" : "text-slate-300"
                        }`}
                        style={{ fontVariationSettings: paymentMethod === "yape" ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {paymentMethod === "yape" ? "check_circle" : "radio_button_unchecked"}
                      </span>
                    </button>

                    {/* 2. Tarjeta de Crédito / Débito */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`relative flex items-center justify-between p-4 border-2 rounded-2xl text-left transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-electric-indigo bg-electric-indigo/5 shadow-sm ring-2 ring-electric-indigo/15"
                          : "border-surface-variant bg-white hover:bg-surface-gray/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-11 h-11 rounded-xl bg-electric-indigo/10 flex items-center justify-center text-electric-indigo shrink-0 border border-electric-indigo/20">
                          <span className="material-symbols-outlined text-2xl">credit_card</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">
                            Tarjeta de Crédito / Débito
                          </span>
                          <span className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                            Visa, Mastercard, Amex y Diners
                          </span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined shrink-0 ${
                          paymentMethod === "card" ? "text-electric-indigo" : "text-slate-300"
                        }`}
                        style={{ fontVariationSettings: paymentMethod === "card" ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {paymentMethod === "card" ? "check_circle" : "radio_button_unchecked"}
                      </span>
                    </button>

                    {/* 3. PagoEfectivo / Agentes */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`relative flex items-center justify-between p-4 border-2 rounded-2xl text-left transition-all cursor-pointer ${
                        paymentMethod === "transfer"
                          ? "border-electric-indigo bg-electric-indigo/5 shadow-sm ring-2 ring-electric-indigo/15"
                          : "border-surface-variant bg-white hover:bg-surface-gray/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-200/70">
                          <span className="material-symbols-outlined text-2xl">account_balance</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">
                            PagoEfectivo / Agentes
                          </span>
                          <span className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                            Código CIP en BCP, BBVA, Interbank y agentes
                          </span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined shrink-0 ${
                          paymentMethod === "transfer" ? "text-electric-indigo" : "text-slate-300"
                        }`}
                        style={{ fontVariationSettings: paymentMethod === "transfer" ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {paymentMethod === "transfer" ? "check_circle" : "radio_button_unchecked"}
                      </span>
                    </button>

                    {/* 4. Cuotéalo BCP */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cuotealo")}
                      className={`relative flex items-center justify-between p-4 border-2 rounded-2xl text-left transition-all cursor-pointer ${
                        paymentMethod === "cuotealo"
                          ? "border-electric-indigo bg-electric-indigo/5 shadow-sm ring-2 ring-electric-indigo/15"
                          : "border-surface-variant bg-white hover:bg-surface-gray/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 shrink-0 border border-sky-200/70">
                          <span className="material-symbols-outlined text-2xl">calendar_month</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-deep-slate">Cuotéalo BCP</span>
                          <span className="text-[11px] text-on-surface-variant leading-snug mt-0.5">
                            Financia en cuotas sin tarjeta con BCP
                          </span>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined shrink-0 ${
                          paymentMethod === "cuotealo" ? "text-electric-indigo" : "text-slate-300"
                        }`}
                        style={{ fontVariationSettings: paymentMethod === "cuotealo" ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {paymentMethod === "cuotealo" ? "check_circle" : "radio_button_unchecked"}
                      </span>
                    </button>
                  </div>

                  {/* Panel Contextual del Método Seleccionado */}
                  <div className="p-5 bg-surface-container-low/80 rounded-2xl border border-surface-variant space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">
                          {paymentMethod === "yape"
                            ? "qr_code_2"
                            : paymentMethod === "card"
                            ? "shield_lock"
                            : paymentMethod === "transfer"
                            ? "receipt_long"
                            : "payments"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-deep-slate text-sm font-bold">
                          {paymentMethod === "yape" && "Pago instantáneo con Yape o Plin"}
                          {paymentMethod === "card" && "Pago cifrado con Tarjeta (Protección 3D Secure)"}
                          {paymentMethod === "transfer" && "Pago con Código CIP vía PagoEfectivo"}
                          {paymentMethod === "cuotealo" && "Financiamiento directo con Cuotéalo BCP"}
                        </h3>
                        <p className="text-on-surface-variant text-xs leading-relaxed">
                          {paymentMethod === "yape" &&
                            "Al confirmar, se desplegará el modal seguro donde podrás escanear el código QR con Yape/Plin o ingresar tu celular + código de aprobación de Yape."}
                          {paymentMethod === "card" &&
                            "Ingresa los datos de tu tarjeta Visa, Mastercard, Amex o Diners directamente en el entorno certificado PCI DSS. Si tu banco lo solicita, podrás autorizar con clave dinámica 3DS."}
                          {paymentMethod === "transfer" &&
                            "Se generará un código de pago CIP válido durante los próximos 10 minutos para que abones desde tu app bancaria o agente autorizado."}
                          {paymentMethod === "cuotealo" &&
                            "Completa la solicitud en línea ingresando con tu cuenta BCP y elige el plan de cuotas que mejor se adapte a ti sin usar tarjeta de crédito."}
                        </p>
                      </div>
                    </div>

                    {/* Aviso Inteligente de Límites para Yape / QR */}
                    {paymentMethod === "yape" && grandTotal > 500 && grandTotal <= 2000 && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px]">
                        <span className="material-symbols-outlined text-amber-600 text-[17px] shrink-0 mt-0.5">
                          info
                        </span>
                        <span>
                          Para compras entre <strong>S/. 500 y S/. 2,000</strong>, selecciona la opción de <strong>Yape con Código de Aprobación</strong> dentro de la pasarela (o verifica tu límite diario en tu app).
                        </span>
                      </div>
                    )}
                    {paymentMethod === "yape" && grandTotal > 2000 && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
                        <span className="material-symbols-outlined text-rose-600 text-[17px] shrink-0 mt-0.5">
                          warning
                        </span>
                        <span>
                          Tu compra supera el límite estándar por operación de Yape (<strong>S/. 2,000</strong>). Te recomendamos seleccionar <strong>Tarjeta</strong> o <strong>PagoEfectivo</strong>.
                        </span>
                      </div>
                    )}

                    {/* Micro-pasos de confirmación */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-surface-variant/70 text-[11px] font-semibold text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-electric-indigo/15 text-electric-indigo font-bold flex items-center justify-center text-[10px]">
                          1
                        </span>
                        <span>Confirma tu pedido</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-electric-indigo/15 text-electric-indigo font-bold flex items-center justify-center text-[10px]">
                          2
                        </span>
                        <span>Autoriza en ventana segura</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-electric-indigo/15 text-electric-indigo font-bold flex items-center justify-center text-[10px]">
                          3
                        </span>
                        <span>Recibe tus QR al instante</span>
                      </div>
                    </div>
                  </div>

                  {/* Datos del Titular de la Orden (Usuario en Sesión) */}
                  <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm shrink-0">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[11px] font-bold text-electric-indigo uppercase tracking-wider">
                            Titular de las entradas
                          </p>
                          {currentUser && (
                            <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                              Sesión Activa
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-deep-slate truncate">
                          {currentUser
                            ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
                            : "Usuario Invitado"}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {currentUser?.email || "Las entradas se emitirán a tu cuenta"}
                        </p>
                      </div>
                    </div>
                    {!currentUser && (
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="text-xs font-bold text-electric-indigo hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        Iniciar sesión <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    )}
                  </div>

                  {/* Botón Principal de Acción en la Pasarela (Desktop / Tablet, estilo Stitch) */}
                  <div className="hidden lg:block pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitPayment}
                      disabled={isProcessing || Boolean(pendingAsyncOrder) || totalTickets === 0}
                      className="w-full py-4 bg-electric-indigo hover:bg-primary disabled:opacity-50 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-electric-indigo/25 active:scale-[0.99] cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{processingLabel}</span>
                        </>
                      ) : pendingAsyncOrder ? (
                        <>
                          <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
                          <span>Orden pendiente de confirmación...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                          <span>Pagar Ahora • S/. {grandTotal.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust Badges de Seguridad (Móvil: 2 arriba + 1 abajo centrados; Desktop: 3 en fila centrados) */}
                  <div className="pt-4 border-t border-surface-variant/60 text-on-surface-variant/80">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-y-2.5 gap-x-6">
                      <div className="flex items-center justify-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-electric-indigo">lock</span>
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                            Cifrado SSL 256-bit
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-electric-indigo">verified_user</span>
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                            Entradas Oficiales QPH
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-electric-indigo">shield</span>
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                          Estándar PCI DSS
                        </span>
                      </div>
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

                  {/* Desglose de Descuento por Cupón (Si aplica) */}
                  {appliedCoupon && effectiveDiscountAmount > 0 && (
                    <div className="my-3 py-2.5 px-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-800">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                          local_offer
                        </span>
                        <span className="truncate">
                          Cupón {appliedCoupon.code} ({appliedCoupon.discountType === 'percentage' ? `-${appliedCoupon.discountValue}%` : `-S/. ${appliedCoupon.discountValue.toFixed(2)}`})
                        </span>
                      </div>
                      <span className="text-emerald-700 font-bold shrink-0">
                        -S/. {effectiveDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Bloque Interactivo de Cupón de Descuento (Stitch Design) */}
                  <div className="py-4 border-b border-surface-variant space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="coupon-input" className="text-xs font-bold text-deep-slate flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-electric-indigo">confirmation_number</span>
                        <span>¿Tienes un cupón de descuento?</span>
                      </label>
                      {appliedCoupon && (
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                          Activo
                        </span>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">verified</span>
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-emerald-950 tracking-wider font-mono uppercase">
                                {appliedCoupon.code}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {appliedCoupon.discountType === 'percentage'
                                  ? `-${appliedCoupon.discountValue}%`
                                  : `-S/. ${appliedCoupon.discountValue.toFixed(2)}`}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-700 truncate">
                              {appliedCoupon.message || "Descuento aplicado en el total"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          title="Remover cupón"
                          className="w-7 h-7 rounded-lg hover:bg-emerald-200/50 text-emerald-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            id="coupon-input"
                            type="text"
                            value={couponCodeInput}
                            onChange={(e) => {
                              setCouponCodeInput(e.target.value.toUpperCase());
                              if (couponError) setCouponError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyCoupon();
                              }
                            }}
                            placeholder="EJ: PROMO2026"
                            className="w-full px-3 py-2 text-xs uppercase font-mono tracking-wider bg-surface-container-low border border-surface-variant rounded-xl focus:outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo transition-all placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-platinum-silver text-deep-slate"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isCouponLoading || !couponCodeInput.trim() || subtotal <= 0}
                            className="px-4 py-2 bg-electric-indigo/10 hover:bg-electric-indigo/20 text-electric-indigo disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                          >
                            {isCouponLoading ? (
                              <div className="w-3.5 h-3.5 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>Aplicar</span>
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 animate-in fade-in duration-150">
                            <span className="material-symbols-outlined text-[13px]">error</span>
                            <span>{couponError}</span>
                          </p>
                        )}
                        {couponSuccessMessage && (
                          <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-150">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>{couponSuccessMessage}</span>
                          </p>
                        )}
                      </div>
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
                      {appliedCoupon && effectiveDiscountAmount > 0 && (
                        <span className="block text-xs text-platinum-silver line-through font-semibold">
                          S/. {subtotal.toFixed(2)}
                        </span>
                      )}
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
                        disabled={isProcessing || Boolean(pendingAsyncOrder) || totalTickets === 0}
                        className="w-full py-4 bg-electric-indigo hover:bg-primary disabled:opacity-50 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/25 active:scale-95 group cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{processingLabel}</span>
                          </>
                        ) : pendingAsyncOrder ? (
                          <>
                            <span className="material-symbols-outlined">hourglass_top</span>
                            <span>Esperando pago Culqi...</span>
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
                      <span className="px-2 py-1 bg-purple-50 rounded text-[10px] font-bold text-purple-700 border border-purple-200/70">
                        Yape / Plin QR
                      </span>
                      <span className="px-2 py-1 bg-surface-gray rounded text-[10px] font-bold text-deep-slate border border-surface-variant">
                        💳 Visa / Mastercard
                      </span>
                      <span className="px-2 py-1 bg-amber-50 rounded text-[10px] font-bold text-amber-800 border border-amber-200/70">
                        PagoEfectivo CIP
                      </span>
                      <span className="px-2 py-1 bg-sky-50 rounded text-[10px] font-bold text-sky-800 border border-sky-200/70">
                        Cuotéalo BCP
                      </span>
                    </div>
                  </div>
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
      <footer
        className={`bg-deep-slate text-surface-container-lowest mt-16 border-t border-white/10 ${
          isProcessing ? "pointer-events-none select-none" : ""
        }`}
      >
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

      {/* OVERLAY MODAL BLOQUEANTE: PROCESAMIENTO ACTIVO DEL PAGO */}
      {isProcessing && !isGatewayModalOpen && !isReservationExpired && (
        <div
          role="dialog"
          aria-modal="true"
          aria-busy="true"
          aria-labelledby="checkout-processing-title"
          className="fixed inset-0 z-[75] flex items-center justify-center bg-deep-slate/65 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-electric-indigo/15 space-y-5 text-center">
            <div className="w-16 h-16 bg-electric-indigo/10 border border-electric-indigo/20 text-electric-indigo rounded-2xl flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-[3px] border-electric-indigo border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h3
                id="checkout-processing-title"
                className="text-xl font-black text-deep-slate tracking-tight"
              >
                Procesando tu pago de forma segura...
              </h3>
              <p className="text-sm font-semibold text-electric-indigo">
                {processingLabel}
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                Por favor no cierres ni recargues esta ventana mientras confirmamos tu compra con la pasarela.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BLOQUEANTE: TIEMPO DE RESERVA EN PASARELA AGOTADO */}
      {isReservationExpired && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-expired-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-5 text-center">
            <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">timer_off</span>
            </div>
            <div className="space-y-2">
              <h3
                id="checkout-expired-title"
                className="text-xl font-black text-deep-slate tracking-tight"
              >
                ¡Tu tiempo se acabó!
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                El tiempo límite de reserva temporal en la pasarela ha finalizado y tus entradas fueron liberadas. Por favor, inicia nuevamente tu proceso de compra desde el inicio.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                onClick={() => {
                  expiresAtRef.current = null;
                  removePersistedCheckoutTimer(checkoutTimerKey);
                }}
                className="w-full qph-btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-electric-indigo/25"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span>Volver al Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FOOTER FLOTANTE MÓVIL: RESUMEN EXPANDIBLE + CTA PRINCIPAL (SOLO MÓVIL)
          En Paso 2 evita duplicar el monto total y ofrece el detalle desplegable.
         ========================================================================= */}
      {isMobileSummaryExpanded && showMobileOrderFooter && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-150"
          onClick={() => setIsMobileSummaryExpanded(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Total de la compra en versión móvil"
        className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-surface-variant shadow-[0_-6px_30px_rgba(15,23,42,0.14)] transition-all duration-300 ease-in-out ${
          showMobileOrderFooter
            ? `translate-y-0 opacity-100 ${isProcessing ? "pointer-events-none select-none" : "pointer-events-auto"}`
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Desplegable del Detalle de la Orden en Móvil */}
        {isMobileSummaryExpanded && (
          <div className="border-b border-surface-variant/80 bg-surface-container-low/95 px-4 py-3.5 max-h-[55vh] overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
            <div className="max-w-md mx-auto space-y-2.5">
              <div className="flex items-center justify-between border-b border-surface-variant/70 pb-2">
                <span className="text-xs font-extrabold text-deep-slate uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                    receipt_long
                  </span>
                  <span>Detalle de la orden ({totalTickets} {totalTickets === 1 ? "entrada" : "entradas"})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileSummaryExpanded(false)}
                  aria-label="Cerrar detalle"
                  className="w-6 h-6 rounded-full bg-white border border-surface-variant flex items-center justify-center text-on-surface-variant hover:text-deep-slate cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {ticketTiers
                  .filter((t) => t.quantity > 0)
                  .map((t) => (
                    <div
                      key={`mob-sum-${t.id}`}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className="font-semibold text-deep-slate">
                        {t.quantity} {t.name}
                      </span>
                      <span className="font-bold text-deep-slate tabular-nums">
                        S/. {(t.price * t.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}

                {totalTickets === 0 && (
                  <p className="text-xs text-on-surface-variant italic py-1">
                    No has seleccionado entradas aún.
                  </p>
                )}

                {appliedCoupon && effectiveDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs py-1 text-emerald-700 font-semibold border-t border-dashed border-surface-variant/80 pt-1.5">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_offer</span>
                      <span>Cupón {appliedCoupon.code}</span>
                    </span>
                    <span className="font-bold tabular-nums">
                      -S/. {effectiveDiscountAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-variant/80 text-xs">
                <span className="font-bold text-on-surface-variant">Total a pagar</span>
                <span className="font-black text-electric-indigo text-sm tabular-nums">
                  S/. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            {/* Lado Izquierdo: En Paso 2 muestra Resumen Expandible limpio (sin repetir el monto); en Paso 1 muestra el Total + toggle */}
            {currentStep === 2 ? (
              <button
                type="button"
                onClick={() => setIsMobileSummaryExpanded((prev) => !prev)}
                aria-expanded={isMobileSummaryExpanded}
                className="flex items-center gap-2 text-left py-1 pr-2 rounded-xl hover:bg-surface-gray/70 active:scale-[0.98] transition-all cursor-pointer min-w-0"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-deep-slate flex items-center gap-1 whitespace-nowrap">
                    <span>Detalle de orden</span>
                    <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                      {isMobileSummaryExpanded ? "expand_more" : "expand_less"}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1.5 whitespace-nowrap">
                    <span>
                      ({totalTickets} {totalTickets === 1 ? "entrada" : "entradas"})
                    </span>
                    {appliedCoupon && (
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        -{appliedCoupon.code}
                      </span>
                    )}
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => totalTickets > 0 && setIsMobileSummaryExpanded((prev) => !prev)}
                aria-expanded={isMobileSummaryExpanded}
                className="flex flex-col text-left cursor-pointer min-w-0"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                  <span>Total de la orden</span>
                  {appliedCoupon && (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      -{appliedCoupon.code}
                    </span>
                  )}
                  {totalTickets > 0 && (
                    <span className="material-symbols-outlined text-[14px] text-electric-indigo">
                      {isMobileSummaryExpanded ? "expand_more" : "expand_less"}
                    </span>
                  )}
                </span>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-lg font-black text-electric-indigo tracking-tight tabular-nums">
                    S/. {grandTotal.toFixed(2)}
                  </span>
                  {appliedCoupon && effectiveDiscountAmount > 0 && (
                    <span className="text-[11px] text-platinum-silver line-through font-semibold">
                      S/. {subtotal.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[11px] text-platinum-silver font-medium">
                    ({totalTickets} {totalTickets === 1 ? "entrada" : "entradas"})
                  </span>
                </div>
              </button>
            )}

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
                  setIsMobileSummaryExpanded(false);
                  handleProceedToStep2();
                }}
                className="px-4 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
              >
                <span>{totalTickets === 0 ? "Elegir entradas" : "Continuar"}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileSummaryExpanded(false);
                  handleSubmitPayment();
                }}
                disabled={isProcessing || Boolean(pendingAsyncOrder) || totalTickets === 0}
                className="px-4 py-3 rounded-xl bg-electric-indigo hover:bg-primary text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md shadow-electric-indigo/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : pendingAsyncOrder ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                    <span>En espera...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>Pagar S/. {grandTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
