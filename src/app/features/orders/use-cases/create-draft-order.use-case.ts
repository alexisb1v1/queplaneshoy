import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { DomainError } from '../../../common/errors/domain-error';

export class CreateDraftOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(showId: string, zoneId: string, quantity: number): ResultAsync<{ orderToken: string; expiresIn: number }, DomainError> {
    if (!showId || !zoneId || quantity <= 0) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Invalid parameters')),
        () => new DomainError('Parámetros de compra inválidos', 'VALIDATION_ERROR')
      );
    }
    return this.orderRepository.createDraft(showId, zoneId, quantity);
  }
}
