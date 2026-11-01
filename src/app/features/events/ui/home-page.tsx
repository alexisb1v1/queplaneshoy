"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeroCarousel } from "./components/hero-carousel";
import { SearchBar } from "./components/search-bar";
import { EventCard, EventCardProps } from "./components/event-card";
import {
  getUpcomingEventsUseCase,
  getWeeklyFeaturedEventsUseCase,
  getWeekendEventsUseCase,
  HomeEventCardItem,
} from "../index";
import { getCategoryById } from "../constants/eventConstants";

// =========================================================================
// DATOS DE EVENTOS (SINCRONIZADOS CON STITCH PROJECT 13459271233978638733)
// =========================================================================

// 1. Eventos Próximos
const UPCOMING_EVENTS: EventCardProps[] = [
  {
    id: 1,
    title: "Echoes of Summer Tour",
    category: "concierto",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDHVY15DpfYzyH93Hw8X7x6UctHW54DfefNOboWhdivHf-ScywQF8yBmZWwZGhiGpYGZPObwBdB0HhNC4pEZnP8E0ggFQrAUuGgZ5Pt1ZJtIL8iKH53j99jFUrpBx5XCCTcdg4gecQES56Shq1fcGEOo_CadQ4XUcav8DgBIjKH2I9CID9XcUNx8MQFd1jM3rm-pjAqVtYL2PTtnniP7DJJ1s1HHUwo0nCw-tUJGlIZKAFYpuZhruFXU-9jlaODrQMOoQu9Ym1XY4vB",
    altText: "DJ actuando en un concierto de música electrónica",
    date: "14 OCT, 2024",
    location: "MADRID",
    price: 45,
    ticketType: "General",
    ticketBadgeStyle: "general",
    description: "Cierre de gira con los mejores sets de música electrónica y un show de visuales envolventes.",
    urgencyText: "Últimas 45 entradas",
    urgencyIcon: "hourglass_top",
  },
  {
    id: 2,
    title: "Vanguardia Rítmica",
    category: "teatro",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuoyPDVeB3IC2Ys_pTmUILUys8yJCuWCU63CJXY5DrJFQU83axPRERE8hLyMZc-3dmCYxFzocnaE1G12OPO8u2ZStiTYJDIJbZ9w3lt9Dc5xFgpCSAN1b02av_9gIeSOiQ5_MtfHBfVTka2Vp83LnpBE58QZOESlDZedrNlXRueK5Vrfh4ulDgt4O0meMR6jckbR7kdgbNwdDRZIoRqUIuVsCFPA4HiqYRPBRoScR6Fw8jdGPRe7Ncix_NpbXpD4P2QwjWtvCgE0xR",
    altText: "Espectáculo de ballet moderno en un espacio vanguardista",
    date: "18 OCT, 2024",
    location: "BARCELONA",
    price: 75,
    ticketType: "VIP DISPONIBLE",
    ticketBadgeStyle: "vip",
    description: "Una fusión magistral entre danza contemporánea y música de cámara en un escenario histórico.",
    urgencyText: "Alta demanda • Quedan pocas",
    urgencyIcon: "local_fire_department",
  },
  {
    id: 3,
    title: "Masters Cup Series",
    category: "deportes",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUB9_XEEj_ZDdk8n2xiDLa-Cye5or9W5oDua9zxoskGxUBWVzQ0x8Vi4-Xp_ugA7aBh5VXnLPXCzPKZk8lJtlUrX2Rb0zDc8wmyipFF908z8FX2cP3alyD7yB-HEWc3Fnr7mk9pS7iAECvBW2yOER8HS_pGV-Mo8IXbSxMDr4XGPRYrrooWRFTFYJW75CtkDRwM7b6jtldK2GPLEUCIOJs-japi4u5cpa21KLX9oAl-ro8PelmCVkbImHrRcwTLVRISfaPXnfCB5mG",
    altText: "Partido de tenis al atardecer en pista profesional",
    date: "22 OCT, 2024",
    location: "VALENCIA",
    price: 120,
    ticketType: "PLATINUM",
    ticketBadgeStyle: "platinum",
    description: "Semifinales internacionales con los atletas top del ranking en una jornada inolvidable.",
    urgencyText: "Zona Platinum casi agotada",
    urgencyIcon: "stars",
  },
  {
    id: 4,
    title: "Sunset Jazz Session",
    category: "concierto",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEL4eAbOCJp6-HVuKFQOkbMfF-GhV54vep61KRoDFrbtebQRAySMLmjv3-Ue0Iv21MDOUAv2aN-ULaUFLLXhSzPqnfmC--4zwXhM7wfJwiUt7H8RlpCFMdkLd2YIQnDMqiP3REOOEGred7luLvCrTbFt3txZiYwjJwT0fvXKPkL3CHkNwOFMPB5_sCl7_tvS7tBgYHkyqhIjJyb02QMqw9cVmYBdLHGcqp4nYrRyX7sV-fB4iH9Tac13LGmL2aC_Djn2JBja3sSYFL",
    altText: "Festival de jazz al aire libre al atardecer",
    date: "30 OCT, 2024",
    location: "MADRID",
    price: 30,
    ticketType: "General",
    ticketBadgeStyle: "general",
    description: "Sesión íntima al aire libre con leyendas del jazz fusión y vistas panorámicas del atardecer.",
    urgencyText: "Aforo limitado",
    urgencyIcon: "bolt",
  },
  {
    id: 12,
    title: "Cumbia All Stars & Amigos",
    category: "concierto",
    imageUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
    altText: "Fiesta y concierto de cumbia en vivo",
    date: "05 NOV, 2024",
    location: "LIMA",
    price: 35,
    ticketType: "General",
    ticketBadgeStyle: "general",
    description: "Una noche inolvidable al ritmo de la cumbia clásica y los mayores exponentes del género en vivo.",
    urgencyText: "Últimas 60 entradas",
    urgencyIcon: "hourglass_top",
  },
  {
    id: 13,
    title: "Stand Up: Terapia de Pareja",
    category: "comedia",
    imageUrl:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop",
    altText: "Monólogo de comedia stand up en teatro",
    date: "09 NOV, 2024",
    location: "AREQUIPA",
    price: 40,
    ticketType: "VIP DISPONIBLE",
    ticketBadgeStyle: "vip",
    description: "Un recorrido cómico e irreverente por las situaciones cotidianas del amor y la convivencia.",
    urgencyText: "Pocas mesas disponibles",
    urgencyIcon: "local_fire_department",
  },
  {
    id: 14,
    title: "Festival Sabores del Perú",
    category: "gastronomia",
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    altText: "Feria gastronómica y degustación de comida peruana",
    date: "12 NOV, 2024",
    location: "TRUJILLO",
    price: 25,
    ticketType: "General",
    ticketBadgeStyle: "general",
    description: "Feria culinaria con los mejores chefs, catas de pisco, cocina fusión y música criolla en directo.",
    urgencyText: "Aforo limitado",
    urgencyIcon: "bolt",
  },
  {
    id: 15,
    title: "Rock & Sinfonía: Leyendas",
    category: "concierto",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    altText: "Concierto de rock con orquesta sinfónica",
    date: "15 NOV, 2024",
    location: "LIMA",
    price: 85,
    ticketType: "PLATINUM",
    ticketBadgeStyle: "platinum",
    description: "Los grandes himnos del rock internacional reinterpretados por orquesta filarmónica y banda de rock.",
    urgencyText: "Zona Platinum al 90%",
    urgencyIcon: "stars",
  },
];

