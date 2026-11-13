'use client';

import React, { useState } from 'react';
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
    backgroundType?: 'color' | 'pattern';
  };
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
  const h1 = config.body?.highlight1 || '3 Escenarios y Zonas Exclusivas';
  const h2 = config.body?.highlight2 || 'Patio Gastronómico Gourmet';
  const h3 = config.body?.highlight3 || 'Seguridad y Accesos Preferenciales';

  const bgType = config.theme?.backgroundType || (config.theme?.backgroundPatternUrl ? 'pattern' : 'color');
  const bgColor = config.theme?.backgroundColor || '#0B0F19';
  const bgPattern = config.theme?.backgroundPatternUrl || '';

  const PRESET_BG_COLORS = [
    { label: 'Obsidiana', hex: '#0B0F19' },
    { label: 'Negro Puro', hex: '#000000' },
    { label: 'Azul Noche', hex: '#0F172A' },
    { label: 'Índigo Profundo', hex: '#1E1B4B' },
    { label: 'Púrpura Oscuro', hex: '#2E1065' },
    { label: 'Carbón', hex: '#18181B' },
  ];

  return (
    <div className="space-y-4">
      {/* Switch de activación */}
      <div className="p-4 bg-surface-gray rounded-2xl border border-surface-variant/60 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-deep-slate">
            Landing Page Dedicada para el Evento
          </h3>
          <p className="text-xs text-on-surface-variant">
            Activa una página de destino web exclusiva optimizada para conversión de anuncios y venta directa.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={hasLanding}
            onChange={(e) => {
              const active = e.target.checked;
              onToggleLanding(active);
              if (active && (!slug || slug.trim() === '')) {
                const auto = slugify(eventTitle);
                if (auto) {
                  onChangeSlug(auto);
                }
              }
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-indigo"></div>
        </label>
      </div>

      {hasLanding && (
        <div className="p-5 bg-white rounded-2xl border border-surface-variant/60 space-y-5 animate-in fade-in duration-200">
          {/* Barra de Navegación: Editor vs Vista Previa */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-surface-variant/40">
            <div className="flex items-center gap-1.5 p-1 bg-surface-gray rounded-xl border border-surface-variant/60">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Preview en Tiempo Real
              </span>
            </div>
          </div>

          {/* VISTA 1: EDITOR DE SECCIONES (COMPACTO) */}
          {activeTab === 'editor' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* SLUG */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-deep-slate block">
                    Enlace Web Oficial (Slug del Landing)<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  {eventTitle && eventTitle.trim() !== '' && eventTitle !== 'Título del Evento' && (
                    <button
                      type="button"
                      onClick={() => onChangeSlug(slugify(eventTitle))}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-electric-indigo bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                      title="Regenerar URL a partir del nombre del evento"
                    >
                      <span className="material-symbols-outlined text-[14px]">sync</span>
                      Sincronizar con título
                    </button>
                  )}
                </div>
                <div className="flex items-center rounded-xl bg-surface-gray border border-surface-variant/60 px-3 py-2 shadow-xs focus-within:border-electric-indigo focus-within:ring-1 focus-within:ring-electric-indigo">
                  <span className="text-xs text-slate-400 font-mono">queplaneshoy.com/e/</span>
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
                    className="w-full bg-transparent text-xs font-mono font-bold text-deep-slate outline-none ml-1"
                  />
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
                  <span className="text-[10px] font-semibold text-slate-400">1920x800 px</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <ImageUploader
                    compact={true}
                    aspectRatio="banner"
                    folder="landings"
                    value={headerImg || ''}
                    onChange={(val) => updateSection('header', 'headerImageUrl', val)}
                    helpText="Banner principal del landing"
                  />

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Texto del Botón CTA</label>
                      <input
                        type="text"
                        value={config.header?.ctaText || ''}
                        onChange={(e) => updateSection('header', 'ctaText', e.target.value)}
                        placeholder="Ej: Asegurar Mis Entradas VIP"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-2">
                      <span className="material-symbols-outlined text-electric-indigo text-[16px] shrink-0 mt-0.5">
                        videocam
                      </span>
                      <div>
                        <span className="font-bold text-deep-slate block">Video Promocional vinculado</span>
                        <span className="text-[10px] text-slate-500">
                          {promoVideoUrl?.trim()
                            ? 'Se usará el video configurado en la fase Multimedia & Portada.'
                            : 'Puedes añadir un video teaser en la fase Multimedia & Portada.'}
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
                  <span className="text-[10px] font-semibold text-slate-400">1400x600 px</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <ImageUploader
                    compact={true}
                    aspectRatio="banner"
                    folder="landings"
                    value={bodyImg || ''}
                    onChange={(val) => updateSection('body', 'bodyImageUrl', val)}
                    helpText="Banner promocional intermedio"
                  />

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Atractivo 1</label>
                      <input
                        type="text"
                        value={config.body?.highlight1 || ''}
                        onChange={(e) => updateSection('body', 'highlight1', e.target.value)}
                        placeholder="Ej: 3 Escenarios en simultáneo"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Atractivo 2</label>
                      <input
                        type="text"
                        value={config.body?.highlight2 || ''}
                        onChange={(e) => updateSection('body', 'highlight2', e.target.value)}
                        placeholder="Ej: Patio gastronómico gourmet"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Atractivo 3</label>
                      <input
                        type="text"
                        value={config.body?.highlight3 || ''}
                        onChange={(e) => updateSection('body', 'highlight3', e.target.value)}
                        placeholder="Ej: Seguridad privada 360°"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-surface-variant/70 text-xs text-deep-slate outline-none"
                      />
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
                  <span className="text-[10px] font-semibold text-slate-400">1400x400 px</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <ImageUploader
                    compact={true}
                    aspectRatio="banner"
                    folder="landings"
                    value={footerImg || ''}
                    onChange={(val) => updateSection('footer', 'footerImageUrl', val)}
                    helpText="Banner o sponsors inferiores"
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
                    <ImageUploader
                      compact={true}
                      aspectRatio="square"
                      folder="landings"
                      value={bgPattern}
                      onChange={(val) => updateSection('theme', 'backgroundPatternUrl', val)}
                      helpText="Sube una imagen pequeña o textura que se repetirá en mosaico"
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
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="ml-2 font-mono text-[11px] text-slate-300">
                    https://queplaneshoy.com/e/{slug || 'evento-2026'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {bgType === 'pattern' ? 'Patrón Tile' : `Fondo ${bgColor}`}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Simulación de Pantalla
                  </span>
                </div>
              </div>

              {/* MOCKUP INTERACTIVO CON FONDO PERSONALIZADO */}
              <div
                className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl text-white font-sans transition-all"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: bgType === 'pattern' && bgPattern ? `url(${bgPattern})` : undefined,
                  backgroundRepeat: 'repeat',
                }}
              >
                {/* 1. HERO PREVIEW */}
                <div className="relative aspect-[16/9] w-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  {headerImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={headerImg}
                      alt="Header Preview"
                      className="w-full h-full object-cover brightness-75"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                        Cartelera Oficial
                      </span>
                    </div>
                  )}

                  {/* Overlay con Titular y CTA */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-4 text-center">
                    <span className="inline-block self-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider border border-amber-500/40 mb-1">
                      Experiencia Exclusiva
                    </span>
                    <h2 className="font-black text-sm text-white drop-shadow-sm line-clamp-1">
                      {eventTitle}
                    </h2>
                    <button
                      type="button"
                      className="mt-2 self-center px-4 py-1.5 rounded-xl bg-electric-indigo text-white text-[11px] font-black uppercase tracking-wider shadow-md hover:scale-105 transition-transform"
                    >
                      {ctaText}
                    </button>
                  </div>
                </div>

                {/* 2. BODY PREVIEW */}
                <div className="p-4 space-y-3 bg-black/40 backdrop-blur-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 text-center">
                    Lo que te espera en este show
                  </h3>

                  {bodyImg && (
                    <div className="rounded-xl overflow-hidden aspect-[16/7] border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bodyImg} alt="Body Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-1.5 text-xs">
                    {[h1, h2, h3].map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-black/50 border border-white/10 text-[11px] text-slate-200"
                      >
                        <span className="material-symbols-outlined text-electric-indigo text-[14px]">
                          check_circle
                        </span>
                        <span className="font-medium line-clamp-1">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. FOOTER PREVIEW */}
                <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-xs text-center space-y-2.5">
                  {footerImg && (
                    <div className="rounded-lg overflow-hidden aspect-[16/5] border border-slate-800 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={footerImg} alt="Footer Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    {(socialLinks?.instagramUrl || config.footer?.instagramUrl) && (
                      <span className="material-symbols-outlined text-[16px] text-pink-400">photo_camera</span>
                    )}
                    {(socialLinks?.facebookUrl || config.footer?.facebookUrl) && (
                      <span className="material-symbols-outlined text-[16px] text-blue-400">public</span>
                    )}
                    {(socialLinks?.tiktokUrl || config.footer?.tiktokUrl) && (
                      <span className="material-symbols-outlined text-[16px] text-white">videocam</span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500">@queplaneshoy</span>
                  </div>

                  <p className="text-[9px] text-slate-500">
                    Boletería digital oficial con garantía de acceso criptográfico Ed25519.
                  </p>
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
