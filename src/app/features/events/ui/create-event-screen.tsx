'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiClient } from '@/app/common/services/api-client';
import { getCurrentUserUseCase, resendVerificationUseCase } from '@/app/features/auth';
import { createEventUseCase, publishEventUseCase } from '@/app/features/events';
import { UserModel } from '@/app/features/auth/models/user.model';
import { CreateEventParams } from '../dto/event.dto';
import {
  EVENT_CATEGORIES,
  AGE_RESTRICTIONS,
  getCategoryById,
  getAgeRestrictionById,
  slugify,
} from '../constants/eventConstants';

import { UbigeoSelector } from './components/ubigeo-selector';
import { ShowsManager, ShowItem } from './components/shows-manager';
import { ZonesManager, ZoneConfigItem } from './components/zones-manager';
import { CouponsManager, CouponFormItem } from './components/coupons-manager';
import { FaqsManager, FaqItem } from './components/faqs-manager';
import { LandingConfigManager, LandingConfigData } from './components/landing-config-manager';
import ImageUploader from './components/image-uploader';

// Carga dinámica del mapa OpenStreetMap / Leaflet (desactivando SSR)
const InteractiveMapPicker = dynamic(
  () =>
    import('./components/interactive-map-picker').then(
      (mod) => mod.InteractiveMapPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-56 rounded-2xl bg-surface-gray border border-surface-variant/60 flex items-center justify-center text-xs font-semibold text-on-surface-variant">
        Cargando mapa interactivo...
      </div>
    ),
  }
);

