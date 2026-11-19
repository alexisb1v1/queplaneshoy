import { ResultAsync } from 'neverthrow';
import { EventRepository } from '../repositories/event.repository';
import { EventSettlementModel } from '../models/event-settlement.model';
import { RequestEventSettlementParams } from '../dto/event-settlement.dto';
import { DomainError } from '../../../common/errors/domain-error';

export class RequestEventSettlementUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(
    identifier: string,
    data: RequestEventSettlementParams,
  ): ResultAsync<EventSettlementModel, DomainError> {
    return this.eventRepository.requestOrganizerEventSettlement(identifier, data);
  }
}
