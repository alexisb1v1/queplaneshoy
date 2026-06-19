"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createDraftOrderUseCase } from "../../orders";

interface TicketCategory {
  id: string;
  name: string;
  badgeStyle: string;
  title: string;
  description: string;
  price: number;
}

const TICKET_CATEGORIES: TicketCategory[] = [
  {
    id: "box",
    name: "BOX",
    badgeStyle: "bg-vip-gold text-white",
    title: "Experiencia Premium",
    description: "Lounge privado, catering incluido, barra libre y parking VIP.",
    price: 450,
  },
  {
    id: "platinum",
    name: "PLATINUM",
    badgeStyle: "bg-slate-400 text-white",
    title: "Primera Fila",
    description: "Asientos reservados frente al escenario, vista directa sin obstáculos.",
    price: 220,
  },
  {
    id: "vip",
    name: "VIP",
    badgeStyle: "bg-electric-indigo text-white",
    title: "Vista Preferencial",
    description: "Entrada exclusiva sin colas, zona elevada con excelente acústica.",
    price: 145,
  },
  {
    id: "general",
    name: "GENERAL",
    badgeStyle: "bg-deep-slate text-white",
    title: "Pista Principal",
    description: "Zona de pie, cerca del centro del espectáculo.",
    price: 75,
  },
];

const RECOMMENDATIONS = [
  {
    id: 1,
    category: "ELECTRÓNICA",
    title: "Electric Dreams Festival",
    date: "22 NOV",
    location: "MADRID",
    price: 55,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvDbqbGnlbfqUeC8z7aI3S9qHtQrEg0HBuv40tjwOWpwyto7jUUN4aK6zHkyjFpgrQuCmYbnML65LyCOmt4qfAeTI0iyr2BVCmLgaCJy5sBpz6YzL3uZFZIH-KYQuDSVFbpbW2Y6TUpo9uKWoJ2zKmlgzeVlfID8YoiQklT8co4xHrZ6sDZeLPqiY-dRNUsdzl8wQ2M9YvHfLR7G5WFio3W-SCX1AidCHyLkxiMeElBOJP2LgUnEYlNJevy2WQSrRm2T5c0o7zVSlx",
  },
  {
    id: 2,
    category: "ROCK/POP",
    title: "Echoes of Summer",
    date: "05 DIC",
    location: "BARCELONA",
    price: 89,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLV-vFt6Z3Q-_g_RCjM9g3p9FRMdW4TnoLTb2t_DGuHe1Bsjrd7vpYb-J8_gn-FA08Ovc7Xffqg7Su3kDeeigM8E-shO5j3HQerTWdJeRIak58m1ymICAC5dbB6na0lleW1NkOwk918T18gWTshTn0Zzl3ic7SdBx2Vzhs5heY5_umnw9T63JvIIiWvk63UsQKHL2DHezWpD-wjgw01UHRyiKCzTzGizacFSLDtCZyg-82AVyyzAVzhN6jdAaTMFIz5fOyGUmrZCro",
  },
  {
    id: 3,
    category: "JAZZ",
    title: "Midnight Sessions: Jazz",
    date: "12 DIC",
    location: "MADRID",
    price: 42,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOSUZv2M7uclQknZJmXWjOneUBNz-ggqZyktu_-IRwTtUB21KMNz-RpU5FtXl1gcbww2VH2uzJWcFtWoYlnOs7KgVd_v_rHztJTKEqhNEAY0C_W4-ADUGz7tDfqDxACVZAs2r8MKr9XVj5by6TKAwaft2nFhUXzd-3uwtr9BCWIctRcn7n5OXbyYdWN6e_JVAuCiWVPMd2q27xOcZyLmats6ygJ4-hf71qJ97KPTEKrNVxLqC2lfCzSpIJkzYxBA7bw-k5Y_FOk5v7",
  },
  {
    id: 4,
    category: "CLÁSICA",
    title: "Vivaldi Reimagined",
    date: "20 ENE",
    location: "VALENCIA",
    price: 65,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAY0glueuyiQb7DkenK_iYrWWIrNbX1YaUqQ4s_r0nei9PpsCiVxMkvXskGW6sbk_CcpEyhlG1g5x3z8rxRXx-ZcRNo-h6-2mcrd_WVCxV4EcebWwiDmp0K9RVpVG-gcz_eUgfl5BbI_tv2oAGMf3jiixuB808BKzoDWX4MtKSnX4Bsoy1FPPEACjEO3OA_Rgr6Qnr3qORQGSWNXrK8OHutDXb9QZoM3cINg4AR8jEshAMiiXHUsuNK4g9xpaB5VJ9UaAB3X-qSYct4",
  },
];

