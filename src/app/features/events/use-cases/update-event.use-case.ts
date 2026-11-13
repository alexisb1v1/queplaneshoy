import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { EventModel } from '../models/event.model';
import { CreateEventParams } from '../dto/event.dto';
import { DomainError } from '../../../common/errors/domain-error';

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(eventId: string, params: CreateEventParams): ResultAsync<EventModel, DomainError> {
    return this.eventRepository.updateEvent(eventId, params);
  }
}

