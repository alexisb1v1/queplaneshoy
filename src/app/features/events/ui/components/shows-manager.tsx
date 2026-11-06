'use client';

import React, { useState } from 'react';

export interface ShowItem {
  id: string;
  name?: string;
  startTime: string; // ISO o "YYYY-MM-DDTHH:mm"
  salesEndAt?: string; // ISO o "YYYY-MM-DDTHH:mm" (se compone con la fecha y hora seleccionadas)
  salesEndTime?: string; // Solo hora "HH:mm"
  durationHours?: number; // Horas enteras (1, 2, 3...)
  endTime?: string;
}

interface ShowsManagerProps {
  shows: ShowItem[];
  onChange: (shows: ShowItem[]) => void;
  totalCapacity?: number;
}

export function ShowsManager({ shows, onChange, totalCapacity = 0 }: ShowsManagerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingShowId, setEditingShowId] = useState<string | null>(null);

  // Form states
  const [showName, setShowName] = useState('');
  const [showDate, setShowDate] = useState('');
  const [startTimeOnly, setStartTimeOnly] = useState('20:00');
  const [salesEndTimeOnly, setSalesEndTimeOnly] = useState('20:00');
  const [durationHours, setDurationHours] = useState(3);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingShowId(null);
    setShowName(`Función ${shows.length + 1}: ${shows.length === 0 ? 'Noche de Apertura' : 'Presentación General'}`);
    
    // Fecha por defecto: dentro de 7 días
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const dateStr = targetDate.toISOString().split('T')[0];

    setShowDate(dateStr);
    setStartTimeOnly('21:00');
    setSalesEndTimeOnly('20:30');
    setDurationHours(3);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const openEditModal = (show: ShowItem) => {
    setEditingShowId(show.id);
    setShowName(show.name || '');

    if (show.startTime) {
      const parts = show.startTime.split('T');
      setShowDate(parts[0] || '');
      setStartTimeOnly(parts[1]?.substring(0, 5) || '20:00');
    }

    if (show.salesEndAt) {
      const parts = show.salesEndAt.split('T');
      setSalesEndTimeOnly(parts[1]?.substring(0, 5) || '20:00');
    } else if (show.salesEndTime) {
      setSalesEndTimeOnly(show.salesEndTime);
    }

    setDurationHours(show.durationHours || 3);
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleDuplicateShow = (show: ShowItem) => {
    const newShow: ShowItem = {
      ...show,
      id: 'show-' + Date.now(),
      name: `${show.name || 'Función'} (Copia)`,
    };
    onChange([...shows, newShow]);
  };

  const handleSaveShow = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!showDate) {
      setFormError('La fecha de la función es obligatoria.');
      return;
    }
    if (!startTimeOnly) {
      setFormError('La hora de inicio es obligatoria.');
      return;
    }

    const combinedStartTime = `${showDate}T${startTimeOnly}:00`;
    const combinedSalesEndAt = salesEndTimeOnly ? `${showDate}T${salesEndTimeOnly}:00` : undefined;

    if (editingShowId) {
      const updated = shows.map((s) =>
        s.id === editingShowId
          ? {
              ...s,
              name: showName.trim() || undefined,
              startTime: combinedStartTime,
              salesEndAt: combinedSalesEndAt,
              salesEndTime: salesEndTimeOnly,
              durationHours: Number(durationHours) || 2,
            }
          : s
      );
      onChange(updated);
    } else {
      const newShow: ShowItem = {
        id: 'show-' + Date.now(),
        name: showName.trim() || `Función ${shows.length + 1}`,
        startTime: combinedStartTime,
        salesEndAt: combinedSalesEndAt,
        salesEndTime: salesEndTimeOnly,
        durationHours: Number(durationHours) || 2,
      };
      onChange([...shows, newShow]);
    }

    setIsDrawerOpen(false);
  };

  const handleDeleteShow = (id: string) => {
    onChange(shows.filter((s) => s.id !== id));
  };

  // Extraer mes abreviado y día para el widget de calendario (ej: "OCT", "15") de forma determinística (sin hydration mismatch)
  const getCalendarDateParts = (isoDateStr: string) => {
    if (!isoDateStr) return { month: 'FECHA', day: '--' };
    const datePart = isoDateStr.split('T')[0];
    if (datePart) {
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const monthIdx = parseInt(parts[1], 10) - 1;
        const MONTHS_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
        const month = MONTHS_ES[monthIdx] || parts[1];
        const day = parseInt(parts[2], 10).toString();
        return { month, day };
      }
    }
    return { month: 'FECHA', day: '--' };
  };

  const getFormatTime = (isoOrTimeStr?: string) => {
    if (!isoOrTimeStr) return '--:--';
    if (isoOrTimeStr.includes('T')) {
      return isoOrTimeStr.split('T')[1]?.substring(0, 5) || '--:--';
    }
    return isoOrTimeStr.substring(0, 5);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-surface-variant/40">
        <div>
          <h3 className="font-bold text-base text-deep-slate flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-indigo text-[22px]">calendar_month</span>
            Calendario de Fechas y Funciones
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura una o múltiples fechas con horarios de puertas, inicio y duración.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Añadir Nueva Función / Show
        </button>
      </div>

      {/* Listado de Funciones: 1 fila por función o Empty State */}
      {shows.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-electric-indigo flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">calendar_month</span>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-deep-slate">Aún no has agregado funciones para este evento</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Programa las fechas y horarios en que se llevará a cabo tu espectáculo. Puedes añadir una sola fecha o múltiples presentaciones.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Añadir Primera Función / Show
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {shows.map((show, index) => {
          const { month, day } = getCalendarDateParts(show.startTime);
          const showTime = getFormatTime(show.startTime);
          const salesTime = getFormatTime(show.salesEndAt || show.salesEndTime);
          const duration = show.durationHours || 2;

          return (
            <div
              key={show.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              {/* Bloque Izquierdo: Cuadrito de Calendario + Título y Horarios */}
              <div className="flex items-center gap-3.5 sm:gap-4">
                {/* Cuadrito de Fecha estilo Calendario */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                    {month}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">
                    {day}
                  </span>
                </div>

                {/* Título de la Función y Horarios */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-deep-slate">
                      {show.name || `Función ${index + 1}`}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-electric-indigo border border-indigo-100">
                      {index === 0 ? 'Disponible' : 'Programada'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">door_front</span>
                      Cierre de ventas: <strong className="text-slate-700">{salesTime}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[15px] text-electric-indigo">schedule</span>
                      Inicio del Show: <strong className="text-slate-700">{showTime}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">timelapse</span>
                      Duración: <strong className="text-slate-700">{duration}h</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloque Derecho: Aforo asignado + Botones de Acción */}
              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {totalCapacity > 0 && (
                  <span className="text-xs text-slate-500 font-medium">
                    Aforo asignado: <strong className="text-slate-800">{totalCapacity.toLocaleString()}</strong> tickets
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {/* Editar */}
                  <button
                    type="button"
                    onClick={() => openEditModal(show)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-electric-indigo hover:bg-slate-100 transition-colors"
                    title="Editar función"
                  >
                    <span className="material-symbols-outlined text-[19px]">edit</span>
                  </button>

                  {/* Duplicar */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateShow(show)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-electric-indigo hover:bg-slate-100 transition-colors"
                    title="Duplicar función"
                  >
                    <span className="material-symbols-outlined text-[19px]">content_copy</span>
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => handleDeleteShow(show.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar función"
                  >
                    <span className="material-symbols-outlined text-[19px]">delete</span>
                  </button>
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
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              {/* Header del Drawer */}
              <div className="p-5 border-b border-surface-variant/60 flex items-center justify-between bg-slate-50/80">
                <div>
                  <h3 className="font-bold text-base text-deep-slate">
                    {editingShowId ? 'Editar Función / Show' : 'Nueva Función / Show'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Establece el día, la hora de inicio y la duración del evento.
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

              {/* Formulario en Body Scroll */}
              <form onSubmit={handleSaveShow} className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Nombre de la función */}
                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate block">
                    Nombre o Título de la Función
                  </label>
                  <input
                    type="text"
                    value={showName}
                    onChange={(e) => setShowName(e.target.value)}
                    placeholder="Ej: Función Principal: Noche de Apertura"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                  />
                  <p className="text-[11px] text-slate-400">
                    Nombre descriptivo para diferenciar esta fecha si hay funciones múltiples.
                  </p>
                </div>

                {/* Fecha de la función */}
                <div className="space-y-1">
                  <label className="font-bold text-xs text-deep-slate block">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                  />
                </div>

                {/* Hora de inicio y Cierre de ventas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate block">
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      required
                      value={startTimeOnly}
                      onChange={(e) => setStartTimeOnly(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                    <p className="text-[10px] text-slate-400">Hora de arranque</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-xs text-deep-slate block">
                      Cierre de Ventas (Hora)
                    </label>
                    <input
                      type="time"
                      value={salesEndTimeOnly}
                      onChange={(e) => setSalesEndTimeOnly(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs text-deep-slate outline-none focus:border-electric-indigo"
                    />
                    <p className="text-[10px] text-slate-400">Límite para comprar</p>
                  </div>
                </div>

                {/* Duración del Evento (en Horas) */}
                <div className="space-y-2 pt-2 border-t border-surface-variant/40">
                  <label className="font-bold text-xs text-deep-slate block">
                    Duración Estimada del Evento (Horas)
                  </label>
                  
                  {/* Selector rápido en botones */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDurationHours(h)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          durationHours === h
                            ? 'bg-electric-indigo text-white shadow-sm'
                            : 'bg-surface-gray hover:bg-slate-200 text-deep-slate'
                        }`}
                      >
                        {h} {h === 1 ? 'hora' : 'hrs'}
                      </button>
                    ))}
                  </div>

                  {/* Input numérico directo */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">O ingresa otra duración:</span>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      value={durationHours}
                      onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-1.5 rounded-xl bg-surface-gray border border-surface-variant/70 text-xs font-bold text-center text-deep-slate outline-none focus:border-electric-indigo"
                    />
                    <span className="text-xs font-semibold text-slate-600">horas</span>
                  </div>
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
                    {editingShowId ? 'Guardar Cambios' : 'Añadir Función'}
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
export default ShowsManager;
