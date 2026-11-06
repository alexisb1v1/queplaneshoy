'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';

interface TransferHistoryItem {
  id: string;
  date: string;
  concept: string;
  amount: number;
  status: 'En proceso' | 'Pagado' | 'Rechazado';
}

interface EventFinancialData {
  id: string;
  code: string;
  title: string;
  availableBalance: number;
  totalRevenue: number;
  alreadyTransferred: number;
  bankAccount: string;
  bankName: string;
}

const EVENTS_FINANCIAL_LIST: EventFinancialData[] = [
  {
    id: 'org-1',
    code: '#EV-2025-UMF',
    title: 'Ultra Music Fest Madrid 2025',
    availableBalance: 230520,
    totalRevenue: 584200,
    alreadyTransferred: 120000,
    bankAccount: 'Banco Santander · ES91 •••• 4829',
    bankName: 'Banco Santander',
  },
  {
    id: 'org-2',
    code: '#EV-2024-AFT',
    title: 'Afterlife Madrid: Global Tour 2024',
    availableBalance: 95400,
    totalRevenue: 277200,
    alreadyTransferred: 150000,
    bankAccount: 'BBVA · ES76 •••• 9102',
    bankName: 'BBVA España',
  },
  {
    id: 'org-3',
    code: '#EV-2024-SNJ',
    title: 'Sunset Jazz & Wine Sessions',
    availableBalance: 8640,
    totalRevenue: 18000,
    alreadyTransferred: 5000,
    bankAccount: 'CaixaBank · ES14 •••• 3341',
    bankName: 'CaixaBank',
  },
];

