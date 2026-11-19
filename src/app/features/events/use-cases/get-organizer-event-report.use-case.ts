import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { OrganizerEventReportModel } from '../models/organizer-event-report.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetOrganizerEventReportUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  /**
   * Obtiene el reporte detallado de ventas, aforo por zonas, funciones y órdenes recientes
   * de un evento perteneciente al organizador autenticado.
   *
   * @param identifier - UUID público, ID o Slug del evento
   * @returns `ResultAsync` con `OrganizerEventReportModel` o `DomainError`
   */
  execute(identifier: string): ResultAsync<OrganizerEventReportModel, DomainError> {
    return this.eventRepository.getOrganizerEventReport(identifier);
  }
}