// 2. Eventos Destacados de la Semana (Selección Editorial de Stitch)
interface FeaturedWeeklyEvent {
  id: number;
  title: string;
  category: string;
  badge: string;
  badgeStyle: "error" | "vip" | "general";
  imageUrl: string;
  date: string;
  location: string;
  description: string;
  urgencyText: string;
  urgencyIcon: string;
  price: number;
}

const WEEKLY_FEATURED_EVENTS: FeaturedWeeklyEvent[] = [
  {
    id: 5,
    title: "Sinfonía de las Estrellas",
    category: "CLÁSICA",
    badge: "ÚLTIMAS ENTRADAS",
    badgeStyle: "error",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7E0UFjzRDXfBB--rYurc0cGOw0-4yYkeLqvtDdHYkOcCZahMLGDuv2UAW-bxdIc8_xenxf44YA9WJFeQ-kryVlX0JFEfT7uPOwV764-9zvhRqXbMqIIQKmsD6nWmN43ejHwrf3j4qZ8SNIpjpMGoqePCdQWnLFfJRfBe_uCm8WYCqPraQ0NP5Zrdu4XT8HQJQ2QL0opuHJHZzFOBQp52NINZmj3z4k0ViWXAz3J6OcllZRuQzCy-QvWhvf6nwNPIkCKdKhW0fJPkT",
    date: "16 NOV, 2024",
    location: "AUDITORIO NACIONAL",
    description: "Homenaje a las bandas sonoras más icónicas del cine contemporáneo con más de 90 músicos en directo.",
    urgencyText: "Solo quedan 12 butacas",
    urgencyIcon: "hourglass_top",
    price: 38,
  },
  {
    id: 6,
    title: "EuroLeague Clasificatorio",
    category: "BALONCESTO",
    badge: "VIP DISPONIBLE",
    badgeStyle: "vip",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZRf5b2CiwcTa73hpU1YS2bQJeb8P8J77zLnPoakMwOAt7V-XEt1kILsDA1VnrdUUjullHbqTMl4AtQPvnTDxq-GMdQTmJWtAfek1mG6X9oLiBgvHw1j2k0YGo90mUZwn5jvkJEmfhgNRF6QQ5PRQzVehB5FbjTQs3FEn2rLMx4c7ug1qp6bb2Vq3TuVU-4LStN-tEWhVRnxjU1fK8_KN1e_lwxypSsBY8h_jAfWG36bugpW3gDSO2icAmnrzgVyugH5W4q8j7Cl0C",
    date: "19 NOV, 2024",
    location: "WI-ZINK CENTER",
    description: "El choque definitivo por el liderazgo del grupo en una noche de máxima tensión sobre la pista.",
    urgencyText: "92% vendido • ¡Última semana!",
    urgencyIcon: "bolt",
    price: 28,
  },
  {
    id: 7,
    title: "Midnight Groove Fest",
    category: "FESTIVAL",
    badge: "GENERAL",
    badgeStyle: "general",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArvALp2f189WFx8f0LzakoBfIG4x9xtX2yELKpqcah5IKtC9OOLdg2NVNBIY7UylA0XMle6rcaUuQoYPDX5n9-7T3KVVVfFJSoFdXXLW-84Z0SLk2p4Uk9EifxKNnMDBjEbe0GIIFzIz8rfZTmDjsTSnmkJ0QcwZCjXLpreh3wkKONf6U5GkqUziZUKXWLad8FOMPZZOwoIJmc4obi9caQKG25SJin0IlLKoXwSjyNQh_QLw76dbziUfyj9bLGLWiVceQMh_G3VjkI",
    date: "23 NOV, 2024",
    location: "PARC DEL FÒRUM",
    description: "12 horas continuadas de música electrónica, visuales envolventes y experiencias gastronómicas.",
    urgencyText: "🔥 Más de 200 entradas hoy",
    urgencyIcon: "local_fire_department",
    price: 52,
  },
  {
    id: 8,
    title: "Noche de Monólogos Top",
    category: "COMEDIA",
    badge: "GENERAL",
    badgeStyle: "general",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBifKJs2zCLJ21dWBYTNT1ATyvcDIaj7OA-duslvbS3C58Dc3sn4TODUamdiTgHbQ1hWJXAzxZOhbv7S77GwkZTPEV6brn_dNl7LDcahYhJdY5kmmuRaj-KWz19yNiZc84dFWs-gJnVf30oijXVpM-abXcFk294wbyqHRCQCJV7J4Zaf_K62_bSCqWfajU8PO1nRkOdmOurG39yqQaPgaLR45DYUmDGIsl-lWBdsuYjVMnUvX6SkC_DYGOQTcCcEX0lxyG-THTKtVc_",
    date: "28 NOV, 2024",
    location: "TEATRO ALCÁZAR",
    description: "Los cuatro mejores cómicos del panorama nacional juntos en un espectáculo hilarante e irrepetible.",
    urgencyText: "Top 1 en ventas de comedia",
    urgencyIcon: "trending_up",
    price: 22,
  },
  {
    id: 16,
    title: "Electronic Waves Sunset",
    category: "ELECTRÓNICA",
    badge: "VIP DISPONIBLE",
    badgeStyle: "vip",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    date: "01 DIC, 2024",
    location: "MIRAFLORES",
    description: "El festival playero de música electrónica más esperado de la temporada con DJs internacionales.",
    urgencyText: "Últimas 30 entradas VIP",
    urgencyIcon: "stars",
    price: 55,
  },
  {
    id: 17,
    title: "El Rey León: El Musical",
    category: "TEATRO",
    badge: "ÚLTIMAS ENTRADAS",
    badgeStyle: "error",
    imageUrl:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop",
    date: "04 DIC, 2024",
    location: "TEATRO MUNICIPAL",
    description: "La conmovedora historia que cautivó al mundo en una puesta en escena deslumbrante con vestuarios de alta costura.",
    urgencyText: "Solo quedan 18 butacas",
    urgencyIcon: "hourglass_top",
    price: 65,
  },
  {
    id: 18,
    title: "Maratón Internacional Nocturna",
    category: "DEPORTES",
    badge: "GENERAL",
    badgeStyle: "general",
    imageUrl:
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=800&auto=format&fit=crop",
    date: "08 DIC, 2024",
    location: "COSTA VERDE",
    description: "Carrera oficial de 10K, 21K y 42K frente al mar con kit de corredor oficial y cronometraje por chip.",
    urgencyText: "Inscripciones cierran pronto",
    urgencyIcon: "bolt",
    price: 45,
  },
  {
    id: 19,
    title: "Indie Acoustic Sessions",
    category: "CONCIERTO",
    badge: "GENERAL",
    badgeStyle: "general",
    imageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    date: "10 DIC, 2024",
    location: "BARRANCO",
    description: "Una noche acústica exclusiva con compositores independientes en un ambiente bohemio e íntimo.",
    urgencyText: "Aforo íntimo • 100 personas",
    urgencyIcon: "local_fire_department",
    price: 32,
  },
];

