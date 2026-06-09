import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { EventModel } from '../models/event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(): ResultAsync<EventModel[], DomainError> {
    return this.eventRepository.getEvents();
  }
}
