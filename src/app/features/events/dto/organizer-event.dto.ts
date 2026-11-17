export interface OrganizerEventZoneDto {
  id: string;
  publicUuid: string;
  name: string;
  title: string | null;
  color: string;
  capacity: number;
  soldCount: number;
  lockedCount: number;
  remainingTickets: number;
  occupancyPercentage: number;
  regularPrice: number;
  activePrice: number;
  activeTierName: string;
  isPresaleActive: boolean;
  statusBadge: string;
  revenue: number;
}

export interface OrganizerDraftChecklistDto {
  hasShows: boolean;
  hasZones: boolean;
  hasBanner: boolean;
  completionPercent: number;
  missingItems: string[];
}

export interface OrganizerEventDto {
  id: string;
  publicUuid: string;
  eventCode: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  observationReason?: string | null;
  isSoldOut: boolean;
  statusLabel: string;
  hasLandingPage: boolean;
  imageUrl: string | null;
  venue: string | null;
  city: string;
  firstShowStartTime: string | null;
  dateFormatted: string;
  showsCount: number;
  capacity: number;
  ticketsSold: number;
  remainingTickets: number;
  occupancyPercentage: number;
  grossRevenue: number;
  couponsDiscountAmount: number;
  netSalesRevenue: number;
  targetRevenue: number;
  settlementStatus: string | null;
  advancesCount: number;
  createdAt: string;
  draftChecklist: OrganizerDraftChecklistDto;
  zones: OrganizerEventZoneDto[];
}

