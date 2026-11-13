import { ResultAsync } from 'neverthrow';
import { EventModel } from '../models/event.model';
import { OrganizerEventModel } from '../models/organizer-event.model';
import { CreateEventParams } from '../dto/event.dto';
import { SearchEventsResponse, PublishedCity, SearchEventItem } from '../models/search-event.model';
import { HomeEventCardItem } from '../models/home-event-card.model';
import { EventLandingModel } from '../models/event-landing.model';
import { EventDetailModel } from '../models/event-detail.model';
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

export interface GetOrganizerEventsParams {
  status?: string;
  q?: string;
}

export abstract class EventRepository {
  abstract getEvents(): ResultAsync<EventModel[], DomainError>;
  abstract getOrganizerEvents(params?: GetOrganizerEventsParams): ResultAsync<OrganizerEventModel[], DomainError>;
  abstract createEvent(params: CreateEventParams): ResultAsync<EventModel, DomainError>;
  abstract updateEvent(eventId: string, params: CreateEventParams): ResultAsync<EventModel, DomainError>;
  abstract getOrganizerEventForEdit(eventId: string): ResultAsync<any, DomainError>;
  abstract publishEvent(eventId: string): ResultAsync<EventModel, DomainError>;
  abstract searchEvents(params: SearchEventsParams): ResultAsync<SearchEventsResponse, DomainError>;
  abstract getPublishedCities(): ResultAsync<PublishedCity[], DomainError>;
  abstract getFeaturedEvents(): ResultAsync<SearchEventItem[], DomainError>;
  abstract getUpcomingEvents(): ResultAsync<HomeEventCardItem[], DomainError>;
  abstract getWeeklyFeaturedEvents(): ResultAsync<HomeEventCardItem[], DomainError>;
  abstract getWeekendEvents(): ResultAsync<HomeEventCardItem[], DomainError>;
  abstract getEventLanding(slug: string): ResultAsync<EventLandingModel, DomainError>;
  abstract getEventDetail(identifier: string): ResultAsync<EventDetailModel, DomainError>;
}
