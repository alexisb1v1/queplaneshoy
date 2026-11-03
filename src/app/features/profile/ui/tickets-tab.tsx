"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { getMyOrdersUseCase, UserOrderModel } from "../../orders";
import TicketPrintScreen from "../../orders/ui/ticket-print-screen";

export default function TicketsTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [orders, setOrders] = useState<UserOrderModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null);

  // Estado para la vista de impresión / descarga PDF en pantalla completa
  const [printOrder, setPrintOrder] = useState<UserOrderModel | null>(null);

  // Estado para el modal de pase digital móvil individual
  const [selectedOrderForQR, setSelectedOrderForQR] = useState<UserOrderModel | null>(null);
  const [activeTicketIndex, setActiveTicketIndex] = useState<number>(0);

  // Cargar usuario autenticado y órdenes desde el backend
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Obtener perfil de la sesión
    try {
      const storedUser = localStorage.getItem("qph_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserProfile({
          name: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() || parsed.email,
          email: parsed.email,
        });
      }
    } catch {
      // Ignorar errores en entornos con storage restringido
    }

    // 2. Consultar compras del usuario mediante el caso de uso
    setIsLoading(true);
    getMyOrdersUseCase.execute().then((result) => {
      result.match(
        (data) => {
          setOrders(data || []);
          setIsLoading(false);
          setIsAuthenticated(true);
        },
        (error) => {
          // Si retorna error de autorización
          if (error.code === "AUTH_001" || error.code === "UNAUTHORIZED" || error.message?.includes("401")) {
            setIsAuthenticated(false);
          }
          setOrders([]);
          setIsLoading(false);
        }
      );
    });
  }, []);

  // Separar compras en Próximas y Pasadas (el historial completo se preserva)
  const upcomingOrders = useMemo(() => {
    return orders.filter((o) => !o.isPast);
  }, [orders]);

  const pastOrders = useMemo(() => {
    return orders.filter((o) => o.isPast);
  }, [orders]);

  const displayedOrders = activeTab === "upcoming" ? upcomingOrders : pastOrders;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
      
      {/* =========================================================================
          CABECERA Y SELECTOR DE PESTAÑAS (PRÓXIMAS VS HISTORIAL PASADO)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-variant pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-electric-indigo/10 text-electric-indigo text-[11px] font-label-bold mb-1.5">
            <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
            <span>Billetera Digital Oficial</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-deep-slate tracking-tight">
            Mis Entradas
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5">
            Descarga tus pases oficiales o consulta tu historial permanente de eventos asistidos.
          </p>
        </div>

        {/* Pestañas Segmentadas */}
        <div className="inline-flex bg-surface-gray p-1 rounded-xl border border-surface-variant self-start">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "upcoming"
                ? "bg-white text-electric-indigo shadow-xs"
                : "text-on-surface-variant hover:text-deep-slate"
            }`}
          >
            <span>Próximos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "upcoming"
                  ? "bg-electric-indigo/10 text-electric-indigo"
                  : "bg-surface-variant/40 text-on-surface-variant"
              }`}
            >
              {upcomingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "past"
                ? "bg-white text-electric-indigo shadow-xs"
                : "text-on-surface-variant hover:text-deep-slate"
            }`}
          >
            <span>Eventos Pasados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === "past"
                  ? "bg-electric-indigo/10 text-electric-indigo"
                  : "bg-surface-variant/40 text-on-surface-variant"
              }`}
            >
              {pastOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONTENIDO: ESTADO DE CARGA, AUTENTICACIÓN O LISTADO
         ========================================================================= */}
      {isLoading ? (
        /* Skeletons */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`skel-${idx}`}
              className="bg-white rounded-2xl border border-surface-variant p-5 shadow-xs animate-pulse flex flex-col gap-4"
            >
              <div className="h-44 bg-surface-variant/40 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-surface-variant/50 rounded w-1/3" />
                <div className="h-6 bg-surface-variant/70 rounded w-3/4" />
                <div className="h-3.5 bg-surface-variant/30 rounded w-1/2" />
              </div>
              <div className="pt-3 border-t border-surface-variant flex justify-between">
                <div className="h-8 bg-surface-variant/40 rounded w-1/4" />
                <div className="h-9 bg-surface-variant/60 rounded-xl w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !isAuthenticated ? (
        /* Estado No Autenticado */
        <div className="bg-white rounded-2xl border border-surface-variant p-10 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-electric-indigo/10 text-electric-indigo flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h3 className="font-headline-md text-lg font-bold text-deep-slate">
            Inicia sesión para ver tus entradas
          </h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            Tus compras y pases digitales con código QR oficial quedan vinculados a tu cuenta registrada.
          </p>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold shadow-md shadow-electric-indigo/20 transition-all cursor-pointer"
          >
            Iniciar Sesión
          </Link>
        </div>
      ) : displayedOrders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-surface-variant p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-gray text-on-surface-variant flex items-center justify-center border border-surface-variant">
            <span className="material-symbols-outlined text-3xl text-electric-indigo">
              {activeTab === "upcoming" ? "event_available" : "history"}
            </span>
          </div>
          <h3 className="font-headline-md text-lg font-bold text-deep-slate">
            {activeTab === "upcoming"
              ? "No tienes entradas para próximos eventos"
              : "No tienes eventos pasados registrados"}
          </h3>
          <p className="text-on-surface-variant text-xs max-w-sm mx-auto leading-relaxed">
            {activeTab === "upcoming"
              ? "Tus compras completadas aparecerán aquí con su código QR oficial listo para ingresar al recinto."
              : "Tus compras pasadas se guardan de forma permanente en este historial para que siempre puedas consultar o descargar tus comprobantes."}
          </p>
          {activeTab === "upcoming" && (
            <Link
              href="/events"
              className="px-6 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold shadow-md shadow-electric-indigo/20 transition-all cursor-pointer"
            >
              Explorar Cartelera
            </Link>
          )}
        </div>
      ) : (
        /* =====================================================================
            GRID DE COMPRAS CON ACCESO A DESCARGA E IMPRESIÓN
           ===================================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedOrders.map((order) => {
            const fallbackImage =
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80";

            return (
              <article
                key={order.orderId}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-surface-variant flex flex-col justify-between group transition-all duration-200"
              >
                {/* Banner del Evento */}
                <div className="h-44 w-full overflow-hidden relative bg-slate-900">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={order.bannerImageUrl || fallbackImage}
                    alt={order.eventTitle}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                  />

                  {/* Badges superiores sobre el banner */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-md text-deep-slate border border-surface-variant/40 shadow-xs">
                      {order.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs ${
                        order.isPast ? "bg-slate-600" : "bg-electric-indigo"
                      }`}
                    >
                      {order.isPast ? "Evento Finalizado" : "Pase Válido"}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-deep-slate/85 backdrop-blur-md text-white border border-white/20 shadow-xs">
                      {order.ticketCount} {order.ticketCount === 1 ? "Entrada" : "Entradas"}
                    </span>
                  </div>
                </div>

                {/* Contenido / Datos de la Compra */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant mb-1">
                      <span className="font-bold text-deep-slate">{order.orderCode}</span>
                      <span>Ref: {order.txCode}</span>
                    </div>

                    <h2 className="font-headline-md text-lg sm:text-xl font-bold text-deep-slate leading-tight group-hover:text-electric-indigo transition-colors mb-2.5">
                      {order.eventTitle}
                    </h2>

                    <div className="space-y-1.5 text-xs text-on-surface-variant font-medium">
                      <div className="flex items-center gap-2 text-deep-slate font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                          calendar_today
                        </span>
                        <span>{order.eventDateFormatted} • {order.eventTimeFormatted}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                          location_on
                        </span>
                        <span className="truncate">
                          {order.venueName}, {order.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                          confirmation_number
                        </span>
                        <span>
                          Zona: <strong className="text-deep-slate font-bold">{order.zoneName}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer de Tarjeta: Monto Total y Botones de Descarga */}
                  <div className="pt-4 border-t border-surface-variant flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                        Total Pagado
                      </span>
                      <span className="font-headline-md text-base sm:text-lg font-black text-deep-slate">
                        S/. {order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón QR Digital Rápido */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForQR(order);
                          setActiveTicketIndex(0);
                        }}
                        className="p-2.5 rounded-xl border border-surface-variant text-deep-slate hover:bg-surface-gray transition-colors cursor-pointer"
                        title="Ver código QR digital"
                      >
                        <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                          qr_code_2
                        </span>
                      </button>

                      {/* Botón Principal: Ver Entradas / Descargar PDF */}
                      <button
                        type="button"
                        onClick={() => setPrintOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-electric-indigo hover:bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-electric-indigo/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        <span>Descargar PDF</span>
                      </button>
                    </div>
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: VISUALIZADOR RÁPIDO DE PASE DIGITAL QR MÓVIL
         ========================================================================= */}
      {selectedOrderForQR && (
        <div className="fixed inset-0 bg-deep-slate/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-surface-variant animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header del Modal */}
            <div className="bg-deep-slate p-5 text-white flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-platinum-silver">
                  PASE DIGITAL OFICIAL
                </span>
                <h3 className="font-headline-md text-base font-bold truncate max-w-[220px] mt-0.5">
                  {selectedOrderForQR.eventTitle}
                </h3>
                <p className="text-[11px] text-platinum-silver">
                  {selectedOrderForQR.orderCode} • Entrada {activeTicketIndex + 1} de {selectedOrderForQR.ticketCount}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForQR(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Selector de Entrada si la orden tiene más de 1 boleto */}
            {selectedOrderForQR.tickets.length > 1 && (
              <div className="flex items-center justify-center gap-1 bg-surface-gray p-2 border-b border-surface-variant overflow-x-auto">
                {selectedOrderForQR.tickets.map((_, idx) => (
                  <button
                    key={`tck-sel-${idx}`}
                    type="button"
                    onClick={() => setActiveTicketIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      activeTicketIndex === idx
                        ? "bg-electric-indigo text-white shadow-xs"
                        : "bg-white text-on-surface-variant hover:text-deep-slate border border-surface-variant"
                    }`}
                  >
                    Ticket {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Contenedor del QR Real con Branding */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-surface-variant flex flex-col items-center justify-center mb-4">
                <QRCodeSVG
                  value={
                    selectedOrderForQR.tickets[activeTicketIndex]?.qrPayload ||
                    `QPH|ORD:${selectedOrderForQR.orderId}|TCK:${activeTicketIndex + 1}`
                  }
                  size={180}
                  level="H"
                  imageSettings={{
                    src: "/logo-qph.svg",
                    x: undefined,
                    y: undefined,
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
                <span className="mt-2.5 font-bold text-xs text-on-surface-variant font-mono">
                  {selectedOrderForQR.tickets[activeTicketIndex]?.ticketUuid
                    ? `QPH-TCK-${selectedOrderForQR.tickets[activeTicketIndex].ticketUuid.substring(0, 8).toUpperCase()}`
                    : `TICKET #${activeTicketIndex + 1}`}
                </span>
              </div>

              <div className="w-full text-left space-y-2 text-xs bg-surface-gray p-3.5 rounded-xl border border-surface-variant">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Zona:</span>
                  <span className="font-bold text-electric-indigo">
                    {selectedOrderForQR.tickets[activeTicketIndex]?.zoneName || selectedOrderForQR.zoneName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Fecha:</span>
                  <span className="font-semibold text-deep-slate">{selectedOrderForQR.eventDateFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Recinto:</span>
                  <span className="font-semibold text-deep-slate truncate max-w-[170px]">
                    {selectedOrderForQR.venueName}
                  </span>
                </div>
              </div>

              <div className="mt-5 w-full flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const orderToPrint = selectedOrderForQR;
                    setSelectedOrderForQR(null);
                    setPrintOrder(orderToPrint);
                  }}
                  className="w-full py-3 bg-electric-indigo hover:bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-electric-indigo/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Descargar Documento Oficial A4 (PDF)</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DRAWER DESLIZANTE DESDE LA DERECHA (VISOR / IMPRESIÓN OFICIAL PDF)
         ========================================================================= */}
      {printOrder && (
        <TicketPrintScreen
          isDrawer={true}
          orderNumber={printOrder.orderId}
          orderRef={printOrder.txCode || `TX-${printOrder.orderId}`}
          eventName={printOrder.eventTitle}
          eventSubtitle={`${printOrder.category} · Boletería Oficial QPH`}
          eventDate={printOrder.eventDateFormatted}
          eventTime={printOrder.eventTimeFormatted}
          eventVenue={printOrder.venueName}
          eventAddress={printOrder.venueAddress}
          tierName={printOrder.zoneName}
          tierZone={printOrder.zoneName}
          ticketCount={printOrder.ticketCount}
          unitPrice={printOrder.totalAmount / (printOrder.ticketCount || 1)}
          totalAmount={printOrder.totalAmount}
          holderName={userProfile?.name || "Titular Registrado QPH"}
          holderDni={userProfile?.email || "usuario@queplaneshoy.com"}
          tickets={printOrder.tickets.map((t) => ({
            ticketId: t.ticketId,
            ticketUuid: t.ticketUuid,
            ticketNumber: t.ticketNumber,
            zoneName: t.zoneName,
            tierName: t.tierName,
            unitPrice: t.unitPrice,
            qrPayload: t.qrPayload,
          }))}
          backLabel="Cerrar visor"
          onBack={() => setPrintOrder(null)}
        />
      )}

    </div>
  );
}
