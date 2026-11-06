import React from "react";
import { Metadata } from "next";
import { LandingPageContainer } from "@/app/features/events/ui/landing/landing-page-container";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} | Entradas Oficiales | queplaneshoy`,
    description: `Consigue tus entradas oficiales para ${formattedTitle} en queplaneshoy. Acceso digital exclusivo y garantizado.`,
  };
}

export default async function EventLandingRoute({ params }: PageProps) {
  const { slug } = await params;
  return <LandingPageContainer slug={slug} />;
}

