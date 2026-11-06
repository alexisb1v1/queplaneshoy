import { EventDto } from '../dto/event.dto';
import { EventModel } from '../models/event.model';

export function eventDtoToModel(dto: EventDto): EventModel {
  return {
    id: dto.id || dto.public_uuid || dto.publicUuid || '',
    publicUuid: dto.publicUuid || dto.public_uuid,
    slug: dto.slug,
    title: dto.title || dto.name || 'Sin título',
    description: dto.description,
    category: dto.category || 'CONCIERTO',
    date: dto.date ? new Date(dto.date) : new Date(),
    location: dto.location || dto.venue || 'Por definir',
    venue: dto.venue || dto.location,
    address: dto.address,
    addressReference: dto.addressReference || dto.address_reference,
    ubigeoCode: dto.ubigeoCode || dto.ubigeo_code,
    coordinates: dto.coordinates,
    googleMapsUrl: dto.googleMapsUrl || dto.google_maps_url,
    ageRestriction: dto.ageRestriction || dto.age_restriction || 'GENERAL',
    userTicketLimit: dto.userTicketLimit ?? dto.user_ticket_limit ?? 4,
    entryRequirements: dto.entryRequirements || dto.entry_requirements,
    openingHoursComment: dto.openingHoursComment || dto.opening_hours_comment,
    termsAndConditionsUrl: dto.termsAndConditionsUrl || dto.terms_and_conditions_url,
    faqs: dto.faqs,
    hasLandingPage: dto.hasLandingPage ?? dto.has_landing_page ?? false,
    landingConfig: dto.landingConfig || dto.landing_config,
    price: Number(dto.price || 0),
    capacity: Number(dto.capacity || 0),
    status: (dto.status || 'draft') as EventModel['status'],
    createdAt: dto.createdAt || dto.created_at ? new Date(dto.createdAt || dto.created_at!) : new Date(),
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : undefined,
  };
}
