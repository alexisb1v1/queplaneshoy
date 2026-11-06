import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { UserOrderModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class GetMyOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(): ResultAsync<UserOrderModel[], DomainError> {
    return this.orderRepository.getMyOrders();
  }
}

