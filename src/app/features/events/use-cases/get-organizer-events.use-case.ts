import { ResultAsync } from 'neverthrow';
import { EventRepository, GetOrganizerEventsParams } from '../repositories/event.repository';
import { OrganizerEventModel } from '../models/organizer-event.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetOrganizerEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  /**
   * Obtiene los eventos creados por el usuario organizador autenticado con sus métricas reales.
   *
   * @param params - Filtros opcionales de estado y búsqueda textual
   * @returns `ResultAsync` con la lista de eventos o `DomainError`
   */
  execute(params?: GetOrganizerEventsParams): ResultAsync<OrganizerEventModel[], DomainError> {
    return this.eventRepository.getOrganizerEvents(params);
  }
}

