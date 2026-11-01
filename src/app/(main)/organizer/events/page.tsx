'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ZoneBreakdown {
  name: string;
  badge: string;
  sold: number;
  total: number;
  price: number;
  percentage: number;
  revenue: number;
  colorClass: string;
}

interface OrganizerEvent {
  id: string;
  code: string;
  title: string;
  category: string;
  status: 'on_sale' | 'sold_out' | 'draft' | 'past';
  statusBadge: string;
  statusColor: string;
  dateStr: string;
  venue: string;
  capacity: number;
  ticketsSold: number;
  totalRevenue: number;
  targetRevenue?: number;
  imageUrl: string;
  zones?: ZoneBreakdown[];
  draftNote?: string;
}

const ORGANIZER_EVENTS: OrganizerEvent[] = [
  {
    id: 'org-1',
    code: '#EV-2025-UMF',
    title: 'Ultra Music Fest Madrid 2025',
    category: 'FESTIVAL',
    status: 'on_sale',
    statusBadge: 'En Venta • Preventa Fase 2',
    statusColor: 'bg-secondary-container text-primary',
    dateStr: '15 - 16 Octubre 2025',
    venue: 'Caja Mágica • Madrid, España',
    capacity: 12500,
    ticketsSold: 9850,
    totalRevenue: 584200,
    targetRevenue: 757750,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAil-LD1ns1CGt8sQgnaLE3QIPBvPsPC1RkE6jL-8volRJwqJI9pvh0V3LygkzcNNzvWm7-ZFnsI1Mkf8ZZ7DywQts2yFYrBHa6RawNAKSxHS5BpP_Qtnc4XfHBSFToy4BW8LepU_gmOcD9R1_sbMkDBjfBvQYYfmfgjERR56JRM1l45QuGyKSa40aAF5trf0YyGc-4G8xjRdGinpgWvKJobTWNRARmwzI0Kp2IOT32kOEtBjoXGFFXWA',
    zones: [
      {
        name: 'Platinum VIP Front',
        badge: 'Casi agotado',
        sold: 410,
        total: 450,
        price: 145,
        percentage: 91,
        revenue: 59450,
        colorClass: 'bg-vip-gold',
      },
      {
        name: 'General Pista',
        badge: 'Alta demanda',
        sold: 6100,
        total: 7500,
        price: 55,
        percentage: 81,
        revenue: 335500,
        colorClass: 'bg-electric-indigo',
      },
      {
        name: 'Grada Baja Numerada',
        badge: 'Normal',
        sold: 2140,
        total: 2800,
        price: 75,
        percentage: 76,
        revenue: 160500,
        colorClass: 'bg-primary',
      },
      {
        name: 'Grada Alta Sector B',
        badge: 'Disponible',
        sold: 1200,
        total: 1750,
        price: 40,
        percentage: 68,
        revenue: 48000,
        colorClass: 'bg-platinum-silver',
      },
    ],
  },
  {
    id: 'org-2',
    code: '#EV-2024-AFT',
    title: 'Afterlife Madrid: Global Tour 2024',
    category: 'CONCIERTO',
    status: 'sold_out',
    statusBadge: 'Sold Out • Últimos 50 Pases de Taquilla',
    statusColor: 'bg-error-container text-on-error-container',
    dateStr: 'Sábado 15 Junio 2024',
    venue: 'Recinto Caja Mágica • Pista Central',
    capacity: 5000,
    ticketsSold: 4950,
    totalRevenue: 277200,
    targetRevenue: 277200,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXHAlsH4xVT0RVsyMfElKctQJlTmbt0d-Rk-SEliD359eSx4T5HDvhGJh94-SWyI7651qZR_SGY6jjOTkgF4SwaWzlaOyX4UblqP-dXFVlKEj6-iCiTvc-4x-wHcfWUZyZHpGgF_QStE6REkwqvvHUXqDRnlUbFEHDPXiTYvY5jTq3SLBvPSOg1YnAQ02-YDlv5259zq4QP4BuT7CzGclsRSURwxfW5KUsMnTSjPe6YsFrj_mUvZ1jjQ',
  },
  {
    id: 'org-3',
    code: '#EV-2024-SNJ',
    title: 'Sunset Jazz & Wine Sessions',
    category: 'MÚSICA EN VIVO',
    status: 'on_sale',
    statusBadge: 'En Venta Regular',
    statusColor: 'bg-secondary-container text-primary',
    dateStr: '30 Octubre 2024',
    venue: 'Terraza Cibeles • Madrid, España',
    capacity: 600,
    ticketsSold: 320,
    totalRevenue: 9600,
    targetRevenue: 18000,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBbMEzHKvEDtYI4ettN1WemEvYCMyUknxx3xlUgZuims-rtvrFz261raTmx9HU6sb_hDT-S_G3pyajZjD_IMLZYIBLKOHo_XQ_ZP5gUELhkUQD3I0Xaeaa3uX-WFQOPB6l1lYuJCJbhPoGEsmS3RvgqYh16avtmscioZuUSFgI5t_sN5OuB8zVK_f3ihYL1Wl40luq-fO8EhyzGHFnORmN--hwshHwEqnKIDI49DnVS8j3UeB_dW4zc2A',
  },
  {
    id: 'org-4',
    code: '#EV-2025-IND',
    title: 'Indie Sounds Spring Festival 2025',
    category: 'FESTIVAL',
    status: 'draft',
    statusBadge: 'Borrador Sin Publicar',
    statusColor: 'bg-surface-gray text-on-surface-variant',
    dateStr: 'Pendiente de confirmación',
    venue: 'WiZink Center • Madrid',
    capacity: 8000,
    ticketsSold: 0,
    totalRevenue: 0,
    draftNote:
      'Falta configurar la política de devoluciones y aprobar los cupos de la zona preventa para poder enviar a revisión.',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDnd8-6_1mxS3dZFtHk9XFlFw3P0KN3s3jBI7R0CsQGAd5qSojJImmoWKoQAequo_GBLwop9XD2E7G5q3GK-5CoO6-NBQ_QRd9sZuxPW5LA82L-X5_Wvmq0B4H_dbbi19Zt7skdIljIs-uTI2zIboIarNOLbbQmLhUk1ZO5UWbuwr5maC8WfWwH_lYm3OaAxPNBn8SvnH-lbOXUaXsTsWxTqBxNYhtCtb0NZV8H1tajvL8hMzjePt5C_qhvS19rf5BN3oRIFjdDXiU8',
  },
];

