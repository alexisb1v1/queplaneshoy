import { EventDto } from '../dto/event.dto';
import { EventModel } from '../models/event.model';

export function eventDtoToModel(dto: EventDto): EventModel {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    date: new Date(dto.date),
    location: dto.location,
    price: Number(dto.price),
    capacity: dto.capacity,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