export default function CreateEventScreen() {
  const router = useRouter();

  // Estados de Sesión y Plan B
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const isProcessing = isSaving || isPublishing;

  // Estados de Datos del Organizador / Productora
  const [organizerName, setOrganizerName] = useState('');
  const [organizerDocumentType, setOrganizerDocumentType] = useState('RUC');
  const [organizerDocumentNumber, setOrganizerDocumentNumber] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState('');

  // Estados de Datos Principales
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EVENT_CATEGORIES[0].id); // CONCERTS
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [description, setDescription] = useState('');

  const SUGGESTED_TAGS = ['Música en Vivo', 'Festival', 'Pucallpa 2026', 'VIP', 'Feria Gastronómica', 'Todo Público'];

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd !== undefined ? tagToAdd : newTagInput;
    const clean = raw.trim().replace(/^#/, '');
    if (!clean) return;
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setNewTagInput('');
      return;
    }
    setTags([...tags, clean]);
    setNewTagInput('');
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Ubicación y Ubigeo
  const [ubigeoCode, setUbigeoCode] = useState('150101'); // Default Lima / Miraflores
  const [readableLocation, setReadableLocation] = useState('Miraflores, Lima, Lima');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueNotes, setVenueNotes] = useState('');
  const [coordinates, setCoordinates] = useState('-12.046374, -77.042793');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Reglas de Acceso e Información Operativa
  const [ageRestriction, setAgeRestriction] = useState(AGE_RESTRICTIONS[0].id); // ALL_AGES
  const [userTicketLimit, setUserTicketLimit] = useState<number>(4);
  const [entryRequirements, setEntryRequirements] = useState('');
  const [openingHoursComment, setOpeningHoursComment] = useState('');
  const [termsAndConditionsUrl, setTermsAndConditionsUrl] = useState('');

  // Multimedia
  const [mainBannerUrl, setMainBannerUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [zoneMapUrl, setZoneMapUrl] = useState('');

  // Funciones / Shows
  const [shows, setShows] = useState<ShowItem[]>([]);

  // Zonas y Preventas Escalonadas
  const [zones, setZones] = useState<ZoneConfigItem[]>([]);

  // Cupones y Promociones
  const [coupons, setCoupons] = useState<CouponFormItem[]>([]);

  // Preguntas Frecuentes (FAQs)
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  // Landing Page Dedicada
  const [hasDedicatedLanding, setHasDedicatedLanding] = useState(false);
  const [landingSlug, setLandingSlug] = useState('');
  const [landingConfig, setLandingConfig] = useState<LandingConfigData>({
    header: {
      title: '',
      subtitle: '',
      headerImageUrl: '',
      ctaText: 'Comprar Entradas Oficiales',
      videoTeaserUrl: '',
    },
    body: {
      aboutText: '',
      bodyImageUrl: '',
      highlight1: '',
      highlight2: '',
      highlight3: '',
    },
    footer: {
      footerImageUrl: '',
      instagramUrl: '',
      facebookUrl: '',
      tiktokUrl: '',
    },
    theme: {
      primaryColor: '#6366F1',
      backgroundColor: '#0B0F19',
      backgroundType: 'color',
    },
  });

  // Handler para activar/desactivar landing page con slug y título automático
  const handleToggleLanding = (active: boolean) => {
    setHasDedicatedLanding(active);
    if (active) {
      if (!landingSlug || landingSlug.trim() === '') {
        const auto = slugify(title);
        setLandingSlug(auto || 'mi-evento-especial');
      }
      if (!landingConfig.header?.title && title.trim()) {
        setLandingConfig((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            title: title.trim(),
          },
        }));
      }
    }
  };

  // UI Stepper & Active Tabs
  const [activeStep, setActiveStep] = useState('datos');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const SECTIONS = [
    { id: 'datos', step: 1, label: 'Ficha Canónica', icon: 'edit_note' },
    { id: 'multimedia', step: 2, label: 'Multimedia & Croquis', icon: 'photo_library' },
    { id: 'funciones', step: 3, label: 'Shows y Fechas', icon: 'calendar_month' },
    { id: 'localidades', step: 4, label: 'Zonas & Preventas', icon: 'confirmation_number' },
    { id: 'landing', step: 5, label: 'Landing Page', icon: 'web' },
    { id: 'cupones', step: 6, label: 'Cupones & FAQs', icon: 'sell' },
  ];

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setActiveStep(sectionId);
    const element = document.getElementById(`seccion-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const sectionIds = ['datos', 'multimedia', 'funciones', 'localidades', 'landing', 'cupones'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + (window.innerWidth >= 768 ? 220 : 180);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(`seccion-${sectionIds[i]}`);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveStep(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Verificar sesión sin expulsar (Lazy Authentication)
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    getCurrentUserUseCase.execute().match(
      (user) => {
        setCurrentUser(user);
        if (user.organizerName) setOrganizerName(user.organizerName);
        if (user.organizerDocumentType) setOrganizerDocumentType(user.organizerDocumentType);
        if (user.organizerDocumentNumber) setOrganizerDocumentNumber(user.organizerDocumentNumber);
        if (user.organizerPhone || user.phone) setOrganizerPhone(user.organizerPhone || user.phone || '');
        if (user.organizerLogoUrl) setOrganizerLogoUrl(user.organizerLogoUrl);
      },
      () => {
        apiClient.clearToken();
        setCurrentUser(null);
      }
    );
  }, []);

  // Guardar en almacenamiento local si no está logueado
  const saveLocalDraft = () => {
    try {
      localStorage.setItem(
        'qph_event_draft',
        JSON.stringify({
          title,
          category,
          description,
          ubigeoCode,
          venueName,
          venueAddress,
          coordinates,
          googleMapsUrl,
          ageRestriction,
          userTicketLimit,
          entryRequirements,
          openingHoursComment,
          termsAndConditionsUrl,
          landingSlug,
        })
      );
    } catch {}
  };

  // Reenviar confirmación de email (Plan B)
  const handleResendEmail = async () => {
    if (!currentUser?.email) return;
    setIsResending(true);
    setResendStatus(null);
    const res = await resendVerificationUseCase.execute(currentUser.email);
    setIsResending(false);
    res.match(
      (data) => setResendStatus(data.message || 'Correo de verificación reenviado exitosamente.'),
      (err) => setResendStatus(err.message || 'Error al reenviar correo.')
    );
  };

  // Cálculos dinámicos
  const totalCapacity = zones.reduce((acc, z) => acc + Number(z.capacity || 0), 0);

  // Armar Payload Consolidado
  const buildEventPayload = (): CreateEventParams => {
    const primaryZone = zones[0] || { regularPrice: 0, capacity: 0 };
    const primaryShow = shows[0] || { startTime: new Date().toISOString() };
    const finalSlug = (hasDedicatedLanding && landingSlug.trim())
      ? landingSlug.trim()
      : (title.trim() ? slugify(title.trim()) : undefined);

    return {
      title: title.trim(),
      slug: finalSlug,
      description: description.trim() || undefined,
      category: category,
      tags: tags.filter(Boolean),
      organizerName: organizerName.trim() || undefined,
      organizerDocumentType: organizerDocumentType || undefined,
      organizerDocumentNumber: organizerDocumentNumber.trim() || undefined,
      organizerPhone: organizerPhone.trim() || undefined,
      organizerLogoUrl: organizerLogoUrl || undefined,
      date: primaryShow.startTime,
      location: venueName.trim() || 'Recinto Principal',
      venue: venueName.trim() || undefined,
      address: venueAddress.trim() || undefined,
      addressReference: venueNotes.trim() || undefined,
      ubigeoCode: ubigeoCode || undefined,
      coordinates: coordinates || undefined,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      ageRestriction,
      userTicketLimit: Number(userTicketLimit) || 4,
      entryRequirements: entryRequirements.trim() || undefined,
      openingHoursComment: openingHoursComment.trim() || undefined,
      termsAndConditionsUrl: termsAndConditionsUrl.trim() || undefined,
      faqs: faqs.map((f) => ({ question: f.question, answer: f.answer })),
      hasLandingPage: hasDedicatedLanding,
      landingConfig: hasDedicatedLanding ? { ...landingConfig, slug: landingSlug } : undefined,
      price: Number(primaryZone.regularPrice) || 0,
      capacity: Number(totalCapacity) || 0,
      bannerUrl: mainBannerUrl || undefined,
      shows: shows.map((s) => ({
        name: s.name,
        startTime: s.startTime,
        salesEndAt: s.salesEndAt,
        durationHours: s.durationHours,
        endTime: s.endTime,
      })),
      zones: zones.map((z) => ({
        name: z.name,
        title: z.title,
        color: z.color,
        capacity: z.capacity,
        regularPrice: z.regularPrice,
        serviceFee: z.serviceFee,
        benefits: z.benefits,
        maxTicketsPerOrder: z.maxTicketsPerOrder,
        maxTicketsPerUser: z.maxTicketsPerUser,
        salesStartAt: z.salesStartAt,
        tiers: z.tiers?.map((t) => ({
          tierNumber: t.tierNumber,
          name: t.name,
          price: t.price,
          capacity: t.capacity,
          endAt: t.endAt,
        })),
      })),
      coupons: coupons.map((c) => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        usageType: c.usageType,
        maxUses: c.maxUses,
        expiresAt: c.expiresAt,
      })),
      images: [
        ...(mainBannerUrl ? [{ imageUrl: mainBannerUrl, imageType: 'banner', sortOrder: 0 }] : []),
        ...galleryUrls.map((url, i) => ({ imageUrl: url, imageType: 'gallery', sortOrder: i + 1 })),
        ...(zoneMapUrl ? [{ imageUrl: zoneMapUrl, imageType: 'zone_map', sortOrder: 99 }] : []),
      ],
    };
  };

  // Guardar Borrador (Plan B: Siempre permitido sin restricción de email)
  const handleSaveDraft = async () => {
    if (isProcessing) return;

    if (!title.trim()) {
      showToast('Ingresa al menos el título o nombre oficial del evento para guardar el borrador.');
      const el = document.getElementById('event-title');
      if (el) el.focus();
      return;
    }

    if (!apiClient.getToken()) {
      saveLocalDraft();
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    const payload = buildEventPayload();

    const result = await createEventUseCase.execute(payload);
    setIsSaving(false);

    result.match(
      (saved) => {
        setCreatedEventId(saved.id);
        showToast('¡Borrador guardado exitosamente en la base de datos!');
      },
      (err) => {
        showToast(err.message || 'Error al guardar borrador del evento.');
      }
    );
  };

  // Publicar Evento (Plan B: Exige email verificado)
  const handlePublish = async () => {
    if (isProcessing) return;

    if (!title.trim()) {
      showToast('El título del evento es obligatorio para publicar.');
      const el = document.getElementById('event-title');
      if (el) el.focus();
      return;
    }

    if (shows.length === 0) {
      showToast('Debes programar al menos una función o fecha en la sección "Shows y Fechas".');
      return;
    }

    if (zones.length === 0) {
      showToast('Debes configurar al menos una zona con aforo y precio en "Zonas & Preventas".');
      return;
    }

    if (!mainBannerUrl) {
      showToast('Debes subir el Banner Principal del evento en la sección "Multimedia".');
      return;
    }

    if (!apiClient.getToken()) {
      saveLocalDraft();
      setShowAuthModal(true);
      return;
    }

    // Si el usuario no tiene correo verificado, bloquear según Plan B
    if (!currentUser?.emailVerifiedAt) {
      if (!createdEventId) {
        await handleSaveDraft();
      }
      setShowVerifyModal(true);
      return;
    }

    // Publicar evento en vivo con bloqueo global
    setIsPublishing(true);
    try {
      let targetEventId = createdEventId;
      if (!targetEventId) {
        const payload = buildEventPayload();
        const saveRes = await createEventUseCase.execute(payload);
        if (saveRes.isErr()) {
          setIsPublishing(false);
          showToast(saveRes.error.message || 'Error al guardar el evento antes de publicar.');
          return;
        }
        targetEventId = saveRes.value.id;
        setCreatedEventId(targetEventId);
      }

      const publishRes = await publishEventUseCase.execute(targetEventId);
      publishRes.match(
        () => {
          showToast('¡Evento publicado exitosamente! Tu cartelera ya está en vivo.');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        },
        (err) => {
          setIsPublishing(false);
          if (err.message.includes('verificar') || err.code === 'FORBIDDEN') {
            setShowVerifyModal(true);
          } else {
            showToast(err.message || 'No se pudo publicar el evento.');
          }
        }
      );
    } catch (err: any) {
      setIsPublishing(false);
      showToast(err.message || 'Error inesperado al publicar el evento.');
    }
  };

  return (
    <div className="bg-surface min-h-screen py-6 md:py-10">
      {/* Toast Flotante */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-electric-indigo text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 space-y-6 md:space-y-8 animate-in fade-in duration-300">
        {/* BANNER PLAN B: AVISO SI CORREO NO ESTÁ VERIFICADO */}
        {currentUser && !currentUser.emailVerifiedAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl flex-shrink-0">
                mark_email_unread
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Tu correo aún no está verificado ({currentUser.email})
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  Puedes diseñar y guardar tu borrador libremente. Para publicarlo y abrir la venta de entradas al público, deberás confirmar tu cuenta.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResending}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex-shrink-0"
            >
              {isResending ? 'Reenviando...' : 'Reenviar confirmación'}
            </button>
          </div>
        )}

        {resendStatus && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-electric-indigo text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">info</span>
            <span>{resendStatus}</span>
          </div>
        )}

        {/* TOP STATUS & ACTIONS HEADER */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-gray text-deep-slate font-extrabold text-xs uppercase tracking-wider border border-surface-variant/40">
                <span className="w-2 h-2 rounded-full bg-vip-gold animate-pulse"></span>
                Borrador sin publicar
              </span>
              <span className="inline-flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px] text-green-600">cloud_done</span>
                Autoguardado disponible
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-deep-slate tracking-tight">
              Registro de Evento • Organizador
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl">
              Configura tu espectáculo con geolocalización por Ubigeo INEI, mapa interactivo, aforos en Soles (S/.), preventas escalonadas y cupones de campaña.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-gray text-deep-slate font-bold text-xs hover:bg-surface-variant/70 border border-surface-variant/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-electric-indigo text-white font-bold text-xs shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
              <span>{isPublishing ? 'Publicando...' : 'Publicar Evento'}</span>
            </button>
          </div>
        </div>

        {/* STEPPER NAVIGATION */}
        <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-surface-variant shadow-md overflow-x-auto qph-hide-scrollbar transition-all">
          <nav className="flex items-center gap-2 min-w-max lg:min-w-0 w-full">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={(e) => scrollToSection(e, s.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 md:py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer select-none shrink-0 sm:shrink ${
                  activeStep === s.id
                    ? 'bg-electric-indigo text-white shadow-xs'
                    : 'hover:bg-surface-gray text-on-surface-variant hover:text-deep-slate'
                }`}
              >
                <span
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    activeStep === s.id ? 'bg-white/20 text-white' : 'bg-surface-gray text-deep-slate'
                  }`}
                >
                  {s.step}
                </span>
                <span className="material-symbols-outlined text-[16px] md:text-[18px] hidden lg:inline shrink-0">
                  {s.icon}
                </span>
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* =========================================================================
            SECCIÓN 1: FICHA CANÓNICA DEL EVENTO
           ========================================================================= */}
        <section
          id="seccion-datos"
          className="scroll-mt-36 md:scroll-mt-44 bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-surface-variant/40 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h2 className="text-xl font-bold text-deep-slate">Ficha Canónica y Ubicación</h2>
                <p className="text-xs text-on-surface-variant">Información principal, geolocalización con Ubigeo y normas de acceso.</p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-electric-indigo uppercase tracking-wider bg-electric-indigo/10 px-3 py-1 rounded-full">
              Obligatorio
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: Datos del Evento */}
            <div className="lg:col-span-8 space-y-5">
              {/* Título */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-deep-slate" htmlFor="event-title">
                    Nombre Oficial del Evento *
                  </label>
                  <span className="text-on-surface-variant">{title.length} / 100</span>
                </div>
                <input
                  id="event-title"
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-surface-variant/60 font-bold text-base text-deep-slate focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none"
                  placeholder="Ej. Gran Concierto de Cumbia 2026, Festival Selva Central, Obra Teatral..."
                />
              </div>

              {/* Categoría y Restricción de Edad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-deep-slate">Categoría Principal *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-surface-variant/60 text-sm font-semibold text-deep-slate focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none"
                  >
                    {EVENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-deep-slate">Restricción de Edad *</label>
                  <select
                    value={ageRestriction}
                    onChange={(e) => setAgeRestriction(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-surface-variant/60 text-sm font-semibold text-deep-slate focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none"
                  >
                    {AGE_RESTRICTIONS.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.icon} {res.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Etiquetas / Tags de Búsqueda */}
              <div className="space-y-2.5 p-4 rounded-xl bg-surface-gray/50 border border-surface-variant/60">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-deep-slate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-electric-indigo text-[16px]">label</span>
                    Etiquetas de Búsqueda (Tags)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {tags.length} etiqueta{tags.length === 1 ? '' : 's'} configurada{tags.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">#</span>
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleKeyDownTag}
                      placeholder="Escribe una etiqueta y presiona Enter o coma (ej: Salsa, VIP, Pucallpa)..."
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-4 py-2 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    + Añadir Tag
                  </button>
                </div>

                {/* Chips de tags seleccionados */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-electric-indigo text-xs font-bold shadow-xs animate-in fade-in"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-200/60 text-indigo-700 transition-colors"
                          title={`Eliminar #${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Sugerencias Rápidas */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Sugerencias:</span>
                  {SUGGESTED_TAGS.map((sug) => {
                    const isAlreadyAdded = tags.some((t) => t.toLowerCase() === sug.toLowerCase());
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddTag(sug)}
                        disabled={isAlreadyAdded}
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all ${
                          isAlreadyAdded
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-electric-indigo hover:text-electric-indigo cursor-pointer'
                        }`}
                      >
                        +{sug}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-deep-slate">Descripción Completa del Evento *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo leading-relaxed"
                  placeholder="Describe la experiencia del espectáculo, cartelera de artistas invitados, atracciones, horarios de acceso y recomendaciones..."
                />
              </div>

              {/* DATOS DEL ORGANIZADOR / PRODUCTORA */}
              <div className="pt-4 border-t border-surface-variant/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-electric-indigo text-[20px]">badge</span>
                    <h3 className="font-bold text-sm text-deep-slate">Datos de la Productora / Organizador</h3>
                  </div>
                  <span className="text-[11px] font-bold text-electric-indigo bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Perfil Promotor
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Información legal y comercial que respaldará las entradas, comprobantes y perfil de venta de este evento.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Razón Social o Nombre Comercial *</label>
                    <input
                      type="text"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder="Ej: Selva Central Producciones SAC, Mega Conciertos..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="font-bold text-xs text-deep-slate">Doc. *</label>
                      <select
                        value={organizerDocumentType}
                        onChange={(e) => setOrganizerDocumentType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-semibold text-deep-slate outline-none focus:border-electric-indigo"
                      >
                        <option value="RUC">RUC</option>
                        <option value="DNI">DNI</option>
                        <option value="CE">CE</option>
                      </select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="font-bold text-xs text-deep-slate">Número *</label>
                      <input
                        type="text"
                        value={organizerDocumentNumber}
                        onChange={(e) => setOrganizerDocumentNumber(e.target.value)}
                        placeholder="Ej: 20601234567"
                        maxLength={20}
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Teléfono o WhatsApp Comercial</label>
                    <input
                      type="tel"
                      value={organizerPhone}
                      onChange={(e) => setOrganizerPhone(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Logotipo de la Productora (Opcional)</label>
                    <ImageUploader
                      compact={true}
                      aspectRatio="square"
                      folder="organizers"
                      value={organizerLogoUrl}
                      onChange={setOrganizerLogoUrl}
                      helpText="Sube el logo o imagen corporativa"
                    />
                  </div>
                </div>
              </div>

              {/* UBICACIÓN Y GEOLOCALIZACIÓN: UBIGEO-PERU */}
              <div className="pt-4 border-t border-surface-variant/40 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[20px]">explore</span>
                  <h3 className="font-bold text-sm text-deep-slate">Ubicación y Geolocalización (Perú)</h3>
                </div>

                {/* Selector de Ubigeo INEI */}
                <UbigeoSelector
                  value={ubigeoCode}
                  onChange={(code, label) => {
                    setUbigeoCode(code);
                    setReadableLocation(label);
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Nombre del Recinto / Local *</label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Ej: Explanada Ferial Yarinacocha, Estadio Nacional, Arena 1..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Dirección Exacta *</label>
                    <input
                      type="text"
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      placeholder="Ej: Av. Javier Prado Este 456, Jr. De la Unión 123..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Referencia de Llegada</label>
                    <input
                      type="text"
                      value={venueNotes}
                      onChange={(e) => setVenueNotes(e.target.value)}
                      placeholder="Ej: Frente al malecón turístico, acceso vehicular por puerta 4..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">URL Google Maps / Waze</label>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=-12.046374,-77.042793"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                </div>

                {/* MAPA INTERACTIVO OPENSTREETMAP / LEAFLET */}
                <InteractiveMapPicker
                  value={coordinates}
                  onChange={(coords) => setCoordinates(coords)}
                />
              </div>

              {/* NORMAS Y REQUISITOS OPERATIVOS */}
              <div className="pt-4 border-t border-surface-variant/40 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[20px]">policy</span>
                  <h3 className="font-bold text-sm text-deep-slate">Normas, Salvaguardas y Legal</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">Límite Global de Entradas por Usuario</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={userTicketLimit}
                      onChange={(e) => setUserTicketLimit(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-bold text-deep-slate outline-none"
                    />
                    <p className="text-[10px] text-on-surface-variant">Tope de seguridad por comprador para evitar la reventa.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate">URL de Términos y Condiciones (PDF Oficial) *</label>
                    <input
                      type="url"
                      value={termsAndConditionsUrl}
                      onChange={(e) => setTermsAndConditionsUrl(e.target.value)}
                      placeholder="https://cdn.queplaneshoy.com/legal/terminos_y_condiciones_oficial.pdf"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate">Requisitos de Entrada al Recinto</label>
                  <textarea
                    rows={2}
                    value={entryRequirements}
                    onChange={(e) => setEntryRequirements(e.target.value)}
                    placeholder="Ej: DNI físico obligatorio para todos los asistentes. Prohibido portar alimentos externos, bebidas o pirotecnia..."
                    className="w-full p-3 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate">Comentarios de Horarios de Apertura</label>
                  <textarea
                    rows={2}
                    value={openingHoursComment}
                    onChange={(e) => setOpeningHoursComment(e.target.value)}
                    placeholder="Ej: Apertura de puertas a las 18:00 hrs. Se recomienda llegar con 45 minutos de anticipación para el escaneo de entradas..."
                    className="w-full p-3 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen Rápido */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-gray p-5 rounded-2xl border border-surface-variant/60 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[22px]">verified</span>
                  <h3 className="font-bold text-sm text-deep-slate">Resumen de la Ficha</h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Productora:</span>
                    <strong className="text-deep-slate font-bold truncate max-w-[150px]">
                      {organizerName || 'Sin asignar'}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Ubicación INEI:</span>
                    <strong className="text-deep-slate font-mono">{ubigeoCode || '150101'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Distrito:</span>
                    <span className="text-deep-slate font-medium truncate max-w-[150px]">{readableLocation}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Coordenadas:</span>
                    <span className="text-electric-indigo font-mono text-[11px] font-bold">{coordinates}</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Categoría:</span>
                    <span className="font-bold text-deep-slate flex items-center gap-1">
                      <span>{getCategoryById(category).icon}</span>
                      <span>{getCategoryById(category).label}</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Edad Permitida:</span>
                    <span className="font-bold text-deep-slate flex items-center gap-1">
                      <span>{getAgeRestrictionById(ageRestriction).icon}</span>
                      <span>{getAgeRestrictionById(ageRestriction).label}</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Etiquetas:</span>
                    <span className="font-bold text-electric-indigo font-mono text-[11px]">{tags.length} tags</span>
                  </div>
                  <div className="flex justify-between border-b border-surface-variant/40 pb-2">
                    <span className="text-on-surface-variant">Tope Compra:</span>
                    <span className="font-bold text-deep-slate">{userTicketLimit} tks / cliente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECCIÓN 2: MULTIMEDIA & CROQUIS
           ========================================================================= */}
        <section
          id="seccion-multimedia"
          className="scroll-mt-36 md:scroll-mt-44 bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-surface-variant/40 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h2 className="text-xl font-bold text-deep-slate">Multimedia, Galería &amp; Croquis</h2>
                <p className="text-xs text-on-surface-variant">Imágenes en alta resolución y esquema vectorial de las zonas del recinto.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-deep-slate bg-surface-gray px-3 py-1 rounded-full border border-surface-variant/40">
              Formatos Oficiales
            </span>
          </div>

          {/* FILA 1: BANNER PRINCIPAL Y CROQUIS (2 COLUMNAS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner Portada */}
            <div className="bg-surface-gray p-5 rounded-2xl border border-surface-variant/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-deep-slate">Banner Principal</span>
                  <span className="text-[11px] font-bold text-electric-indigo bg-white px-2 py-0.5 rounded-md shadow-xs">1920x800 px</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-2">Cabecera de la ficha oficial y carrusel de cartelera.</p>
              </div>
              <ImageUploader
                aspectRatio="banner"
                folder="banners"
                value={mainBannerUrl}
                onChange={setMainBannerUrl}
                helpText="Arrastra o haz clic para subir el banner principal"
              />
            </div>

            {/* Esquema del Recinto / Croquis */}
            <div className="bg-surface-gray p-5 rounded-2xl border border-surface-variant/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-deep-slate">Croquis de Zonas</span>
                  <span className="text-[11px] font-bold text-vip-gold bg-white px-2 py-0.5 rounded-md shadow-xs">Plano Recinto</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-2">Plano o mapa que orientará la compra de entradas.</p>
              </div>
              <ImageUploader
                aspectRatio="banner"
                folder="croquis"
                value={zoneMapUrl}
                onChange={setZoneMapUrl}
                helpText="Sube el plano de distribución de zonas"
              />
            </div>
          </div>

          {/* FILA 2: GALERÍA DE FOTOS (MÁXIMO 4 FOTOS OFICIALES) */}
          <div className="bg-surface-gray p-6 rounded-2xl border border-surface-variant/60 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[20px]">photo_library</span>
                  <h3 className="font-bold text-sm text-deep-slate">Galería de Fotos Oficiales</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    galleryUrls.length >= 4 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-indigo-50 text-electric-indigo border border-indigo-100'
                  }`}>
                    {galleryUrls.length}/4 fotos {galleryUrls.length >= 4 ? '(Límite alcanzado)' : ''}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Fotos de ambientación, artistas y escenario. Máximo 4 fotografías para optimizar la carga móvil.
                </p>
              </div>
            </div>

            {/* Cuadrícula de 4 slots para la galería */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((slotIndex) => {
                const currentImg = galleryUrls[slotIndex];
                const isNextAvailableSlot = slotIndex === galleryUrls.length && galleryUrls.length < 4;

                if (currentImg) {
                  return (
                    <div
                      key={slotIndex}
                      className="relative group rounded-2xl overflow-hidden border border-surface-variant/80 bg-white shadow-xs aspect-[4/3] flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentImg}
                        alt={`Foto de galería ${slotIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-bold">
                        Foto {slotIndex + 1}
                      </div>
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== slotIndex))}
                          className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1 shadow"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isNextAvailableSlot) {
                  return (
                    <div key={slotIndex} className="aspect-[4/3]">
                      <ImageUploader
                        aspectRatio="auto"
                        folder="gallery"
                        value=""
                        onChange={(newImg) => {
                          if (newImg && galleryUrls.length < 4) {
                            setGalleryUrls([...galleryUrls, newImg]);
                          }
                        }}
                        helpText={`+ Añadir Foto ${slotIndex + 1} de 4`}
                        className="h-full"
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={slotIndex}
                    className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 flex flex-col items-center justify-center p-4 text-center text-slate-300"
                  >
                    <span className="material-symbols-outlined text-[28px] opacity-40">image</span>
                    <span className="text-[11px] font-semibold mt-1">Slot {slotIndex + 1} libre</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECCIÓN 3: FUNCIONES Y SHOWS
           ========================================================================= */}
        <section
          id="seccion-funciones"
          className="scroll-mt-36 md:scroll-mt-44 bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-surface-variant/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
              3
            </span>
            <div>
              <h2 className="text-xl font-bold text-deep-slate">Calendario de Fechas y Funciones (Shows)</h2>
              <p className="text-xs text-on-surface-variant">Configura las fechas de presentación con horarios de puertas y cierre de venta.</p>
            </div>
          </div>

          <ShowsManager shows={shows} onChange={(updated) => setShows(updated)} totalCapacity={totalCapacity} />
        </section>

        {/* =========================================================================
            SECCIÓN 4: ZONAS, PRECIOS Y PREVENTAS ESCALONADAS
           ========================================================================= */}
        <section
          id="seccion-localidades"
          className="scroll-mt-36 md:scroll-mt-44 bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-surface-variant/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
              4
            </span>
            <div>
              <h2 className="text-xl font-bold text-deep-slate">Zonas, Aforos y Preventas Escalonadas</h2>
              <p className="text-xs text-on-surface-variant">Configura el precio regular en Soles (S/.) y hasta 3 etapas de preventa por zona.</p>
            </div>
          </div>

          <ZonesManager zones={zones} onChange={(updated) => setZones(updated)} />
        </section>

        {/* =========================================================================
            SECCIÓN 5: LANDING PAGE DEDICADA
           ========================================================================= */}
        <section
          id="seccion-landing"
          className="scroll-mt-36 md:scroll-mt-44 bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-surface-variant/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
              5
            </span>
            <div>
              <h2 className="text-xl font-bold text-deep-slate">Landing Page Dedicada (Assets &amp; Redes)</h2>
              <p className="text-xs text-on-surface-variant">Página exclusiva con banner de cabecera, body, footer y enlaces sociales.</p>
            </div>
          </div>

          <LandingConfigManager
            hasLanding={hasDedicatedLanding}
            onToggleLanding={handleToggleLanding}
            config={landingConfig}
            onChangeConfig={(newCfg) => setLandingConfig(newCfg)}
            slug={landingSlug}
            onChangeSlug={(s) => setLandingSlug(s)}
            eventTitle={title}
          />
        </section>

        {/* =========================================================================
            SECCIÓN 6: CUPONES DE DESCUENTO & FAQS
           ========================================================================= */}
        <section
          id="seccion-cupones"
          className="scroll-mt-36 md:scroll-mt-44 bg-white p-6 md:p-8 rounded-2xl border border-surface-variant shadow-xs space-y-8"
        >
          <div className="flex items-center gap-3 border-b border-surface-variant/40 pb-4">
            <span className="w-8 h-8 rounded-xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center font-bold text-sm">
              6
            </span>
            <div>
              <h2 className="text-xl font-bold text-deep-slate">Cupones Promocionales &amp; Preguntas Frecuentes</h2>
              <p className="text-xs text-on-surface-variant">Campañas con fecha de vencimiento y resolución de dudas comunes para el cliente.</p>
            </div>
          </div>

          <CouponsManager coupons={coupons} onChange={(updated) => setCoupons(updated)} />

          <div className="pt-6 border-t border-surface-variant/40">
            <FaqsManager faqs={faqs} onChange={(updated) => setFaqs(updated)} />
          </div>
        </section>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-surface-variant shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-deep-slate">Aforo Total:</span>
                <span className="font-extrabold text-xs text-electric-indigo bg-electric-indigo/10 px-2.5 py-0.5 rounded-full">
                  {totalCapacity.toLocaleString()} tickets
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">Todos los campos canónicos y reglas de ticketing están sincronizados con la BD.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-surface-gray text-deep-slate font-bold text-xs hover:bg-surface-variant/70 border border-surface-variant/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar Borrador'}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-electric-indigo text-white font-bold text-xs shadow-md shadow-electric-indigo/25 hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span>{isPublishing ? 'Publicando...' : 'Publicar Evento Ahora'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: IDENTIFICACIÓN PARA GUARDAR / PUBLICAR (Lazy Auth) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant space-y-5 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-electric-indigo rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">account_circle</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-deep-slate tracking-tight mb-2">
                ¡Tu evento está listo para guardarse! 🎟️
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Hemos asegurado los datos de tu evento. Inicia sesión o regístrate en 30 segundos para asociarlo a tu cuenta de organizador y ponerlo en marcha.
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <Link
                href="/login?redirect=/organizer/events/new"
                className="w-full qph-btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Iniciar Sesión</span>
              </Link>
              <Link
                href="/register?redirect=/organizer/events/new"
                className="w-full py-2.5 px-4 rounded-xl bg-surface-gray hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Crear Cuenta Nueva</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-deep-slate transition-colors cursor-pointer"
              >
                Continuar editando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PLAN B: AVISO AL INTENTAR PUBLICAR SIN CORREO VERIFICADO */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant space-y-5 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-deep-slate tracking-tight mb-2">
                ¡Tu evento está guardado como borrador! 🎟️
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Para ponerlo a la venta al público y activar las entradas, por favor confirma el enlace que enviamos a tu correo:
              </p>
              <p className="text-xs font-bold text-deep-slate mt-1.5 bg-surface-gray py-1.5 px-3 rounded-lg inline-block">
                {currentUser?.email}
              </p>
            </div>
            {resendStatus && (
              <p className="text-xs font-semibold text-electric-indigo bg-indigo-50 p-2.5 rounded-xl">
                {resendStatus}
              </p>
            )}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full qph-btn-primary py-3 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isResending ? 'Reenviando...' : 'Reenviar Correo de Confirmación'}
              </button>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-full py-2.5 text-xs font-bold text-on-surface-variant hover:text-deep-slate transition-colors cursor-pointer"
              >
                Continuar editando borrador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE CARGA DE PANTALLA COMPLETA (Bloqueo anti doble clic / anti sumisión concurrente) */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 border border-surface-variant animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[36px] animate-spin">
                progress_activity
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-deep-slate tracking-tight">
                {isPublishing ? 'Publicando evento en cartelera...' : 'Guardando borrador del evento...'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isPublishing
                  ? 'Estamos validando tus localidades, aforos y credenciales para abrir la venta al público.'
                  : 'Sincronizando la información de forma segura en la base de datos.'}
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Por favor espera y no recargues la página
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
