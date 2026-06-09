export interface EventDto {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  created_at: string;
  updated_at: string;
}
