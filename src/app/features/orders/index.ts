import { OrderRepositoryImpl } from './repositories/order.repository.impl';
import { CreateDraftOrderUseCase } from './use-cases/create-draft-order.use-case';
import { GetOrderUseCase } from './use-cases/get-order.use-case';

// Instanciamos infraestructura
const orderRepository = new OrderRepositoryImpl();

// Exportamos los casos de uso para consumo de la UI
export const createDraftOrderUseCase = new CreateDraftOrderUseCase(orderRepository);
export const getOrderUseCase = new GetOrderUseCase(orderRepository);
