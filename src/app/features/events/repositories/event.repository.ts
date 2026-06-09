import { ResultAsync } from 'neverthrow';
import { EventModel } from '../models/event.model';
import { DomainError } from '../../../common/errors/domain-error';

export abstract class EventRepository {
  abstract getEvents(): ResultAsync<EventModel[], DomainError>;
}
