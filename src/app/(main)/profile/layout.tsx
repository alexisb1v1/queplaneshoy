'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
      () => {
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
        <p className="text-on-surface-variant font-semibold text-sm">Cargando tu cuenta...</p>
      </div>
    );
  }

  const isSettingsActive = pathname === '/profile/settings' || pathname === '/profile';
  const isTabActive = (path: string) => {
    if (path === '/profile/settings') return isSettingsActive;
    return pathname === path;
  };

  const defaultAvatar =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD0WX7wdAbDny3NqD0b2ZPWtXnPzWCKC6yV8xZuW3kp4ubObYTPkigGWMYVnDEKgXoGmcZsSr_Lk2io_rmui84FLSFtatmRg5xpaHjyWjOXqnuuDHbt7pwlj119-eo50UMR7FyWBataGridEHgcqrhJtjw4H5NajgVfWS_7Y7clWQZqGdr2b0zDUW01MY-122_qcWml18oAzXHBm4ULRShkh9CSGyiZhff8VIWuNbVaZW_EoH5Y_93_DqG0X1r6Y9AnhgD15hG9wAxs';

  return (
    <div className="bg-surface min-h-screen py-6 md:py-10">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Barra de pestañas móvil cuando se está en /profile/tickets, /profile/favorites, etc. */}
        {!isSettingsActive && (
          <div className="lg:hidden mb-6 flex items-center justify-between bg-white rounded-2xl border border-surface-variant p-1.5 shadow-xs gap-1">
            <Link
              href="/profile/settings"
              className="flex-1 py-2 text-center rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-gray transition-all"
            >
              Mis datos
            </Link>
            <Link
              href="/profile/tickets"
              className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all ${
                pathname === '/profile/tickets'
                  ? 'bg-electric-indigo text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-gray'
              }`}
            >
              Entradas
            </Link>
            <Link
              href="/profile/favorites"
              className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all ${
                pathname === '/profile/favorites'
                  ? 'bg-electric-indigo text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-gray'
              }`}
            >
              Favoritos
            </Link>
            <Link
              href="/organizer/events"
              className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all ${
                pathname.startsWith('/organizer')
                  ? 'bg-electric-indigo text-white shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-gray'
              }`}
            >
              Mis eventos
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xs p-6 flex flex-col gap-6 border border-surface-variant sticky top-28">
              
              {/* Profile Overview */}
              <div className="text-center border-b border-surface-variant/40 pb-6 mb-1">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-gray mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                  <img
                    className="w-full h-full object-cover"
                    src={user?.avatarUrl || defaultAvatar}
                    alt={`${user?.firstName} ${user?.lastName}`}
                  />
                </div>
                <h2 className="text-lg font-bold text-deep-slate leading-tight">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1 truncate">
                  {user?.email}
                </p>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1.5">
                <Link
                  href="/profile/tickets"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isTabActive('/profile/tickets')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isTabActive('/profile/tickets') ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    confirmation_number
                  </span>
                  <span>Mis entradas</span>
                </Link>

                <Link
                  href="/profile/favorites"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isTabActive('/profile/favorites')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isTabActive('/profile/favorites') ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  <span>Mis favoritos</span>
                </Link>

                <Link
                  href="/organizer/events"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    pathname.startsWith('/organizer')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: pathname.startsWith('/organizer') ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    storefront
                  </span>
                  <span>Mis eventos</span>
                </Link>

                <Link
                  href="/profile/settings"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isTabActive('/profile/settings')
                      ? 'bg-electric-indigo text-white shadow-md shadow-electric-indigo/25'
                      : 'text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isTabActive('/profile/settings') ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    manage_accounts
                  </span>
                  <span>Mis datos y ajustes</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-error hover:bg-error-container/20 transition-all duration-200 mt-6 text-left w-full cursor-pointer"
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
