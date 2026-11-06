export interface SearchEventItem {
  id: string;
  publicUuid: string;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  tags?: string[];
  venue?: string | null;
  ubigeoCode?: string | null;
  city?: string | null;
  departmentCode?: string | null;
  minPrice: number;
  date?: string | null;
  bannerUrl?: string | null;
  hasLandingPage: boolean;
  isFeatured?: boolean;
}

export interface SearchEventsResponse {
  hits: SearchEventItem[];
  totalHits: number;
  processingTimeMs: number;
  query: string;
  limit: number;
  offset: number;
}

export interface PublishedCity {
  id: string;
  name: string;
  departmentCode: string;
  eventCount: number;
}


