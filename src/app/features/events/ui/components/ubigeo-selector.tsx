'use client';

import React, { useState, useEffect } from 'react';
import {
  getDepartamentos,
  getProvincias,
  getDistritos,
  buildUbigeoCode,
  parseUbigeoCode,
  UbigeoOption,
} from '@/app/common/utils/ubigeo';

interface UbigeoSelectorProps {
  value: string;
  onChange: (ubigeoCode: string, readableLocation: string) => void;
}

export function UbigeoSelector({ value, onChange }: UbigeoSelectorProps) {
  const departamentos = getDepartamentos();

  const [selectedDep, setSelectedDep] = useState<string>('');
  const [selectedProv, setSelectedProv] = useState<string>('');
  const [selectedDist, setSelectedDist] = useState<string>('');

  const [provincias, setProvincias] = useState<UbigeoOption[]>([]);
  const [distritos, setDistritos] = useState<UbigeoOption[]>([]);

  // Sincronizar si viene un valor inicial (ej. 150101)
  useEffect(() => {
    if (value && value.length === 6) {
      const dep = value.substring(0, 2);
      const prov = value.substring(2, 4);
      const dist = value.substring(4, 6);

      setSelectedDep(dep);
      setProvincias(getProvincias(dep));
      setSelectedProv(prov);
      setDistritos(getDistritos(dep, prov));
      setSelectedDist(dist);
    } else if (!value && !selectedDep) {
      // Default a Lima (15) para conveniencia
      const defaultDep = '15';
      setSelectedDep(defaultDep);
      const provs = getProvincias(defaultDep);
      setProvincias(provs);
      const defaultProv = '01';
      setSelectedProv(defaultProv);
      const dists = getDistritos(defaultDep, defaultProv);
      setDistritos(dists);
    }
  }, [value]);

  const handleDepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depCode = e.target.value;
    setSelectedDep(depCode);
    setSelectedProv('');
    setSelectedDist('');
    setDistritos([]);

    const provs = getProvincias(depCode);
    setProvincias(provs);
    onChange('', '');
  };

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provCode = e.target.value;
    setSelectedProv(provCode);
    setSelectedDist('');

    const dists = getDistritos(selectedDep, provCode);
    setDistritos(dists);
    onChange('', '');
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distCode = e.target.value;
    setSelectedDist(distCode);

    if (distCode) {
      const fullCode = buildUbigeoCode(selectedDep, selectedProv, distCode);
      const { fullLabel } = parseUbigeoCode(fullCode);
      onChange(fullCode, fullLabel);
    } else {
      onChange('', '');
    }
  };

  const currentParsed = value ? parseUbigeoCode(value) : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Departamento */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-deep-slate block">
            Departamento *
          </label>
          <select
            value={selectedDep}
            onChange={handleDepChange}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-semibold text-deep-slate outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo"
          >
            <option value="">Selecciona...</option>
            {departamentos.map((d) => (
              <option key={`dep-${d.code}`} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Provincia */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-deep-slate block">
            Provincia *
          </label>
          <select
            value={selectedProv}
            onChange={handleProvChange}
            disabled={!selectedDep}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-semibold text-deep-slate outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo disabled:opacity-50"
          >
            <option value="">Selecciona...</option>
            {provincias.map((p) => (
              <option key={`prov-${p.code}`} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Distrito */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-deep-slate block">
            Distrito *
          </label>
          <select
            value={selectedDist}
            onChange={handleDistChange}
            disabled={!selectedProv}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/60 text-xs font-semibold text-deep-slate outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo disabled:opacity-50"
          >
            <option value="">Selecciona...</option>
            {distritos.map((dist) => (
              <option key={`dist-${dist.code}`} value={dist.code}>
                {dist.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentParsed?.fullLabel && (
        <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-indigo-50/80 border border-indigo-100 text-[11px] text-electric-indigo font-semibold">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span>
            Ubigeo INEI: <strong className="font-mono text-deep-slate">{value}</strong> ({currentParsed.fullLabel})
          </span>
        </div>
      )}
    </div>
  );
}

