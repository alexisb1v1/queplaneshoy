import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { ConfirmCulqiChargeModel, ConfirmCulqiChargeParams } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class ConfirmCulqiChargeUseCase {
  constructor(private readonly repository: OrderRepository) {}

  /**
   * Confirma en el backend el cobro de un token generado por Culqi Checkout v4 (incluye flujo 3DS).
   *
   * @param params - `orderPublicUuid`, `tokenId`, huella de dispositivo y parámetros 3DS si aplican
   * @returns Confirmación de orden pagada con boletos emitidos o requerimiento de autenticación 3DS
   */
  execute(params: ConfirmCulqiChargeParams): ResultAsync<ConfirmCulqiChargeModel, DomainError> {
    return this.repository.confirmCulqiCharge(params);
  }
}

