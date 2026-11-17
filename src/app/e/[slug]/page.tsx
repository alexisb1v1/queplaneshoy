import React from "react";
import { Metadata } from "next";
import { LandingPageContainer } from "@/app/features/events/ui/landing/landing-page-container";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ previewTemp?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} | Entradas Oficiales | queplanhoy`,
    description: `Consigue tus entradas oficiales para ${formattedTitle} en queplanhoy. Acceso digital exclusivo y garantizado.`,
  };
}

export default async function EventLandingRoute({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { previewTemp } = await searchParams;
  return <LandingPageContainer slug={slug} previewTemp={previewTemp} />;
}

