export type OrganizerEventStatus =
  | 'draft'
  | 'in_review'
  | 'observed'
  | 'published'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | string;

export interface OrganizerEventZoneModel {
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

export interface OrganizerDraftChecklistModel {
  hasShows: boolean;
  hasZones: boolean;
  hasBanner: boolean;
  completionPercent: number;
  missingItems: string[];
}

export interface OrganizerEventModel {
  id: string;
  publicUuid: string;
  eventCode: string;
  slug: string;
  name: string;
  category: string;
  status: OrganizerEventStatus;
  observationReason?: string | null;
  isSoldOut: boolean;
  statusLabel: string;
  hasLandingPage: boolean;
  imageUrl: string | null;
  venue: string | null;
  city: string;
  firstShowStartTime: Date | null;
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
  createdAt: Date;
  draftChecklist: OrganizerDraftChecklistModel;
  zones: OrganizerEventZoneModel[];
}

