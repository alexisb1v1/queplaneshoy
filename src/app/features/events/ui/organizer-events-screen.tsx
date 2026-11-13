'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUserUseCase, resendVerificationUseCase } from '@/app/features/auth';
import { ERROR_CODES } from '@/app/common/errors/error-codes';
import { UserModel } from '@/app/features/auth/models/user.model';
import {
  getOrganizerEventsUseCase,
  OrganizerEventModel,
  publishEventUseCase,
} from '@/app/features/events';
import { getCategoryById } from '../constants/eventConstants';
import { OrganizerSidebar } from './components/organizer-sidebar';

type FilterState = 'all' | 'on_sale' | 'sold_out' | 'draft' | 'in_review' | 'observed' | 'completed' | 'inactive';
type PeriodFilter = '3m' | '6m' | '12m' | 'all';

function formatSoles(amount: number): string {
  return (Number(amount) || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getEventStatusVisual(event: OrganizerEventModel): {
  badgeClasses: string;
  showPulseDot: boolean;
} {
  if (event.status === 'published' && event.isSoldOut) {
    return {
      badgeClasses: 'bg-rose-50 text-rose-700 border border-rose-200',
      showPulseDot: false,
    };
  }
  if (event.status === 'published') {
    return {
      badgeClasses: 'bg-indigo-50 text-electric-indigo border border-indigo-200/80',
      showPulseDot: true,
    };
  }
  if (event.status === 'observed') {
    return {
      badgeClasses: 'bg-amber-50 text-amber-800 border border-amber-300 font-extrabold',
      showPulseDot: false,
    };
  }
  if (event.status === 'in_review') {
    return {
      badgeClasses: 'bg-sky-50 text-sky-700 border border-sky-200',
      showPulseDot: true,
    };
  }
  if (event.status === 'completed') {
    return {
      badgeClasses: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      showPulseDot: false,
    };
  }
  if (event.status === 'paused') {
    return {
      badgeClasses: 'bg-amber-50 text-amber-800 border border-amber-200',
      showPulseDot: false,
    };
  }
  if (event.status === 'cancelled') {
    return {
      badgeClasses: 'bg-red-50 text-red-700 border border-red-200',
      showPulseDot: false,
    };
  }
  return {
    badgeClasses: 'bg-surface-gray text-on-surface-variant border border-surface-variant',
    showPulseDot: false,
  };
}

function getSettlementLabel(status: string | null): string {
  switch (status) {
    case 'paid':
      return 'Liquidado';
    case 'approved':
      return 'Liquidación Aprobada';
    case 'in_review':
      return 'Liquidación en Revisión';
    case 'requested':
      return 'Liquidación Solicitada';
    case 'rejected':
      return 'Liquidación Observada';
    default:
      return 'Liquidación del Evento';
  }
}

export default function OrganizerEventsScreen() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [events, setEvents] = useState<OrganizerEventModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterState, setFilterState] = useState<FilterState>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('3m');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [publishingUuid, setPublishingUuid] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingVerifyEventTitle, setPendingVerifyEventTitle] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  const loadOrganizerPanel = async (selectedPeriod: PeriodFilter = periodFilter) => {
    setIsLoading(true);
    setLoadError(null);

    const userRes = await getCurrentUserUseCase.execute();
    if (userRes.isErr()) {
      router.push('/login?redirect=/organizer/events');
      return;
    }

    setCurrentUser(userRes.value);

    const eventsRes = await getOrganizerEventsUseCase.execute({ period: selectedPeriod });
    eventsRes.match(
      (data) => {
        setEvents(data);
        setIsLoading(false);
      },
      (err) => {
        setLoadError(err.message || 'No pudimos cargar tus eventos en este momento.');
        setIsLoading(false);
      },
    );
  };

  const handlePeriodChange = (newPeriod: PeriodFilter) => {
    setPeriodFilter(newPeriod);
    void loadOrganizerPanel(newPeriod);
  };

  useEffect(() => {
    void loadOrganizerPanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    let onSale = 0;
    let soldOut = 0;
    let draft = 0;
    let inReview = 0;
    let observed = 0;
    let completed = 0;
    let inactive = 0;

    for (const ev of events) {
      if (ev.status === 'published') {
        if (ev.isSoldOut) soldOut += 1;
        else onSale += 1;
      } else if (ev.status === 'observed') {
        observed += 1;
      } else if (ev.status === 'in_review') {
        inReview += 1;
      } else if (ev.status === 'draft') {
        draft += 1;
      } else if (ev.status === 'completed') {
        completed += 1;
      } else if (ev.status === 'paused' || ev.status === 'cancelled') {
        inactive += 1;
      }
    }

    return {
      all: events.length,
      onSale,
      soldOut,
      draft,
      inReview,
      observed,
      completed,
      inactive,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return events.filter((ev) => {
      const matchesSearch =
        !q ||
        ev.name.toLowerCase().includes(q) ||
        (ev.venue || '').toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q) ||
        ev.eventCode.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      switch (filterState) {
        case 'on_sale':
          return ev.status === 'published' && !ev.isSoldOut;
        case 'sold_out':
          return ev.status === 'published' && ev.isSoldOut;
        case 'observed':
          return ev.status === 'observed';
        case 'in_review':
          return ev.status === 'in_review';
        case 'draft':
          return ev.status === 'draft';
        case 'completed':
          return ev.status === 'completed';
        case 'inactive':
          return ev.status === 'paused' || ev.status === 'cancelled';
        default:
          return true;
      }
    });
  }, [events, filterState, searchQuery]);

  const handlePublishDraft = async (event: OrganizerEventModel) => {
    if (publishingUuid) return;

    if (currentUser && !currentUser.emailVerifiedAt) {
      setPendingVerifyEventTitle(event.name);
      setResendFeedback(null);
      setShowVerifyModal(true);
      return;
    }

    setPublishingUuid(event.publicUuid);
    const res = await publishEventUseCase.execute(event.publicUuid);
    setPublishingUuid(null);

    res.match(
      () => {
        showNotice(`¡"${event.name}" publicado exitosamente! Ya está visible en cartelera.`);
        void loadOrganizerPanel();
      },
      (err) => {
        if (
          err.code === ERROR_CODES.FORBIDDEN.code ||
          err.message?.toLowerCase().includes('correo')
        ) {
          setPendingVerifyEventTitle(event.name);
          setResendFeedback(null);
          setShowVerifyModal(true);
          return;
        }
        showNotice(err.message || 'No se pudo publicar el evento. Verifica sus datos.');
      },
    );
  };

  const handleResendVerification = async () => {
    if (!currentUser?.email || isResending) return;
    setIsResending(true);
    setResendFeedback(null);

    const res = await resendVerificationUseCase.execute(currentUser.email);
    setIsResending(false);

    res.match(
      () => setResendFeedback(`Enviamos un nuevo enlace de confirmación a ${currentUser.email}.`),
      (err) => setResendFeedback(err.message || 'No se pudo reenviar el correo de verificación.'),
    );
  };

  if (isLoading) {
    return (
      <div className="bg-surface min-h-screen py-8">
        <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3 h-[540px] rounded-2xl bg-white border border-surface-variant animate-pulse" />
            <div className="lg:col-span-9 space-y-6">
              <div className="h-24 rounded-2xl bg-white border border-surface-variant animate-pulse" />
              <div className="h-64 rounded-2xl bg-white border border-surface-variant animate-pulse" />
              <div className="h-64 rounded-2xl bg-white border border-surface-variant animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario comprador sin perfil organizador activo ni eventos previos
  if (currentUser && !currentUser.isOrganizer && events.length === 0) {
    return (
      <div className="bg-surface min-h-[75vh] py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-surface-variant shadow-xs p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-electric-indigo mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-[34px]">storefront</span>
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[11px] uppercase tracking-wider">
              Panel de Organizadores
            </span>
            <h1 className="text-2xl font-extrabold text-deep-slate tracking-tight">
              Aún no has activado tu perfil de promotor
            </h1>
            <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              Publica conciertos, festivales, obras o experiencias con venta de entradas digitales, control de aforo por zonas y códigos QR encriptados. Al crear tu primer evento o guardar tus datos comerciales, tu panel quedará habilitado al instante.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/organizer/events/new?from=events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric-indigo text-white font-bold text-sm shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Crear mi primer evento</span>
            </Link>
            <Link
              href="/profile/settings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-gray text-deep-slate font-bold text-sm border border-surface-variant hover:bg-surface-variant/40 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              <span>Ir a Mis Datos</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pb-24 lg:pb-12">
      {/* Toast informativo */}
      {actionNotice && (
        <div className="fixed top-24 right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <span className="material-symbols-outlined text-electric-indigo text-[20px]">info</span>
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Modal Plan B: Confirmar correo antes de publicar borrador */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-deep-slate/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-variant space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">mark_email_unread</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-deep-slate">
                    Verifica tu correo para publicar
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Requisito de seguridad para venta de entradas oficiales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-gray flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tu evento <strong className="text-deep-slate">{pendingVerifyEventTitle}</strong> está guardado como borrador. Antes de publicarlo, confirma tu dirección{' '}
              <strong className="text-deep-slate">{currentUser?.email}</strong> haciendo clic en el enlace enviado a tu correo.
            </p>

            {resendFeedback && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-deep-slate">
                {resendFeedback}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isResending}
                onClick={handleResendVerification}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-electric-indigo text-white font-bold text-xs hover:bg-primary transition-all disabled:opacity-60 cursor-pointer"
              >
                {isResending ? 'Enviando enlace...' : 'Reenviar correo de verificación'}
              </button>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-surface-gray text-deep-slate font-bold text-xs hover:bg-surface-variant/60 transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra móvil de menú promotor */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-surface-variant px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-deep-slate bg-surface-gray px-3.5 py-2 rounded-xl border border-surface-variant/70 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-electric-indigo">menu</span>
          <span>Menú de Gestión</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse" />
          <span className="text-xs font-extrabold text-deep-slate">Panel Promotor</span>
        </div>
      </div>

      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <OrganizerSidebar
            activeSection="events"
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            onSelectUnavailableFeature={(featureName) =>
              showNotice(`"${featureName}" se conectará en la siguiente fase del panel promotor.`)
            }
          />

          <main className="lg:col-span-9 space-y-6 md:space-y-8">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant/40 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[11px] uppercase tracking-wider">
                    Centro de Operaciones
                  </span>
                  <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse" />
                  <span className="font-bold text-[12px] text-on-surface-variant">
                    {currentUser?.organizerName || 'Mi Productora'}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-deep-slate tracking-tight">
                  Panel del Organizador • Mis Eventos
                </h1>
                <p className="text-sm text-on-surface-variant">
                  Supervisa las ventas de tickets en tiempo real, controla el aforo por zonas y gestiona tus publicaciones y liquidaciones.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void loadOrganizerPanel()}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-surface-variant hover:border-electric-indigo/40 hover:text-electric-indigo text-slate-700 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                  title="Actualizar datos del panel"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isLoading ? 'animate-spin text-electric-indigo' : 'text-slate-500'
                    }`}
                  >
                    refresh
                  </span>
                  <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
                </button>

                <Link
                  href="/organizer/events/new?from=events"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric-indigo text-white font-bold text-xs shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Crear Nuevo Evento</span>
                </Link>
              </div>
            </div>

            {/* Error de carga */}
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-600 text-[22px]">error</span>
                  <div>
                    <p className="text-sm font-bold text-red-900">No pudimos cargar tus eventos</p>
                    <p className="text-xs text-red-700 mt-0.5">{loadError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void loadOrganizerPanel()}
                  className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 font-bold text-xs hover:bg-red-100/50 transition-colors cursor-pointer shrink-0"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Buscador y Filtros alineados a estados reales */}
            {events.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-surface-variant shadow-xs flex flex-col gap-4">
                {/* Fila 1: Buscador + Filtro Temporal inteligente */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-platinum-silver text-[20px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar evento por nombre, recinto, ciudad o código (#EV-...)..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-variant text-sm text-deep-slate placeholder:text-platinum-silver focus:ring-1 focus:ring-electric-indigo focus:border-electric-indigo outline-none transition-all"
                    />
                  </div>

                  {/* Selector de Rango Temporal */}
                  <div className="flex items-center gap-1.5 p-1 bg-surface-gray rounded-xl border border-surface-variant/50 self-start md:self-auto shrink-0">
                    <span className="material-symbols-outlined text-[17px] text-slate-400 pl-1">
                      date_range
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePeriodChange('3m')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        periodFilter === '3m'
                          ? 'bg-electric-indigo text-white shadow-2xs'
                          : 'text-slate-600 hover:text-deep-slate'
                      }`}
                    >
                      3 meses
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodChange('6m')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        periodFilter === '6m'
                          ? 'bg-electric-indigo text-white shadow-2xs'
                          : 'text-slate-600 hover:text-deep-slate'
                      }`}
                    >
                      6 meses
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodChange('12m')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        periodFilter === '12m'
                          ? 'bg-electric-indigo text-white shadow-2xs'
                          : 'text-slate-600 hover:text-deep-slate'
                      }`}
                    >
                      1 año
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePeriodChange('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        periodFilter === 'all'
                          ? 'bg-electric-indigo text-white shadow-2xs'
                          : 'text-slate-600 hover:text-deep-slate'
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                </div>

                {/* Fila 2: Pestañas por estado del evento */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin border-t border-surface-variant/40 pt-3">
                  <button
                    type="button"
                    onClick={() => setFilterState('all')}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'all'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Todos ({counts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterState('on_sale')}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'on_sale'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    En Venta ({counts.onSale})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterState('sold_out')}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'sold_out'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Sold Out ({counts.soldOut})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterState('draft')}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'draft'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Borradores ({counts.draft})
                  </button>
                  {counts.observed > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterState('observed')}
                      className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        filterState === 'observed'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      <span>Observados ({counts.observed})</span>
                    </button>
                  )}
                  {counts.inReview > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterState('in_review')}
                      className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        filterState === 'in_review'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
                      }`}
                    >
                      En Revisión ({counts.inReview})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFilterState('completed')}
                    className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      filterState === 'completed'
                        ? 'bg-electric-indigo text-white shadow-xs'
                        : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                    }`}
                  >
                    Finalizados ({counts.completed})
                  </button>
                  {counts.inactive > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterState('inactive')}
                      className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        filterState === 'inactive'
                          ? 'bg-electric-indigo text-white shadow-xs'
                          : 'bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                      }`}
                    >
                      Pausados/Canc. ({counts.inactive})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Estado vacío inicial (Organizador sin eventos) */}
            {!loadError && events.length === 0 && (
              <div className="bg-white rounded-2xl border border-surface-variant shadow-xs p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-electric-indigo mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">event_available</span>
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-extrabold text-deep-slate">
                    Todavía no has creado ningún evento
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                    Configura tu primer evento en pocos minutos: define zonas, tarifas de preventa, funciones, mapa de ubicación y landing page oficial.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/organizer/events/new?from=events"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-indigo text-white font-bold text-sm shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>Crear mi primer evento</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Estado vacío por filtros / búsqueda */}
            {events.length > 0 && filteredEvents.length === 0 && (
              <div className="bg-white rounded-2xl border border-surface-variant p-10 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-platinum-silver">search_off</span>
                <h3 className="text-base font-bold text-deep-slate">
                  No encontramos eventos con ese filtro
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Prueba limpiando el buscador o cambiando a la pestaña &quot;Todos&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterState('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-gray text-deep-slate text-xs font-bold hover:bg-surface-variant/60 transition-colors cursor-pointer"
                >
                  Mostrar todos los eventos
                </button>
              </div>
            )}

            {/* Listado real de eventos */}
            <div className="space-y-6">
              {filteredEvents.map((event) => {
                const categoryMeta = getCategoryById(event.category);
                const statusVisual = getEventStatusVisual(event);
                const isDraft = event.status === 'draft';
                const isObserved = event.status === 'observed';
                const isInReview = event.status === 'in_review';
                const isCompleted = event.status === 'completed';
                const isCancelled = event.status === 'cancelled';
                const targetPct =
                  event.targetRevenue > 0
                    ? Math.min(100, (event.netSalesRevenue / event.targetRevenue) * 100).toFixed(1)
                    : '0.0';

                return (
                  <article
                    key={event.publicUuid}
                    className="bg-white rounded-2xl border border-surface-variant shadow-xs overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="p-5 md:p-6 flex flex-col gap-5">
                      {/* Cabecera de la tarjeta */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 relative shadow-xs border border-surface-variant/40 bg-slate-100 flex items-center justify-center">
                            {event.imageUrl ? (
                              <img
                                className="w-full h-full object-cover"
                                src={event.imageUrl}
                                alt={event.name}
                              />
                            ) : (
                              <span className="material-symbols-outlined text-3xl text-platinum-silver">
                                image
                              </span>
                            )}
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-deep-slate/85 backdrop-blur-xs text-white font-extrabold text-[9px] uppercase">
                              {categoryMeta.label}
                            </span>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5 ${statusVisual.badgeClasses}`}
                              >
                                {statusVisual.showPulseDot && (
                                  <span className="w-2 h-2 rounded-full bg-electric-indigo animate-ping" />
                                )}
                                {event.statusLabel}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-surface-gray text-on-surface-variant font-bold text-[11px]">
                                ID: {event.eventCode}
                              </span>
                            </div>

                            <h2 className="text-lg md:text-xl font-bold text-deep-slate tracking-tight">
                              {event.name}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant font-semibold pt-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                                  calendar_today
                                </span>
                                <span>{event.dateFormatted}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                                  location_on
                                </span>
                                <span>
                                  {event.venue ? `${event.venue} • ${event.city}` : event.city}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-electric-indigo">
                                  confirmation_number
                                </span>
                                <span>Capacidad: {event.capacity.toLocaleString('es-PE')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bloque financiero de recaudación (oculto en borradores, observados y en revisión) */}
                        {!isDraft && !isObserved && !isInReview && (
                          <div className="bg-surface-gray px-5 py-3.5 rounded-xl border border-surface-variant/50 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-1 shrink-0">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                              Recaudación Actual
                            </span>
                            <div className="text-right">
                              <div className="text-xl md:text-2xl font-black text-deep-slate tracking-tight">
                                S/. {formatSoles(event.netSalesRevenue)}
                              </div>
                              {event.targetRevenue > 0 && (
                                <p className="text-[11px] font-bold text-on-surface-variant">
                                  Objetivo: S/. {formatSoles(event.targetRevenue)} ({targetPct}%)
                                </p>
                              )}
                              {event.couponsDiscountAmount > 0 && (
                                <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                                  Cupones aplicados: -S/. {formatSoles(event.couponsDiscountAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contenido de progreso / advertencia según estado */}
                      {isInReview ? (
                        <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-sky-600 text-[24px] shrink-0 mt-0.5">
                              hourglass_top
                            </span>
                            <div>
                              <p className="text-xs font-black text-sky-900 uppercase tracking-wide">
                                Evento en Revisión por Moderación
                              </p>
                              <p className="text-xs text-sky-950 font-medium mt-1 leading-relaxed">
                                Tu evento se encuentra en cola de moderación. El equipo de administración está revisando los detalles y el tarifario oficial. Durante esta fase el evento no puede ser modificado.
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-100 text-sky-900 font-bold text-xs shrink-0 border border-sky-200">
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            <span>En Espera de Aprobación</span>
                          </span>
                        </div>
                      ) : isObserved ? (
                        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">
                              warning
                            </span>
                            <div>
                              <p className="text-xs font-black text-amber-900 uppercase tracking-wide">
                                Evento Observado por Moderación
                              </p>
                              <p className="text-xs text-amber-950 font-medium mt-1 leading-relaxed">
                                {event.observationReason
                                  ? `Motivo: "${event.observationReason}"`
                                  : 'El equipo de administración ha solicitado correcciones en los datos del evento antes de autorizar su publicación.'}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/organizer/events/${event.publicUuid}/edit`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 shadow-xs transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                            <span>Subsanar y Corregir</span>
                          </Link>
                        </div>
                      ) : isDraft ? (
                        <div className="p-4 rounded-xl bg-surface-gray border border-surface-variant/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-vip-gold text-[20px] shrink-0 mt-0.5">
                              info
                            </span>
                            <div>
                              <p className="text-xs font-bold text-deep-slate">
                                Estado del Borrador ({event.draftChecklist.completionPercent}%)
                              </p>
                              {event.draftChecklist.missingItems.length > 0 ? (
                                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                                  Pendiente: {event.draftChecklist.missingItems.join(' • ')}.
                                </p>
                              ) : (
                                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                                  Configuración básica completa ({event.showsCount}{' '}
                                  {event.showsCount === 1 ? 'función' : 'funciones'},{' '}
                                  {event.zones.length}{' '}
                                  {event.zones.length === 1 ? 'zona' : 'zonas'}). Ya puedes publicarlo para iniciar la venta oficial.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="w-full sm:w-40 shrink-0 space-y-1">
                            <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-surface-variant/50">
                              <div
                                className="h-full bg-electric-indigo transition-all"
                                style={{ width: `${event.draftChecklist.completionPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Barra global de tickets vendidos */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
                              <div className="flex items-center gap-2 text-deep-slate">
                                <span>
                                  {event.ticketsSold.toLocaleString('es-PE')} /{' '}
                                  {event.capacity.toLocaleString('es-PE')} tickets vendidos
                                </span>
                                <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px]">
                                  {event.occupancyPercentage}% vendido
                                </span>
                              </div>
                              <span className="text-on-surface-variant text-[11px]">
                                {event.remainingTickets.toLocaleString('es-PE')} pases restantes
                              </span>
                            </div>

                            <div className="w-full h-3 rounded-full bg-surface-gray overflow-hidden flex border border-surface-variant/40">
                              <div
                                className="h-full bg-electric-indigo transition-all"
                                style={{ width: `${Math.min(100, event.occupancyPercentage)}%` }}
                              />
                            </div>
                          </div>

                          {/* Desglose por Zonas */}
                          {event.zones.length > 0 && (
                            <div className="rounded-xl bg-surface-gray/60 p-4 border border-surface-variant/60 space-y-3">
                              <div className="flex items-center justify-between pb-1">
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                                    analytics
                                  </span>
                                  <span className="font-bold text-xs text-deep-slate uppercase tracking-wider">
                                    Desglose de Aforo y Taquilla por Zonas
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    showNotice(
                                      'El ajuste de cupos por zona estará disponible en la fase de edición del evento.',
                                    )
                                  }
                                  className="text-xs font-bold text-on-surface-variant hover:text-electric-indigo flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Ajustar Cupos</span>
                                  <span className="material-symbols-outlined text-[16px]">tune</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                {event.zones.map((zone) => (
                                  <div
                                    key={zone.publicUuid}
                                    className="bg-white p-3.5 rounded-xl border border-surface-variant/60 shadow-xs flex flex-col justify-between gap-2"
                                  >
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="text-xs font-bold text-deep-slate truncate">
                                        {zone.name}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-surface-gray text-on-surface-variant font-extrabold text-[9px] uppercase shrink-0">
                                        {zone.statusBadge}
                                      </span>
                                    </div>
                                    <div className="flex items-baseline justify-between gap-1">
                                      <span className="text-base font-extrabold text-deep-slate">
                                        {zone.soldCount.toLocaleString('es-PE')}{' '}
                                        <span className="text-xs font-normal text-on-surface-variant">
                                          / {zone.capacity.toLocaleString('es-PE')}
                                        </span>
                                      </span>
                                      <div className="text-right">
                                        <span className="font-bold text-xs text-electric-indigo block">
                                          S/. {formatSoles(zone.activePrice)}
                                        </span>
                                        {zone.isPresaleActive && (
                                          <span className="text-[9px] font-semibold text-on-surface-variant block">
                                            {zone.activeTierName}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-surface-gray overflow-hidden">
                                      <div
                                        className="h-full transition-all"
                                        style={{
                                          width: `${Math.min(100, zone.occupancyPercentage)}%`,
                                          backgroundColor: zone.color || '#6366F1',
                                        }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-on-surface-variant font-semibold text-right">
                                      Recaudado: S/. {formatSoles(zone.revenue)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Footer de acciones operativas según estado */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-variant/40">
                        <div className="flex flex-wrap items-center gap-2">
                          {isInReview ? (
                            <>
                              <button
                                type="button"
                                disabled
                                title="El evento no puede editarse mientras está en revisión por moderación"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed border border-slate-200"
                              >
                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                <span>Edición Bloqueada (En Revisión)</span>
                              </button>
                              {event.hasLandingPage && event.slug && (
                                <Link
                                  href={`/e/${event.slug}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-gray text-on-surface-variant font-bold text-xs transition-all"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    visibility
                                  </span>
                                  <span>Previsualizar Landing</span>
                                </Link>
                              )}
                            </>
                          ) : isObserved ? (
                            <>
                              <Link
                                href={`/organizer/events/${event.publicUuid}/edit`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                <span>Editar y Subsanar Observaciones</span>
                              </Link>
                              {event.hasLandingPage && event.slug && (
                                <Link
                                  href={`/e/${event.slug}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-gray text-on-surface-variant font-bold text-xs transition-all"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    visibility
                                  </span>
                                  <span>Previsualizar Landing</span>
                                </Link>
                              )}
                            </>
                          ) : isDraft ? (
                            <>
                              <button
                                type="button"
                                disabled={publishingUuid === event.publicUuid}
                                onClick={() => void handlePublishDraft(event)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-electric-indigo hover:bg-primary text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {publishingUuid === event.publicUuid ? 'sync' : 'publish'}
                                </span>
                                <span>
                                  {publishingUuid === event.publicUuid
                                    ? 'Publicando...'
                                    : 'Publicar Evento'}
                                </span>
                              </button>

                              <Link
                                href={`/organizer/events/${event.publicUuid}/edit`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-gray hover:bg-surface-variant/60 text-on-surface-variant font-bold text-xs transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                <span>Editar Borrador</span>
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/organizer/events/${event.publicUuid}`}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-gray hover:bg-surface-variant/60 text-deep-slate font-bold text-xs border border-surface-variant/50 transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                                  query_stats
                                </span>
                                <span>Ver Ventas y Reporte</span>
                              </Link>

                              {/* Si el evento está completado (sus shows concluyeron): Se activa Liquidación Final */}
                              {isCompleted && (
                                <Link
                                  href={`/organizer/settlement?eventId=${event.publicUuid}&mode=liquidacion`}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    receipt_long
                                  </span>
                                  <span>{getSettlementLabel(event.settlementStatus)}</span>
                                </Link>
                              )}

                              {/* Si el evento está en venta (published): Se activa Solicitar Adelanto de Liquidación */}
                              {event.status === 'published' && !isCompleted && !isCancelled && (
                                <Link
                                  href={`/organizer/settlement?eventId=${event.publicUuid}&mode=adelanto`}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary-container/50 hover:bg-secondary-container text-primary font-bold text-xs transition-all cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    payments
                                  </span>
                                  <span>Solicitar Adelanto</span>
                                </Link>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  showNotice(
                                    'La edición de eventos publicados estará disponible en la siguiente fase.',
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-surface-gray text-on-surface-variant font-bold text-xs transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                <span>Editar Evento</span>
                              </button>

                              {!isCancelled && event.hasLandingPage && event.slug && (
                                <Link
                                  href={`/e/${event.slug}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-gray text-on-surface-variant font-bold text-xs transition-all"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    open_in_new
                                  </span>
                                  <span>Landing Pública</span>
                                </Link>
                              )}
                            </>
                          )}
                        </div>

                        {/* Botón de manifiesto CSV solo para eventos que ya están o estuvieron publicados */}
                        {!isDraft && !isInReview && !isObserved && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                showNotice(
                                  'La descarga del manifiesto CSV de asistentes se habilitará junto al detalle de ventas.',
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-gray hover:bg-surface-variant/60 text-deep-slate font-bold text-xs border border-surface-variant/50 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">download</span>
                              <span>CSV Manifiesto</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
