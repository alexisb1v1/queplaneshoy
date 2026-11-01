import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { HomeEventCardItem } from '../models/home-event-card.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetWeekendEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(): ResultAsync<HomeEventCardItem[], DomainError> {
    return this.eventRepository.getWeekendEvents();
  }
}

