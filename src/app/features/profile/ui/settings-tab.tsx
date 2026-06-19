'use client';

import React, { useState } from 'react';
import { UserModel } from '../../auth/models/user.model';
import { updateProfileUseCase, changePasswordUseCase } from '../../auth';

interface SettingsTabProps {
  user: UserModel;
  onUserUpdate: (updatedUser: UserModel) => void;
}

export default function SettingsTab({ user, onUserUpdate }: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState('Madrid, España'); // valor estático para demo
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

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    updateProfileUseCase
      .execute({
        firstName,
        lastName,
        phone,
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Información Personal */}
      <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-outline-variant/20">
        <div className="flex items-center justify-between mb-8 border-b border-outline-variant/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-deep-slate">Mis datos</h2>
            <p className="text-sm text-on-surface-variant mt-1">Gestiona tu información personal y cómo te contactamos.</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-surface-gray text-electric-indigo font-bold px-6 py-2.5 rounded-xl hover:bg-electric-indigo hover:text-white transition-all duration-300 border border-transparent hover:border-electric-indigo"
            >
              Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
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
                onClick={handleProfileSave}
                disabled={isSaving}
                className="bg-electric-indigo text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary transition-all text-sm flex items-center gap-2"
              >
                {isSaving && <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>}
                <span>Guardar</span>
              </button>
            </div>
          )}
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 text-sm rounded-lg border border-green-200 flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined">check_circle</span>
            <span>¡Tu perfil se ha actualizado correctamente!</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                isEditing
                  ? 'border-outline-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate'
                  : 'border-transparent bg-gray-50 text-on-surface-variant cursor-not-allowed'
              }`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Apellidos</label>
            <input
              type="text"
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                isEditing
                  ? 'border-outline-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate'
                  : 'border-transparent bg-gray-50 text-on-surface-variant cursor-not-allowed'
              }`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Correo electrónico</label>
            <div className="relative">
              <input
                type="email"
                disabled
                className="w-full px-4 py-3 rounded-lg border border-transparent bg-gray-50 text-on-surface-variant cursor-not-allowed font-medium"
                value={user.email}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Verificado</span>
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Teléfono</label>
            <input
              type="tel"
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                isEditing
                  ? 'border-outline-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate'
                  : 'border-transparent bg-gray-50 text-on-surface-variant cursor-not-allowed'
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Añadir número"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ciudad / Región</label>
            <input
              type="text"
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                isEditing
                  ? 'border-outline-variant focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo bg-white text-deep-slate'
                  : 'border-transparent bg-gray-50 text-on-surface-variant cursor-not-allowed'
              }`}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </form>
      </section>

      {/* Seguridad y Acceso */}
      <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/10 pb-4">
          <span className="material-symbols-outlined text-electric-indigo">security</span>
          <h2 className="text-xl font-bold text-deep-slate">Seguridad y Acceso</h2>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-gray border border-outline-variant/10">
          <div className="flex gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">lock_reset</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-deep-slate">Contraseña</h3>
              <p className="text-xs text-on-surface-variant mt-1">Actualiza tu clave de acceso periódicamente.</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-electric-indigo text-white font-semibold text-sm px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-electric-indigo/20 active:scale-95 transition-all w-full md:w-auto"
          >
            Cambiar contraseña
          </button>
        </div>
      </section>

      {/* Modal Cambio de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-deep-slate/50 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
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
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-gray text-on-surface-variant hover:text-deep-slate"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {passError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-lg border border-red-200 font-medium">
                {passError}
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 text-xs rounded-lg border border-green-200 flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>¡Contraseña cambiada con éxito!</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Contraseña actual</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                  placeholder="••••••••"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nueva contraseña</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                  placeholder="Repite la nueva contraseña"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass || passSuccess}
                className="w-full bg-electric-indigo text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/20 active:scale-[0.98] transition-all hover:bg-primary-container mt-6"
              >
                {isChangingPass ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
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

    </div>
  );
}
