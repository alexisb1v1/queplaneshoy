import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { PrepareCulqiCheckoutModel, PrepareCulqiCheckoutParams } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class PrepareCulqiCheckoutUseCase {
  constructor(private readonly repository: OrderRepository) {}

  /**
   * Reserva temporalmente el inventario en el servidor y crea la sesión de orden en Culqi.
   *
   * @param params - Evento, función, localidades, método preferido y cupón opcional
   * @returns Resultado con los datos públicos y `culqiOrderId` para abrir Culqi Checkout v4
   */
  execute(params: PrepareCulqiCheckoutParams): ResultAsync<PrepareCulqiCheckoutModel, DomainError> {
    return this.repository.prepareCulqiCheckout(params);
  }
}

