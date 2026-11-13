'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapPickerProps {
  value: string; // "latitud, longitud" (ej: "-12.046374, -77.042793")
  onChange: (coordinates: string) => void;
}

export function InteractiveMapPicker({ value, onChange }: InteractiveMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [inputVal, setInputVal] = useState<string>(value || '-12.046374, -77.042793');
  const [isLocating, setIsLocating] = useState(false);

  // Parsear lat y lng
  const parseCoords = (coordStr: string): [number, number] => {
    const parts = coordStr.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    // Default Lima Centro
    return [-12.046374, -77.042793];
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Carga dinámica de Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Si ya hay una instancia previa, destruirla antes de reiniciar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const [initialLat, initialLng] = parseCoords(value || inputVal);

      // Icono de Pin Personalizado (sin depender de assets externos)
      const customPinIcon = L.divIcon({
        className: 'custom-qph-map-pin',
        html: `
          <div style="
            background: #6366f1;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            border: 2px solid #ffffff;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); color: #ffffff; font-size: 14px; line-height: 1;">📍</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      // Evento: Al arrastrar el pin
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const formatted = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
        setInputVal(formatted);
        onChange(formatted);
      });

      // Evento: Al hacer clic en cualquier lugar del mapa
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setInputVal(formatted);
        onChange(formatted);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      setTimeout(() => {
        if (isMounted) map.invalidateSize();
      }, 150);
    });

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      observer = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      observer.observe(mapContainerRef.current);
    }

    return () => {
      isMounted = false;
      if (observer) {
        observer.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sincronizar mapa cuando cambia el valor desde fuera
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    const [lat, lng] = parseCoords(val);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 15);
    }
    onChange(val);
  };

  // Geolocalización GPS del Navegador
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const formatted = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setInputVal(formatted);
        onChange(formatted);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
      },
      () => {
        setIsLocating(false);
        alert('No se pudo obtener tu ubicación actual.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-deep-slate block">
            Coordenadas GPS (Latitud, Longitud)<span className="text-red-500 ml-0.5">*</span>
          </label>
          <p className="text-[11px] text-slate-500">
            Se utiliza para mostrar la ubicación exacta del evento en el mapa interactivo de la ficha pública.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              placeholder="-12.046374, -77.042793"
              className="w-full px-3 py-2 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-mono font-bold text-deep-slate outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo"
            />
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLocating}
              title="Detectar mi ubicación actual"
              className="px-3 py-2 rounded-xl bg-surface-gray hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer border border-surface-variant/60"
            >
              <span className="material-symbols-outlined text-[16px] text-electric-indigo">my_location</span>
              <span className="hidden sm:inline">{isLocating ? 'Detectando...' : 'Mi GPS'}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-on-surface-variant">
        Haz clic en el mapa o arrastra el marcador para fijar la ubicación exacta del recinto.
      </p>

      {/* Contenedor del Mapa Leaflet */}
      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-2xl overflow-hidden border border-surface-variant/60 shadow-xs z-10"
        style={{ minHeight: '220px' }}
      />
    </div>
  );
}

