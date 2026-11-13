'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiClient } from '@/app/common/services/api-client';
import { ERROR_CODES } from '@/app/common/errors/error-codes';
import { getCurrentUserUseCase, resendVerificationUseCase } from '@/app/features/auth';
import {
  createEventUseCase,
  updateEventUseCase,
  getOrganizerEventForEditUseCase,
  publishEventUseCase,
} from '@/app/features/events';
import { UserModel } from '@/app/features/auth/models/user.model';
import { CreateEventParams } from '../dto/event.dto';
import {
  EVENT_CATEGORIES,
  AGE_RESTRICTIONS,
  getCategoryById,
  getAgeRestrictionById,
  slugify,
  calculateQphFee,
  QPH_FEE_RULES,
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

type StepId = 'datos' | 'multimedia' | 'funciones' | 'localidades' | 'landing' | 'cupones';

interface WizardStep {
  id: StepId;
  step: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  group: 'essential' | 'optional';
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'datos',
    step: 1,
    label: 'Ficha y Ubicación',
    shortLabel: 'Ficha',
    description: 'Nombre oficial, categoría, productora, ubigeo y normas.',
    icon: 'edit_note',
    group: 'essential',
  },
  {
    id: 'multimedia',
    step: 2,
    label: 'Multimedia & Portada',
    shortLabel: 'Multimedia',
    description: 'Banner principal, croquis del recinto y galería de fotos.',
    icon: 'photo_library',
    group: 'essential',
  },
  {
    id: 'funciones',
    step: 3,
    label: 'Fechas y Shows',
    shortLabel: 'Shows',
    description: 'Calendario de funciones, apertura de puertas y cierre.',
    icon: 'calendar_month',
    group: 'essential',
  },
  {
    id: 'localidades',
    step: 4,
    label: 'Zonas y Tarifas',
    shortLabel: 'Zonas',
    description: 'Aforos, precios en soles y etapas de preventa.',
    icon: 'confirmation_number',
    group: 'essential',
  },
  {
    id: 'landing',
    step: 5,
    label: 'Landing Dedicada',
    shortLabel: 'Landing',
    description: 'Minisitio promocional con colores propios y redes sociales.',
    icon: 'web',
    group: 'optional',
  },
  {
    id: 'cupones',
    step: 6,
    label: 'Cupones & FAQs',
    shortLabel: 'Cupones',
    description: 'Códigos promocionales y preguntas frecuentes.',
    icon: 'sell',
    group: 'optional',
  },
];

const SUGGESTED_TAGS = [
  'Música en Vivo',
  'Festival',
  'Pucallpa 2026',
  'VIP',
  'Feria Gastronómica',
  'Todo Público',
];

interface CreateEventScreenProps {
  initialEventId?: string;
}

