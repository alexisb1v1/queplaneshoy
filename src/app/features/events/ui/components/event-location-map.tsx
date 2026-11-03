"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface EventLocationMapProps {
  coordinates?: string | null;
  venue?: string | null;
  address?: string | null;
  addressReference?: string | null;
  city?: string;
  googleMapsUrl?: string | null;
}

// Fallback de coordenadas para principales ciudades peruanas
const CITY_FALLBACK_COORDINATES: Record<string, [number, number]> = {
  PUCALLPA: [-8.37914, -74.55387],
  CORONEL: [-8.37914, -74.55387],
  UCAYALI: [-8.37914, -74.55387],
  LIMA: [-12.046374, -77.042793],
  BARRANCO: [-12.14815, -77.02111],
  MIRAFLORES: [-12.12167, -77.02972],
  CUSCO: [-13.53195, -71.96746],
  AREQUIPA: [-16.40904, -71.53745],
  TRUJILLO: [-8.11599, -79.02998],
  CHICLAYO: [-6.77137, -79.84088],
  PIURA: [-5.19449, -80.63282],
  IQUITOS: [-3.74367, -73.25163],
  HUANCAYO: [-12.06513, -75.20486],
  TACNA: [-18.00657, -70.24627],
};

/**
 * Normaliza y extrae las coordenadas geográficas de forma infalible:
 * 1. Soporta separadores: comas, espacios, punto y coma, barras, etc.
 * 2. Soporta objetos JSON ("{ lat: -8.38, lng: -74.55 }").
 * 3. Auto-detecta si el orden es [lat, lng] o [lng, lat] (estándar GeoJSON/GIS)
 *    apoyado en los límites territoriales de Perú (Latitud: 0° a -19°, Longitud: -68° a -82°).
 * 4. Corrige automáticamente signos positivos accidentales.
 * 5. Extrae latitud y longitud directamente de URLs de Google Maps o Waze si estuvieran presentes.
 */
export function parseAndNormalizeCoordinates(
  rawCoordinates?: string | null,
  rawGoogleMapsUrl?: string | null,
  city = "LIMA"
): [number, number] {
  let val1: number | null = null;
  let val2: number | null = null;

  // Intento 1: Parsear el campo de coordenadas
  if (rawCoordinates && typeof rawCoordinates === "string" && rawCoordinates.trim().length > 0) {
    const trimmed = rawCoordinates.trim();

    // Caso A: Objeto JSON en string
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        const pLat = parseFloat(parsed.lat ?? parsed.latitude);
        const pLng = parseFloat(parsed.lng ?? parsed.lon ?? parsed.longitude);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          val1 = pLat;
          val2 = pLng;
        }
      } catch {}
    }

    // Caso B: Extraer números decimales con signo
    if (val1 === null || val2 === null) {
      const matches = trimmed.match(/-?\d+(?:\.\d+)?/g);
      if (matches && matches.length >= 2) {
        val1 = parseFloat(matches[0]);
        val2 = parseFloat(matches[1]);
      }
    }
  }

  // Intento 2: Si no hubo coordenadas, extraer de la URL de Google Maps
  if ((val1 === null || val2 === null) && rawGoogleMapsUrl) {
    // Patrones típicos de Google Maps: @-8.37914,-74.55387 o q=-8.37914,-74.55387
    const urlMatches = rawGoogleMapsUrl.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (urlMatches && urlMatches.length >= 3) {
      val1 = parseFloat(urlMatches[1]);
      val2 = parseFloat(urlMatches[2]);
    }
  }

  // Intento 3: Si se obtuvieron dos números, aplicar la regla de orientación geográfica
  if (val1 !== null && val2 !== null && !isNaN(val1) && !isNaN(val2)) {
    let lat = val1;
    let lng = val2;

    // DETECCIÓN DE INVERSIÓN (GeoJSON [lng, lat] vs Leaflet [lat, lng]):
    // En Perú:
    // - Longitud está entre -65° y -85° (magnitud ~68 a 82).
    // - Latitud está entre 0° y -20° (magnitud ~0 a 19).
    // Si val1 es la longitud (> 50 en magnitud) y val2 es la latitud (<= 25 en magnitud):
    if (Math.abs(val1) > 50 && Math.abs(val2) <= 25) {
      lat = val2;
      lng = val1;
    }

    // Asegurar signos negativos propios de Perú (Hemisferio Sur y Hemisferio Occidental)
    if (lat > 0 && lat <= 20) lat = -lat;
    if (lng > 0 && lng >= 60 && lng <= 85) lng = -lng;

    return [lat, lng];
  }

  // Intento 4: Fallback contextual por ciudad
  const normalizedCity = city.trim().toUpperCase();
  for (const [key, coords] of Object.entries(CITY_FALLBACK_COORDINATES)) {
    if (normalizedCity.includes(key)) {
      return coords;
    }
  }

  // Default: Pucallpa / Lima
  return [-8.37914, -74.55387];
}

