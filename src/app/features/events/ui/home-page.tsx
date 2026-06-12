"use client";

import React, { useState } from "react";
import { HeroCarousel } from "./components/hero-carousel";
import { SearchBar } from "./components/search-bar";
import { EventCard, EventCardProps } from "./components/event-card";
import { WatchlistSection } from "./components/watchlist-section";
import { CategoryBento } from "./components/category-bento";

const UPCOMING_EVENTS: EventCardProps[] = [
  {
    id: 1,
    title: "Echoes of Summer Tour",
    category: "concierto",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHVY15DpfYzyH93Hw8X7x6UctHW54DfefNOboWhdivHf-ScywQF8yBmZWwZGhiGpYGZPObwBdB0HhNC4pEZnP8E0ggFQrAUuGgZ5Pt1ZJtIL8iKH53j99jFUrpBx5XCCTcdg4gecQES56Shq1fcGEOo_CadQ4XUcav8DgBIjKH2I9CID9XcUNx8MQFd1jM3rm-pjAqVtYL2PTtnniP7DJJ1s1HHUwo0nCw-tUJGlIZKAFYpuZhruFXU-9jlaODrQMOoQu9Ym1XY4vB",
    altText: "DJ actuando en un concierto de música electrónica",
    date: "14 OCT, 2024",
    location: "MADRID",
    price: 45,
    ticketType: "General",
    ticketBadgeStyle: "general",
  },
  {
    id: 2,
    title: "Vanguardia Rítmica",
    category: "teatro",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuoyPDVeB3IC2Ys_pTmUILUys8yJCuWCU63CJXY5DrJFQU83axPRERE8hLyMZc-3dmCYxFzocnaE1G12OPO8u2ZStiTYJDIJbZ9w3lt9Dc5xFgpCSAN1b02av_9gIeSOiQ5_MtfHBfVTka2Vp83LnpBE58QZOESlDZedrNlXRueK5Vrfh4ulDgt4O0meMR6jckbR7kdgbNwdDRZIoRqUIuVsCFPA4HiqYRPBRoScR6Fw8jdGPRe7Ncix_NpbXpD4P2QwjWtvCgE0xR",
    altText: "Espectáculo de ballet moderno en un espacio vanguardista",
    date: "18 OCT, 2024",
    location: "BARCELONA",
    price: 75,
    ticketType: "VIP DISPONIBLE",
    ticketBadgeStyle: "vip",
  },
  {
    id: 3,
    title: "Masters Cup Series",
    category: "deportes",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUB9_XEEj_ZDdk8n2xiDLa-Cye5or9W5oDua9zxoskGxUBWVzQ0x8Vi4-Xp_ugA7aBh5VXnLPXCzPKZk8lJtlUrX2Rb0zDc8wmyipFF908z8FX2cP3alyD7yB-HEWc3Fnr7mk9pS7iAECvBW2yOER8HS_pGV-Mo8IXbSxMDr4XGPRYrrooWRFTFYJW75CtkDRwM7b6jtldK2GPLEUCIOJs-japi4u5cpa21KLX9oAl-ro8PelmCVkbImHrRcwTLVRISfaPXnfCB5mG",
    altText: "Partido de tenis al atardecer en pista profesional",
    date: "22 OCT, 2024",
    location: "VALENCIA",
    price: 120,
    ticketType: "PLATINUM",
    ticketBadgeStyle: "platinum",
  },
  {
    id: 4,
    title: "Sunset Jazz Session",
    category: "concierto",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEL4eAbOCJp6-HVuKFQOkbMfF-GhV54vep61KRoDFrbtebQRAySMLmjv3-Ue0Iv21MDOUAv2aN-ULaUFLLXhSzPqnfmC--4zwXhM7wfJwiUt7H8RlpCFMdkLd2YIQnDMqiP3REOOEGred7luLvCrTbFt3txZiYwjJwT0fvXKPkL3CHkNwOFMPB5_sCl7_tvS7tBgYHkyqhIjJyb02QMqw9cVmYBdLHGcqp4nYrRyX7sV-fB4iH9Tac13LGmL2aC_Djn2JBja3sSYFL",
    altText: "Festival de jazz al aire libre al atardecer",
    date: "30 OCT, 2024",
    location: "MADRID",
    price: 30,
    ticketType: "General",
    ticketBadgeStyle: "general",
  },
];

