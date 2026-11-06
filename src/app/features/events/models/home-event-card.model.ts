export interface UrgencyBadge {
  text: string;
  type: 'critical' | 'high_demand' | 'warning' | 'info';
  icon: string;
}

export interface HomeEventCardItem {
  id: string;
  publicUuid: string;
  slug: string;
  hasLandingPage: boolean;
  title: string;
  category: string;
  imageUrl: string | null;
  date: string | null;
  city: string;
  venue: string | null;
  description: string | null;
  minPrice: number;
  ticketType: string;
  ticketBadgeStyle: 'general' | 'vip' | 'platinum' | 'error';
  urgencyBadge: UrgencyBadge;
}

