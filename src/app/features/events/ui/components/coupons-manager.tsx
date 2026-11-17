'use client';

import React, { useState } from 'react';

export interface CouponFormItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageType: 'reusable' | 'single_use';
  maxUses?: number;
  expiresAt?: string;
  status?: string;
}

interface CouponsManagerProps {
  coupons: CouponFormItem[];
  onChange: (coupons: CouponFormItem[]) => void;
}

export function CouponsManager({ coupons, onChange }: CouponsManagerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>(15);
  const [usageType, setUsageType] = useState<'reusable' | 'single_use'>('reusable');
  const [maxUses, setMaxUses] = useState<number | ''>(100);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('23:59');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openDrawer = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setUsageType('reusable');
    setMaxUses(100);
    setHasExpiry(false);
    setExpiryDate('');
    setExpiryTime('23:59');
    setErrorMsg(null);
    setIsDrawerOpen(true);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Por favor ingresa un código para el cupón.');
      return;
    }
    if (coupons.some((c) => c.code === cleanCode)) {
      setErrorMsg(`El código "${cleanCode}" ya existe en este evento.`);
      return;
    }
    if (discountValue === '' || Number(discountValue) <= 0) {
      setErrorMsg('El valor del descuento debe ser mayor a 0.');
      return;
    }

    if (hasExpiry && !expiryDate) {
      setErrorMsg('Selecciona una fecha límite o desactiva la vigencia programada.');
      return;
    }

    const combinedExpiresAt =
      hasExpiry && expiryDate ? `${expiryDate}T${expiryTime || '23:59'}:00` : undefined;

    const newCoupon: CouponFormItem = {
      id: 'coupon-' + Date.now(),
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      usageType,
      maxUses: maxUses !== '' ? Number(maxUses) : undefined,
      expiresAt: combinedExpiresAt,
      status: 'Activo',
    };

    onChange([newCoupon, ...coupons]);
    setIsDrawerOpen(false);
  };

  const handleDeleteCoupon = (id: string) => {
    onChange(coupons.filter((c) => c.id !== id));
  };

  const formatExpiry = (isoString?: string) => {
    if (!isoString) return 'Sin fecha límite';
    const parts = isoString.split('T');
    if (parts.length >= 1) {
      const dateParts = parts[0].split('-');
      if (dateParts.length === 3) {
        const [year, monthNum, day] = dateParts;
        const time = parts[1] ? parts[1].substring(0, 5) : '23:59';
        return `${day.padStart(2, '0')}/${monthNum.padStart(2, '0')}/${year} ${time} hrs`;
      }
    }
    return isoString;
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-variant/40">
        <div>
          <h3 className="font-bold text-base text-deep-slate flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[22px]">sell</span>
            Cupones y Descuentos Promocionales
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea códigos de descuento para influencers, campañas de difusión o cortesías.
          </p>
        </div>
        <button
          type="button"
          onClick={openDrawer}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Añadir Nuevo Cupón
        </button>
      </div>

      {/* Listado / Tabla de Cupones o Empty State */}
      {coupons.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">sell</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-deep-slate">No hay cupones configurados para este evento</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Los cupones son opcionales. Si no creas cupones, los compradores pagarán las tarifas oficiales establecidas en las zonas.
            </p>
          </div>
          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Añadir Primer Cupón
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-surface-variant/60">
          <table className="w-full text-left bg-white text-xs">
            <thead>
              <tr className="bg-surface-gray text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-surface-variant/40">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descuento</th>
                <th className="py-3 px-4">Modalidad</th>
                <th className="py-3 px-4">Límite</th>
                <th className="py-3 px-4">Vigencia Límite</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/30 text-deep-slate font-medium">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold tracking-wider text-electric-indigo">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : `S/ ${c.discountValue.toFixed(2)} OFF`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      c.usageType === 'single_use'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {c.usageType === 'single_use' ? 'Un solo uso' : 'Reutilizable'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {c.maxUses ? `${c.maxUses} canjes` : 'Ilimitado'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium" suppressHydrationWarning>
                    {formatExpiry(c.expiresAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Eliminar cupón"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          DRAWER MODAL: Panel lateral que ocupa el alto completo a la derecha
          ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="p-5 border-b border-surface-variant/60 flex items-center justify-between bg-slate-50/80">
                <div>
                  <h3 className="font-bold text-base text-deep-slate">Nuevo Cupón de Descuento</h3>
                  <p className="text-xs text-slate-500">Configura el código, beneficio y vigencia límite.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleAddCoupon} className="flex-1 overflow-y-auto p-6 space-y-5">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate block">
                    Código del Cupón<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ej: INFLUENCER20, PREVENTAVIP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs font-mono font-bold uppercase text-deep-slate outline-none focus:border-electric-indigo"
                  />
                  <p className="text-[10px] text-slate-400">En mayúsculas, sin espacios.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate block">
                    Beneficio de Descuento<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="flex rounded-xl bg-surface-gray border border-surface-variant/70 overflow-hidden">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-bold text-deep-slate outline-none bg-transparent"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                      className="bg-slate-200/60 px-3 text-xs font-bold text-deep-slate outline-none border-l border-surface-variant/70"
                    >
                      <option value="percentage">% Porcentaje</option>
                      <option value="fixed">S/. Monto Fijo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate block">
                    Modalidad de Uso<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    value={usageType}
                    onChange={(e) => setUsageType(e.target.value as 'reusable' | 'single_use')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs font-semibold text-deep-slate outline-none"
                  >
                    <option value="reusable">Reutilizable (Para campañas masivas e influencers)</option>
                    <option value="single_use">Un solo uso (Para sorteos o clientes únicos)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate block">Límite Total de Canjes</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Dejar vacío para ilimitado"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs font-semibold text-deep-slate outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Tope máximo de órdenes que podrán canjearlo.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-deep-slate block">
                        Definir fecha y hora límite (Opcional)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {hasExpiry
                          ? 'El cupón vencerá automáticamente en la fecha indicada.'
                          : 'Desactivado: vigente hasta que finalice el evento.'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={hasExpiry}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setHasExpiry(enabled);
                          if (!enabled) {
                            setExpiryDate('');
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-electric-indigo" />
                    </label>
                  </div>

                  {hasExpiry && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/70 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 font-medium block mb-1">
                            Día/Mes/Año<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            type="date"
                            required={hasExpiry}
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs font-semibold text-deep-slate outline-none focus:border-electric-indigo"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-medium block mb-1">
                            Hora (hh:mm)
                          </span>
                          <input
                            type="time"
                            value={expiryTime}
                            onChange={(e) => setExpiryTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-surface-variant/70 text-xs font-semibold text-deep-slate outline-none focus:border-electric-indigo"
                          />
                        </div>
                      </div>
                      {expiryDate && (
                        <p className="text-[10px] font-semibold text-electric-indigo">
                          Expira el {expiryDate.split('-').reverse().join('/')} a las {expiryTime || '23:59'} hrs.
                        </p>
                      )}
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
                    Guardar Cupón
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
export default CouponsManager;
