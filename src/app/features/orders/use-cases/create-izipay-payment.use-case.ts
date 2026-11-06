import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { CreateIzipayPaymentParams, CreateIzipayPaymentResponse } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class CreateIzipayPaymentUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(params: CreateIzipayPaymentParams): ResultAsync<CreateIzipayPaymentResponse, DomainError> {
    return this.orderRepository.createIzipayPayment(params);
  }
}

