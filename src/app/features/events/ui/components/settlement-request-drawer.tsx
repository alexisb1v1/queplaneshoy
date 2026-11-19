"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  getEventSettlementUseCase,
  requestEventSettlementUseCase,
  EventSettlementModel,
  RequestEventSettlementParams,
} from "@/app/features/events";
import { isValidRuc, isValidDni } from "@/app/common/utils/sunat-validators";

interface SettlementRequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  eventIdentifier: string;
  eventName?: string;
  onSuccess?: () => void;
}

const PERU_BANKS = ["BCP", "BBVA", "Interbank", "Scotiabank"];

function formatSoles(amount: number): string {
  return (Number(amount) || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SettlementRequestDrawer({
  isOpen,
  onClose,
  eventIdentifier,
  eventName,
  onSuccess,
}: SettlementRequestDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [settlementData, setSettlementData] =
    useState<EventSettlementModel | null>(null);

  // Formulario Bancario
  const [bankName, setBankName] = useState(PERU_BANKS[0]);
  const [accountType, setAccountType] = useState<
    "Ahorros Soles" | "Corriente Soles"
  >("Ahorros Soles");
  const [accountHolder, setAccountHolder] = useState("");
  const [documentType, setDocumentType] = useState<"DNI" | "RUC" | "CE">("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountCci, setAccountCci] = useState("");
  const [notes, setNotes] = useState("");

  // Cargar simulación o liquidación existente al abrir
  useEffect(() => {
    if (!isOpen || !eventIdentifier) return;

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    getEventSettlementUseCase.execute(eventIdentifier).then((result) => {
      setLoading(false);
      result.match(
        (data) => {
          setSettlementData(data);
          if (data.bankName) setBankName(data.bankName);
          if (data.bankAccountHolder) setAccountHolder(data.bankAccountHolder);
          if (data.bankAccountNumber) setAccountNumber(data.bankAccountNumber);
          if (data.bankAccountCci) setAccountCci(data.bankAccountCci);
          if (
            data.accountType === "Corriente Soles" ||
            data.accountType === "Ahorros Soles"
          ) {
            setAccountType(data.accountType);
          }
          if (
            data.documentType === "DNI" ||
            data.documentType === "RUC" ||
            data.documentType === "CE"
          ) {
            setDocumentType(data.documentType);
          }
          if (data.documentNumber) setDocumentNumber(data.documentNumber);
          if (data.notes) setNotes(data.notes);
        },
        (err) => {
          setError(
            err.message ||
              "No se pudieron calcular los datos de liquidación del evento.",
          );
        },
      );
    });
  }, [isOpen, eventIdentifier]);

  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!bankName.trim()) {
      setError("Por favor selecciona una entidad bancaria.");
      return;
    }
    if (!accountHolder.trim()) {
      setError(
        "Por favor ingresa el nombre o razón social del titular de la cuenta.",
      );
      return;
    }

    // Validación de documento fiscal según algoritmo SUNAT
    const cleanDoc = documentNumber.trim();
    if (documentType === "RUC") {
      if (!cleanDoc) {
        setError(
          "Por favor ingresa el número de RUC del titular de la cuenta.",
        );
        return;
      }
      if (!isValidRuc(cleanDoc)) {
        setError(
          "El RUC ingresado no es válido según el algoritmo oficial de SUNAT (Módulo 11). Verifica los 11 dígitos.",
        );
        return;
      }
    } else if (documentType === "DNI") {
      if (cleanDoc && !isValidDni(cleanDoc)) {
        setError("El DNI debe contener exactamente 8 dígitos numéricos.");
        return;
      }
    }

    if (!accountNumber.trim()) {
      setError("Por favor ingresa el número de cuenta bancaria.");
      return;
    }
    const isBcp = bankName.trim().toUpperCase() === "BCP";
    const cleanCci = accountCci.replace(/\D/g, "");

    if (!isBcp) {
      if (cleanCci.length !== 20) {
        setError(
          "Para bancos distintos al BCP, el Código de Cuenta Interbancario (CCI) es obligatorio y debe tener exactamente 20 dígitos numéricos.",
        );
        return;
      }
    } else if (cleanCci.length > 0 && cleanCci.length !== 20) {
      setError(
        "Si ingresas el CCI para BCP, debe contener exactamente 20 dígitos numéricos.",
      );
      return;
    }

    setSubmitting(true);

    const payload: RequestEventSettlementParams = {
      bankName: bankName.trim(),
      accountType,
      accountHolder: accountHolder.trim(),
      documentType,
      documentNumber: documentNumber.trim() || undefined,
      accountNumber: accountNumber.trim(),
      accountCci: cleanCci.length === 20 ? cleanCci : undefined,
      notes: notes.trim() || undefined,
    };

    const result = await requestEventSettlementUseCase.execute(
      eventIdentifier,
      payload,
    );
    setSubmitting(false);

    result.match(
      (saved) => {
        setSettlementData(saved);
        setSuccessMessage(
          "¡Solicitud de liquidación registrada exitosamente! Nuestro equipo contable la procesará en un plazo de 24h a 72h hábiles.",
        );
        if (onSuccess) onSuccess();
      },
      (err) => {
        setError(
          err.message ||
            "Ocurrió un error al enviar la solicitud de liquidación.",
        );
      },
    );
  };

  if (!isOpen) return null;

  const isRejected = settlementData?.status === "rejected";
  const isPaid = settlementData?.status === "paid";
  const isAlreadyRequested =
    Boolean(settlementData?.isSettlementRequested) && !isRejected;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop oscuro con desenfoque suave */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in-overlay"
        onClick={onClose}
      />

      {/* Contenedor del Drawer deslizante desde la derecha hacia la izquierda */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          className="w-screen max-w-full sm:max-w-2xl lg:max-w-3xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-in-right overflow-hidden"
        >
          {/* Cabecera del Drawer */}
          <div className="px-5 py-5 sm:px-8 border-b border-surface-border bg-surface-gray/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">
                  account_balance_wallet
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-deep-slate font-display">
                    Liquidación de Fondos
                  </h2>
                  {settlementData && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isRejected
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : isAlreadyRequested
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                      }`}
                    >
                      {settlementData.statusLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                  {eventName || settlementData?.eventTitle || "Evento"}{" "}
                  {settlementData?.eventCode
                    ? `· ${settlementData.eventCode}`
                    : ""}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-deep-slate hover:bg-surface-border/50 rounded-lg transition-colors"
              title="Cerrar modal"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </button>
          </div>

          {/* Cuerpo scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 space-y-6">
            {/* Spinner de carga inicial */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-semibold text-on-surface-variant">
                  Calculando resumen contable y estado de liquidación...
                </p>
              </div>
            ) : (
              <>
                {/* Alerta de Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0 mt-0.5">
                      error
                    </span>
                    <div className="flex-1 font-medium">{error}</div>
                  </div>
                )}

                {/* Alerta de Éxito */}
                {successMessage && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div className="flex-1 font-medium">{successMessage}</div>
                  </div>
                )}

                {/* ALERTA DE RECHAZO / OBSERVACIÓN (SI FUE RECHAZADA) */}
                {isRejected && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                      <span className="material-symbols-outlined text-[22px] text-rose-600">
                        cancel
                      </span>
                      Solicitud Observada / Rechazada
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      Tu solicitud previa fue observada por el área de finanzas.
                      Puedes corregir los datos bancarios en el formulario a
                      continuación y volver a solicitar la liquidación.
                    </p>
                    {settlementData?.notes && (
                      <div className="bg-white/80 p-3 rounded-xl border border-rose-200 text-xs text-rose-900">
                        <strong className="block text-rose-800 font-semibold mb-0.5">
                          Motivo de la observación:
                        </strong>
                        <span>{settlementData.notes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* AVISO IMPORTANTE DE 24H A 72H */}
                {!isPaid && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[22px]">
                        schedule
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm leading-relaxed">
                      <strong className="font-bold text-amber-900 block mb-1">
                        Plazo estimado de procesamiento bancario:
                      </strong>
                      La transferencia y liquidación definitiva demora
                      aproximadamente de{" "}
                      <span className="font-extrabold text-amber-950 underline decoration-amber-400">
                        24h a 72 horas hábiles
                      </span>{" "}
                      tras la auditoría contable de taquilla y verificación de
                      los datos bancarios ingresados.
                    </div>
                  </div>
                )}

                {/* RESUMEN FINANCIERO DEL EVENTO */}
                <div className="bg-surface-gray/60 border border-surface-border rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-deep-slate uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        analytics
                      </span>
                      Resumen Contable del Evento
                    </h3>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      {settlementData?.totalTicketsSold || 0} boletos vendidos
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm border-t border-surface-border/60 pt-3">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Recaudación Bruta (Venta de Boletos)</span>
                      <span className="font-bold text-deep-slate">
                        S/ {formatSoles(settlementData?.grossAmount || 0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-rose-700">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">
                          sell
                        </span>
                        Descuentos por Cupones Canjeados
                      </span>
                      <span className="font-bold">
                        - S/{" "}
                        {formatSoles(
                          settlementData?.totalCouponsDiscountAmount || 0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-indigo-700">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">
                          receipt_long
                        </span>
                        Comisión por Servicio Ticketera
                      </span>
                      <span className="font-bold">
                        - S/{" "}
                        {formatSoles(settlementData?.platformFeeAmount || 0)}
                      </span>
                    </div>

                    {(Number(settlementData?.totalAdvancesAmount) || 0) > 0 && (
                      <div className="flex justify-between items-center text-amber-700">
                        <span>Adelantos Previos Descontados</span>
                        <span className="font-bold">
                          - S/{" "}
                          {formatSoles(
                            settlementData?.totalAdvancesAmount || 0,
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* MONTO NETO A TRANSFERIR */}
                  <div className="border-t-2 border-primary/20 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-primary/5 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl">
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                        Total Neto a Transferir al Promotor
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Saldo libre disponible tras comisiones y descuentos
                      </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-primary font-display">
                      S/ {formatSoles(settlementData?.netPayoutAmount || 0)}
                    </div>
                  </div>
                </div>

                {/* SI YA FUE SOLICITADA Y NO ESTÁ RECHAZADA: MUESTRA ESTADO CONGELADO */}
                {isAlreadyRequested ? (
                  <div
                    className={`p-5 sm:p-6 rounded-2xl bg-white shadow-sm space-y-4 border ${
                      isPaid ? "border-emerald-200" : "border-amber-200"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 font-bold text-sm ${
                        isPaid ? "text-emerald-800" : "text-amber-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isPaid ? "verified" : "hourglass_top"}
                      </span>
                      <span>
                        {isPaid
                          ? "Liquidación Pagada y Transferida con Éxito"
                          : "Solicitud en Proceso de Pago / Auditoría"}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {isPaid ? (
                        <>
                          La transferencia bancaria fue ejecutada el{" "}
                          <span className="font-semibold text-deep-slate">
                            {settlementData?.paidAt
                              ? new Date(settlementData.paidAt).toLocaleString(
                                  "es-PE",
                                )
                              : "recientemente"}
                          </span>
                          . A continuación puedes consultar los datos de la
                          transferencia y descargar el voucher de comprobante
                          oficial.
                        </>
                      ) : (
                        <>
                          Esta liquidación fue registrada el{" "}
                          <span className="font-semibold text-deep-slate">
                            {settlementData?.requestedAt
                              ? new Date(
                                  settlementData.requestedAt,
                                ).toLocaleString("es-PE")
                              : "recientemente"}
                          </span>
                          . Los fondos se encuentran reservados y en proceso de
                          auditoría y transferencia hacia tu cuenta bancaria.
                        </>
                      )}
                    </p>

                    {/* VOUCHER / COMPROBANTE OFICIAL (CUANDO ESTÁ PAGADO) */}
                    {isPaid && settlementData?.transferVoucherUrl && (
                      <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-emerald-700">
                              receipt_long
                            </span>
                            Comprobante de Transferencia Bancaria (Voucher)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            Oficial
                          </span>
                        </div>

                        <div className="relative group overflow-hidden rounded-xl border border-emerald-200 bg-black/5 flex items-center justify-center p-2">
                          <img
                            src={settlementData.transferVoucherUrl}
                            alt="Comprobante oficial de liquidación"
                            className="max-h-60 w-auto object-contain rounded-lg shadow-sm"
                          />
                        </div>

                        <a
                          href={settlementData.transferVoucherUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-xl border border-emerald-300 transition shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            open_in_new
                          </span>
                          Ver Comprobante Oficial en Tamaño Completo
                        </a>
                      </div>
                    )}

                    {settlementData?.transferReference && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <span className="font-medium">
                          Nro de Operación Bancaria:
                        </span>
                        <code className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                          {settlementData.transferReference}
                        </code>
                      </div>
                    )}

                    <div className="bg-surface-gray/50 rounded-xl p-4 space-y-2 text-xs border border-surface-border">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] text-on-surface-variant block">
                            Banco de Destino:
                          </span>
                          <strong className="text-deep-slate">
                            {settlementData?.bankName}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-on-surface-variant block">
                            Tipo de Cuenta:
                          </span>
                          <strong className="text-deep-slate">
                            {settlementData?.accountType || "Ahorros Soles"}
                          </strong>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-on-surface-variant block">
                          Titular:
                        </span>
                        <strong className="text-deep-slate">
                          {settlementData?.bankAccountHolder}
                        </strong>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-surface-border/50">
                        <div>
                          <span className="text-[11px] text-on-surface-variant block">
                            N° de Cuenta:
                          </span>
                          <code className="text-xs font-mono font-semibold text-deep-slate">
                            {settlementData?.bankAccountNumber}
                          </code>
                        </div>
                        <div>
                          <span className="text-[11px] text-on-surface-variant block">
                            CCI:
                          </span>
                          <code className="text-xs font-mono font-semibold text-deep-slate">
                            {settlementData?.bankAccountCci || "-"}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* FORMULARIO DE CAPTURA BANCARIA SI AÚN NO SE HA SOLICITADO */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-surface-border pb-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        account_balance
                      </span>
                      <h3 className="text-sm font-bold text-deep-slate">
                        Datos de la Cuenta Bancaria de Destino
                      </h3>
                    </div>

                    {/* Entidad Bancaria */}
                    <div>
                      <label className="block text-xs font-bold text-deep-slate mb-1">
                        Banco de Destino{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full text-xs sm:text-sm border border-surface-border rounded-xl px-3.5 py-2.5 bg-white text-deep-slate focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        required
                      >
                        {PERU_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo de Cuenta (Pill selector) */}
                    <div>
                      <label className="block text-xs font-bold text-deep-slate mb-1.5">
                        Tipo de Cuenta <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Ahorros Soles", "Corriente Soles"] as const).map(
                          (type) => (
                            <button
                              type="button"
                              key={type}
                              onClick={() => setAccountType(type)}
                              className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                                accountType === type
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "bg-surface-gray/50 text-on-surface-variant border-surface-border hover:bg-surface-gray"
                              }`}
                            >
                              {type}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Titular de la Cuenta */}
                    <div>
                      <label className="block text-xs font-bold text-deep-slate mb-1">
                        Titular o Razón Social de la Cuenta{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Ej: Eventos y Producciones SAC / Juan Carlos Pérez"
                        className="w-full text-xs sm:text-sm border border-surface-border rounded-xl px-3.5 py-2.5 bg-white text-deep-slate placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        required
                      />
                    </div>

                    {/* Documento de Identidad */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-deep-slate mb-1">
                          Documento
                        </label>
                        <select
                          value={documentType}
                          onChange={(e) =>
                            setDocumentType(e.target.value as any)
                          }
                          className="w-full text-xs sm:text-sm border border-surface-border rounded-xl px-2.5 py-2.5 bg-white text-deep-slate focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        >
                          <option value="DNI">DNI</option>
                          <option value="RUC">RUC</option>
                          <option value="CE">C.E.</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-deep-slate">
                            N° de Documento{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          {documentType === "RUC" &&
                            documentNumber.trim().length === 11 && (
                              <span
                                className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                                  isValidRuc(documentNumber)
                                    ? "text-emerald-700"
                                    : "text-rose-600"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  {isValidRuc(documentNumber)
                                    ? "verified"
                                    : "error"}
                                </span>
                                <span>
                                  {isValidRuc(documentNumber)
                                    ? "RUC Válido SUNAT"
                                    : "RUC Inválido"}
                                </span>
                              </span>
                            )}
                        </div>
                        <input
                          type="text"
                          maxLength={
                            documentType === "RUC"
                              ? 11
                              : documentType === "DNI"
                                ? 8
                                : 15
                          }
                          value={documentNumber}
                          onChange={(e) =>
                            setDocumentNumber(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder={
                            documentType === "RUC"
                              ? "20601234567 (11 dígitos)"
                              : "45892134 (8 dígitos)"
                          }
                          className={`w-full text-xs sm:text-sm font-mono border rounded-xl px-3.5 py-2.5 bg-white text-deep-slate placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 transition ${
                            documentType === "RUC" &&
                            documentNumber.trim().length === 11 &&
                            !isValidRuc(documentNumber)
                              ? "border-rose-400 focus:ring-rose-200"
                              : "border-surface-border focus:ring-primary/20 focus:border-primary"
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Número de Cuenta Bancaria */}
                    <div>
                      <label className="block text-xs font-bold text-deep-slate mb-1">
                        Número de Cuenta Bancaria{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Ej: 193-98765432-0-12"
                        className="w-full text-xs sm:text-sm font-mono border border-surface-border rounded-xl px-3.5 py-2.5 bg-white text-deep-slate placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        required
                      />
                    </div>

                    {/* Código CCI (20 Dígitos) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-deep-slate flex items-center gap-1.5">
                          <span>Código de Cuenta Interbancario (CCI)</span>
                          {bankName.trim().toUpperCase() === "BCP" ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Opcional para BCP
                            </span>
                          ) : (
                            <span className="text-rose-500">*</span>
                          )}
                        </label>
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            accountCci.replace(/\D/g, "").length === 20
                              ? "text-emerald-600"
                              : accountCci.replace(/\D/g, "").length > 0
                                ? "text-amber-600"
                                : "text-on-surface-variant"
                          }`}
                        >
                          {accountCci.replace(/\D/g, "").length}/20 dígitos
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={20}
                        value={accountCci}
                        onChange={(e) =>
                          setAccountCci(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder={
                          bankName.trim().toUpperCase() === "BCP"
                            ? "002193... (Opcional para BCP)"
                            : "00219300987654320112 (Obligatorio)"
                        }
                        className={`w-full text-xs sm:text-sm font-mono tracking-widest border rounded-xl px-3.5 py-2.5 bg-white text-deep-slate placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 transition ${
                          accountCci.length > 0 && accountCci.length !== 20
                            ? "border-amber-400 focus:ring-amber-200"
                            : "border-surface-border focus:ring-primary/20 focus:border-primary"
                        }`}
                        required={bankName.trim().toUpperCase() !== "BCP"}
                      />
                      <p className="text-[11px] text-on-surface-variant mt-1">
                        {bankName.trim().toUpperCase() === "BCP"
                          ? "Opcional si tu cuenta es BCP (la transferencia se efectúa directa entre cuentas BCP con tu número de cuenta)."
                          : "Indispensable para transferencias interbancarias inmediatas en Soles."}
                      </p>
                    </div>

                    {/* Observaciones / Notas */}
                    <div>
                      <label className="block text-xs font-bold text-deep-slate mb-1">
                        Observaciones adicionales (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Indicaciones para comprobante, detalle de facturación u observaciones..."
                        className="w-full text-xs sm:text-sm border border-surface-border rounded-xl px-3.5 py-2.5 bg-white text-deep-slate placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>

                    {/* Botón de Confirmación */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          (Number(settlementData?.netPayoutAmount) || 0) <= 0
                        }
                        className={`w-full py-3.5 px-6 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] ${
                          (Number(settlementData?.netPayoutAmount) || 0) <= 0
                            ? "bg-gray-400 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-600/20"
                        }`}
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Procesando Solicitud...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[20px]">
                              {isRejected ? "refresh" : "send"}
                            </span>
                            <span>
                              {isRejected
                                ? "Corregir y Reenviar Solicitud de Liquidación"
                                : "Confirmar y Solicitar Liquidación"}
                            </span>
                          </>
                        )}
                      </button>
                      {(Number(settlementData?.netPayoutAmount) || 0) <= 0 && (
                        <p className="text-[11px] text-center text-rose-600 mt-2 font-medium">
                          El evento no tiene fondos netos disponibles para
                          liquidar en este momento.
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Pie del Drawer */}
          <div className="px-5 py-4 sm:px-8 border-t border-surface-border bg-surface-gray/30 flex items-center justify-between text-xs text-on-surface-variant shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">
                lock
              </span>
              Transferencia protegida por Qué Planes Hoy
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-deep-slate hover:bg-surface-border/50 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