type MenuSection = 'events' | 'analytics' | 'advance' | 'settlement' | 'coupons' | 'settings';

export default function OrganizerEventsPage() {
  const [activeSection, setActiveSection] = useState<MenuSection>('events');
  const [filterState, setFilterState] = useState<'all' | 'on_sale' | 'sold_out' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3000);
  };

  const filteredEvents = ORGANIZER_EVENTS.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterState === 'all'
        ? true
        : filterState === 'on_sale'
        ? ev.status === 'on_sale'
        : filterState === 'sold_out'
        ? ev.status === 'sold_out'
        : ev.status === 'draft';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-surface min-h-screen">
      
      {/* Toast Notificación Flotante */}
      {actionNotice && (
        <div className="fixed top-24 right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-electric-indigo text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Barra de utilidades móvil para abrir el menú de promotor */}
      <div className="lg:hidden sticky top-20 z-30 bg-white border-b border-surface-variant px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-deep-slate bg-surface-gray px-3.5 py-2 rounded-xl border border-surface-variant/70 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-electric-indigo">menu</span>
          <span>Menú de Gestión</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse"></span>
          <span className="text-xs font-extrabold text-deep-slate">Panel Promotor</span>
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

                  <button
                    type="button"
                    onClick={() => setActiveSection('events')}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full cursor-pointer ${
                      activeSection === 'events'
                        ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                        : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: activeSection === 'events' ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      confirmation_number
                    </span>
                    <span>Mis Eventos Creados</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('analytics');
                      showNotice('Módulo Analítica y Ventas: visualizando métricas de conversión.');
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full cursor-pointer ${
                      activeSection === 'analytics'
                        ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                        : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                    <span>Analítica y Ventas</span>
                  </button>

                  <Link
                    href="/organizer/settlement"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full"
                  >
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    <span>Adelanto de Liquidación</span>
                  </Link>

                  <Link
                    href="/organizer/settlement"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full"
                  >
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    <span>Liquidación del Evento</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('coupons');
                      showNotice('Cupones y promociones: 3 códigos activos.');
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full cursor-pointer ${
                      activeSection === 'coupons'
                        ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                        : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">sell</span>
                    <span>Cupones y Promos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection('settings');
                      showNotice('Configuración bancaria IBAN: cuenta verificada.');
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full cursor-pointer ${
                      activeSection === 'settings'
                        ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                        : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                    }`}
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
                    <span className="font-extrabold text-xs text-electric-indigo">promotores@qph.com</span>
                  </div>
                  <span className="material-symbols-outlined text-platinum-silver text-[20px]">headset_mic</span>
                </div>
              </div>

            </div>
          </aside>

          {/* =========================================================================
              DRAWER MENÚ MÓVIL (VISIBLE SOLO EN PANTALLAS PEQUEÑAS CUANDO SE ABRE)
             ========================================================================= */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-deep-slate/50 backdrop-blur-sm z-50 lg:hidden flex justify-start animate-in fade-in duration-200">
              <div className="w-80 max-w-[85%] bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-surface-variant/40 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-deep-slate">Gestión de Promotor</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[10px] uppercase">
                        PRO
                      </span>
                    </div>
                    <button
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

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('events');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
                        activeSection === 'events'
                          ? 'bg-electric-indigo text-white shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-gray'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                      <span>Mis Eventos Creados</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('analytics');
                        setIsMobileMenuOpen(false);
                        showNotice('Módulo Analítica y Ventas cargado.');
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
                        activeSection === 'analytics'
                          ? 'bg-electric-indigo text-white shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-gray'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">analytics</span>
                      <span>Analítica y Ventas</span>
                    </button>

                    <Link
                      href="/organizer/settlement"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray text-left w-full"
                    >
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                      <span>Adelanto de Liquidación</span>
                    </Link>

                    <Link
                      href="/organizer/settlement"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray text-left w-full"
                    >
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                      <span>Liquidación del Evento</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('coupons');
                        setIsMobileMenuOpen(false);
                        showNotice('Módulo Cupones y Promos cargado.');
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
                        activeSection === 'coupons'
                          ? 'bg-electric-indigo text-white shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-gray'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">sell</span>
                      <span>Cupones y Promos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection('settings');
                        setIsMobileMenuOpen(false);
                        showNotice('Configuración de Pagos cargada.');
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
                        activeSection === 'settings'
                          ? 'bg-electric-indigo text-white shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-gray'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                      <span>Configuración de Pagos</span>
                    </button>
                  </nav>
                </div>

                <div className="pt-6 border-t border-surface-variant/40 space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    <span>Volver a Mi Perfil</span>
                  </Link>
                  <p className="text-[11px] text-on-surface-variant text-center">
                    Soporte: promotores@qph.com
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              CONTENIDO PRINCIPAL DEL ORGANIZADOR
             ========================================================================= */}
          <main className="lg:col-span-9 space-y-6 md:space-y-8">
            
            {/* Top Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant/40 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[11px] uppercase tracking-wider">
                    Centro de Operaciones
                  </span>
                  <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse"></span>
                  <span className="font-bold text-[12px] text-on-surface-variant">Datos en vivo</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-deep-slate tracking-tight">
                  Panel del Organizador • Mis Eventos
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Supervisa las ventas de tickets en tiempo real, controla el aforo por zonas y gestiona la taquilla de tus eventos en vivo con analítica avanzada.
                </p>
              </div>

              <Link
                href="/events/create"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-indigo text-white font-bold text-xs shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Crear Nuevo Evento</span>
              </Link>
            </div>

            {/* Search, Filter & View Controls */}
            <div className="bg-white p-4 rounded-2xl border border-surface-variant shadow-xs flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum-silver text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar evento por nombre, recinto o ID de taquilla..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-variant text-sm text-deep-slate placeholder:text-platinum-silver focus:ring-1 focus:ring-electric-indigo focus:border-electric-indigo outline-none transition-all"
                  />
                </div>

                {/* Quick Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
                  <button
                    onClick={() => setFilterState('all')}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'all'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Todos ({ORGANIZER_EVENTS.length})
                  </button>
                  <button
                    onClick={() => setFilterState('on_sale')}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'on_sale'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    En Venta (2)
                  </button>
                  <button
                    onClick={() => setFilterState('sold_out')}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'sold_out'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Sold Out (1)
                  </button>
                  <button
                    onClick={() => setFilterState('draft')}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'draft'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Borradores (1)
                  </button>
                </div>
              </div>
            </div>

            {/* Event Cards Container */}
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-surface-variant shadow-xs overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="p-5 md:p-6 flex flex-col gap-5">
                    
                    {/* Event Header Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 relative shadow-xs border border-surface-variant/40">
                          <img className="w-full h-full object-cover" src={event.imageUrl} alt={event.title} />
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-deep-slate/85 backdrop-blur-sm text-white font-extrabold text-[9px] uppercase">
                            {event.category}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 ${event.statusColor}`}>
                              {event.status === 'on_sale' && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                              {event.statusBadge}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-surface-gray text-on-surface-variant font-bold text-[11px]">
                              ID: {event.code}
                            </span>
                          </div>

                          <h2 className="text-lg md:text-xl font-bold text-deep-slate tracking-tight">
                            {event.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-semibold pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-electric-indigo">calendar_today</span>
                              <span>{event.dateStr}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-electric-indigo">location_on</span>
                              <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-electric-indigo">confirmation_number</span>
                              <span>Capacidad: {event.capacity.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Highlight Box */}
                      <div className="bg-surface-gray px-5 py-3.5 rounded-xl border border-surface-variant/50 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-1 shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                          Recaudación Actual
                        </span>
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-black text-deep-slate tracking-tight">
                            €{event.totalRevenue.toLocaleString()}.00
                          </div>
                          {event.targetRevenue && (
                            <p className="text-[11px] font-bold text-on-surface-variant">
                              Objetivo: €{event.targetRevenue.toLocaleString()}.00 (
                              {((event.totalRevenue / event.targetRevenue) * 100).toFixed(1)}%)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sales Progress Bar */}
                    {event.status !== 'draft' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <div className="flex items-center gap-2 text-deep-slate">
                            <span>
                              {event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()} tickets vendidos
                            </span>
                            <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px]">
                              {((event.ticketsSold / event.capacity) * 100).toFixed(1)}% vendido
                            </span>
                          </div>
                          <span className="text-on-surface-variant text-[11px]">
                            {(event.capacity - event.ticketsSold).toLocaleString()} pases restantes
                          </span>
                        </div>

                        <div className="w-full h-3 rounded-full bg-surface-gray overflow-hidden flex border border-surface-variant/40">
                          <div
                            className="h-full bg-electric-indigo"
                            style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-surface-gray border border-surface-variant/70 flex items-start gap-3">
                        <span className="material-symbols-outlined text-vip-gold text-[20px] shrink-0 mt-0.5">info</span>
                        <div>
                          <p className="text-xs font-bold text-deep-slate">Estado del Borrador (85%)</p>
                          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{event.draftNote}</p>
                        </div>
                      </div>
                    )}

                    {/* Breakdown by Zone (Si existe) */}
                    {event.zones && (
                      <div className="rounded-xl bg-surface-gray/60 p-4 border border-surface-variant/60 space-y-3">
                        <div className="flex items-center justify-between pb-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-electric-indigo">analytics</span>
                            <span className="font-bold text-xs text-deep-slate uppercase tracking-wider">
                              Desglose de Aforo y Taquilla por Zonas
                            </span>
                          </div>
                          <button
                            onClick={() => showNotice('Panel de ajuste de cupos abierto.')}
                            className="text-xs font-bold text-electric-indigo hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ajustar Cupos</span>
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                          {event.zones.map((zone, idx) => (
                            <div key={idx} className="bg-white p-3.5 rounded-xl border border-surface-variant/60 shadow-xs flex flex-col justify-between gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-deep-slate truncate">{zone.name}</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-gray text-on-surface-variant font-extrabold text-[9px] uppercase">
                                  {zone.badge}
                                </span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-extrabold text-deep-slate">
                                  {zone.sold} <span className="text-xs font-normal text-on-surface-variant">/ {zone.total}</span>
                                </span>
                                <span className="font-bold text-xs text-electric-indigo">€{zone.price.toFixed(2)}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-surface-gray overflow-hidden">
                                <div className={`h-full ${zone.colorClass}`} style={{ width: `${zone.percentage}%` }} />
                              </div>
                              <span className="text-[10px] text-on-surface-variant font-semibold text-right">
                                Recaudado: €{zone.revenue.toLocaleString()}.00
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Operations Footer Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-variant/40">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/organizer/events/${event.id}`}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-gray hover:bg-surface-variant text-deep-slate font-bold text-xs border border-surface-variant/50 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-electric-indigo">query_stats</span>
                          <span>Ver Ventas y Reporte</span>
                        </Link>

                        <Link
                          href="/organizer/settlement"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary-container/50 hover:bg-secondary-container text-primary font-bold text-xs transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          <span>Solicitar Adelanto</span>
                        </Link>

                        <button
                          onClick={() => showNotice(`Modo edición activado para ${event.title}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-surface-gray text-on-surface-variant font-bold text-xs transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          <span>Editar Evento</span>
                        </button>

                        <Link
                          href="/events/indigo-nights"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-gray text-on-surface-variant font-bold text-xs transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          <span>Landing Pública</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showNotice(`Exportando CSV de asistentes de ${event.title}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-gray hover:bg-surface-variant text-deep-slate font-bold text-xs border border-surface-variant/50 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          <span>CSV Manifiesto</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