interface EventDetailPageProps {
  id: string;
}

export default function EventDetailPage({ id }: EventDetailPageProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesState, setFavoritesState] = useState<Record<number, boolean>>({});

  // Estados para el modal de compra
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [qtySelected, setQtySelected] = useState(2);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleSelectZone = (zoneId: string) => {
    setSelectedZone(zoneId);
    setShowQtyModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedZone) return;
    setIsCreatingOrder(true);

    createDraftOrderUseCase.execute(id, selectedZone, qtySelected).match(
      (data) => {
        setIsCreatingOrder(false);
        setShowQtyModal(false);
        router.push(`/checkout/${data.orderToken}`);
      },
      (error) => {
        setIsCreatingOrder(false);
        alert(error.message || "No se pudo crear la reserva. Intente de nuevo.");
      }
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleRecommendationFavorite = (recId: number) => {
    setFavoritesState((prev) => ({
      ...prev,
      [recId]: !prev[recId],
    }));
  };

  const handleBuyTicketsClick = () => {
    const section = document.getElementById("entradas-seccion");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex-1 w-full bg-background">
      
      {/* Ocultar header y bottom nav globales del layout en móvil para esta ruta */}
      <style>{`
        @media (max-width: 1023px) {
          .qph-mobile-header, .qph-mobile-nav {
            display: none !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* VISTA MÓVIL (Stitch Style) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden bg-background min-h-screen pb-32 text-on-surface">
        
        {/* Top Navigation Bar contextual móvil */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white px-4 h-16 flex items-center justify-between border-b border-outline-variant/10 shadow-sm">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-gray transition-all cursor-pointer active:scale-95" 
            onClick={() => window.history.back()}
          >
            <span className="material-symbols-outlined text-on-surface text-[24px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <img 
              alt="queplaneshoy logo" 
              className="h-8 w-auto rounded-md object-contain" 
              src="/logo-qph.svg"
            />
            <span className="font-extrabold text-xl tracking-tight text-deep-slate">
              queplanes<span className="text-electric-indigo">hoy</span>
            </span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-gray transition-all cursor-pointer active:scale-95">
            <span className="material-symbols-outlined text-on-surface text-[24px]">share</span>
          </button>
        </nav>

        {/* Hero Section */}
        <div className="relative w-full h-[50vh] min-h-[400px] mt-16">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTjePsGdlF2CWLwyL8QXZx_q9Xxq66u1etzSxVGNLhA3p7JGAkYYSh09G_S7qmqGPe9Oiuzo-YsPJJxvoaJuXNzlkhxlBkKsS7bdq4tMB7cjiynSO4WxksKipw08vcf01hnKzjSNhyndNJU53TQp-Dj1c0BSqZ8sUl19dD7awV9JW6M6g7KTWxE9RstGFjumD5D7kl8hZmlrFjz1DUNhWK3eN_YgZx370gH66su5jm7qlLC1W3TL0Fw4wPQbtaTt96DEZuwnYlD0HG" 
            alt="Indigo Nights Live Concert"
          />
          <div className="absolute inset-0 qph-hero-gradient flex flex-col justify-end p-6 pb-12">
            <div className="flex gap-2 mb-4">
              <span className="bg-electric-indigo text-white font-semibold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full qph-label-bold">CONCIERTO</span>
              <span className="bg-vip-gold text-white font-semibold text-[10px] tracking-wider px-3 py-1 rounded-full uppercase qph-label-bold">VIP DISPONIBLE</span>
            </div>
            <h1 className="text-white qph-headline-lg text-[24px] mb-2 font-bold">Indigo Nights: Global Tour 2024</h1>
            <div className="flex items-center text-platinum-silver qph-label-bold text-sm">
              <span className="material-symbols-outlined mr-2 text-[18px]">calendar_today</span>
              <span>15 de Agosto, 2024 • 20:00</span>
            </div>
          </div>
        </div>

        {/* Event Key Info */}
        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-outline-variant/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-gray flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-electric-indigo text-[24px]">location_on</span>
              </div>
              <div>
                <h3 className="qph-label-bold text-on-surface font-semibold text-sm">Estadio Metropolitano</h3>
                <p className="text-on-surface-variant qph-body-md text-xs mt-0.5">Av. de la Castellana 144, Madrid</p>
                <button 
                  onClick={handleBuyTicketsClick}
                  className="text-electric-indigo qph-label-bold text-xs mt-1 block hover:underline cursor-pointer"
                >
                  Ver mapa
                </button>
              </div>
            </div>
            <div className="h-px bg-outline-variant/20"></div>
            <div>
              <h3 className="qph-headline-md text-[18px] mb-2 font-semibold text-on-surface">Sobre el evento</h3>
              <p className="text-on-surface-variant qph-body-md text-xs leading-relaxed">
                Prepárate para la experiencia audiovisual más impactante del año. Indigo Nights llega a Madrid con una producción sin precedentes, sonido inmersivo y los éxitos que han dominado las listas globales. Una noche donde la música y la tecnología se fusionan en un espectáculo inolvidable.
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Categories (Móvil) */}
        <section className="mt-10 px-5" id="entradas-seccion">
          <h2 className="qph-headline-md text-[20px] font-bold text-deep-slate mb-6 px-1">Entradas Disponibles</h2>
          <div className="flex flex-col gap-5">
            
            {/* Box Category */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-tertiary-container qph-label-bold text-[10px] uppercase tracking-wider block font-semibold mb-0.5">Experiencia Premium</span>
                  <h4 className="qph-headline-md text-[18px] font-bold text-deep-slate">Box Experience</h4>
                </div>
                <div className="text-right">
                  <span className="text-on-surface-variant qph-label-bold text-[12px] block line-through">€350</span>
                  <span className="text-electric-indigo qph-price-tag text-[20px] font-bold block mt-0.5">€299</span>
                </div>
              </div>
              <p className="text-on-surface-variant qph-body-md text-xs mb-5">Incluye acceso prioritario, barra libre de refrescos y catering premium.</p>
              <button 
                onClick={() => handleSelectZone("box")}
                className="w-full bg-deep-slate text-white py-3.5 rounded-lg qph-label-bold text-xs font-bold active:scale-95 transition-transform cursor-pointer hover:bg-black"
              >
                Seleccionar
              </button>
            </div>

            {/* Platinum Category */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-platinum-silver qph-label-bold text-[10px] uppercase tracking-wider block font-semibold mb-0.5">Más Cercano</span>
                  <h4 className="qph-headline-md text-[18px] font-bold text-deep-slate">Platinum Front</h4>
                </div>
                <div className="text-right">
                  <span className="text-electric-indigo qph-price-tag text-[20px] font-bold block">€185</span>
                </div>
              </div>
              <p className="text-on-surface-variant qph-body-md text-xs mb-5">Zona frente al escenario. Capacidad limitada para máxima comodidad.</p>
              <button 
                onClick={() => handleSelectZone("platinum")}
                className="w-full bg-deep-slate text-white py-3.5 rounded-lg qph-label-bold text-xs font-bold active:scale-95 transition-transform cursor-pointer hover:bg-black"
              >
                Seleccionar
              </button>
            </div>

            {/* VIP Category */}
            <div className="bg-white border-2 border-vip-gold/30 rounded-xl p-5 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 bg-vip-gold text-white px-3 py-1 rounded-bl-xl qph-label-bold text-[9px] uppercase font-bold">
                Más Popular
              </div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-vip-gold qph-label-bold text-[10px] uppercase tracking-wider block font-semibold mb-0.5">Mejor Vista</span>
                  <h4 className="qph-headline-md text-[18px] font-bold text-deep-slate">VIP Central</h4>
                </div>
                <div className="text-right">
                  <span className="text-electric-indigo qph-price-tag text-[20px] font-bold block">€120</span>
                </div>
              </div>
              <p className="text-on-surface-variant qph-body-md text-xs mb-5">Asientos numerados en la grada central con vista panorámica total.</p>
              <button 
                onClick={() => handleSelectZone("vip")}
                className="w-full bg-deep-slate text-white py-3.5 rounded-lg qph-label-bold text-xs font-bold active:scale-95 transition-transform cursor-pointer hover:bg-black"
              >
                Seleccionar
              </button>
            </div>

            {/* General Category */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-on-surface-variant qph-label-bold text-[10px] uppercase tracking-wider block font-semibold mb-0.5">Acceso Base</span>
                  <h4 className="qph-headline-md text-[18px] font-bold text-deep-slate">Entrada General</h4>
                </div>
                <div className="text-right">
                  <span className="text-electric-indigo qph-price-tag text-[20px] font-bold block">€65</span>
                </div>
              </div>
              <p className="text-on-surface-variant qph-body-md text-xs mb-5">Acceso a pista general. Disfruta de la energía del público.</p>
              <button 
                onClick={() => handleSelectZone("general")}
                className="w-full bg-deep-slate text-white py-3.5 rounded-lg qph-label-bold text-xs font-bold active:scale-95 transition-transform cursor-pointer hover:bg-black"
              >
                Seleccionar
              </button>
            </div>

          </div>
        </section>

        {/* Terms & Conditions links */}
        <div className="mt-12 px-5 opacity-60">
          <div className="flex flex-col gap-2 qph-label-bold text-[11px] uppercase tracking-widest text-on-surface-variant text-center">
            <a className="underline hover:text-black transition-colors" href="#">Términos y Condiciones</a>
            <a className="underline hover:text-black transition-colors" href="#">Política de Cancelación</a>
            <span className="mt-1">QuePlanesHoy © 2024</span>
          </div>
        </div>

        {/* Persistant Purchase Bar (Mobile bottom sticky) */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-outline-variant/10 p-4 pb-8 flex items-center justify-between gap-4 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col">
            <span className="qph-label-bold text-on-surface-variant uppercase text-[10px]">Desde</span>
            <span className="qph-price-tag text-[20px] text-on-surface font-bold">€65,00</span>
          </div>
          <button 
            onClick={handleBuyTicketsClick}
            className="flex-grow bg-electric-indigo text-white h-14 rounded-xl qph-label-bold text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-electric-indigo/20 cursor-pointer"
          >
            <span>COMPRAR ENTRADAS</span>
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VISTA ESCRITORIO (Original) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block bg-background min-h-screen pb-20">
        
        {/* Hero Section Banner */}
        <section className="relative w-full h-[600px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZjYk3TO8LsC4cDf1CDTf2evzsjOS6hcm3RTp_GL1TBtPGZPAEkw2LB1K_2FYIUqesxpwBH81gi4CUf6J4KWMCkwf0zhoVYcQNGzDbx-WJi0BFIkE9WfrpitVLR8-0suyZSY4mtkIMrzdEz6eb0THqNwC8OTpElcOxzSrrVHEF492Kyu7Isjkj-cvF9-lRhLjWCwXTiQIIVTnNptiwwJ8IkAvbQPiNp21CY7O15XrFqyHc46IArePF-6JkLD6-a4tBYsj-SNCOfJad"
            alt="Midnight Echoes Live Concert"
          />
          <div className="absolute inset-0 qph-hero-gradient flex flex-col justify-end pb-16 px-8">
            <div className="max-w-container-max mx-auto w-full">
              <div className="flex flex-col gap-3 text-white">
                <span className="font-semibold text-[14px] uppercase tracking-widest text-electric-indigo bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full qph-label-bold">
                  Tour Mundial 2024
                </span>
                <h1 className="qph-display-xl text-white max-w-3xl leading-tight">
                  Midnight Echoes: En Vivo
                </h1>
                <div className="flex flex-wrap gap-8 items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                    <span className="qph-label-bold text-sm">15 DE OCTUBRE, 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="qph-label-bold text-sm">ESTADIO NACIONAL, MADRID</span>
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-lg px-6 py-3 rounded-xl transition-all border border-white/20 cursor-pointer active:scale-95"
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    <span className="qph-label-bold text-sm">
                      {isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-container-max mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            {/* About Section */}
            <section className="flex flex-col gap-4">
              <h2 className="qph-headline-lg text-deep-slate font-bold">Sobre el Evento</h2>
              <p className="qph-body-lg text-on-surface-variant leading-relaxed">
                Prepárate para la noche más espectacular del año. Midnight Echoes llega a Madrid con una producción audiovisual sin precedentes. Tras agotar entradas en Londres y Nueva York, la banda presenta su nuevo álbum junto a sus más grandes éxitos en una experiencia sensorial que combina arte digital, sonido e iluminación futurista.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-surface-container-low p-5 rounded-xl flex gap-4 items-start border border-outline-variant/30">
                  <span className="material-symbols-outlined text-electric-indigo mt-0.5">info</span>
                  <div>
                    <h4 className="qph-label-bold text-deep-slate">Requisitos de entrada</h4>
                    <p className="qph-body-md text-sm text-on-surface-variant mt-1">
                      Mayores de 16 años o acompañados por tutor legal. Identificación oficial requerida.
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl flex gap-4 items-start border border-outline-variant/30">
                  <span className="material-symbols-outlined text-electric-indigo mt-0.5">schedule</span>
                  <div>
                    <h4 className="qph-label-bold text-deep-slate">Horarios</h4>
                    <p className="qph-body-md text-sm text-on-surface-variant mt-1">
                      Apertura de puertas: 18:00h. Inicio Show: 21:00h.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ticket Categories Section */}
            <section className="flex flex-col gap-6" id="entradas-seccion">
              <div className="flex justify-between items-end">
                <h2 className="qph-headline-lg text-deep-slate font-bold">Categorías de Entradas</h2>
                <span className="qph-label-bold text-on-surface-variant">{TICKET_CATEGORIES.length} Categorías Disponibles</span>
              </div>
              <div className="overflow-hidden border border-outline-variant/30 rounded-2xl bg-white qph-soft-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-surface-container text-deep-slate border-b border-outline-variant/30">
                        <th className="p-6 qph-label-bold uppercase tracking-wider">Categoría</th>
                        <th className="p-6 qph-label-bold uppercase tracking-wider">Ubicación & Beneficios</th>
                        <th className="p-6 qph-label-bold uppercase tracking-wider">Precio</th>
                        <th className="p-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {TICKET_CATEGORIES.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-surface-container-low transition-colors group">
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ticket.badgeStyle}`}>
                              {ticket.name}
                            </span>
                          </td>
                          <td className="p-6">
                            <p className="qph-label-bold text-deep-slate">{ticket.title}</p>
                            <p className="qph-body-md text-xs text-on-surface-variant mt-1">{ticket.description}</p>
                          </td>
                          <td className="p-6 qph-price-tag text-electric-indigo font-bold">
                            €{ticket.price}
                          </td>
                          <td className="p-6 text-right">
                            <button 
                              onClick={() => handleSelectZone(ticket.id)}
                              className="bg-deep-slate text-white px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-black active:scale-95"
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Location Map Section */}
            <section className="flex flex-col gap-4">
              <h2 className="qph-headline-lg text-deep-slate font-bold">Ubicación</h2>
              <div className="w-full h-80 rounded-2xl overflow-hidden relative qph-soft-shadow">
                <img
                  className="w-full h-full object-cover grayscale opacity-80"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQWO-g3Ms96zR7IjQFeNqY1kcs-rLOz6jrPLJwzqgZhhZ27o4-CiOL_bgoJq4EN2kWLiUtjY2ALN0nDTaG2c_TtfxMu_NFTrT_cqEQv81y5tyloWo5lOluWdEtLD0BIhrMadvdfcsB0YXAtvXdiEB2oKSdQHX5q4QCmG5O-fAAlLZxTTVOZe1E7a7LrLXjNlTStbN9iRZpLFVfAJwjXjM6213qx2R2f54cuhnkA7WSCBeW2Apqson4g3qCyO4R2KCa3ig_9reDRKzW"
                  alt="Map location Estadio Nacional"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-xl shadow-xl border border-outline-variant/30 flex items-center gap-3">
                    <div className="bg-electric-indigo/10 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-electric-indigo text-[24px]">location_on</span>
                    </div>
                    <div>
                      <p className="qph-label-bold text-deep-slate">Estadio Nacional</p>
                      <p className="qph-body-md text-xs text-on-surface-variant">Paseo de la Castellana, Madrid</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
          </div>

          {/* Sidebar Sticky (Right) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 flex flex-col gap-6">
              
              {/* Purchase Card */}
              <div className="bg-white p-6 rounded-2xl qph-soft-shadow border border-outline-variant/20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-on-surface-variant text-xs qph-label-bold uppercase tracking-wider">Desde</p>
                    <p className="qph-price-tag text-3xl text-electric-indigo font-bold">€75.00</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    Disponible
                  </span>
                </div>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-surface-gray rounded-xl">
                    <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
                    <div>
                      <p className="qph-body-md text-[10px] text-on-surface-variant font-medium">Fecha única</p>
                      <p className="qph-label-bold text-sm text-deep-slate">Sábado, 15 de Octubre</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-gray rounded-xl">
                    <span className="material-symbols-outlined text-on-surface-variant">confirmation_number</span>
                    <div>
                      <p className="qph-body-md text-[10px] text-on-surface-variant font-medium">Capacidad</p>
                      <p className="qph-label-bold text-sm text-deep-slate">Entradas limitadas</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBuyTicketsClick}
                  className="w-full bg-electric-indigo text-white py-4 rounded-xl qph-headline-md font-semibold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-electric-indigo/20 cursor-pointer"
                >
                  Comprar Entradas
                </button>
                <p className="text-center qph-body-md text-[11px] text-on-surface-variant mt-4">
                  Garantía QPH: Entradas 100% verificadas.
                </p>
              </div>

              {/* Support Card */}
              <div className="bg-deep-slate p-6 rounded-2xl text-white">
                <h4 className="qph-label-bold text-white mb-2">¿Necesitas ayuda?</h4>
                <p className="qph-body-md text-sm opacity-70 mb-4 leading-relaxed">
                  Nuestro equipo de soporte está disponible 24/7 para asistirte con tu compra.
                </p>
                <a className="text-electric-indigo qph-label-bold text-sm hover:underline flex items-center gap-1" href="#">
                  Contactar Soporte &rarr;
                </a>
              </div>

            </div>
          </aside>

        </div>

        {/* Similar Events Section */}
        <section className="bg-surface-container-low py-16 mt-16 border-t border-outline-variant/10">
          <div className="max-w-container-max mx-auto px-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="qph-headline-lg text-deep-slate font-bold">Eventos Similares</h2>
              <a className="text-electric-indigo qph-label-bold hover:underline" href="#">
                Ver todos los conciertos
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECOMMENDATIONS.map((rec) => {
                const recIsFavorite = favoritesState[rec.id] || false;
                return (
                  <div key={rec.id} className="bg-white rounded-2xl overflow-hidden qph-soft-shadow qph-hover-lift group cursor-pointer flex flex-col">
                    <div className="relative aspect-video">
                      <img
                        className="w-full h-full object-cover"
                        src={rec.imageUrl}
                        alt={rec.title}
                      />
                      <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-deep-slate shadow-sm tracking-wider">
                        {rec.category}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="qph-label-bold text-[11px] text-on-surface-variant uppercase tracking-widest">
                        {rec.date} • {rec.location}
                      </p>
                      <h3 className="qph-headline-md text-deep-slate mt-1 group-hover:text-electric-indigo transition-colors font-semibold text-lg flex-1">
                        {rec.title}
                      </h3>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-surface-gray">
                        <span className="qph-price-tag text-electric-indigo font-bold">€{rec.price}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRecommendationFavorite(rec.id);
                          }}
                          className={`hover:text-error transition-colors cursor-pointer p-1 rounded-full ${
                            recIsFavorite ? "text-error" : "text-on-surface-variant"
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ fontVariationSettings: recIsFavorite ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>

      {/* Modal para selección de cantidad */}
      {showQtyModal && (
        <div className="fixed inset-0 bg-deep-slate/55 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-deep-slate">Selecciona la cantidad</h3>
              <button 
                onClick={() => setShowQtyModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-gray text-on-surface-variant hover:text-deep-slate"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <p className="text-xs text-on-surface-variant mb-4">
              Zona seleccionada: <span className="font-bold text-deep-slate">{
                selectedZone === 'box' ? 'Box Experience' :
                selectedZone === 'platinum' ? 'Platinum Front' :
                selectedZone === 'vip' ? 'VIP Central' : 'Entrada General'
              }</span>
            </p>

            <div className="flex items-center justify-between mb-8 p-3 bg-surface-gray rounded-xl">
              <span className="text-sm font-semibold text-deep-slate pl-2">Cantidad</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={qtySelected <= 1}
                  onClick={() => setQtySelected(qtySelected - 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-outline-variant/30 flex items-center justify-center font-bold text-deep-slate hover:bg-gray-100 disabled:opacity-50"
                >
                  -
                </button>
                <span className="font-extrabold text-lg w-4 text-center">{qtySelected}</span>
                <button
                  type="button"
                  disabled={qtySelected >= 10}
                  onClick={() => setQtySelected(qtySelected + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-outline-variant/30 flex items-center justify-center font-bold text-deep-slate hover:bg-gray-100 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleConfirmPurchase}
              disabled={isCreatingOrder}
              className="w-full bg-electric-indigo text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/20 active:scale-[0.98] transition-all hover:bg-primary-container"
            >
              {isCreatingOrder ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                  <span>Reservando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar y Comprar</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