// 3. Categorías Oficiales de Qué Planes Hoy
interface CategoryChip {
  id: string;
  name: string;
  icon: string;
  bgClass: string;
  textClass: string;
}

const CATEGORY_CHIPS: CategoryChip[] = [
  {
    id: "CONCERTS",
    name: "Conciertos",
    icon: "music_note",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-600",
  },
  {
    id: "THEATER",
    name: "Teatro & Musicales",
    icon: "theater_comedy",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-600",
  },
  {
    id: "SPORTS",
    name: "Deportes",
    icon: "sports_soccer",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-600",
  },
  {
    id: "FESTIVALS",
    name: "Festivales",
    icon: "festival",
    bgClass: "bg-pink-500/10",
    textClass: "text-pink-600",
  },
  {
    id: "COMEDY",
    name: "Comedia & Stand Up",
    icon: "sentiment_very_satisfied",
    bgClass: "bg-yellow-500/10",
    textClass: "text-amber-600",
  },
  {
    id: "GASTRONOMY",
    name: "Gastronomía",
    icon: "restaurant",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600",
  },
];

// 4. Planes para Este Fin de Semana (Stitch)
interface WeekendPlan {
  id: number;
  title: string;
  categoryBadge: string;
  statusBadge: string;
  statusStyle: "destacado" | "agotandose" | "platinum";
  imageUrl: string;
  date: string;
  location: string;
  description: string;
  price: number;
}

