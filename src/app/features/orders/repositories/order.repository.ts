import { ResultAsync } from 'neverthrow';
import {
  OrderModel,
  SimulateCheckoutParams,
  SimulateCheckoutResponseModel,
  UserOrderModel,
  ValidateCouponParams,
  ValidateCouponResponseModel,
  CreateIzipayPaymentParams,
  CreateIzipayPaymentResponse,
} from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export abstract class OrderRepository {
  abstract createDraft(showId: string, zoneId: string, quantity: number): ResultAsync<{ orderToken: string; expiresIn: number }, DomainError>;
  abstract getOrder(orderToken: string): ResultAsync<OrderModel, DomainError>;
  abstract simulateCheckout(params: SimulateCheckoutParams): ResultAsync<SimulateCheckoutResponseModel, DomainError>;
  abstract getMyOrders(): ResultAsync<UserOrderModel[], DomainError>;
  abstract validateCoupon(params: ValidateCouponParams): ResultAsync<ValidateCouponResponseModel, DomainError>;
  abstract createIzipayPayment(params: CreateIzipayPaymentParams): ResultAsync<CreateIzipayPaymentResponse, DomainError>;
}
