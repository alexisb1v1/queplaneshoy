import React, { Suspense } from "react";
import Link from "next/link";
import { DesktopHeader } from "../common/components/desktop-header";
import { MobileBottomNav } from "../common/components/mobile-bottom-nav";
import { GlobalFooter } from "../common/components/global-footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Header (TopNavBar) - Desktop con reemplazo dinámico de categorías por buscador en scroll */}
      <Suspense fallback={null}>
        <DesktopHeader />
      </Suspense>

      {/* Header (TopNavBar) - Mobile (Stitch Style) */}
      <header className="qph-mobile-header md:hidden bg-white sticky top-0 z-50 h-16 flex items-center px-4 justify-between transition-all duration-300 shadow-sm border-b border-outline-variant/5">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <img alt="queplanhoy logo" className="w-8 h-8 rounded-md object-contain" src="/logo-qph.svg"/>
          <span className="font-extrabold text-xl tracking-tight text-deep-slate">
            queplan<span className="text-electric-indigo">hoy</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/profile/favorites"
            aria-label="Mis Favoritos"
            className="flex items-center justify-center w-9 h-9 text-on-surface-variant hover:text-rose-600 hover:bg-surface-container-high/50 rounded-full transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">favorite</span>
          </Link>
          <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 cursor-pointer block">
            <img
              alt="Avatar de usuario"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnqXVnsmBrHy9Kd7cWWb0PaButWFj7ieVvda4KQ6Gzku7NMPcNGxi_Cq2UC1DSwk2r8_qL2ZzWM5Lq_9BFFEpeMNF11zZiUQtr4JjMsCuraW_kcZXdxL4ftivhWz3SLrtagNNngRrHMt2Gwg553z8hX80YVC9_BRRQrviCyXSypPSe4atADFZpigLRh7RNFotpC4cdb05tB9_JhjTFs4nsISy6vQFzA78k7jIKy4CTPzUqYunCJ3yBvoR8hOOwXModWn6WconFu2O9"
            />
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer Global Completo */}
      <GlobalFooter />

      {/* Bottom Navigation Bar - Mobile con Buscador a Pantalla Completa en Botón Central */}
      <MobileBottomNav />
    </>
  );
}
