import { ResultAsync } from "neverthrow";
import { EventRepository } from "../repositories/event.repository";
import { EventSettlementModel } from "../models/event-settlement.model";
import { DomainError } from "../../../common/errors/domain-error";

export class GetEventSettlementUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(identifier: string): ResultAsync<EventSettlementModel, DomainError> {
    return this.eventRepository.getOrganizerEventSettlement(identifier);
  }
}
