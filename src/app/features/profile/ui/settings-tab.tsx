'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserModel } from '../../auth/models/user.model';
import { updateProfileUseCase, changePasswordUseCase, logoutUseCase } from '../../auth';

interface SettingsTabProps {
  user: UserModel;
  onUserUpdate: (updatedUser: UserModel) => void;
}

export default function SettingsTab({ user, onUserUpdate }: SettingsTabProps) {
  const router = useRouter();

  // Estados de edición de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone || '');
  const [organizerName, setOrganizerName] = useState(user.organizerName || '');
  const [organizerDocumentType, setOrganizerDocumentType] = useState(user.organizerDocumentType || 'RUC');
  const [organizerDocumentNumber, setOrganizerDocumentNumber] = useState(user.organizerDocumentNumber || '');
  const [organizerPhone, setOrganizerPhone] = useState(user.organizerPhone || user.phone || '');
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState(user.organizerLogoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Estados de preferencias de comunicación
  const [artistNews, setArtistNews] = useState(true);
  const [presaleAlerts, setPresaleAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [preferenceFeedback, setPreferenceFeedback] = useState<string | null>(null);

  // Modal para opciones secundarias de móvil
  const [secondaryModalInfo, setSecondaryModalInfo] = useState<{ title: string; desc: string } | null>(null);

  const showFeedback = (msg: string) => {
    setPreferenceFeedback(msg);
    setTimeout(() => {
      setPreferenceFeedback(null);
    }, 2500);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    updateProfileUseCase
      .execute({
        firstName,
        lastName,
        phone,
        organizerName: organizerName.trim() || undefined,
        organizerDocumentType: organizerDocumentType || undefined,
        organizerDocumentNumber: organizerDocumentNumber.trim() || undefined,
        organizerPhone: organizerPhone.trim() || undefined,
        organizerLogoUrl: organizerLogoUrl.trim() || undefined,
      })
      .match(
        (updatedUser) => {
          setIsSaving(false);
          setIsEditing(false);
          setSaveSuccess(true);
          onUserUpdate(updatedUser);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
        (error) => {
          setIsSaving(false);
          alert(error.message || 'No se pudo guardar la información personal.');
        }
      );
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPassword !== confirmPassword) {
      setPassError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword === oldPassword) {
      setPassError('La nueva contraseña debe ser diferente a la contraseña actual');
      return;
    }

    setIsChangingPass(true);

    changePasswordUseCase.execute(oldPassword, newPassword).match(
      () => {
        setIsChangingPass(false);
        setPassSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPassSuccess(false);
          setShowPasswordModal(false);
        }, 2000);
      },
      (error) => {
        setIsChangingPass(false);
        setPassError(error.message || 'Error al cambiar la contraseña.');
      }
    );
  };

  const handleLogout = () => {
    logoutUseCase.execute().match(
      () => {
        router.push('/');
        router.refresh();
      },
      (error) => {
        alert('Error al cerrar sesión: ' + error.message);
      }
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Toast de preferencia actualizada */}
      {preferenceFeedback && (
        <div className="fixed top-24 right-6 z-50 bg-deep-slate text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-electric-indigo text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{preferenceFeedback}</span>
        </div>
      )}

      {/* Mobile Welcome & Shortcuts Section (Visible sólo en Mobile) */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-deep-slate tracking-tight">
              Hola, {firstName || user.firstName}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Gestiona tus eventos y ajustes de cuenta.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-error/25 bg-error/5 text-error font-bold text-xs hover:bg-error/10 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Salir</span>
          </button>
        </div>

        {/* Shortcut Cards Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Link
            href="/profile/tickets"
            className="rounded-2xl border border-surface-variant shadow-xs bg-white p-4 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-electric-indigo/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-electric-indigo/10 flex items-center justify-center text-electric-indigo flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  confirmation_number
                </span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-base text-deep-slate leading-tight">Mis entradas</span>
                <span className="text-xs text-on-surface-variant">Códigos QR y descarga PDF</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-platinum-silver group-hover:text-electric-indigo transition-colors text-[20px]">
              chevron_right
            </span>
          </Link>

          <Link
            href="/profile/favorites"
            className="rounded-2xl border border-surface-variant shadow-xs bg-white p-4 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-electric-indigo/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-container/40 flex items-center justify-center text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-base text-deep-slate leading-tight">Mis favoritos</span>
                <span className="text-xs text-on-surface-variant">Eventos y planes guardados</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-platinum-silver group-hover:text-electric-indigo transition-colors text-[20px]">
              chevron_right
            </span>
          </Link>

          <Link
            href="/organizer/events"
            className="sm:col-span-2 rounded-2xl border border-surface-variant shadow-xs bg-white p-4 flex items-center justify-between group active:scale-[0.99] transition-all hover:border-electric-indigo/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">
                  storefront
                </span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="block font-bold text-base text-deep-slate leading-tight">Mis eventos</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[10px] uppercase">
                    Organizador
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant">Gestión de taquilla y aforo en vivo</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-platinum-silver group-hover:text-electric-indigo transition-colors text-[20px]">
              chevron_right
            </span>
          </Link>
        </div>
      </div>

      {/* SECCIÓN 1: Mis datos */}
      <section className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-surface-variant">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b border-surface-variant/40 pb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-deep-slate">Mis datos</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Gestiona tu información personal y cómo te contactamos.
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="self-start sm:self-auto bg-surface-gray text-electric-indigo font-bold px-6 py-2.5 rounded-xl hover:bg-electric-indigo hover:text-white transition-all duration-300 border border-surface-variant/40 hover:border-electric-indigo text-sm"
            >
              Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFirstName(user.firstName);
                  setLastName(user.lastName);
                  setPhone(user.phone || '');
                }}
                className="bg-gray-100 text-on-surface-variant font-bold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProfileSave}
                disabled={isSaving}
                className="bg-electric-indigo text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary transition-all text-sm flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>}
                <span>Guardar cambios</span>
              </button>
            </div>
          )}
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200 flex items-center gap-2 font-semibold animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>¡Tu perfil se ha actualizado correctamente en la base de datos!</span>
          </div>
        )}

        {!isEditing ? (
          /* Modo Vista - Sincronizado con Base de Datos */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Nombre completo
              </label>
              <div className="text-base font-semibold text-deep-slate py-2.5 border-b border-surface-variant/40">
                {firstName} {lastName}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="text-base font-semibold text-deep-slate py-2.5 border-b border-surface-variant/40 flex items-center justify-between">
                <span>{user.email}</span>
                {user.emailVerifiedAt ? (
                  <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Verificado</span>
                  </span>
                ) : (
                  <Link
                    href="/verify-email"
                    className="text-amber-700 font-bold text-xs flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">pending</span>
                    <span>Pendiente de verificación</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Teléfono / Celular
              </label>
              <div className="text-base font-semibold text-deep-slate py-2.5 border-b border-surface-variant/40">
                {phone || <span className="text-platinum-silver italic font-normal">No especificado</span>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Tipo de Cuenta
              </label>
              <div className="text-base font-semibold text-deep-slate py-2.5 border-b border-surface-variant/40 flex items-center gap-2">
                <span className="capitalize">{user.isOrganizer ? 'Organizador / Promotor' : 'Comprador'}</span>
                <span className="text-[11px] font-bold text-electric-indigo bg-electric-indigo/10 px-2 py-0.5 rounded-full">
                  {user.role === 'admin' ? 'Administrador' : 'Estándar'}
                </span>
              </div>
            </div>

            {/* Datos Comerciales de la Productora (Si es Organizador) */}
            <div className="space-y-1 md:col-span-2 pt-2 border-t border-surface-variant/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-electric-indigo text-[20px]">badge</span>
                <h4 className="font-bold text-sm text-deep-slate">Perfil Comercial de Productora / Organizador</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface-gray/50 p-4 rounded-xl border border-surface-variant/60">
                <div>
                  <span className="text-xs text-on-surface-variant font-medium block">Razón Social / Productora:</span>
                  <strong className="text-sm text-deep-slate">{organizerName || 'No registrada'}</strong>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant font-medium block">Documento Fiscal:</span>
                  <strong className="text-sm text-deep-slate">
                    {organizerDocumentType} {organizerDocumentNumber || 'No especificado'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant font-medium block">Contacto Comercial:</span>
                  <strong className="text-sm text-deep-slate">{organizerPhone || phone || 'No especificado'}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Modo Formulario de Edición */
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Nombre
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Apellidos
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-surface-variant/40 bg-surface-gray text-on-surface-variant cursor-not-allowed font-medium text-sm"
                  value={user.email}
                />
                {user.emailVerifiedAt ? (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Verificado</span>
                  </span>
                ) : (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">pending</span>
                    <span>Sin verificar</span>
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Teléfono / Celular Personal
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                maxLength={30}
              />
            </div>

            {/* Campos de Edición de Productora / Organizador */}
            <div className="space-y-4 md:col-span-2 pt-4 border-t border-surface-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-electric-indigo text-[20px]">badge</span>
                <h4 className="font-bold text-sm text-deep-slate">Datos de Productora / Organizador</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Razón Social o Nombre Comercial
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="Ej. Selva Central Producciones SAC"
                    maxLength={150}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2 col-span-1">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Tipo Doc.
                    </label>
                    <select
                      className="w-full px-3 py-3 rounded-xl border border-surface-variant bg-white text-deep-slate outline-none focus:border-electric-indigo text-sm font-semibold"
                      value={organizerDocumentType}
                      onChange={(e) => setOrganizerDocumentType(e.target.value)}
                    >
                      <option value="RUC">RUC</option>
                      <option value="DNI">DNI</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Número Fiscal
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                      value={organizerDocumentNumber}
                      onChange={(e) => setOrganizerDocumentNumber(e.target.value)}
                      placeholder="20601234567"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Teléfono / WhatsApp Comercial
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                    value={organizerPhone}
                    onChange={(e) => setOrganizerPhone(e.target.value)}
                    placeholder="+51 987 654 321"
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    URL Logo Productora (Opcional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 rounded-xl border border-surface-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate outline-none transition-all text-sm"
                    value={organizerLogoUrl}
                    onChange={(e) => setOrganizerLogoUrl(e.target.value)}
                    placeholder="https://cdn.queplaneshoy.com/organizers/logo.png"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* SECCIÓN 2: Seguridad y Acceso */}
      <section className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-surface-variant">
        <div className="flex items-center gap-3 mb-6 border-b border-surface-variant/40 pb-4">
          <span className="material-symbols-outlined text-electric-indigo text-[26px]">security</span>
          <h2 className="text-xl md:text-2xl font-bold text-deep-slate">Seguridad y Acceso</h2>
        </div>

        <div className="space-y-4">
          {/* Card Contraseña */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-surface-gray/60 border border-surface-variant/70">
            <div className="flex items-center gap-4">
              <div className="bg-white w-12 h-12 rounded-full shadow-xs flex items-center justify-center text-on-surface-variant flex-shrink-0 border border-surface-variant/40">
                <span className="material-symbols-outlined text-[24px]">lock_reset</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-deep-slate">Contraseña</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Actualiza tu contraseña periódicamente para mantener segura tu cuenta
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="bg-electric-indigo text-white font-bold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-electric-indigo/20 active:scale-95 transition-all w-full md:w-auto text-center cursor-pointer"
            >
              Cambiar contraseña
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: Preferencias de comunicación */}
      <section className="bg-white rounded-2xl shadow-xs p-6 md:p-8 border border-surface-variant">
        <h2 className="text-xl md:text-2xl font-bold text-deep-slate mb-6">
          Preferencias de comunicación
        </h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer group py-1">
            <span className="text-sm font-medium text-deep-slate group-hover:text-electric-indigo transition-colors select-none pr-4">
              Recibir novedades sobre mis artistas favoritos
            </span>
            <input
              type="checkbox"
              checked={artistNews}
              onChange={(e) => {
                setArtistNews(e.target.checked);
                showFeedback(e.target.checked ? 'Notificaciones de artistas activadas' : 'Notificaciones de artistas desactivadas');
              }}
              className="w-5 h-5 rounded-md border-surface-variant text-electric-indigo focus:ring-electric-indigo cursor-pointer transition-all"
            />
          </label>

          <div className="h-px bg-surface-variant/50 w-full" />

          <label className="flex items-center justify-between cursor-pointer group py-1">
            <span className="text-sm font-medium text-deep-slate group-hover:text-electric-indigo transition-colors select-none pr-4">
              Alertas de preventa y descuentos exclusivos
            </span>
            <input
              type="checkbox"
              checked={presaleAlerts}
              onChange={(e) => {
                setPresaleAlerts(e.target.checked);
                showFeedback(e.target.checked ? 'Alertas de preventa activadas' : 'Alertas de preventa desactivadas');
              }}
              className="w-5 h-5 rounded-md border-surface-variant text-electric-indigo focus:ring-electric-indigo cursor-pointer transition-all"
            />
          </label>

          <div className="h-px bg-surface-variant/50 w-full" />

          <label className="flex items-center justify-between cursor-pointer group py-1">
            <span className="text-sm font-medium text-deep-slate group-hover:text-electric-indigo transition-colors select-none pr-4">
              Resumen semanal de eventos recomendados
            </span>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => {
                setWeeklyDigest(e.target.checked);
                showFeedback(e.target.checked ? 'Resumen semanal activado' : 'Resumen semanal desactivado');
              }}
              className="w-5 h-5 rounded-md border-surface-variant text-electric-indigo focus:ring-electric-indigo cursor-pointer transition-all"
            />
          </label>
        </div>
      </section>

      {/* Opciones Secundarias y Cerrar Sesión (Visible sólo en Mobile) */}
      <div className="lg:hidden space-y-4 pt-2">
        <div className="rounded-2xl border border-surface-variant shadow-xs bg-white overflow-hidden divide-y divide-surface-variant/40">
          <button
            onClick={() => setSecondaryModalInfo({
              title: 'Métodos de pago',
              desc: 'Tienes 1 tarjeta Visa terminada en •••• 4242 asociada como método principal de pago para compras rápidas.',
            })}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-gray transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">payments</span>
              <span className="text-sm font-bold text-deep-slate">Métodos de pago</span>
            </div>
            <span className="material-symbols-outlined text-platinum-silver text-[20px]">chevron_right</span>
          </button>

          <button
            onClick={() => setSecondaryModalInfo({
              title: 'Preferencias de avisos',
              desc: 'Tus canales activos de notificación son Correo electrónico y Notificaciones push en tu navegador.',
            })}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-gray transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications_active</span>
              <span className="text-sm font-bold text-deep-slate">Preferencias de avisos</span>
            </div>
            <span className="material-symbols-outlined text-platinum-silver text-[20px]">chevron_right</span>
          </button>

          <button
            onClick={() => setSecondaryModalInfo({
              title: 'Privacidad y Seguridad',
              desc: 'Tu cuenta cumple con el estándar RGPD. Ningún dato sensible es compartido con terceras partes no autorizadas.',
            })}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-gray transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">security</span>
              <span className="text-sm font-bold text-deep-slate">Privacidad</span>
            </div>
            <span className="material-symbols-outlined text-platinum-silver text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Botón Logout Mobile */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl border-2 border-error/25 bg-white text-error font-bold text-sm hover:bg-error/5 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* MODAL: Cambio de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-deep-slate/50 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-surface-variant animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-deep-slate">Cambiar contraseña</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPassError(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-gray text-on-surface-variant hover:text-deep-slate transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {passError && (
              <div className="mb-4 p-3 bg-red-50 text-error text-xs rounded-xl border border-red-200 font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-800 text-xs rounded-xl border border-green-200 flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>¡Contraseña cambiada con éxito!</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-surface-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-surface-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all text-sm"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-surface-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all text-sm"
                  placeholder="Repite la nueva contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass || passSuccess}
                className="w-full bg-electric-indigo text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/20 active:scale-[0.98] transition-all hover:bg-primary-container mt-6 text-sm"
              >
                {isChangingPass ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <span>Guardar contraseña</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Info Opciones Secundarias Móviles */}
      {secondaryModalInfo && (
        <div className="fixed inset-0 bg-deep-slate/50 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-surface-variant animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-deep-slate mb-2">{secondaryModalInfo.title}</h3>
            <p className="text-sm text-on-surface-variant mb-6">{secondaryModalInfo.desc}</p>
            <button
              onClick={() => setSecondaryModalInfo(null)}
              className="w-full bg-electric-indigo text-white font-bold py-3 rounded-xl hover:bg-primary transition-all text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
