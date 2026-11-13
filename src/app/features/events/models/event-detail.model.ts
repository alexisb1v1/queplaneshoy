export interface EventShowModel {
  id: string;
  publicUuid: string;
  name: string | null;
  startTime: string;
  durationHours: number;
}

export interface EventZoneModel {
  id: string;
  publicUuid: string;
  name: string;
  title: string | null;
  color: string;
  benefits: string | null;
  regularPrice: number;
  currentPrice: number;
  serviceFee?: number;
  feeIncluded?: boolean;
  activeTierName: string;
  capacity: number;
  remainingTickets: number;
  isSoldOut: boolean;
  maxTicketsPerOrder?: number;
}

export interface EventDetailModel {
  id: string;
  publicUuid: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  venue: string | null;
  address: string | null;
  city: string;
  hasLandingPage: boolean;
  bannerUrl: string | null;
  zoneMapUrl: string | null;
  termsAndConditionsUrl: string | null;
  ageRestriction: string;
  userTicketLimit: number;
  openingHoursComment: string | null;
  entryRequirements: string | null;
  googleMapsUrl: string | null;
  coordinates: string | null;
  addressReference: string | null;
  promoVideoUrl?: string | null;
  socialLinks?: {
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    tiktokUrl?: string | null;
  } | null;
  shows: EventShowModel[];
  zones: EventZoneModel[];
}

