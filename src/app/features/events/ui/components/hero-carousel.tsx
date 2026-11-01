"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getFeaturedEventsUseCase, SearchEventItem } from "../../index";
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

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: "neon-pulse",
    category: "Conciertos",
    title: "Neon Pulse Festival 2026",
    description: "Vive la experiencia musical definitiva con los mejores artistas internacionales en un escenario de vanguardia.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArvALp2f189WFx8f0LzakoBfIG4x9xtX2yELKpqcah5IKtC9OOLdg2NVNBIY7UylA0XMle6rcaUuQoYPDX5n9-7T3KVVVfFJSoFdXXLW-84Z0SLk2p4Uk9EifxKNnMDBjEbe0GIIFzIz8rfZTmDjsTSnmkJ0QcwZCjXLpreh3wkKONf6U5GkqUziZUKXWLad8FOMPZZOwoIJmc4obi9caQKG25SJin0IlLKoXwSjyNQh_QLw76dbziUfyj9bLGLWiVceQMh_G3VjkI",
    altText: "Festival de musica Neon Pulse",
    ctaText: "Comprar Entradas",
    targetUrl: "/events",
  },
  {
    id: "pro-league",
    category: "Deportes",
    title: "Finales de Verano: Pro League",
    description: "La culminación de la temporada en un encuentro histórico que no te puedes perder. Asegura tu lugar en la historia.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZRf5b2CiwcTa73hpU1YS2bQJeb8P8J77zLnPoakMwOAt7V-XEt1kILsDA1VnrdUUjullHbqTMl4AtQPvnTDxq-GMdQTmJWtAfek1mG6X9oLiBgvHw1j2k0YGo90mUZwn5jvkJEmfhgNRF6QQ5PRQzVehB5FbjTQs3FEn2rLMx4c7ug1qp6bb2Vq3TuVU-4LStN-tEWhVRnxjU1fK8_KN1e_lwxypSsBY8h_jAfWG36bugpW3gDSO2icAmnrzgVyugH5W4q8j7Cl0C",
    altText: "Estadio deportivo",
    ctaText: "Ver Detalles",
    targetUrl: "/events",
  },
  {
    id: "renacer-drama",
    category: "Teatro",
    title: "El Renacer del Drama",
    description: "Una producción galardonada que redefine los límites de la interpretación clásica en el Gran Teatro Nacional.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7E0UFjzRDXfBB--rYurc0cGOw0-4yYkeLqvtDdHYkOcCZahMLGDuv2UAW-bxdIc8_xenxf44YA9WJFeQ-kryVlX0JFEfT7uPOwV764-9zvhRqXbMqIIQKmsD6nWmN43ejHwrf3j4qZ8SNIpjpMGoqePCdQWnLFfJRfBe_uCm8WYCqPraQ0NP5Zrdu4XT8HQJQ2QL0opuHJHZzFOBQp52NINZmj3z4k0ViWXAz3J6OcllZRuQzCy-QvWhvf6nwNPIkCKdKhW0fJPkT",
    altText: "Interior de teatro historico",
    ctaText: "Reservar Ahora",
    targetUrl: "/events",
  },
];

export function HeroCarousel() {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar eventos estelares / destacados para el Hero Carousel
  useEffect(() => {
    let isMounted = true;
    getFeaturedEventsUseCase.execute().then((res) => {
      res.match(
        (featured) => {
          if (isMounted && featured && featured.length > 0) {
            const mappedSlides: SlideItem[] = featured.map((item, idx) => {
              const categoryInfo = getCategoryById(item.category);
              const targetUrl =
                item.hasLandingPage && item.slug ? `/e/${item.slug}` : `/events/${item.id}`;
              const fallbackImage = DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].imageUrl;

              return {
                id: item.id,
                category: categoryInfo.label,
                title: item.title,
                description:
                  item.description ||
                  "Asegura tus entradas oficiales para este gran evento antes de que se agoten.",
                imageUrl: item.bannerUrl || fallbackImage,
                altText: item.title,
                ctaText: item.hasLandingPage ? "Ver Experiencia" : "Comprar Entradas",
                targetUrl,
              };
            });
            setSlides(mappedSlides);
          }
        },
        () => {}
      );
    });

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
