import { ResultAsync } from 'neverthrow';
import { EventRepository, SearchEventsParams } from './event.repository';
import { EventModel } from '../models/event.model';
import { CreateEventParams, EventDto } from '../dto/event.dto';
import { SearchEventsResponse, PublishedCity, SearchEventItem } from '../models/search-event.model';
import { HomeEventCardItem } from '../models/home-event-card.model';
import { EventLandingModel } from '../models/event-landing.model';
import { EventDetailModel } from '../models/event-detail.model';
import { DomainError } from '../../../common/errors/domain-error';
import { EventApiService } from '../services/event-api.service';
import { eventDtoToModel } from '../mappers/event.mapper';
import { apiClient } from '../../../common/services/api-client';

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly api: EventApiService) {}

  getEvents(): ResultAsync<EventModel[], DomainError> {
    return apiClient
      .requestResult<EventDto[]>(this.api.fetchEvents())
      .map((dtos) => dtos.map(eventDtoToModel));
  }

  createEvent(params: CreateEventParams): ResultAsync<EventModel, DomainError> {
    return apiClient
      .requestResult<EventDto>(this.api.createEvent(params))
      .map(eventDtoToModel);
  }

  publishEvent(eventId: string): ResultAsync<EventModel, DomainError> {
    return apiClient
      .requestResult<EventDto>(this.api.publishEvent(eventId))
      .map(eventDtoToModel);
  }

  searchEvents(params: SearchEventsParams): ResultAsync<SearchEventsResponse, DomainError> {
    return apiClient.requestResult<SearchEventsResponse>(this.api.searchEvents(params));
  }

  getPublishedCities(): ResultAsync<PublishedCity[], DomainError> {
    return apiClient.requestResult<PublishedCity[]>(this.api.getPublishedCities());
  }

  getFeaturedEvents(): ResultAsync<SearchEventItem[], DomainError> {
    return apiClient.requestResult<SearchEventItem[]>(this.api.getFeaturedEvents());
  }

  getUpcomingEvents(): ResultAsync<HomeEventCardItem[], DomainError> {
    return apiClient.requestResult<HomeEventCardItem[]>(this.api.getUpcomingEvents());
  }

  getWeeklyFeaturedEvents(): ResultAsync<HomeEventCardItem[], DomainError> {
    return apiClient.requestResult<HomeEventCardItem[]>(this.api.getWeeklyFeaturedEvents());
  }

  getWeekendEvents(): ResultAsync<HomeEventCardItem[], DomainError> {
    return apiClient.requestResult<HomeEventCardItem[]>(this.api.getWeekendEvents());
  }

  getEventLanding(slug: string): ResultAsync<EventLandingModel, DomainError> {
    return apiClient.requestResult<EventLandingModel>(this.api.getEventLanding(slug));
  }

  getEventDetail(identifier: string): ResultAsync<EventDetailModel, DomainError> {
    return apiClient.requestResult<EventDetailModel>(this.api.getEventDetail(identifier));
  }
}
