'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUserUseCase, logoutUseCase } from '../../features/auth';
import { UserModel } from '../../features/auth/models/user.model';

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentUserUseCase.execute().match(
      (currentUser) => {
        if (active) {
          setUser(currentUser);
          setIsLoading(false);
        }
      },
      (error) => {
        if (active) {
          console.warn('Usuario no autenticado, redirigiendo a login...');
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [pathname, router]);

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

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background">
        <span className="material-symbols-outlined animate-spin text-[40px] text-electric-indigo">refresh</span>
        <p className="text-on-surface-variant font-semibold">Cargando tu cuenta...</p>
      </div>
    );
  }

  const isTabActive = (path: string) => pathname === path;

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="max-w-container-max mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6 border border-outline-variant/20">
              
              {/* Profile Overview */}
              <div className="text-center border-b border-outline-variant/10 pb-6 mb-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-gray mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img className="w-full h-full object-cover" src={user.avatarUrl} alt="Avatar" />
                  ) : (
                    <span className="material-symbols-outlined text-[48px] text-platinum-silver">person</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-deep-slate leading-tight">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1 truncate">
                  {user?.email}
                </p>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1">
                <a
                  href="/profile/tickets"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isTabActive('/profile/tickets')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isTabActive('/profile/tickets') ? "'FILL' 1" : "'FILL' 0" }}>
                    confirmation_number
                  </span>
                  <span>Mis entradas</span>
                </a>

                <a
                  href="/profile/favorites"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isTabActive('/profile/favorites')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isTabActive('/profile/favorites') ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                  <span>Mis favoritos</span>
                </a>

                <a
                  href="/profile/settings"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isTabActive('/profile/settings')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isTabActive('/profile/settings') ? "'FILL' 1" : "'FILL' 0" }}>
                    person_settings
                  </span>
                  <span>Mis datos y ajustes</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-error hover:bg-error-container/20 transition-all duration-200 mt-8 text-left w-full"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                  <span>Cerrar sesión</span>
                </button>
              </nav>

            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