export default function OrganizerSettlementScreen() {
  const [, startTransition] = useTransition();

  // Evento activo seleccionado
  const [selectedEventId, setSelectedEventId] = useState<string>('org-1');
  const [isEventSelectorOpen, setIsEventSelectorOpen] = useState(false);

  const activeEvent =
    EVENTS_FINANCIAL_LIST.find((e) => e.id === selectedEventId) || EVENTS_FINANCIAL_LIST[0];

  // Modo de operación: 'adelanto' o 'liquidacion'
  const [operationMode, setOperationMode] = useState<'adelanto' | 'liquidacion'>('adelanto');

  // Importe a transferir
  const [transferAmountInput, setTransferAmountInput] = useState<string>('50.000 €');
  const [numericAmount, setNumericAmount] = useState<number>(50000);

  // Historial de transferencias
  const [history, setHistory] = useState<TransferHistoryItem[]>([
    {
      id: 'tx-1',
      date: 'Hoy, 10:15',
      concept: 'Adelanto parcial • Ultra Music Fest 2025',
      amount: 50000,
      status: 'En proceso',
    },
    {
      id: 'tx-2',
      date: '18 May 2025',
      concept: 'Adelanto parcial • Ultra Music Fest 2025',
      amount: 70000,
      status: 'Pagado',
    },
    {
      id: 'tx-3',
      date: '02 May 2025',
      concept: 'Liquidación final • Primavera Sound Preview',
      amount: 102568,
      status: 'Pagado',
    },
  ]);

  // Drawer móvil para el menú de gestión
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast Flotante
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manejo de cambio de cantidad rápida
  const setQuickAmount = (val: number) => {
    const capped = Math.min(val, activeEvent.availableBalance);
    setNumericAmount(capped);
    setTransferAmountInput(`${capped.toLocaleString('es-ES')} €`);
  };

  // Manejo de cambio de modo
  const handleSelectMode = (mode: 'adelanto' | 'liquidacion') => {
    setOperationMode(mode);
    if (mode === 'adelanto') {
      setQuickAmount(50000);
      showToast('Modo: Adelanto Parcial de Fondos activado.');
    } else {
      setQuickAmount(activeEvent.availableBalance);
      showToast('Modo: Liquidación Final de Taquilla activado.');
    }
  };

  // Manejador del input manual
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleanNumbers = raw.replace(/[^0-9]/g, '');
    const num = parseInt(cleanNumbers, 10) || 0;
    setNumericAmount(num);
    setTransferAmountInput(num > 0 ? `${num.toLocaleString('es-ES')} €` : '');
  };

  // Solicitar transferencia
  const handleRequestTransfer = () => {
    if (numericAmount <= 0) {
      showToast('Por favor introduce un importe mayor a 0 €.');
      return;
    }
    if (numericAmount > activeEvent.availableBalance) {
      showToast(`El importe supera el saldo disponible actual (${activeEvent.availableBalance.toLocaleString('es-ES')} €).`);
      return;
    }

    const newTx: TransferHistoryItem = {
      id: 'tx-' + Date.now(),
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      concept: `${operationMode === 'adelanto' ? 'Adelanto parcial' : 'Liquidación final'} • ${activeEvent.title}`,
      amount: numericAmount,
      status: 'En proceso',
    };

    startTransition(() => {
      setHistory([newTx, ...history]);
      activeEvent.availableBalance -= numericAmount;
      activeEvent.alreadyTransferred += numericAmount;
      showToast(
        `Transferencia de ${numericAmount.toLocaleString('es-ES')} € tramitada con éxito a ${activeEvent.bankAccount}.`
      );
    });
  };

  return (
    <div className="bg-surface min-h-screen">
      
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-electric-indigo text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Barra de utilidades móvil para abrir el menú de promotor */}
      <div className="lg:hidden sticky top-20 z-30 bg-white border-b border-surface-variant px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-deep-slate bg-surface-gray px-3.5 py-2 rounded-xl border border-surface-variant/70 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-electric-indigo">menu</span>
          <span>Menú de Gestión</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse"></span>
          <span className="text-xs font-extrabold text-deep-slate">Liquidaciones</span>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              MENÚ LATERAL (SIDEBAR DE PROMOTOR) - FIEL A STITCH
             ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xs p-6 border border-surface-variant flex flex-col justify-between sticky top-28 min-h-[580px]">
              
              <div className="space-y-6">
                {/* Header del Menú */}
                <div className="border-b border-surface-variant/40 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
                      Gestión de Promotor
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[10px] uppercase">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Herramientas y taquilla en tiempo real</p>
                </div>

                {/* Items de Navegación del Menú */}
                <nav className="flex flex-col gap-1.5">
                  <Link
                    href="/events/create"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-white bg-electric-indigo shadow-sm hover:bg-primary transition-all text-left w-full mb-1"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>Crear Evento</span>
                  </Link>

                  <Link
                    href="/organizer/events"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full"
                  >
                    <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                    <span>Mis Eventos Creados</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => showToast('Módulo Analítica: métricas de conversión.')}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                    <span>Analítica y Ventas</span>
                  </button>

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm bg-electric-indigo text-white shadow-md shadow-electric-indigo/25 text-left w-full">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      payments
                    </span>
                    <span>Liquidación y Adelanto</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Cupones y promociones: 3 códigos activos.')}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">sell</span>
                    <span>Cupones y Promos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Configuración bancaria IBAN: cuenta verificada.')}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    <span>Configuración de Pagos</span>
                  </button>
                </nav>
              </div>

              {/* Pie del Menú con Enlace a Perfil y Soporte */}
              <div className="pt-6 border-t border-surface-variant/40 space-y-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  <span>Volver a Vista Asistente</span>
                </Link>

                <div className="p-3.5 rounded-xl bg-surface-gray border border-surface-variant/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Soporte Prioritario
                    </span>
                    <span className="text-xs font-extrabold text-electric-indigo">promotores@qph.com</span>
                  </div>
                  <span className="material-symbols-outlined text-platinum-silver text-[20px]">headset_mic</span>
                </div>
              </div>

            </div>
          </aside>

          {/* =========================================================================
              DRAWER MÓVIL (MENÚ EN PANTALLAS PEQUEÑAS)
             ========================================================================= */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative w-80 max-w-[85%] bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-surface-variant">
                    <span className="font-extrabold text-base text-deep-slate">Menú de Promotor</span>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-8 h-8 rounded-full hover:bg-surface-gray flex items-center justify-center text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>

                  <nav className="flex flex-col gap-1.5">
                    <Link
                      href="/events/create"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-white bg-electric-indigo shadow-sm hover:bg-primary transition-all text-left w-full mb-1"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                      <span>Crear Evento</span>
                    </Link>

                    <Link
                      href="/organizer/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray text-left w-full"
                    >
                      <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                      <span>Mis Eventos Creados</span>
                    </Link>

                    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm bg-electric-indigo text-white shadow-xs text-left w-full">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                      <span>Liquidación y Adelanto</span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray text-left w-full"
                    >
                      <span className="material-symbols-outlined text-[20px]">person</span>
                      <span>Volver a Mi Perfil</span>
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              CONTENIDO PRINCIPAL: LIQUIDACIÓN Y ADELANTOS (PANEL CENTRAL)
             ========================================================================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Cabecera Directa y Selector de Evento */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-variant/40 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-electric-indigo text-[20px]">account_balance_wallet</span>
                  <span className="font-extrabold text-[12px] uppercase tracking-wider text-on-surface-variant">
                    Gestión de Fondos
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-deep-slate tracking-tight">
                  Liquidación y Adelanto
                </h1>
              </div>

              {/* Selector de Evento Activo */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEventSelectorOpen(!isEventSelectorOpen)}
                  className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-surface-variant shadow-xs hover:border-electric-indigo transition-all cursor-pointer text-left"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-vip-gold animate-pulse shrink-0"></span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Evento Activo
                    </span>
                    <span className="text-xs md:text-sm font-extrabold text-deep-slate truncate max-w-[200px]">
                      {activeEvent.title}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-1">
                    {isEventSelectorOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown de Eventos */}
                {isEventSelectorOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-surface-variant py-2 z-40 animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-surface-variant/40">
                      Seleccionar Evento
                    </div>
                    {EVENTS_FINANCIAL_LIST.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          setSelectedEventId(ev.id);
                          setIsEventSelectorOpen(false);
                          setQuickAmount(operationMode === 'adelanto' ? 50000 : ev.availableBalance);
                          showToast(`Cambiado a ${ev.title}.`);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          ev.id === selectedEventId ? 'bg-electric-indigo/10 text-electric-indigo font-bold' : 'hover:bg-surface-gray text-deep-slate'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-extrabold truncate max-w-[180px]">{ev.title}</span>
                          <span className="text-[10px] text-on-surface-variant">{ev.code}</span>
                        </div>
                        <span className="font-bold text-[11px]">€{ev.availableBalance.toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selector Tipo de Operación: Adelanto parcial vs Cierre Final (Stitch Exact Match) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSelectMode('adelanto')}
                className={`flex items-center gap-3.5 p-5 rounded-2xl text-left transition-all cursor-pointer ${
                  operationMode === 'adelanto'
                    ? 'border-2 border-electric-indigo bg-electric-indigo/5 shadow-xs'
                    : 'border border-surface-variant bg-white hover:bg-surface-gray'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    operationMode === 'adelanto'
                      ? 'bg-electric-indigo text-white shadow-xs'
                      : 'bg-surface-gray text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div>
                  <div
                    className={`font-extrabold text-sm ${
                      operationMode === 'adelanto' ? 'text-electric-indigo' : 'text-deep-slate'
                    }`}
                  >
                    Solicitar Adelanto Parcial
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Disponibilidad inmediata sobre las entradas ya vendidas
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('liquidacion')}
                className={`flex items-center gap-3.5 p-5 rounded-2xl text-left transition-all cursor-pointer ${
                  operationMode === 'liquidacion'
                    ? 'border-2 border-electric-indigo bg-electric-indigo/5 shadow-xs'
                    : 'border border-surface-variant bg-white hover:bg-surface-gray'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    operationMode === 'liquidacion'
                      ? 'bg-electric-indigo text-white shadow-xs'
                      : 'bg-surface-gray text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">task_alt</span>
                </div>
                <div>
                  <div
                    className={`font-extrabold text-sm ${
                      operationMode === 'liquidacion' ? 'text-electric-indigo' : 'text-deep-slate'
                    }`}
                  >
                    Cierre / Liquidación Final
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Auditoría y transferencia definitiva tras concluir el evento
                  </div>
                </div>
              </button>
            </div>

            {/* Tarjeta Principal de Saldo y Acción Rápida (Stitch Exact Match) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-surface-variant shadow-xs flex flex-col gap-6">
              
              {/* Balance Destacado y Limpio */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-surface-variant/40">
                <div className="flex flex-col gap-1.5">
                  <span className="font-extrabold text-xs text-on-surface-variant uppercase tracking-wider">
                    Disponible para retirar hoy
                  </span>
                  <div className="text-3xl md:text-5xl font-black text-electric-indigo tracking-tight leading-none">
                    {activeEvent.availableBalance.toLocaleString('es-ES')} €
                  </div>
                  <p className="text-xs md:text-sm text-on-surface-variant mt-2 flex flex-wrap items-center gap-2">
                    <span>
                      Recaudación total: <strong className="text-deep-slate font-extrabold">{activeEvent.totalRevenue.toLocaleString('es-ES')} €</strong>
                    </span>
                    <span className="text-platinum-silver">•</span>
                    <span>
                      Ya transferido: <strong className="text-deep-slate font-extrabold">{activeEvent.alreadyTransferred.toLocaleString('es-ES')} €</strong>
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-surface-gray px-3.5 py-2 rounded-xl text-xs font-bold text-on-surface-variant border border-surface-variant/50 self-start sm:self-auto shrink-0">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px]">bolt</span>
                  <span>Transferencia Inmediata SEPA (24h)</span>
                </div>
              </div>

              {/* Formulario Simple y Directo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Selector de Importe */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <label htmlFor="monto-transferencia" className="text-xs font-bold text-deep-slate">
                    Importe a transferir
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="monto-transferencia"
                      type="text"
                      value={transferAmountInput}
                      onChange={handleInputChange}
                      placeholder="0 €"
                      className="w-full px-4 py-3.5 bg-surface-gray rounded-xl text-xl md:text-2xl font-black text-deep-slate focus:outline-none focus:ring-1 focus:ring-electric-indigo border border-surface-variant/60"
                    />
                  </div>

                  {/* Botones Rápidos de Selección */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setQuickAmount(50000)}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-gray hover:bg-surface-variant font-bold text-xs text-deep-slate transition-colors cursor-pointer border border-surface-variant/40"
                    >
                      50.000 €
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAmount(100000)}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-gray hover:bg-surface-variant font-bold text-xs text-deep-slate transition-colors cursor-pointer border border-surface-variant/40"
                    >
                      100.000 €
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAmount(activeEvent.availableBalance)}
                      className="px-3.5 py-1.5 rounded-xl bg-electric-indigo/10 hover:bg-electric-indigo/20 font-extrabold text-xs text-electric-indigo transition-colors cursor-pointer border border-electric-indigo/20"
                    >
                      Todo el saldo ({activeEvent.availableBalance.toLocaleString('es-ES')} €)
                    </button>
                  </div>
                </div>

                {/* Cuenta Bancaria y Botón Acción */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Cuenta simplificada en 1 línea */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-gray border border-surface-variant/60">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-electric-indigo text-[20px]">account_balance</span>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-deep-slate font-mono">
                          {activeEvent.bankAccount}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">Cuenta bancaria verificada</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  </div>

                  {/* Botón Principal */}
                  <button
                    type="button"
                    onClick={handleRequestTransfer}
                    className="w-full py-4 px-6 rounded-xl bg-electric-indigo text-white font-extrabold text-sm md:text-base shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    <span>Solicitar Transferencia Inmediata</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Tabla Minimalista de Historial Reciente (Stitch Exact Match) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-surface-variant shadow-xs flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-variant/40">
                <div>
                  <h2 className="text-base md:text-lg font-extrabold text-deep-slate">
                    Historial Reciente de Transferencias
                  </h2>
                  <p className="text-xs text-on-surface-variant">Últimos movimientos registrados en tus liquidaciones</p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Extracto bancario oficial en PDF generado y descargado.')}
                  className="text-xs font-bold text-electric-indigo hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Descargar Extracto</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-surface-variant/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-gray text-on-surface-variant font-extrabold text-[11px] uppercase tracking-wider border-b border-surface-variant/40">
                    <tr>
                      <th scope="col" className="py-3 px-4">Fecha</th>
                      <th scope="col" className="py-3 px-4">Concepto</th>
                      <th scope="col" className="py-3 px-4 text-right">Importe</th>
                      <th scope="col" className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/30 text-deep-slate font-medium">
                    {history.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-gray/50 transition-colors">
                        <td className="py-3.5 px-4 text-on-surface-variant">{tx.date}</td>
                        <td className="py-3.5 px-4 font-bold text-deep-slate">{tx.concept}</td>
                        <td className="py-3.5 px-4 text-right font-black text-deep-slate">
                          {tx.amount.toLocaleString('es-ES')} €
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              tx.status === 'En proceso'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {tx.status === 'En proceso' ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-electric-indigo animate-pulse"></span>
                            ) : (
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            )}
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
}
