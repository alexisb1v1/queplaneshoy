'use client';

import React, { useState } from 'react';

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
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#F59E0B');
  const [capacity, setCapacity] = useState<number | ''>(500);
  const [regularPrice, setRegularPrice] = useState<number | ''>(145);
  const [serviceFee, setServiceFee] = useState<number | ''>(14.5);
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
    setServiceFee(zones.length === 0 ? 14.5 : 5.5);
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
    setServiceFee(z.serviceFee);
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

    const savedItem: ZoneConfigItem = {
      id: editingZoneId || 'zone-' + Date.now(),
      name: name.trim().toUpperCase(),
      title: title.trim() || undefined,
      color: color || '#F59E0B',
      capacity: Number(capacity),
      regularPrice: Number(regularPrice),
      serviceFee: serviceFee === '' ? 0 : Number(serviceFee),
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
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Añadir Nueva Zona
        </button>
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
            const feeCalculated = zone.serviceFee > 0 ? zone.serviceFee : zone.regularPrice * 0.1;

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

                  {/* Estadísticas de Aforo y Comisiones */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Aforo Total:</span>
                      <strong className="text-slate-900 font-bold">
                        {zone.capacity.toLocaleString()} tickets
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Comisión QPH (10%):</span>
                      <span className="font-medium text-slate-700">
                        S/ {feeCalculated.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Máx. por compra (orden):</span>
                      <span className="font-bold text-slate-700">
                        {zone.maxTicketsPerOrder || 4} tickets
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>IGV Incluido:</span>
                      <span className="font-medium text-slate-700">18%</span>
                    </div>
                  </div>
                </div>

                {/* Fila Inferior: Precio Final y Preventas */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="block text-xs text-slate-400 font-medium">Precio final</span>
                    {zone.tiers && zone.tiers.length > 0 && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/60">
                        Preventa activa ({zone.tiers.length} {zone.tiers.length === 1 ? 'fase' : 'fases'})
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-electric-indigo tracking-tight">
                      S/ {zone.regularPrice.toFixed(2)}
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
                        Nombre del Sector (Badge) *
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
                  <h4 className="font-bold text-xs text-deep-slate uppercase tracking-wider text-slate-500">
                    Aforo y Precios de Lista
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Aforo Total *
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
                        Precio Regular (S/.) *
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
                      <p className="text-[10px] text-slate-400">Tarifa taquilla final</p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-xs text-deep-slate block">
                        Comisión QPH (S/.)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={serviceFee}
                        onChange={(e) => setServiceFee(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-surface-variant/70 text-xs font-medium text-deep-slate outline-none focus:border-electric-indigo"
                      />
                      <p className="text-[10px] text-slate-400">Cargo por boleto</p>
                    </div>
                  </div>

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
    </div>
  );
}
export default ZonesManager;
