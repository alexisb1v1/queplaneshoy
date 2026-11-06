export interface TicketCategoryItem {
  id: string;
  name: string;
  badgeStyle: string;
  title: string;
  description: string;
  price: number;
  regularPrice?: number;
  isPresale?: boolean;
}

export interface MockEvent {
  id: string;
  title: string;
  category: string;
  tagline?: string;
  imageUrl: string;
  bannerUrl?: string;
  altText: string;
  date: string;
  time?: string;
  location: string;
  venue: string;
  address: string;
  price: number;
  regularPrice?: number;
  isPresale?: boolean;
  ticketType: string;
  ticketBadgeStyle?: "general" | "vip" | "platinum";
  description: string;
  ticketCategories?: TicketCategoryItem[];
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "1",
    title: "Echoes of Summer Tour",
    category: "CONCIERTO",
    tagline: "El tour más vibrante del año",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHVY15DpfYzyH93Hw8X7x6UctHW54DfefNOboWhdivHf-ScywQF8yBmZWwZGhiGpYGZPObwBdB0HhNC4pEZnP8E0ggFQrAUuGgZ5Pt1ZJtIL8iKH53j99jFUrpBx5XCCTcdg4gecQES56Shq1fcGEOo_CadQ4XUcav8DgBIjKH2I9CID9XcUNx8MQFd1jM3rm-pjAqVtYL2PTtnniP7DJJ1s1HHUwo0nCw-tUJGlIZKAFYpuZhruFXU-9jlaODrQMOoQu9Ym1XY4vB",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHVY15DpfYzyH93Hw8X7x6UctHW54DfefNOboWhdivHf-ScywQF8yBmZWwZGhiGpYGZPObwBdB0HhNC4pEZnP8E0ggFQrAUuGgZ5Pt1ZJtIL8iKH53j99jFUrpBx5XCCTcdg4gecQES56Shq1fcGEOo_CadQ4XUcav8DgBIjKH2I9CID9XcUNx8MQFd1jM3rm-pjAqVtYL2PTtnniP7DJJ1s1HHUwo0nCw-tUJGlIZKAFYpuZhruFXU-9jlaODrQMOoQu9Ym1XY4vB",
    altText: "DJ actuando en un concierto de música electrónica",
    date: "14 OCT, 2024",
    time: "21:00",
    location: "MADRID",
    venue: "Estadio Civitas Metropolitano",
    address: "Av. de Luis Aragonés 4, Madrid",
    price: 45,
    regularPrice: 65,
    isPresale: true,
    ticketType: "Preventa Fase 1",
    ticketBadgeStyle: "general",
    description: "Vive la despedida definitiva de la temporada estival con Echoes of Summer Tour. Un show con más de 4 horas de música en vivo, pirotecnia y visuales inmersivas con los productores más destacados del panorama internacional.",
    ticketCategories: [
      { id: "box", name: "BOX", badgeStyle: "bg-vip-gold text-white", title: "Experiencia VIP Box", description: "Palco privado con vistas panorámicas, barra libre y catering exclusivo.", price: 290, regularPrice: 350, isPresale: true },
      { id: "platinum", name: "PLATINUM", badgeStyle: "bg-slate-400 text-white", title: "Front Stage Golden", description: "Acceso pegado al escenario principal con pulsera conmemorativa.", price: 140, regularPrice: 175, isPresale: true },
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Grada Preferente", description: "Asiento reservado en zona central baja con acceso rápido.", price: 85, regularPrice: 110, isPresale: true },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Pista General", description: "Acceso al foso general para vivir la fiesta al máximo.", price: 45, regularPrice: 65, isPresale: true },
    ],
  },
  {
    id: "2",
    title: "Vanguardia Rítmica",
    category: "TEATRO",
    tagline: "Danza contemporánea y fusión clásica",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuoyPDVeB3IC2Ys_pTmUILUys8yJCuWCU63CJXY5DrJFQU83axPRERE8hLyMZc-3dmCYxFzocnaE1G12OPO8u2ZStiTYJDIJbZ9w3lt9Dc5xFgpCSAN1b02av_9gIeSOiQ5_MtfHBfVTka2Vp83LnpBE58QZOESlDZedrNlXRueK5Vrfh4ulDgt4O0meMR6jckbR7kdgbNwdDRZIoRqUIuVsCFPA4HiqYRPBRoScR6Fw8jdGPRe7Ncix_NpbXpD4P2QwjWtvCgE0xR",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuoyPDVeB3IC2Ys_pTmUILUys8yJCuWCU63CJXY5DrJFQU83axPRERE8hLyMZc-3dmCYxFzocnaE1G12OPO8u2ZStiTYJDIJbZ9w3lt9Dc5xFgpCSAN1b02av_9gIeSOiQ5_MtfHBfVTka2Vp83LnpBE58QZOESlDZedrNlXRueK5Vrfh4ulDgt4O0meMR6jckbR7kdgbNwdDRZIoRqUIuVsCFPA4HiqYRPBRoScR6Fw8jdGPRe7Ncix_NpbXpD4P2QwjWtvCgE0xR",
    altText: "Espectáculo de ballet moderno en un espacio vanguardista",
    date: "18 OCT, 2024",
    time: "20:30",
    location: "BARCELONA",
    venue: "Gran Teatre del Liceu",
    address: "La Rambla 51-59, Barcelona",
    price: 75,
    ticketType: "VIP DISPONIBLE",
    ticketBadgeStyle: "vip",
    description: "Una obra maestra que redefine el ballet contemporáneo. Coreografías de nivel mundial acompañadas por orquesta de cámara en directo, transformando el espacio en un viaje emotivo y multisensorial.",
    ticketCategories: [
      { id: "box", name: "BOX", badgeStyle: "bg-vip-gold text-white", title: "Palco de Honor", description: "Asientos históricos con copa de bienvenida y programa de mano firmado.", price: 210 },
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Platea Central", description: "Vista acústica y visual perfecta en el corazón del teatro.", price: 120 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Anfiteatro", description: "Disfruta de la perspectiva aérea completa de la coreografía.", price: 75 },
    ],
  },
  {
    id: "3",
    title: "Masters Cup Series",
    category: "DEPORTES",
    tagline: "El desenlace más emocionante de la temporada",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUB9_XEEj_ZDdk8n2xiDLa-Cye5or9W5oDua9zxoskGxUBWVzQ0x8Vi4-Xp_ugA7aBh5VXnLPXCzPKZk8lJtlUrX2Rb0zDc8wmyipFF908z8FX2cP3alyD7yB-HEWc3Fnr7mk9pS7iAECvBW2yOER8HS_pGV-Mo8IXbSxMDr4XGPRYrrooWRFTFYJW75CtkDRwM7b6jtldK2GPLEUCIOJs-japi4u5cpa21KLX9oAl-ro8PelmCVkbImHrRcwTLVRISfaPXnfCB5mG",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUB9_XEEj_ZDdk8n2xiDLa-Cye5or9W5oDua9zxoskGxUBWVzQ0x8Vi4-Xp_ugA7aBh5VXnLPXCzPKZk8lJtlUrX2Rb0zDc8wmyipFF908z8FX2cP3alyD7yB-HEWc3Fnr7mk9pS7iAECvBW2yOER8HS_pGV-Mo8IXbSxMDr4XGPRYrrooWRFTFYJW75CtkDRwM7b6jtldK2GPLEUCIOJs-japi4u5cpa21KLX9oAl-ro8PelmCVkbImHrRcwTLVRISfaPXnfCB5mG",
    altText: "Partido de tenis al atardecer en pista profesional",
    date: "22 OCT, 2024",
    time: "19:00",
    location: "VALENCIA",
    venue: "Pavelló Font de Sant Lluís",
    address: "Av. dels Germans Maristes 16, Valencia",
    price: 120,
    ticketType: "PLATINUM",
    ticketBadgeStyle: "platinum",
    description: "Las mejores raquetas del mundo compiten en cuartos y semifinales de la Masters Cup. Adrenalina pura en una pista rápida con tecnología Hawk-Eye de última generación.",
    ticketCategories: [
      { id: "platinum", name: "PLATINUM", badgeStyle: "bg-slate-400 text-white", title: "Pista VIP Courtside", description: "Asiento a nivel de cancha con acceso a la zona de jugadores y hospitality.", price: 350 },
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Grada Baja Central", description: "Perspectiva inmejorable detrás de los jueces de fondo.", price: 190 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Grada General", description: "Acceso completo a la sesión vespertina y partidos complementarios.", price: 120 },
    ],
  },
  {
    id: "4",
    title: "Sunset Jazz Session",
    category: "CONCIERTO",
    tagline: "Atmósfera íntima al caer la tarde",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEL4eAbOCJp6-HVuKFQOkbMfF-GhV54vep61KRoDFrbtebQRAySMLmjv3-Ue0Iv21MDOUAv2aN-ULaUFLLXhSzPqnfmC--4zwXhM7wfJwiUt7H8RlpCFMdkLd2YIQnDMqiP3REOOEGred7luLvCrTbFt3txZiYwjJwT0fvXKPkL3CHkNwOFMPB5_sCl7_tvS7tBgYHkyqhIjJyb02QMqw9cVmYBdLHGcqp4nYrRyX7sV-fB4iH9Tac13LGmL2aC_Djn2JBja3sSYFL",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEL4eAbOCJp6-HVuKFQOkbMfF-GhV54vep61KRoDFrbtebQRAySMLmjv3-Ue0Iv21MDOUAv2aN-ULaUFLLXhSzPqnfmC--4zwXhM7wfJwiUt7H8RlpCFMdkLd2YIQnDMqiP3REOOEGred7luLvCrTbFt3txZiYwjJwT0fvXKPkL3CHkNwOFMPB5_sCl7_tvS7tBgYHkyqhIjJyb02QMqw9cVmYBdLHGcqp4nYrRyX7sV-fB4iH9Tac13LGmL2aC_Djn2JBja3sSYFL",
    altText: "Festival de jazz al aire libre al atardecer",
    date: "30 OCT, 2024",
    time: "18:30",
    location: "MADRID",
    venue: "Jardines del Botánico",
    address: "Plaza de Murillo 2, Madrid",
    price: 30,
    ticketType: "General",
    ticketBadgeStyle: "general",
    description: "Una velada de saxofón, contrabajo y piano bajo los árboles centenarios. Con coctelería de autor y gastronomía selecta para acompañar una noche de jazz de altísimo nivel.",
    ticketCategories: [
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Mesa Premium con Degustación", description: "Mesa reservada frente al escenario con copa y tabla de quesos locales.", price: 65 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Entrada Césped", description: "Acceso libre para acomodarse en la zona ajardinada.", price: 30 },
    ],
  },
  {
    id: "neon-pulse",
    title: "Neon Pulse Festival 2024",
    category: "CONCIERTO",
    tagline: "El mayor espectáculo de luces y ritmos electrónicos",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArvALp2f189WFx8f0LzakoBfIG4x9xtX2yELKpqcah5IKtC9OOLdg2NVNBIY7UylA0XMle6rcaUuQoYPDX5n9-7T3KVVVfFJSoFdXXLW-84Z0SLk2p4Uk9EifxKNnMDBjEbe0GIIFzIz8rfZTmDjsTSnmkJ0QcwZCjXLpreh3wkKONf6U5GkqUziZUKXWLad8FOMPZZOwoIJmc4obi9caQKG25SJin0IlLKoXwSjyNQh_QLw76dbziUfyj9bLGLWiVceQMh_G3VjkI",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArvALp2f189WFx8f0LzakoBfIG4x9xtX2yELKpqcah5IKtC9OOLdg2NVNBIY7UylA0XMle6rcaUuQoYPDX5n9-7T3KVVVfFJSoFdXXLW-84Z0SLk2p4Uk9EifxKNnMDBjEbe0GIIFzIz8rfZTmDjsTSnmkJ0QcwZCjXLpreh3wkKONf6U5GkqUziZUKXWLad8FOMPZZOwoIJmc4obi9caQKG25SJin0IlLKoXwSjyNQh_QLw76dbziUfyj9bLGLWiVceQMh_G3VjkI",
    altText: "Festival de musica Neon Pulse",
    date: "10 NOV, 2024",
    time: "19:00",
    location: "MADRID",
    venue: "Recinto Ferial IFEMA",
    address: "Av. del Partenón 5, Madrid",
    price: 65,
    ticketType: "Entradas disponibles",
    ticketBadgeStyle: "vip",
    description: "Tres escenarios gigantescos, tecnología láser de 360 grados y más de 30 artistas internacionales. Neon Pulse redefine la experiencia festivalera en otoño.",
    ticketCategories: [
      { id: "box", name: "BOX", badgeStyle: "bg-vip-gold text-white", title: "Sky Box VIP", description: "Vista panorámica elevada sobre el escenario principal y servicio de botella.", price: 380 },
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Golden Ring", description: "Zona exclusiva con baños privados, bar independiente y cercanía total a la cabina.", price: 130 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Abono General", description: "Acceso total a los 3 escenarios durante toda la jornada.", price: 65 },
    ],
  },
  {
    id: "pro-league",
    title: "Finales de Verano: Pro League",
    category: "DEPORTES",
    tagline: "El choque definitivo por el campeonato",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZRf5b2CiwcTa73hpU1YS2bQJeb8P8J77zLnPoakMwOAt7V-XEt1kILsDA1VnrdUUjullHbqTMl4AtQPvnTDxq-GMdQTmJWtAfek1mG6X9oLiBgvHw1j2k0YGo90mUZwn5jvkJEmfhgNRF6QQ5PRQzVehB5FbjTQs3FEn2rLMx4c7ug1qp6bb2Vq3TuVU-4LStN-tEWhVRnxjU1fK8_KN1e_lwxypSsBY8h_jAfWG36bugpW3gDSO2icAmnrzgVyugH5W4q8j7Cl0C",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZRf5b2CiwcTa73hpU1YS2bQJeb8P8J77zLnPoakMwOAt7V-XEt1kILsDA1VnrdUUjullHbqTMl4AtQPvnTDxq-GMdQTmJWtAfek1mG6X9oLiBgvHw1j2k0YGo90mUZwn5jvkJEmfhgNRF6QQ5PRQzVehB5FbjTQs3FEn2rLMx4c7ug1qp6bb2Vq3TuVU-4LStN-tEWhVRnxjU1fK8_KN1e_lwxypSsBY8h_jAfWG36bugpW3gDSO2icAmnrzgVyugH5W4q8j7Cl0C",
    altText: "Estadio de baloncesto profesional",
    date: "16 NOV, 2024",
    time: "20:00",
    location: "BARCELONA",
    venue: "Palau Sant Jordi",
    address: "Passeig Olímpic 5-7, Barcelona",
    price: 50,
    ticketType: "Venta Rápida",
    ticketBadgeStyle: "platinum",
    description: "Los dos mejores equipos de la liga se disputan la corona tras meses de intensa competición. Un duelo al límite de la emoción.",
    ticketCategories: [
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Cancha Primera Fila", description: "Siente el impacto de cada jugada justo detrás de los banquillos.", price: 210 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Grada Media", description: "Excelente visibilidad y acústica de todo el estadio.", price: 50 },
    ],
  },
  {
    id: "renacer-drama",
    title: "El Renacer del Drama",
    category: "TEATRO",
    tagline: "Una obra elogiada por la crítica europea",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7E0UFjzRDXfBB--rYurc0cGOw0-4yYkeLqvtDdHYkOcCZahMLGDuv2UAW-bxdIc8_xenxf44YA9WJFeQ-kryVlX0JFEfT7uPOwV764-9zvhRqXbMqIIQKmsD6nWmN43ejHwrf3j4qZ8SNIpjpMGoqePCdQWnLFfJRfBe_uCm8WYCqPraQ0NP5Zrdu4XT8HQJQ2QL0opuHJHZzFOBQp52NINZmj3z4k0ViWXAz3J6OcllZRuQzCy-QvWhvf6nwNPIkCKdKhW0fJPkT",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7E0UFjzRDXfBB--rYurc0cGOw0-4yYkeLqvtDdHYkOcCZahMLGDuv2UAW-bxdIc8_xenxf44YA9WJFeQ-kryVlX0JFEfT7uPOwV764-9zvhRqXbMqIIQKmsD6nWmN43ejHwrf3j4qZ8SNIpjpMGoqePCdQWnLFfJRfBe_uCm8WYCqPraQ0NP5Zrdu4XT8HQJQ2QL0opuHJHZzFOBQp52NINZmj3z4k0ViWXAz3J6OcllZRuQzCy-QvWhvf6nwNPIkCKdKhW0fJPkT",
    altText: "Interior de teatro historico",
    date: "02 DIC, 2024",
    time: "19:30",
    location: "MADRID",
    venue: "Teatro Español",
    address: "Calle del Príncipe 25, Madrid",
    price: 40,
    ticketType: "Estreno",
    ticketBadgeStyle: "vip",
    description: "Una puesta en escena audaz que explora las pasiones humanas con interpretaciones conmovedoras y una escenografía minimalista galardonada.",
    ticketCategories: [
      { id: "box", name: "BOX", badgeStyle: "bg-vip-gold text-white", title: "Palco Preferente", description: "Privacidad y confort con copa de cortesía en el intermedio.", price: 95 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Patio de Butacas", description: "Cercanía inmediata a los actores para captar cada gesto.", price: 40 },
    ],
  },
  {
    id: "indigo-music-festival",
    title: "Indigo Music Festival",
    category: "CONCIERTO",
    tagline: "El festival revelación del circuito alternativo",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0hjIajPExsJKa7RaHv4HoFjroTQmrC3G20rnCOCH__TMBuX-pLvI26-JvwhtELP-XxQ7m9WYP5hXG4q5Dz61ag6G7z6PwwrrTbrrJoLe0C09kFYUC1JabUXwAIMOErhEmNf4Cc3UGjkwGwhKjcDe5d1Zwz4Mg2n4tWdun3WPEXxTptFbgQukdAsPzsOfBzu0vUEfNTNHOKGJnYD7EyyQBTuvaGpccJNzstscbgLZAodGUwk0BHBv1NlnT-cUj7B4vbstKPEHER0Pe",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0hjIajPExsJKa7RaHv4HoFjroTQmrC3G20rnCOCH__TMBuX-pLvI26-JvwhtELP-XxQ7m9WYP5hXG4q5Dz61ag6G7z6PwwrrTbrrJoLe0C09kFYUC1JabUXwAIMOErhEmNf4Cc3UGjkwGwhKjcDe5d1Zwz4Mg2n4tWdun3WPEXxTptFbgQukdAsPzsOfBzu0vUEfNTNHOKGJnYD7EyyQBTuvaGpccJNzstscbgLZAodGUwk0BHBv1NlnT-cUj7B4vbstKPEHER0Pe",
    altText: "Indigo Music Festival",
    date: "22 MAY, 2024",
    time: "17:00",
    location: "MADRID",
    venue: "Parque Central",
    address: "Paseo de la Castellana 200, Madrid",
    price: 55,
    ticketType: "Destacado",
    ticketBadgeStyle: "vip",
    description: "Una jornada al aire libre con más de 12 bandas independientes, food trucks gourmet y mercadillo de arte sostenible.",
    ticketCategories: [
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Abono VIP Todo Incluido", description: "Acceso a zona lounge sombreada y 4 consumiciones incluidas.", price: 110 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Entrada General Early Bird", description: "Acceso completo a todos los conciertos del festival.", price: 55 },
    ],
  },
  {
    id: "noches-de-jazz",
    title: "Noches de Jazz & Blues",
    category: "CONCIERTO",
    tagline: "Las leyendas vivas del sonido afroamericano",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDplj48Bi3auGgPy91VxeRj042B5hUGuTysP3sjqmaY62HzH6nKoaSDsyww_YbDXjQlafdMsJraGLHanhdm_NNdcY5PlIPh7MnFvvG0Jl9f3S15U5VQERKcDQeT68RTR0CxKQxqTy37JESi9OalaifYG9_GR2jB1OiL6hdmeBsNJxncSF8Nu0StpC1k0AQpnz2iSHsKl_-RvPEpj5XwzSGhz9DpafrZF-n60lHzIZZzciliuK4q0antY06Hwd-Q2INX2Pn-iqhKZeP",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDplj48Bi3auGgPy91VxeRj042B5hUGuTysP3sjqmaY62HzH6nKoaSDsyww_YbDXjQlafdMsJraGLHanhdm_NNdcY5PlIPh7MnFvvG0Jl9f3S15U5VQERKcDQeT68RTR0CxKQxqTy37JESi9OalaifYG9_GR2jB1OiL6hdmeBsNJxncSF8Nu0StpC1k0AQpnz2iSHsKl_-RvPEpj5XwzSGhz9DpafrZF-n60lHzIZZzciliuK4q0antY06Hwd-Q2INX2Pn-iqhKZeP",
    altText: "Noches de Jazz & Blues",
    date: "25 MAY, 2024",
    time: "21:30",
    location: "MADRID",
    venue: "Teatro Principal",
    address: "Calle de Alcalá 15, Madrid",
    price: 38,
    ticketType: "Últimas plazas",
    ticketBadgeStyle: "general",
    description: "Una noche mágica donde los acordes de saxofón y la guitarra blues te transportarán a los mejores clubes de Chicago y Nueva Orleans.",
    ticketCategories: [
      { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "Mesa Club con Coctel", description: "Mesa baja exclusiva junto a la banda con servicio de coctelería.", price: 80 },
      { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Entrada General", description: "Butaca en patio central para disfrutar de la mejor acústica.", price: 38 },
    ],
  },
];

