'use client';

import React from 'react';
import Link from 'next/link';

export type OrganizerMenuSection = 'events' | 'settlement' | 'advances';

interface OrganizerSidebarProps {
  activeSection: OrganizerMenuSection;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onSelectUnavailableFeature?: (featureName: string) => void;
}

/**
 * Menú lateral compartido del panel de Gestión de Promotor (Desktop + Drawer móvil).
 */
export function OrganizerSidebar({
  activeSection,
  isMobileMenuOpen,
  onCloseMobileMenu,
  onSelectUnavailableFeature,
}: OrganizerSidebarProps) {
  const isEventsActive = activeSection === 'events';
  const isAdvancesActive = activeSection === 'advances';
  const isSettlementActive = activeSection === 'settlement';

  const renderNavLinks = (closeOnNavigate: boolean) => (
    <nav className="flex flex-col gap-1.5">
      <Link
        href="/organizer/events"
        onClick={closeOnNavigate ? onCloseMobileMenu : undefined}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
          isEventsActive
            ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
            : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: isEventsActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          confirmation_number
        </span>
        <span>Mis Eventos Creados</span>
      </Link>

      <button
        type="button"
        onClick={() => {
          if (closeOnNavigate) onCloseMobileMenu();
          onSelectUnavailableFeature?.('Analítica y Ventas');
        }}
        className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full cursor-pointer"
      >
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">analytics</span>
          <span>Analítica y Ventas</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-surface-gray text-on-surface-variant text-[9px] font-extrabold uppercase">
          Pronto
        </span>
      </button>

      <Link
        href="/organizer/settlement?mode=adelanto"
        onClick={closeOnNavigate ? onCloseMobileMenu : undefined}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
          isAdvancesActive
            ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
            : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: isAdvancesActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          payments
        </span>
        <span>Adelanto de Liquidación</span>
      </Link>

      <Link
        href="/organizer/settlement?mode=liquidacion"
        onClick={closeOnNavigate ? onCloseMobileMenu : undefined}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all text-left w-full ${
          isSettlementActive
            ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
            : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: isSettlementActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          receipt_long
        </span>
        <span>Liquidación del Evento</span>
      </Link>

      <button
        type="button"
        onClick={() => {
          if (closeOnNavigate) onCloseMobileMenu();
          onSelectUnavailableFeature?.('Configuración de Pagos');
        }}
        className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-all text-left w-full cursor-pointer"
      >
        <span className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span>Configuración de Pagos</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-surface-gray text-on-surface-variant text-[9px] font-extrabold uppercase">
          Pronto
        </span>
      </button>
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:block lg:col-span-3">
        <div className="bg-white rounded-2xl shadow-xs p-6 border border-surface-variant flex flex-col justify-between sticky top-28 min-h-[540px]">
          <div className="space-y-6">
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

            {renderNavLinks(false)}
          </div>

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
                  type="button"
                  onClick={onCloseMobileMenu}
                  aria-label="Cerrar menú"
                  className="w-8 h-8 rounded-full hover:bg-surface-gray flex items-center justify-center text-on-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {renderNavLinks(true)}
            </div>

            <div className="pt-6 border-t border-surface-variant/40 space-y-3">
              <Link
                href="/profile"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-gray"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                <span>Volver a Vista Asistente</span>
              </Link>
              <p className="text-[11px] text-on-surface-variant text-center">
                Soporte: promotores@qph.com
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

