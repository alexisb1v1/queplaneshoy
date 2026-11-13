export interface LandingTheme {
  primaryColor: string;
  backgroundType: 'color' | 'pattern';
  backgroundColor: string;
  backgroundPatternUrl?: string | null;
}

export interface LandingHeader {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  headerImageUrl?: string | null;
  videoTeaserUrl?: string | null;
}

export interface LandingBody {
  aboutText?: string | null;
  bodyImageUrl?: string | null;
  highlight1?: string | null;
  highlight2?: string | null;
  highlight3?: string | null;
  highlight4?: string | null;
}

export interface LandingFooter {
  footerImageUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}

export interface LandingConfig {
  theme: LandingTheme;
  header: LandingHeader;
  body: LandingBody;
  footer: LandingFooter;
}

export interface LandingShow {
  id: string;
  publicUuid: string;
  name: string | null;
  startTime: string;
  durationHours: number;
}

export interface LandingZone {
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
}

export interface EventLandingModel {
  id: string;
  publicUuid: string;
  slug: string;
  name: string;
  category: string;
  venue: string | null;
  address: string | null;
  city: string;
  hasLandingPage: boolean;
  bannerUrl: string | null;
  termsAndConditionsUrl: string | null;
  ageRestriction: string;
  landingConfig: LandingConfig;
  shows: LandingShow[];
  zones: LandingZone[];
}

