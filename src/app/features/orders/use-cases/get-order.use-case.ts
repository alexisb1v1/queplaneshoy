import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { OrderModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(orderToken: string): ResultAsync<OrderModel, DomainError> {
    if (!orderToken) {
      return ResultAsync.fromPromise(
        Promise.reject(new Error('Order token is required')),
        () => new DomainError('El token de la orden es requerido', 'VALIDATION_ERROR')
      );
    }
    return this.orderRepository.getOrder(orderToken);
  }
}
