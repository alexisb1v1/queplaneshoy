"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getFeaturedEventsUseCase,
  getUpcomingEventsUseCase,
} from "../../index";
import { getCategoryById } from "../../constants/eventConstants";

interface SlideItem {
  id: string | number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
  ctaText: string;
  targetUrl: string;
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop";

const INSTITUTIONAL_SLIDE: SlideItem = {
  id: "qph-welcome",
  category: "Cartelera Oficial",
  title: "Descubre los mejores eventos en Perú",
  description:
    "Encuentra conciertos, obras de teatro, festivales y deportes con venta oficial de entradas y accesos 100% verificados.",
  imageUrl: DEFAULT_FALLBACK_IMAGE,
  altText: "Conciertos y eventos en Qué Planes Hoy",
  ctaText: "Explorar Cartelera",
  targetUrl: "/events",
};

export function HeroCarousel() {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar eventos estelares / destacados para el Hero Carousel desde la base de datos
  useEffect(() => {
    let isMounted = true;

    const loadHeroSlides = async () => {
      setIsLoading(true);

      // 1. Intentar cargar eventos destacados oficiales
      const featuredRes = await getFeaturedEventsUseCase.execute();
      let resolvedSlides: SlideItem[] = [];

      featuredRes.match(
        (featured) => {
          if (featured && featured.length > 0) {
            resolvedSlides = featured.map((item) => {
              const categoryInfo = getCategoryById(item.category);
              const targetUrl =
                item.hasLandingPage && item.slug ? `/e/${item.slug}` : `/events/${item.id}`;

              return {
                id: item.id,
                category: categoryInfo.label,
                title: item.title,
                description:
                  item.description ||
                  "Asegura tus entradas oficiales para este gran evento antes de que se agoten.",
                imageUrl: item.bannerUrl || DEFAULT_FALLBACK_IMAGE,
                altText: item.title,
                ctaText: item.hasLandingPage ? "Ver Experiencia" : "Comprar Entradas",
                targetUrl,
              };
            });
          }
        },
        () => {}
      );

      // 2. Si no hay destacados, fallback dinámico a los primeros eventos próximos en BD
      if (resolvedSlides.length === 0) {
        const upcomingRes = await getUpcomingEventsUseCase.execute();
        upcomingRes.match(
          (upcoming) => {
            if (upcoming && upcoming.length > 0) {
              resolvedSlides = upcoming.slice(0, 3).map((item) => {
                const categoryInfo = getCategoryById(item.category);
                const targetUrl =
                  item.hasLandingPage && item.slug ? `/e/${item.slug}` : `/events/${item.id}`;

                return {
                  id: item.id,
                  category: categoryInfo.label,
                  title: item.title,
                  description:
                    item.description ||
                    "Asegura tus entradas oficiales para este gran evento antes de que se agoten.",
                  imageUrl: item.imageUrl || DEFAULT_FALLBACK_IMAGE,
                  altText: item.title,
                  ctaText: item.hasLandingPage ? "Ver Experiencia" : "Comprar Entradas",
                  targetUrl,
                };
              });
            }
          },
          () => {}
        );
      }

      // 3. Fallback de contingencia institucional si no hay ningún evento publicado en BD
      if (resolvedSlides.length === 0) {
        resolvedSlides = [INSTITUTIONAL_SLIDE];
      }

      if (isMounted) {
        setSlides(resolvedSlides);
        setIsLoading(false);
      }
    };

    loadHeroSlides();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSlide = (index: number) => {
    setCurrentSlide(index);
    if (containerRef.current) {
      const slideWidth = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: index * slideWidth,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll logic cada 8 segundos si hay más de 1 slide
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      scrollToSlide(nextSlide);
    }, 8000);

    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

  // Skeleton Loader mientras cargan los datos reales desde la BD / Redis
  if (isLoading) {
    return (
      <section className="relative w-full h-[819px] min-h-[600px] overflow-hidden bg-slate-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute bottom-40 left-8 md:left-12 z-20 max-w-2xl px-4 md:px-0">
          <div className="h-6 w-28 bg-white/20 rounded-full mb-4" />
          <div className="h-12 w-3/4 bg-white/20 rounded-xl mb-4" />
          <div className="h-4 w-full bg-white/10 rounded mb-2" />
          <div className="h-4 w-2/3 bg-white/10 rounded mb-8" />
          <div className="h-14 w-48 bg-electric-indigo/40 rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[819px] min-h-[600px] overflow-hidden">
      {/* Slides Container */}
      <div
        ref={containerRef}
        className="qph-carousel-container w-full h-full qph-hide-scrollbar"
      >
        {slides.map((slide) => (
          <div key={slide.id} className="qph-carousel-item relative">
            {/* Dark Overlay for Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>

            {/* Background Image */}
            <img
              className="w-full h-full object-cover"
              src={slide.imageUrl}
              alt={slide.altText}
            />

            {/* Slide Content */}
            <div className="absolute bottom-40 left-8 md:left-12 z-20 max-w-2xl px-4 md:px-0">
              <span className="bg-electric-indigo text-white px-3 py-1 rounded-full qph-label-bold text-[10px] uppercase tracking-widest mb-4 inline-block shadow-sm">
                {slide.category}
              </span>
              <h1 className="qph-display-xl text-white mb-4 line-clamp-2">
                {slide.title}
              </h1>
              <p className="qph-body-lg text-white/80 mb-8 line-clamp-3">
                {slide.description}
              </p>
              <Link
                href={slide.targetUrl}
                className="bg-electric-indigo text-white px-8 py-4 rounded-xl qph-headline-md hover:scale-105 transition-transform duration-200 inline-block cursor-pointer shadow-lg shadow-electric-indigo/25 active:scale-95"
              >
                {slide.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Vertical Navigation Dots (Right side) solo si hay más de 1 slide */}
      {slides.length > 1 && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              aria-label={`Ir al slide ${index + 1}`}
              className={`w-2 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index ? "bg-white w-3 shadow-md" : "bg-white/50 hover:bg-white"
              }`}
              onClick={() => scrollToSlide(index)}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}
