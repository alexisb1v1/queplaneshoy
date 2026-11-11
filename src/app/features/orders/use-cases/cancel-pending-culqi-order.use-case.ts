import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { CancelPendingCulqiOrderModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class CancelPendingCulqiOrderUseCase {
  constructor(private readonly repository: OrderRepository) {}

  /**
   * Libera el inventario reservado de una orden pendiente si el usuario cierra Culqi sin pagar.
   *
   * @param orderPublicUuid - UUID público de la orden pendiente
   * @returns Resultado indicando si la reserva fue liberada
   */
  execute(orderPublicUuid: string): ResultAsync<CancelPendingCulqiOrderModel, DomainError> {
    return this.repository.cancelPendingCulqiOrder(orderPublicUuid);
  }
}