const FILTERS = ["Todos", "Esta Semana", "Cerca de ti", "Populares", "Gratis"];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeMobileFilter, setActiveMobileFilter] = useState("Todo");

  return (
    <>
      {/* VISTA MÓVIL (Stitch Style) */}
      <div className="block md:hidden bg-background min-h-screen pb-24 text-on-background">
        
        {/* Search Section */}
        <section className="px-4 py-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-platinum-silver">search</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest rounded-xl border-none shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-electric-indigo font-body-md transition-all text-on-surface outline-none"
              placeholder="¿Qué planes hoy?"
              type="text"
            />
            <button className="absolute inset-y-2 right-2 px-4 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer">
              Filtrar
            </button>
          </div>
        </section>

        {/* Featured Carousel (Vertical Oriented) */}
        <section className="mb-10">
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Destacados</h2>
            <a className="text-electric-indigo qph-label-bold" href="#">Ver todos</a>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory qph-hide-scrollbar px-4 gap-4 pb-4">
            
            {/* Carousel Item 1 */}
            <div className="min-w-[85%] snap-center rounded-xl overflow-hidden relative aspect-[3/4] shadow-lg group flex-none">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/20 to-transparent z-10"></div>
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0hjIajPExsJKa7RaHv4HoFjroTQmrC3G20rnCOCH__TMBuX-pLvI26-JvwhtELP-XxQ7m9WYP5hXG4q5Dz61ag6G7z6PwwrrTbrrJoLe0C09kFYUC1JabUXwAIMOErhEmNf4Cc3UGjkwGwhKjcDe5d1Zwz4Mg2n4tWdun3WPEXxTptFbgQukdAsPzsOfBzu0vUEfNTNHOKGJnYD7EyyQBTuvaGpccJNzstscbgLZAodGUwk0BHBv1NlnT-cUj7B4vbstKPEHER0Pe"
                alt="Indigo Music Festival"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <span className="inline-block px-3 py-1 bg-vip-gold text-white text-[10px] qph-label-bold rounded-full uppercase mb-2">Destacado</span>
                <h3 className="text-white qph-headline-md text-[20px] mb-1 font-semibold">Indigo Music Festival</h3>
                <p className="text-platinum-silver qph-body-md text-sm mb-4">Parque Central • 22 de Mayo</p>
                <button className="w-full py-3 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer">Comprar Entradas</button>
              </div>
            </div>

            {/* Carousel Item 2 */}
            <div className="min-w-[85%] snap-center rounded-xl overflow-hidden relative aspect-[3/4] shadow-lg group flex-none">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/20 to-transparent z-10"></div>
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDplj48Bi3auGgPy91VxeRj042B5hUGuTysP3sjqmaY62HzH6nKoaSDsyww_YbDXjQlafdMsJraGLHanhdm_NNdcY5PlIPh7MnFvvG0Jl9f3S15U5VQERKcDQeT68RTR0CxKQxqTy37JESi9OalaifYG9_GR2jB1OiL6hdmeBsNJxncSF8Nu0StpC1k0AQpnz2iSHsKl_-RvPEpj5XwzSGhz9DpafrZF-n60lHzIZZzciliuK4q0antY06Hwd-Q2INX2Pn-iqhKZeP"
                alt="Noches de Jazz & Blues"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <span className="inline-block px-3 py-1 bg-electric-indigo text-white text-[10px] qph-label-bold rounded-full uppercase mb-2">Últimas plazas</span>
                <h3 className="text-white qph-headline-md text-[20px] mb-1 font-semibold">Noches de Jazz & Blues</h3>
                <p className="text-platinum-silver qph-body-md text-sm mb-4">Teatro Principal • 25 de Mayo</p>
                <button className="w-full py-3 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer">Ver Detalles</button>
              </div>
            </div>

          </div>
        </section>

        {/* Categories Section (Horizontal Chips) */}
        <section className="mb-10 overflow-hidden">
          <h2 className="px-4 qph-headline-lg text-[20px] font-bold text-deep-slate mb-4">Explora por Categoría</h2>
          <div className="flex overflow-x-auto qph-hide-scrollbar px-4 gap-3 pb-2">
            {["Todo", "Conciertos", "Teatro", "Deportes", "Cine"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveMobileFilter(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full qph-label-bold shadow-md transition-colors cursor-pointer ${
                  activeMobileFilter === cat
                    ? "bg-electric-indigo text-white"
                    : "bg-surface-container-lowest text-on-surface-variant border border-surface-gray hover:bg-surface-gray"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Upcoming Events (Vertical List) */}
        <section className="px-4 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Eventos Próximos</h2>
          </div>
          <div className="flex flex-col gap-6">
            
            {/* Event Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col group active:scale-[0.98] transition-transform">
              <div className="aspect-[16/9] w-full relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFb3bgLbsoR7CK9enKZRqeE72t1aqVmGq1UKSPxojC0PoE2NlRNS3VVTWaBXTGj488pBlFGstkv1P-4jcNDp2QIeTr9Izmz-Nn7sWXcLp6CQyq_YRNa4BznGC_u9DOlt-xs6YmMG9AtkgE5pdUbqDPLybK9ly_rXVEi6ysJ-UUE_fH1PfmUSV6fXaNuaPPvn2nCxMFj3lDF_bJlZ0GuviWAuCpu2Buw-rA5UG5j9ClZSuj8EXpIKPHzSPMcKTKleF3xw8cWaoo2Gd7"
                  alt="Tech Future Summit 2024"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-center shadow-sm">
                  <span className="block text-electric-indigo qph-label-bold text-[16px] font-bold">12</span>
                  <span className="block text-on-surface-variant text-[10px] uppercase qph-label-bold">JUN</span>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="qph-headline-md text-[20px] text-on-surface leading-tight font-semibold">Tech Future Summit 2024</h4>
                  <span className="text-electric-indigo qph-price-tag text-[20px] font-bold">$45</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="qph-body-md text-sm">Centro de Convenciones, CDMX</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-surface-gray text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">Conferencia</span>
                  <span className="px-2 py-0.5 bg-surface-gray text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">Tecnología</span>
                </div>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col group active:scale-[0.98] transition-transform">
              <div className="aspect-[16/9] w-full relative">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR10hAKkMbYe_eNR4qjZIgEqZNdQpgiN1TTjfTZ-hMSN5RL1kHOOWlOtRhGTIIL6JF1NmpkyBu21GQN9RbDMggK3p7sZfoeAIgsPpYW65XFyU6PDimUMd44obvipt_rKId_lmnU7E4Bg1zq2hNEaFUtty4_a0IXrhLipaBU4X3vtmwkElIOouuBX7GNEb_PGghATL2ToEPRGIPRzIANqcJR_BDlnkLR4CaJTJq4UElzVFvlFt980NOC582D93S4yNK3KeOGAvnb2TN"
                  alt="Vibe Night Session"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-center shadow-sm">
                  <span className="block text-electric-indigo qph-label-bold text-[16px] font-bold">18</span>
                  <span className="block text-on-surface-variant text-[10px] uppercase qph-label-bold">JUN</span>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="qph-headline-md text-[20px] text-on-surface leading-tight font-semibold">Vibe Night Session</h4>
                  <span className="text-electric-indigo qph-price-tag text-[20px] font-bold">$29</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="qph-body-md text-sm">Arena Metropolitan, Monterrey</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-surface-gray text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">Fiesta</span>
                  <span className="px-2 py-0.5 bg-surface-gray text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">DJ Set</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Newsletter / Community Section */}
        <section className="px-4 py-10 bg-deep-slate rounded-3xl mx-4 mb-20 text-center text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="qph-headline-lg text-[20px] font-bold mb-2">No te pierdas de nada</h3>
            <p className="text-platinum-silver qph-body-md text-sm mb-6">Recibe alertas personalizadas para tus eventos favoritos directamente en tu móvil.</p>
            <div className="flex flex-col gap-3">
              <input
                className="w-full h-12 bg-white/10 rounded-xl px-4 border-none text-white placeholder-platinum-silver focus:ring-1 focus:ring-electric-indigo outline-none"
                placeholder="Tu correo electrónico"
                type="email"
              />
              <button className="w-full h-12 bg-electric-indigo text-white font-label-bold rounded-xl shadow-lg shadow-electric-indigo/20 active:scale-95 transition-transform cursor-pointer">
                Suscribirme
              </button>
            </div>
          </div>
          {/* Decorative circle */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-electric-indigo/20 rounded-full blur-3xl"></div>
        </section>

        {/* Footer Simulation */}
        <footer className="bg-deep-slate py-12 px-6 text-center border-t border-outline-variant/10">
          <img
            alt="queplaneshoy logo"
            className="w-10 h-10 mx-auto mb-4 opacity-50"
            src="/logo-qph.svg"
          />
          <p className="text-platinum-silver text-xs qph-body-md mb-6">© 2024 QuePlanesHoy. Todos los derechos reservados.</p>
          <div className="flex justify-center gap-6 text-platinum-silver qph-label-bold text-[10px] uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Ayuda</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </footer>

      </div>

      {/* VISTA ESCRITORIO (Original) */}
      <div className="hidden md:block flex-1 w-full bg-background">
        
        {/* Hero Section with Carousel & Search */}
        <div className="relative w-full">
          <HeroCarousel />
          <SearchBar />
        </div>

        {/* Quick Filters Section */}
        <section className="max-w-container-max mx-auto px-margin-x py-stack-lg flex overflow-x-auto gap-4 qph-hide-scrollbar mt-6">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-none px-6 py-2 rounded-full qph-label-bold transition-all duration-200 cursor-pointer ${
                activeFilter === filter
                  ? "bg-electric-indigo text-white"
                  : "bg-surface-gray text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {filter}
            </button>
          ))}
        </section>

        {/* Upcoming Events Section */}
        <section className="max-w-container-max mx-auto px-margin-x py-section-gap">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="qph-headline-lg text-deep-slate mb-2">
                Eventos Próximos
              </h2>
              <p className="qph-body-md text-on-surface-variant">
                Los espectáculos más esperados que están a punto de comenzar.
              </p>
            </div>
            <button className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer">
              Ver todos{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {UPCOMING_EVENTS.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </section>

        {/* Watchlist Section */}
        <WatchlistSection />

        {/* Bento Categories Grid */}
        <CategoryBento />

      </div>
    </>
  );
}
