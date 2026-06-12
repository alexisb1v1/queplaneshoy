"use client";

import React from "react";

export function WatchlistSection() {
  return (
    <section className="bg-surface-container-low py-section-gap">
      <div className="max-w-container-max mx-auto px-margin-x">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Lado Izquierdo: Información */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-electric-indigo"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="qph-label-bold text-electric-indigo uppercase tracking-widest">
                Lista de seguimiento
              </span>
            </div>
            <h2 className="qph-headline-lg text-deep-slate mb-4">
              No te pierdas tus favoritos
            </h2>
            <p className="qph-body-lg text-on-surface-variant max-w-md">
              Guarda los eventos que te interesan y recibe notificaciones exclusivas cuando las entradas estén a punto de agotarse o bajen de precio.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-deep-slate text-white rounded-xl qph-label-bold hover:bg-primary transition-all duration-200 cursor-pointer active:scale-98">
                Explorar Mi Lista
              </button>
              <button className="px-6 py-3 border border-outline text-on-surface rounded-xl qph-label-bold hover:bg-surface-container-high transition-all duration-200 cursor-pointer active:scale-98">
                Configurar Alertas
              </button>
            </div>
          </div>

          {/* Lado Derecho: Tarjetas de muestra rotadas */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {/* Tarjeta 1 */}
            <div className="bg-white p-4 rounded-2xl qph-soft-shadow rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr71UQlSs2FurLsTGl6gPOxEX9hPMWEvCnfbWa9DBE-cUs538DUDJOqNPrp58TlvmNywhioPq7t5zgFDtsHuWE1CaR7V00dAs7D9el7hAVDM4tkAzeIn0PsE5X6YDxY6_Bq4L6zeO0xj3VruNNUlS7xdsextrNrv0sZZibfkJdUzfS6VSn73BW3H1n_IxShci9L0Bdy-kTWkKaFQp4Fe8zsxvXK8SCd517vfmIyU2X_l2s0lNh_9KazuVBowqKJypvC64xoScIFOvS"
                  alt="Guitarra electrica en primer plano"
                />
              </div>
              <p className="qph-label-bold text-[12px] text-deep-slate truncate">
                Indie Rock Night
              </p>
              <p className="text-[10px] qph-label-bold text-outline uppercase tracking-wider">
                Quedan 5 entradas
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white p-4 rounded-2xl qph-soft-shadow -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer mt-8">
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXB93oW0na2DOhqsJ5TjBnMIU6EjJmDihjHS4kUCm4OrZO1Z81e_1Sbcl2IGm4ZsP-RdLGavzk4qQ07FsEhjFG5IHopKzVTljb2GcWy9n6kZwoAWZbn23Wrlb41K9HjYYlbE5VAF1Pdo7-2cjNRP4PdFhIvWlHY-YOEIq-Fp0dC2JzGTKeoBhCJGU0EUJBJmatpsEd-jh9fSAaLfaeh3bM4ODKnamCltzmb4A9D_zq87N8FausNfrFsek3Zefw8rzA5DXRBINUpHkS"
                  alt="Gente en festival al atardecer"
                />
              </div>
              <p className="qph-label-bold text-[12px] text-deep-slate truncate">
                Open Air Summer
              </p>
              <p className="text-[10px] qph-label-bold text-outline uppercase tracking-wider">
                Próximo viernes
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