// Evento default enriquecido cuando un ID no tiene match específico
export const DEFAULT_EVENT: MockEvent = {
  id: "default",
  title: "Midnight Echoes: En Vivo",
  category: "CONCIERTO",
  tagline: "Tour Mundial 2024",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZjYk3TO8LsC4cDf1CDTf2evzsjOS6hcm3RTp_GL1TBtPGZPAEkw2LB1K_2FYIUqesxpwBH81gi4CUf6J4KWMCkwf0zhoVYcQNGzDbx-WJi0BFIkE9WfrpitVLR8-0suyZSY4mtkIMrzdEz6eb0THqNwC8OTpElcOxzSrrVHEF492Kyu7Isjkj-cvF9-lRhLjWCwXTiQIIVTnNptiwwJ8IkAvbQPiNp21CY7O15XrFqyHc46IArePF-6JkLD6-a4tBYsj-SNCOfJad",
  bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZjYk3TO8LsC4cDf1CDTf2evzsjOS6hcm3RTp_GL1TBtPGZPAEkw2LB1K_2FYIUqesxpwBH81gi4CUf6J4KWMCkwf0zhoVYcQNGzDbx-WJi0BFIkE9WfrpitVLR8-0suyZSY4mtkIMrzdEz6eb0THqNwC8OTpElcOxzSrrVHEF492Kyu7Isjkj-cvF9-lRhLjWCwXTiQIIVTnNptiwwJ8IkAvbQPiNp21CY7O15XrFqyHc46IArePF-6JkLD6-a4tBYsj-SNCOfJad",
  altText: "Midnight Echoes Live Concert",
  date: "15 DE OCTUBRE, 2024",
  time: "20:00",
  location: "MADRID",
  venue: "Estadio Nacional",
  address: "Paseo de la Castellana 144, Madrid",
  price: 75,
  ticketType: "VIP DISPONIBLE",
  ticketBadgeStyle: "vip",
  description: "Prepárate para la noche más espectacular del año. Midnight Echoes llega con una producción audiovisual sin precedentes. Tras agotar entradas en Londres y Nueva York, la banda presenta su nuevo álbum junto a sus más grandes éxitos en una experiencia sensorial que combina arte digital, sonido e iluminación futurista.",
  ticketCategories: [
    { id: "box", name: "BOX", badgeStyle: "bg-vip-gold text-white", title: "Experiencia Box", description: "Lounge privado, catering incluido, barra libre y parking VIP.", price: 299 },
    { id: "platinum", name: "PLATINUM", badgeStyle: "bg-slate-400 text-white", title: "Platinum Front", description: "Asientos reservados frente al escenario, vista directa sin obstáculos.", price: 185 },
    { id: "vip", name: "VIP", badgeStyle: "bg-electric-indigo text-white", title: "VIP Central", description: "Entrada exclusiva sin colas, grada preferente con vista panorámica total.", price: 120 },
    { id: "general", name: "GENERAL", badgeStyle: "bg-deep-slate text-white", title: "Entrada General", description: "Acceso a pista general. Disfruta de la energía pura del público.", price: 65 },
  ],
};

export function getMockEventById(id: string | number): MockEvent {
  const normalizedId = String(id).toLowerCase().trim();
  const match = MOCK_EVENTS.find(
    (e) => e.id.toLowerCase() === normalizedId || e.title.toLowerCase().includes(normalizedId)
  );

  return match || DEFAULT_EVENT;
}
