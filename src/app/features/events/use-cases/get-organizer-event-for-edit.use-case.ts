import { ResultAsync } from "neverthrow";
import { EventRepository } from "../repositories/event.repository";
import { DomainError } from "../../../common/errors/domain-error";

export class GetOrganizerEventForEditUseCase {
  constructor(private readonly eventRepository: EventRepository) { }

    execute(eventId: string): ResultAsync < Record<string, unknown>, DomainError > {
      return this.eventRepository.getOrganizerEventForEdit(eventId);
    }
  }
