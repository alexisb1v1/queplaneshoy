import { ResultAsync } from 'neverthrow';
import { OrderRepository } from './order.repository';
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
import { apiClient } from '../../../common/services/api-client';

export class OrderRepositoryImpl implements OrderRepository {
  createDraft(
    showId: string,
    zoneId: string,
    quantity: number,
  ): ResultAsync<{ orderToken: string; expiresIn: number }, DomainError> {
    return apiClient
      .requestResult<{ order_token: string; expires_in: number }>(
        apiClient.post<{ order_token: string; expires_in: number }>('/orders/draft', {
          show_id: showId,
          zone_id: zoneId,
          quantity: quantity,
        }),
      )
      .map((res) => ({
        orderToken: res.order_token,
        expiresIn: res.expires_in,
      }));
  }

  getOrder(orderToken: string): ResultAsync<OrderModel, DomainError> {
    return apiClient
      .requestResult<{
        public_uuid: string;
        expires_in: number;
        expires_at: string;
        event_name: string;
        event_location: string;
        event_date: string;
        zone_name: string;
        quantity: number;
        total_amount: number;
        status: string;
      }>(apiClient.get(`/orders/${orderToken}`))
      .map((res) => ({
        orderToken: res.public_uuid,
        expiresIn: res.expires_in,
        expiresAt: res.expires_at,
        eventName: res.event_name,
        eventLocation: res.event_location,
        eventDate: res.event_date,
        zoneName: res.zone_name,
        quantity: res.quantity,
        totalAmount: Number(res.total_amount),
        status: res.status,
      }));
  }

  simulateCheckout(
    params: SimulateCheckoutParams,
  ): ResultAsync<SimulateCheckoutResponseModel, DomainError> {
    return apiClient.requestResult<SimulateCheckoutResponseModel>(
      apiClient.post<SimulateCheckoutResponseModel>('/orders/simulate-checkout', params),
    );
  }

  getMyOrders(): ResultAsync<UserOrderModel[], DomainError> {
    return apiClient.requestResult<UserOrderModel[]>(
      apiClient.get<UserOrderModel[]>('/orders/my-orders'),
    );
  }

  validateCoupon(
    params: ValidateCouponParams,
  ): ResultAsync<ValidateCouponResponseModel, DomainError> {
    return apiClient.requestResult<ValidateCouponResponseModel>(
      apiClient.post<ValidateCouponResponseModel>('/orders/validate-coupon', params),
    );
  }

  createIzipayPayment(
    params: CreateIzipayPaymentParams,
  ): ResultAsync<CreateIzipayPaymentResponse, DomainError> {
    return apiClient.requestResult<CreateIzipayPaymentResponse>(
      apiClient.post<CreateIzipayPaymentResponse>('/orders/izipay/create-payment', params),
    );
  }
}
