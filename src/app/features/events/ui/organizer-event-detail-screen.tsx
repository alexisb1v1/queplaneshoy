'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ZoneItem {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
  sold: number;
  total: number;
  percentage: number;
  price: number;
  revenue: number;
  colorClass: string;
  isPaused?: boolean;
}

interface AdvanceHistoryItem {
  id: string;
  amount: string;
  date: string;
  ref: string;
  status: 'Liquidado' | 'En Proceso';
}

interface OrganizerEventDetailProps {
  eventId?: string;
}

export default function OrganizerEventDetailScreen({ eventId }: OrganizerEventDetailProps) {
  // Notificaciones interactivas
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de modales
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('50000');
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  // Zonas interactivas
  const [zones, setZones] = useState<ZoneItem[]>([
    {
      id: 'z-1',
      name: 'Platinum VIP Front',
      badge: 'Casi Agotado',
      badgeColor: 'bg-amber-100 text-amber-800',
      desc: 'Acceso preferente + Open Bar VIP',
      sold: 410,
      total: 450,
      percentage: 91,
      price: 145,
      revenue: 59450,
      colorClass: 'bg-vip-gold',
      isPaused: false,
    },
    {
      id: 'z-2',
      name: 'General Pista',
      badge: 'Alta Demanda',
      badgeColor: 'bg-indigo-100 text-primary',
      desc: 'Pista principal de pie',
      sold: 6100,
      total: 7500,
      percentage: 81,
      price: 55,
      revenue: 335500,
      colorClass: 'bg-electric-indigo',
      isPaused: false,
    },
    {
      id: 'z-3',
      name: 'Grada Baja Numerada',
      badge: 'Normal',
      badgeColor: 'bg-surface-container-highest text-on-surface-variant',
      desc: 'Asiento asignado Sectores 1 a 6',
      sold: 2140,
      total: 2800,
      percentage: 76,
      price: 75,
      revenue: 160500,
      colorClass: 'bg-secondary',
      isPaused: false,
    },
    {
      id: 'z-4',
      name: 'Grada Alta Sector B',
      badge: 'Disponible',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      desc: 'Asiento general superior',
      sold: 1200,
      total: 1750,
      percentage: 68,
      price: 40,
      revenue: 48000,
      colorClass: 'bg-platinum-silver',
      isPaused: false,
    },
  ]);

  // Historial de adelantos
  const [advances, setAdvances] = useState<AdvanceHistoryItem[]>([
    {
      id: 'ad-1',
      amount: '€80,000.00',
      date: '02 Oct 2024',
      ref: '#AD-8921',
      status: 'Liquidado',
    },
    {
      id: 'ad-2',
      amount: '€40,000.00',
      date: '18 Sep 2024',
      ref: '#AD-8104',
      status: 'Liquidado',
    },
  ]);

  // Saldo disponible
  const [availableBalance, setAvailableBalance] = useState(230520);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTogglePause = (zoneId: string) => {
    setZones(
      zones.map((z) => {
        if (z.id === zoneId) {
          const next = !z.isPaused;
          showToast(next ? `Venta de ${z.name} pausada temporalmente.` : `Venta de ${z.name} reanudada.`);
          return { ...z, isPaused: next };
        }
        return z;
      })
    );
  };

  const handleConfirmAdvance = () => {
    const numeric = parseFloat(advanceAmount) || 0;
    if (numeric <= 0 || numeric > availableBalance) {
      showToast('Por favor introduce un importe válido dentro de tu cupo disponible.');
      return;
    }
    const newAdv: AdvanceHistoryItem = {
      id: 'ad-' + Date.now(),
      amount: `€${numeric.toLocaleString()}.00`,
      date: 'Hoy',
      ref: `#AD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'En Proceso',
    };
    setAdvances([newAdv, ...advances]);
    setAvailableBalance((prev) => prev - numeric);
    setIsAdvanceModalOpen(false);
    showToast(`Adelanto de €${numeric.toLocaleString()} tramitado hacia tu IBAN verificado.`);
  };

  // Cálculo de totales
  const totalSold = zones.reduce((acc, z) => acc + z.sold, 0);
  const totalCapacity = zones.reduce((acc, z) => acc + z.total, 0);
  const totalRevenue = zones.reduce((acc, z) => acc + z.revenue, 0);
  const targetRevenue = 757750;
  const progressPercent = ((totalRevenue / targetRevenue) * 100).toFixed(1);

  return (
    <div className="bg-surface min-h-screen py-6 md:py-8">
      
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-electric-indigo text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Modal: Solicitar Adelanto */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-variant space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/40">
              <div className="flex items-center gap-2 text-deep-slate">
                <span className="material-symbols-outlined text-electric-indigo text-[24px]">payments</span>
                <h3 className="font-extrabold text-lg">Solicitar Adelanto de Fondos</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-gray flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-electric-indigo/5 border border-electric-indigo/20 space-y-1">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Cupo Inmediato Disponible
                </span>
                <span className="text-2xl font-extrabold text-electric-indigo">
                  €{availableBalance.toLocaleString()}.00
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  Transferencia SEPA instantánea a tu cuenta bancaria (IBAN verificado ES91 •••• 4821).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-deep-slate block">Importe a Solicitar (€)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">€</span>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-surface-gray border border-surface-variant text-base font-extrabold text-deep-slate outline-none focus:ring-1 focus:ring-electric-indigo"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Comisión de Gestión QPH (1.2%):</span>
                  <span className="font-bold text-deep-slate">€{((parseFloat(advanceAmount) || 0) * 0.012).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-surface-variant/40 pt-2 font-bold text-deep-slate">
                  <span>Importe Neto a Recibir:</span>
                  <span className="text-emerald-600">
                    €{((parseFloat(advanceAmount) || 0) * (1 - 0.012)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-gray text-deep-slate font-bold text-xs hover:bg-surface-variant transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdvance}
                className="flex-1 py-2.5 rounded-xl bg-electric-indigo text-white font-bold text-xs shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all"
              >
                Confirmar Transferencia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Liquidar Taquilla */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-variant space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/40">
              <div className="flex items-center gap-2 text-deep-slate">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
                <h3 className="font-extrabold text-lg">Liquidación Final de Taquilla</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-gray flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-surface-gray border border-surface-variant/60 space-y-2">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Recaudación Bruta Acumulada:</span>
                  <span className="font-extrabold text-deep-slate">€{totalRevenue.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>IVA Devengado (21%):</span>
                  <span className="font-bold text-deep-slate">-€{(totalRevenue * 0.21).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Comisión Plataforma QPH (8%):</span>
                  <span className="font-bold text-deep-slate">-€{(totalRevenue * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Total Adelantos Percibidos:</span>
                  <span className="font-bold text-deep-slate">-€120,000.00</span>
                </div>
                <div className="pt-2 border-t border-surface-variant flex justify-between font-extrabold text-sm text-deep-slate">
                  <span>Remanente a Conciliar:</span>
                  <span className="text-electric-indigo">
                    €{(totalRevenue * (1 - 0.21 - 0.08) - 120000).toLocaleString()}.00
                  </span>
                </div>
              </div>

              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Al solicitar el cierre, se emitirá la factura recapitulativa oficial conforme a la legislación tributaria y se congelarán los aforos para la emisión final.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-gray text-deep-slate font-bold text-xs hover:bg-surface-variant transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSettlementModalOpen(false);
                  showToast('Expediente de liquidación enviado al departamento financiero de QPH.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-deep-slate transition-all"
              >
                Emitir Conciliación
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
        
        {/* =========================================================================
            DYNAMIC NOTIFICATION / STATUS STRIP (STITCH EXACT MATCH)
           ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 md:p-5 border border-surface-variant shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </div>
            <div>
              <span className="font-bold text-sm text-deep-slate">Pico de ventas detectado en Preventa Fase 2</span>
              <span className="text-xs text-on-surface-variant ml-0 sm:ml-2 block sm:inline">
                +340 entradas vendidas en las últimas 3 horas para General Pista
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-gray px-3 py-1 text-xs font-extrabold text-on-surface-variant border border-surface-variant/40">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Taquilla en Tiempo Real
            </span>
          </div>
        </div>

        {/* =========================================================================
            BREADCRUMBS & CONTEXT ACTIONS HEADER
           ========================================================================= */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
              <Link
                href="/organizer/events"
                className="inline-flex items-center gap-1 hover:text-electric-indigo transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Mis Eventos Creados</span>
              </Link>
              <span className="text-platinum-silver">/</span>
              <span className="text-deep-slate font-extrabold">Ultra Music Fest Madrid 2025</span>
              <span className="rounded-md bg-surface-gray px-2 py-0.5 text-[11px] font-extrabold text-on-surface-variant border border-surface-variant/50">
                #EV-2025-UMF
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/events/1"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-surface-variant px-3.5 py-2 text-xs font-bold text-deep-slate hover:bg-surface-gray shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-electric-indigo">visibility</span>
                <span>Ver Landing Pública</span>
              </Link>
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-surface-variant px-3.5 py-2 text-xs font-bold text-deep-slate hover:bg-surface-gray shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
                <span>Editar Evento</span>
              </Link>
            </div>
          </div>

          {/* =========================================================================
              EVENT BANNER META SECTION
             ========================================================================= */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-6 md:p-8 border border-surface-variant shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-extrabold text-xs text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    En Venta • Preventa Fase 2
                  </span>
                  <span className="rounded-full bg-secondary-container px-3 py-1 font-extrabold text-xs text-on-secondary-container">
                    Festival Electrónica &amp; Live
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-deep-slate tracking-tight">
                  Ultra Music Fest Madrid 2025
                </h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-on-surface-variant text-xs md:text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-electric-indigo">calendar_today</span>
                    <span>15 - 16 Octubre 2025 (Apertura 16:00h)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-electric-indigo">location_on</span>
                    <span>Caja Mágica, Madrid, España</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-electric-indigo">group</span>
                    <span>Aforo Total: 12,500 personas</span>
                  </div>
                </div>
              </div>

              {/* Acciones principales de flujo */}
              <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
                <Link
                  href="/organizer/settlement"
                  className="inline-flex items-center gap-2 rounded-xl bg-surface-gray border border-surface-variant px-4 py-3 font-bold text-xs text-deep-slate hover:bg-surface-variant transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  <span>Liquidar Taquilla</span>
                </Link>

                <Link
                  href="/organizer/settlement"
                  className="group relative inline-flex items-center gap-2.5 rounded-xl bg-electric-indigo px-5 py-3 font-bold text-xs text-white shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                  <span>Solicitar Adelanto de Fondos</span>
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                    Inmediato
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3-PILLAR HIGH-IMPACT KPI ROW (STITCH EXACT MATCH)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* KPI 1: Gross Revenue */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 border border-surface-variant shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">
                  Recaudación Bruta
                </span>
                <p className="text-2xl md:text-3xl font-extrabold text-deep-slate mt-1">
                  €{totalRevenue.toLocaleString()}.00
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-electric-indigo/10 text-electric-indigo">
                <span className="material-symbols-outlined text-[24px]">monetization_on</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-surface-variant/40">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-2">
                <span>Meta (€{targetRevenue.toLocaleString()})</span>
                <span className="text-electric-indigo font-extrabold">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-gray overflow-hidden">
                <div
                  className="h-full rounded-full bg-electric-indigo transition-all duration-700"
                  style={{ width: `${Math.min(Number(progressPercent), 100)}%` }}
                />
              </div>
              <span className="mt-2 block text-xs text-platinum-silver">
                Quedan €{(targetRevenue - totalRevenue).toLocaleString()} para agotar taquilla
              </span>
            </div>
          </div>

          {/* KPI 2: Tickets Progress */}
          <div className="flex flex-col justify-between rounded-2xl bg-white p-6 border border-surface-variant shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">
                  Tickets Vendidos
                </span>
                <p className="text-2xl md:text-3xl font-extrabold text-deep-slate mt-1">
                  {totalSold.toLocaleString()}{' '}
                  <span className="text-base text-platinum-silver font-normal">/ {totalCapacity.toLocaleString()}</span>
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-surface-variant/40">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-2">
                <span>Aforo Confirmado</span>
                <span className="text-deep-slate font-extrabold">{(totalCapacity - totalSold).toLocaleString()} libres</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-gray overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${((totalSold / totalCapacity) * 100).toFixed(1)}%` }}
                />
              </div>
              <span className="mt-2 block text-xs text-platinum-silver">
                Velocidad actual: ~140 entradas/día
              </span>
            </div>
          </div>

          {/* KPI 3: Available Balance / Advance Spotlight */}
          <div className="relative overflow-hidden flex flex-col justify-between rounded-2xl bg-gradient-to-br from-white to-surface-gray p-6 border border-surface-variant shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-electric-indigo/5 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 mb-1">
                  <span className="material-symbols-outlined text-[13px]">lock_open</span>
                  Disponible Inmediato
                </div>
                <span className="block font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">
                  Balance para Retiro
                </span>
                <p className="text-2xl md:text-3xl font-extrabold text-electric-indigo mt-0.5">
                  €{availableBalance.toLocaleString()}.00
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-electric-indigo text-white shadow-xs">
                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-surface-variant/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-platinum-silver">Ya anticipado:</span>
                <span className="font-extrabold text-xs text-deep-slate block">€120,000.00 (2 tramos)</span>
              </div>
              <Link
                href="/organizer/settlement"
                className="inline-flex items-center gap-1 rounded-xl bg-deep-slate text-white px-3 py-1.5 font-bold text-xs hover:bg-electric-indigo transition-all cursor-pointer"
              >
                <span>Adelantar</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

        </div>

        {/* =========================================================================
            BENTO GRID: ZONE BREAKDOWN (8 COLS) + TREASURY ADVANCE DASHBOARD (4 COLS)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Desglose por Zona */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl bg-white p-6 md:p-8 border border-surface-variant shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-variant/40 pb-4">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-deep-slate">
                  Desglose de Taquilla por Zona
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Control de capacidad, volumen recaudado y precio por tipo de pase en tiempo real.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Informe de taquilla exportado en formato CSV.')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-surface-gray border border-surface-variant px-3 py-2 text-xs font-bold text-deep-slate hover:bg-surface-variant transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-electric-indigo">file_download</span>
                  <span>Exportar CSV</span>
                </button>
                <Link
                  href="/events/create"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-electric-indigo/10 text-electric-indigo px-3 py-2 text-xs font-bold hover:bg-electric-indigo hover:text-white transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Nuevo Tramo</span>
                </Link>
              </div>
            </div>

            {/* Listado de Zonas */}
            <div className="space-y-3.5">
              {zones.map((z) => (
                <div
                  key={z.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                    z.isPaused
                      ? 'bg-surface-gray/50 border-surface-variant/50 opacity-75'
                      : 'bg-surface-gray border-surface-variant/60 hover:bg-surface-variant/40'
                  }`}
                >
                  {/* Nombre y Badge */}
                  <div className="flex items-start gap-3.5 min-w-[220px]">
                    <div className={`w-2.5 h-12 rounded-full ${z.colorClass} shrink-0`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-deep-slate">{z.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${z.badgeColor}`}>
                          {z.badge}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant block mt-0.5">{z.desc}</span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="flex-1 max-w-xs flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                      <span>{z.sold.toLocaleString()} / {z.total.toLocaleString()} vendidos</span>
                      <span className="text-deep-slate">{z.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white overflow-hidden border border-surface-variant/40">
                      <div
                        className={`h-full rounded-full ${z.colorClass} transition-all duration-500`}
                        style={{ width: `${z.percentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-platinum-silver">
                      {(z.total - z.sold).toLocaleString()} disponibles
                    </span>
                  </div>

                  {/* Precio y Recaudación */}
                  <div className="text-left md:text-right min-w-[130px]">
                    <span className="font-extrabold text-sm text-deep-slate block">
                      €{z.revenue.toLocaleString()}.00
                    </span>
                    <span className="text-xs text-on-surface-variant">€{z.price}.00 / ticket</span>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-1 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => showToast(`Ajustando cupo para ${z.name}...`)}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-white hover:text-deep-slate shadow-2xs transition-all cursor-pointer"
                      title="Ajustar Cupo"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePause(z.id)}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        z.isPaused
                          ? 'text-electric-indigo bg-white shadow-2xs'
                          : 'text-on-surface-variant hover:bg-white hover:text-error'
                      }`}
                      title={z.isPaused ? 'Reanudar Venta' : 'Pausar Venta'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {z.isPaused ? 'play_circle' : 'pause_circle'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Módulo de Tesorería & Adelantos */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-white p-6 md:p-8 border border-surface-variant shadow-xs space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-variant/40">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-indigo/10 text-electric-indigo">
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  </div>
                  <h3 className="font-extrabold text-base text-deep-slate">Tesorería &amp; Adelantos</h3>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-extrabold">
                  Elegible al 100%
                </span>
              </div>

              {/* Advance Callout Card */}
              <div className="rounded-2xl bg-gradient-to-br from-electric-indigo/5 via-electric-indigo/10 to-transparent p-5 border border-electric-indigo/15 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant block">
                  Saldo Solicitado Disponible
                </span>
                <p className="text-2xl font-extrabold text-electric-indigo">
                  €{availableBalance.toLocaleString()}.00
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Puedes solicitar adelanto de caja de forma inmediata para afrontar costes de producción, logística o riders de artistas antes del show.
                </p>
                <Link
                  href="/organizer/settlement"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric-indigo py-3 font-bold text-xs text-white shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">forward_media</span>
                  <span>Solicitar Nuevo Adelanto</span>
                </Link>
              </div>

              {/* History of Advances */}
              <div className="space-y-3 pt-2">
                <span className="block text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">
                  Historial de Adelantos (Este Evento)
                </span>
                <div className="space-y-2">
                  {advances.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-gray border border-surface-variant/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                          check_circle
                        </span>
                        <div>
                          <span className="font-extrabold text-xs text-deep-slate block">{ad.amount}</span>
                          <span className="text-[11px] text-platinum-silver">
                            {ad.date} • Ref: {ad.ref}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                        {ad.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-variant/40 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                Comisión QPH: 1.2% aplicada
              </span>
              <span className="text-electric-indigo font-bold cursor-pointer hover:underline">
                IBAN verificado
              </span>
            </div>
          </div>

        </div>

        {/* =========================================================================
            BOTTOM ANALYTICS ROW: VELOCITY (SVG SPARKLINE) & SALES CHANNELS
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sales Velocity Graphic (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-white p-6 md:p-8 border border-surface-variant shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-variant/40 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-extrabold text-deep-slate">Ritmo de Ventas Reciente</h3>
                <p className="text-xs text-on-surface-variant">Evolución diaria de entradas emitidas en los últimos 7 días</p>
              </div>
              <span className="font-extrabold text-electric-indigo bg-electric-indigo/10 px-3 py-1 rounded-full text-xs">
                +24.5% vs semana anterior
              </span>
            </div>

            {/* Vector Sparkline / Area Chart */}
            <div className="w-full h-44 relative flex items-end pt-2">
              <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 700 160">
                <defs>
                  <linearGradient id="qphGradientEvent" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="700" y1="40" y2="40" />
                <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="700" y1="80" y2="80" />
                <line stroke="#f1f5f9" strokeWidth="1.5" x1="0" x2="700" y1="120" y2="120" />
                {/* Gradient Area */}
                <path d="M0 130 Q 110 110, 230 65 T 460 75 T 700 15 L 700 160 L 0 160 Z" fill="url(#qphGradientEvent)" />
                {/* Line Curve */}
                <path d="M0 130 Q 110 110, 230 65 T 460 75 T 700 15" fill="none" stroke="#6366F1" strokeLinecap="round" strokeWidth="3.5" />
                {/* Data Points */}
                <circle cx="230" cy="65" fill="#4648d4" r="5" />
                <circle cx="460" cy="75" fill="#4648d4" r="5" />
                <circle cx="700" cy="15" fill="#F59E0B" r="6" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-on-surface-variant font-bold text-[11px] sm:text-xs pt-4 border-t border-surface-variant/40">
              <span>Lunes (85)</span>
              <span>Martes (120)</span>
              <span>Miércoles (310)</span>
              <span>Jueves (220)</span>
              <span>Viernes (390)</span>
              <span>Sábado (480)</span>
              <span className="text-electric-indigo font-extrabold">Domingo Hoy (540)</span>
            </div>
          </div>

          {/* Sales Channels & Venue Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Sales Channel Breakdown */}
            <div className="rounded-2xl bg-white p-6 md:p-8 border border-surface-variant shadow-xs flex flex-col gap-4">
              <h3 className="text-base md:text-lg font-extrabold text-deep-slate">Canales de Distribución</h3>
              <div className="flex flex-col gap-3.5">
                {/* Channel 1: Web Direct */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-deep-slate">Web Directa QPH &amp; App</span>
                    <span className="text-deep-slate font-extrabold">85% (€496,570.00)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-gray overflow-hidden">
                    <div className="h-full rounded-full bg-electric-indigo" style={{ width: '85%' }} />
                  </div>
                </div>

                {/* Channel 2: Afiliados / RRPP */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-deep-slate">Red de RRPPs y Promotores</span>
                    <span className="text-deep-slate font-extrabold">12% (€70,104.00)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-gray overflow-hidden">
                    <div className="h-full rounded-full bg-vip-gold" style={{ width: '12%' }} />
                  </div>
                </div>

                {/* Channel 3: Taquilla Física */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-deep-slate">Puntos Físicos Autorizados</span>
                    <span className="text-deep-slate font-extrabold">3% (€17,526.00)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-gray overflow-hidden">
                    <div className="h-full rounded-full bg-secondary" style={{ width: '3%' }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-variant/40">
                <span className="text-xs text-on-surface-variant">
                  Código Activo: <strong className="text-deep-slate">SUMMERVIP (-15%)</strong>
                </span>
                <Link href="/events/create#seccion-cupones" className="text-xs font-bold text-electric-indigo hover:underline">
                  Gestionar Códigos
                </Link>
              </div>
            </div>

            {/* Support Contact */}
            <div className="rounded-2xl bg-white p-5 border border-surface-variant shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-indigo/10 text-electric-indigo shrink-0">
                  <span className="material-symbols-outlined text-[22px]">contact_support</span>
                </div>
                <div>
                  <span className="font-extrabold text-sm text-deep-slate block">Gestor de Cuentas Dedicado</span>
                  <span className="text-xs text-on-surface-variant">Atención 24/7 para el festival</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Conectando con tu gestor prioritario QPH...')}
                className="px-3.5 py-1.5 rounded-xl bg-surface-gray hover:bg-surface-variant font-bold text-xs text-deep-slate border border-surface-variant/60 transition-all cursor-pointer"
              >
                Contactar
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
