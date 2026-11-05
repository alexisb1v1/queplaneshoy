import { OrderRepositoryImpl } from './repositories/order.repository.impl';
import { CreateDraftOrderUseCase } from './use-cases/create-draft-order.use-case';
import { GetOrderUseCase } from './use-cases/get-order.use-case';
import { SimulateCheckoutUseCase } from './use-cases/simulate-checkout.use-case';
import { GetMyOrdersUseCase } from './use-cases/get-my-orders.use-case';
import { ValidateCouponUseCase } from './use-cases/validate-coupon.use-case';
import { CreateIzipayPaymentUseCase } from './use-cases/create-izipay-payment.use-case';

// Instanciamos infraestructura
const orderRepository = new OrderRepositoryImpl();

// Exportamos los casos de uso para consumo de la UI
export const createDraftOrderUseCase = new CreateDraftOrderUseCase(orderRepository);
export const getOrderUseCase = new GetOrderUseCase(orderRepository);
export const simulateCheckoutUseCase = new SimulateCheckoutUseCase(orderRepository);
export const getMyOrdersUseCase = new GetMyOrdersUseCase(orderRepository);
export const validateCouponUseCase = new ValidateCouponUseCase(orderRepository);
export const createIzipayPaymentUseCase = new CreateIzipayPaymentUseCase(orderRepository);

export * from './models/order.model';
