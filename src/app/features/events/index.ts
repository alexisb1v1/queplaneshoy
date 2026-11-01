import { EventApiService } from './services/event-api.service';
import { EventRepositoryImpl } from './repositories/event.repository.impl';
import { GetEventsUseCase } from './use-cases/get-events.use-case';
import { CreateEventUseCase } from './use-cases/create-event.use-case';
import { PublishEventUseCase } from './use-cases/publish-event.use-case';
import { SearchEventsUseCase } from './use-cases/search-events.use-case';
import { GetPublishedCitiesUseCase } from './use-cases/get-published-cities.use-case';
import { GetFeaturedEventsUseCase } from './use-cases/get-featured-events.use-case';
import { GetUpcomingEventsUseCase } from './use-cases/get-upcoming-events.use-case';
import { GetWeeklyFeaturedEventsUseCase } from './use-cases/get-weekly-featured-events.use-case';
import { GetWeekendEventsUseCase } from './use-cases/get-weekend-events.use-case';

// Instanciamos el servicio e infraestructura
const eventApiService = new EventApiService();
const eventRepository = new EventRepositoryImpl(eventApiService);

// Exportamos los casos de uso instanciados para ser consumidos en la UI
export const getEventsUseCase = new GetEventsUseCase(eventRepository);
export const createEventUseCase = new CreateEventUseCase(eventRepository);
export const publishEventUseCase = new PublishEventUseCase(eventRepository);
export const searchEventsUseCase = new SearchEventsUseCase(eventRepository);
export const getPublishedCitiesUseCase = new GetPublishedCitiesUseCase(eventRepository);
export const getFeaturedEventsUseCase = new GetFeaturedEventsUseCase(eventRepository);
export const getUpcomingEventsUseCase = new GetUpcomingEventsUseCase(eventRepository);
export const getWeeklyFeaturedEventsUseCase = new GetWeeklyFeaturedEventsUseCase(eventRepository);
export const getWeekendEventsUseCase = new GetWeekendEventsUseCase(eventRepository);

export * from './models/search-event.model';
export * from './models/home-event-card.model';

