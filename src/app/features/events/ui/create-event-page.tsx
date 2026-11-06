'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../common/services/api-client';
import { getCurrentUserUseCase, becomeOrganizerUseCase, resendVerificationUseCase } from '../../auth';
import { createEventUseCase, publishEventUseCase } from '../index';
import { UserModel } from '../../auth/models/user.model';
import { EventModel } from '../models/event.model';

const CATEGORIES = [
  'CONCIERTO',
  'FESTIVAL',
  'TEATRO',
  'DEPORTES',
  'VIDA NOCTURNA',
  'GASTRONOMIA',
  'CONFERENCIA',
  'FAMILIAR',
];

export default function CreateEventPageComponent() {
  const router = useRouter();

  // Estados de usuario
  const [user, setUser] = useState<UserModel | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Estados del Paso 0 (Activar Organizador)
  const [organizerName, setOrganizerName] = useState('');
  const [docType, setDocType] = useState('RUC');
  const [docNumber, setDocNumber] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [isActivatingOrg, setIsActivatingOrg] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);

  // Estados del Formulario de Evento
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('CONCIERTO');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('20:00');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('Lima');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');

  // Estados de proceso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<EventModel | null>(null);

  // Modal del Plan B (Correo no verificado)
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Modal de éxito de publicación
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) {
      router.push('/login?redirect=/organizer/events/new');
      return;
    }

    getCurrentUserUseCase.execute().match(
      (currentUser) => {
        setUser(currentUser);
        setIsCheckingAuth(false);
        if (currentUser.organizerName) setOrganizerName(currentUser.organizerName);
        if (currentUser.organizerDocumentType) setDocType(currentUser.organizerDocumentType);
        if (currentUser.organizerDocumentNumber) setDocNumber(currentUser.organizerDocumentNumber);
        if (currentUser.phone) setOrganizerPhone(currentUser.phone);
      },
      () => {
        apiClient.clearToken();
        router.push('/login?redirect=/organizer/events/new');
      }
    );
  }, [router]);

  // Manejo de activación de organizador (Paso 0)
  const handleActivateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError(null);

    if (!organizerName.trim()) {
      setOrgError('Por favor, ingresa el nombre de tu productora o marca comercial.');
      return;
    }
    if (!docNumber.trim()) {
      setOrgError('Por favor, ingresa tu número de documento (RUC o DNI).');
      return;
    }
    if (!organizerPhone.trim()) {
      setOrgError('Por favor, ingresa un número de teléfono de contacto.');
      return;
    }

    setIsActivatingOrg(true);

    const result = await becomeOrganizerUseCase.execute({
      organizerName: organizerName.trim(),
      organizerDocumentType: docType,
      organizerDocumentNumber: docNumber.trim(),
      organizerPhone: organizerPhone.trim(),
    });

    result.match(
      (res) => {
        setUser(res.user);
        setIsActivatingOrg(false);
      },
      (err) => {
        setOrgError(err.message || 'No se pudo activar el perfil de organizador.');
        setIsActivatingOrg(false);
      }
    );
  };

  // Reenviar correo de verificación
  const handleResendVerification = async () => {
    if (!user?.email) return;
    setIsResendingEmail(true);
    setResendStatus(null);

    const result = await resendVerificationUseCase.execute(user.email);
    result.match(
      (res) => {
        setIsResendingEmail(false);
        setResendStatus(res.message || 'Correo reenviado. Revisa tu bandeja de entrada o spam.');
      },
      (err) => {
        setIsResendingEmail(false);
        setResendStatus(err.message || 'Error al reenviar el correo.');
      }
    );
  };

  // Validación de datos del evento
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setFeedbackError('Por favor, ingresa el nombre del evento.');
      return false;
    }
    if (!date) {
      setFeedbackError('Por favor, selecciona la fecha del evento.');
      return false;
    }
    if (!location.trim()) {
      setFeedbackError('Por favor, ingresa el local o recinto del evento.');
      return false;
    }
    if (price === '' || Number(price) < 0) {
      setFeedbackError('Por favor, ingresa un precio válido para las entradas.');
      return false;
    }
    if (capacity === '' || Number(capacity) <= 0) {
      setFeedbackError('Por favor, ingresa un aforo o capacidad válida.');
      return false;
    }
    return true;
  };

  // Guardar como Borrador (Plan B: Siempre permitido)
  const handleSaveDraft = async () => {
    setFeedbackError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    const combinedDateTime = `${date}T${time}:00`;

    const result = await createEventUseCase.execute({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      date: combinedDateTime,
      location: location.trim(),
      department: department.trim() || undefined,
      district: district.trim() || undefined,
      address: address.trim() || undefined,
      price: Number(price),
      capacity: Number(capacity),
      bannerUrl: bannerUrl.trim() || undefined,
    });

    result.match(
      (newEvent) => {
        setIsSubmitting(false);
        setCreatedEvent(newEvent);
        alert('¡Borrador guardado con éxito! Puedes seguir editando o publicarlo cuando desees.');
      },
      (err) => {
        setIsSubmitting(false);
        setFeedbackError(err.message || 'Error al guardar el borrador del evento.');
      }
    );
  };

  // Publicar Evento (Plan B: Exige email verificado)
  const handlePublish = async () => {
    setFeedbackError(null);
    if (!validateForm()) return;

    // Regla de Oro del Plan B: Si no está verificado, bloquear con Modal amigable
    if (!user?.emailVerifiedAt) {
      // Si aún no hemos creado el evento en la BD, lo guardamos primero como borrador
      if (!createdEvent) {
        setIsSubmitting(true);
        const combinedDateTime = `${date}T${time}:00`;

        const saveRes = await createEventUseCase.execute({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          date: combinedDateTime,
          location: location.trim(),
          department: department.trim() || undefined,
          district: district.trim() || undefined,
          address: address.trim() || undefined,
          price: Number(price),
          capacity: Number(capacity),
          bannerUrl: bannerUrl.trim() || undefined,
        });

        setIsSubmitting(false);

        if (saveRes.isErr()) {
          setFeedbackError(saveRes.error.message || 'Error al procesar el evento.');
          return;
        }

        setCreatedEvent(saveRes.value);
      }

      // Abrir Modal amigable del Plan B
      setShowVerifyModal(true);
      return;
    }

    // Si el usuario ya está verificado, procedemos a publicar directamente
    setIsSubmitting(true);
    let eventToPublishId = createdEvent?.id;

    if (!eventToPublishId) {
      const combinedDateTime = `${date}T${time}:00`;
      const saveRes = await createEventUseCase.execute({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        date: combinedDateTime,
        location: location.trim(),
        department: department.trim() || undefined,
        district: district.trim() || undefined,
        address: address.trim() || undefined,
        price: Number(price),
        capacity: Number(capacity),
        bannerUrl: bannerUrl.trim() || undefined,
      });

      if (saveRes.isErr()) {
        setIsSubmitting(false);
        setFeedbackError(saveRes.error.message || 'Error al guardar el evento.');
        return;
      }
      eventToPublishId = saveRes.value.id;
      setCreatedEvent(saveRes.value);
    }

    const publishRes = await publishEventUseCase.execute(eventToPublishId);
    setIsSubmitting(false);

    publishRes.match(
      () => {
        setPublishedSuccess(true);
      },
      (err) => {
        if (err.message.includes('verificar') || err.code === 'FORBIDDEN') {
          setShowVerifyModal(true);
        } else {
          setFeedbackError(err.message || 'No se pudo publicar el evento.');
        }
      }
    );
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-gray py-20">
        <div className="flex flex-col items-center gap-3 text-deep-slate">
          <div className="w-8 h-8 border-3 border-electric-indigo border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold">Cargando panel de creación...</p>
        </div>
      </div>
    );
  }

  // PASO 0: Activar Perfil de Organizador si aún no lo ha completado
  if (user && !user.isOrganizer) {
    return (
      <div className="min-h-screen bg-surface-gray py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/30 p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-electric-indigo">
                <span className="material-symbols-outlined text-3xl">storefront</span>
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-electric-indigo text-xs font-bold rounded-full uppercase tracking-wider mb-1">
                  Paso 0 de 2
                </span>
                <h1 className="text-2xl font-black text-deep-slate tracking-tight">
                  Activa tu Perfil de Organizador
                </h1>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              ¡Genial que quieras publicar en <strong>Qué Planes Hoy</strong>! Para garantizar la seriedad y poder liquidar las ventas de tus entradas, completa los datos comerciales de tu marca o productora.
            </p>

            {orgError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
                <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
                <span>{orgError}</span>
              </div>
            )}

            <form onSubmit={handleActivateOrganizer} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Nombre Comercial o de Productora *
                </label>
                <input
                  type="text"
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Ej: Mega Conciertos Perú, Teatro Club, etc."
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                    Tipo de Doc. *
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet Extranjería</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Ej: 20601234567 o 71234567"
                    className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Teléfono / WhatsApp Comercial *
                </label>
                <input
                  type="tel"
                  required
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  placeholder="Ej: +51 987654321"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Link
                  href="/"
                  className="px-5 py-3 text-xs font-bold text-on-surface-variant hover:text-deep-slate transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isActivatingOrg}
                  className="qph-btn-primary px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isActivatingOrg ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>Activar y Crear Evento</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ÉXITO DE PUBLICACIÓN
  if (publishedSuccess) {
    return (
      <div className="min-h-screen bg-surface-gray py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center border border-outline-variant/30 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">celebration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-deep-slate tracking-tight mb-3">
            ¡Tu evento ya está en vivo! 🎉
          </h1>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            El evento <strong>"{title}"</strong> ha sido publicado exitosamente. Las entradas ya están disponibles para el público en Qué Planes Hoy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto qph-btn-secondary px-6 py-3 text-xs font-bold"
            >
              Ir a la Cartelera
            </Link>
            <button
              onClick={() => {
                setPublishedSuccess(false);
                setTitle('');
                setDescription('');
                setPrice('');
                setCapacity('');
                setCreatedEvent(null);
              }}
              className="w-full sm:w-auto qph-btn-primary px-6 py-3 text-xs font-bold"
            >
              Publicar Otro Evento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-gray py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* BANNER PLAN B: AVISO SI CORREO NO ESTÁ VERIFICADO */}
        {user && !user.emailVerifiedAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl flex-shrink-0">
                mark_email_unread
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                  Tu correo aún no está verificado ({user.email})
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  Puedes diseñar y guardar tu borrador libremente. Para publicarlo y poner las entradas a la venta, deberás confirmar tu cuenta.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingEmail}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex-shrink-0 flex items-center gap-2"
            >
              {isResendingEmail ? 'Reenviando...' : 'Reenviar confirmación'}
            </button>
          </div>
        )}

        {resendStatus && (
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-electric-indigo text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">info</span>
            <span>{resendStatus}</span>
          </div>
        )}

        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              <span>Panel de Organizador</span>
              <span>•</span>
              <span className="text-electric-indigo">{user?.organizerName || 'Mi Productora'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-deep-slate tracking-tight">
              Crear Nuevo Evento
            </h1>
          </div>
        </div>

        {feedbackError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-lg flex-shrink-0">error</span>
            <span>{feedbackError}</span>
          </div>
        )}

        {/* FORMULARIO PRINCIPAL */}
        <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/30 p-6 sm:p-10 space-y-8">
          
          {/* SECCIÓN 1: DETALLES GENERALES */}
          <div>
            <h3 className="text-base font-bold text-deep-slate border-b border-surface-variant/40 pb-3 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-electric-indigo">info</span>
              <span>1. Información General</span>
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Festival Selva Central en Vivo 2026"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                    URL Banner / Flyer (Imagen)
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://ejemplo.com/flyer.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Descripción o Sinopsis del Evento
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la experiencia, bandas invitadas, dress code, etc."
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: FECHA Y LUGAR */}
          <div>
            <h3 className="text-base font-bold text-deep-slate border-b border-surface-variant/40 pb-3 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-electric-indigo">calendar_month</span>
              <span>2. Fecha y Ubicación</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Hora de Apertura *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Departamento / Región
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ej: Lima, Ucayali"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Distrito
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ej: Miraflores, Pucallpa"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Local / Recinto *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Explanada Ferial"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                Dirección Exacta
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. Yarinacocha Km 4.5"
                className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
              />
            </div>
          </div>

          {/* SECCIÓN 3: ENTRADAS Y PRECIOS */}
          <div>
            <h3 className="text-base font-bold text-deep-slate border-b border-surface-variant/40 pb-3 mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-electric-indigo">confirmation_number</span>
              <span>3. Entradas y Aforo Inicial</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Precio de la Entrada General (S/.) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej: 50.00"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Ingresa 0 si el evento es de ingreso libre.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-slate uppercase tracking-wider mb-2">
                  Aforo / Capacidad Total *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej: 500"
                  className="w-full px-4 py-3 rounded-xl bg-surface-gray border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-electric-indigo"
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Cantidad máxima de tickets disponibles para venta.
                </p>
              </div>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-6 border-t border-surface-variant/40 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-on-surface-variant hover:text-deep-slate transition-colors"
            >
              Volver a la cartelera
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-surface-gray hover:bg-slate-200 text-deep-slate text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Guardar Borrador
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="w-full sm:w-auto qph-btn-primary px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    <span>Publicar Evento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL PLAN B: AVISO AL INTENTAR PUBLICAR SIN CORREO VERIFICADO */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-outline-variant/20 space-y-5 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-deep-slate tracking-tight mb-2">
                ¡Tu evento está guardado como borrador! 🎟️
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Para ponerlo a la venta al público y activar la compra de entradas, por favor confirma el enlace que enviamos a tu correo:
              </p>
              <p className="text-xs font-bold text-deep-slate mt-1.5 bg-surface-gray py-1.5 px-3 rounded-lg inline-block">
                {user?.email}
              </p>
            </div>

            {resendStatus && (
              <p className="text-xs font-semibold text-electric-indigo bg-indigo-50 p-2.5 rounded-xl">
                {resendStatus}
              </p>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResendingEmail}
                className="w-full qph-btn-primary py-3 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isResendingEmail ? 'Reenviando...' : 'Reenviar Correo de Confirmación'}
              </button>

              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="w-full py-2.5 text-xs font-bold text-on-surface-variant hover:text-deep-slate transition-colors cursor-pointer"
              >
                Continuar editando borrador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