export default function CreateEventScreen({ initialEventId }: CreateEventScreenProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  // Destino dinámico de regreso según el origen desde donde se abrió Crear Evento
  const [detectedOrigin, setDetectedOrigin] = useState<'events' | 'profile' | 'home'>(() => {
    if (fromParam === 'events') return 'events';
    if (fromParam === 'profile') return 'profile';
    return 'home';
  });

  useEffect(() => {
    if (fromParam === 'events') {
      setDetectedOrigin('events');
      return;
    }
    if (fromParam === 'profile') {
      setDetectedOrigin('profile');
      return;
    }
    if (fromParam === 'home') {
      setDetectedOrigin('home');
      return;
    }
    // Respaldo mediante document.referrer si se ingresó sin parámetro ?from=
    if (typeof document !== 'undefined' && document.referrer) {
      if (document.referrer.includes('/organizer')) {
        setDetectedOrigin('events');
      } else if (document.referrer.includes('/profile')) {
        setDetectedOrigin('profile');
      } else {
        setDetectedOrigin('home');
      }
    }
  }, [fromParam]);

  const backConfig = useMemo(() => {
    if (detectedOrigin === 'events') {
      return {
        href: '/organizer/events',
        label: 'Volver a Mis Eventos',
        shortLabel: 'Mis Eventos',
      };
    }
    if (detectedOrigin === 'profile') {
      return {
        href: '/profile',
        label: 'Volver a Mi Perfil',
        shortLabel: 'Mi Perfil',
      };
    }
    return {
      href: '/',
      label: 'Volver al Inicio',
      shortLabel: 'Inicio',
    };
  }, [detectedOrigin]);

  const authRedirectUrl = useMemo(() => {
    const suffix = fromParam ? `?from=${encodeURIComponent(fromParam)}` : '';
    return encodeURIComponent(`/organizer/events/new${suffix}`);
  }, [fromParam]);

  // Estados de Sesión y Modales
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(initialEventId || null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(initialEventId));
  const [hasLocalDraftSaved, setHasLocalDraftSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const isProcessing = isSaving || isPublishing;

  // Datos del Organizador / Productora (con modo compacto si ya existen datos completos)
  const [organizerName, setOrganizerName] = useState('');
  const [organizerDocumentType, setOrganizerDocumentType] = useState('RUC');
  const [organizerDocumentNumber, setOrganizerDocumentNumber] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState('');
  const [isEditingOrganizer, setIsEditingOrganizer] = useState(true);

  // Datos Principales
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EVENT_CATEGORIES[0].id);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [description, setDescription] = useState('');

  // Ubicación y Ubigeo
  const [ubigeoCode, setUbigeoCode] = useState('150101');
  const [readableLocation, setReadableLocation] = useState('Miraflores, Lima, Lima');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueNotes, setVenueNotes] = useState('');
  const [coordinates, setCoordinates] = useState('-12.046374, -77.042793');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Reglas de Acceso e Información Operativa
  const [ageRestriction, setAgeRestriction] = useState(AGE_RESTRICTIONS[0].id);
  const [userTicketLimit, setUserTicketLimit] = useState<number>(6);
  const [entryRequirements, setEntryRequirements] = useState('');
  const [openingHoursComment, setOpeningHoursComment] = useState('');
  const [termsAndConditionsUrl, setTermsAndConditionsUrl] = useState('');

  // Multimedia, Video y Redes Sociales
  const [mainBannerUrl, setMainBannerUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [zoneMapUrl, setZoneMapUrl] = useState('');
  const [promoVideoUrl, setPromoVideoUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');

  // Funciones, Zonas, Cupones y FAQs
  const [shows, setShows] = useState<ShowItem[]>([]);
  const [zones, setZones] = useState<ZoneConfigItem[]>([]);
  const [coupons, setCoupons] = useState<CouponFormItem[]>([]);
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

  // Navegación por Fases
  const [activeStep, setActiveStep] = useState<StepId>('datos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Manejo de Tags
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
        if (user.organizerPhone || user.phone) {
          setOrganizerPhone(user.organizerPhone || user.phone || '');
        }
        if (user.organizerLogoUrl) setOrganizerLogoUrl(user.organizerLogoUrl);

        // Si el promotor ya tiene datos legales completos, colapsar la sección para agilizar el formulario
        if (user.organizerName?.trim() && user.organizerDocumentNumber?.trim()) {
          setIsEditingOrganizer(false);
        }
      },
      () => {
        apiClient.clearToken();
        setCurrentUser(null);
      }
    );
  }, []);

  // Cargar borrador existente si se accede en modo edición
  useEffect(() => {
    if (!initialEventId) return;

    let isMounted = true;
    setIsLoadingDraft(true);

    getOrganizerEventForEditUseCase.execute(initialEventId).match(
      (data) => {
        if (!isMounted) return;
        setCreatedEventId(data.publicUuid || data.id);
        if (data.title) setTitle(data.title);
        if (data.category) setCategory(data.category);
        if (data.tags) setTags(data.tags);
        if (data.description) setDescription(data.description);
        if (data.ubigeoCode) setUbigeoCode(data.ubigeoCode);
        if (data.readableLocation) setReadableLocation(data.readableLocation);
        if (data.venue) setVenueName(data.venue);
        if (data.address) setVenueAddress(data.address);
        if (data.addressReference) setVenueNotes(data.addressReference);
        if (data.coordinates) setCoordinates(data.coordinates);
        if (data.googleMapsUrl) setGoogleMapsUrl(data.googleMapsUrl);
        if (data.ageRestriction) setAgeRestriction(data.ageRestriction);
        if (data.userTicketLimit) setUserTicketLimit(data.userTicketLimit);
        if (data.entryRequirements) setEntryRequirements(data.entryRequirements);
        if (data.openingHoursComment) setOpeningHoursComment(data.openingHoursComment);
        if (data.termsAndConditionsUrl) setTermsAndConditionsUrl(data.termsAndConditionsUrl);
        if (data.faqs && Array.isArray(data.faqs)) {
          setFaqs(
            data.faqs.map((f: any, idx: number) => ({
              id: f.id || `faq-${idx}-${Date.now()}`,
              question: f.question || '',
              answer: f.answer || '',
            }))
          );
        }
        if (data.bannerUrl) setMainBannerUrl(data.bannerUrl);
        if (data.zoneMapUrl) setZoneMapUrl(data.zoneMapUrl);
        if (data.galleryUrls && Array.isArray(data.galleryUrls)) setGalleryUrls(data.galleryUrls);
        if (data.promoVideoUrl) setPromoVideoUrl(data.promoVideoUrl);
        if (data.socialLinks?.instagramUrl) setInstagramUrl(data.socialLinks.instagramUrl);
        if (data.socialLinks?.facebookUrl) setFacebookUrl(data.socialLinks.facebookUrl);
        if (data.socialLinks?.tiktokUrl) setTiktokUrl(data.socialLinks.tiktokUrl);

        if (data.shows && Array.isArray(data.shows)) {
          setShows(
            data.shows.map((s: any, idx: number) => ({
              id: s.id || `show-${idx}`,
              name: s.name || '',
              startTime: s.startTime || '',
              salesEndAt: s.salesEndAt || '',
              durationHours: s.durationHours || 2,
            }))
          );
        }

        if (data.zones && Array.isArray(data.zones)) {
          setZones(
            data.zones.map((z: any, idx: number) => ({
              id: z.id || `zone-${idx}`,
              publicUuid: z.publicUuid,
              name: z.name || '',
              title: z.title || '',
              color: z.color || '#3B82F6',
              capacity: Number(z.capacity) || 0,
              regularPrice: Number(z.regularPrice) || 0,
              serviceFee: Number(z.serviceFee) || 0,
              feeIncluded: Boolean(z.feeIncluded),
              benefits: z.benefits || '',
              maxTicketsPerOrder: z.maxTicketsPerOrder || 4,
              salesStartAt: z.salesStartAt || '',
              tiers: (z.tiers || []).map((t: any, tIdx: number) => ({
                id: t.id || `tier-${tIdx}`,
                tierNumber: t.tierNumber || tIdx + 1,
                name: t.name || '',
                price: Number(t.price) || 0,
                capacity: Number(t.capacity) || 0,
                endAt: t.endAt || '',
              })),
            }))
          );
        }

        if (data.coupons && Array.isArray(data.coupons)) {
          setCoupons(
            data.coupons.map((c: any, idx: number) => ({
              id: c.id || `coupon-${idx}`,
              code: c.code || '',
              discountType: c.discountType || 'percentage',
              discountValue: Number(c.discountValue) || 0,
              usageType: c.usageType || 'single_use',
              maxUses: c.maxUses ? Number(c.maxUses) : undefined,
              expiresAt: c.expiresAt || '',
            }))
          );
        }

        if (data.hasLandingPage) {
          setHasDedicatedLanding(true);
          if (data.slug) setLandingSlug(data.slug);
          if (data.landingConfig) setLandingConfig(data.landingConfig);
        }

        if (data.organizerName) setOrganizerName(data.organizerName);
        if (data.organizerDocumentType) setOrganizerDocumentType(data.organizerDocumentType);
        if (data.organizerDocumentNumber) setOrganizerDocumentNumber(data.organizerDocumentNumber);
        if (data.organizerPhone) setOrganizerPhone(data.organizerPhone);
        if (data.organizerLogoUrl) setOrganizerLogoUrl(data.organizerLogoUrl);
        if (data.organizerName && data.organizerDocumentNumber) {
          setIsEditingOrganizer(false);
        }

        setIsLoadingDraft(false);
      },
      (err) => {
        if (!isMounted) return;
        setIsLoadingDraft(false);
        showToast(err.message || 'No se pudo cargar el evento para edición.');
      }
    );

    return () => {
      isMounted = false;
    };
  }, [initialEventId]);

  // Guardar borrador local si el usuario no ha iniciado sesión
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
      setHasLocalDraftSaved(true);
    } catch {
      // Ignorar errores de cuota en almacenamiento local
    }
  };

  // Reenviar confirmación de email
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

  // Cálculos dinámicos y estado de completitud por fase
  const totalCapacity = useMemo(
    () => zones.reduce((acc, z) => acc + Number(z.capacity || 0), 0),
    [zones]
  );

  const minZonePrice = useMemo(() => {
    if (zones.length === 0) return null;
    const prices = zones
      .map((z) => {
        const base = Number(z.regularPrice || 0);
        const fee = Number(z.serviceFee || 0);
        return z.feeIncluded ? base : base + fee;
      })
      .filter((p) => p >= 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [zones]);

  // Detector visual inteligente de plataforma de video promocional
  const videoSourceFeedback = useMemo(() => {
    const raw = promoVideoUrl.trim().toLowerCase();
    if (!raw) return null;
    if (raw.includes('youtube.com') || raw.includes('youtu.be')) {
      return {
        kind: 'ok' as const,
        label: 'YouTube detectado',
        detail: 'Compatible con reproducción embebida directa en escritorio y móvil.',
      };
    }
    if (raw.includes('vimeo.com')) {
      return {
        kind: 'ok' as const,
        label: 'Vimeo detectado',
        detail: 'Compatible con reproductor embebido en alta calidad.',
      };
    }
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(raw)) {
      return {
        kind: 'ok' as const,
        label: 'Video MP4/WebM directo',
        detail: 'Archivo directo compatible con reproductor nativo HTML5.',
      };
    }
    if (raw.includes('drive.google.com') || raw.includes('dropbox.com')) {
      return {
        kind: 'warn' as const,
        label: 'Origen no recomendado (Drive / Dropbox)',
        detail:
          'Google Drive y Dropbox bloquean la reproducción embebida o limitan descargas públicas. Te recomendamos subirlo a YouTube (puede ser Oculto / No listado) o Vimeo.',
      };
    }
    return {
      kind: 'info' as const,
      label: 'Enlace externo',
      detail: 'Asegúrate de usar un enlace de YouTube, Vimeo o una URL directa .mp4/.webm.',
    };
  }, [promoVideoUrl]);

  const stepCompletion = useMemo<Record<StepId, boolean>>(
    () => ({
      datos: Boolean(title.trim() && description.trim() && venueName.trim() && venueAddress.trim()),
      multimedia: Boolean(mainBannerUrl),
      funciones: shows.length > 0,
      localidades: zones.length > 0,
      landing: hasDedicatedLanding,
      cupones: coupons.length > 0 || faqs.length > 0,
    }),
    [title, description, venueName, venueAddress, mainBannerUrl, shows.length, zones.length, hasDedicatedLanding, coupons.length, faqs.length]
  );

  const essentialCompletedCount = useMemo(() => {
    const keys: StepId[] = ['datos', 'multimedia', 'funciones', 'localidades'];
    return keys.filter((k) => stepCompletion[k]).length;
  }, [stepCompletion]);

  const activeStepIndex = WIZARD_STEPS.findIndex((s) => s.id === activeStep);
  const currentStepObj = WIZARD_STEPS[activeStepIndex] || WIZARD_STEPS[0];
  const prevStepObj = activeStepIndex > 0 ? WIZARD_STEPS[activeStepIndex - 1] : null;
  const nextStepObj = activeStepIndex < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[activeStepIndex + 1] : null;

  const goToStep = (stepId: StepId) => {
    setActiveStep(stepId);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Armar Payload Consolidado
  const buildEventPayload = (): CreateEventParams => {
    const primaryZone = zones[0] || { regularPrice: 0, capacity: 0 };
    const primaryShow = shows[0] || { startTime: new Date().toISOString() };
    const finalSlug =
      hasDedicatedLanding && landingSlug.trim()
        ? landingSlug.trim()
        : title.trim()
        ? slugify(title.trim())
        : undefined;

    return {
      title: title.trim(),
      slug: finalSlug,
      description: description.trim() || undefined,
      category,
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
      promoVideoUrl: promoVideoUrl.trim() || undefined,
      socialLinks:
        instagramUrl.trim() || facebookUrl.trim() || tiktokUrl.trim()
          ? {
              instagramUrl: instagramUrl.trim() || undefined,
              facebookUrl: facebookUrl.trim() || undefined,
              tiktokUrl: tiktokUrl.trim() || undefined,
            }
          : undefined,
      hasLandingPage: hasDedicatedLanding,
      landingConfig: hasDedicatedLanding
        ? {
            ...landingConfig,
            slug: landingSlug,
            header: {
              ...(landingConfig.header || {}),
              videoTeaserUrl: promoVideoUrl.trim() || landingConfig.header?.videoTeaserUrl || '',
            },
            footer: {
              ...(landingConfig.footer || {}),
              instagramUrl: instagramUrl.trim() || landingConfig.footer?.instagramUrl || '',
              facebookUrl: facebookUrl.trim() || landingConfig.footer?.facebookUrl || '',
              tiktokUrl: tiktokUrl.trim() || landingConfig.footer?.tiktokUrl || '',
            },
          }
        : undefined,
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
        feeIncluded: Boolean(z.feeIncluded),
        benefits: z.benefits,
        maxTicketsPerOrder: Math.min(z.maxTicketsPerOrder || 4, userTicketLimit),
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

  // Guardar Borrador
  const handleSaveDraft = async () => {
    if (isProcessing) return;

    if (!title.trim()) {
      goToStep('datos');
      showToast('Ingresa al menos el título oficial del evento para guardar el borrador.');
      setTimeout(() => document.getElementById('event-title')?.focus(), 100);
      return;
    }

    if (!apiClient.getToken()) {
      saveLocalDraft();
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    const payload = buildEventPayload();
    const targetId = createdEventId || initialEventId;
    const result = targetId
      ? await updateEventUseCase.execute(targetId, payload)
      : await createEventUseCase.execute(payload);
    setIsSaving(false);

    result.match(
      (saved) => {
        setCreatedEventId(saved.publicUuid || saved.id);
        setHasLocalDraftSaved(false);
        showToast(
          targetId
            ? '¡Cambios del borrador actualizados exitosamente!'
            : '¡Borrador guardado exitosamente en la base de datos!'
        );
      },
      (err) => {
        showToast(err.message || 'Error al guardar borrador del evento.');
      }
    );
  };

  // Publicar Evento (valida campos y abre el modal de Aprobación y Liquidación Oficial)
  const handlePublish = async () => {
    if (isProcessing) return;

    if (!title.trim()) {
      goToStep('datos');
      showToast('El título del evento es obligatorio para enviar a revisión.');
      setTimeout(() => document.getElementById('event-title')?.focus(), 100);
      return;
    }

    if (!mainBannerUrl) {
      goToStep('multimedia');
      showToast('Debes subir el Banner Principal del evento en la fase Multimedia & Portada.');
      return;
    }

    if (shows.length === 0) {
      goToStep('funciones');
      showToast('Debes programar al menos una función o fecha en la fase Fechas y Shows.');
      return;
    }

    if (zones.length === 0) {
      goToStep('localidades');
      showToast('Debes configurar al menos una zona con aforo y precio en la fase Zonas y Tarifas.');
      return;
    }

    if (!apiClient.getToken()) {
      saveLocalDraft();
      setShowAuthModal(true);
      return;
    }

    if (!currentUser?.emailVerifiedAt) {
      if (!createdEventId) {
        await handleSaveDraft();
      }
      setShowVerifyModal(true);
      return;
    }

    // Abre el modal oficial de aprobación de liquidación y envío a revisión
    setShowApprovalModal(true);
  };

  // Confirmación formal de envío a revisión tras aprobar la liquidación
  const executePublish = async () => {
    setShowApprovalModal(false);
    setIsPublishing(true);
    try {
      let targetEventId = createdEventId || initialEventId;
      const payload = buildEventPayload();
      if (!targetEventId) {
        const saveRes = await createEventUseCase.execute(payload);
        if (saveRes.isErr()) {
          setIsPublishing(false);
          showToast(saveRes.error.message || 'Error al guardar el evento antes de enviar a revisión.');
          return;
        }
        targetEventId = saveRes.value.publicUuid || saveRes.value.id;
        setCreatedEventId(targetEventId);
      } else {
        const updateRes = await updateEventUseCase.execute(targetEventId, payload);
        if (updateRes.isErr()) {
          setIsPublishing(false);
          showToast(updateRes.error.message || 'Error al sincronizar cambios antes de enviar a revisión.');
          return;
        }
      }

      const publishRes = await publishEventUseCase.execute(targetEventId);
      publishRes.match(
        () => {
          showToast('¡Evento enviado a revisión exitosamente! El equipo revisará los detalles.');
          setTimeout(() => {
            router.push(detectedOrigin === 'events' ? '/organizer/events' : '/');
          }, 1400);
        },
        (err) => {
          setIsPublishing(false);
          if (err.code === ERROR_CODES.FORBIDDEN.code || err.message.toLowerCase().includes('verificar')) {
            setShowVerifyModal(true);
          } else {
            showToast(err.message || 'No se pudo enviar el evento a revisión.');
          }
        }
      );
    } catch (err: unknown) {
      setIsPublishing(false);
      const message = err instanceof Error ? err.message : 'Error inesperado al enviar el evento a revisión.';
      showToast(message);
    }
  };

  const draftBadge = createdEventId
    ? { text: 'Borrador guardado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : hasLocalDraftSaved
    ? { text: 'Borrador local', cls: 'bg-indigo-50 text-electric-indigo border-indigo-200' }
    : { text: 'Borrador sin publicar', cls: 'bg-amber-50 text-amber-700 border-amber-200' };

  const essentialSteps = WIZARD_STEPS.filter((s) => s.group === 'essential');
  const optionalSteps = WIZARD_STEPS.filter((s) => s.group === 'optional');

  const getStepSublabel = (stepId: StepId) => {
    switch (stepId) {
      case 'datos':
        return title.trim() ? title.trim() : 'Pendiente de completar';
      case 'multimedia':
        return mainBannerUrl
          ? `Banner listo • ${galleryUrls.length}/4 fotos`
          : 'Sin banner principal';
      case 'funciones':
        return shows.length > 0 ? `${shows.length} función(es) programada(s)` : 'Sin fechas configuradas';
      case 'localidades':
        return zones.length > 0
          ? `${zones.length} zona(s) • ${totalCapacity.toLocaleString()} tks`
          : 'Sin zonas ni precios';
      case 'landing':
        return hasDedicatedLanding ? `Activa (/e/${landingSlug || 'slug'})` : 'Opcional • Desactivada';
      case 'cupones':
        return coupons.length > 0 || faqs.length > 0
          ? `${coupons.length} cupón(es) • ${faqs.length} FAQ(s)`
          : 'Opcional • Sin registros';
    }
  };

  if (isLoadingDraft) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <span className="w-9 h-9 border-3 border-electric-indigo border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm font-bold text-deep-slate">
          Cargando datos del evento para edición...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50/70 text-deep-slate">
      {/* Toast Flotante */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          <span className="material-symbols-outlined text-electric-indigo text-[20px] shrink-0">
            info
          </span>
          <span className="text-xs sm:text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* =====================================================================
          HEADER DEDICADO FULL-WIDTH
         ===================================================================== */}
      <header className="sticky top-0 z-40 h-16 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Izquierda: Regreso Dinámico + Marca + Título + Badge */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link
              href={backConfig.href}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-deep-slate transition-all shrink-0 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="hidden md:inline">{backConfig.label}</span>
              <span className="md:hidden">{backConfig.shortLabel}</span>
            </Link>

            <div className="hidden sm:block h-6 w-px bg-slate-200 shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="hidden sm:flex w-8 h-8 rounded-lg bg-electric-indigo text-white items-center justify-center font-black text-xs tracking-tight shrink-0 shadow-xs">
                QPH
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black text-deep-slate tracking-tight truncate">
                    {initialEventId ? 'Editar Borrador del Evento' : 'Crear Nuevo Evento'}
                  </h1>
                  <span
                    className={`hidden xl:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${draftBadge.cls}`}
                  >
                    {draftBadge.text}
                  </span>
                </div>
                {title.trim() && (
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[220px] sm:max-w-[320px]">
                    {title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Derecha: Acciones Principales en una Sola Línea */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold shadow-sm shadow-electric-indigo/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
              <span className="sm:hidden">{isSaving ? '...' : 'Borrador'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          STEPPER MÓVIL COMPACTO (< lg)
         ===================================================================== */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 px-4 py-3 sticky top-16 z-30">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-electric-indigo text-white font-black text-xs flex items-center justify-center shrink-0">
              {currentStepObj.step}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-electric-indigo">
                  Paso {currentStepObj.step} de {WIZARD_STEPS.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  ({essentialCompletedCount}/4 esenciales)
                </span>
              </div>
              <p className="text-sm font-bold text-deep-slate truncate">{currentStepObj.label}</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-500 transition-transform">
            {mobileMenuOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {/* Barra de progreso mini */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2.5">
          <div
            className="h-full bg-electric-indigo rounded-full transition-all duration-300"
            style={{ width: `${Math.max(8, (essentialCompletedCount / 4) * 100)}%` }}
          />
        </div>

        {/* Lista desplegable móvil */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
            {WIZARD_STEPS.map((item) => {
              const isActive = activeStep === item.id;
              const isDone = stepCompletion[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToStep(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-indigo-50 border-electric-indigo text-electric-indigo'
                      : 'bg-slate-50/70 border-slate-200/70 text-deep-slate'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-black w-5 text-center">{item.step}.</span>
                    <span className="text-xs font-bold truncate">{item.label}</span>
                  </div>
                  {isDone && (
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================================
          BANNER CORREO NO VERIFICADO (SI APLICA)
         ===================================================================== */}
      {currentUser && !currentUser.emailVerifiedAt && (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0">
                mark_email_unread
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Tu correo aún no está verificado ({currentUser.email})
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  Puedes diseñar y guardar tu borrador libremente. Para publicarlo y abrir la venta de entradas, confirma tu cuenta.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={isResending}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isResending ? 'Enviando...' : 'Reenviar Correo'}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          CONTENIDO PRINCIPAL FULL-WIDTH (SIDEBAR FASES + FASE ACTIVA)
         ===================================================================== */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-5 xl:gap-6 items-start">
          {/* COLUMNA IZQUIERDA STICKY (DELGADA): STEPPER DE FASES + RESUMEN */}
          <aside className="hidden lg:block w-[248px] xl:w-[264px] shrink-0 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
              {/* Progreso Esencial */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Progreso Esencial
                  </span>
                  <span className="text-xs font-black text-electric-indigo">
                    {essentialCompletedCount} / 4
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-electric-indigo rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(6, (essentialCompletedCount / 4) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Grupo 1: Pasos Esenciales */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Esenciales (Para Vender)
                </p>
                <div className="space-y-1">
                  {essentialSteps.map((item) => {
                    const isActive = activeStep === item.id;
                    const isDone = stepCompletion[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goToStep(item.id)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50/90 border-electric-indigo shadow-2xs'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200/70'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isActive
                              ? 'bg-electric-indigo text-white'
                              : isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isDone && !isActive ? (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          ) : (
                            item.step
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-bold block truncate ${
                              isActive ? 'text-electric-indigo' : 'text-deep-slate'
                            }`}
                          >
                            {item.label}
                          </span>
                          <p className="text-[10px] text-slate-500 truncate">
                            {getStepSublabel(item.id)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grupo 2: Configuración Adicional */}
              <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  Adicional (Opcional)
                </p>
                <div className="space-y-1">
                  {optionalSteps.map((item) => {
                    const isActive = activeStep === item.id;
                    const isDone = stepCompletion[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => goToStep(item.id)}
                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-50/90 border-electric-indigo shadow-2xs'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200/70'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isActive
                              ? 'bg-electric-indigo text-white'
                              : isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isDone && !isActive ? (
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          ) : (
                            item.step
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-bold block truncate ${
                              isActive ? 'text-electric-indigo' : 'text-deep-slate'
                            }`}
                          >
                            {item.label}
                          </span>
                          <p className="text-[10px] text-slate-500 truncate">
                            {getStepSublabel(item.id)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tarjeta Resumen de Ficha en Vivo */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-deep-slate flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-electric-indigo text-[17px]">
                    summarize
                  </span>
                  Resumen
                </span>
                <span className="text-[10px] font-bold text-electric-indigo bg-indigo-50 px-2 py-0.5 rounded-full">
                  En vivo
                </span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Productora</span>
                  <span className="font-bold text-deep-slate truncate max-w-[125px]">
                    {organizerName || 'Sin asignar'}
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ubigeo</span>
                  <span className="font-bold text-deep-slate font-mono">{ubigeoCode}</span>
                </div>
                <div className="flex justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-500">Aforo Total</span>
                  <span className="font-extrabold text-electric-indigo">
                    {totalCapacity.toLocaleString()} tks
                  </span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span className="text-slate-500">Tope/Cliente</span>
                  <span className="font-bold text-deep-slate">{userTicketLimit} entradas</span>
                </div>
              </div>
            </div>

            {/* Soporte Prioritario */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Soporte Promotores
                </p>
                <p className="text-xs font-bold text-electric-indigo truncate mt-0.5">
                  promotores@qph.com
                </p>
              </div>
              <span className="material-symbols-outlined text-electric-indigo text-[20px] shrink-0">
                support_agent
              </span>
            </div>
          </aside>

          {/* COLUMNA PRINCIPAL: UNA SOLA FASE ACTIVA A LA VEZ */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Cabecera de la Fase Activa */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">
                    {currentStepObj.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-electric-indigo">
                      Fase {currentStepObj.step} de {WIZARD_STEPS.length}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentStepObj.group === 'essential'
                          ? 'bg-indigo-50 text-electric-indigo'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {currentStepObj.group === 'essential' ? 'Obligatorio' : 'Opcional'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-deep-slate tracking-tight">
                    {currentStepObj.label}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{currentStepObj.description}</p>
                </div>
              </div>
            </div>

            {/* ===============================================================
                FASE 1: FICHA CANÓNICA Y UBICACIÓN
               =============================================================== */}
            {activeStep === 'datos' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Bloque A: Información Principal */}
                <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                      stadium
                    </span>
                    <h3 className="font-bold text-sm text-deep-slate">Información Principal</h3>
                  </div>

                  {/* Título */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-deep-slate" htmlFor="event-title">
                        Nombre Oficial del Evento<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <span className="text-slate-400 font-medium">{title.length} / 100</span>
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
                      <label className="font-bold text-xs text-deep-slate">
                        Categoría Principal<span className="text-red-500 ml-0.5">*</span>
                      </label>
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
                      <label className="font-bold text-xs text-deep-slate">
                        Restricción de Edad<span className="text-red-500 ml-0.5">*</span>
                      </label>
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

                  {/* Descripción limpia (ubicada antes de Etiquetas) */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-deep-slate">
                      Descripción Completa del Evento<span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-4 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs sm:text-sm text-deep-slate outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo leading-relaxed"
                      placeholder="Describe la experiencia del espectáculo, cartelera de artistas invitados, atracciones, horarios de acceso y recomendaciones..."
                    />
                  </div>

                  {/* Etiquetas / Tags */}
                  <div className="space-y-2.5 p-4 rounded-xl bg-surface-gray/50 border border-surface-variant/60">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-xs text-deep-slate flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-electric-indigo text-[16px]">
                          label
                        </span>
                        Etiquetas de Búsqueda (Tags)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {tags.length} etiqueta{tags.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                          #
                        </span>
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={handleKeyDownTag}
                          placeholder="Escribe una etiqueta y presiona Enter o coma (ej: Salsa, VIP)..."
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

                    {tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-electric-indigo text-xs font-bold shadow-xs"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-200/60 text-indigo-700 transition-colors cursor-pointer"
                              title={`Eliminar #${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                      <span className="text-slate-400 font-medium">Sugerencias:</span>
                      {SUGGESTED_TAGS.map((sug) => {
                        const isAlreadyAdded = tags.some(
                          (t) => t.toLowerCase() === sug.toLowerCase()
                        );
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
                </section>

                {/* Bloque B: Datos de la Productora (Tarjeta compacta expandible si ya existen datos) */}
                <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                        badge
                      </span>
                      <h3 className="font-bold text-sm text-deep-slate">
                        Datos de la Productora / Organizador
                      </h3>
                    </div>

                    {organizerName.trim() && organizerDocumentNumber.trim() && (
                      <button
                        type="button"
                        onClick={() => setIsEditingOrganizer((prev) => !prev)}
                        className="text-xs font-bold text-electric-indigo hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isEditingOrganizer ? 'expand_less' : 'edit'}
                        </span>
                        <span>
                          {isEditingOrganizer ? 'Ocultar edición' : 'Editar datos de productora'}
                        </span>
                      </button>
                    )}
                  </div>

                  {!isEditingOrganizer && organizerName.trim() && organizerDocumentNumber.trim() ? (
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {organizerLogoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={organizerLogoUrl}
                            alt={organizerName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-white"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-electric-indigo flex items-center justify-center font-black text-sm">
                            {organizerName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-deep-slate">{organizerName}</p>
                          <p className="text-xs text-slate-500">
                            {organizerDocumentType}: <strong className="font-mono">{organizerDocumentNumber}</strong>
                            {organizerPhone ? ` • ${organizerPhone}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-center">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Perfil sincronizado
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">
                        Información legal y comercial que respaldará las entradas y comprobantes de este evento.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-xs text-deep-slate">
                            Razón Social o Nombre Comercial<span className="text-red-500 ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            value={organizerName}
                            onChange={(e) => setOrganizerName(e.target.value)}
                            placeholder="Ej: Selva Central Producciones SAC"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1 col-span-1">
                            <label className="font-bold text-xs text-deep-slate">
                              Doc.<span className="text-red-500 ml-0.5">*</span>
                            </label>
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
                            <label className="font-bold text-xs text-deep-slate">
                              Número<span className="text-red-500 ml-0.5">*</span>
                            </label>
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
                          <label className="font-bold text-xs text-deep-slate">
                            Teléfono o WhatsApp Comercial
                          </label>
                          <input
                            type="tel"
                            value={organizerPhone}
                            onChange={(e) => setOrganizerPhone(e.target.value)}
                            placeholder="+51 987 654 321"
                            className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-xs text-deep-slate">
                            Logotipo de la Productora (Opcional)
                          </label>
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
                  )}
                </section>

                {/* Bloque C: Ubicación y Geolocalización */}
                <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                      explore
                    </span>
                    <h3 className="font-bold text-sm text-deep-slate">
                      Ubicación y Geolocalización (Perú)
                    </h3>
                  </div>

                  <UbigeoSelector
                    value={ubigeoCode}
                    onChange={(code, label) => {
                      setUbigeoCode(code);
                      setReadableLocation(label);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        Nombre del Recinto / Local<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="Ej: Explanada Ferial Yarinacocha, Arena 1..."
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        Dirección Exacta<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        placeholder="Ej: Av. Javier Prado Este 456..."
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        Referencia de Llegada
                      </label>
                      <input
                        type="text"
                        value={venueNotes}
                        onChange={(e) => setVenueNotes(e.target.value)}
                        placeholder="Ej: Frente al malecón turístico, puerta 4..."
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        URL Google Maps / Waze
                      </label>
                      <input
                        type="url"
                        value={googleMapsUrl}
                        onChange={(e) => setGoogleMapsUrl(e.target.value)}
                        placeholder="https://maps.google.com/?q=-12.046374,-77.042793"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                  </div>

                  <InteractiveMapPicker
                    value={coordinates}
                    onChange={(coords) => setCoordinates(coords)}
                  />
                </section>

                {/* Bloque D: Normas, Salvaguardas y Legal */}
                <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                      policy
                    </span>
                    <h3 className="font-bold text-sm text-deep-slate">
                      Normas, Salvaguardas y Legal
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        Límite de Entradas por Usuario (Todo el Evento)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={userTicketLimit}
                        onChange={(e) =>
                          setUserTicketLimit(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-bold text-deep-slate outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[11px] text-slate-500">
                        Total acumulado por comprador en todo el evento.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        URL de Términos y Condiciones (PDF Oficial)
                      </label>
                      <input
                        type="url"
                        value={termsAndConditionsUrl}
                        onChange={(e) => setTermsAndConditionsUrl(e.target.value)}
                        placeholder="https://cdn.queplaneshoy.com/legal/terminos.pdf"
                        className="w-full px-4 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        Requisitos de Entrada al Recinto
                      </label>
                      <textarea
                        rows={3}
                        value={entryRequirements}
                        onChange={(e) => setEntryRequirements(e.target.value)}
                        placeholder="Ej: DNI físico obligatorio para todos los asistentes..."
                        className="w-full p-3 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate">
                        Comentarios de Horarios de Apertura
                      </label>
                      <textarea
                        rows={3}
                        value={openingHoursComment}
                        onChange={(e) => setOpeningHoursComment(e.target.value)}
                        placeholder="Ej: Apertura de puertas 18:00 hrs. Llegar con anticipación..."
                        className="w-full p-3 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ===============================================================
                FASE 2: MULTIMEDIA & PORTADA
               =============================================================== */}
            {activeStep === 'multimedia' && (
              <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Banner Principal */}
                  <div className="bg-surface-gray p-5 rounded-2xl border border-surface-variant/60 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-deep-slate">
                          Banner Principal<span className="text-red-500 ml-0.5">*</span>
                        </span>
                        <span className="text-[11px] font-bold text-electric-indigo bg-white px-2 py-0.5 rounded-md shadow-xs">
                          1920x800 px
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">
                        Cabecera oficial en la cartelera y ficha de compra.
                      </p>
                    </div>
                    <ImageUploader
                      aspectRatio="banner"
                      folder="banners"
                      value={mainBannerUrl}
                      onChange={setMainBannerUrl}
                      helpText="Arrastra o haz clic para subir el banner principal"
                    />
                  </div>

                  {/* Croquis de Zonas */}
                  <div className="bg-surface-gray p-5 rounded-2xl border border-surface-variant/60 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-deep-slate">Croquis de Zonas</span>
                        <span className="text-[11px] font-bold text-vip-gold bg-white px-2 py-0.5 rounded-md shadow-xs">
                          Plano Recinto
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">
                        Plano visual que orienta al asistente para elegir ubicación.
                      </p>
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

                {/* Galería de Fotos (Máximo 4) */}
                <div className="bg-surface-gray p-5 sm:p-6 rounded-2xl border border-surface-variant/60 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                          photo_library
                        </span>
                        <h3 className="font-bold text-sm text-deep-slate">
                          Galería de Fotos Oficiales
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                            galleryUrls.length >= 4
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-indigo-50 text-electric-indigo border border-indigo-100'
                          }`}
                        >
                          {galleryUrls.length}/4 fotos {galleryUrls.length >= 4 ? '(Límite)' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Fotos de ambientación, artistas y escenario (máximo 4 imágenes).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((slotIndex) => {
                      const currentImg = galleryUrls[slotIndex];
                      const isNextAvailableSlot =
                        slotIndex === galleryUrls.length && galleryUrls.length < 4;

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
                                onClick={() => {
                                  const urlToDelete = galleryUrls[slotIndex];
                                  if (urlToDelete) {
                                    apiClient
                                      .delete('/media', { params: { url: urlToDelete } })
                                      .catch((delErr) =>
                                        console.warn('[CreateEvent] Error al purgar foto de galería en R2:', delErr)
                                      );
                                  }
                                  setGalleryUrls(galleryUrls.filter((_, idx) => idx !== slotIndex));
                                }}
                                className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1 shadow cursor-pointer"
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
                          <span className="material-symbols-outlined text-[28px] opacity-40">
                            image
                          </span>
                          <span className="text-[11px] font-semibold mt-1">
                            Slot {slotIndex + 1} libre
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Video Promocional y Redes Sociales Oficiales */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Video Promocional / Teaser */}
                  <div className="bg-surface-gray p-5 sm:p-6 rounded-2xl border border-surface-variant/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                          play_circle
                        </span>
                        <h3 className="font-bold text-sm text-deep-slate">
                          Video Promocional / Teaser (Opcional)
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        YouTube / Vimeo / MP4
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-xs text-deep-slate block">
                        URL del Video Oficial
                      </label>
                      <input
                        type="url"
                        value={promoVideoUrl}
                        onChange={(e) => setPromoVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>

                    {videoSourceFeedback ? (
                      <div
                        className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                          videoSourceFeedback.kind === 'ok'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : videoSourceFeedback.kind === 'warn'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                          {videoSourceFeedback.kind === 'ok'
                            ? 'check_circle'
                            : videoSourceFeedback.kind === 'warn'
                            ? 'warning'
                            : 'info'}
                        </span>
                        <div>
                          <strong className="block">{videoSourceFeedback.label}</strong>
                          <span className="opacity-90">{videoSourceFeedback.detail}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Pega un enlace de <strong>YouTube</strong> (puede estar en modo <em>Oculto / No listado</em>), <strong>Vimeo</strong> o archivo directo <strong>.mp4</strong>. Evita Google Drive o Dropbox porque bloquean la reproducción embebida para el público.
                      </p>
                    )}
                  </div>

                  {/* Redes Sociales del Evento */}
                  <div className="bg-surface-gray p-5 sm:p-6 rounded-2xl border border-surface-variant/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-indigo text-[20px]">
                          share
                        </span>
                        <h3 className="font-bold text-sm text-deep-slate">
                          Redes Sociales Oficiales (Opcional)
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-electric-indigo bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                        Evento &amp; Landing
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-deep-slate block">
                          Instagram Oficial
                        </label>
                        <input
                          type="url"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          placeholder="https://instagram.com/tu_evento"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-deep-slate block">
                          TikTok Oficial
                        </label>
                        <input
                          type="url"
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          placeholder="https://tiktok.com/@tu_evento"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-deep-slate block">
                          Facebook Oficial
                        </label>
                        <input
                          type="url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/tu_evento"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ===============================================================
                FASE 3: FECHAS Y SHOWS
               =============================================================== */}
            {activeStep === 'funciones' && (
              <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <ShowsManager
                  shows={shows}
                  onChange={(updated) => setShows(updated)}
                  totalCapacity={totalCapacity}
                />
              </section>
            )}

            {/* ===============================================================
                FASE 4: ZONAS Y TARIFAS
               =============================================================== */}
            {activeStep === 'localidades' && (
              <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <ZonesManager
                  zones={zones}
                  onChange={(updated) => setZones(updated)}
                  eventTicketLimit={userTicketLimit}
                />
              </section>
            )}

            {/* ===============================================================
                FASE 5: LANDING DEDICADA
               =============================================================== */}
            {activeStep === 'landing' && (
              <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs animate-in fade-in duration-200">
                <LandingConfigManager
                  hasLanding={hasDedicatedLanding}
                  onToggleLanding={handleToggleLanding}
                  config={landingConfig}
                  onChangeConfig={(newCfg) => setLandingConfig(newCfg)}
                  slug={landingSlug}
                  onChangeSlug={(s) => setLandingSlug(s)}
                  eventTitle={title}
                  promoVideoUrl={promoVideoUrl}
                  socialLinks={{
                    instagramUrl,
                    facebookUrl,
                    tiktokUrl,
                  }}
                />
              </section>
            )}

            {/* ===============================================================
                FASE 6: CUPONES & FAQS
               =============================================================== */}
            {activeStep === 'cupones' && (
              <section className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-8 animate-in fade-in duration-200">
                <CouponsManager coupons={coupons} onChange={(updated) => setCoupons(updated)} />

                <div className="pt-6 border-t border-slate-100">
                  <FaqsManager faqs={faqs} onChange={(updated) => setFaqs(updated)} />
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* =====================================================================
          BARRA STICKY INFERIOR DE NAVEGACIÓN ENTRE FASES
         ===================================================================== */}
      <footer className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          {/* Izquierda: Anterior + Indicador */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!prevStepObj}
              onClick={() => prevStepObj && goToStep(prevStepObj.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[17px]">arrow_back</span>
              <span>{prevStepObj ? `Anterior: ${prevStepObj.shortLabel}` : 'Inicio'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span>Aforo Total:</span>
              <span className="font-extrabold text-electric-indigo bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {totalCapacity.toLocaleString()} tickets
              </span>
            </div>
          </div>

          {/* Derecha: Guardar Borrador + Siguiente o Publicar */}
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isProcessing}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{isSaving ? 'Guardando...' : 'Guardar Borrador'}</span>
            </button>

            {nextStepObj ? (
              <button
                type="button"
                onClick={() => goToStep(nextStepObj.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold shadow-md shadow-electric-indigo/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>
                  Continuar a {nextStepObj.step}. {nextStepObj.label}
                </span>
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{isPublishing ? 'Enviando...' : 'Enviar para revisión'}</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* =====================================================================
          MODAL DE VISTA PREVIA RÁPIDA EN MEMORIA
         ===================================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Banner Preview */}
            <div className="relative h-52 sm:h-64 bg-slate-900 overflow-hidden">
              {mainBannerUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainBannerUrl}
                  alt={title || 'Vista previa del evento'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <span className="material-symbols-outlined text-4xl">image</span>
                  <span className="text-xs font-semibold">
                    Aún no has subido el Banner Principal
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Cerrar vista previa"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 text-deep-slate text-xs font-bold shadow-sm">
                  {getCategoryById(category).icon} {getCategoryById(category).label}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-bold">
                  {getAgeRestrictionById(ageRestriction).icon}{' '}
                  {getAgeRestrictionById(ageRestriction).label}
                </span>
              </div>
            </div>

            {/* Detalle Preview */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-electric-indigo">
                  Vista Previa de Ficha Pública
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-deep-slate mt-1">
                  {title.trim() || 'Título de tu Evento'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Organiza: <strong className="text-deep-slate">{organizerName || 'Productora por definir'}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Ubicación
                  </span>
                  <p className="text-xs font-bold text-deep-slate mt-0.5 truncate">
                    {venueName.trim() || 'Recinto por definir'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{readableLocation}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Funciones
                  </span>
                  <p className="text-xs font-bold text-deep-slate mt-0.5">
                    {shows.length > 0
                      ? `${shows.length} fecha(s) programada(s)`
                      : 'Sin funciones aún'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {shows[0]?.name || 'Agrega fechas en Paso 3'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70">
                  <span className="text-[10px] font-bold uppercase text-electric-indigo block">
                    Desde
                  </span>
                  <p className="text-base font-black text-electric-indigo mt-0.5">
                    {minZonePrice !== null ? `S/. ${minZonePrice.toFixed(2)}` : 'Sin tarifas'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {totalCapacity.toLocaleString()} tickets totales
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-deep-slate uppercase tracking-wider">
                  Descripción
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {description.trim() || 'Aún no has redactado la descripción de tu evento.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Seguir Editando
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    handlePublish();
                  }}
                  className="px-5 py-2 rounded-xl bg-electric-indigo text-white text-xs font-bold hover:bg-primary cursor-pointer"
                >
                  Enviar para revisión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ETAPA DE APROBACIÓN Y PUBLICACIÓN (Liquidación Oficial)
         ===================================================================== */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-surface-variant flex flex-col max-h-[90vh]">
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-surface-variant/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">verified</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-electric-indigo">
                      Etapa de Aprobación
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Liquidación Oficial
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-deep-slate tracking-tight">
                    Resumen Financiero y Envío a Revisión
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-deep-slate transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Tarjeta de Escala Oficial de QuePlanesHoy */}
              <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4 space-y-2">
                <div className="flex items-center gap-2 text-electric-indigo font-bold text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">policy</span>
                  <span>Escala Oficial de Tarifas QuePlanesHoy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/70">
                    <span className="text-[11px] text-slate-500 block">{QPH_FEE_RULES.TIER_1.label}</span>
                    <strong className="text-deep-slate font-extrabold">S/ {QPH_FEE_RULES.TIER_1.value.toFixed(2)} / entrada</strong>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/70">
                    <span className="text-[11px] text-slate-500 block">{QPH_FEE_RULES.TIER_2.label}</span>
                    <strong className="text-deep-slate font-extrabold">S/ {QPH_FEE_RULES.TIER_2.value.toFixed(2)} / entrada</strong>
                  </div>
                  <div className="bg-white/80 rounded-xl p-2.5 border border-indigo-100/70">
                    <span className="text-[11px] text-slate-500 block">{QPH_FEE_RULES.TIER_3.label}</span>
                    <strong className="text-deep-slate font-extrabold">{QPH_FEE_RULES.TIER_3.value * 100}% del precio</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  * Esta escala se aplica de forma automática tanto a precios regulares como a preventas para calcular la Tarifa Final y la liquidación.
                </p>
              </div>

              {/* Tabla de Zonas y Liquidación Estimada */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-deep-slate uppercase tracking-wider">
                    Desglose por Localidad Configurada ({zones.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Moneda oficial: <strong>Soles (PEN)</strong>
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-surface-variant/70">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-surface-variant/70 text-slate-500 text-[11px] uppercase font-bold">
                        <th className="py-2.5 px-3">Sector</th>
                        <th className="py-2.5 px-3 text-right">Aforo</th>
                        <th className="py-2.5 px-3 text-right">Precio Base</th>
                        <th className="py-2.5 px-3 text-center">Modalidad</th>
                        <th className="py-2.5 px-3 text-right">Comisión QPH</th>
                        <th className="py-2.5 px-3 text-right">Neto Promotor</th>
                        <th className="py-2.5 px-3 text-right">Tarifa Final</th>
                        <th className="py-2.5 px-3 text-right">Neto Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/40">
                      {zones.map((zone) => {
                        const price = Number(zone.regularPrice) || 0;
                        const fee = calculateQphFee(price);
                        const isInc = Boolean(zone.feeIncluded);
                        const netUnit = isInc ? Math.max(0, price - fee) : price;
                        const buyerUnit = isInc ? price : price + fee;
                        const cap = Number(zone.capacity) || 0;
                        const totalNetZone = cap * netUnit;

                        return (
                          <tr key={zone.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: zone.color || '#F59E0B' }}
                                />
                                <div>
                                  <strong className="text-deep-slate font-bold block">
                                    {zone.name}
                                  </strong>
                                  {zone.title && (
                                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                                      {zone.title}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                              {cap.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                              S/ {price.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isInc
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-indigo-50 text-electric-indigo'
                                }`}
                              >
                                {isInc ? 'Incluida' : 'Sumada'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                              S/ {fee.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">
                              S/ {netUnit.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-electric-indigo">
                              S/ {buyerUnit.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-black text-deep-slate">
                              S/ {totalNetZone.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales consolidados */}
              {(() => {
                const totalCap = zones.reduce((acc, z) => acc + (Number(z.capacity) || 0), 0);
                const totalNet = zones.reduce((acc, z) => {
                  const price = Number(z.regularPrice) || 0;
                  const fee = calculateQphFee(price);
                  const isInc = Boolean(z.feeIncluded);
                  const netUnit = isInc ? Math.max(0, price - fee) : price;
                  return acc + (Number(z.capacity) || 0) * netUnit;
                }, 0);
                const totalFees = zones.reduce((acc, z) => {
                  const price = Number(z.regularPrice) || 0;
                  const fee = calculateQphFee(price);
                  return acc + (Number(z.capacity) || 0) * fee;
                }, 0);

                return (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                        Aforo Total a la Venta
                      </span>
                      <strong className="text-base text-deep-slate font-black">
                        {totalCap.toLocaleString()} entradas
                      </strong>
                      <span className="text-[11px] text-slate-400 block">
                        Comisiones QPH proyectadas: S/ {totalFees.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-center sm:text-right bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200/70">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Recaudación Neta Proyectada Promotor
                      </span>
                      <strong className="text-xl sm:text-2xl text-emerald-700 font-black tracking-tight">
                        S/ {totalNet.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Pie con Acciones */}
            <div className="pt-4 border-t border-surface-variant/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  goToStep('localidades');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer"
              >
                Modificar Zonas o Precios
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={executePublish}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{isPublishing ? 'Enviando...' : 'Aprobar Liquidación y Enviar a Revisión'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: IDENTIFICACIÓN PARA GUARDAR / PUBLICAR (Lazy Auth)
         ===================================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant space-y-5 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-electric-indigo rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">account_circle</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-deep-slate tracking-tight mb-2">
                ¡Tu evento está listo para guardarse!
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Hemos asegurado los datos de tu evento localmente. Inicia sesión o regístrate para asociarlo a tu cuenta de organizador.
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/login?redirect=${authRedirectUrl}`}
                className="w-full qph-btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Iniciar Sesión</span>
              </Link>
              <Link
                href={`/register?redirect=${authRedirectUrl}`}
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

      {/* =====================================================================
          MODAL PLAN B: AVISO AL INTENTAR PUBLICAR SIN CORREO VERIFICADO
         ===================================================================== */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-surface-variant space-y-5 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-deep-slate tracking-tight mb-2">
                ¡Tu evento está guardado como borrador!
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Para ponerlo a la venta al público y activar las entradas, confirma el enlace que enviamos a tu correo:
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

      {/* =====================================================================
          OVERLAY DE CARGA DE PANTALLA COMPLETA
         ===================================================================== */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 border border-surface-variant">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[36px] animate-spin">
                progress_activity
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-deep-slate tracking-tight">
                {isPublishing
                  ? 'Publicando evento en cartelera...'
                  : 'Guardando borrador del evento...'}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isPublishing
                  ? 'Validando localidades, aforos y credenciales para abrir la venta al público.'
                  : 'Sincronizando la información de forma segura en la base de datos.'}
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Por favor espera y no recargues la página
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
