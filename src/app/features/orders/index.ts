import { OrderRepositoryImpl } from './repositories/order.repository.impl';
import { CreateDraftOrderUseCase } from './use-cases/create-draft-order.use-case';
import { GetOrderUseCase } from './use-cases/get-order.use-case';
import { SimulateCheckoutUseCase } from './use-cases/simulate-checkout.use-case';
import { PrepareCulqiCheckoutUseCase } from './use-cases/prepare-culqi-checkout.use-case';
import { ConfirmCulqiChargeUseCase } from './use-cases/confirm-culqi-charge.use-case';
import { GetCulqiOrderStatusUseCase } from './use-cases/get-culqi-order-status.use-case';
import { CancelPendingCulqiOrderUseCase } from './use-cases/cancel-pending-culqi-order.use-case';
import { GetMyOrdersUseCase } from './use-cases/get-my-orders.use-case';
import { ValidateCouponUseCase } from './use-cases/validate-coupon.use-case';

// Instanciamos infraestructura
const orderRepository = new OrderRepositoryImpl();

// Exportamos los casos de uso para consumo de la UI
export const createDraftOrderUseCase = new CreateDraftOrderUseCase(orderRepository);
export const getOrderUseCase = new GetOrderUseCase(orderRepository);
export const simulateCheckoutUseCase = new SimulateCheckoutUseCase(orderRepository);
export const prepareCulqiCheckoutUseCase = new PrepareCulqiCheckoutUseCase(orderRepository);
export const confirmCulqiChargeUseCase = new ConfirmCulqiChargeUseCase(orderRepository);
export const getCulqiOrderStatusUseCase = new GetCulqiOrderStatusUseCase(orderRepository);
export const cancelPendingCulqiOrderUseCase = new CancelPendingCulqiOrderUseCase(orderRepository);
export const getMyOrdersUseCase = new GetMyOrdersUseCase(orderRepository);
export const validateCouponUseCase = new ValidateCouponUseCase(orderRepository);

export * from './models/order.model';
