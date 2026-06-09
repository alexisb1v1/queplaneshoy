import { ResultAsync } from 'neverthrow';
import { EventRepository } from './event.repository';
import { EventModel } from '../models/event.model';
import { DomainError } from '../../../common/errors/domain-error';
import { EventApiService } from '../services/event-api.service';
import { eventDtoToModel } from '../mappers/event.mapper';

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly api: EventApiService) {}

  getEvents(): ResultAsync<EventModel[], DomainError> {
    return ResultAsync.fromPromise(
      this.api.fetchEvents(),
      (error) => new DomainError('Fallo al conectar con el servidor', 'NETWORK_ERROR', error)
    ).map(dtos => dtos.map(eventDtoToModel));
  }
}
