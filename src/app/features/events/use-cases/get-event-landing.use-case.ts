import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { EventLandingModel } from '../models/event-landing.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetEventLandingUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(slug: string): ResultAsync<EventLandingModel, DomainError> {
    return this.eventRepository.getEventLanding(slug);
  }
}

