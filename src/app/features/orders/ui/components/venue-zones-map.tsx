"use client";

import React, { useState } from "react";

export interface VenueZoneItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  colorHex: string;
  badge?: string;
}

interface VenueZonesMapProps {
  venueName?: string;
  zones: VenueZoneItem[];
  zoneMapImageUrl?: string | null;
  selectedZoneId?: string | null;
  onSelectZone?: (zoneId: string) => void;
  occupancyPercentage?: number;
}

export default function VenueZonesMap({
  venueName = "Recinto Oficial",
  zones = [],
  zoneMapImageUrl = null,
  selectedZoneId = null,
  onSelectZone,
  occupancyPercentage = 84,
}: VenueZonesMapProps) {
  const [activeTab, setActiveTab] = useState<"schematic" | "official">(
    zoneMapImageUrl ? "official" : "schematic"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ordenar zonas por precio ascendente para que las más exclusivas/cercanas queden frente al escenario
  const sortedZones = [...zones].sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-surface-variant shadow-sm transition-all">
      {/* =========================================================================
          ENCABEZADO: TÍTULO, SUBTÍTULO Y LEYENDA DINÁMICA DE ZONAS (STITCH STYLE)
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-surface-variant/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-deep-slate">
              Mapa de Zonas y Localidades
            </h3>
            {zoneMapImageUrl && (
              <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-variant text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("official")}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    activeTab === "official"
                      ? "bg-white text-electric-indigo shadow-xs"
                      : "text-on-surface-variant hover:text-deep-slate"
                  }`}
                >
                  Plano Oficial
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("schematic")}
                  className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                    activeTab === "schematic"
                      ? "bg-white text-electric-indigo shadow-xs"
                      : "text-on-surface-variant hover:text-deep-slate"
                  }`}
                >
                  Esquema 2D
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Haz referencia al mapa para ubicar tu área ideal en{" "}
            <span className="font-semibold text-deep-slate">{venueName}</span>.
          </p>
        </div>

        {/* Leyenda Dinámica de Zonas */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-on-surface-variant">
          {zones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onSelectZone?.(zone.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? "bg-electric-indigo/10 text-electric-indigo font-bold border border-electric-indigo/30"
                    : "hover:bg-surface-gray border border-transparent"
                }`}
                title={`Seleccionar ${zone.name}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0 shadow-xs"
                  style={{ backgroundColor: zone.colorHex }}
                />
                <span className="truncate max-w-[120px]">{zone.name}</span>
                {!zone.available && (
                  <span className="text-[10px] text-red-600 font-bold uppercase">
                    (Agotado)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CONTENEDOR CENTRAL DEL MAPA / DIAGRAMA SVG O IMAGEN
         ========================================================================= */}
      <div className="w-full bg-surface-gray rounded-xl p-3 sm:p-5 border border-surface-variant flex flex-col items-center justify-center">
        {/* Caso 1: Imagen Oficial del Croquis / Plano */}
        {activeTab === "official" && zoneMapImageUrl ? (
          <div className="w-full relative flex flex-col items-center justify-center py-2">
            <div className="relative group max-h-[380px] w-full flex items-center justify-center overflow-hidden rounded-xl bg-white border border-surface-variant shadow-sm">
              <img
                src={zoneMapImageUrl}
                alt={`Croquis de zonas de ${venueName}`}
                className="max-h-[360px] w-auto object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
                onClick={() => setIsModalOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-3 right-3 bg-deep-slate/85 hover:bg-deep-slate text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                <span>Ampliar plano</span>
              </button>
            </div>
          </div>
        ) : (
          /* Caso 2: Diagrama SVG Esquemático Interactivo Adaptativo */
          <div className="w-full max-w-xl aspect-[16/10] sm:aspect-[16/9] relative flex items-center justify-center py-1">
            <svg
              className="w-full h-full select-none"
              viewBox="0 0 500 280"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.08" />
                </filter>
              </defs>

              {/* Fondo del recinto */}
              <rect
                x="10"
                y="10"
                width="480"
                height="260"
                rx="20"
                fill="#F8FAFC"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />

              {/* RENDERIZADO DINÁMICO DE ZONAS EN CAPAS CONCÉNTRICAS HACIA EL ESCENARIO */}
              {sortedZones.length === 1 && (
                <g
                  className="cursor-pointer transition-all hover:opacity-90"
                  onClick={() => onSelectZone?.(sortedZones[0].id)}
                >
                  <rect
                    x="50"
                    y="35"
                    width="400"
                    height="145"
                    rx="14"
                    fill={sortedZones[0].colorHex}
                    fillOpacity="0.16"
                    stroke={sortedZones[0].colorHex}
                    strokeWidth="2.5"
                  />
                  <text
                    x="250"
                    y="100"
                    fill="#0F172A"
                    fontFamily="Inter, sans-serif"
                    fontSize="13"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {sortedZones[0].name.toUpperCase()} (S/.{" "}
                    {sortedZones[0].price.toFixed(2)})
                  </text>
                  <text
                    x="250"
                    y="122"
                    fill="#475569"
                    fontFamily="Inter, sans-serif"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {sortedZones[0].available ? "ZONA GENERAL DISPONIBLE" : "AGOTADO"}
                  </text>
                </g>
              )}

              {sortedZones.length === 2 && (
                <>
                  {/* Capa Externa: Zona General (menor precio) */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => onSelectZone?.(sortedZones[0].id)}
                  >
                    <rect
                      x="40"
                      y="30"
                      width="420"
                      height="150"
                      rx="16"
                      fill={sortedZones[0].colorHex}
                      fillOpacity="0.14"
                      stroke={sortedZones[0].colorHex}
                      strokeWidth="2"
                    />
                    <text
                      x="250"
                      y="52"
                      fill="#1E293B"
                      fontFamily="Inter, sans-serif"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {sortedZones[0].name.toUpperCase()} • S/.{" "}
                      {sortedZones[0].price.toFixed(2)}{" "}
                      {!sortedZones[0].available && "(AGOTADO)"}
                    </text>
                  </g>

                  {/* Capa Interna: Zona VIP / Preferencial (mayor precio) */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => onSelectZone?.(sortedZones[1].id)}
                  >
                    <rect
                      x="100"
                      y="75"
                      width="300"
                      height="100"
                      rx="12"
                      fill={sortedZones[1].colorHex}
                      fillOpacity="0.2"
                      stroke={sortedZones[1].colorHex}
                      strokeWidth="2.5"
                    />
                    <text
                      x="250"
                      y="118"
                      fill="#0F172A"
                      fontFamily="Inter, sans-serif"
                      fontSize="12"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      ★ {sortedZones[1].name.toUpperCase()} ★
                    </text>
                    <text
                      x="250"
                      y="138"
                      fill={sortedZones[1].colorHex}
                      fontFamily="Inter, sans-serif"
                      fontSize="10.5"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      Acceso Preferencial Front Stage (S/.{" "}
                      {sortedZones[1].price.toFixed(2)})
                    </text>
                  </g>
                </>
              )}

              {sortedZones.length >= 3 && (
                <>
                  {/* Capa 1: Grada Alta o Exterior (menor precio) */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => onSelectZone?.(sortedZones[0].id)}
                  >
                    <rect
                      x="30"
                      y="20"
                      width="440"
                      height="165"
                      rx="16"
                      fill={sortedZones[0].colorHex}
                      fillOpacity="0.14"
                      stroke={sortedZones[0].colorHex}
                      strokeWidth="2"
                      strokeDasharray={sortedZones[0].available ? "none" : "4 3"}
                    />
                    <text
                      x="250"
                      y="38"
                      fill="#334155"
                      fontFamily="Inter, sans-serif"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {sortedZones[0].name.toUpperCase()} (S/.{" "}
                      {sortedZones[0].price.toFixed(2)}){" "}
                      {!sortedZones[0].available && "- AGOTADO"}
                    </text>
                  </g>

                  {/* Capa 2: Grada Baja / General Intermedia */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() => onSelectZone?.(sortedZones[1].id)}
                  >
                    <rect
                      x="70"
                      y="50"
                      width="360"
                      height="130"
                      rx="14"
                      fill={sortedZones[1].colorHex}
                      fillOpacity="0.16"
                      stroke={sortedZones[1].colorHex}
                      strokeWidth="2"
                    />
                    <text
                      x="250"
                      y="68"
                      fill="#1E293B"
                      fontFamily="Inter, sans-serif"
                      fontSize="10.5"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {sortedZones[1].name.toUpperCase()} (S/.{" "}
                      {sortedZones[1].price.toFixed(2)})
                    </text>
                  </g>

                  {/* Capa 3: VIP / Front Stage (cercana al escenario) */}
                  <g
                    className="cursor-pointer transition-all hover:opacity-90"
                    onClick={() =>
                      onSelectZone?.(sortedZones[sortedZones.length - 1].id)
                    }
                  >
                    <rect
                      x="120"
                      y="85"
                      width="260"
                      height="90"
                      rx="10"
                      fill={sortedZones[sortedZones.length - 1].colorHex}
                      fillOpacity="0.22"
                      stroke={sortedZones[sortedZones.length - 1].colorHex}
                      strokeWidth="2.5"
                    />
                    <text
                      x="250"
                      y="124"
                      fill="#0F172A"
                      fontFamily="Inter, sans-serif"
                      fontSize="11.5"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      ★ {sortedZones[sortedZones.length - 1].name.toUpperCase()} ★
                    </text>
                    <text
                      x="250"
                      y="144"
                      fill={sortedZones[sortedZones.length - 1].colorHex}
                      fontFamily="Inter, sans-serif"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      Front Stage Preferencial (S/.{" "}
                      {sortedZones[sortedZones.length - 1].price.toFixed(2)})
                    </text>
                  </g>
                </>
              )}

              {/* ESCENARIO / STAGE (Fijo abajo alineado con Stitch) */}
              <rect
                x="170"
                y="195"
                width="160"
                height="28"
                rx="6"
                fill="#0F172A"
                filter="url(#shadow)"
              />
              <text
                x="250"
                y="213"
                fill="#FFFFFF"
                fontFamily="Inter, sans-serif"
                fontSize="11"
                fontWeight="800"
                letterSpacing="1.5"
                textAnchor="middle"
              >
                ESCENARIO / STAGE
              </text>

              {/* Indicadores laterales de sonido/acceso */}
              <text
                x="70"
                y="212"
                fill="#94A3B8"
                fontFamily="Inter, sans-serif"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
              >
                ◀ ACCESO SUR
              </text>
              <text
                x="430"
                y="212"
                fill="#94A3B8"
                fontFamily="Inter, sans-serif"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
              >
                ACCESO NORTE ▶
              </text>
            </svg>
          </div>
        )}

        {/* Barra Inferior Informativa de Aforo y Acústica */}
        <div className="mt-2.5 pt-2.5 border-t border-surface-variant/70 flex flex-wrap items-center justify-between w-full text-xs text-on-surface-variant px-1 gap-2">
          <span className="flex items-center gap-1 font-medium">
            <span className="text-amber-500">⚡</span>
            <span>Zona Acústica y Visual Optimizada</span>
          </span>
          <span className="text-electric-indigo font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-electric-indigo animate-pulse" />
            <span>Aforo en Vivo: {occupancyPercentage}% completo</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE ZOOM PARA PLANO OFICIAL
         ========================================================================= */}
      {isModalOpen && zoneMapImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant mb-3">
              <div>
                <h4 className="font-bold text-deep-slate text-base">
                  Plano Oficial del Recinto
                </h4>
                <p className="text-xs text-on-surface-variant">{venueName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-gray hover:bg-surface-variant flex items-center justify-center text-deep-slate font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto flex items-center justify-center">
              <img
                src={zoneMapImageUrl}
                alt={`Plano oficial de ${venueName}`}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

