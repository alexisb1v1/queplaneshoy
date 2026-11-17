"use client";

import React, { useEffect } from "react";

interface VideoTeaserModalProps {
  isOpen: boolean;
  videoUrl?: string | null;
  onClose: () => void;
}

export function VideoTeaserModal({ isOpen, videoUrl, onClose }: VideoTeaserModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  // Resolver fuente de reproducción: YouTube, Vimeo o archivo MP4/WebM directo
  const resolveVideoSource = (url: string): { kind: "iframe" | "video"; src: string } => {
    const cleanUrl = url.trim();

    if (cleanUrl.includes("youtu.be/")) {
      const videoId = cleanUrl.split("youtu.be/")[1]?.split("?")[0] || "";
      if (videoId) return { kind: "iframe", src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` };
    } else if (cleanUrl.includes("youtube.com/shorts/")) {
      const videoId = cleanUrl.split("youtube.com/shorts/")[1]?.split("?")[0] || "";
      if (videoId) return { kind: "iframe", src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` };
    } else if (cleanUrl.includes("watch?v=")) {
      const videoId = cleanUrl.split("watch?v=")[1]?.split("&")[0] || "";
      if (videoId) return { kind: "iframe", src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` };
    } else if (cleanUrl.includes("youtube.com/embed/")) {
      return { kind: "iframe", src: cleanUrl };
    } else if (cleanUrl.includes("vimeo.com/") && !cleanUrl.includes("player.vimeo.com/")) {
      const match = cleanUrl.match(/vimeo\.com\/(\d+)/);
      if (match?.[1]) {
        return { kind: "iframe", src: `https://player.vimeo.com/video/${match[1]}?autoplay=1` };
      }
    } else if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(cleanUrl)) {
      return { kind: "video", src: cleanUrl };
    }

    return { kind: "iframe", src: cleanUrl };
  };

  const resolvedSource = resolveVideoSource(videoUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar reproductor"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-white hover:text-black text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Reproductor Embebido o Video Directo */}
        {resolvedSource.kind === "video" ? (
          <video
            src={resolvedSource.src}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <iframe
            src={resolvedSource.src}
            title="Teaser Oficial del Evento"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

