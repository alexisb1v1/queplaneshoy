import { ResultAsync } from 'neverthrow';
import { EventModel } from '../models/event.model';
import { CreateEventParams } from '../dto/event.dto';
import { SearchEventsResponse, PublishedCity, SearchEventItem } from '../models/search-event.model';
import { HomeEventCardItem } from '../models/home-event-card.model';
import { DomainError } from '../../../common/errors/domain-error';

export interface SearchEventsParams {
  q?: string;
  category?: string;
  city?: string;
  ubigeoCode?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  status?: string;
}

export abstract class EventRepository {
  abstract getEvents(): ResultAsync<EventModel[], DomainError>;
  abstract createEvent(params: CreateEventParams): ResultAsync<EventModel, DomainError>;
  abstract publishEvent(eventId: string): ResultAsync<EventModel, DomainError>;
  abstract searchEvents(params: SearchEventsParams): ResultAsync<SearchEventsResponse, DomainError>;
  abstract getPublishedCities(): ResultAsync<PublishedCity[], DomainError>;
  abstract getFeaturedEvents(): ResultAsync<SearchEventItem[], DomainError>;
  abstract getUpcomingEvents(): ResultAsync<HomeEventCardItem[], DomainError>;
  abstract getWeeklyFeaturedEvents(): ResultAsync<HomeEventCardItem[], DomainError>;
  abstract getWeekendEvents(): ResultAsync<HomeEventCardItem[], DomainError>;
}
