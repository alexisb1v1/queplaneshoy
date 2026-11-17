import { ResultAsync } from 'neverthrow';
import {
  CancelPendingCulqiOrderModel,
  ConfirmCulqiChargeModel,
  ConfirmCulqiChargeParams,
  CulqiOrderStatusModel,
  OrderModel,
  PrepareCulqiCheckoutModel,
  PrepareCulqiCheckoutParams,
  SimulateCheckoutParams,
  SimulateCheckoutResponseModel,
  UserOrderModel,
  ValidateCouponParams,
  ValidateCouponResponseModel,
} from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export abstract class OrderRepository {
  abstract createDraft(showId: string, zoneId: string, quantity: number): ResultAsync<{ orderToken: string; expiresIn: number }, DomainError>;
  abstract getOrder(orderToken: string): ResultAsync<OrderModel, DomainError>;
  abstract simulateCheckout(params: SimulateCheckoutParams): ResultAsync<SimulateCheckoutResponseModel, DomainError>;
  abstract prepareCulqiCheckout(params: PrepareCulqiCheckoutParams): ResultAsync<PrepareCulqiCheckoutModel, DomainError>;
  abstract confirmCulqiCharge(params: ConfirmCulqiChargeParams): ResultAsync<ConfirmCulqiChargeModel, DomainError>;
  abstract getCulqiOrderStatus(orderPublicUuid: string): ResultAsync<CulqiOrderStatusModel, DomainError>;
  abstract cancelPendingCulqiOrder(orderPublicUuid: string): ResultAsync<CancelPendingCulqiOrderModel, DomainError>;
  abstract getMyOrders(): ResultAsync<UserOrderModel[], DomainError>;
  abstract validateCoupon(params: ValidateCouponParams): ResultAsync<ValidateCouponResponseModel, DomainError>;
}