const WEEKEND_PLANS: WeekendPlan[] = [
  {
    id: 9,
    title: "Indie Sounds Winter Fest",
    categoryBadge: "FESTIVAL INDIE",
    statusBadge: "DESTACADO",
    statusStyle: "destacado",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBr71UQlSs2FurLsTGl6gPOxEX9hPMWEvCnfbWa9DBE-cUs538DUDJOqNPrp58TlvmNywhioPq7t5zgFDtsHuWE1CaR7V00dAs7D9el7hAVDM4tkAzeIn0PsE5X6YDxY6_Bq4L6zeO0xj3VruNNUlS7xdsextrNrv0sZZibfkJdUzfS6VSn73BW3H1n_IxShci9L0Bdy-kTWkKaFQp4Fe8zsxvXK8SCd517vfmIyU2X_l2s0lNh_9KazuVBowqKJypvC64xoScIFOvS",
    date: "SÁB 07 DIC",
    location: "SALA LA RIVIERA",
    description: "Actuaciones exclusivas de bandas revelación nacionales e internacionales en cabina acústica.",
    price: 35,
  },
  {
    id: 10,
    title: "Gran Derbi de la Capital",
    categoryBadge: "FÚTBOL",
    statusBadge: "AGOTÁNDOSE",
    statusStyle: "agotandose",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABlww-UlQho4dnh_cvYTNyKXkTyDxehNVrtHLhU1Z_ge3DlPd43J98PLGEtxaUgVGG38p0POv9ODQmGUdZc-pT1MJXATFftbvvOc02PD4w3ZH-8AkuZItxYh2wdOBGfiF2zyQxU2yHdoADM_lRPT3lzgya6a0Rtv8TiU1FZZU3QYfnigz2nyIh2PPmFuqaTlHgVqLyaMEEpU60DKtSQ70ssEs-972RdR9yhh2sEQmwoDYbTK_gr3DpBt3UQ4uvOBenJG4w8P6SLlTJ",
    date: "DOM 08 DIC",
    location: "ESTADIO METROPOLITANO",
    description: "El encuentro futbolístico más vibrante de la liga regular. Asientos en tribuna central y palcos.",
    price: 85,
  },
  {
    id: 11,
    title: "Gourmet & Wine Sessions",
    categoryBadge: "GASTRONOMÍA",
    statusBadge: "PLATINUM",
    statusStyle: "platinum",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBy-wUVgXEhItgD7xM7FmRd4wZkk3Daggm3B3DNGO4daZVlaQloOxBFcILLpSFZg_81ZvUtB-Ku7ifn0_O-fnqu6WascuRJcaQDLMK49-kwrhwD6PDXA8Bv5oUkW2UnFsu6znIwRhdSWC9T2RSRFfJnfDQ8-zZ2_SYIgphpzobyl293G5XpKHY8PxLMxuCKU5EPz6cjfQwTv6jQ16XXwKIrcr0nZlYwqoSMPXhyvqjUgab-EtHaryokqzykL1U0IW7zwiouG6GdI2hE",
    date: "SÁB 14 DIC",
    location: "MERCADO DEL ARTE",
    description: "Maridaje de vinos de alta gama y tapas de autor preparados en vivo por chefs con estrella Michelin.",
    price: 65,
  },
];

function formatEventDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.toLocaleDateString("es-PE", { day: "2-digit" });
  const month = d.toLocaleDateString("es-PE", { month: "short" }).toUpperCase().replace(".", "");
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

function homeCardToEventCardProps(item: HomeEventCardItem): EventCardProps {
  const cat = getCategoryById(item.category);
  return {
    id: item.id,
    slug: item.slug,
    hasLandingPage: item.hasLandingPage,
    title: item.title,
    category: cat?.label || item.category,
    imageUrl:
      item.imageUrl ||
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
    altText: item.title,
    date: formatEventDate(item.date),
    location: item.city || item.venue || "PERÚ",
    price: item.minPrice,
    ticketType: item.ticketType || "General",
    ticketBadgeStyle: item.ticketBadgeStyle || "general",
    description: item.description || "Acceso oficial garantizado para esta función en directo.",
    urgencyText: item.urgencyBadge?.text || "Aforo limitado",
    urgencyIcon: item.urgencyBadge?.icon || "bolt",
    urgencyType: item.urgencyBadge?.type || "info",
  };
}

const INITIAL_WEEKLY_FEATURED: EventCardProps[] = WEEKLY_FEATURED_EVENTS.map((ev) => ({
  id: ev.id,
  title: ev.title,
  category: ev.category,
  imageUrl: ev.imageUrl,
  altText: ev.title,
  date: ev.date,
  location: ev.location,
  price: ev.price,
  ticketType: ev.badge,
  ticketBadgeStyle: ev.badgeStyle,
  description: ev.description,
  urgencyText: ev.urgencyText,
  urgencyIcon: ev.urgencyIcon,
  urgencyType: ev.badgeStyle === "error" ? "critical" : "info",
}));

const INITIAL_WEEKEND_PLANS: EventCardProps[] = WEEKEND_PLANS.map((plan) => ({
  id: plan.id,
  title: plan.title,
  category: plan.categoryBadge,
  imageUrl: plan.imageUrl,
  altText: plan.title,
  date: plan.date,
  location: plan.location,
  price: plan.price,
  ticketType: plan.statusBadge,
  ticketBadgeStyle:
    plan.statusStyle === "agotandose" ? "error" : plan.statusStyle === "platinum" ? "platinum" : "vip",
  description: plan.description,
  urgencyText: plan.statusBadge === "AGOTÁNDOSE" ? "Últimas plazas disponibles" : "Alta demanda",
  urgencyIcon: plan.statusStyle === "agotandose" ? "hourglass_top" : "trending_up",
  urgencyType: plan.statusStyle === "agotandose" ? "critical" : "high_demand",
}));

