import { ResultAsync } from 'neverthrow';
import { EventRepository, SearchEventsParams } from '../repositories/event.repository';
import { SearchEventsResponse } from '../models/search-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class SearchEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(params: SearchEventsParams): ResultAsync<SearchEventsResponse, DomainError> {
    return this.eventRepository.searchEvents(params);
  }
}

