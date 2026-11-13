import { EventApiService } from './services/event-api.service';
import { EventRepositoryImpl } from './repositories/event.repository.impl';
import { GetEventsUseCase } from './use-cases/get-events.use-case';
import { CreateEventUseCase } from './use-cases/create-event.use-case';
import { UpdateEventUseCase } from './use-cases/update-event.use-case';
import { GetOrganizerEventForEditUseCase } from './use-cases/get-organizer-event-for-edit.use-case';
import { PublishEventUseCase } from './use-cases/publish-event.use-case';
import { SearchEventsUseCase } from './use-cases/search-events.use-case';
import { GetPublishedCitiesUseCase } from './use-cases/get-published-cities.use-case';
import { GetFeaturedEventsUseCase } from './use-cases/get-featured-events.use-case';
import { GetUpcomingEventsUseCase } from './use-cases/get-upcoming-events.use-case';
import { GetWeeklyFeaturedEventsUseCase } from './use-cases/get-weekly-featured-events.use-case';
import { GetWeekendEventsUseCase } from './use-cases/get-weekend-events.use-case';
import { GetEventLandingUseCase } from './use-cases/get-event-landing.use-case';
import { GetEventDetailUseCase } from './use-cases/get-event-detail.use-case';
import { GetOrganizerEventsUseCase } from './use-cases/get-organizer-events.use-case';

// Instanciamos el servicio e infraestructura
const eventApiService = new EventApiService();
const eventRepository = new EventRepositoryImpl(eventApiService);

// Exportamos los casos de uso instanciados para ser consumidos en la UI
export const getEventsUseCase = new GetEventsUseCase(eventRepository);
export const getOrganizerEventsUseCase = new GetOrganizerEventsUseCase(eventRepository);
export const createEventUseCase = new CreateEventUseCase(eventRepository);
export const updateEventUseCase = new UpdateEventUseCase(eventRepository);
export const getOrganizerEventForEditUseCase = new GetOrganizerEventForEditUseCase(eventRepository);
export const publishEventUseCase = new PublishEventUseCase(eventRepository);
export const searchEventsUseCase = new SearchEventsUseCase(eventRepository);
export const getPublishedCitiesUseCase = new GetPublishedCitiesUseCase(eventRepository);
export const getFeaturedEventsUseCase = new GetFeaturedEventsUseCase(eventRepository);
export const getUpcomingEventsUseCase = new GetUpcomingEventsUseCase(eventRepository);
export const getWeeklyFeaturedEventsUseCase = new GetWeeklyFeaturedEventsUseCase(eventRepository);
export const getWeekendEventsUseCase = new GetWeekendEventsUseCase(eventRepository);
export const getEventLandingUseCase = new GetEventLandingUseCase(eventRepository);
export const getEventDetailUseCase = new GetEventDetailUseCase(eventRepository);

export * from './models/search-event.model';
export * from './models/home-event-card.model';
export * from './models/event-landing.model';
export * from './models/event-detail.model';
export * from './models/organizer-event.model';

