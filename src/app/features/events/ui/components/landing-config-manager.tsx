'use client';

import React, { useState, useEffect } from 'react';
import ImageUploader from './image-uploader';
import { slugify } from '../../constants/eventConstants';

export interface LandingConfigData {
  header?: {
    title?: string;
    subtitle?: string;
    headerImageUrl?: string;
    ctaText?: string;
    videoTeaserUrl?: string;
  };
  body?: {
    aboutText?: string;
    bodyImageUrl?: string;
    highlight1?: string;
    highlight2?: string;
    highlight3?: string;
  };
  footer?: {
    footerImageUrl?: string;
    sponsorLogos?: string[];
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
  };
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    backgroundPatternUrl?: string;
    backgroundType?: 'color' | 'pattern' | 'fixed';
  };
}

export interface LandingConfigPreviewData {
  venue?: string;
  address?: string;
  city?: string;
  description?: string;
  ageRestriction?: string;
  termsAndConditionsUrl?: string;
  bannerUrl?: string;
  zoneMapUrl?: string;
  shows?: any[];
  zones?: any[];
  faqs?: Array<{ question: string; answer: string }>;
}

interface LandingConfigManagerProps {
  hasLanding: boolean;
  onToggleLanding: (active: boolean) => void;
  config: LandingConfigData;
  onChangeConfig: (newConfig: LandingConfigData) => void;
  slug: string;
  onChangeSlug: (slug: string) => void;
  eventTitle?: string;
  promoVideoUrl?: string;
  socialLinks?: {
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
  };
  eventPreviewData?: LandingConfigPreviewData;
  hideTopToggle?: boolean;
}

