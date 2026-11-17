import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { CulqiOrderStatusModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetCulqiOrderStatusUseCase {
  constructor(private readonly repository: OrderRepository) {}

  /**
   * Consulta el estado en vivo de una orden asíncrona (QR Billeteras, PagoEfectivo CIP, Cuotéalo BCP).
   *
   * @param orderPublicUuid - UUID público de la orden reservada
   * @returns Estado actual de la orden y los boletos emitidos cuando ya fue liquidada
   */
  execute(orderPublicUuid: string): ResultAsync<CulqiOrderStatusModel, DomainError> {
    return this.repository.getCulqiOrderStatus(orderPublicUuid);
  }
}

