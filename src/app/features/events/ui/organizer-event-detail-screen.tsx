"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUserUseCase } from "@/app/features/auth";
import { UserModel } from "@/app/features/auth/models/user.model";
import {
  getOrganizerEventReportUseCase,
  OrganizerEventReportModel,
  OrganizerEventReportDailySales,
  OrganizerEventReportZone,
} from "@/app/features/events";
import { getCategoryById } from "../constants/eventConstants";
import { OrganizerSidebar } from "./components/organizer-sidebar";
import { SettlementRequestDrawer } from "./components/settlement-request-drawer";

interface OrganizerEventDetailScreenProps {
  eventId: string;
}

function formatSoles(amount: number): string {
  return (Number(amount) || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function MultiZoneSalesLineChart({
  dailySales,
  zones,
}: {
  dailySales: OrganizerEventReportDailySales[];
  zones: OrganizerEventReportZone[];
}) {
  const [metric, setMetric] = useState<"tickets" | "revenue">("tickets");
  const [activeZoneIds, setActiveZoneIds] = useState<Set<string>>(
    () => new Set(zones.map((z) => z.id)),
  );
  const [showTotal, setShowTotal] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const toggleZone = (id: string) => {
    setActiveZoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1 || showTotal) {
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const dataPoints = dailySales;
  const n = dataPoints.length;

  const width = 1000;
  const height = 280;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    let m = 0;
    dataPoints.forEach((d) => {
      if (showTotal) {
        const val = metric === "tickets" ? d.ticketsSold : d.revenue;
        if (val > m) m = val;
      }
      d.zones.forEach((zd) => {
        if (activeZoneIds.has(zd.zoneId)) {
          const zVal = metric === "tickets" ? zd.ticketsSold : zd.revenue;
          if (zVal > m) m = zVal;
        }
      });
    });
    return m > 0 ? m * 1.15 : 10;
  }, [dataPoints, metric, activeZoneIds, showTotal]);

  const getX = (idx: number) => {
    if (n <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (idx / (n - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    return paddingTop + plotHeight - (val / maxVal) * plotHeight;
  };

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  const totalPoints = dataPoints.map((d, i) => {
    const val = metric === "tickets" ? d.ticketsSold : d.revenue;
    return `${getX(i)},${getY(val)}`;
  });
  const totalPolyline = totalPoints.join(" ");

  const zoneSeries = zones.map((zone) => {
    const pts = dataPoints.map((d, i) => {
      const zd = d.zones.find((z) => z.zoneId === zone.id);
      const val = zd ? (metric === "tickets" ? zd.ticketsSold : zd.revenue) : 0;
      return { x: getX(i), y: getY(val), val };
    });
    return {
      zone,
      points: pts.map((p) => `${p.x},${p.y}`).join(" "),
      rawPoints: pts,
      visible: activeZoneIds.has(zone.id),
    };
  });

  const activeHoverDay =
    hoverIndex !== null && hoverIndex < n ? dataPoints[hoverIndex] : null;

  return (
    <div className="space-y-4">
      {/* Controles del Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-deep-slate flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-electric-indigo">
              show_chart
            </span>
            <span>Evolución Diaria de Ventas</span>
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Compara el rendimiento por zona o activa el consolidado total.
          </p>
        </div>

        {/* Selector de Métrica */}
        <div className="flex items-center gap-1 bg-surface-gray p-1 rounded-xl border border-surface-variant">
          <button
            type="button"
            onClick={() => setMetric("tickets")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === "tickets"
                ? "bg-white text-electric-indigo shadow-xs"
                : "text-on-surface-variant hover:text-deep-slate"
            }`}
          >
            Boletos Vendidos
          </button>
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metric === "revenue"
                ? "bg-white text-electric-indigo shadow-xs"
                : "text-on-surface-variant hover:text-deep-slate"
            }`}
          >
            Recaudación (S/.)
          </button>
        </div>
      </div>

      {/* Leyenda y Filtros Interactivos por Zona */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowTotal((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
            showTotal
              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="w-2.5 h-0.5 bg-current border-t border-dashed" />
          <span>Total Consolidado</span>
        </button>

        {zones.map((zone) => {
          const isActive = activeZoneIds.has(zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => toggleZone(zone.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-deep-slate shadow-xs"
                  : "bg-surface-gray/50 text-slate-400 border-dashed border-slate-200 opacity-60"
              }`}
              style={{
                borderColor: isActive ? zone.color : undefined,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: zone.color }}
              />
              <span>{zone.name}</span>
            </button>
          );
        })}
      </div>

      {/* Gráfico SVG Responsive */}
      {n === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-surface-gray/40 rounded-2xl border border-surface-variant/60 text-center p-6">
          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
            query_stats
          </span>
          <p className="text-xs font-bold text-deep-slate">
            Aún no hay compras registradas
          </p>
          <p className="text-[11px] text-on-surface-variant">
            Las ventas diarias por zona aparecerán en cuanto los asistentes
            comiencen a comprar.
          </p>
        </div>
      ) : (
        <div className="relative bg-white rounded-2xl border border-surface-variant/80 p-3 overflow-hidden shadow-xs">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Cuadrícula Horizontal y Ticks */}
            {yTicks.map((tick, i) => {
              const y = getY(tick);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] font-bold fill-slate-400"
                  >
                    {metric === "tickets"
                      ? Math.round(tick)
                      : `S/.${Math.round(tick)}`}
                  </text>
                </g>
              );
            })}

            {/* Etiquetas de Fecha en Eje X */}
            {dataPoints.map((d, i) => {
              const x = getX(i);
              return (
                <g key={d.date}>
                  <text
                    x={x}
                    y={height - paddingBottom + 18}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-slate-500"
                  >
                    {d.date.length > 5 ? d.date.substring(5) : d.date}
                  </text>
                </g>
              );
            })}

            {/* Línea Vertical Hover */}
            {hoverIndex !== null && (
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={height - paddingBottom}
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* Línea Total Global */}
            {showTotal && (
              <g>
                <polyline
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  points={totalPolyline}
                />
                {dataPoints.map((d, i) => {
                  const val = metric === "tickets" ? d.ticketsSold : d.revenue;
                  return (
                    <circle
                      key={`total-${i}`}
                      cx={getX(i)}
                      cy={getY(val)}
                      r={hoverIndex === i ? 5 : 3.5}
                      fill="#0F172A"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            )}

            {/* Líneas por Zona */}
            {zoneSeries.map((zs) => {
              if (!zs.visible) return null;
              return (
                <g key={zs.zone.id}>
                  <polyline
                    fill="none"
                    stroke={zs.zone.color}
                    strokeWidth="2.5"
                    points={zs.points}
                    className="transition-all"
                  />
                  {zs.rawPoints.map((pt, i) => (
                    <circle
                      key={`${zs.zone.id}-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoverIndex === i ? 5 : 3}
                      fill={zs.zone.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              );
            })}

            {/* Zonas Invisibles de Interacción Hover */}
            {dataPoints.map((_, idx) => {
              const xCenter = getX(idx);
              const colWidth = n > 1 ? plotWidth / (n - 1) : plotWidth;
              return (
                <rect
                  key={idx}
                  x={xCenter - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}
          </svg>

          {/* Tooltip Flotante */}
          {activeHoverDay && hoverIndex !== null && (
            <div
              className="absolute top-4 pointer-events-none bg-deep-slate text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-20 border border-slate-700 animate-in fade-in zoom-in-95 duration-100"
              style={{
                left: `${Math.min(
                  Math.max(15, (getX(hoverIndex) / width) * 100),
                  70,
                )}%`,
              }}
            >
              <div className="font-extrabold text-[11px] text-electric-indigo border-b border-slate-700/80 pb-1 flex items-center justify-between gap-4">
                <span>📅 {activeHoverDay.date}</span>
                <span className="text-white font-black">
                  {metric === "tickets"
                    ? `${activeHoverDay.ticketsSold} entradas`
                    : `S/. ${formatSoles(activeHoverDay.revenue)}`}
                </span>
              </div>

              <div className="space-y-1 pt-0.5">
                {showTotal && (
                  <div className="flex items-center justify-between gap-4 font-bold text-slate-300 text-[10px]">
                    <span>Total Global:</span>
                    <span>
                      {activeHoverDay.ticketsSold} pases • S/.{" "}
                      {formatSoles(activeHoverDay.revenue)}
                    </span>
                  </div>
                )}

                {zones.map((zone) => {
                  const zd = activeHoverDay.zones.find(
                    (z) => z.zoneId === zone.id,
                  );
                  const sold = zd?.ticketsSold || 0;
                  const rev = zd?.revenue || 0;
                  return (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between gap-4 text-[10px] text-slate-200"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <span className="truncate">{zone.name}</span>
                      </div>
                      <span className="font-semibold shrink-0">
                        {sold} pases (S/. {formatSoles(rev)})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrganizerEventDetailScreen({
  eventId,
}: OrganizerEventDetailScreenProps) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [report, setReport] = useState<OrganizerEventReportModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "zones" | "shows" | "orders" | "timeline" | "funnel"
  >("zones");
  const [selectedUtmChannel, setSelectedUtmChannel] = useState<
    "instagram" | "facebook" | "tiktok" | "whatsapp"
  >("instagram");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSettlementDrawerOpen, setIsSettlementDrawerOpen] = useState(false);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTabsScroll = () => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkTabsScroll();
    window.addEventListener("resize", checkTabsScroll);
    return () => window.removeEventListener("resize", checkTabsScroll);
  }, [report]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const scrollAmount = 220;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#export-report-dropdown")) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExportMenuOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadReport = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const userRes = await getCurrentUserUseCase.execute();
    if (userRes.isErr()) {
      router.push(`/login?redirect=/organizer/events/${eventId}`);
      return;
    }
    setCurrentUser(userRes.value);

    const reportRes = await getOrganizerEventReportUseCase.execute(eventId);
    reportRes.match(
      (data) => {
        setReport(data);
        setIsLoading(false);
      },
      (err) => {
        setErrorMsg(
          err.message ||
            "No se pudo cargar el reporte del evento. Verifica que tengas los permisos correspondientes.",
        );
        setIsLoading(false);
      },
    );
  };

  useEffect(() => {
    if (eventId) {
      void loadReport();
    }
  }, [eventId]);

  // Generar y descargar Manifiesto de Asistentes en CSV (Optimizado para Excel en español con separador ;)
  const handleDownloadAttendeesCsv = () => {
    if (!report || report.recentOrders.length === 0) {
      showToast("Aún no hay compras registradas para este evento.");
      return;
    }

    const headers = [
      "Código de Orden",
      "Fecha y Hora",
      "Comprador",
      "Email",
      "Detalle de Entradas",
      "Cantidad",
      "Cupón Aplicado",
      "Total Pagado (S/.)",
      "Método de Pago",
      "Estado",
    ];

    const rows = report.recentOrders.map((o) => [
      `"${o.orderCode}"`,
      `"${new Date(o.createdAt).toLocaleString("es-PE")}"`,
      `"${o.buyerName.replace(/"/g, '""')}"`,
      `"${o.buyerEmail}"`,
      `"${o.zonesSummary.replace(/"/g, '""')}"`,
      o.ticketsCount,
      `"${o.couponCode || "Sin cupón"}"`,
      o.totalAmount.toFixed(2),
      `"${o.paymentMethod.replace("culqi_", "").toUpperCase()}"`,
      `"${o.status === "paid" ? "PAGADO" : o.status.toUpperCase()}"`,
    ]);

    const csvContent =
      "\uFEFFsep=;\r\n" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `asistentes-${report.event.eventCode.replace("#", "")}-${report.event.slug}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Manifiesto CSV de asistentes descargado exitosamente.");
  };

  // Generar y descargar Resumen Contable en CSV (Tabular y formateado para Excel en español)
  const handleDownloadSalesSummaryCsv = () => {
    if (!report) return;

    const lines: string[] = [];
    lines.push("sep=;");
    lines.push(`"REPORTE CONTABLE Y RESUMEN FINANCIERO DE TAQUILLA";""`);
    lines.push(`"Ticketera:";"Qué Planes Hoy"`);
    lines.push(`"Evento:";"${report.event.name.replace(/"/g, '""')}"`);
    lines.push(`"Código Oficial:";"${report.event.eventCode}"`);
    lines.push(
      `"Recinto / Local:";"${(report.event.venue || "No especificado").replace(/"/g, '""')} - ${report.event.city}"`,
    );
    lines.push(`"Estado del Evento:";"${report.event.statusLabel}"`);
    lines.push(`"Fecha de Emisión:";"${new Date().toLocaleString("es-PE")}"`);
    lines.push(`"";""`);

    lines.push(`"RESUMEN EJECUTIVO DE VENTAS";"VALOR";"OBSERVACIONES"`);
    lines.push(
      `"Aforo Total Habilitado";${report.summary.totalCapacity};"Capacidad total sumada de zonas"`,
    );
    lines.push(
      `"Boletos Vendidos Confirmados";${report.summary.ticketsSold};"Pases pagados emitidos"`,
    );
    lines.push(
      `"Boletos Escaneados en Puerta";${report.summary.ticketsUsed};"Asistentes validados con QR"`,
    );
    lines.push(
      `"Boletos Disponibles Restantes";${report.summary.ticketsRemaining};"Entradas aún en venta"`,
    );
    lines.push(
      `"Porcentaje de Ocupación";"${report.summary.occupancyPercentage}%";"Tasa de llenado del local"`,
    );
    lines.push(
      `"Porcentaje de Asistencia";"${report.summary.checkInPercentage}%";"% de compradores ingresados"`,
    );
    lines.push(
      `"Recaudación Bruta (S/.)";${report.summary.grossRevenue.toFixed(2)};"Ventas nominales de tickets"`,
    );
    lines.push(
      `"Descuentos por Cupones (S/.)";${report.summary.couponsDiscountAmount.toFixed(2)};"Rebajas otorgadas por promociones"`,
    );
    lines.push(
      `"Recaudación Neta en Custodia (S/.)";${report.summary.netSalesRevenue.toFixed(2)};"Monto neto final de taquilla"`,
    );
    lines.push(
      `"Comisiones Acumuladas Ticketera (S/.)";${report.summary.totalServiceFee.toFixed(2)};"Cargos por servicio aplicados"`,
    );
    lines.push(
      `"Ticket Promedio (S/.)";${report.summary.averageTicketPrice.toFixed(2)};"Gasto medio por entrada"`,
    );
    lines.push(
      `"Total de Órdenes Pagadas";${report.summary.totalOrdersCount};"Transacciones únicas aprobadas"`,
    );
    lines.push(`"";"";""`);

    lines.push(
      `"ZONA";"AFORO TOTAL";"VENDIDOS";"RESTANTES";"OCUPACIÓN (%)";"PRECIO LISTA (S/.)";"PRECIO ACTIVO (S/.)";"TOTAL RECAUDADO (S/.)";"POLÍTICA DE COMISIÓN"`,
    );

    let sumCap = 0;
    let sumSold = 0;
    let sumRem = 0;
    let sumRev = 0;

    report.zones.forEach((z) => {
      sumCap += z.capacity;
      sumSold += z.soldCount;
      sumRem += z.remainingTickets;
      sumRev += z.revenue;

      const feePolicy = z.feeIncluded
        ? "Fee Incluido (Asumido por Promotor)"
        : "+Fee (Cobrado al Comprador)";

      lines.push(
        `"${z.name.replace(/"/g, '""')}";${z.capacity};${z.soldCount};${z.remainingTickets};"${z.occupancyPercentage}%";${z.regularPrice.toFixed(2)};${z.activePrice.toFixed(2)};${z.revenue.toFixed(2)};"${feePolicy}"`,
      );
    });

    const globalOcc =
      sumCap > 0 ? ((sumSold / sumCap) * 100).toFixed(1) : "0.0";
    lines.push(
      `"TOTAL CONSOLIDADO";${sumCap};${sumSold};${sumRem};"${globalOcc}%";"-";"-";${sumRev.toFixed(2)};"-"`,
    );

    const csvContent = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `reporte-contable-${report.event.eventCode.replace("#", "")}-${report.event.slug}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Reporte contable CSV descargado exitosamente.");
  };

  const categoryMeta = useMemo(() => {
    return report ? getCategoryById(report.event.category) : null;
  }, [report]);

  return (
    <div className="bg-surface min-h-screen">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-slate text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex gap-6">
          <OrganizerSidebar
            isMobileOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />

          <main className="flex-1 min-w-0 space-y-6">
            {/* Navegación y Botón Actualizar */}
            <div className="flex items-center justify-between">
              <Link
                href="/organizer/events"
                className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-electric-indigo transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                <span>Volver al listado de eventos</span>
              </Link>

              {report && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void loadReport()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-surface-variant text-slate-700 text-xs font-bold hover:bg-surface-gray transition-all cursor-pointer disabled:opacity-60"
                    title="Actualizar métricas en tiempo real"
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        isLoading
                          ? "animate-spin text-electric-indigo"
                          : "text-slate-500"
                      }`}
                    >
                      refresh
                    </span>
                    <span className="hidden sm:inline">Actualizar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Estado de Carga */}
            {isLoading && (
              <div className="bg-white rounded-2xl border border-surface-variant p-12 text-center space-y-4">
                <span className="material-symbols-outlined text-4xl text-electric-indigo animate-spin">
                  progress_activity
                </span>
                <p className="text-sm font-bold text-deep-slate">
                  Cargando métricas de ventas y analítica...
                </p>
              </div>
            )}

            {/* Error de Carga */}
            {!isLoading && errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-600 text-[24px]">
                    error
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-red-900">
                      No pudimos cargar el reporte del evento
                    </h3>
                    <p className="text-xs text-red-700 mt-1">{errorMsg}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => void loadReport()}
                    className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100/50 transition-colors cursor-pointer"
                  >
                    Reintentar
                  </button>
                  <Link
                    href="/organizer/events"
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
                  >
                    Volver a mis eventos
                  </Link>
                </div>
              </div>
            )}

            {/* Contenido Principal del Reporte */}
            {!isLoading && report && (
              <>
                {/* 1. Header Compacto del Evento */}
                <div className="bg-white rounded-2xl border border-surface-variant p-4 sm:p-5 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-surface-gray border border-surface-variant/80 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {report.event.imageUrl ? (
                          <img
                            src={report.event.imageUrl}
                            alt={report.event.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-slate-400">
                            confirmation_number
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                              report.event.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : report.event.status === "completed"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {report.event.statusLabel}
                          </span>

                          {categoryMeta && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-electric-indigo font-bold text-[10px] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">
                                {categoryMeta.icon}
                              </span>
                              <span>{categoryMeta.label}</span>
                            </span>
                          )}

                          <span className="px-1.5 py-0.5 rounded bg-surface-gray text-on-surface-variant font-bold text-[10px]">
                            ID: {report.event.eventCode}
                          </span>
                        </div>

                        <h1 className="text-lg md:text-xl font-extrabold text-deep-slate tracking-tight">
                          {report.event.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-on-surface-variant font-semibold pt-0.5">
                          {report.shows.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-electric-indigo">
                                calendar_today
                              </span>
                              <span>{report.shows[0].dateFormatted}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-electric-indigo">
                              location_on
                            </span>
                            <span>
                              {report.event.venue
                                ? `${report.event.venue} • ${report.event.city}`
                                : report.event.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[15px] text-electric-indigo">
                              confirmation_number
                            </span>
                            <span>
                              Capacidad:{" "}
                              {report.summary.totalCapacity.toLocaleString(
                                "es-PE",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción operativos */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Botón Principal: Estado o Solicitud de Liquidación */}
                      {report.event.settlementStatus ? (
                        <button
                          type="button"
                          onClick={() => setIsSettlementDrawerOpen(true)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow-xs hover:shadow active:scale-95 ${
                            report.event.settlementStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                              : report.event.settlementStatus === "approved"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200"
                                : "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                          }`}
                          title="Consultar estado de la liquidación y comprobantes"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {report.event.settlementStatus === "paid"
                              ? "verified"
                              : "schedule"}
                          </span>
                          <span>
                            {report.event.settlementStatusLabel ||
                              "Ver Liquidación"}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsSettlementDrawerOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            account_balance_wallet
                          </span>
                          <span>Solicitar Liquidación</span>
                        </button>
                      )}

                      {report.event.hasLandingPage && report.event.slug && (
                        <Link
                          href={`/e/${report.event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-electric-indigo/50 hover:border-electric-indigo text-electric-indigo hover:bg-electric-indigo/5 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            open_in_new
                          </span>
                          <span>Ver Landing</span>
                        </Link>
                      )}

                      {/* Dropdown Agrupado de Exportación de Reportes */}
                      <div className="relative" id="export-report-dropdown">
                        <button
                          type="button"
                          onClick={() => setIsExportMenuOpen((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-gray hover:bg-surface-variant text-deep-slate border border-surface-variant font-bold text-xs transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-600">
                            download
                          </span>
                          <span>Descargar Reportes</span>
                          <span
                            className={`material-symbols-outlined text-[16px] text-slate-500 transition-transform ${
                              isExportMenuOpen ? "rotate-180" : ""
                            }`}
                          >
                            arrow_drop_down
                          </span>
                        </button>

                        {isExportMenuOpen && (
                          <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-surface-variant p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                setIsExportMenuOpen(false);
                                handleDownloadAttendeesCsv();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-deep-slate hover:bg-surface-gray transition-colors text-left cursor-pointer"
                            >
                              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-electric-indigo flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px]">
                                  people
                                </span>
                              </span>
                              <div>
                                <span className="block font-bold text-deep-slate">
                                  Manifiesto Asistentes
                                </span>
                                <span className="text-[10px] text-on-surface-variant">
                                  Lista con DNI, cupón y pago
                                </span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsExportMenuOpen(false);
                                handleDownloadSalesSummaryCsv();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-deep-slate hover:bg-surface-gray transition-colors text-left cursor-pointer"
                            >
                              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px]">
                                  table_view
                                </span>
                              </span>
                              <div>
                                <span className="block font-bold text-deep-slate">
                                  Reporte Contable
                                </span>
                                <span className="text-[10px] text-on-surface-variant">
                                  Resumen de taquilla y zonas
                                </span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner de Estado de Liquidación (Visible si ya fue solicitada) */}
                {report.event.settlementStatus && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <span className="material-symbols-outlined text-[24px]">
                          {report.event.settlementStatus === "paid"
                            ? "verified"
                            : "account_balance"}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                            {report.event.settlementStatus === "paid"
                              ? "Liquidación Completada y Pagada"
                              : "Liquidación de Fondos en Trámite"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              report.event.settlementStatus === "paid"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {report.event.settlementStatusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-amber-950/80 mt-1">
                          Solicitud por{" "}
                          <strong className="text-deep-slate font-extrabold">
                            S/.{" "}
                            {formatSoles(
                              report.event.settlementAmount ||
                                report.summary.netSalesRevenue,
                            )}
                          </strong>
                          {report.event.settlementBankName
                            ? ` destinada a tu cuenta ${report.event.settlementBankName}`
                            : ""}
                          {report.event.settlementRequestedAt
                            ? ` enviada el ${new Date(
                                report.event.settlementRequestedAt,
                              ).toLocaleDateString("es-PE", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}`
                            : ""}
                          . Plazo estimado de transferencia: 24h a 72h hábiles.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSettlementDrawerOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-amber-300/80 hover:bg-amber-50 text-amber-900 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        visibility
                      </span>
                      <span>Ver Comprobante y Detalle</span>
                    </button>
                  </div>
                )}

                {/* 2. KPIs Clave de Recaudación y Aforo (Compacto en Mobile) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {/* KPI 1: Recaudación Neta */}
                  <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                        Recaudación Neta
                      </span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                          payments
                        </span>
                      </span>
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-black text-deep-slate tracking-tight truncate">
                        S/. {formatSoles(report.summary.netSalesRevenue)}
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                        Bruto: S/. {formatSoles(report.summary.grossRevenue)}
                        {report.summary.couponsDiscountAmount > 0 && (
                          <span className="text-emerald-700 block text-[9px] sm:text-[10px]">
                            Cupones: -S/.{" "}
                            {formatSoles(report.summary.couponsDiscountAmount)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* KPI 2: Aforo y Boletos Vendidos */}
                  <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                        Ocupación General
                      </span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 text-electric-indigo flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                          confirmation_number
                        </span>
                      </span>
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-black text-deep-slate tracking-tight">
                        {report.summary.ticketsSold.toLocaleString("es-PE")}
                        <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant ml-1">
                          /{" "}
                          {report.summary.totalCapacity.toLocaleString("es-PE")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                        <div className="flex-1 h-1.5 sm:h-2 rounded-full bg-surface-gray overflow-hidden">
                          <div
                            className="h-full bg-electric-indigo transition-all"
                            style={{
                              width: `${Math.min(100, report.summary.occupancyPercentage)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-extrabold text-electric-indigo shrink-0">
                          {report.summary.occupancyPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KPI 3: Check-in en Puerta (Atenuado si aún no inicia el evento) */}
                  {report.summary.ticketsUsed === 0 ? (
                    <div className="bg-slate-50/70 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                          Asistencia en Puerta
                        </span>
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                            qr_code_scanner
                          </span>
                        </span>
                      </div>
                      <div>
                        <div className="text-lg sm:text-2xl font-black text-slate-400 tracking-tight">
                          0
                          <span className="text-[10px] sm:text-xs font-medium text-slate-400 ml-1">
                            ingresados
                          </span>
                        </div>
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span className="truncate">
                              Se activará el día del evento
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                          Asistencia en Puerta
                        </span>
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                            qr_code_scanner
                          </span>
                        </span>
                      </div>
                      <div>
                        <div className="text-lg sm:text-2xl font-black text-deep-slate tracking-tight">
                          {report.summary.ticketsUsed.toLocaleString("es-PE")}
                          <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant ml-1">
                            ingresados
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                          {report.summary.checkInPercentage}% confirmada
                        </p>
                      </div>
                    </div>
                  )}

                  {/* KPI 4: Ticket Promedio y Órdenes */}
                  <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                        Ticket Promedio
                      </span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                          point_of_sale
                        </span>
                      </span>
                    </div>
                    <div>
                      <div className="text-lg sm:text-2xl font-black text-deep-slate tracking-tight truncate">
                        S/. {formatSoles(report.summary.averageTicketPrice)}
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                        {report.summary.totalOrdersCount} órdenes pagadas
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Pestañas de Navegación por Secciones (Con Indicadores de Scroll en Mobile) */}
                <div className="relative group/tabs border-b border-surface-variant">
                  {/* Flecha Izquierda de Navegación */}
                  {canScrollLeft && (
                    <button
                      type="button"
                      onClick={() => scrollTabs("left")}
                      aria-label="Ver pestañas anteriores"
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-surface-variant flex items-center justify-center text-deep-slate hover:bg-surface-gray transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_left
                      </span>
                    </button>
                  )}

                  {/* Degradado indicador izquierdo */}
                  {canScrollLeft && (
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent z-10" />
                  )}

                  {/* Contenedor desplazable de Tabs */}
                  <div
                    ref={tabsContainerRef}
                    onScroll={checkTabsScroll}
                    className="flex items-center gap-1 sm:gap-2 overflow-x-auto scroll-smooth px-1 scrollbar-none"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab("zones")}
                      className={`px-3.5 py-3 font-bold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeTab === "zones"
                          ? "border-electric-indigo text-electric-indigo"
                          : "border-transparent text-on-surface-variant hover:text-deep-slate"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        analytics
                      </span>
                      <span>Zonas y Preventas ({report.zones.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("shows")}
                      className={`px-3.5 py-3 font-bold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeTab === "shows"
                          ? "border-electric-indigo text-electric-indigo"
                          : "border-transparent text-on-surface-variant hover:text-deep-slate"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        event
                      </span>
                      <span>Funciones ({report.shows.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("orders")}
                      className={`px-3.5 py-3 font-bold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeTab === "orders"
                          ? "border-electric-indigo text-electric-indigo"
                          : "border-transparent text-on-surface-variant hover:text-deep-slate"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        receipt_long
                      </span>
                      <span>
                        Últimas Órdenes ({report.recentOrders.length})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("timeline")}
                      className={`px-3.5 py-3 font-bold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeTab === "timeline"
                          ? "border-electric-indigo text-electric-indigo"
                          : "border-transparent text-on-surface-variant hover:text-deep-slate"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        show_chart
                      </span>
                      <span>Ventas por Día ({report.dailySales.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("funnel")}
                      className={`px-3.5 py-3 font-bold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        activeTab === "funnel"
                          ? "border-electric-indigo text-electric-indigo"
                          : "border-transparent text-on-surface-variant hover:text-deep-slate"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        insights
                      </span>
                      <span>
                        Embudo y Redes ({report.funnel?.uniqueVisitors || 0})
                      </span>
                    </button>
                  </div>

                  {/* Degradado y Flecha Derecha de Navegación */}
                  {canScrollRight && (
                    <>
                      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface via-surface/80 to-transparent z-10" />
                      <button
                        type="button"
                        onClick={() => scrollTabs("right")}
                        aria-label="Ver más pestañas a la derecha"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white shadow-md border border-surface-variant flex items-center justify-center text-electric-indigo hover:bg-surface-gray transition-all cursor-pointer animate-pulse"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          chevron_right
                        </span>
                      </button>
                    </>
                  )}
                </div>

                {/* CONTENIDO TAB 1: ZONAS Y PREVENTAS */}
                {activeTab === "zones" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.zones.map((zone) => (
                        <div
                          key={zone.publicUuid}
                          className="bg-white rounded-2xl border border-surface-variant p-5 shadow-xs space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-full shrink-0"
                                  style={{ backgroundColor: zone.color }}
                                />
                                <h3 className="font-extrabold text-base text-deep-slate truncate">
                                  {zone.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                    zone.feeIncluded
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-indigo-50 text-electric-indigo"
                                  }`}
                                  title={
                                    zone.feeIncluded
                                      ? "Comisión incluida (asumida por promotor)"
                                      : "Comisión al comprador"
                                  }
                                >
                                  {zone.feeIncluded
                                    ? "Fee Inc."
                                    : "+Fee al Comprador"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 bg-surface-gray/50 rounded-xl px-3 border border-surface-variant/40 text-center">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                                  Aforo
                                </span>
                                <span className="text-sm font-extrabold text-deep-slate">
                                  {zone.capacity.toLocaleString("es-PE")}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                                  Vendidos
                                </span>
                                <span className="text-sm font-extrabold text-electric-indigo">
                                  {zone.soldCount.toLocaleString("es-PE")}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                                  En Puerta
                                </span>
                                <span className="text-sm font-extrabold text-emerald-600">
                                  {zone.usedCount.toLocaleString("es-PE")}
                                </span>
                              </div>
                            </div>

                            {/* Barra de progreso de aforo */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-on-surface-variant font-medium">
                                  Ocupación
                                </span>
                                <span className="font-bold text-deep-slate">
                                  {zone.occupancyPercentage}% (
                                  {zone.remainingTickets} libres)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-surface-gray overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    backgroundColor: zone.color,
                                    width: `${Math.min(100, zone.occupancyPercentage)}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Desglose de Precios y Preventas Activas */}
                            <div className="pt-2 border-t border-surface-variant/60 space-y-1.5">
                              <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
                                Precios y Fases
                              </span>
                              <div className="space-y-1">
                                {zone.tiers.map((tier) => (
                                  <div
                                    key={`${zone.id}-tier-${tier.tierNumber}`}
                                    className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                      tier.isActive
                                        ? "bg-indigo-50/50 border-indigo-200 text-deep-slate"
                                        : "bg-white border-surface-variant/40 text-slate-500"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {tier.isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-electric-indigo animate-pulse" />
                                      )}
                                      <span className="font-bold">
                                        {tier.name}
                                      </span>
                                      {tier.isActive && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-electric-indigo text-white font-extrabold uppercase">
                                          Activo
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-medium">
                                        {tier.soldCount}{" "}
                                        {tier.capacity
                                          ? `/ ${tier.capacity}`
                                          : ""}{" "}
                                        tickets
                                      </span>
                                      <span className="font-black text-deep-slate">
                                        S/. {formatSoles(tier.price)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-surface-variant/60 flex items-center justify-between">
                            <span className="text-xs font-semibold text-on-surface-variant">
                              Recaudado en Zona:
                            </span>
                            <span className="text-base font-black text-deep-slate">
                              S/. {formatSoles(zone.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENIDO TAB 2: FUNCIONES / SHOWS */}
                {activeTab === "shows" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.shows.map((show) => (
                        <div
                          key={show.publicUuid}
                          className="bg-white rounded-2xl border border-surface-variant p-5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-deep-slate truncate">
                              {show.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700">
                              {show.status}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-on-surface-variant">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                                schedule
                              </span>
                              <span>{show.dateFormatted}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                                timer
                              </span>
                              <span>
                                Duración estimada: {show.durationHours} horas
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-variant/60 text-center">
                            <div className="bg-surface-gray/50 rounded-xl p-2 border border-surface-variant/40">
                              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                                Pases Emitidos
                              </span>
                              <span className="text-sm font-extrabold text-electric-indigo">
                                {show.ticketsSold}
                              </span>
                            </div>
                            <div className="bg-surface-gray/50 rounded-xl p-2 border border-surface-variant/40">
                              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                                Validados en Puerta
                              </span>
                              <span className="text-sm font-extrabold text-emerald-600">
                                {show.ticketsUsed}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CONTENIDO TAB 3: ÓRDENES Y COMPRADORES */}
                {activeTab === "orders" && (
                  <div className="bg-white rounded-2xl border border-surface-variant shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-surface-variant flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-deep-slate">
                        Historial de Compras Aprobadas
                      </h3>
                      <span className="text-xs text-on-surface-variant font-medium">
                        Mostrando las {report.recentOrders.length} compras más
                        recientes
                      </span>
                    </div>

                    {report.recentOrders.length === 0 ? (
                      <div className="p-12 text-center text-on-surface-variant text-xs">
                        Aún no se registran compras para este evento.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-surface-gray border-b border-surface-variant text-[11px] font-bold text-on-surface-variant uppercase">
                            <tr>
                              <th className="px-4 py-3">Código</th>
                              <th className="px-4 py-3">Fecha</th>
                              <th className="px-4 py-3">Comprador</th>
                              <th className="px-4 py-3">Entradas</th>
                              <th className="px-4 py-3">Pago</th>
                              <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-variant/60">
                            {report.recentOrders.map((ord) => (
                              <tr
                                key={ord.publicUuid}
                                className="hover:bg-surface-gray/40"
                              >
                                <td className="px-4 py-3 font-mono font-bold text-electric-indigo">
                                  {ord.orderCode}
                                </td>
                                <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                                  {new Date(ord.createdAt).toLocaleString(
                                    "es-PE",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-deep-slate">
                                    {ord.buyerName}
                                  </div>
                                  <div className="text-[11px] text-on-surface-variant">
                                    {ord.buyerEmail}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-deep-slate block">
                                    {ord.zonesSummary}
                                  </span>
                                  {ord.couponCode && (
                                    <span className="text-[10px] text-emerald-700 font-bold">
                                      Cupón: {ord.couponCode} (-S/.{" "}
                                      {formatSoles(ord.discountAmount)})
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded bg-surface-gray border border-surface-variant/60 font-semibold text-deep-slate text-[10px] uppercase">
                                    {ord.paymentMethod.replace("culqi_", "")}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-black text-deep-slate">
                                  S/. {formatSoles(ord.totalAmount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* CONTENIDO TAB 4: CRONOLOGÍA DE VENTAS MULTI-ZONA */}
                {activeTab === "timeline" && (
                  <div className="bg-white rounded-2xl border border-surface-variant shadow-xs p-6 space-y-6">
                    <MultiZoneSalesLineChart
                      dailySales={report.dailySales}
                      zones={report.zones}
                    />

                    {/* Resumen en fichas por fecha */}
                    {report.dailySales.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-surface-variant/40">
                        <span className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider block">
                          Detalle Desglosado por Fecha
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {report.dailySales.map((d) => (
                            <div
                              key={d.date}
                              className="p-3.5 rounded-xl bg-surface-gray border border-surface-variant/60 flex items-center justify-between"
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-deep-slate block">
                                  {d.date}
                                </span>
                                <span className="text-[11px] text-on-surface-variant font-semibold">
                                  {d.ticketsSold}{" "}
                                  {d.ticketsSold === 1 ? "boleto" : "boletos"}
                                </span>
                              </div>
                              <span className="text-sm font-extrabold text-electric-indigo">
                                S/. {formatSoles(d.revenue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CONTENIDO TAB 5: EMBUDO DE CONVERSIÓN Y REDES SOCIALES (UMAMI ANALYTICS) */}
                {activeTab === "funnel" && (
                  <div className="space-y-6">
                    {/* Tarjeta de Métricas Rápidas del Embudo (Compacto en Mobile 2x2) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                      {/* KPI 1: Visitantes Únicos */}
                      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                            Visitantes Únicos
                          </span>
                          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-50 text-electric-indigo flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                              visibility
                            </span>
                          </span>
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-black text-deep-slate tracking-tight truncate">
                            {(
                              report.funnel?.uniqueVisitors || 0
                            ).toLocaleString("es-PE")}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                            {(report.funnel?.pageviews || 0).toLocaleString(
                              "es-PE",
                            )}{" "}
                            páginas vistas
                          </p>
                        </div>
                      </div>

                      {/* KPI 2: Inicios de Compra */}
                      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                            Inicios Checkout
                          </span>
                          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                              shopping_cart_checkout
                            </span>
                          </span>
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-black text-deep-slate tracking-tight truncate">
                            {(
                              report.funnel?.checkoutInitiated || 0
                            ).toLocaleString("es-PE")}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                            Selección de entradas
                          </p>
                        </div>
                      </div>

                      {/* KPI 3: Órdenes Pagadas */}
                      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                            Órdenes Pagadas
                          </span>
                          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                              verified
                            </span>
                          </span>
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tight truncate">
                            {(report.funnel?.ordersPaid || 0).toLocaleString(
                              "es-PE",
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                            Compras exitosas
                          </p>
                        </div>
                      </div>

                      {/* KPI 4: Tasa de Conversión */}
                      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-surface-variant shadow-xs space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-on-surface-variant truncate">
                            Conversión
                          </span>
                          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                              trending_up
                            </span>
                          </span>
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-black text-amber-600 tracking-tight truncate">
                            {report.funnel?.conversionRate || 0}%
                          </div>
                          <p className="text-[10px] sm:text-[11px] font-semibold text-on-surface-variant mt-0.5 truncate">
                            Visitas ➔ Venta final
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico Visual del Embudo (Funnel Steps) */}
                    <div className="bg-white rounded-2xl border border-surface-variant shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm sm:text-base font-extrabold text-deep-slate">
                            Embudo de Conversión de Taquilla
                          </h3>
                          <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5">
                            Seguimiento de la retención de usuarios desde que
                            aterrizan en la landing hasta que pagan sus boletos.
                          </p>
                        </div>
                        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-[11px] font-bold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Medición activa</span>
                        </span>
                      </div>

                      <div className="space-y-4">
                        {(report.funnel?.steps || []).map((step, idx) => {
                          const isFirst = idx === 0;
                          const isLast =
                            idx === (report.funnel?.steps.length || 0) - 1;

                          return (
                            <div key={step.step} className="space-y-2">
                              <div className="bg-surface-gray/50 border border-surface-variant/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                                      isFirst
                                        ? "bg-indigo-100 text-electric-indigo"
                                        : isLast
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-purple-100 text-purple-700"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-extrabold text-deep-slate">
                                      {step.step}
                                    </h4>
                                    <p className="text-xs text-on-surface-variant font-medium">
                                      {step.count.toLocaleString("es-PE")}{" "}
                                      personas
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                                  <div>
                                    <span className="text-sm font-black text-deep-slate block">
                                      {step.percentage}%
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                                      Retención
                                    </span>
                                  </div>

                                  {!isFirst && step.dropOffPercentage > 0 && (
                                    <div className="border-l border-surface-variant pl-4">
                                      <span className="text-xs font-bold text-red-600 block">
                                        -{step.dropOffPercentage}%
                                      </span>
                                      <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                                        Abandono
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Barra de Progreso Visual */}
                              <div className="h-2.5 rounded-full bg-surface-gray overflow-hidden">
                                <div
                                  className={`h-full transition-all rounded-full ${
                                    isFirst
                                      ? "bg-electric-indigo"
                                      : isLast
                                        ? "bg-emerald-500"
                                        : "bg-purple-500"
                                  }`}
                                  style={{
                                    width: `${Math.max(5, step.percentage)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fila Dividida: Redes Sociales / UTMs vs Generador de Links */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Desglose de Redes Sociales y Fuentes */}
                      <div className="bg-white rounded-2xl border border-surface-variant shadow-xs p-4 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs sm:text-sm font-extrabold text-deep-slate flex items-center gap-2">
                            <span className="material-symbols-outlined text-[17px] sm:text-[18px] text-electric-indigo">
                              share
                            </span>
                            <span>Tráfico por Redes Sociales y Canales</span>
                          </h3>
                        </div>

                        {!report.funnel?.trafficSources ||
                        report.funnel.trafficSources.length === 0 ? (
                          <div className="p-6 sm:p-8 text-center bg-surface-gray/50 rounded-xl space-y-2">
                            <span className="material-symbols-outlined text-2xl sm:text-3xl text-slate-400">
                              hourglass_empty
                            </span>
                            <p className="text-xs font-bold text-deep-slate">
                              Aún no se ha registrado tráfico con UTMs
                            </p>
                            <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto">
                              Comparte tu enlace de evento en redes sociales
                              usando el generador de la derecha para medir tus
                              campañas.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 sm:space-y-3">
                            {report.funnel.trafficSources.map((source) => {
                              const sLower = source.source.toLowerCase();
                              let iconBg = "bg-slate-100 text-slate-700";
                              let iconName = "language";

                              if (sLower.includes("instagram")) {
                                iconBg = "bg-pink-100 text-pink-600";
                                iconName = "photo_camera";
                              } else if (sLower.includes("facebook")) {
                                iconBg = "bg-blue-100 text-blue-600";
                                iconName = "thumb_up";
                              } else if (sLower.includes("tiktok")) {
                                iconBg = "bg-slate-900 text-white";
                                iconName = "music_note";
                              } else if (sLower.includes("whatsapp")) {
                                iconBg = "bg-emerald-100 text-emerald-600";
                                iconName = "chat";
                              } else if (sLower.includes("google")) {
                                iconBg = "bg-amber-100 text-amber-700";
                                iconName = "search";
                              } else if (
                                sLower.includes("directo") ||
                                sLower.includes("navegación")
                              ) {
                                iconBg = "bg-slate-100 text-slate-700";
                                iconName = "explore";
                              }

                              return (
                                <div
                                  key={source.source}
                                  className="p-3.5 rounded-xl bg-surface-gray border border-surface-variant/50 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <span
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}
                                      >
                                        <span className="material-symbols-outlined text-[15px]">
                                          {iconName}
                                        </span>
                                      </span>
                                      <span className="font-extrabold text-xs text-deep-slate">
                                        {source.source}
                                      </span>
                                    </div>

                                    <div className="text-right">
                                      <span className="font-bold text-xs text-deep-slate block">
                                        {source.visitors.toLocaleString(
                                          "es-PE",
                                        )}{" "}
                                        visitas
                                      </span>
                                      <span className="text-[10px] font-black text-electric-indigo">
                                        {source.percentage}%
                                      </span>
                                    </div>
                                  </div>

                                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                      className="h-full bg-electric-indigo rounded-full"
                                      style={{
                                        width: `${Math.max(4, source.percentage)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Generador de Enlaces con UTMs para el Organizador */}
                      <div className="bg-white rounded-2xl border border-surface-variant shadow-xs p-4 sm:p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="text-sm font-extrabold text-deep-slate flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                              link
                            </span>
                            <span>Generador de Enlaces UTM para Campañas</span>
                          </h3>
                          <p className="text-xs text-on-surface-variant">
                            Selecciona la red social donde publicarás tu evento.
                            Al usar este enlace, Umami registrará cada clic y
                            venta atribuida a esa red.
                          </p>

                          {/* Selector de Canal */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {(
                              [
                                {
                                  id: "instagram",
                                  label: "Instagram",
                                  icon: "photo_camera",
                                },
                                {
                                  id: "facebook",
                                  label: "Facebook",
                                  icon: "thumb_up",
                                },
                                {
                                  id: "tiktok",
                                  label: "TikTok",
                                  icon: "music_note",
                                },
                                {
                                  id: "whatsapp",
                                  label: "WhatsApp",
                                  icon: "chat",
                                },
                              ] as const
                            ).map((ch) => (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => setSelectedUtmChannel(ch.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                  selectedUtmChannel === ch.id
                                    ? "bg-electric-indigo text-white border-electric-indigo shadow-xs"
                                    : "bg-surface-gray text-deep-slate border-surface-variant hover:bg-surface-variant/50"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {ch.icon}
                                </span>
                                <span>{ch.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* Enlace generado */}
                          <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant block">
                              Enlace con Etiqueta UTM (
                              {selectedUtmChannel.toUpperCase()})
                            </label>
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-gray border border-surface-variant text-xs text-deep-slate font-mono break-all select-all">
                              <span>
                                {typeof window !== "undefined"
                                  ? `${window.location.origin}/e/${report.event.slug}?utm_source=${selectedUtmChannel}&utm_medium=social&utm_campaign=taquilla`
                                  : `https://queplanhoy.com/e/${report.event.slug}?utm_source=${selectedUtmChannel}&utm_medium=social&utm_campaign=taquilla`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              const baseUrl =
                                typeof window !== "undefined"
                                  ? window.location.origin
                                  : "https://queplanhoy.com";
                              const url = `${baseUrl}/e/${report.event.slug}?utm_source=${selectedUtmChannel}&utm_medium=social&utm_campaign=taquilla`;
                              if (navigator.clipboard) {
                                void navigator.clipboard.writeText(url);
                                showToast(
                                  `Enlace de ${selectedUtmChannel.toUpperCase()} copiado al portapapeles.`,
                                );
                              }
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-deep-slate hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              content_copy
                            </span>
                            <span>
                              Copiar Enlace para{" "}
                              {selectedUtmChannel.toUpperCase()}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Drawer Lateral de Liquidación de Fondos */}
      <SettlementRequestDrawer
        isOpen={isSettlementDrawerOpen}
        onClose={() => setIsSettlementDrawerOpen(false)}
        eventIdentifier={eventId}
        eventName={report?.event?.name}
        onSuccess={() => void loadReport()}
      />
    </div>
  );
}