export function LandingConfigManager({
  hasLanding,
  onToggleLanding,
  config,
  onChangeConfig,
  slug,
  onChangeSlug,
  eventTitle = 'Título del Evento',
  promoVideoUrl,
  socialLinks,
  eventPreviewData,
  hideTopToggle = false,
}: LandingConfigManagerProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const updateSection = (
    section: 'header' | 'body' | 'footer' | 'theme',
    field: string,
    value: any
  ) => {
    onChangeConfig({
      ...config,
      [section]: {
        ...(config[section] || {}),
        [field]: value,
      },
    });
  };

  const ctaText = config.header?.ctaText || '¡Asegurar Mis Entradas!';
  const headerImg = config.header?.headerImageUrl;
  const bodyImg = config.body?.bodyImageUrl;
  const footerImg = config.footer?.footerImageUrl;
  const h1 = config.body?.highlight1?.trim() || '';
  const h2 = config.body?.highlight2?.trim() || '';
  const h3 = config.body?.highlight3?.trim() || '';
  const activeHighlights = [h1, h2, h3].filter(Boolean);

  const bgType = config.theme?.backgroundType || (config.theme?.backgroundPatternUrl ? 'pattern' : 'color');
  const bgColor = config.theme?.backgroundColor || '#0B0F19';
  const bgPattern = config.theme?.backgroundPatternUrl || '';

  const PRESET_BG_COLORS = [
    { label: 'Negro Carbón', hex: '#0B0F19' },
    { label: 'Azul Marino', hex: '#1E3A8A' },
    { label: 'Índigo Eléctrico', hex: '#3730A3' },
    { label: 'Púrpura Neón', hex: '#581C87' },
    { label: 'Borgoña / Vino', hex: '#7F1D1D' },
    { label: 'Verde Bosque', hex: '#064E3B' },
    { label: 'Gris Pizarra', hex: '#334155' },
  ];

  const buildPreviewPayload = () => {
    const finalSlug = slug || 'evento-temporal';
    return {
      id: 'temp-preview',
      publicUuid: 'temp-preview',
      slug: finalSlug,
      name: eventTitle || 'Título del Evento',
      category: 'CONCERTS',
      venue: eventPreviewData?.venue || 'Recinto Oficial',
      address: eventPreviewData?.address || 'Dirección Oficial',
      city: eventPreviewData?.city || 'Ciudad Oficial',
      hasLandingPage: true,
      bannerUrl: config.header?.headerImageUrl || eventPreviewData?.bannerUrl || null,
      zoneMapUrl: eventPreviewData?.zoneMapUrl || null,
      termsAndConditionsUrl: eventPreviewData?.termsAndConditionsUrl || null,
      ageRestriction: eventPreviewData?.ageRestriction || 'ALL_AGES',
      landingConfig: {
        theme: {
          primaryColor: config.theme?.primaryColor || '#6366F1',
          backgroundType: bgType,
          backgroundColor: bgColor,
          backgroundPatternUrl: bgPattern || null,
        },
        header: {
          title: config.header?.title || eventTitle,
          subtitle: config.header?.subtitle || '',
          ctaText: config.header?.ctaText || 'Comprar Entradas Oficiales',
          headerImageUrl: config.header?.headerImageUrl || eventPreviewData?.bannerUrl || null,
          videoTeaserUrl: promoVideoUrl || config.header?.videoTeaserUrl || null,
        },
        body: {
          aboutText: config.body?.aboutText || eventPreviewData?.description || null,
          bodyImageUrl: config.body?.bodyImageUrl || null,
          highlight1: h1 || null,
          highlight2: h2 || null,
          highlight3: h3 || null,
        },
        footer: {
          footerImageUrl: config.footer?.footerImageUrl || null,
          tiktokUrl: socialLinks?.tiktokUrl || config.footer?.tiktokUrl || null,
          facebookUrl: socialLinks?.facebookUrl || config.footer?.facebookUrl || null,
          instagramUrl: socialLinks?.instagramUrl || config.footer?.instagramUrl || null,
        },
      },
      shows: (eventPreviewData?.shows || []).map((s, idx) => ({
        id: String(idx + 1),
        publicUuid: `show-${idx + 1}`,
        name: s.name || 'Función Principal',
        startTime: s.startTime || new Date().toISOString(),
        durationHours: Number(s.durationHours) || 2,
      })),
      zones: (eventPreviewData?.zones || []).map((z, idx) => ({
        id: String(idx + 1),
        publicUuid: `zone-${idx + 1}`,
        name: z.name || `Zona ${idx + 1}`,
        title: z.title || null,
        color: z.color || '#3B82F6',
        benefits: z.benefits || null,
        regularPrice: Number(z.regularPrice) || 50,
        currentPrice: Number(z.regularPrice) || 50,
        activeTierName: 'Venta Regular',
        capacity: Number(z.capacity) || 100,
        remainingTickets: Number(z.capacity) || 100,
        isSoldOut: false,
      })),
      faqs: eventPreviewData?.faqs || [],
      isPreview: true,
    };
  };

  // Sincronización continua e instantánea en localStorage para evitar errores de 404 al previsualizar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = buildPreviewPayload();
      const finalSlug = slug || 'evento-temporal';
      localStorage.setItem(`qph_preview_${finalSlug}`, JSON.stringify(payload));
      localStorage.setItem('qph_preview_temp', JSON.stringify(payload));
    } catch {
      // noop
    }
  }, [
    slug,
    config,
    eventTitle,
    promoVideoUrl,
    socialLinks,
    eventPreviewData,
    bgType,
    bgColor,
    bgPattern,
    h1,
    h2,
    h3,
  ]);

  const handleOpenLivePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    const finalSlug = slug || 'evento-temporal';
    try {
      const payload = buildPreviewPayload();
      localStorage.setItem(`qph_preview_${finalSlug}`, JSON.stringify(payload));
      localStorage.setItem('qph_preview_temp', JSON.stringify(payload));
    } catch (err) {
      console.warn('No se pudo guardar la previsualización en localStorage', err);
    }
    window.open(`/e/${finalSlug}?previewTemp=true`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Si la landing está desactivada, mostrar aviso limpio sin switch duplicado (el switch oficial vive en la cabecera superior del paso 6) */}
      {!hasLanding && (
        <div className="p-8 text-center bg-surface-gray/50 rounded-2xl border border-dashed border-slate-300 space-y-3 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-electric-indigo/10 text-electric-indigo flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">web</span>
          </div>
          <h3 className="font-bold text-sm text-deep-slate">La Landing Page Dedicada está desactivada</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Activa el interruptor en la esquina superior derecha del encabezado para configurar la URL exclusiva, paleta de colores, banner y croquis de tu evento.
          </p>
          <button
            type="button"
            onClick={() => {
              onToggleLanding(true);
              if (!slug || slug.trim() === '') {
                const auto = slugify(eventTitle);
                if (auto) onChangeSlug(auto);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-indigo text-white text-xs font-bold shadow-md hover:bg-electric-indigo/90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">toggle_on</span>
            <span>Activar Landing Page Ahora</span>
          </button>
        </div>
      )}

      {hasLanding && (
        <div className="p-5 bg-white rounded-2xl border border-surface-variant/60 space-y-5 animate-in fade-in duration-200">
          {/* Barra de Navegación: Editor vs Vista Previa */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-surface-variant/40">
            <div className="flex items-center gap-1.5 p-1 bg-surface-gray rounded-xl border border-surface-variant/60">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white text-electric-indigo shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Editor de Secciones
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-electric-indigo shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Vista Previa en Vivo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenLivePreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric-indigo/10 hover:bg-electric-indigo/20 text-electric-indigo text-xs font-bold transition-all border border-electric-indigo/20 cursor-pointer shadow-2xs"
                title="Abrir vista previa en pestaña nueva"
              >
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                <span>Probar en vivo (?previewTemp)</span>
              </button>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sincronizado
              </span>
            </div>
          </div>

          {/* VISTA 1: EDITOR DE SECCIONES (COMPACTO) */}
          {activeTab === 'editor' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* SLUG: Input y Botón a la misma altura */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-deep-slate block">
                  Enlace Web Oficial (Slug del Landing)<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 h-11 flex items-center rounded-xl bg-surface-gray border border-surface-variant/60 px-3.5 shadow-xs focus-within:border-electric-indigo focus-within:ring-1 focus-within:ring-electric-indigo">
                    <span className="text-xs text-slate-400 font-mono shrink-0">queplaneshoy.com/e/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        const sanitized = e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/ñ/g, 'n')
                          .replace(/[^a-z0-9-]/g, '-')
                          .replace(/-+/g, '-');
                        onChangeSlug(sanitized);
                      }}
                      placeholder="mi-evento-especial-2026"
                      className="w-full bg-transparent text-xs font-mono font-bold text-deep-slate outline-none ml-1.5"
                    />
                  </div>

                  {eventTitle && eventTitle.trim() !== '' && eventTitle !== 'Título del Evento' && (
                    <button
                      type="button"
                      onClick={() => onChangeSlug(slugify(eventTitle))}
                      className="h-11 flex items-center justify-center gap-1.5 px-4 text-xs font-bold text-electric-indigo bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 shrink-0 cursor-pointer shadow-2xs"
                      title="Regenerar URL a partir del nombre del evento"
                    >
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                      <span>Sincronizar con título</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  URL exclusiva sin espacios ni caracteres especiales para tus campañas de marketing y redes sociales.
                </p>
              </div>

              {/* 1. SECCIÓN HEADER / CABECERA */}
              <div className="p-4 rounded-xl bg-surface-gray/50 border border-surface-variant/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-deep-slate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-electric-indigo text-[16px]">web</span>
                    1. Encabezado / Hero
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    1920x800 px (Hero)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <ImageUploader
                    compact={true}
                    aspectRatio="banner"
                    folder="landings"
                    value={headerImg || ''}
                    onChange={(val) => updateSection('header', 'headerImageUrl', val)}
                    helpText="Resolución óptima: 1920x800 px o 1920x1080 px (Admite PNG con transparencia)"
                  />

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0 mt-0.5">
                        videocam
                      </span>
                      <div>
                        <span className="font-bold text-deep-slate block">Video Promocional vinculado</span>
                        <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5">
                          {promoVideoUrl?.trim()
                            ? 'Se reproducirá automáticamente el video configurado en la fase Multimedia.'
                            : 'Puedes vincular un video teaser oficial en la fase Multimedia & Portada.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SECCIÓN BODY / CUERPO */}
              <div className="p-4 rounded-xl bg-surface-gray/50 border border-surface-variant/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-deep-slate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-electric-indigo text-[16px]">photo_library</span>
                    2. Cuerpo / Body
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    1920x800 px (Full-Width)
                  </span>
                </div>

                <div className="space-y-3">
                  <ImageUploader
                    compact={true}
                    aspectRatio="banner"
                    folder="landings"
                    value={bodyImg || ''}
                    onChange={(val) => updateSection('body', 'bodyImageUrl', val)}
                    helpText="Resolución óptima: 1920x800 px o 1400x600 px (Banner publicitario horizontal a pantalla completa)"
                  />

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      3 Atractivos Principales del Espectáculo (Horizontal):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Atractivo 1</span>
                        <input
                          type="text"
                          value={config.body?.highlight1 || ''}
                          onChange={(e) => updateSection('body', 'highlight1', e.target.value)}
                          placeholder="Ej: 3 Escenarios en simultáneo"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Atractivo 2</span>
                        <input
                          type="text"
                          value={config.body?.highlight2 || ''}
                          onChange={(e) => updateSection('body', 'highlight2', e.target.value)}
                          placeholder="Ej: Patio gastronómico gourmet"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Atractivo 3</span>
                        <input
                          type="text"
                          value={config.body?.highlight3 || ''}
                          onChange={(e) => updateSection('body', 'highlight3', e.target.value)}
                          placeholder="Ej: Seguridad privada 360°"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. SECCIÓN FOOTER / PIE DE PÁGINA */}
              <div className="p-4 rounded-xl bg-surface-gray/50 border border-surface-variant/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-deep-slate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-electric-indigo text-[16px]">vertical_align_bottom</span>
                    3. Pie de Página / Footer
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    1400x400 px (Footer)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <ImageUploader
                    compact={true}
                    aspectRatio="banner"
                    folder="landings"
                    value={footerImg || ''}
                    onChange={(val) => updateSection('footer', 'footerImageUrl', val)}
                    helpText="Resolución óptima: 1400x400 px (Banners de sponsors, logos o marcas aliadas)"
                  />

                  <div className="p-3.5 rounded-xl bg-white border border-surface-variant/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-deep-slate">
                      <span className="material-symbols-outlined text-electric-indigo text-[18px]">share</span>
                      <span>Redes Sociales Oficiales</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instagram, TikTok y Facebook ahora se configuran en la fase <strong>2. Multimedia &amp; Portada</strong> y se muestran automáticamente en el pie de página del landing.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(socialLinks?.instagramUrl || config.footer?.instagramUrl) && (
                        <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-200">
                          Instagram activo
                        </span>
                      )}
                      {(socialLinks?.tiktokUrl || config.footer?.tiktokUrl) && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200">
                          TikTok activo
                        </span>
                      )}
                      {(socialLinks?.facebookUrl || config.footer?.facebookUrl) && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          Facebook activo
                        </span>
                      )}
                      {!(
                        socialLinks?.instagramUrl ||
                        socialLinks?.tiktokUrl ||
                        socialLinks?.facebookUrl ||
                        config.footer?.instagramUrl ||
                        config.footer?.tiktokUrl ||
                        config.footer?.facebookUrl
                      ) && (
                        <span className="text-[10px] text-slate-400">Sin enlaces de redes registrados aún</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. SECCIÓN FONDO Y TEMA DE LA PÁGINA */}
              <div className="p-4 rounded-xl bg-surface-gray/50 border border-surface-variant/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-deep-slate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-electric-indigo text-[16px]">palette</span>
                    4. Fondo y Estilo Visual del Landing
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-surface-variant/60 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => updateSection('theme', 'backgroundType', 'color')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        bgType === 'color' ? 'bg-electric-indigo text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Color Sólido
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSection('theme', 'backgroundType', 'fixed')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        bgType === 'fixed' ? 'bg-electric-indigo text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Imagen Fija (Full Screen)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSection('theme', 'backgroundType', 'pattern')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        bgType === 'pattern' ? 'bg-electric-indigo text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Patrón Repetido (Tile)
                    </button>
                  </div>
                </div>

                {bgType === 'color' ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600">Paleta rápida:</span>
                      {PRESET_BG_COLORS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => updateSection('theme', 'backgroundColor', preset.hex)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                            bgColor === preset.hex
                              ? 'border-electric-indigo bg-indigo-50 text-electric-indigo ring-1 ring-electric-indigo'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-surface-variant/70 shadow-xs">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => updateSection('theme', 'backgroundColor', e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono font-bold text-deep-slate pr-2">{bgColor}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Color de fondo oscuro recomendado para resaltar las luces y colores de los shows.
                      </p>
                    </div>
                  </div>
                ) : bgType === 'fixed' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                    <ImageUploader
                      compact={true}
                      aspectRatio="banner"
                      folder="landings"
                      value={bgPattern}
                      onChange={(val) => updateSection('theme', 'backgroundPatternUrl', val)}
                      helpText="Resolución óptima: 1920x1080 px (Full HD). Imagen panorámica que permanecerá fija en el fondo al hacer scroll"
                    />

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-white border border-surface-variant/60">
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">
                          Vista previa de imagen fija (Cover):
                        </span>
                        <div
                          className="w-full h-24 rounded-lg border border-slate-200 shadow-inner bg-cover bg-center"
                          style={{
                            backgroundColor: bgColor,
                            backgroundImage: bgPattern ? `url(${bgPattern})` : undefined,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        La imagen se mantendrá inmóvil en el fondo ocupando el 100% de la ventana (<code className="font-mono text-electric-indigo">background-attachment: fixed; background-size: cover</code>), mientras el contenido se desliza por encima.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                    <ImageUploader
                      compact={true}
                      aspectRatio="square"
                      folder="landings"
                      value={bgPattern}
                      onChange={(val) => updateSection('theme', 'backgroundPatternUrl', val)}
                      helpText="Resolución óptima: 300x300 px a 600x600 px (Mosaico cuadrado con textura sutil que se repetirá en patrón)"
                    />

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-white border border-surface-variant/60">
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">
                          Vista previa del patrón repetido:
                        </span>
                        <div
                          className="w-full h-20 rounded-lg border border-slate-200 shadow-inner"
                          style={{
                            backgroundColor: bgColor,
                            backgroundImage: bgPattern ? `url(${bgPattern})` : undefined,
                            backgroundRepeat: 'repeat',
                            backgroundSize: '64px 64px',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        La textura se repetirá automáticamente (<code className="font-mono text-electric-indigo">background-repeat: repeat</code>) creando un fondo inmersivo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA 2: LIVE MINI-PREVIEW (MOCKUP INTERACTIVO) */}
          {activeTab === 'preview' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="ml-2 font-mono text-[11px] text-slate-300 truncate">
                    https://queplaneshoy.com/e/{slug || 'evento-2026'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenLivePreview}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-electric-indigo hover:bg-electric-indigo/80 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    title="Abrir en pestaña nueva con datos en tiempo real de este borrador"
                  >
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    <span>Probar en vivo (?previewTemp)</span>
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded hidden sm:inline-block">
                    {bgType === 'pattern' ? 'Patrón Tile' : `Fondo ${bgColor}`}
                  </span>
                </div>
              </div>

              {/* MOCKUP INTERACTIVO CON FONDO PERSONALIZADO */}
              <div
                className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl text-white font-sans transition-all text-left"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: bgPattern ? `url(${bgPattern})` : undefined,
                  backgroundSize: bgType === 'fixed' ? 'cover' : bgType === 'pattern' ? '64px 64px' : undefined,
                  backgroundPosition: 'center',
                  backgroundRepeat: bgType === 'pattern' ? 'repeat' : 'no-repeat',
                }}
              >
                {/* 0. MINI HEADER NAVBAR FLOTANTE */}
                <div className="h-10 px-3 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 font-black text-white">
                    <span className="w-4 h-4 rounded bg-electric-indigo flex items-center justify-center text-[9px] font-bold">Q</span>
                    <span>queplanes<span className="text-electric-indigo">hoy</span></span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-300 text-[9px]">
                    <span className="text-white">Inicio</span>
                    <span>Entradas</span>
                    <span>Legales</span>
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center" title="Compartir">
                      <span className="material-symbols-outlined text-[11px]">share</span>
                    </span>
                  </div>
                </div>

                {/* 1. HERO PREVIEW LIMPIO (Full-Width sin fondo negro forzado, permite transparencias PNG) */}
                <div className="relative aspect-[16/9] w-full bg-transparent flex items-center justify-center overflow-hidden">
                  {headerImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={headerImg}
                      alt="Header Preview"
                      className="w-full h-full object-contain object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center p-4 text-center">
                      <span className="material-symbols-outlined text-slate-500 text-3xl mb-1">image</span>
                      <span className="text-[11px] font-bold text-slate-400">
                        Banner Principal / Hero (1920x800 px)
                      </span>
                    </div>
                  )}

                  {/* Botón flotante para teaser si está configurado */}
                  {(promoVideoUrl?.trim() || config.header?.videoTeaserUrl?.trim()) && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 text-white text-[9px] font-bold backdrop-blur-md border border-white/20">
                      <span className="material-symbols-outlined text-[12px] text-amber-400">play_circle</span>
                      <span>Video Teaser</span>
                    </div>
                  )}
                </div>

                {/* 2. FRANJA FLOTANTE DE 4 MÉTRICAS Y DETALLE DEL SHOW UNIFICADOS */}
                <div className="relative z-10 px-2 -mt-3">
                  <div className="rounded-xl bg-zinc-900/95 border border-white/10 shadow-xl overflow-hidden divide-y divide-white/10">
                    <div className="p-2 grid grid-cols-4 gap-1 text-center">
                      <div className="p-1">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Fecha</span>
                        <span className="text-[9px] font-black text-white block truncate">Próximo Show</span>
                      </div>
                      <div className="p-1 border-l border-white/5">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Recinto</span>
                        <span className="text-[9px] font-black text-white block truncate">Local Oficial</span>
                      </div>
                      <div className="p-1 border-l border-white/5">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Acceso</span>
                        <span className="text-[9px] font-black text-emerald-400 block truncate">Público</span>
                      </div>
                      <div className="p-1 border-l border-white/5">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block truncate">Desde</span>
                        <span className="text-[9px] font-black text-electric-indigo block truncate">S/. 50.00</span>
                      </div>
                    </div>

                    {/* Detalle del show integrado abajo con el mismo ancho y color */}
                    {(config.body?.aboutText || eventPreviewData?.description) && (
                      <div className="p-2.5 space-y-1 text-white">
                        <span className="text-[8px] font-black uppercase tracking-wider text-electric-indigo block">
                          Detalles del Show
                        </span>
                        <p className="text-[9px] text-slate-300 leading-relaxed line-clamp-3">
                          {config.body?.aboutText || eventPreviewData?.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. BODY FULL-WIDTH PANORÁMICO Y ATRACTIVOS EN HORIZONTAL */}
                <div className="w-full mt-3 space-y-2">
                  {bodyImg ? (
                    <div className="w-full overflow-hidden shadow-lg border-y border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bodyImg} alt="Body Banner Full Width" className="w-full h-auto object-cover max-h-44" />
                    </div>
                  ) : (
                    <div className="mx-3 p-3 rounded-xl bg-zinc-900/60 border border-white/10 text-center">
                      <span className="text-[9px] text-slate-400 font-medium">Banner Publicitario del Body (Opcional)</span>
                    </div>
                  )}

                  {/* Atractivos en Horizontal (Solo si tienen valor cargado) */}
                  {activeHighlights.length > 0 && (
                    <div className="px-3">
                      <div
                        className={`grid gap-1.5 text-[9px] ${
                          activeHighlights.length === 1
                            ? 'grid-cols-1'
                            : activeHighlights.length === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        }`}
                      >
                        {activeHighlights.map((highlight, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 p-1.5 rounded-lg bg-zinc-950/90 border border-white/15 text-slate-200"
                          >
                            <span className="material-symbols-outlined text-electric-indigo text-[11px] shrink-0">
                              check_circle
                            </span>
                            <span className="font-semibold truncate">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. PLANO DEL ESCENARIO Y ZONAS (CUADRO NEGRO CON TEXTO BLANCO) */}
                <div className="p-3">
                  <div className="p-3 rounded-xl bg-zinc-950/95 border border-white/15 shadow-xl text-center space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-electric-indigo block">
                      Distribución Oficial
                    </span>
                    <h4 className="text-xs font-black uppercase text-white flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-electric-indigo">stadium</span>
                      <span>Plano del Escenario y Zonas</span>
                    </h4>
                    <div className="w-full h-20 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                      Plano Croquis Oficial del Recinto
                    </div>
                  </div>
                </div>

                {/* 5. SELECCIÓN DE ENTRADAS (CUADRO NEGRO CON TEXTO BLANCO) */}
                <div className="px-3 pb-3">
                  <div className="p-3 rounded-xl bg-zinc-950/95 border border-white/15 shadow-xl space-y-2.5">
                    <div className="text-center">
                      <span className="text-[8px] font-black uppercase tracking-widest text-electric-indigo block">
                        Venta Oficial en Línea
                      </span>
                      <h4 className="text-xs font-black uppercase text-white">Selecciona tu Entrada</h4>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-6 rounded-full bg-blue-500 shrink-0"></span>
                          <div>
                            <span className="font-bold text-white block">ZONA VIP</span>
                            <span className="text-[9px] text-slate-400">Acceso Preferencial</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-white block">S/. 120.00</span>
                          <span className="px-2 py-0.5 rounded bg-electric-indigo text-white font-bold text-[8px] uppercase inline-block">Comprar</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-zinc-900/90 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-6 rounded-full bg-emerald-500 shrink-0"></span>
                          <div>
                            <span className="font-bold text-white block">ZONA GENERAL</span>
                            <span className="text-[9px] text-slate-400">Ingreso Regular</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-white block">S/. 60.00</span>
                          <span className="px-2 py-0.5 rounded bg-electric-indigo text-white font-bold text-[8px] uppercase inline-block">Comprar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. TÉRMINOS, POLÍTICAS Y PREGUNTAS FRECUENTES (FAQs) */}
                <div className="p-3 bg-transparent">
                  <div className="p-3 rounded-xl bg-zinc-950/95 border border-white/15 shadow-xl space-y-2 text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[13px] text-electric-indigo">gavel</span>
                        <span className="text-[10px] font-black uppercase text-white">Términos y Normativa</span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-electric-indigo/20 text-electric-indigo font-bold">
                        Bases Oficiales
                      </span>
                    </div>

                    <div className="space-y-1 text-[9px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px] text-emerald-400">verified_user</span>
                        <span>Entradas Nominativas con código QR</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[11px] text-amber-400">info</span>
                        <span>Ingreso con DNI obligatorio en puerta</span>
                      </div>
                    </div>

                    {/* FAQs Preview */}
                    {(eventPreviewData?.faqs && eventPreviewData.faqs.length > 0) ? (
                      <div className="pt-1.5 border-t border-white/10 space-y-1">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">
                          Preguntas Frecuentes ({eventPreviewData.faqs.length})
                        </span>
                        {eventPreviewData.faqs.slice(0, 2).map((faq, fIdx) => (
                          <div key={fIdx} className="p-1 rounded bg-white/5 border border-white/5 text-[8px]">
                            <span className="font-bold text-slate-200 block truncate">Q: {faq.question}</span>
                            <span className="text-slate-400 block truncate">A: {faq.answer}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400">
                        <span>Preguntas Frecuentes (FAQs)</span>
                        <span className="text-electric-indigo font-bold">4 Preguntas Oficiales</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. FOOTER PREVIEW */}
                <div className="p-3 bg-black/90 border-t border-white/10 text-center space-y-2">
                  {footerImg && (
                    <div className="rounded-lg overflow-hidden border border-white/10 p-1 bg-black/40 mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={footerImg} alt="Footer Banner" className="w-full h-auto max-h-16 object-contain mx-auto" />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 text-slate-400 text-xs">
                    {(socialLinks?.instagramUrl || config.footer?.instagramUrl) && (
                      <span className="material-symbols-outlined text-[14px] text-pink-400">photo_camera</span>
                    )}
                    {(socialLinks?.facebookUrl || config.footer?.facebookUrl) && (
                      <span className="material-symbols-outlined text-[14px] text-blue-400">public</span>
                    )}
                    {(socialLinks?.tiktokUrl || config.footer?.tiktokUrl) && (
                      <span className="material-symbols-outlined text-[14px] text-white">music_video</span>
                    )}
                    <span className="text-[9px] font-mono text-slate-500">@queplaneshoy</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default LandingConfigManager;
