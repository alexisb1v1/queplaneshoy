import { EventDto } from '../dto/event.dto';

export class EventApiService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  async fetchEvents(): Promise<EventDto[]> {
    const response = await fetch(`${this.baseUrl}/events`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  }
}
