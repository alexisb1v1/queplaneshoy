import { EventDto, CreateEventParams } from '../dto/event.dto';
import { SearchEventsResponse, PublishedCity, SearchEventItem } from '../models/search-event.model';
import { HomeEventCardItem } from '../models/home-event-card.model';
import { EventLandingModel } from '../models/event-landing.model';
import { EventDetailModel } from '../models/event-detail.model';
import { apiClient } from '../../../common/services/api-client';

export class EventApiService {
  async fetchEvents(): Promise<EventDto[]> {
    return apiClient.get<EventDto[]>('/events');
  }

  async getEventDetail(identifier: string): Promise<EventDetailModel> {
    return apiClient.get<EventDetailModel>(`/events/${identifier}`);
  }

  async getFeaturedEvents(): Promise<SearchEventItem[]> {
    return apiClient.get<SearchEventItem[]>('/events/featured');
  }

  async getUpcomingEvents(): Promise<HomeEventCardItem[]> {
    return apiClient.get<HomeEventCardItem[]>('/events/upcoming');
  }

  async getWeeklyFeaturedEvents(): Promise<HomeEventCardItem[]> {
    return apiClient.get<HomeEventCardItem[]>('/events/weekly-featured');
  }

  async getWeekendEvents(): Promise<HomeEventCardItem[]> {
    return apiClient.get<HomeEventCardItem[]>('/events/weekend');
  }

  async getEventLanding(slug: string): Promise<EventLandingModel> {
    return apiClient.get<EventLandingModel>(`/events/landing/${slug}`);
  }

  async createEvent(params: CreateEventParams): Promise<EventDto> {
    return apiClient.post<EventDto>('/events', params);
  }

  async publishEvent(eventId: string): Promise<EventDto> {
    return apiClient.post<EventDto>(`/events/${eventId}/publish`, {});
  }

  async getPublishedCities(): Promise<PublishedCity[]> {
    return apiClient.get<PublishedCity[]>('/search/cities');
  }

  async searchEvents(params: {
    q?: string;
    category?: string;
    city?: string;
    ubigeoCode?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<SearchEventsResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category && params.category !== 'Todas' && params.category !== 'Todos') {
      query.set('category', params.category.toUpperCase());
    }
    if (params.city && params.city !== 'Todas' && params.city !== 'Todos') {
      query.set('city', params.city);
    }
    if (params.ubigeoCode) query.set('ubigeoCode', params.ubigeoCode);
    if (params.minPrice !== undefined) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set('maxPrice', params.maxPrice.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());
    if (params.status) {
      query.set('status', params.status);
    } else {
      query.set('status', 'published');
    }

    const queryString = query.toString();
    return apiClient.get<SearchEventsResponse>(`/search/events${queryString ? `?${queryString}` : ''}`);
  }
}
