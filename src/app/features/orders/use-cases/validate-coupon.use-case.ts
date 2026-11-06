import { ResultAsync } from 'neverthrow';
import { OrderRepository } from '../repositories/order.repository';
import { ValidateCouponParams, ValidateCouponResponseModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export class ValidateCouponUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(params: ValidateCouponParams): ResultAsync<ValidateCouponResponseModel, DomainError> {
    return this.orderRepository.validateCoupon(params);
  }
}

