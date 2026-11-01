import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { PublishedCity } from '../models/search-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetPublishedCitiesUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(): ResultAsync<PublishedCity[], DomainError> {
    return this.eventRepository.getPublishedCities();
  }
}

