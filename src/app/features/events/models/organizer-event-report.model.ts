export interface OrganizerEventReportEvent {
  id: string;
  publicUuid: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  statusLabel: string;
  eventCode: string;
  venue: string | null;
  address: string | null;
  city: string;
  imageUrl: string | null;
  hasLandingPage: boolean;
  feeChargedTo: "promoter" | "buyer" | "mixed";
  createdAt: string;
  settlementStatus: string | null;
  settlementStatusLabel: string | null;
  settlementAmount: number | null;
  settlementBankName: string | null;
  settlementRequestedAt: string | null;
}

export interface OrganizerEventReportSummary {
  totalCapacity: number;
  ticketsSold: number;
  ticketsUsed: number;
  ticketsRemaining: number;
  occupancyPercentage: number;
  checkInPercentage: number;
  grossRevenue: number;
  totalServiceFee: number;
  couponsDiscountAmount: number;
  netSalesRevenue: number;
  averageTicketPrice: number;
  targetRevenue: number;
  targetRevenuePercentage: number;
  totalOrdersCount: number;
}

export interface OrganizerEventReportTier {
  tierNumber: number;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  endAt: string | null;
  isActive: boolean;
  statusBadge: string;
}

export interface OrganizerEventReportZone {
  id: string;
  publicUuid: string;
  name: string;
  color: string;
  capacity: number;
  soldCount: number;
  usedCount: number;
  remainingTickets: number;
  occupancyPercentage: number;
  regularPrice: number;
  activePrice: number;
  activeTierName: string;
  isPresaleActive: boolean;
  revenue: number;
  feeIncluded: boolean;
  serviceFee: number;
  tiers: OrganizerEventReportTier[];
}

export interface OrganizerEventReportShow {
  id: string;
  publicUuid: string;
  name: string;
  startTime: string;
  dateFormatted: string;
  salesEndAt: string | null;
  durationHours: number;
  status: string;
  ticketsSold: number;
  ticketsUsed: number;
}

export interface OrganizerEventReportRecentOrder {
  id: string;
  publicUuid: string;
  orderCode: string;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  ticketsCount: number;
  zonesSummary: string;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  totalAmount: number;
  paymentMethod: string;
  status: string;
}

export interface OrganizerEventReportDailyZoneSales {
  zoneId: string;
  zoneName: string;
  color: string;
  ticketsSold: number;
  revenue: number;
}

export interface OrganizerEventReportDailySales {
  date: string;
  ticketsSold: number;
  revenue: number;
  zones: OrganizerEventReportDailyZoneSales[];
}

export interface OrganizerEventReportTrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface OrganizerEventReportFunnelStep {
  step: string;
  count: number;
  percentage: number;
  dropOffPercentage: number;
}

export interface OrganizerEventReportFunnel {
  pageviews: number;
  uniqueVisitors: number;
  checkoutInitiated: number;
  ordersPaid: number;
  conversionRate: number;
  steps: OrganizerEventReportFunnelStep[];
  trafficSources: OrganizerEventReportTrafficSource[];
}

export interface OrganizerEventReportModel {
  event: OrganizerEventReportEvent;
  summary: OrganizerEventReportSummary;
  zones: OrganizerEventReportZone[];
  shows: OrganizerEventReportShow[];
  recentOrders: OrganizerEventReportRecentOrder[];
  dailySales: OrganizerEventReportDailySales[];
  funnel?: OrganizerEventReportFunnel | null;
}