export function EventLocationMap({
  coordinates,
  venue,
  address,
  addressReference,
  city = "LIMA",
  googleMapsUrl,
}: EventLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [lat, lng] = parseAndNormalizeCoordinates(coordinates, googleMapsUrl, city);

  const externalMapUrl =
    googleMapsUrl && googleMapsUrl.trim().length > 0
      ? googleMapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Limpiar instancia previa si existe
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // 1. Crear icono personalizado estilo QPH
      const pinIcon = L.divIcon({
        className: "qph-location-marker",
        html: `
          <div style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 38px;
              height: 38px;
              background: #4F46E5;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 8px 20px rgba(79, 70, 229, 0.45);
              border: 3px solid #ffffff;
            "></div>
            <span style="
              position: relative;
              z-index: 2;
              color: #ffffff;
              font-size: 18px;
              line-height: 1;
              transform: translateY(-2px);
            ">📍</span>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 38],
        popupAnchor: [0, -38],
      });

      // 2. Inicializar mapa centrado en las coordenadas exactas
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: false,
      });

      // Añadir control de zoom en la esquina superior derecha
      L.control.zoom({ position: "topright" }).addTo(map);

      // 3. TileLayer OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // 4. Marcador del recinto con Popup
      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);

      const venueName = venue || "Recinto Oficial";
      const fullAddress = address ? `${address}, ${city}` : city;

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #0F172A; padding: 4px;">
          <strong style="display: block; font-size: 13px; font-weight: 800; color: #1E293B; margin-bottom: 2px;">
            ${venueName}
          </strong>
          <span style="display: block; color: #64748B; font-size: 11px; margin-bottom: 6px;">
            ${fullAddress}
          </span>
          <span style="display: block; font-family: monospace; font-size: 10px; color: #94A3B8; margin-bottom: 6px;">
            Coord: ${lat.toFixed(6)}, ${lng.toFixed(6)}
          </span>
          <a href="${externalMapUrl}" target="_blank" rel="noopener noreferrer" style="color: #4F46E5; font-weight: 700; text-decoration: none;">
            Abrir en Google Maps &rarr;
          </a>
        </div>
      `);

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, venue, address, city, externalMapUrl]);

  return (
    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden relative border border-surface-variant shadow-sm bg-surface-gray isolate">
      {/* Contenedor del mapa Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Tarjeta flotante con detalles de la ubicación */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-surface-variant flex items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-center text-electric-indigo shrink-0">
              <span className="material-symbols-outlined text-[22px]">location_on</span>
            </div>
            <div className="min-w-0">
              <p className="qph-label-bold text-deep-slate font-extrabold text-xs sm:text-sm truncate">
                {venue || "Recinto Oficial"}
              </p>
              <p className="qph-body-md text-xs text-on-surface-variant truncate">
                {address ? `${address}, ${city}` : city}
              </p>
              {addressReference && (
                <p className="text-[10px] text-platinum-silver truncate mt-0.5">
                  Ref: {addressReference}
                </p>
              )}
              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold shrink-0 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <span>Ruta</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>
    </div>
  );
}
