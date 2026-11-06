import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { SearchEventItem } from '../models/search-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetFeaturedEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(): ResultAsync<SearchEventItem[], DomainError> {
    return this.eventRepository.getFeaturedEvents();
  }
}

