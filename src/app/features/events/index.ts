import { EventApiService } from './services/event-api.service';
import { EventRepositoryImpl } from './repositories/event.repository.impl';
import { GetEventsUseCase } from './use-cases/get-events.use-case';

// Instanciamos el servicio e infraestructura
const eventApiService = new EventApiService();
const eventRepository = new EventRepositoryImpl(eventApiService);

// Exportamos los casos de uso instanciados para ser consumidos en la UI
export const getEventsUseCase = new GetEventsUseCase(eventRepository);
