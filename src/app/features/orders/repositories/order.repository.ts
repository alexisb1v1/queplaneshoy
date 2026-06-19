import { ResultAsync } from 'neverthrow';
import { OrderModel } from '../models/order.model';
import { DomainError } from '../../../common/errors/domain-error';

export abstract class OrderRepository {
  abstract createDraft(showId: string, zoneId: string, quantity: number): ResultAsync<{ orderToken: string; expiresIn: number }, DomainError>;
  abstract getOrder(orderToken: string): ResultAsync<OrderModel, DomainError>;
}
