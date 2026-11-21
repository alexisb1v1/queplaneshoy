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
  imageUrl: string;
  altText: string;
  ctaText: string;
  targetUrl: string;
  date?: string;
  location?: string;
  price?: number;
  hasBannerText?: boolean;
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop";

const INSTITUTIONAL_SLIDE: SlideItem = {
  id: "qph-welcome",
  category: "Cartelera Oficial",
  title: "Descubre los mejores eventos en Perú",
  imageUrl: DEFAULT_FALLBACK_IMAGE,
  altText: "Conciertos y eventos en Qué Planes Hoy",
  ctaText: "Explorar Cartelera",
  targetUrl: "/events",
  location: "Todo el Perú",
};

interface HeroCarouselProps {
  items?: {
    id: string | number;
    publicUuid?: string;
    slug?: string;
    hasLandingPage?: boolean;
    title: string;
    category: string;
    imageUrl: string;
    bannerUrl?: string;
    altText?: string;
    date: string;
    location: string;
    price: number;
    hasBannerText?: boolean;
  }[];
  isLoading?: boolean;
}

export function HeroCarousel({
  items,
  isLoading: externalLoading,
}: HeroCarouselProps = {}) {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [internalLoading, setInternalLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLoading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  // Sincronizar o cargar eventos estelares / destacados para el Hero Carousel
  useEffect(() => {
    let isMounted = true;

    // Si los items son administrados externamente por HomePage
    if (items !== undefined) {
      if (items.length > 0) {
        const resolvedSlides: SlideItem[] = items.map((item) => {
          const secureId = item.publicUuid || item.slug || item.id;
          const targetUrl =
            item.hasLandingPage && item.slug
              ? `/e/${item.slug}`
              : `/events/${secureId}`;

          return {
            id: item.id,
            category: item.category,
            title: item.title,
            imageUrl:
              (item as any).bannerUrl ||
              item.imageUrl ||
              DEFAULT_FALLBACK_IMAGE,
            altText: item.altText || item.title,
            ctaText: item.hasLandingPage
              ? "Ver Experiencia"
              : "Comprar Entradas",
            targetUrl,
            date: item.date,
            location: item.location,
            price: item.price,
            hasBannerText: item.hasBannerText || false,
          };
        });

        if (isMounted) {
          setSlides(resolvedSlides);
          setInternalLoading(false);
        }
      } else if (!externalLoading) {
        if (isMounted) {
          setSlides([INSTITUTIONAL_SLIDE]);
          setInternalLoading(false);
        }
      }
      return;
    }

    const loadHeroSlides = async () => {
      setInternalLoading(true);

      // 1. Intentar cargar eventos destacados oficiales
      const featuredRes = await getFeaturedEventsUseCase.execute();
      let resolvedSlides: SlideItem[] = [];

      featuredRes.match(
        (featured) => {
          if (featured && featured.length > 0) {
            resolvedSlides = featured.map((item) => {
              const categoryInfo = getCategoryById(item.category);
              const secureId = item.publicUuid || item.slug || item.id;
              const targetUrl =
                item.hasLandingPage && item.slug
                  ? `/e/${item.slug}`
                  : `/events/${secureId}`;

              return {
                id: item.id,
                category: categoryInfo.label,
                title: item.title,
                imageUrl: item.bannerUrl || DEFAULT_FALLBACK_IMAGE,
                altText: item.title,
                ctaText: item.hasLandingPage
                  ? "Ver Experiencia"
                  : "Comprar Entradas",
                targetUrl,
                location: item.city || item.venue || "PERÚ",
                price: item.minPrice,
                hasBannerText: (item as any).hasBannerText || false,
              };
            });
          }
        },
        () => { },
      );

      // 2. Fallback dinámico a los primeros eventos próximos en BD
      if (resolvedSlides.length === 0) {
        const upcomingRes = await getUpcomingEventsUseCase.execute();
        upcomingRes.match(
          (upcoming) => {
            if (upcoming && upcoming.length > 0) {
              resolvedSlides = upcoming.slice(0, 5).map((item) => {
                const categoryInfo = getCategoryById(item.category);
                const secureId = item.publicUuid || item.slug || item.id;
                const targetUrl =
                  item.hasLandingPage && item.slug
                    ? `/e/${item.slug}`
                    : `/events/${secureId}`;

                return {
                  id: item.id,
                  category: categoryInfo.label,
                  title: item.title,
                  imageUrl: item.imageUrl || DEFAULT_FALLBACK_IMAGE,
                  altText: item.title,
                  ctaText: item.hasLandingPage
                    ? "Ver Experiencia"
                    : "Comprar Entradas",
                  targetUrl,
                  location: item.city || item.venue || "PERÚ",
                  price: item.minPrice,
                };
              });
            }
          },
          () => { },
        );
      }

      // 3. Fallback de contingencia institucional
      if (resolvedSlides.length === 0) {
        resolvedSlides = [INSTITUTIONAL_SLIDE];
      }

      if (isMounted) {
        setSlides(resolvedSlides);
        setInternalLoading(false);
      }
    };

    loadHeroSlides();

    return () => {
      isMounted = false;
    };
  }, [items]);

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
      <section className="relative w-full h-[500px] lg:h-[540px] min-h-[440px] overflow-hidden bg-slate-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute bottom-28 md:bottom-24 left-8 md:left-12 z-20 max-w-2xl px-4 md:px-0">
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
    <section className="relative w-full h-[500px] lg:h-[540px] min-h-[440px] overflow-hidden">
      {/* Slides Container */}
      <div
        ref={containerRef}
        className="qph-carousel-container w-full h-full qph-hide-scrollbar"
      >
        {slides.map((slide) => (
          <div key={slide.id} className="qph-carousel-item relative">
            {/* Si el banner ya incluye textos gráficos, no oscurecemos agresivamente */}
            <div
              className={`absolute inset-0 z-10 ${
                slide.hasBannerText
                  ? "bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
                  : "bg-gradient-to-t from-black via-black/20 to-transparent"
              }`}
            />

            {/* Background Image */}
            <Link href={slide.targetUrl} className="block w-full h-full">
              <img
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                src={slide.imageUrl}
                alt={slide.altText}
              />
            </Link>

            {/* Slide Content: Solo se sobreimprime si el banner NO incluye textos gráficos */}
            {!slide.hasBannerText ? (
              <div className="absolute bottom-28 md:bottom-24 left-8 md:left-12 z-20 max-w-2xl px-4 md:px-0">
                <span className="bg-electric-indigo text-white px-3 py-1 rounded-full qph-label-bold text-[11px] uppercase tracking-wider mb-3 inline-block shadow-sm">
                  {slide.category}
                </span>

                {slide.date && (
                  <div className="flex items-center gap-2 mb-2 text-white/90 text-sm font-semibold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px] text-electric-indigo">
                      calendar_today
                    </span>
                    <span>{slide.date}</span>
                  </div>
                )}

                <h1 className="qph-display-xl text-white mb-2 line-clamp-2">
                  {slide.title}
                </h1>

                {slide.location && (
                  <p className="text-white/80 text-sm sm:text-base flex items-center gap-1.5 mb-6">
                    <span className="material-symbols-outlined text-[18px] text-platinum-silver">
                      location_on
                    </span>
                    <span>{slide.location}</span>
                  </p>
                )}

                <Link
                  href={slide.targetUrl}
                  className="bg-electric-indigo hover:bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>
                    {slide.ctaText}
                    {slide.price && slide.price > 0
                      ? ` • Desde S/ ${slide.price}`
                      : ""}
                  </span>
                </Link>
              </div>
            ) : (
              /* Si ya tiene texto gráfico: botón de acción sutil al pie para no tapar el arte */
              <div className="absolute bottom-28 md:bottom-24 left-8 md:left-12 z-20">
                <Link
                  href={slide.targetUrl}
                  className="bg-electric-indigo/90 hover:bg-electric-indigo text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 inline-flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md active:scale-95"
                >
                  <span>
                    {slide.ctaText}
                    {slide.price && slide.price > 0
                      ? ` • Desde S/ ${slide.price}`
                      : ""}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </div>
            )}
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
              className={`w-2 h-8 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === index
                ? "bg-white w-3 shadow-md"
                : "bg-white/50 hover:bg-white"
                }`}
              onClick={() => scrollToSlide(index)}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}
