'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';

export interface ShowItem {
  id: string;
  name?: string;
  startTime: string; // ISO o "YYYY-MM-DDTHH:mm"
  salesEndAt?: string; // ISO o "YYYY-MM-DDTHH:mm"
  salesEndTime?: string; // Solo hora "HH:mm"
  durationHours?: number; // Horas enteras
  endTime?: string;
}

interface ShowsManagerProps {
  shows: ShowItem[];
  onChange: (shows: ShowItem[]) => void;
  totalCapacity?: number;
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MONTH_SHORT_ES = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC',
];

const WEEKDAY_SHORT_ES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return 'Seleccionar fecha';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const dateObj = new Date(y, m, d);
  const weekdayFull = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dateObj.getDay()];
  const monthName = MONTH_SHORT_ES[m]?.toLowerCase() || '';
  return `${d} ${monthName}, ${y} (${weekdayFull})`;
}

/**
 * Componente Selector de Calendario Estilo Popover (Mockup Exacto)
 */
interface ModernDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

function ModernDatePicker({ value, onChange }: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar vista en el año y mes del valor actual o la fecha de hoy
  const initialDate = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calcular días de la cuadrícula
  const { daysInMonth, firstDayOfWeek, prevMonthDays } = useMemo(() => {
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    // 0 = Domingo, 1 = Lunes ... convertimos a Lunes = 0, Domingo = 6
    const firstDay = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const prevDays: number[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      prevDays.push(daysInPrev - i);
    }

    return { daysInMonth: totalDays, firstDayOfWeek: firstDay, prevMonthDays: prevDays };
  }, [viewYear, viewMonth]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mm}-${dd}`;
  }, []);

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const applyPreset = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setViewYear(y);
    setViewMonth(d.getMonth());
    onChange(`${y}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const applyThisMonth = () => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onChange(`${d.getFullYear()}-${mm}-${dd}`);
    setIsOpen(false);
  };

  // Texto amigable para el trigger pill
  const pillDisplay = useMemo(() => {
    if (!value) return 'Seleccionar fecha';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return `${d} ${MONTH_SHORT_ES[m]?.toLowerCase() || ''}, ${y}`;
  }, [value]);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="font-bold text-xs text-deep-slate block">
        Fecha de la Función <span className="text-red-500">*</span>
      </label>

      {/* Trigger Button: Pill idéntico al mockup */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full border transition-all text-xs font-semibold cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-sky-500 ring-2 ring-sky-100 bg-white text-slate-800'
            : 'border-slate-200 hover:border-sky-400 bg-white text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[19px] text-sky-600">calendar_month</span>
          <span className="font-bold text-slate-800">{pillDisplay}</span>
        </div>
        <span
          className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-600' : ''
          }`}
        >
          keyboard_arrow_down
        </span>
      </button>

      {/* Popover Flotante idéntico a la imagen de referencia */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full max-w-[340px] bg-white rounded-3xl border border-slate-100 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Pills de atajos superiores */}
          <div className="flex items-center gap-1 overflow-x-auto pb-3 pt-0.5 scrollbar-none border-b border-slate-100">
            <button
              type="button"
              onClick={() => applyPreset(0)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-1)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              Ayer
            </button>
            <button
              type="button"
              onClick={() => applyPreset(7)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              7 días
            </button>
            <button
              type="button"
              onClick={() => applyPreset(30)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              30 días
            </button>
            <button
              type="button"
              onClick={applyThisMonth}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              Este mes
            </button>
          </div>

          {/* Cabecera del Mes + Flechas circulares */}
          <div className="flex items-center justify-between pt-3 pb-2 px-1">
            <span className="text-sm font-extrabold text-slate-900">
              {MONTH_NAMES_ES[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Mes siguiente"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Días de la semana abreviados */}
          <div className="grid grid-cols-7 gap-1 text-center py-1">
            {['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'].map((d, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-black ${
                  idx === 6 ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Cuadrícula de números */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {/* Días previos en gris atenuado */}
            {prevMonthDays.map((d, idx) => (
              <div
                key={`prev-${idx}`}
                className="h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-300 pointer-events-none select-none"
              >
                {d}
              </div>
            ))}

            {/* Días del mes activo */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const currentStr = `${viewYear}-${mm}-${dd}`;
              const isSelected = value === currentStr;
              const isToday = todayStr === currentStr;

              return (
                <button
                  key={`cur-${day}`}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                    isSelected
                      ? 'bg-[#0284c7] text-white font-extrabold shadow-sm scale-105 z-10'
                      : isToday
                      ? 'text-[#0284c7] font-black hover:bg-sky-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day}
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#0284c7] absolute bottom-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Pie informativo sutil */}
          <div className="pt-3 mt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            Selecciona la fecha de la presentación
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente Selector de Horas: Desplegable simple con el mismo CSS del Calendario
 */
interface ModernTimePickerProps {
  label: string;
  sublabel?: string;
  value: string; // HH:mm (24h)
  onChange: (timeStr: string) => void;
  required?: boolean;
}

function ModernTimePicker({ label, sublabel, value, onChange, required = false }: ModernTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Generar lista de horas del día en intervalos de 30 minutos (ej. 00:00, 00:30, ..., 23:30)
  const timeOptions = useMemo(() => {
    const options: { val: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const val = `${hh}:${mm}`;
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        const label = `${String(h12).padStart(2, '0')}:${mm} ${period}`;
        options.push({ val, label });
      }
    }
    return options;
  }, []);

  // Formatear texto mostrado en el botón
  const displayLabel = useMemo(() => {
    if (!value) return 'Seleccionar hora';
    const parts = value.split(':');
    let h = parseInt(parts[0], 10) || 0;
    const m = parts[1]?.substring(0, 2) || '00';
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${m} ${period}`;
  }, [value]);

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="font-bold text-xs text-deep-slate block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Trigger: Mismo CSS que el botón del calendario */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full border transition-all text-xs font-semibold cursor-pointer shadow-2xs ${
          isOpen
            ? 'border-sky-500 ring-2 ring-sky-100 bg-white text-slate-800'
            : 'border-slate-200 hover:border-sky-400 bg-white text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[19px] text-sky-600">schedule</span>
          <span className="font-bold text-slate-800">{displayLabel}</span>
        </div>
        <span
          className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-600' : ''
          }`}
        >
          keyboard_arrow_down
        </span>
      </button>

      {sublabel && <p className="text-[10px] text-slate-400 px-1">{sublabel}</p>}

      {/* Desplegable flotante: Mismo estilo que el popover del calendario (rounded-3xl, shadow-2xl, border-slate-100) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full min-w-[200px] max-h-60 overflow-y-auto bg-white rounded-3xl border border-slate-100 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-1">
            {timeOptions.map((opt) => {
              const isSelected = value === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => {
                    onChange(opt.val);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold text-left transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#0284c7] text-white font-extrabold shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
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
    setShowName(
      `Función ${shows.length + 1}: ${
        shows.length === 0 ? 'Noche de Apertura' : 'Presentación General'
      }`
    );

    // Fecha por defecto: dentro de 7 días
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${targetDate.getFullYear()}-${mm}-${dd}`;

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
    const combinedSalesEndAt = salesEndTimeOnly
      ? `${showDate}T${salesEndTimeOnly}:00`
      : undefined;

    if (editingShowId) {
      const updated = shows.map((s) =>
        s.id === editingShowId
          ? {
              ...s,
              name: showName.trim() || undefined,
              startTime: combinedStartTime,
              salesEndAt: combinedSalesEndAt,
              salesEndTime: salesEndTimeOnly,
              durationHours,
            }
          : s
      );
      onChange(updated);
    } else {
      const newShow: ShowItem = {
        id: 'show-' + Date.now(),
        name: showName.trim() || undefined,
        startTime: combinedStartTime,
        salesEndAt: combinedSalesEndAt,
        salesEndTime: salesEndTimeOnly,
        durationHours,
      };
      onChange([...shows, newShow]);
    }

    setIsDrawerOpen(false);
  };

  const handleDeleteShow = (id: string) => {
    onChange(shows.filter((s) => s.id !== id));
  };

  // Extraer mes abreviado, día y día de la semana para el widget de almanaque
  const getCalendarDateParts = (isoDateStr: string) => {
    if (!isoDateStr) return { month: 'FECHA', day: '--', weekday: 'DÍA' };
    const datePart = isoDateStr.split('T')[0];
    if (datePart) {
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        const month = MONTH_SHORT_ES[m] || parts[1];
        const day = d.toString();
        const weekday = WEEKDAY_SHORT_ES[dateObj.getDay()] || '';
        return { month, day, weekday };
      }
    }
    return { month: 'FECHA', day: '--', weekday: 'DÍA' };
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

      {/* Listado de Funciones */}
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
            const { month, day, weekday } = getCalendarDateParts(show.startTime);
            const showTime = getFormatTime(show.startTime);
            const salesTime = getFormatTime(show.salesEndAt || show.salesEndTime);
            const duration = show.durationHours || 2;

            return (
              <div
                key={show.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group"
              >
                {/* Bloque Izquierdo: Almanaque Moderno de Fecha + Info */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                  {/* Tarjeta Almanaque Estilizada */}
                  <div className="w-14 sm:w-16 rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm flex flex-col shrink-0 group-hover:border-electric-indigo/50 transition-all">
                    {/* Banda del Mes */}
                    <div className="bg-gradient-to-r from-electric-indigo to-indigo-600 text-white py-1 px-1 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider block leading-none">
                        {month}
                      </span>
                    </div>
                    {/* Cuerpo del Día */}
                    <div className="py-1.5 px-1 flex flex-col items-center justify-center bg-white">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">
                        {day}
                      </span>
                      {weekday && (
                        <span className="text-[9px] font-bold text-electric-indigo uppercase tracking-wider mt-0.5">
                          {weekday}
                        </span>
                      )}
                    </div>
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

                {/* Bloque Derecho: Aforo asignado + Acciones */}
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
                      className="p-1.5 rounded-lg text-slate-500 hover:text-electric-indigo hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Editar función"
                    >
                      <span className="material-symbols-outlined text-[19px]">edit</span>
                    </button>

                    {/* Duplicar */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateShow(show)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-electric-indigo hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Duplicar función"
                    >
                      <span className="material-symbols-outlined text-[19px]">content_copy</span>
                    </button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDeleteShow(show.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          DRAWER MODAL LATERAL
          ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
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
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Formulario en Body Scroll */}
              <form onSubmit={handleSaveShow} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
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

                {/* Selector Moderno de Calendario */}
                <ModernDatePicker value={showDate} onChange={setShowDate} />

                {/* Selectores Modernos de Horarios */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <ModernTimePicker
                    label="Hora de Inicio"
                    sublabel="Arranque del show"
                    value={startTimeOnly}
                    onChange={setStartTimeOnly}
                    required
                  />

                  <ModernTimePicker
                    label="Cierre de Ventas"
                    sublabel="Límite para comprar entradas"
                    value={salesEndTimeOnly}
                    onChange={setSalesEndTimeOnly}
                  />
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
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                      onChange={(e) =>
                        setDurationHours(Math.max(1, parseInt(e.target.value) || 1))
                      }
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
