"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "../services/api-client";
import { logoutUseCase } from "../../features/auth";
import { SearchInstantDropdown } from "../../features/events/ui/components/search-instant-dropdown";

function DesktopHeaderFallback() {
  return (
    <header className="hidden md:block w-full sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 sm:px-8 lg:px-12 h-20 gap-4">
        <Link href="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
          <span className="font-extrabold text-xl tracking-tight text-deep-slate">
            queplanes<span className="text-electric-indigo">hoy</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function DesktopHeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category")
      ? searchParams.get("category")!.charAt(0).toUpperCase() + searchParams.get("category")!.slice(1)
      : "Todas"
  );

  const isHome = pathname === "/";
  // En rutas internas (/events, detalle, profile, checkout) la búsqueda siempre está visible.
  // En el home se muestra solo cuando el scroll topa con la barra de búsqueda del hero.
  const shouldShowSearch = !isHome || isSearchSticky;

  useEffect(() => {
    const hasToken = !!apiClient.getToken();
    setIsAuthenticated(hasToken);
    if (hasToken && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("qph_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserData({
            name: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() || parsed.email,
            email: parsed.email,
          });
        }
      } catch {
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUseCase.execute().match(
      () => {
        setIsAuthenticated(false);
        setUserData(null);
        setIsUserMenuOpen(false);
        router.push("/");
        router.refresh();
      },
      () => {
        apiClient.clearToken();
        setIsAuthenticated(false);
        router.push("/");
      }
    );
  };

  useEffect(() => {
    if (!isHome) {
      setIsSearchSticky(false);
      return;
    }

    const checkScroll = () => {
      const searchSection = document.getElementById("hero-search-container");
      if (searchSection) {
        const rect = searchSection.getBoundingClientRect();
        // Se activa cuando la parte superior de la sección de búsqueda topa el header (80px)
        setIsSearchSticky(rect.top <= 80);
      } else {
        setIsSearchSticky(window.scrollY > 360);
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, [isHome]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (selectedCategory && selectedCategory !== "Todas") {
      params.set("category", selectedCategory.toLowerCase());
    }
    const queryStr = params.toString();
    router.push(`/events${queryStr ? `?${queryStr}` : ""}`);
  };

  return (
    <header className="hidden md:block w-full sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-sm border-b border-outline-variant/10 transition-colors duration-300">
      <div className="flex justify-between items-center w-full px-6 sm:px-8 lg:px-12 h-20 gap-4">
        
        {/* Brand Logo (Izquierda) */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0">
          <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
          <span className="font-extrabold text-xl tracking-tight text-deep-slate">
            queplanes<span className="text-electric-indigo">hoy</span>
          </span>
        </Link>

        {/* Zona Central: Buscador Instantáneo Sticky o Despejado en Home */}
        <div className="flex-1 flex justify-center items-center max-w-2xl px-2">
          {shouldShowSearch && (
            <div className="w-full transition-all duration-300 animate-in fade-in">
              <SearchInstantDropdown
                initialQuery={searchQuery}
                initialCategory={selectedCategory}
                placeholder="Buscar eventos, artistas o locales..."
              />
            </div>
          )}
        </div>

        {/* Actions (Derecha) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/profile/favorites" className="qph-btn-watchlist hidden lg:flex cursor-pointer">
            <span className="material-symbols-outlined text-lg">favorite</span>
            <span>Lista de seguimiento</span>
          </Link>

          <Link
            href="/organizer/events/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-electric-indigo bg-indigo-50/90 hover:bg-electric-indigo hover:text-white border border-indigo-200/90 hover:border-electric-indigo shadow-xs hover:shadow-md hover:shadow-electric-indigo/20 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Crear Evento</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Abrir menú de usuario"
                className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 cursor-pointer hover:ring-2 hover:ring-electric-indigo transition-all flex-shrink-0 flex items-center justify-center"
              >
                <img
                  alt="Avatar de usuario"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnqXVnsmBrHy9Kd7cWWb0PaButWFj7ieVvda4KQ6Gzku7NMPcNGxi_Cq2UC1DSwk2r8_qL2ZzWM5Lq_9BFFEpeMNF11zZiUQtr4JjMsCuraW_kcZXdxL4ftivhWz3SLrtagNNngRrHMt2Gwg553z8hX80YVC9_BRRQrviCyXSypPSe4atADFZpigLRh7RNFotpC4cdb05tB9_JhjTFs4nsISy6vQFzA78k7jIKy4CTPzUqYunCJ3yBvoR8hOOwXModWn6WconFu2O9"
                />
              </button>

              {/* Menú Desplegable de Usuario */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-surface-variant p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {userData && (
                    <div className="px-3 py-2.5 border-b border-surface-variant/40 mb-1">
                      <p className="text-xs font-bold text-deep-slate truncate">{userData.name || "Mi Cuenta"}</p>
                      {userData.email && (
                        <p className="text-[11px] text-on-surface-variant truncate">{userData.email}</p>
                      )}
                    </div>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-deep-slate hover:bg-surface-gray rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg text-platinum-silver">person</span>
                    <span>Mi Perfil</span>
                  </Link>

                  <Link
                    href="/profile/tickets"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-deep-slate hover:bg-surface-gray rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg text-platinum-silver">confirmation_number</span>
                    <span>Mis Entradas</span>
                  </Link>

                  <Link
                    href="/profile/favorites"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-deep-slate hover:bg-surface-gray rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg text-platinum-silver">favorite</span>
                    <span>Mis Favoritos</span>
                  </Link>

                  <div className="border-t border-surface-variant/40 my-1"></div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-semibold text-deep-slate hover:text-electric-indigo transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="qph-btn-primary text-xs py-2 px-4 shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function DesktopHeader() {
  return (
    <Suspense fallback={<DesktopHeaderFallback />}>
      <DesktopHeaderContent />
    </Suspense>
  );
}


