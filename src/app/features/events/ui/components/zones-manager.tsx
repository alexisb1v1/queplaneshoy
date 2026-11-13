'use client';

import React, { useState } from 'react';
import {
  QPH_FEE_RULES,
  calculatePlatformFee,
  calculateQphFee,
  evaluateTicketPricing,
} from '../../services/platform-fee.service';

export interface PricingTierItem {
  id?: string;
  tierNumber: number;
  name: string;
  price: number;
  capacity: number;
  endAt?: string;
}

export interface ZoneConfigItem {
  id: string;
  name: string;
  title?: string;
  color: string;
  capacity: number;
  regularPrice: number;
  serviceFee: number;
  feeIncluded?: boolean;
  benefits?: string;
  maxTicketsPerOrder: number;
  salesStartAt?: string;
  tiers: PricingTierItem[];
}

interface ZonesManagerProps {
  zones: ZoneConfigItem[];
  onChange: (zones: ZoneConfigItem[]) => void;
  eventTicketLimit?: number;
}

const PRESET_COLORS = [
  '#F59E0B', // Amber / Gold (VIP)
  '#0F172A', // Slate / Black (General)
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#10B981', // Emerald / Green
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export function ZonesManager({ zones, onChange, eventTicketLimit = 6 }: ZonesManagerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeeInfoModalOpen, setIsFeeInfoModalOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#F59E0B');
  const [capacity, setCapacity] = useState<number | ''>(500);
  const [regularPrice, setRegularPrice] = useState<number | ''>(145);
  const [feeIncluded, setFeeIncluded] = useState(false);
  const [benefits, setBenefits] = useState('');
  const [maxPerOrder, setMaxPerOrder] = useState<number>(Math.min(4, eventTicketLimit));
  const [salesStartAt, setSalesStartAt] = useState('');
  const [tiers, setTiers] = useState<PricingTierItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingZoneId(null);
    const defaultColor = PRESET_COLORS[zones.length % PRESET_COLORS.length] || '#F59E0B';
    setName(zones.length === 0 ? 'VIP' : zones.length === 1 ? 'GENERAL' : `ZONA ${zones.length + 1}`);
    setTitle(zones.length === 0 ? 'Zona Preferencial VIP' : 'Pista General (De Pie)');
    setColor(defaultColor);
    setCapacity(zones.length === 0 ? 450 : 2500);
    setRegularPrice(zones.length === 0 ? 145 : 55);
    setFeeIncluded(false);
    setBenefits(
      zones.length === 0
        ? 'Acceso preferencial, barra libre & hospitality.'
        : 'Acceso general central al campo y escenarios.'
    );
    setMaxPerOrder(Math.min(4, eventTicketLimit));
    setSalesStartAt('');
    setTiers([]);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const openEditModal = (z: ZoneConfigItem) => {
    setEditingZoneId(z.id);
    setName(z.name);
    setTitle(z.title || '');
    setColor(z.color || '#F59E0B');
    setCapacity(z.capacity);
    setRegularPrice(z.regularPrice);
    setFeeIncluded(Boolean(z.feeIncluded));
    setBenefits(z.benefits || '');
    setMaxPerOrder(Math.min(z.maxTicketsPerOrder || 4, eventTicketLimit));
    setSalesStartAt(z.salesStartAt || '');
    setTiers(z.tiers ? [...z.tiers] : []);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  // Duplicar Zona con 1 clic
  const handleDuplicateZone = (z: ZoneConfigItem) => {
    const newZone: ZoneConfigItem = {
      ...z,
      id: 'zone-' + Date.now(),
      name: `${z.name} (Copia)`,
      title: z.title ? `${z.title} (Copia)` : `${z.name} (Copia)`,
      tiers: z.tiers.map((t, idx) => ({
        ...t,
        id: 'tier-' + Date.now() + '-' + idx,
      })),
    };
    onChange([...zones, newZone]);
  };

  // Agregar un Tier de Preventa a la zona
  const handleAddTier = () => {
    if (tiers.length >= 3) {
      alert('Solo se permite un máximo de 3 etapas de preventa por zona.');
      return;
    }
    const nextTierNum = tiers.length + 1;
    const baseRegPrice = Number(regularPrice) || 100;
    const promoDiscount = nextTierNum === 1 ? 0.7 : nextTierNum === 2 ? 0.85 : 0.95;
    const calculatedPrice = Math.round(baseRegPrice * promoDiscount);
    const calculatedCap = Math.round((Number(capacity) || 500) * 0.3);

    const newTier: PricingTierItem = {
      id: 'tier-' + Date.now(),
      tierNumber: nextTierNum,
      name: `Preventa ${nextTierNum} (${nextTierNum === 1 ? 'Early Bird' : 'Fans'})`,
      price: calculatedPrice,
      capacity: calculatedCap,
      endAt: '',
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index).map((t, idx) => ({
      ...t,
      tierNumber: idx + 1,
    }));
    setTiers(updated);
  };

  const handleTierChange = (index: number, field: keyof PricingTierItem, value: any) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('El nombre del sector es obligatorio.');
      return;
    }
    if (capacity === '' || capacity <= 0) {
      setFormError('El aforo debe ser mayor a 0.');
      return;
    }
    if (regularPrice === '' || regularPrice < 0) {
      setFormError('El precio regular no puede ser negativo.');
      return;
    }

    // Validar preventas
    const totalTierCapacity = tiers.reduce((acc, t) => acc + (Number(t.capacity) || 0), 0);
    if (totalTierCapacity > Number(capacity)) {
      setFormError(
        `La suma de cupos de preventas (${totalTierCapacity.toLocaleString()}) no puede exceder el aforo total de la zona (${Number(capacity).toLocaleString()}).`
      );
      return;
    }

    for (const t of tiers) {
      if (Number(t.price) >= Number(regularPrice)) {
        setFormError(
          `El precio de ${t.name} (S/ ${t.price}) debe ser menor que el precio regular oficial (S/ ${regularPrice}).`
        );
        return;
      }
    }

    if (Number(maxPerOrder) > eventTicketLimit) {
      setFormError(
        `El máximo por orden (${maxPerOrder}) no puede superar el límite global del evento (${eventTicketLimit} entradas por usuario).`
      );
      return;
    }

    const regPriceNum = Number(regularPrice) || 0;
    // Cálculo automático con la escala oficial de comisiones de QuePlanesHoy
    const officialFee = calculateQphFee(regPriceNum);
    if (feeIncluded && officialFee > regPriceNum) {
      setFormError('La comisión oficial supera el precio regular ingresado cuando está incluida.');
      return;
    }

    const savedItem: ZoneConfigItem = {
      id: editingZoneId || 'zone-' + Date.now(),
      name: name.trim().toUpperCase(),
      title: title.trim() || undefined,
      color: color || '#F59E0B',
      capacity: Number(capacity),
      regularPrice: regPriceNum,
      serviceFee: officialFee,
      feeIncluded,
      benefits: benefits.trim() || undefined,
      maxTicketsPerOrder: Number(maxPerOrder) || Math.min(4, eventTicketLimit),
      salesStartAt: salesStartAt || undefined,
      tiers,
    };

    if (editingZoneId) {
      onChange(zones.map((z) => (z.id === editingZoneId ? savedItem : z)));
    } else {
      onChange([...zones, savedItem]);
    }

    setIsDrawerOpen(false);
  };

  const handleDeleteZone = (id: string) => {
    onChange(zones.filter((z) => z.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-variant/40">
        <div>
          <h3 className="font-bold text-base text-deep-slate flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[22px]">confirmation_number</span>
            Configuración de Zonas, Aforos y Precios
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define los sectores del recinto con su badge de color, precio oficial y preventas escalonadas.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsFeeInfoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-electric-indigo text-xs font-bold transition-colors cursor-pointer border border-indigo-200/60 shadow-xs"
            title="Conoce la escala oficial de comisiones y cómo funciona la tarifa final"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Tarifario Oficial</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Añadir Nueva Zona
          </button>
        </div>
      </div>

      {/* Grid de Zonas o Empty State */}
      {zones.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">confirmation_number</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-deep-slate">Aún no has configurado zonas ni precios</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Define los sectores del recinto (ej. VIP, General, Tribuna), asigna aforos, establece precios oficiales y agrega preventas escalonadas.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Añadir Primera Zona
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const feeValue = Math.max(0, Number(zone.serviceFee) || 0);
            const isFeeIncluded = Boolean(zone.feeIncluded);
            const buyerPrice = isFeeIncluded
              ? zone.regularPrice
              : zone.regularPrice + feeValue;
            const promoterNet = isFeeIncluded
              ? Math.max(0, zone.regularPrice - feeValue)
              : zone.regularPrice;

            return (
              <div
                key={zone.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-slate-300 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Fila Superior: Badge con el Nombre de la Zona y Color Seleccionado + Acciones */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      style={{ backgroundColor: zone.color || '#F59E0B' }}
                      className="inline-block px-3 py-1 rounded-full text-xs font-black text-white shadow-xs tracking-wider"
                    >
                      {zone.name}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => openEditModal(zone)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-electric-indigo hover:bg-slate-100 transition-colors"
                        title="Editar zona"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {/* Duplicar */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateZone(zone)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-electric-indigo hover:bg-slate-100 transition-colors"
                        title="Duplicar zona"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar zona"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Título Comercial Resaltado */}
                  <h4 className="font-bold text-base text-slate-900 mt-3 leading-snug">
                    {zone.title || zone.name}
                  </h4>

                  {/* Beneficio de la zona */}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {zone.benefits || 'Acceso general al sector del evento.'}
                  </p>

                  {/* Estadísticas de Aforo y Modalidad */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Aforo Total:</span>
                      <strong className="text-slate-900 font-bold">
                        {zone.capacity.toLocaleString()} tickets
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Modalidad de comisión:</span>
                      <span className="font-semibold text-slate-700">
                        {isFeeIncluded ? 'Incluida en precio' : 'Adicional al comprador'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Máx. por orden:</span>
                      <span className="font-bold text-slate-700">
                        {zone.maxTicketsPerOrder || 4} tickets
                      </span>
                    </div>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="material-symbols-outlined text-[14px] text-electric-indigo">verified_user</span>
                      <span>Comisión oficial visible en etapa de aprobación</span>
                    </div>
                  </div>
                </div>

                {/* Fila Inferior: Precio Base y Tarifa Final */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="block text-[11px] text-slate-400 font-medium">
                      Precio Base: <strong className="text-slate-700">S/ {zone.regularPrice.toFixed(2)}</strong>
                    </span>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                        isFeeIncluded
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                          : 'bg-indigo-50 text-electric-indigo border-indigo-200/70'
                      }`}
                    >
                      {isFeeIncluded ? 'Comisión incluida' : 'Comisión sumada'}
                    </span>
                    {zone.tiers && zone.tiers.length > 0 && (
                      <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/60">
                        {zone.tiers.length} preventa{zone.tiers.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400 font-medium">
                      Tarifa Final
                    </span>
                    <span className="text-2xl font-black text-electric-indigo tracking-tight">
                      S/ {buyerPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          DRAWER MODAL: Panel lateral que ocupa el alto completo a la derecha
          ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              {/* Header del Drawer */}
              <div className="p-5 border-b border-surface-variant/60 flex items-center justify-between bg-slate-50/80">
                <div>
                  <h3 className="font-bold text-base text-deep-slate">
                    {editingZoneId ? 'Editar Localidad / Zona' : 'Añadir Nueva Localidad / Zona'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura nombre, badge, aforo, precio de lista y preventas escalonadas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Formulario con Scroll */}
              <form onSubmit={handleSaveZone} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Datos Generales de la Zona */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Nombre del Sector (Badge)<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: VIP, GENERAL, TRIBUNA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs uppercase font-bold text-deep-slate outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400">Texto corto para el badge distintivo</p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Título Comercial
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Platinum VIP Front Stage"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400">Nombre llamativo que verá el comprador</p>
                    </div>
                  </div>

                  {/* Selector de Color Distintivo */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-xs text-deep-slate block">
                      Color Identificador de la Zona (Badge)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                            color === c
                              ? 'ring-3 ring-electric-indigo scale-110 shadow-sm'
                              : 'hover:scale-105'
                          }`}
                        />
                      ))}
                      <div className="flex items-center gap-1 ml-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                        />
                        <span className="text-xs font-mono font-bold text-slate-600">{color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Beneficios */}
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate block">
                      Beneficios y Experiencia Incluida
                    </label>
                    <textarea
                      rows={2}
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      placeholder="Ej: Acceso preferencial, barra libre & hospitality..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                  </div>
                </div>

                {/* 2. Aforo y Precio Regular */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-deep-slate uppercase tracking-wider text-slate-500">
                      Aforo y Precios de Lista
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFeeInfoModalOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-electric-indigo hover:text-primary transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                      <span>Ver Tarifario Oficial</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Aforo Total<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-variant/70 text-xs font-bold text-deep-slate outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400">Cupos totales del sector</p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Precio Regular (S/.)<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        required
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-variant/70 text-xs font-bold text-electric-indigo outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400">
                        Tarifa base de taquilla ingresada por el promotor
                      </p>
                    </div>
                  </div>

                  {/* Opción: ¿El precio incluye la comisión? */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-xs text-deep-slate block">
                          El precio incluye la comisión
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {feeIncluded
                            ? 'Activado: la comisión oficial se descuenta de tu liquidación.'
                            : 'Desactivado: la comisión oficial se suma al precio final que abona el comprador.'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={feeIncluded}
                          onChange={(e) => setFeeIncluded(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-electric-indigo" />
                      </label>
                    </div>
                  </div>

                  {/* Campo Dinámico: Tarifa Final (calculado en tiempo real según el switch y el tarifario) */}
                  {(() => {
                    const priceNum = Math.max(0, Number(regularPrice) || 0);
                    const officialFee = calculateQphFee(priceNum);
                    const finalTariff = feeIncluded ? priceNum : priceNum + officialFee;
                    const promoterNet = feeIncluded ? Math.max(0, priceNum - officialFee) : priceNum;

                    return (
                      <div className="p-3.5 rounded-xl bg-white border border-indigo-100 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-xs text-deep-slate flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-electric-indigo">payments</span>
                            <span>Tarifa Final (S/.)</span>
                          </label>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              feeIncluded
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-electric-indigo border-indigo-200'
                            }`}
                          >
                            {feeIncluded ? 'Comisión incluida en el precio' : 'Comisión sumada al precio'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-500 block">
                              Monto que abonará el comprador:
                            </span>
                            <span className="text-xs font-semibold text-slate-700 block">
                              {feeIncluded
                                ? `Tu neto a recibir: S/ ${promoterNet.toFixed(2)} (Comisión deducida: S/ ${officialFee.toFixed(2)})`
                                : `Tu neto a recibir: S/ ${promoterNet.toFixed(2)} (Comisión asumida por público: S/ ${officialFee.toFixed(2)})`}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-2xl font-black text-electric-indigo tracking-tight block">
                              S/ {finalTariff.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            Escala aplicada: <strong>{priceNum <= 50 ? 'Hasta S/ 50 (S/ 6.00)' : priceNum <= 125 ? 'De S/ 51 a S/ 125 (S/ 10.00)' : 'A partir de S/ 126 (8%)'}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsFeeInfoModalOpen(true)}
                            className="font-bold text-electric-indigo hover:underline cursor-pointer"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 items-center">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Máx. Entradas por Orden (Compra)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={eventTicketLimit}
                        value={maxPerOrder}
                        onChange={(e) => setMaxPerOrder(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs font-bold text-deep-slate outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400">
                        Tope en una sola transacción para esta zona.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-slate-600 leading-snug">
                      <span className="font-bold text-electric-indigo block mb-0.5">
                        Tope Global del Evento: {eventTicketLimit} por usuario
                      </span>
                      Un cliente podrá comprar hasta {eventTicketLimit} entradas acumuladas en todo el evento, en órdenes de máx. {maxPerOrder}.
                    </div>
                  </div>
                </div>

                {/* 3. Preventas Escalonadas (Hasta 3 Tiers) */}
                <div className="space-y-3 pt-2 border-t border-surface-variant/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-deep-slate flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
                        Preventas Escalonadas (Hasta 3 fases)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Precios promocionales por cupo o fecha límite.
                      </p>
                    </div>
                    {tiers.length < 3 && (
                      <button
                        type="button"
                        onClick={handleAddTier}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Añadir Preventa {tiers.length + 1}
                      </button>
                    )}
                  </div>

                  {tiers.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                      No hay preventas configuradas. La zona cobrará directamente el precio regular oficial (S/ {regularPrice || 0}).
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tiers.map((t, idx) => (
                        <div
                          key={t.id || idx}
                          className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-extrabold text-[10px] tracking-wide uppercase">
                              Preventa {t.tierNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTier(idx)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">Nombre Fase</label>
                              <input
                                type="text"
                                value={t.name}
                                onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-800 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">Precio Promocional (S/.)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={t.price}
                                onChange={(e) => handleTierChange(idx, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-bold text-slate-800 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">Cupo Exclusivo</label>
                              <input
                                type="number"
                                min={1}
                                value={t.capacity}
                                onChange={(e) => handleTierChange(idx, 'capacity', parseInt(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs font-bold text-slate-800 outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700 block">Fecha y Hora Límite de Preventa (Opcional)</label>
                            <input
                              type="datetime-local"
                              value={t.endAt || ''}
                              onChange={(e) => handleTierChange(idx, 'endAt', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-800 outline-none"
                            />
                          </div>

                          {/* Tarifa Final de Preventa calculada con la misma lógica oficial */}
                          {(() => {
                            const tierEval = evaluateTicketPricing(Number(t.price) || 0, feeIncluded);
                            return (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-white/95 border border-amber-200 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-amber-600 text-[16px]">payments</span>
                                  <span className="text-slate-600 font-semibold">Tarifa Final Público:</span>
                                  <strong className="text-electric-indigo font-black text-sm">
                                    S/ {tierEval.finalTariff.toFixed(2)}
                                  </strong>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {feeIncluded ? (
                                    <span>
                                      Comisión S/ {tierEval.officialFee.toFixed(2)} incluida (Tu neto: <strong className="text-emerald-700">S/ {tierEval.promoterNet.toFixed(2)}</strong>)
                                    </span>
                                  ) : (
                                    <span>
                                      + Comisión S/ {tierEval.officialFee.toFixed(2)} (Tu neto: <strong className="text-emerald-700">S/ {tierEval.promoterNet.toFixed(2)}</strong>)
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer sticky */}
                <div className="pt-6 border-t border-surface-variant/60 flex items-center justify-end gap-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-bold transition-colors cursor-pointer shadow"
                  >
                    {editingZoneId ? 'Guardar Cambios' : 'Añadir Zona'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL INFORMATIVO: TARIFARIO OFICIAL DE QUEPLANESHOY
          ========================================================================= */}
      {isFeeInfoModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-surface-variant space-y-5 animate-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-surface-variant/50 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-black text-base text-deep-slate">Tarifario Oficial QuePlanesHoy</h3>
                  <p className="text-xs text-slate-500">Escala oficial de comisiones y Tarifa Final</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeeInfoModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-deep-slate flex items-center justify-center cursor-pointer transition-colors"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Escala Tarifaria centralizada en QPH_FEE_RULES */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Escala de Comisión Oficial por Boleto (Variables de Servicio)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                  <span className="text-[11px] text-slate-500 block font-semibold">{QPH_FEE_RULES.TIER_1.label}</span>
                  <strong className="text-lg text-deep-slate font-black block mt-1">S/ {QPH_FEE_RULES.TIER_1.value.toFixed(2)}</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">por entrada</span>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                  <span className="text-[11px] text-slate-500 block font-semibold">{QPH_FEE_RULES.TIER_2.label}</span>
                  <strong className="text-lg text-deep-slate font-black block mt-1">S/ {QPH_FEE_RULES.TIER_2.value.toFixed(2)}</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">por entrada</span>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-center">
                  <span className="text-[11px] text-slate-500 block font-semibold">{QPH_FEE_RULES.TIER_3.label}</span>
                  <strong className="text-lg text-electric-indigo font-black block mt-1">{QPH_FEE_RULES.TIER_3.value * 100}%</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">del precio</span>
                </div>
              </div>
            </div>

            {/* Explicación de Tarifa Final, Preventas y Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
              <span className="font-bold text-deep-slate block flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-electric-indigo">tune</span>
                ¿Cómo se calcula la &quot;Tarifa Final&quot; (Precio Regular y Preventas)?
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                La <strong>Tarifa Final</strong> es el importe total que verá y pagará el comprador en cartelera. <strong>Esta misma lógica aplica exactamente igual a las preventas</strong> (Early Bird, Fans, Fases escalonadas) y depende del switch <em>&quot;El precio incluye la comisión&quot;</em>:
              </p>
              <ul className="space-y-2 text-[11px] leading-relaxed pt-1">
                <li className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">check_circle</span>
                  <div>
                    <strong className="text-emerald-800 block">Switch ACTIVADO (Comisión Incluida):</strong>
                    <span className="text-slate-600">
                      La <strong>Tarifa Final</strong> (tanto regular como en cada preventa) es igual al precio fijado. La comisión de QuePlanesHoy se descuenta de tu liquidación.
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Ej. Preventa a S/ 80.00 → Tarifa Final S/ 80.00 (Comisión S/ 10.00, recibes neto S/ 70.00).
                    </span>
                  </div>
                </li>
                <li className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-start gap-2">
                  <span className="material-symbols-outlined text-electric-indigo text-[18px] shrink-0">add_circle</span>
                  <div>
                    <strong className="text-electric-indigo block">Switch DESACTIVADO (Comisión Sumada):</strong>
                    <span className="text-slate-600">
                      La comisión oficial correspondiente se suma encima del precio fijado para formar la <strong>Tarifa Final</strong>. El comprador asume la comisión y tú recibes el 100% íntegro de tu precio en liquidación.
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Ej. Preventa a S/ 80.00 → Tarifa Final S/ 90.00 (S/ 80 + S/ 10 comisión, recibes neto S/ 80.00).
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => setIsFeeInfoModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-electric-indigo hover:bg-primary text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ZonesManager;
