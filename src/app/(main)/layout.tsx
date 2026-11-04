import React, { Suspense } from "react";
import Link from "next/link";
import { DesktopHeader } from "../common/components/desktop-header";
import { MobileBottomNav } from "../common/components/mobile-bottom-nav";

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
          <img alt="queplaneshoy logo" className="w-8 h-8 rounded-md object-contain" src="/logo-qph.svg"/>
          <span className="font-extrabold text-xl tracking-tight text-deep-slate">
            queplanes<span className="text-electric-indigo">hoy</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high/50 rounded-lg transition-all">favorite</button>
          <a href="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 cursor-pointer">
            <img
              alt="Avatar de usuario"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnqXVnsmBrHy9Kd7cWWb0PaButWFj7ieVvda4KQ6Gzku7NMPcNGxi_Cq2UC1DSwk2r8_qL2ZzWM5Lq_9BFFEpeMNF11zZiUQtr4JjMsCuraW_kcZXdxL4ftivhWz3SLrtagNNngRrHMt2Gwg553z8hX80YVC9_BRRQrviCyXSypPSe4atADFZpigLRh7RNFotpC4cdb05tB9_JhjTFs4nsISy6vQFzA78k7jIKy4CTPzUqYunCJ3yBvoR8hOOwXModWn6WconFu2O9"
            />
          </a>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="hidden md:block bg-deep-slate text-surface-container-lowest w-full border-t border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full px-8 py-16 max-w-container-max mx-auto">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
              <span className="font-extrabold text-xl tracking-tight text-white">
                queplanes<span className="text-electric-indigo">hoy</span>
              </span>
            </div>
            <p className="qph-body-md text-platinum-silver">
              Tu puerta de acceso a las experiencias más exclusivas de entretenimiento. Siente la vida en cada evento.
            </p>
          </div>

          {/* Column 2: Explorar Links */}
          <div>
            <h4 className="qph-label-bold mb-6 text-white uppercase tracking-wider">
              Explorar
            </h4>
            <ul className="space-y-4">
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Categorías
                </a>
              </li>
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Eventos de Hoy
                </a>
              </li>
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Cerca de ti
                </a>
              </li>
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Promociones
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Soporte Links */}
          <div>
            <h4 className="qph-label-bold mb-6 text-white uppercase tracking-wider">
              Soporte
            </h4>
            <ul className="space-y-4">
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Privacidad
                </a>
              </li>
              <li>
                <a className="qph-body-md text-platinum-silver hover:text-white transition-colors duration-200 hover:underline" href="#">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Links */}
          <div>
            <h4 className="qph-label-bold mb-6 text-white uppercase tracking-wider">
              Síguenos
            </h4>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full border border-platinum-silver/30 flex items-center justify-center text-platinum-silver hover:bg-electric-indigo hover:text-white hover:border-electric-indigo transition-all duration-300"
                href="#"
                aria-label="Compartir"
              >
                <span className="material-symbols-outlined text-sm">share</span>
              </a>
              <a
                className="w-10 h-10 rounded-full border border-platinum-silver/30 flex items-center justify-center text-platinum-silver hover:bg-electric-indigo hover:text-white hover:border-electric-indigo transition-all duration-300"
                href="#"
                aria-label="Web pública"
              >
                <span className="material-symbols-outlined text-sm">public</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Footer Info */}
        <div className="max-w-container-max mx-auto px-8 py-8 border-t border-platinum-silver/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="qph-body-md text-platinum-silver opacity-80">
            © 2024 queplaneshoy Ticketing. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 qph-label-bold text-platinum-silver opacity-80">
            <span>VISA</span>
            <span>MASTERCARD</span>
            <span>PAYPAL</span>
          </div>
        </div>

      </footer>

      {/* Bottom Navigation Bar - Mobile con Buscador a Pantalla Completa en Botón Central */}
      <MobileBottomNav />
    </>
  );
}
