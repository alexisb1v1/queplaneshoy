import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { EventDetailModel } from '../models/event-detail.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetEventDetailUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(identifier: string): ResultAsync<EventDetailModel, DomainError> {
    return this.eventRepository.getEventDetail(identifier);
  }
}