export default function HomePage() {
  const [activeMobileFilter, setActiveMobileFilter] = useState("Todo");
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [upcomingEvents, setUpcomingEvents] = useState<EventCardProps[]>(UPCOMING_EVENTS);
  const [weeklyFeaturedEvents, setWeeklyFeaturedEvents] = useState<EventCardProps[]>(INITIAL_WEEKLY_FEATURED);
  const [weekendPlans, setWeekendPlans] = useState<EventCardProps[]>(INITIAL_WEEKEND_PLANS);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Cargar Próximos Eventos desde Redis / Backend
    getUpcomingEventsUseCase.execute().match(
      (items) => {
        if (items && items.length > 0) {
          setUpcomingEvents(items.map(homeCardToEventCardProps));
        }
      },
      () => {}
    );

    // 2. Cargar Destacados Semanales desde Redis / Backend
    getWeeklyFeaturedEventsUseCase.execute().match(
      (items) => {
        if (items && items.length > 0) {
          setWeeklyFeaturedEvents(items.map(homeCardToEventCardProps));
        }
      },
      () => {}
    );

    // 3. Cargar Planes de Fin de Semana desde Redis / Backend
    getWeekendEventsUseCase.execute().match(
      (items) => {
        if (items && items.length > 0) {
          setWeekendPlans(items.map(homeCardToEventCardProps));
        }
      },
      () => {}
    );
  }, []);

  const scrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = 380;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCategoryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* =========================================================================
          VISTA MÓVIL (STITCH STYLE)
         ========================================================================= */}
      <div className="block md:hidden bg-background min-h-screen pb-24 text-on-background">
        
        {/* Barra de Búsqueda Móvil */}
        <section className="px-4 py-4">
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

        {/* Carrusel de Destacados Móvil */}
        <section className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Destacados</h2>
            <a className="text-electric-indigo qph-label-bold text-xs" href="#">Ver todos</a>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory qph-hide-scrollbar px-4 gap-4 pb-4">
            
            {/* Item 1 */}
            <div className="min-w-[85%] snap-center rounded-2xl overflow-hidden relative aspect-[3/4] shadow-md border border-surface-variant group flex-none">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/20 to-transparent z-10" />
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0hjIajPExsJKa7RaHv4HoFjroTQmrC3G20rnCOCH__TMBuX-pLvI26-JvwhtELP-XxQ7m9WYP5hXG4q5Dz61ag6G7z6PwwrrTbrrJoLe0C09kFYUC1JabUXwAIMOErhEmNf4Cc3UGjkwGwhKjcDe5d1Zwz4Mg2n4tWdun3WPEXxTptFbgQukdAsPzsOfBzu0vUEfNTNHOKGJnYD7EyyQBTuvaGpccJNzstscbgLZAodGUwk0BHBv1NlnT-cUj7B4vbstKPEHER0Pe"
                alt="Indigo Music Festival"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <span className="inline-block px-3 py-1 bg-vip-gold text-white text-[10px] qph-label-bold rounded-full uppercase mb-2">
                  Destacado
                </span>
                <h3 className="text-white qph-headline-md text-[20px] mb-1 font-semibold">Neon Pulse Festival</h3>
                <p className="text-platinum-silver qph-body-md text-sm mb-4">Parque Central • 22 de Mayo</p>
                <Link
                  href="/checkout"
                  className="w-full py-3 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer block text-center shadow-md shadow-electric-indigo/30"
                >
                  Comprar Entradas
                </Link>
              </div>
            </div>

            {/* Item 2 */}
            <div className="min-w-[85%] snap-center rounded-2xl overflow-hidden relative aspect-[3/4] shadow-md border border-surface-variant group flex-none">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-slate via-deep-slate/20 to-transparent z-10" />
              <img
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDplj48Bi3auGgPy91VxeRj042B5hUGuTysP3sjqmaY62HzH6nKoaSDsyww_YbDXjQlafdMsJraGLHanhdm_NNdcY5PlIPh7MnFvvG0Jl9f3S15U5VQERKcDQeT68RTR0CxKQxqTy37JESi9OalaifYG9_GR2jB1OiL6hdmeBsNJxncSF8Nu0StpC1k0AQpnz2iSHsKl_-RvPEpj5XwzSGhz9DpafrZF-n60lHzIZZzciliuK4q0antY06Hwd-Q2INX2Pn-iqhKZeP"
                alt="Noches de Jazz & Blues"
              />
              <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                <span className="inline-block px-3 py-1 bg-electric-indigo text-white text-[10px] qph-label-bold rounded-full uppercase mb-2">
                  Últimas plazas
                </span>
                <h3 className="text-white qph-headline-md text-[20px] mb-1 font-semibold">Noches de Jazz &amp; Blues</h3>
                <p className="text-platinum-silver qph-body-md text-sm mb-4">Teatro Principal • 25 de Mayo</p>
                <Link
                  href="/events/4"
                  className="w-full py-3 bg-electric-indigo text-white rounded-lg qph-label-bold hover:bg-primary transition-colors cursor-pointer block text-center shadow-md shadow-electric-indigo/30"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Chips de Categorías Móvil */}
        <section className="mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Explora por Categoría</h2>
            <Link
              href="/events"
              className="text-electric-indigo text-xs font-semibold hover:underline flex items-center gap-0.5"
            >
              Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto qph-hide-scrollbar px-4 gap-2.5 pb-2 scroll-smooth">
            {CATEGORY_CHIPS.map((cat) => {
              const isSelected = activeMobileFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveMobileFilter(isSelected ? "Todo" : cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap qph-label-bold text-xs shadow-xs transition-all flex-none cursor-pointer ${
                    isSelected
                      ? "bg-electric-indigo text-white border border-electric-indigo"
                      : "bg-white text-on-surface border border-surface-variant hover:bg-surface-gray"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isSelected ? "text-white" : cat.textClass}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Eventos Próximos Móvil */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="qph-headline-lg text-[20px] font-bold text-deep-slate">Eventos Próximos</h2>
          </div>
          <div className="flex flex-col gap-6">
            {upcomingEvents.filter((event) => {
              if (activeMobileFilter === "Todo") return true;
              const catMap: Record<string, string> = {
                CONCERTS: "concierto",
                THEATER: "teatro",
                SPORTS: "deportes",
                FESTIVALS: "festivales",
                COMEDY: "comedia",
                GASTRONOMY: "gastronomia",
              };
              const target = (catMap[activeMobileFilter] || activeMobileFilter).toLowerCase();
              return event.category.toLowerCase().includes(target) || target.includes(event.category.toLowerCase());
            }).map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-surface-variant flex flex-col group active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="aspect-[16/9] w-full relative">
                  <img className="w-full h-full object-cover" src={event.imageUrl} alt={event.altText} />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-center shadow-xs border border-surface-variant/50">
                    <span className="block text-electric-indigo qph-label-bold text-[16px] font-bold">
                      {event.date.split(" ")[0]}
                    </span>
                    <span className="block text-on-surface-variant text-[10px] uppercase qph-label-bold">
                      {event.date.split(" ")[1]}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="qph-headline-md text-[20px] text-on-surface leading-tight font-semibold group-hover:text-electric-indigo transition-colors">
                      {event.title}
                    </h4>
                    <span className="text-electric-indigo qph-price-tag text-[20px] font-bold">
                      Desde S/. {event.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="qph-body-md text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-surface-gray border border-surface-variant/40 text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">
                      {event.category}
                    </span>
                    <span className="px-2 py-0.5 bg-surface-gray border border-surface-variant/40 text-on-secondary-fixed-variant text-[10px] qph-label-bold rounded uppercase">
                      {event.ticketType}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Móvil */}
        <section className="px-4 py-8 bg-deep-slate rounded-3xl mx-4 mb-10 text-center text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="qph-headline-lg text-[20px] font-bold mb-2">No te pierdas de nada</h3>
            <p className="text-platinum-silver qph-body-md text-sm mb-6">
              Recibe alertas personalizadas para tus eventos favoritos directamente en tu móvil.
            </p>
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
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-electric-indigo/20 rounded-full blur-3xl" />
        </section>
      </div>

      {/* =========================================================================
          VISTA ESCRITORIO (JERARQUÍA OPTIMIZADA DE STITCH)
         ========================================================================= */}
      <div className="hidden md:block flex-1 w-full bg-background">
        
        {/* 1. Hero Section con Carrusel & Search Overlay */}
        <div className="relative w-full">
          <HeroCarousel />
          <SearchBar />
        </div>

        {/* 2. Explora por Categoría (HORIZONTAL ENRICHED CHIPS DE STITCH) */}
        <section className="max-w-container-max mx-auto px-margin-x pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="qph-headline-lg text-deep-slate">Explora por Categoría</h2>
              <p className="qph-body-md text-on-surface-variant">
                Encuentra planes según tus gustos e intereses.
              </p>
            </div>

            {/* Controles de Navegación Horizontal */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCategories("left")}
                aria-label="Desplazar categorías hacia la izquierda"
                className="w-10 h-10 rounded-full border border-surface-variant bg-white hover:bg-surface-gray text-deep-slate shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:border-electric-indigo"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                aria-label="Desplazar categorías hacia la derecha"
                className="w-10 h-10 rounded-full border border-surface-variant bg-white hover:bg-surface-gray text-deep-slate shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:border-electric-indigo"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            onWheel={handleCategoryWheel}
            className="flex items-center gap-3.5 overflow-x-auto qph-hide-scrollbar pb-3 scroll-smooth select-none"
          >
            {CATEGORY_CHIPS.map((chip) => (
              <Link
                key={chip.id}
                href={`/events?category=${chip.id.toLowerCase()}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-surface-variant hover:border-electric-indigo shadow-xs hover:shadow-sm transition-all group flex-none cursor-pointer active:scale-[0.98]"
              >
                <span
                  className={`w-9 h-9 rounded-xl ${chip.bgClass} ${chip.textClass} flex items-center justify-center group-hover:bg-electric-indigo group-hover:text-white transition-colors`}
                >
                  <span className="material-symbols-outlined text-lg">{chip.icon}</span>
                </span>
                <span className="font-label-bold text-label-bold text-on-surface group-hover:text-electric-indigo transition-colors whitespace-nowrap">
                  {chip.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Eventos Próximos */}
        <section className="max-w-container-max mx-auto px-margin-x pt-4 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="qph-headline-lg text-deep-slate mb-1">Eventos Próximos</h2>
              <p className="qph-body-md text-on-surface-variant">
                Los espectáculos más esperados que están a punto de comenzar.
              </p>
            </div>
            <Link
              href="/events"
              className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </section>

        {/* 4. Eventos Destacados de la Semana (SELECCIÓN EDITORIAL - STITCH REQUIREMENT) */}
        <section className="max-w-container-max mx-auto px-margin-x pt-4 pb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-electric-indigo text-lg">bolt</span>
                <span className="font-label-bold text-[12px] text-electric-indigo uppercase tracking-wider">
                  Selección Editorial
                </span>
              </div>
              <h2 className="qph-headline-lg text-deep-slate">Eventos Destacados de la Semana</h2>
              <p className="qph-body-md text-on-surface-variant">
                Las citas culturales y de entretenimiento imprescindibles en tu ciudad.
              </p>
            </div>
            <Link
              href="/events"
              className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              Ver cartelera completa <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {weeklyFeaturedEvents.map((ev) => (
              <EventCard key={ev.id} {...ev} />
            ))}
          </div>
        </section>

        {/* 4. Planes para Este Fin de Semana (TENDENCIAS Y MÁS POPULARES - STITCH) */}
        <section className="max-w-container-max mx-auto px-margin-x pt-4 pb-12 mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-vip-gold text-lg">trending_up</span>
                <span className="font-label-bold text-[12px] text-vip-gold uppercase tracking-wider">
                  Tendencias &amp; Más Populares
                </span>
              </div>
              <h2 className="qph-headline-lg text-deep-slate">Planes para Este Fin de Semana</h2>
              <p className="qph-body-md text-on-surface-variant">
                Las experiencias con mayor demanda y valoraciones más altas de la comunidad.
              </p>
            </div>
            <Link
              href="/events"
              className="text-electric-indigo qph-label-bold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              Ver ranking completo <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {weekendPlans.map((plan) => (
              <EventCard key={plan.id} {...plan} />
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
