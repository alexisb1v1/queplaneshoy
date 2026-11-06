import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { SimulateCheckoutParams, SimulateCheckoutResponseModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class SimulateCheckoutUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(params: SimulateCheckoutParams): ResultAsync<SimulateCheckoutResponseModel, DomainError> {
    return this.orderRepository.simulateCheckout(params);
  }
}

